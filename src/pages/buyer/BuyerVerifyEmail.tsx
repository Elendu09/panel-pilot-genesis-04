import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, Loader2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BuyerVerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    const panelId = searchParams.get('panelId');

    if (!token || !panelId) {
      setStatus('error');
      setMessage('Invalid verification link. Please request a new one from your profile.');
      return;
    }

    supabase.functions.invoke('buyer-auth', {
      body: { action: 'verify-email-token', token, panelId }
    }).then(({ data, error }) => {
      if (error || data?.error) {
        const msg = data?.error || 'Verification failed';
        if (msg.includes('expired')) {
          setStatus('expired');
          setMessage('This verification link has expired. Please request a new one.');
        } else {
          setStatus('error');
          setMessage(msg);
        }
      } else {
        setStatus('success');
        setMessage('Your email has been verified successfully!');
      }
    });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full text-center space-y-6">
        {status === 'loading' && (
          <>
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Verifying your email…</h1>
              <p className="text-muted-foreground mt-2">Please wait a moment.</p>
            </div>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-emerald-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">Email Verified!</h1>
              <p className="text-muted-foreground mt-2">{message}</p>
              <p className="text-sm text-muted-foreground mt-1">
                You can now enable two-factor authentication and access all features.
              </p>
            </div>
            <Button className="w-full" onClick={() => navigate('/dashboard')}>
              Go to Dashboard
            </Button>
          </>
        )}

        {status === 'expired' && (
          <>
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/10 flex items-center justify-center">
              <Mail className="w-8 h-8 text-amber-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Link Expired</h1>
              <p className="text-muted-foreground mt-2">{message}</p>
            </div>
            <Button variant="outline" className="w-full" onClick={() => navigate('/profile')}>
              Request New Verification Email
            </Button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
              <XCircle className="w-8 h-8 text-destructive" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Verification Failed</h1>
              <p className="text-muted-foreground mt-2">{message}</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => navigate('/dashboard')}>
                Dashboard
              </Button>
              <Button className="flex-1" onClick={() => navigate('/profile')}>
                Go to Profile
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
