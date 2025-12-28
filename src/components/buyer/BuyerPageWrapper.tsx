import { ReactNode } from 'react';
import { Loader2, AlertTriangle, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import BuyerLayout from '@/pages/buyer/BuyerLayout';
import { useTenant } from '@/hooks/useTenant';
import { useBuyerAuth } from '@/contexts/BuyerAuthContext';

interface BuyerPageWrapperProps {
  children: ReactNode;
  error?: string | null;
  onRetry?: () => void;
}

export function BuyerPageWrapper({ children, error, onRetry }: BuyerPageWrapperProps) {
  const { panel, loading: panelLoading } = useTenant();
  const { buyer, loading: authLoading } = useBuyerAuth();

  // Loading state
  if (panelLoading || authLoading) {
    return (
      <BuyerLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </BuyerLayout>
    );
  }

  // Not authenticated
  if (!buyer) {
    return (
      <BuyerLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <LogIn className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold mb-2">Login Required</h2>
          <p className="text-muted-foreground mb-4 text-sm max-w-md">
            Please sign in to access this page.
          </p>
          <Button asChild>
            <Link to="/auth">Sign In</Link>
          </Button>
        </div>
      </BuyerLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <BuyerLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-amber-500" />
          </div>
          <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-4 text-sm max-w-md">
            {error}
          </p>
          {onRetry && (
            <Button onClick={onRetry}>
              Try Again
            </Button>
          )}
        </div>
      </BuyerLayout>
    );
  }

  return <BuyerLayout>{children}</BuyerLayout>;
}
