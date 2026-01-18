import { useState } from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Building2, 
  Copy, 
  CheckCircle, 
  MessageCircle, 
  Send, 
  Mail,
  Upload,
  Clock,
  AlertTriangle,
  ExternalLink,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ManualTransferConfig {
  enabled: boolean;
  bankDetails: string;
  instructions: string;
  proofChannels: {
    whatsapp?: { enabled: boolean; phoneNumber: string };
    telegram?: { enabled: boolean; username: string };
    support?: { enabled: boolean; email: string };
  };
  processingTime: string;
  minAmount?: number;
  maxAmount?: number;
}

interface ManualTransferDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: ManualTransferConfig;
  amount: number;
  panelId: string;
  buyerId: string;
  panelName?: string;
  onSuccess?: (transactionId: string) => void;
}

export const ManualTransferDialog = ({
  open,
  onOpenChange,
  config,
  amount,
  panelId,
  buyerId,
  panelName = "Panel",
  onSuccess,
}: ManualTransferDialogProps) => {
  const [step, setStep] = useState<'details' | 'proof' | 'submitted'>('details');
  const [transactionRef, setTransactionRef] = useState("");
  const [notes, setNotes] = useState("");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [createdTransactionId, setCreatedTransactionId] = useState<string | null>(null);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
    toast({ title: "Copied!", description: `${fieldName} copied to clipboard` });
  };

  const handleSubmitProof = async (channel: 'whatsapp' | 'telegram' | 'support') => {
    setSubmitting(true);

    try {
      // Create pending transaction
      const { data: transaction, error } = await supabase
        .from('transactions')
        .insert([{
          user_id: buyerId,
          panel_id: panelId,
          amount: amount,
          type: 'deposit',
          payment_method: 'manual_transfer',
          status: 'pending' as const,
          description: `Manual bank transfer - Ref: ${transactionRef}`,
        }])
        .select()
        .single();

      if (error) throw error;

      setCreatedTransactionId(transaction.id);

      // Create notification for panel owner
      await supabase
        .from('panel_notifications')
        .insert({
          panel_id: panelId,
          title: 'New Manual Transfer Pending',
          message: `A deposit of $${amount.toFixed(2)} is pending verification. Reference: ${transactionRef}`,
          type: 'payment',
        });

      // Build proof message
      const proofMessage = encodeURIComponent(
        `🏦 Manual Transfer Payment Proof\n\n` +
        `📋 Transaction ID: ${transaction.id}\n` +
        `💰 Amount: $${amount.toFixed(2)}\n` +
        `🔖 Reference: ${transactionRef}\n` +
        `📝 Notes: ${notes || 'N/A'}\n\n` +
        `Please verify my payment. Thank you!`
      );

      // Open appropriate channel
      let url = '';
      switch (channel) {
        case 'whatsapp':
          const whatsappNumber = config.proofChannels.whatsapp?.phoneNumber?.replace(/\D/g, '');
          url = `https://wa.me/${whatsappNumber}?text=${proofMessage}`;
          break;
        case 'telegram':
          const telegramUsername = config.proofChannels.telegram?.username?.replace('@', '');
          url = `https://t.me/${telegramUsername}?text=${proofMessage}`;
          break;
        case 'support':
          const email = config.proofChannels.support?.email;
          url = `mailto:${email}?subject=Payment Proof - $${amount.toFixed(2)}&body=${decodeURIComponent(proofMessage)}`;
          break;
      }

      if (url) {
        window.open(url, '_blank');
      }

      setStep('submitted');
      onSuccess?.(transaction.id);
      
      toast({ 
        title: "Transfer Submitted", 
        description: "Your payment is pending verification. We'll notify you once confirmed." 
      });

    } catch (error: any) {
      console.error('Error submitting manual transfer:', error);
      toast({ 
        variant: "destructive", 
        title: "Error", 
        description: error.message || "Failed to submit transfer" 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderBankDetails = () => (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2 text-primary">
          <Building2 className="w-5 h-5" />
          <span className="font-semibold">Bank Details</span>
        </div>
        <div className="relative">
          <pre className="whitespace-pre-wrap text-sm bg-background/50 p-3 rounded-lg border">
            {config.bankDetails || "No bank details configured"}
          </pre>
          <Button
            size="sm"
            variant="ghost"
            className="absolute top-2 right-2"
            onClick={() => copyToClipboard(config.bankDetails, "Bank details")}
          >
            {copiedField === "Bank details" ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            Manual Bank Transfer
          </DialogTitle>
          <DialogDescription>
            Transfer ${amount.toFixed(2)} to {panelName}'s bank account
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-2">
          {step === 'details' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Amount Summary */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                <span className="text-muted-foreground">Amount to Transfer</span>
                <span className="text-2xl font-bold">${amount.toFixed(2)}</span>
              </div>

              {/* Bank Details */}
              {renderBankDetails()}

              {/* Instructions */}
              {config.instructions && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-2 text-amber-500 mb-2">
                      <AlertTriangle className="w-4 h-4 mt-0.5" />
                      <span className="font-medium text-sm">Important Instructions</span>
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {config.instructions}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Processing Time */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Estimated processing time: <strong>{config.processingTime || '12-24 hours'}</strong></span>
              </div>

              <Button 
                className="w-full gap-2" 
                onClick={() => setStep('proof')}
              >
                I've Made the Transfer
                <ExternalLink className="w-4 h-4" />
              </Button>
            </motion.div>
          )}

          {step === 'proof' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {/* Transaction Reference */}
              <div className="space-y-2">
                <Label>Transaction Reference / Receipt Number</Label>
                <Input
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  placeholder="Enter your bank transaction reference"
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label>Additional Notes (Optional)</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional information..."
                  rows={2}
                />
              </div>

              <Separator />

              {/* Proof Submission Channels */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Send Payment Proof Via:</Label>
                
                <div className="grid gap-2">
                  {config.proofChannels?.whatsapp?.enabled && (
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-3 h-12 border-green-500/30 hover:bg-green-500/10"
                      onClick={() => handleSubmitProof('whatsapp')}
                      disabled={submitting || !transactionRef}
                    >
                      {submitting ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <MessageCircle className="w-5 h-5 text-green-500" />
                      )}
                      <div className="text-left">
                        <span className="font-medium">WhatsApp</span>
                        <p className="text-xs text-muted-foreground">
                          {config.proofChannels.whatsapp.phoneNumber}
                        </p>
                      </div>
                    </Button>
                  )}

                  {config.proofChannels?.telegram?.enabled && (
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-3 h-12 border-blue-500/30 hover:bg-blue-500/10"
                      onClick={() => handleSubmitProof('telegram')}
                      disabled={submitting || !transactionRef}
                    >
                      {submitting ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5 text-blue-500" />
                      )}
                      <div className="text-left">
                        <span className="font-medium">Telegram</span>
                        <p className="text-xs text-muted-foreground">
                          @{config.proofChannels.telegram.username}
                        </p>
                      </div>
                    </Button>
                  )}

                  {config.proofChannels?.support?.enabled && (
                    <Button
                      variant="outline"
                      className="w-full justify-start gap-3 h-12 border-purple-500/30 hover:bg-purple-500/10"
                      onClick={() => handleSubmitProof('support')}
                      disabled={submitting || !transactionRef}
                    >
                      {submitting ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Mail className="w-5 h-5 text-purple-500" />
                      )}
                      <div className="text-left">
                        <span className="font-medium">Email Support</span>
                        <p className="text-xs text-muted-foreground">
                          {config.proofChannels.support.email}
                        </p>
                      </div>
                    </Button>
                  )}
                </div>

                {!transactionRef && (
                  <p className="text-xs text-amber-500 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Please enter your transaction reference first
                  </p>
                )}
              </div>

              <Button 
                variant="ghost" 
                className="w-full" 
                onClick={() => setStep('details')}
              >
                Back to Bank Details
              </Button>
            </motion.div>
          )}

          {step === 'submitted' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-4 py-6"
            >
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Transfer Submitted!</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Your payment is pending verification. We'll credit your balance once confirmed.
                </p>
              </div>
              
              {createdTransactionId && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">Transaction ID</p>
                  <p className="font-mono text-sm">{createdTransactionId.slice(0, 8)}...</p>
                </div>
              )}

              <Badge variant="secondary" className="gap-1">
                <Clock className="w-3 h-3" />
                {config.processingTime || '12-24 hours'}
              </Badge>

              <Button className="w-full" onClick={() => onOpenChange(false)}>
                Done
              </Button>
            </motion.div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ManualTransferDialog;
