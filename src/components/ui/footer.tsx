import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className='border-t border-canvas-border bg-canvas-bg-subtle mt-12'>
      <div className='max-w-7xl mx-auto px-4 py-8'>
        <div className='flex flex-col md:flex-row items-center justify-between gap-4'>
          <div className='text-center md:text-left'>
            <p className='font-semibold text-canvas-text-contrast'>MiniShip CMS</p>
            <p className='text-sm text-canvas-text'>
              Firebase powered management app
            </p>
          </div>

          <div className='flex items-center justify-center gap-1 text-sm text-canvas-text'>
            <span>Built with</span>
            <Heart className='h-4 w-4 text-primary-text mx-1' />
            <span>using React + Firebase by</span>
            <a href="https://github.com/faizan-devstack" target="_blank" rel="noopener noreferrer">
              <span className='text-primary-text hover:underline'>Faizan</span>
            </a>
          </div>

          <div className='text-right'>
            <p className='text-xs text-canvas-text'>
              v1.0.0 • Demo • {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
