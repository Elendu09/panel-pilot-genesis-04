import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import TenantRouter from './pages/TenantRouter';
import './index.css';

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <TenantRouter />
  </StrictMode>
);
