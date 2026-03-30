import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Shield, Loader2, Copy, CheckCircle, AlertTriangle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface BuyerMfaSetupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  buyerId: string;
  panelId: string;
  token: string;
  onEnabled: () => void;
  onDisabled: () => void;
  isEnabled: boolean;
}

type Step = 'qr' | 'verify' | 'backup' | 'done';

export function BuyerMfaSetupDialog({ 
  open, onOpenChange, buyerId, panelId, token, onEnabled, onDisabled, isEnabled 
}: BuyerMfaSetupDialogProps) {
  const [step, setStep] = useState<Step>('qr');
  const [loading, setLoading] = useState(false);
  const [secret, setSecret] = useState('');
  const [otpauthUri, setOtpauthUri] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [code, setCode] = useState('');
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedBackup, setCopiedBackup] = useState(false);

  const handleEnroll = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('buyer-auth', {
        body: { action: 'mfa-enroll', panelId, buyerId, token }
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      
      setSecret(data.secret);
      setOtpauthUri(data.otpauth_uri);
      setBackupCodes(data.backup_codes || []);
      setStep('qr');
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Setup failed', description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (code.length !== 6) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('buyer-auth', {
        body: { action: 'mfa-verify', panelId, buyerId, token, mfaToken: code }
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (data?.success) {
        setStep('backup');
      }
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Invalid code', description: err.message });
      setCode('');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('buyer-auth', {
        body: { action: 'mfa-disable', panelId, buyerId, token }
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: '2FA Disabled', description: 'Two-factor authentication has been disabled.' });
      onDisabled();
      onOpenChange(false);
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Failed', description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = () => {
    if (!open) {
      // Reset state
      setStep('qr');
      setCode('');
      setCopiedSecret(false);
      setCopiedBackup(false);
      setSecret('');
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    handleOpen();
    onOpenChange(newOpen);
    if (newOpen && !isEnabled) {
      handleEnroll();
    }
  };

  const copyToClipboard = async (text: string, type: 'secret' | 'backup') => {
    await navigator.clipboard.writeText(text);
    if (type === 'secret') setCopiedSecret(true);
    else setCopiedBackup(true);
    toast({ title: 'Copied to clipboard' });
    setTimeout(() => {
      if (type === 'secret') setCopiedSecret(false);
      else setCopiedBackup(false);
    }, 2000);
  };

  // If MFA is already enabled, show disable option
  if (isEnabled) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Disable Two-Factor Authentication
            </DialogTitle>
            <DialogDescription>
              This will remove the extra security layer from your account.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
              <p className="text-sm text-amber-700 dark:text-amber-400">
                Disabling 2FA will make your account less secure. Are you sure?
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button variant="destructive" className="flex-1" onClick={handleDisable} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Disable 2FA
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            {step === 'backup' ? 'Save Backup Codes' : step === 'verify' ? 'Verify Setup' : 'Set Up Two-Factor Authentication'}
          </DialogTitle>
          <DialogDescription>
            {step === 'qr' && 'Scan the QR code or enter the secret key in your authenticator app.'}
            {step === 'verify' && 'Enter the 6-digit code from your authenticator app to confirm setup.'}
            {step === 'backup' && 'Save these backup codes in a safe place. Each code can only be used once.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {loading && step === 'qr' && !secret ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : step === 'qr' && secret ? (
            <>
              {/* QR Code placeholder - show manual entry */}
              <div className="text-center space-y-3">
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-2">Manual entry key:</p>
                  <div className="flex items-center justify-center gap-2">
                    <code className="font-mono text-sm bg-background px-3 py-1.5 rounded border break-all">
                      {secret}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() => copyToClipboard(secret, 'secret')}
                    >
                      {copiedSecret ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Open your authenticator app (Google Authenticator, Authy, etc.) and add this key manually.
                </p>
              </div>
              <Button onClick={() => setStep('verify')} className="w-full">
                I've added the key → Next
              </Button>
            </>
          ) : step === 'verify' ? (
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
                Verify & Enable
              </Button>
            </>
          ) : step === 'backup' ? (
            <>
              <ScrollArea className="h-48">
                <div className="grid grid-cols-2 gap-2 p-1">
                  {backupCodes.map((c, i) => (
                    <div key={i} className="font-mono text-sm bg-muted/50 px-3 py-2 rounded text-center border">
                      {c}
                    </div>
                  ))}
                </div>
              </ScrollArea>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => copyToClipboard(backupCodes.join('\n'), 'backup')}
              >
                {copiedBackup ? <CheckCircle className="w-4 h-4 mr-2 text-emerald-500" /> : <Copy className="w-4 h-4 mr-2" />}
                Copy All Codes
              </Button>
              <Button 
                className="w-full" 
                onClick={() => {
                  onEnabled();
                  onOpenChange(false);
                }}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Done — I've Saved My Codes
              </Button>
            </>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
