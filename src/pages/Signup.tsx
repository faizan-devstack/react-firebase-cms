import { getAuth, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { app } from '@/firebase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState } from 'react';

const auth = getAuth(app)
const googleProvider = new GoogleAuthProvider();

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const signupUser = async () => {
    setLoading(true)
    setError('')
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      console.log('User created:', result)
      setEmail('')
      setPassword('')
    } catch (err: any) {
      setError(err.message)
      console.error('Signup error:', err)
    } finally {
      setLoading(false)
    }
  }

  const signupWithGoogle = async () => {
    setLoading(true)
    setError('')
    try {
      await signInWithPopup(auth, googleProvider)
      console.log('User signed up with Google')
      setEmail('')
      setPassword('')
    } catch (err: any) {
      setError(err.message)
      console.error('Google signup error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen bg-canvas-base flex items-center justify-center p-4'>
      <div className='bg-canvas-bg rounded-2xl border border-canvas-border p-8 space-y-6 w-full max-w-md'>
        <h1 className='text-3xl font-bold text-center text-canvas-text-contrast'>Create Account</h1>
        
        <div className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-canvas-text mb-2'>Email</label>
            <Input 
              type='email'
              placeholder='Enter your email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-canvas-text mb-2'>Password</label>
            <Input 
              type='password'
              placeholder='Enter your password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <p className='text-sm text-alert-text bg-alert-bg rounded px-3 py-2'>{error}</p>
          )}

          <Button 
            onClick={signupUser}
            disabled={loading || !email || !password}
            className='w-full'
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </Button>

          <div className='relative'>
            <div className='absolute inset-0 flex items-center'>
              <div className='w-full border-t border-canvas-border'></div>
            </div>
            <div className='relative flex justify-center text-sm'>
              <span className='px-2 bg-canvas-bg text-canvas-text'>or</span>
            </div>
          </div>

          <Button 
            onClick={signupWithGoogle}
            disabled={loading}
            variant='outline'
            className='w-full'
          >
            {loading ? 'Signing up...' : '🔍 Sign up with Google'}
          </Button>
        </div>
      </div>
    </div>
  )
}
