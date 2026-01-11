import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageSquare, 
  Plus, 
  Clock, 
  CheckCircle,
  AlertCircle,
  XCircle,
  Send,
  Search,
  Filter,
  Inbox,
  Loader2,
  AlertTriangle,
  LogIn
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useBuyerAuth } from "@/contexts/BuyerAuthContext";
import { useTenant } from "@/hooks/useTenant";
import BuyerLayout from "./BuyerLayout";
import { FloatingChatWidget } from "@/components/storefront/FloatingChatWidget";

interface Ticket {
  id: string;
  subject: string;
  status: string;
  priority: string;
  ticket_type: string;
  messages: any[];
  created_at: string;
  updated_at: string;
}

interface Message {
  sender: 'buyer' | 'support';
  content: string;
  timestamp: string;
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  open: { label: "Open", color: "bg-primary/10 text-primary border-primary/20", icon: Inbox },
  in_progress: { label: "In Progress", color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20", icon: Clock },
  resolved: { label: "Resolved", color: "bg-green-500/10 text-green-500 border-green-500/20", icon: CheckCircle },
  closed: { label: "Closed", color: "bg-muted text-muted-foreground border-border", icon: XCircle },
};

const priorityConfig: Record<string, string> = {
  low: "bg-muted text-muted-foreground",
  medium: "bg-yellow-500/10 text-yellow-500",
  high: "bg-orange-500/10 text-orange-500",
  urgent: "bg-red-500/10 text-red-500",
};

const BuyerSupport = () => {
  const { buyer, loading: authLoading } = useBuyerAuth();
  const { panel, loading: panelLoading } = useTenant();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [isTicketViewOpen, setIsTicketViewOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [newMessage, setNewMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // New ticket form
  const [newTicket, setNewTicket] = useState({
    subject: "",
    priority: "medium",
    message: ""
  });

  useEffect(() => {
    fetchTickets();
  }, [buyer?.id, panel?.id]);

  const fetchTickets = async () => {
    if (!buyer?.id || !panel?.id) return;
    
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('panel_id', panel.id)
        .eq('user_id', buyer.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      // Transform data to match Ticket type
      const transformedTickets = (data || []).map(ticket => ({
        ...ticket,
        messages: Array.isArray(ticket.messages) ? ticket.messages : []
      })) as Ticket[];
      setTickets(transformedTickets);
    } catch (error: any) {
      console.error('Error fetching tickets:', error);
      setError('Failed to load your support tickets. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async () => {
    if (!newTicket.subject || !newTicket.message) {
      toast({ variant: "destructive", title: "Please fill in all fields" });
      return;
    }

    if (!buyer?.id || !panel?.id) return;

    setSubmitting(true);
    try {
      const initialMessage: Message = {
        sender: 'buyer',
        content: newTicket.message,
        timestamp: new Date().toISOString()
      };

      const { error } = await supabase
        .from('support_tickets')
        .insert([{
          panel_id: panel.id,
          user_id: buyer.id,
          subject: newTicket.subject,
          priority: newTicket.priority,
          ticket_type: 'user_to_panel',
          status: 'open',
          messages: [initialMessage] as any
        }]);

      if (error) throw error;

      toast({ title: "Ticket Created", description: "We'll respond as soon as possible" });
      setIsNewTicketOpen(false);
      setNewTicket({ subject: "", priority: "medium", message: "" });
      fetchTickets();
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast({ variant: "destructive", title: "Error", description: "Failed to create ticket" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket) return;

    setSubmitting(true);
    try {
      const newMsg: Message = {
        sender: 'buyer',
        content: newMessage,
        timestamp: new Date().toISOString()
      };

      const updatedMessages = [...(selectedTicket.messages || []), newMsg];

      const { error } = await supabase
        .from('support_tickets')
        .update({ 
          messages: updatedMessages,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedTicket.id);

      if (error) throw error;

      setSelectedTicket({ ...selectedTicket, messages: updatedMessages });
      setTickets(prev => prev.map(t => 
        t.id === selectedTicket.id ? { ...t, messages: updatedMessages } : t
      ));
      setNewMessage("");
      toast({ title: "Message sent" });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({ variant: "destructive", title: "Error", description: "Failed to send message" });
    } finally {
      setSubmitting(false);
    }
  };

  const openTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsTicketViewOpen(true);
  };

  // Filter tickets
  const filteredTickets = tickets.filter(ticket => {
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    const matchesSearch = ticket.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Group tickets by status for Kanban view
  const kanbanColumns = [
    { id: 'open', title: 'Open', tickets: filteredTickets.filter(t => t.status === 'open') },
    { id: 'in_progress', title: 'In Progress', tickets: filteredTickets.filter(t => t.status === 'in_progress') },
    { id: 'resolved', title: 'Resolved', tickets: filteredTickets.filter(t => t.status === 'resolved') },
    { id: 'closed', title: 'Closed', tickets: filteredTickets.filter(t => t.status === 'closed') },
  ];

  // Loading state - use neutral color to prevent blue flash
  if (panelLoading || authLoading) {
    return (
      <BuyerLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </BuyerLayout>
    );
  }

  // Not authenticated
  if (!buyer) {
    return (
      <BuyerLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <LogIn className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold mb-2">Login Required</h2>
          <p className="text-muted-foreground mb-4 text-sm">Please sign in to access support.</p>
          <Button asChild>
            <a href="/auth">Sign In</a>
          </Button>
        </div>
      </BuyerLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <BuyerLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-amber-500" />
          </div>
          <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
          <p className="text-muted-foreground mb-4 text-sm">{error}</p>
          <Button onClick={fetchTickets}>Try Again</Button>
        </div>
      </BuyerLayout>
    );
  }

  return (
    <BuyerLayout>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
              Support Center
            </h1>
            <p className="text-muted-foreground">Get help with your orders and account</p>
          </div>
          <Button onClick={() => setIsNewTicketOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            New Ticket
          </Button>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col md:flex-row gap-4"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search tickets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card/50"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tickets</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* Kanban Board */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : filteredTickets.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Card className="glass-card">
              <CardContent className="py-12 text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No tickets yet</h3>
                <p className="text-muted-foreground mb-4">Create your first support ticket</p>
                <Button onClick={() => setIsNewTicketOpen(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  New Ticket
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {kanbanColumns.map((column, colIndex) => {
              const config = statusConfig[column.id];
              const StatusIcon = config.icon;
              
              return (
                <motion.div
                  key={column.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: colIndex * 0.1 }}
                  className="space-y-3"
                >
                  <div className="flex items-center gap-2 px-2">
                    <StatusIcon className="w-4 h-4 text-muted-foreground" />
                    <h3 className="font-semibold">{column.title}</h3>
                    <Badge variant="secondary" className="ml-auto">{column.tickets.length}</Badge>
                  </div>
                  
                  <div className="space-y-2 min-h-[200px] p-2 rounded-xl bg-muted/30">
                    <AnimatePresence>
                      {column.tickets.map((ticket, ticketIndex) => (
                        <motion.div
                          key={ticket.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ delay: ticketIndex * 0.05 }}
                        >
                          <Card 
                            className="glass-card cursor-pointer hover:shadow-lg transition-all duration-200"
                            onClick={() => openTicket(ticket)}
                          >
                            <CardContent className="p-3 space-y-2">
                              <p className="font-medium text-sm line-clamp-2">{ticket.subject}</p>
                              <div className="flex items-center justify-between">
                                <Badge className={cn("text-xs", priorityConfig[ticket.priority])}>
                                  {ticket.priority}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(ticket.created_at).toLocaleDateString()}
                                </span>
                              </div>
                              {ticket.messages?.length > 0 && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <MessageSquare className="w-3 h-3" />
                                  {ticket.messages.length} message{ticket.messages.length > 1 ? 's' : ''}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    
                    {column.tickets.length === 0 && (
                      <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
                        No tickets
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* New Ticket Dialog */}
        <Dialog open={isNewTicketOpen} onOpenChange={setIsNewTicketOpen}>
          <DialogContent className="glass-card border-primary/20">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <MessageSquare className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <DialogTitle>Create New Ticket</DialogTitle>
                  <DialogDescription>Describe your issue and we'll help you</DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input
                  placeholder="Brief description of your issue"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                  className="border-border focus:border-primary focus-visible:ring-primary/30"
                />
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select 
                  value={newTicket.priority} 
                  onValueChange={(v) => setNewTicket({ ...newTicket, priority: v })}
                >
                  <SelectTrigger className="border-border focus:ring-primary/30 focus:border-primary">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Message</Label>
                <Textarea
                  placeholder="Describe your issue in detail..."
                  value={newTicket.message}
                  onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                  rows={4}
                  className="border-border focus:border-primary focus-visible:ring-primary/30"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNewTicketOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateTicket} disabled={submitting} className="bg-primary hover:bg-primary/90">
                {submitting ? "Creating..." : "Create Ticket"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Ticket View Dialog */}
        <Dialog open={isTicketViewOpen} onOpenChange={setIsTicketViewOpen}>
          <DialogContent className="glass-card max-w-lg max-h-[80vh] flex flex-col">
            <DialogHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <DialogTitle className="pr-8">{selectedTicket?.subject}</DialogTitle>
                  <div className="flex items-center gap-2">
                    <Badge className={cn(statusConfig[selectedTicket?.status || 'open'].color)}>
                      {statusConfig[selectedTicket?.status || 'open'].label}
                    </Badge>
                    <Badge className={cn(priorityConfig[selectedTicket?.priority || 'medium'])}>
                      {selectedTicket?.priority}
                    </Badge>
                  </div>
                </div>
              </div>
            </DialogHeader>
            
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4 py-4">
                {(selectedTicket?.messages || []).map((msg: Message, index: number) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      "p-3 rounded-xl max-w-[85%]",
                      msg.sender === 'buyer'
                        ? "ml-auto bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p className={cn(
                      "text-xs mt-1",
                      msg.sender === 'buyer' ? "text-primary-foreground/70" : "text-muted-foreground"
                    )}>
                      {new Date(msg.timestamp).toLocaleString()}
                    </p>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>

            {selectedTicket?.status !== 'closed' && (
              <div className="flex gap-2 pt-4 border-t">
                <Input
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="border-border focus:border-primary focus-visible:ring-primary/30"
                />
                <Button onClick={handleSendMessage} disabled={submitting || !newMessage.trim()} className="bg-primary hover:bg-primary/90">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
      
      {/* Live Chat Widget for instant AI support */}
      {panel?.id && (
        <FloatingChatWidget 
          panelId={panel.id} 
          panelName={panel.name}
          pageContext="Buyer Support Page"
          enableAI={true}
        />
      )}
    </BuyerLayout>
  );
};

export default BuyerSupport;
