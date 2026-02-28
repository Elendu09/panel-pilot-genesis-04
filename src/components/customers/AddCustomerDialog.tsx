import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  UserPlus, 
  RefreshCw, 
  Copy, 
  Eye, 
  EyeOff, 
  Check,
  AlertTriangle,
  DollarSign
} from "lucide-react";
import { generateUsername, generatePassword } from "@/lib/customer-utils";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface AddCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (customer: NewCustomer) => void;
}

export interface NewCustomer {
  fullName: string;
  email: string;
  username: string;
  password: string;
  balance: number;
  segment: 'new' | 'regular' | 'vip';
  status: 'active' | 'inactive';
  sendWelcomeEmail: boolean;
}

export function AddCustomerDialog({ open, onOpenChange, onAdd }: AddCustomerDialogProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [showPassword, setShowPassword] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    username: '',
    password: '',
    balance: '0',
    segment: 'new' as const,
    status: 'active' as const,
    sendWelcomeEmail: true,
  });

  // Auto-generate username when name changes
  useEffect(() => {
    if (formData.fullName.length >= 2) {
      setFormData(prev => ({ ...prev, username: generateUsername(formData.fullName) }));
    }
  }, [formData.fullName]);

  // Generate initial password
  useEffect(() => {
    if (open && !formData.password) {
      setFormData(prev => ({ ...prev, password: generatePassword() }));
    }
  }, [open]);

  const regenerateUsername = () => {
    if (formData.fullName) {
      setFormData(prev => ({ ...prev, username: generateUsername(formData.fullName) }));
    }
  };

  const regeneratePassword = () => {
    setFormData(prev => ({ ...prev, password: generatePassword() }));
  };

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const copyAllCredentials = async () => {
    const text = `Username: ${formData.username}\nPassword: ${formData.password}\nEmail: ${formData.email}`;
    await navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: "All credentials copied to clipboard" });
  };

  const handleSubmit = () => {
    if (!formData.fullName.trim() || !formData.email.trim()) {
      toast({ title: "Missing fields", description: "Please fill in name and email", variant: "destructive" });
      return;
    }

    if (!formData.email.includes('@')) {
      toast({ title: "Invalid email", description: "Please enter a valid email address", variant: "destructive" });
      return;
    }

    // Normalize email to lowercase
    const normalizedEmail = formData.email.trim().toLowerCase();

    onAdd({
      fullName: formData.fullName.trim(),
      email: normalizedEmail,
      username: formData.username,
      password: formData.password,
      balance: parseFloat(formData.balance) || 0,
      segment: formData.segment,
      status: formData.status,
      sendWelcomeEmail: formData.sendWelcomeEmail,
    });

    setStep('success');
  };

  const handleClose = () => {
    setStep('form');
    setFormData({
      fullName: '',
      email: '',
      username: '',
      password: generatePassword(),
      balance: '0',
      segment: 'new',
      status: 'active',
      sendWelcomeEmail: true,
    });
    onOpenChange(false);
  };

  const getInitials = () => {
    if (!formData.fullName) return '?';
    return formData.fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  const isEmailValid = formData.email === '' || formData.email.includes('@');

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-2 pt-2">
          <div className={cn(
            "w-2.5 h-2.5 rounded-full transition-colors",
            step === 'form' ? "bg-primary" : "bg-muted-foreground/30"
          )} />
          <div className={cn(
            "w-2.5 h-2.5 rounded-full transition-colors",
            step === 'success' ? "bg-green-500" : "bg-muted-foreground/30"
          )} />
        </div>

        {step === 'form' ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                Add New Customer
              </DialogTitle>
              <DialogDescription>
                Create a new customer account with login credentials
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Name with Avatar Preview */}
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary font-bold text-lg shrink-0 border border-primary/10">
                  {getInitials()}
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      placeholder="John Doe"
                      value={formData.fullName}
                      onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className={cn("mt-1", !isEmailValid && "border-destructive focus-visible:ring-destructive")}
                    />
                    {!isEmailValid && (
                      <p className="text-[11px] text-destructive mt-1">Please enter a valid email address</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Auto-generated Credentials */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-muted/40 to-muted/20 border border-border/30 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <h4 className="font-medium text-sm">Auto-generated Credentials</h4>
                </div>
                
                <div>
                  <Label htmlFor="username" className="text-sm">Username</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                      className="flex-1"
                    />
                    <Button type="button" variant="outline" size="icon" onClick={regenerateUsername} title="Regenerate">
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                    <Button 
                      type="button" variant="outline" size="icon" 
                      onClick={() => copyToClipboard(formData.username, 'username')} title="Copy"
                    >
                      {copiedField === 'username' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="password" className="text-sm">Password</Label>
                  <div className="flex gap-2 mt-1">
                    <div className="relative flex-1">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                        className="pr-10"
                      />
                      <Button
                        type="button" variant="ghost" size="icon"
                        className="absolute right-0 top-0 h-full"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                    <Button type="button" variant="outline" size="icon" onClick={regeneratePassword} title="Regenerate">
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                    <Button 
                      type="button" variant="outline" size="icon" 
                      onClick={() => copyToClipboard(formData.password, 'password')} title="Copy"
                    >
                      {copiedField === 'password' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Optional Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="balance">Initial Balance</Label>
                  <div className="relative mt-1">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="balance"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.balance}
                      onChange={(e) => setFormData(prev => ({ ...prev, balance: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label>Segment</Label>
                  <Select value={formData.segment} onValueChange={(v) => setFormData(prev => ({ ...prev, segment: v as any }))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="regular">Regular</SelectItem>
                      <SelectItem value="vip">VIP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sendEmail"
                  checked={formData.sendWelcomeEmail}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, sendWelcomeEmail: !!checked }))}
                />
                <Label htmlFor="sendEmail" className="text-sm cursor-pointer">
                  Send welcome email with login credentials
                </Label>
              </div>
            </div>

            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={handleClose} className="w-full sm:w-auto">Cancel</Button>
              <Button onClick={handleSubmit} className="w-full sm:w-auto">
                <UserPlus className="w-4 h-4 mr-2" />
                Create Customer
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-green-500">
                <Check className="w-5 h-5" />
                Customer Created Successfully
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-muted/40 to-muted/20 border border-border/30 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Full Name</span>
                  <span className="font-medium">{formData.fullName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Email</span>
                  <span className="font-medium">{formData.email}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Username</span>
                  <span className="font-mono bg-muted px-2 py-1 rounded">{formData.username}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Password</span>
                  <span className="font-mono bg-muted px-2 py-1 rounded">{formData.password}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-sm">
                <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0" />
                <span>Save these credentials now. The password won't be shown again.</span>
              </div>

              <Button onClick={copyAllCredentials} variant="outline" className="w-full">
                <Copy className="w-4 h-4 mr-2" />
                Copy All Credentials
              </Button>
            </div>

            <DialogFooter>
              <Button onClick={handleClose} className="w-full">Done</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
