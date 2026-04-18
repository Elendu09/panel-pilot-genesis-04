import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Shield, Loader2, Copy, CheckCircle, AlertTriangle, Smartphone } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { QRCodeSVG } from 'qrcode.react';

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

  useEffect(() => {
    if (open && !isEnabled) {
      setStep('qr');
      setCode('');
      setCopiedSecret(false);
      setCopiedBackup(false);
      setSecret('');
      setOtpauthUri('');
      handleEnroll();
    } else if (!open) {
      setStep('qr');
      setCode('');
      setCopiedSecret(false);
      setCopiedBackup(false);
      setSecret('');
      setOtpauthUri('');
    }
  }, [open]);

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            {step === 'backup' ? 'Save Backup Codes' : step === 'verify' ? 'Verify Setup' : 'Set Up Two-Factor Authentication'}
          </DialogTitle>
          <DialogDescription>
            {step === 'qr' && 'Scan the QR code with your authenticator app, or enter the key manually.'}
            {step === 'verify' && 'Enter the 6-digit code from your authenticator app to confirm setup.'}
            {step === 'backup' && 'Save these backup codes in a safe place. Each code can only be used once.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {step === 'qr' && !secret ? (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Generating your authenticator setup…</p>
            </div>
          ) : step === 'qr' && secret ? (
            <>
              {/* QR Code */}
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-white rounded-xl border-2 border-primary/20 shadow-sm">
                  {otpauthUri ? (
                    <QRCodeSVG
                      value={otpauthUri}
                      size={180}
                      level="M"
                      includeMargin={false}
                    />
                  ) : (
                    <div className="w-[180px] h-[180px] flex items-center justify-center bg-muted/30 rounded">
                      <Smartphone className="w-10 h-10 text-muted-foreground/50" />
                    </div>
                  )}
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Scan with Google Authenticator, Authy, or any TOTP app
                </p>
              </div>

              {/* Manual key fallback */}
              <div className="rounded-lg bg-muted/40 border border-border/60 p-3 space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">Can't scan? Enter this key manually:</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 font-mono text-sm bg-background px-3 py-1.5 rounded border break-all select-all">
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

              <Button onClick={() => setStep('verify')} className="w-full">
                I've scanned the code → Next
              </Button>
            </>
          ) : step === 'verify' ? (
            <>
              <p className="text-sm text-center text-muted-foreground">
                Open your authenticator app and enter the 6-digit code shown for this account.
              </p>
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
                Verify & Enable 2FA
              </Button>
              <Button variant="ghost" size="sm" className="w-full text-xs" onClick={() => setStep('qr')}>
                ← Back to QR code
              </Button>
            </>
          ) : step === 'backup' ? (
            <>
              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  Store these codes safely. If you lose access to your authenticator app, you'll need one of these to log in.
                </p>
              </div>
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
