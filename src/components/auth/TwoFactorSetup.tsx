import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Shield, Copy, Download, CheckCircle, Loader2, Eye, EyeOff, ShieldOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TwoFactorSetupProps {
  onStatusChange?: (enabled: boolean) => void;
}

export function TwoFactorSetup({ onStatusChange }: TwoFactorSetupProps) {
  const [step, setStep] = useState<'idle' | 'enrolling' | 'verify' | 'done'>('idle');
  const [loading, setLoading] = useState(false);
  const [secret, setSecret] = useState('');
  const [otpauthUri, setOtpauthUri] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verifyCode, setVerifyCode] = useState('');
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  // Check MFA status on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke('mfa-setup', {
          body: { action: 'status' }
        });
        if (cancelled) return;
        if (!error && data?.enabled) {
          setMfaEnabled(true);
          setStep('done');
        }
      } catch (e) {
        console.error('Error checking MFA status:', e);
      } finally {
        if (!cancelled) setCheckingStatus(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleEnroll = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('mfa-setup', {
        body: { action: 'enroll' }
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setSecret(data.secret);
      setOtpauthUri(data.otpauth_uri);
      setBackupCodes(data.backup_codes);
      setStep('verify');
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Enrollment failed', description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (verifyCode.length !== 6) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('mfa-setup', {
        body: { action: 'verify', token: verifyCode }
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setMfaEnabled(true);
      setStep('done');
      setShowBackupCodes(true);
      onStatusChange?.(true);
      toast({ title: '2FA Enabled', description: 'Two-factor authentication is now active.' });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Verification failed', description: err.message });
      setVerifyCode('');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('mfa-setup', {
        body: { action: 'disable' }
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setMfaEnabled(false);
      setStep('idle');
      setSecret('');
      setBackupCodes([]);
      onStatusChange?.(false);
      toast({ title: '2FA Disabled', description: 'Two-factor authentication has been removed.' });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Failed to disable 2FA', description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const downloadBackupCodes = () => {
    const content = `SMMPilot 2FA Backup Codes\n${'='.repeat(30)}\n\n${backupCodes.join('\n')}\n\nEach code can only be used once.\nStore these codes in a safe place.`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'smmpilot-2fa-backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied to clipboard' });
  };

  if (checkingStatus) {
    return (
      <Card className="glass-card">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Two-Factor Authentication (2FA)
          {mfaEnabled && (
            <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Active</Badge>
          )}
        </CardTitle>
        <CardDescription>
          {mfaEnabled
            ? 'Your account is protected with TOTP-based two-factor authentication.'
            : 'Add an extra layer of security by enabling authenticator app verification.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <AnimatePresence mode="wait">
          {/* Idle state - not enrolled */}
          {step === 'idle' && (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Button onClick={handleEnroll} disabled={loading} className="w-full">
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Shield className="w-4 h-4 mr-2" />}
                Enable 2FA
              </Button>
            </motion.div>
          )}

          {/* Verify step - show QR + OTP input */}
          {step === 'verify' && (
            <motion.div key="verify" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
              {/* QR Code area */}
              <div className="text-center space-y-3">
                <p className="text-sm text-muted-foreground">
                  Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                </p>
                <div className="inline-block p-4 bg-white rounded-xl">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpauthUri)}`}
                    alt="2FA QR Code"
                    className="w-48 h-48"
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Or enter this key manually:</p>
                  <div className="flex items-center justify-center gap-2">
                    <code className="text-xs bg-muted/50 px-3 py-1.5 rounded-lg font-mono tracking-wider">
                      {secret}
                    </code>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyToClipboard(secret)}>
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* OTP input */}
              <div className="space-y-3 text-center">
                <p className="text-sm font-medium">Enter the 6-digit code from your app:</p>
                <div className="flex justify-center">
                  <InputOTP maxLength={6} value={verifyCode} onChange={setVerifyCode}>
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
                <Button 
                  onClick={handleVerify} 
                  disabled={loading || verifyCode.length !== 6}
                  className="w-full max-w-xs"
                >
                  {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                  Verify & Enable
                </Button>
              </div>
            </motion.div>
          )}

          {/* Done state - MFA enabled */}
          {step === 'done' && (
            <motion.div key="done" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-green-600 dark:text-green-400">2FA is active</p>
                  <p className="text-xs text-muted-foreground">You'll be prompted for a code after login.</p>
                </div>
              </div>

              {/* Backup codes section */}
              {backupCodes.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Backup Codes</p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => setShowBackupCodes(!showBackupCodes)}>
                        {showBackupCodes ? <EyeOff className="w-3 h-3 mr-1" /> : <Eye className="w-3 h-3 mr-1" />}
                        {showBackupCodes ? 'Hide' : 'Show'}
                      </Button>
                      <Button variant="outline" size="sm" onClick={downloadBackupCodes}>
                        <Download className="w-3 h-3 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                  <AnimatePresence>
                    {showBackupCodes && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="grid grid-cols-1 sm:grid-cols-2 gap-2 overflow-x-auto"
                      >
                        {backupCodes.map((code, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-muted/50 font-mono text-xs sm:text-sm min-w-0">
                            <span className="truncate">{code}</span>
                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(code)}>
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <p className="text-xs text-muted-foreground">
                    Save these codes securely. Each can only be used once if you lose your authenticator.
                  </p>
                </div>
              )}

              <Button variant="destructive" onClick={handleDisable} disabled={loading} className="w-full">
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ShieldOff className="w-4 h-4 mr-2" />}
                Disable 2FA
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
