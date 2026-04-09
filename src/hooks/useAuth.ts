import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import {
  getAuth,
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { app } from '@/firebase';

const auth = getAuth(app);
const firestore = getFirestore(app);

export type UserRole = 'admin' | 'warehouse' | null;

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  role: UserRole;
  isAuthenticated: boolean;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
}

export function useAuth(): AuthContextType {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole>(null);

  // Fetch user role from Firestore
  const fetchUserRole = async (uid: string) => {
    try {
      const userDocRef = doc(firestore, 'cms_users', uid);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        setRole(userDocSnap.data().role || null);
      } else {
        setRole(null);
      }
    } catch (err) {
      console.error('Error fetching user role:', err);
      setRole(null);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {
        setUser(currentUser);
        if (currentUser) {
          await fetchUserRole(currentUser.uid);
        } else {
          setRole(null);
        }
        setLoading(false);
      },
      (error) => {
        setError(error.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string, userRole: UserRole) => {
    try {
      setError(null);
      // Try to sign in first
      let userCredential;
      try {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } catch (signInError: any) {
        // If user doesn't exist or invalid credential, create account
        if (signInError.code === 'auth/user-not-found' || signInError.code === 'auth/invalid-credential') {
          userCredential = await createUserWithEmailAndPassword(auth, email, password);
        } else {
          throw signInError;
        }
      }

      // Save or update user role in Firestore
      if (userRole) {
        const userDocRef = doc(firestore, 'cms_users', userCredential.user.uid);
        await setDoc(userDocRef, {
          email: userCredential.user.email,
          role: userRole,
          createdAt: new Date(),
          lastLogin: new Date(),
        }, { merge: true });
      }

      // Fetch the role
      await fetchUserRole(userCredential.user.uid);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setRole(null);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  return {
    user,
    loading,
    error,
    role,
    isAuthenticated: !!user && !!role,
    login,
    logout,
  };
}
