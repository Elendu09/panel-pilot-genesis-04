import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

// Minimal inline loader for initial render
const InitialLoader = () => (
  <div style={{ 
    minHeight: '100vh', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    background: 'hsl(222.2 84% 4.9%)'
  }}>
    <div style={{
      width: '32px',
      height: '32px',
      border: '2px solid hsl(217.2 91.2% 59.8%)',
      borderTopColor: 'transparent',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

// Lazy load the entire TenantRouter to reduce initial bundle
const TenantRouter = lazy(() => import('./pages/TenantRouter'));

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <Suspense fallback={<InitialLoader />}>
      <TenantRouter />
    </Suspense>
  </StrictMode>
);
