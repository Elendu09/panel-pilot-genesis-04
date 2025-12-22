import { Navigate, useLocation } from 'react-router-dom';
import { useBuyerAuth } from '@/contexts/BuyerAuthContext';
import { Loader2 } from 'lucide-react';

interface BuyerProtectedRouteProps {
  children: React.ReactNode;
}

export function BuyerProtectedRoute({ children }: BuyerProtectedRouteProps) {
  const { buyer, loading } = useBuyerAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-secondary/10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!buyer) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}