import { useAuth } from '@/hooks/useAuth';
import Dashboard from '@/components/cms/Dashboard';
import Footer from '@/components/ui/footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LogOut } from 'lucide-react';
import { useState } from 'react';

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  warehouse: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  manager: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  viewer: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
};

export default function Home() {
  const { user, role, logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const roleColor = ROLE_COLORS[role || 'viewer'];

  return (
    <div className='min-h-screen bg-background flex flex-col'>
      {/* Header/Navbar */}
      <header className='border-b border-border bg-card sticky top-0 z-50 shadow-sm'>
        <div className='max-w-7xl mx-auto px-4 py-4 flex items-center justify-between'>
          <div className='flex items-center gap-3 flex-1 min-w-0'>
            <div className='min-w-0'>
              <h1 className='text-2xl font-bold text-foreground truncate'>MiniShip CMS</h1>
              <p className='text-xs text-muted-foreground hidden sm:block'>
                Warehouse & Order Management
              </p>
            </div>
          </div>

          <div className='flex items-center gap-2 sm:gap-4 shrink-0'>
            {/* User Info - Hidden on mobile */}
            <div className='hidden sm:flex items-center gap-3 pr-4 border-r border-border'>
              <div className='text-right'>
                <p className='text-sm font-medium text-foreground truncate max-w-xs'>
                  {user?.email}
                </p>
                {role && (
                  <Badge className={`mt-1 ${roleColor} capitalize text-xs font-semibold`}>
                    {role}
                  </Badge>
                )}
              </div>
            </div>

            {/* Mobile Role Badge */}
            <div className='sm:hidden'>
              {role && (
                <Badge className={`${roleColor} capitalize text-xs font-semibold`}>
                  {role}
                </Badge>
              )}
            </div>

            {/* Logout Button */}
            <Button
              onClick={handleLogout}
              disabled={isLoggingOut}
              variant='ghost'
              size='sm'
              className='gap-2'
            >
              <LogOut className='h-4 w-4' />
              <span className='hidden sm:inline'>Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className='flex-1 w-full mx-auto px-4 py-8 max-w-7xl'>
        <Dashboard />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
