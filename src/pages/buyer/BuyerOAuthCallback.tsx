import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const BuyerOAuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const processCallback = async () => {
      const token = searchParams.get('token');
      const provider = searchParams.get('provider');
      const buyerId = searchParams.get('buyer_id');
      const error = searchParams.get('error');

      if (error) {
        setErrorMessage(error);
        setStatus('error');
        return;
      }

      if (!token || !buyerId) {
        setErrorMessage('Missing authentication data');
        setStatus('error');
        return;
      }

      try {
        // Store the session in localStorage (matching BuyerAuthContext pattern)
        const panelId = localStorage.getItem('buyer_panel_id') || '';
        
        // Decode token to get expiry
        const payload = JSON.parse(atob(token));
        
        const session = {
          buyerId: buyerId,
          panelId: panelId || payload.panel,
          token: token,
          expiresAt: payload.exp
        };

        localStorage.setItem('buyer_session', JSON.stringify(session));
        
        setStatus('success');
        
        // Redirect to dashboard after short delay
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 1500);
        
      } catch (err) {
        console.error('OAuth callback processing error:', err);
        setErrorMessage('Failed to complete authentication');
        setStatus('error');
      }
    };

    processCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex flex-col items-center gap-4">
            {status === 'loading' && (
              <>
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <span>Completing sign in...</span>
              </>
            )}
            {status === 'success' && (
              <>
                <CheckCircle className="w-12 h-12 text-green-500" />
                <span>Sign in successful!</span>
              </>
            )}
            {status === 'error' && (
              <>
                <XCircle className="w-12 h-12 text-destructive" />
                <span>Sign in failed</span>
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          {status === 'loading' && (
            <p className="text-muted-foreground">
              Please wait while we complete your authentication...
            </p>
          )}
          {status === 'success' && (
            <p className="text-muted-foreground">
              Redirecting you to your dashboard...
            </p>
          )}
          {status === 'error' && (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                {errorMessage || 'An error occurred during authentication.'}
              </p>
              <Button onClick={() => navigate('/auth')} variant="default">
                Try Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BuyerOAuthCallback;
