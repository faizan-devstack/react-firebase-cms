import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className='border-t border-border bg-muted/30 mt-12'>
      <div className='max-w-7xl mx-auto px-4 py-8'>
        <div className='flex flex-col md:flex-row items-center justify-between gap-4'>
          <div className='text-center md:text-left'>
            <p className='font-semibold text-foreground'>MiniShip CMS</p>
            <p className='text-sm text-muted-foreground'>
              Firebase-powered warehouse & order management
            </p>
          </div>

          <div className='flex items-center gap-1 text-sm text-muted-foreground'>
            <span>Built with</span>
            <Heart className='h-4 w-4 text-red-500 fill-red-500' />
            <span>using React + Firebase</span>
          </div>

          <div className='text-right'>
            <p className='text-xs text-muted-foreground'>
              v1.0.0 • Demo • {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
