import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mail, Users, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BulkEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedCount: number;
  onSend: (subject: string, message: string) => void;
}

const emailTemplates = [
  { id: "welcome", name: "Welcome", subject: "Welcome to our platform!", message: "Hello {name},\n\nWelcome to our platform! We're excited to have you on board.\n\nBest regards,\nThe Team" },
  { id: "promotion", name: "Promotion", subject: "Special Offer Just For You!", message: "Hello {name},\n\nWe have a special offer for you! Use code SAVE20 for 20% off your next order.\n\nBest regards,\nThe Team" },
  { id: "balance", name: "Balance Reminder", subject: "Low Balance Alert", message: "Hello {name},\n\nYour account balance is running low. Top up now to continue using our services.\n\nBest regards,\nThe Team" },
  { id: "custom", name: "Custom", subject: "", message: "" },
];

export const BulkEmailDialog = ({
  open,
  onOpenChange,
  selectedCount,
  onSend,
}: BulkEmailDialogProps) => {
  const { toast } = useToast();
  const [template, setTemplate] = useState("custom");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleTemplateChange = (templateId: string) => {
    setTemplate(templateId);
    const selected = emailTemplates.find(t => t.id === templateId);
    if (selected) {
      setSubject(selected.subject);
      setMessage(selected.message);
    }
  };

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) {
      toast({ variant: "destructive", title: "Error", description: "Please fill in all fields" });
      return;
    }

    setSending(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      onSend(subject, message);
      toast({ title: "Emails Sent", description: `Successfully sent to ${selectedCount} customers` });
      onOpenChange(false);
      setSubject("");
      setMessage("");
      setTemplate("custom");
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to send emails" });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Send Bulk Email
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Sending to <Badge variant="secondary">{selectedCount} customers</Badge>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label>Email Template</Label>
            <Select value={template} onValueChange={handleTemplateChange}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Choose a template" />
              </SelectTrigger>
              <SelectContent>
                {emailTemplates.map(t => (
                  <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Email subject line"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here... Use {name} for personalization"
              className="mt-1 min-h-[150px]"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Use {"{name}"} to personalize with customer's name
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={sending} className="gap-2">
            <Send className="w-4 h-4" />
            {sending ? "Sending..." : `Send to ${selectedCount} customers`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
