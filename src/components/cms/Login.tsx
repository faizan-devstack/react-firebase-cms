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
    label: 'Login as Admin',
  },
  {
    email: 'warehouse@minship.demo',
    password: 'warehouse@123',
    role: 'warehouse',
    label: 'Login as Warehouse',
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
    setIsSubmitting(true);

    try {
      await login(email, password, selectedRole);
    } catch (err: any) {
      setLocalError(err.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async (account: DemoAccount) => {
    setLocalError(null);
    setIsSubmitting(true);

    try {
      await login(account.email, account.password, account.role);
    } catch (err: any) {
      setLocalError(err.message || 'Demo login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayError = localError || error;

  return (
    <div className='min-h-screen bg-linear-to-br from-background to-muted flex items-center justify-center p-4'>
      <Card className='w-full max-w-md shadow-xl'>
        <div className='p-8 space-y-8'>
          {/* Header */}
          <div className='text-center space-y-2'>
            <h1 className='text-3xl font-bold text-foreground'>MiniShip CMS</h1>
            <p className='text-sm text-muted-foreground'>Warehouse & Order Management System</p>
          </div>

          {/* Error Alert */}
          {displayError && (
            <div className='bg-destructive/10 border border-destructive/30 rounded-lg p-4 flex gap-3'>
              <AlertCircle className='h-5 w-5 text-destructive shrink-0 mt-0.5' />
              <p className='text-sm text-destructive'>{displayError}</p>
            </div>
          )}

          {/* Custom Login Form */}
          <form onSubmit={handleCustomLogin} className='space-y-4'>
            <div className='space-y-2'>
              <label className='block text-sm font-medium text-foreground'>Email</label>
              <Input
                type='email'
                placeholder='your@email.com'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting || loading}
                className='bg-muted/50'
              />
            </div>

            <div className='space-y-2'>
              <label className='block text-sm font-medium text-foreground'>Password</label>
              <Input
                type='password'
                placeholder='••••••••'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting || loading}
                className='bg-muted/50'
              />
            </div>

            <div className='space-y-2'>
              <label className='block text-sm font-medium text-foreground'>Role</label>
              <select
                value={selectedRole || ''}
                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                disabled={isSubmitting || loading}
                className='w-full px-3 py-2 bg-muted/50 border border-input rounded-md text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed'
              >
                <option value=''>Select a role</option>
                <option value='admin'>Admin</option>
                <option value='warehouse'>Warehouse Operator</option>
                <option value='manager'>Manager</option>
                <option value='viewer'>Viewer</option>
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

          {/* Divider */}
          <div className='relative'>
            <div className='absolute inset-0 flex items-center'>
              <div className='w-full border-t border-border' />
            </div>
            <div className='relative flex justify-center text-xs uppercase'>
              <span className='bg-card px-2 text-muted-foreground'>Or try demo</span>
            </div>
          </div>

          {/* Demo Login Buttons */}
          <div className='space-y-3'>
            {DEMO_ACCOUNTS.map((account) => (
              <Button
                key={account.email}
                type='button'
                variant='outline'
                className='w-full justify-center'
                onClick={() => handleDemoLogin(account)}
                disabled={isSubmitting || loading}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  </>
                ) : (
                  account.label
                )}
              </Button>
            ))}
          </div>

          {/* Info */}
          <div className='bg-muted/50 border border-border rounded-lg p-4 space-y-2'>
            <p className='text-xs font-semibold text-foreground'>Demo Credentials:</p>
            {DEMO_ACCOUNTS.map((account) => (
              <div key={account.email} className='text-xs text-muted-foreground'>
                <p>
                  <span className='font-medium'>{account.label}:</span>
                </p>
                <p className='ml-2'>
                  Email: <code className='bg-background px-1 py-0.5 rounded'>{account.email}</code>
                </p>
                <p className='ml-2'>
                  Password: <code className='bg-background px-1 py-0.5 rounded'>{account.password}</code>
                </p>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
