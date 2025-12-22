import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Mail, Inbox, Rocket, CheckCircle2, ArrowLeft, RefreshCw, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EmailVerificationKanbanProps {
  email: string;
  onBack: () => void;
  redirectTo?: string;
  panelBranding?: {
    name?: string;
    logo_url?: string;
    primary_color?: string;
  };
}

const EmailVerificationKanban = ({ email, onBack, redirectTo = '/panel/onboarding', panelBranding }: EmailVerificationKanbanProps) => {
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resending, setResending] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(3);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Cooldown timer for resend
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Auto-check verification status every 3 seconds
  useEffect(() => {
    const checkVerification = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user?.email_confirmed_at) {
        setIsVerified(true);
        toast({
          title: "Email Verified!",
          description: "Your account has been verified successfully."
        });
      }
    };

    // Initial check
    checkVerification();

    // Set up polling interval
    const interval = setInterval(checkVerification, 3000);

    // Also listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user?.email_confirmed_at) {
        setIsVerified(true);
      }
    });

    return () => {
      clearInterval(interval);
      subscription.unsubscribe();
    };
  }, [toast]);

  // Redirect countdown when verified
  useEffect(() => {
    if (isVerified && redirectCountdown > 0) {
      const timer = setTimeout(() => setRedirectCountdown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else if (isVerified && redirectCountdown === 0) {
      navigate(redirectTo, { replace: true });
    }
  }, [isVerified, redirectCountdown, navigate, redirectTo]);

  const handleResendEmail = async () => {
    if (resendCooldown > 0) return;
    
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/`
        }
      });

      if (error) {
        toast({
          variant: "destructive",
          title: "Failed to resend",
          description: error.message
        });
      } else {
        toast({
          title: "Email sent!",
          description: "Check your inbox for the verification link."
        });
        setResendCooldown(60);
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message
      });
    } finally {
      setResending(false);
    }
  };

  const steps = [
    {
      id: 1,
      title: "Email Sent",
      description: `We sent a verification email to`,
      highlight: email,
      icon: Mail,
      status: 'completed',
      color: 'from-emerald-500 to-emerald-600'
    },
    {
      id: 2,
      title: "Check Inbox",
      description: "Click the verification link in the email to activate your account",
      icon: Inbox,
      status: isVerified ? 'completed' : 'current',
      color: isVerified ? 'from-emerald-500 to-emerald-600' : 'from-primary to-primary/80'
    },
    {
      id: 3,
      title: "Get Started",
      description: isVerified ? "Redirecting you to your dashboard..." : "Return here and sign in to access your account",
      icon: Rocket,
      status: isVerified ? 'current' : 'pending',
      color: isVerified ? 'from-primary to-primary/80' : 'from-muted-foreground/50 to-muted-foreground/30'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 flex items-center justify-center p-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl"
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.5, 0.3, 0.5] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
      </div>

      <div className="relative z-10 w-full max-w-4xl">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {panelBranding?.logo_url ? (
            <img src={panelBranding.logo_url} alt={panelBranding.name} className="h-12 mx-auto mb-4" />
          ) : (
            <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center ${
              isVerified 
                ? 'bg-gradient-to-br from-emerald-500 to-emerald-600' 
                : 'bg-gradient-to-br from-primary to-primary/60'
            }`}>
              {isVerified ? (
                <Sparkles className="w-8 h-8 text-white" />
              ) : (
                <Mail className="w-8 h-8 text-primary-foreground" />
              )}
            </div>
          )}
          <AnimatePresence mode="wait">
            {isVerified ? (
              <motion.div
                key="verified"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <h1 className="text-3xl font-bold mb-2 text-emerald-500">Email Verified!</h1>
                <p className="text-muted-foreground">
                  Redirecting in {redirectCountdown} second{redirectCountdown !== 1 ? 's' : ''}...
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="unverified"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <h1 className="text-3xl font-bold mb-2">Verify Your Email</h1>
                <p className="text-muted-foreground">Complete these steps to activate your account</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Kanban Steps */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="relative group"
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-border to-transparent z-0" />
              )}

              {/* Card */}
              <div className={`
                relative p-6 rounded-2xl border backdrop-blur-xl transition-all duration-300
                ${step.status === 'completed' 
                  ? 'bg-emerald-500/10 border-emerald-500/30' 
                  : step.status === 'current'
                    ? 'bg-primary/10 border-primary/30 ring-2 ring-primary/20'
                    : 'bg-card/50 border-border/50'
                }
                ${step.status === 'current' ? 'scale-105 shadow-lg shadow-primary/10' : ''}
              `}>
                {/* Step number badge */}
                <div className={`
                  absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                  ${step.status === 'completed' 
                    ? 'bg-emerald-500 text-white' 
                    : step.status === 'current'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }
                `}>
                  {step.status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> : step.id}
                </div>

                {/* Icon */}
                <div className={`
                  w-14 h-14 rounded-xl mb-4 flex items-center justify-center
                  bg-gradient-to-br ${step.color}
                  ${step.status === 'current' ? 'animate-pulse' : ''}
                `}>
                  <step.icon className="w-7 h-7 text-white" />
                </div>

                {/* Content */}
                <h3 className={`
                  text-lg font-semibold mb-2
                  ${step.status === 'pending' ? 'text-muted-foreground' : 'text-foreground'}
                `}>
                  {step.title}
                </h3>
                <p className={`
                  text-sm
                  ${step.status === 'pending' ? 'text-muted-foreground/70' : 'text-muted-foreground'}
                `}>
                  {step.description}
                </p>
                {step.highlight && (
                  <p className="text-sm font-medium text-primary mt-1 break-all">
                    {step.highlight}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Actions */}
        <AnimatePresence mode="wait">
          {isVerified ? (
            <motion.div
              key="verified-actions"
              className="flex flex-col items-center justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-2 text-emerald-500">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-medium">Account activated successfully!</span>
              </div>
              <Button
                onClick={() => navigate(redirectTo, { replace: true })}
                className="min-w-[200px] bg-emerald-500 hover:bg-emerald-600"
              >
                <Rocket className="w-4 h-4 mr-2" />
                Go to Dashboard Now
              </Button>
            </motion.div>
          ) : (
            <motion.div 
              key="unverified-actions"
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Button
                variant="outline"
                onClick={onBack}
                className="min-w-[160px]"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Sign In
              </Button>

              <Button
                onClick={handleResendEmail}
                disabled={resendCooldown > 0 || resending}
                className="min-w-[160px]"
              >
                {resending ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Mail className="w-4 h-4 mr-2" />
                )}
                {resendCooldown > 0 
                  ? `Resend in ${resendCooldown}s` 
                  : 'Resend Email'
                }
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Help text */}
        {!isVerified && (
          <motion.p 
            className="text-center text-sm text-muted-foreground mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            Didn't receive the email? Check your spam folder or try resending.
          </motion.p>
        )}
      </div>
    </div>
  );
};

export default EmailVerificationKanban;
