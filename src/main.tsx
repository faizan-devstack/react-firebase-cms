import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { FirbaseProvider } from '@/context/firebase.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <FirbaseProvider>
      <App />
    </FirbaseProvider>
  </StrictMode>,
)
