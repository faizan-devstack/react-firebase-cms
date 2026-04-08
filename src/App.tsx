import { useAuth } from '@/hooks/useAuth';
import Login from '@/components/cms/Login';
import Home from '@/pages/Home';

function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <div className='text-center space-y-4'>
          <div className='inline-flex animate-spin'>
            <div className='h-8 w-8 border-4 border-primary border-t-transparent rounded-full' />
          </div>
          <p className='text-muted-foreground'>Loading...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <Home /> : <Login />;
}

export default App;
