import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Shield, Loader2, Key, AlertCircle } from "lucide-react";

// UPDATED PROPS INTERFACE
interface TwoFactorChallengeProps {
  open: boolean;
  onVerified: () => void;
  onCancel: () => void;
  onError?: (message: string) => void; // Added this
  errorMessage?: string | null; // Added this
}

export function TwoFactorChallenge({ open, onVerified, onCancel, onError, errorMessage }: TwoFactorChallengeProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [useBackup, setUseBackup] = useState(false);
  const [backupCode, setBackupCode] = useState("");
  const [localError, setLocalError] = useState("");

  const handleVerify = async () => {
    if (code.length !== 6) return;
    setLoading(true);
    setLocalError("");
    try {
      const { data, error } = await supabase.functions.invoke("mfa-setup", {
        body: { action: "validate", token: code },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (data?.valid) {
        onVerified();
      } else {
        const msg = "Invalid code. Please check your authenticator app and try again.";
        setLocalError(msg);
        // Call the error callback passed from AuthContext
        if (onError) onError(msg);
        toast({
          variant: "destructive",
          title: "Invalid code",
          description: "Please check your authenticator app and try again.",
        });
        setCode("");
      }
    } catch (err: any) {
      const msg = err.message || "Verification failed. Please try again.";
      setLocalError(msg);
      if (onError) onError(msg);
      toast({ variant: "destructive", title: "Verification failed", description: err.message });
      setCode("");
    } finally {
      setLoading(false);
    }
  };

  const handleBackupCode = async () => {
    if (!backupCode.trim()) return;
    setLoading(true);
    setLocalError("");
    try {
      const { data, error } = await supabase.functions.invoke("mfa-setup", {
        body: { action: "use_backup", backup_code: backupCode.trim() },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      if (data?.valid) {
        toast({ title: "Backup code accepted", description: `${data.remaining} codes remaining.` });
        onVerified();
      } else {
        const msg = "Invalid backup code. Please check and try again.";
        setLocalError(msg);
        if (onError) onError(msg);
        toast({ variant: "destructive", title: "Invalid backup code" });
        setBackupCode("");
      }
    } catch (err: any) {
      const msg = err.message || "Failed to verify backup code.";
      setLocalError(msg);
      if (onError) onError(msg);
      toast({ variant: "destructive", title: "Failed", description: err.message });
      setBackupCode("");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    await supabase.auth.signOut();
    onCancel();
  };

  const handleCodeChange = (val: string) => {
    setCode(val);
    if (localError) setLocalError("");
  };

  const handleBackupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBackupCode(e.target.value);
    if (localError) setLocalError("");
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-md"
        hideClose
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Two-Factor Authentication
          </DialogTitle>
          <DialogDescription>
            {useBackup
              ? "Enter one of your backup codes to continue."
              : "Enter the 6-digit code from your authenticator app."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!useBackup ? (
            <>
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={code} onChange={handleCodeChange}>
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

              {/* Display Error Message (Prioritize prop, then local state) */}
              {(errorMessage || localError) && (
                <div className="flex items-center gap-2 text-destructive text-sm justify-center">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage || localError}</span>
                </div>
              )}

              <Button onClick={handleVerify} disabled={loading || code.length !== 6} className="w-full">
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Verify
              </Button>
            </>
          ) : (
            <>
              <Input
                value={backupCode}
                onChange={handleBackupChange}
                placeholder="XXXX-XXXX"
                className="text-center font-mono tracking-wider"
              />

              {(errorMessage || localError) && (
                <div className="flex items-center gap-2 text-destructive text-sm justify-center">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMessage || localError}</span>
                </div>
              )}

              <Button onClick={handleBackupCode} disabled={loading || !backupCode.trim()} className="w-full">
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Use Backup Code
              </Button>
            </>
          )}

          <div className="flex items-center justify-between pt-2">
            <Button
              variant="link"
              size="sm"
              className="text-xs p-0 h-auto"
              onClick={() => {
                setUseBackup(!useBackup);
                setCode("");
                setBackupCode("");
                setLocalError("");
              }}
            >
              <Key className="w-3 h-3 mr-1" />
              {useBackup ? "Use authenticator app" : "Use backup code"}
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
