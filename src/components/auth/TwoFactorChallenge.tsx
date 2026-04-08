import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Shield, Loader2, Key } from 'lucide-react';

interface TwoFactorChallengeProps {
  open: boolean;
  onVerified: () => void;
  onCancel: () => void;
}

export function TwoFactorChallenge({ open, onVerified, onCancel }: TwoFactorChallengeProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [useBackup, setUseBackup] = useState(false);
  const [backupCode, setBackupCode] = useState('');

  const handleVerify = async () => {
    if (code.length !== 6) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('mfa-setup', {
        body: { action: 'validate', token: code }
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (data?.valid) {
        onVerified();
      } else {
        toast({ variant: 'destructive', title: 'Invalid code', description: 'Please check your authenticator app and try again.' });
        setCode('');
      }
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Verification failed', description: err.message });
      setCode('');
    } finally {
      setLoading(false);
    }
  };

  const handleBackupCode = async () => {
    if (!backupCode.trim()) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('mfa-setup', {
        body: { action: 'use_backup', backup_code: backupCode.trim() }
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (data?.valid) {
        toast({ title: 'Backup code accepted', description: `${data.remaining} codes remaining.` });
        onVerified();
      } else {
        toast({ variant: 'destructive', title: 'Invalid backup code' });
        setBackupCode('');
      }
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Failed', description: err.message });
      setBackupCode('');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    // Sign out since they can't pass MFA
    await supabase.auth.signOut();
    onCancel();
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" hideClose onPointerDownOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Two-Factor Authentication
          </DialogTitle>
          <DialogDescription>
            {useBackup
              ? 'Enter one of your backup codes to continue.'
              : 'Enter the 6-digit code from your authenticator app.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!useBackup ? (
            <>
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={code} onChange={setCode}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              <Button onClick={handleVerify} disabled={loading || code.length !== 6} className="w-full">
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Verify
              </Button>
            </>
          ) : (
            <>
              <Input
                value={backupCode}
                onChange={(e) => setBackupCode(e.target.value)}
                placeholder="XXXX-XXXX"
                className="text-center font-mono tracking-wider"
              />
              <Button onClick={handleBackupCode} disabled={loading || !backupCode.trim()} className="w-full">
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Use Backup Code
              </Button>
            </>
          )}

          <div className="flex items-center justify-between pt-2">
            <Button variant="link" size="sm" className="text-xs p-0 h-auto" onClick={() => { setUseBackup(!useBackup); setCode(''); setBackupCode(''); }}>
              <Key className="w-3 h-3 mr-1" />
              {useBackup ? 'Use authenticator app' : 'Use backup code'}
            </Button>
            <Button variant="link" size="sm" className="text-xs p-0 h-auto text-destructive" onClick={handleCancel}>
              Sign out
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
