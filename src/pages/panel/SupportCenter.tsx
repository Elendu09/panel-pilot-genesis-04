import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  MessageSquare, 
  Search, 
  Plus, 
  Clock, 
  AlertCircle, 
  CheckCircle,
  Send,
  Users,
  HeadphonesIcon,
  Inbox
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTenant } from "@/hooks/useTenant";

interface TicketMessage {
  id: string;
  content: string;
  sender: string;
  sender_type: 'user' | 'admin' | 'panel_owner';
  created_at: string;
}

interface Ticket {
  id: string;
  subject: string;
  status: string;
  priority: string;
  ticket_type: string;
  created_at: string;
  updated_at: string;
  messages: TicketMessage[];
  user?: {
    email: string;
    full_name: string;
  };
}

const SupportCenter = () => {
  const { toast } = useToast();
  const { profile } = useAuth();
  const { panel } = useTenant();
  
  const [activeTab, setActiveTab] = useState("customer");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [newMessage, setNewMessage] = useState("");
  
  // Customer tickets (user_to_panel)
  const [customerTickets, setCustomerTickets] = useState<Ticket[]>([]);
  const [loadingCustomerTickets, setLoadingCustomerTickets] = useState(true);
  
  // Platform tickets (panel_to_admin)
  const [platformTickets, setPlatformTickets] = useState<Ticket[]>([]);
  const [loadingPlatformTickets, setLoadingPlatformTickets] = useState(true);
  
  // New platform ticket dialog
  const [newTicketDialogOpen, setNewTicketDialogOpen] = useState(false);
  const [newTicketSubject, setNewTicketSubject] = useState("");
  const [newTicketCategory, setNewTicketCategory] = useState("technical");
  const [newTicketPriority, setNewTicketPriority] = useState("medium");
  const [newTicketMessage, setNewTicketMessage] = useState("");
  const [submittingTicket, setSubmittingTicket] = useState(false);

  useEffect(() => {
    if (panel?.id) {
      fetchCustomerTickets();
    }
    if (profile?.id) {
      fetchPlatformTickets();
    }
  }, [panel?.id, profile?.id]);

  const fetchCustomerTickets = async () => {
    if (!panel?.id) return;
    setLoadingCustomerTickets(true);
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('panel_id', panel.id)
        .eq('ticket_type', 'user_to_panel')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCustomerTickets((data || []).map(ticket => ({
        ...ticket,
        messages: Array.isArray(ticket.messages) ? ticket.messages as unknown as TicketMessage[] : []
      })));
    } catch (error) {
      console.error('Error fetching customer tickets:', error);
    } finally {
      setLoadingCustomerTickets(false);
    }
  };

  const fetchPlatformTickets = async () => {
    if (!profile?.id) return;
    setLoadingPlatformTickets(true);
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', profile.id)
        .eq('ticket_type', 'panel_to_admin')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPlatformTickets((data || []).map(ticket => ({
        ...ticket,
        messages: Array.isArray(ticket.messages) ? ticket.messages as unknown as TicketMessage[] : []
      })));
    } catch (error) {
      console.error('Error fetching platform tickets:', error);
    } finally {
      setLoadingPlatformTickets(false);
    }
  };

  const handleCreatePlatformTicket = async () => {
    if (!profile?.id || !newTicketSubject.trim() || !newTicketMessage.trim()) return;

    setSubmittingTicket(true);
    try {
      const initialMessage: TicketMessage = {
        id: crypto.randomUUID(),
        content: newTicketMessage,
        sender: profile.full_name || profile.email,
        sender_type: 'panel_owner',
        created_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('support_tickets')
        .insert({
          user_id: profile.id,
          panel_id: panel?.id,
          subject: `[${newTicketCategory.toUpperCase()}] ${newTicketSubject}`,
          priority: newTicketPriority,
          status: 'open',
          ticket_type: 'panel_to_admin',
          messages: [initialMessage] as any
        });

      if (error) throw error;

      toast({
        title: "Ticket Created",
        description: "Your support ticket has been submitted to the platform admin."
      });

      setNewTicketDialogOpen(false);
      setNewTicketSubject("");
      setNewTicketMessage("");
      setNewTicketCategory("technical");
      setNewTicketPriority("medium");
      fetchPlatformTickets();
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create support ticket"
      });
    } finally {
      setSubmittingTicket(false);
    }
  };

  const handleSendReply = async (ticket: Ticket, isPlatformTicket: boolean) => {
    if (!newMessage.trim()) return;

    try {
      const currentMessages = ticket.messages || [];
      const newMessageObj: TicketMessage = {
        id: crypto.randomUUID(),
        content: newMessage,
        sender: profile?.full_name || 'Panel Owner',
        sender_type: 'panel_owner',
        created_at: new Date().toISOString()
      };

      await supabase
        .from('support_tickets')
        .update({
          messages: [...currentMessages, newMessageObj] as any
        })
        .eq('id', ticket.id);

      toast({
        title: "Reply Sent",
        description: isPlatformTicket 
          ? "Your reply has been sent to platform support."
          : "Your reply has been sent to the customer."
      });

      setNewMessage("");
      if (isPlatformTicket) {
        fetchPlatformTickets();
      } else {
        fetchCustomerTickets();
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send reply"
      });
    }
  };

  const filterTickets = (tickets: Ticket[]) => {
    return tickets.filter(ticket => {
      const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === "all" || ticket.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "destructive";
      case "in_progress": return "secondary";
      case "resolved": return "default";
      default: return "secondary";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-500";
      case "medium": return "text-amber-500";
      case "low": return "text-emerald-500";
      default: return "text-muted-foreground";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString() + " " + 
           new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderTicketList = (tickets: Ticket[], loading: boolean, isPlatformTicket: boolean) => {
    const filteredList = filterTickets(tickets);

    return (
      <Card className="bg-gradient-card border-border shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {isPlatformTicket ? 'Platform Tickets' : 'Customer Tickets'}
            <div className="flex space-x-2 text-sm">
              <Badge variant="destructive">{tickets.filter(t => t.status === 'open').length}</Badge>
              <Badge variant="secondary">{tickets.filter(t => t.status === 'in_progress').length}</Badge>
            </div>
          </CardTitle>
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex space-x-2">
              {["all", "open", "in_progress", "resolved"].map((status) => (
                <Button
                  key={status}
                  variant={filterStatus === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus(status)}
                >
                  {status === "all" ? "All" : status === "in_progress" ? "In Progress" : status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-1 max-h-[500px] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">Loading tickets...</div>
            ) : filteredList.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Inbox className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No tickets found</p>
              </div>
            ) : (
              filteredList.map((ticket) => (
                <div
                  key={ticket.id}
                  className={`p-4 cursor-pointer border-b border-border hover:bg-accent transition-colors ${
                    selectedTicket?.id === ticket.id ? 'bg-accent' : ''
                  }`}
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-sm truncate">{ticket.subject}</h3>
                    <Badge variant={getStatusColor(ticket.status)} className="text-xs shrink-0 ml-2">
                      {ticket.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{formatDate(ticket.created_at)}</span>
                    <div className="flex items-center space-x-2">
                      <AlertCircle className={`w-3 h-3 ${getPriorityColor(ticket.priority)}`} />
                      <span className={getPriorityColor(ticket.priority)}>{ticket.priority}</span>
                      <MessageSquare className="w-3 h-3 ml-2" />
                      <span>{ticket.messages?.length || 0}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderTicketDetails = (isPlatformTicket: boolean) => {
    if (!selectedTicket) {
      return (
        <Card className="bg-gradient-card border-border shadow-card h-96">
          <CardContent className="flex items-center justify-center h-full">
            <div className="text-center text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Select a ticket to view details</p>
            </div>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="bg-gradient-card border-border shadow-card h-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{selectedTicket.subject}</CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant={getStatusColor(selectedTicket.status)}>
                {selectedTicket.status}
              </Badge>
              <Badge variant="outline" className={getPriorityColor(selectedTicket.priority)}>
                {selectedTicket.priority} priority
              </Badge>
            </div>
          </div>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-2">
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>Created {formatDate(selectedTicket.created_at)}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col h-full">
          <div className="flex-1 space-y-4 mb-4 max-h-96 overflow-y-auto">
            {selectedTicket.messages?.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No messages yet
              </div>
            ) : (
              selectedTicket.messages?.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender_type === 'panel_owner' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender_type === 'panel_owner'
                        ? 'bg-primary text-primary-foreground'
                        : message.sender_type === 'admin'
                        ? 'bg-violet-500/20 text-violet-400'
                        : 'bg-muted'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-medium">{message.sender}</span>
                      <span className="text-xs opacity-70">
                        {formatDate(message.created_at)}
                      </span>
                    </div>
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <div className="border-t border-border pt-4">
            <div className="flex space-x-2">
              <Textarea
                placeholder="Type your reply..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1"
                rows={3}
              />
              <div className="flex flex-col space-y-2">
                <Button
                  onClick={() => handleSendReply(selectedTicket, isPlatformTicket)}
                  disabled={!newMessage.trim()}
                  className="bg-gradient-primary hover:shadow-glow"
                >
                  <Send className="w-4 h-4 mr-1" />
                  Send
                </Button>
                {!isPlatformTicket && (
                  <Button variant="outline" size="sm">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Resolve
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Support Center</h1>
          <p className="text-muted-foreground">Manage customer tickets and platform support</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(val) => { setActiveTab(val); setSelectedTicket(null); }}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="customer" className="gap-2">
            <Users className="w-4 h-4" />
            Customer Tickets
          </TabsTrigger>
          <TabsTrigger value="platform" className="gap-2">
            <HeadphonesIcon className="w-4 h-4" />
            Platform Support
          </TabsTrigger>
        </TabsList>

        <TabsContent value="customer" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              {renderTicketList(customerTickets, loadingCustomerTickets, false)}
            </div>
            <div className="lg:col-span-2">
              {renderTicketDetails(false)}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="platform" className="mt-6">
          <div className="mb-4">
            <Button 
              onClick={() => setNewTicketDialogOpen(true)}
              className="bg-gradient-primary hover:shadow-glow"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Platform Ticket
            </Button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              {renderTicketList(platformTickets, loadingPlatformTickets, true)}
            </div>
            <div className="lg:col-span-2">
              {renderTicketDetails(true)}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* New Platform Ticket Dialog */}
      <Dialog open={newTicketDialogOpen} onOpenChange={setNewTicketDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HeadphonesIcon className="w-5 h-5" />
              Contact Platform Support
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={newTicketCategory} onValueChange={setNewTicketCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="billing">Billing</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="feature_request">Feature Request</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={newTicketPriority} onValueChange={setNewTicketPriority}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input
                placeholder="Brief description of your issue"
                value={newTicketSubject}
                onChange={(e) => setNewTicketSubject(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea
                placeholder="Describe your issue in detail..."
                value={newTicketMessage}
                onChange={(e) => setNewTicketMessage(e.target.value)}
                rows={5}
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setNewTicketDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreatePlatformTicket}
              disabled={submittingTicket || !newTicketSubject.trim() || !newTicketMessage.trim()}
              className="bg-gradient-primary"
            >
              {submittingTicket ? "Submitting..." : "Submit Ticket"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SupportCenter;