import { useState } from 'react';
import { useAuth, type UserRole } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { AlertCircle, Loader2 } from 'lucide-react';

type DemoAccount = {
  email: string;
  password: string;
  role: UserRole;
  label: string;
};

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    email: 'admin@minship.demo',
    password: 'admin@123',
    role: 'admin',
    label: 'Admin Account',
  },
  {
    email: 'warehouse@minship.demo',
    password: 'warehouse@123',
    role: 'warehouse',
    label: 'Warehouse Operator Account',
  },
];

export default function Login() {
  const { login, loading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('warehouse');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !selectedRole) {
      setLocalError('Please fill in all fields');
      return;
    }

    setLocalError(null);

    // Security: Validate that credentials match the selected role
    const selectedAccountMatch = DEMO_ACCOUNTS.find(
      (acc) => acc.role === selectedRole && acc.email === email && acc.password === password
    );

    if (!selectedAccountMatch) {
      setLocalError(`Invalid credentials for ${selectedRole} role. Please use the correct email and password for the selected role.`);
      return;
    }

    setIsSubmitting(true);

    try {
      await login(email, password, selectedRole);
    } catch (err: any) {
      setLocalError(err.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayError = localError || error;

  return (
    <div className='min-h-screen bg-canvas-base from-canvas-base to-canvas-bg-subtle flex items-center justify-center p-4'>
      <Card className='w-full max-w-md p-0'>
        <div className='p-8 space-y-8'>
          {/* Header */}
          <div className='text-center space-y-2'>
            <h1 className='text-3xl font-bold text-canvas-text-contrast'>MiniShip CMS</h1>
            <p className='text-sm text-canvas-text'>Warehouse & Order Management System</p>
          </div>

          {/* Error Alert */}
          {displayError && (
            <div className='bg-alert-bg border border-alert-border rounded-lg p-4 flex gap-3'>
              <AlertCircle className='h-5 w-5 text-alert-text shrink-0 mt-0.5' />
              <p className='text-sm text-alert-text'>{displayError}</p>
            </div>
          )}

          {/* Custom Login Form */}
          <form onSubmit={handleCustomLogin} className='space-y-4'>
            <div className='space-y-2'>
              <label className='block text-sm font-medium text-canvas-text-contrast'>Email</label>
              <Input
                type='email'
                placeholder='your@email.com'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting || loading}
                className='bg-canvas-bg-subtle'
              />
            </div>

            <div className='space-y-2'>
              <label className='block text-sm font-medium text-canvas-text-contrast'>Password</label>
              <Input
                type='password'
                placeholder='••••••••'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting || loading}
                className='bg-canvas-bg-subtle'
              />
            </div>

            <div className='space-y-2'>
              <label className='block text-sm font-medium text-canvas-text-contrast'>Role</label>
              <select
                value={selectedRole || ''}
                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                disabled={isSubmitting || loading}
                className='w-full px-3 py-2 bg-canvas-bg-subtle border border-canvas-border rounded-md text-sm text-canvas-text-contrast focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed'
              >
                <option value=''>Select a role</option>
                <option value='admin'>Admin</option>
                <option value='warehouse'>Warehouse Operator</option>
              </select>
            </div>

            <Button
              type='submit'
              className='w-full'
              disabled={isSubmitting || loading || !email || !password || !selectedRole}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </Button>
          </form>

          {/* Info */}
          <div className='bg-canvas-bg-subtle border border-canvas-border rounded-lg p-4 space-y-2'>
            <p className='text-xs font-semibold text-canvas-text-contrast'>Demo Credentials:</p>
            {DEMO_ACCOUNTS.map((account) => (
              <div key={account.email} className='text-xs text-canvas-text'>
                <p>
                  <span className='font-medium'>{account.label}:</span>
                </p>
                <p className='ml-2'>
                  Email: <code className='bg-canvas-base px-1 py-0.5 rounded'>{account.email}</code>
                </p>
                <p className='ml-2'>
                  Password: <code className='bg-canvas-base px-1 py-0.5 rounded'>{account.password}</code>
                </p>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
