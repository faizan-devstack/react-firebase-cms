import {
  getFirestore,
  collection,
  query,
  where,
  onSnapshot,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  Timestamp,
  type Unsubscribe,
  type QueryConstraint,
} from 'firebase/firestore';
import { app } from '@/firebase';
import type { Order, OrderStatus, ExceptionQueueItem } from '@/lib/types';

const firestore = getFirestore(app);
const ORDERS_COLLECTION = 'orders';
const EXCEPTIONS_COLLECTION = 'exceptions';

/**
 * Get all orders (one-time fetch)
 */
export async function getOrders(): Promise<Order[]> {
  try {
    const ordersRef = collection(firestore, ORDERS_COLLECTION);
    const snapshot = await getDocs(ordersRef);
    return snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      expectedDelivery: doc.data().expectedDelivery?.toDate(),
    } as Order));
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
}

/**
 * Get orders with filters
 */
export async function getOrdersByStatus(status: OrderStatus): Promise<Order[]> {
  try {
    const ordersRef = collection(firestore, ORDERS_COLLECTION);
    const q = query(ordersRef, where('status', '==', status));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      expectedDelivery: doc.data().expectedDelivery?.toDate(),
    } as Order));
  } catch (error) {
    console.error(`Error fetching orders with status ${status}:`, error);
    return [];
  }
}

/**
 * Listen to orders in real-time
 * @param callback - Called with updated orders array
 * @param filters - Optional query constraints
 * @returns Unsubscribe function
 */
export function listenToOrders(
  callback: (orders: Order[]) => void,
  filters?: QueryConstraint[]
): Unsubscribe {
  try {
    const ordersRef = collection(firestore, ORDERS_COLLECTION);
    const q = filters ? query(ordersRef, ...filters) : query(ordersRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        expectedDelivery: doc.data().expectedDelivery?.toDate(),
      } as Order));

      callback(orders);
    });

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up orders listener:', error);
    return () => {};
  }
}

/**
 * Listen to orders by status in real-time
 */
export function listenToOrdersByStatus(
  status: OrderStatus,
  callback: (orders: Order[]) => void
): Unsubscribe {
  return listenToOrders(callback, [where('status', '==', status)]);
}

/**
 * Add a new order
 */
export async function addOrder(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(firestore, ORDERS_COLLECTION), {
      ...order,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding order:', error);
    throw error;
  }
}

/**
 * Update order status
 */
export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  notes?: string
): Promise<void> {
  try {
    const orderRef = doc(firestore, ORDERS_COLLECTION, orderId);
    const updateData: any = {
      status: newStatus,
      updatedAt: Timestamp.now(),
    };
    if (notes) {
      updateData.notes = notes;
    }
    await updateDoc(orderRef, updateData);
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
}

/**
 * Update order
 */
export async function updateOrder(orderId: string, updates: Partial<Order>): Promise<void> {
  try {
    const orderRef = doc(firestore, ORDERS_COLLECTION, orderId);
    const updateData = {
      ...updates,
      updatedAt: Timestamp.now(),
    };
    await updateDoc(orderRef, updateData);
  } catch (error) {
    console.error('Error updating order:', error);
    throw error;
  }
}

/**
 * Get all exceptions
 */
export async function getExceptions(): Promise<ExceptionQueueItem[]> {
  try {
    const exceptionsRef = collection(firestore, EXCEPTIONS_COLLECTION);
    const snapshot = await getDocs(exceptionsRef);
    return snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    } as ExceptionQueueItem));
  } catch (error) {
    console.error('Error fetching exceptions:', error);
    return [];
  }
}

/**
 * Listen to exceptions in real-time
 */
export function listenToExceptions(
  callback: (exceptions: ExceptionQueueItem[]) => void,
  filters?: QueryConstraint[]
): Unsubscribe {
  try {
    const exceptionsRef = collection(firestore, EXCEPTIONS_COLLECTION);
    const q = filters ? query(exceptionsRef, ...filters) : query(exceptionsRef);

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const exceptions = snapshot.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      } as ExceptionQueueItem));

      callback(exceptions);
    });

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up exceptions listener:', error);
    return () => {};
  }
}

/**
 * Listen to open exceptions in real-time
 */
export function listenToOpenExceptions(
  callback: (exceptions: ExceptionQueueItem[]) => void
): Unsubscribe {
  return listenToExceptions(callback, [where('status', '==', 'open')]);
}

/**
 * Add exception
 */
export async function addException(
  exception: Omit<ExceptionQueueItem, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  try {
    const docRef = await addDoc(collection(firestore, EXCEPTIONS_COLLECTION), {
      ...exception,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding exception:', error);
    throw error;
  }
}

/**
 * Update exception
 */
export async function updateException(
  exceptionId: string,
  updates: Partial<ExceptionQueueItem>
): Promise<void> {
  try {
    const exceptionRef = doc(firestore, EXCEPTIONS_COLLECTION, exceptionId);
    await updateDoc(exceptionRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error updating exception:', error);
    throw error;
  }
}

/**
 * Delete order
 */
export async function deleteOrder(orderId: string): Promise<void> {
  try {
    const orderRef = doc(firestore, ORDERS_COLLECTION, orderId);
    await deleteDoc(orderRef);
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error;
  }
}
