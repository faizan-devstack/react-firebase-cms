import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { app } from '@/firebase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState } from 'react';

const auth = getAuth(app)
const googleProvider = new GoogleAuthProvider();

export default function Signin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const signinUser = async () => {
    setLoading(true)
    setError('')
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      console.log('User signed in:', result)
      setEmail('')
      setPassword('')
    } catch (err: any) {
      setError(err.message)
      console.error('Signin error:', err)
    } finally {
      setLoading(false)
    }
  }

  const signinWithGoogle = async () => {
    setLoading(true)
    setError('')
    try {
      await signInWithPopup(auth, googleProvider)
      console.log('User signed in with Google')
      setEmail('')
      setPassword('')
    } catch (err: any) {
      setError(err.message)
      console.error('Google signin error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen bg-canvas-base flex items-center justify-center p-4'>
      <div className='bg-canvas-bg rounded-2xl border border-canvas-border shadow-lg p-8 space-y-6 w-full max-w-md'>
        <h1 className='text-3xl font-bold text-center text-canvas-text-contrast'>Sign In</h1>
        
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
            onClick={signinUser}
            disabled={loading || !email || !password}
            className='w-full'
          >
            {loading ? 'Signing In...' : 'Sign In'}
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
            onClick={signinWithGoogle}
            disabled={loading}
            variant='outline'
            className='w-full'
          >
            {loading ? 'Signing in...' : '🔍 Sign in with Google'}
          </Button>
        </div>
      </div>
    </div>
  )
}
