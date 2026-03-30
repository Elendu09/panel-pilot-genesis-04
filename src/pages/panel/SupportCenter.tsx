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
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  Inbox,
  Book,
  MessagesSquare,
  ArrowLeft,
  Trash2,
  Edit,
  GripVertical,
  HelpCircle
} from "lucide-react";
import { KnowledgeBase } from "@/components/support/KnowledgeBase";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTenant } from "@/hooks/useTenant";
import { useIsMobile } from "@/hooks/use-mobile";
import ChatInbox from "./ChatInbox";

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
  const isMobile = useIsMobile();
  
  const [activeTab, setActiveTab] = useState("livechat");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [newMessage, setNewMessage] = useState("");
  const [ticketSheetOpen, setTicketSheetOpen] = useState(false);
  
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

  // FAQ Management state
  const [panelFaqs, setPanelFaqs] = useState<{ question: string; answer: string }[]>([]);
  const [faqDialogOpen, setFaqDialogOpen] = useState(false);
  const [editingFaqIndex, setEditingFaqIndex] = useState<number | null>(null);
  const [faqQuestion, setFaqQuestion] = useState("");
  const [faqAnswer, setFaqAnswer] = useState("");
  const [savingFaqs, setSavingFaqs] = useState(false);

  useEffect(() => {
    if (panel?.id) {
      fetchCustomerTickets();
      fetchPanelFaqs();
    }
    if (profile?.id) {
      fetchPlatformTickets();
    }
  }, [panel?.id, profile?.id]);

  const fetchPanelFaqs = async () => {
    if (!panel?.id) return;
    const { data } = await supabase
      .from('panels')
      .select('custom_branding')
      .eq('id', panel.id)
      .single();
    const branding = (data?.custom_branding as any) || {};
    setPanelFaqs(branding.faqs || []);
  };

  const savePanelFaqs = async (faqs: { question: string; answer: string }[]) => {
    if (!panel?.id) return;
    setSavingFaqs(true);
    try {
      const { data: existing } = await supabase
        .from('panels')
        .select('custom_branding')
        .eq('id', panel.id)
        .single();
      const existingBranding = (existing?.custom_branding as any) || {};
      
      const { error } = await supabase
        .from('panels')
        .update({
          custom_branding: { ...existingBranding, faqs }
        })
        .eq('id', panel.id);
      
      if (error) throw error;
      setPanelFaqs(faqs);
      toast({ title: "FAQs updated", description: "Your tenant users will see these FAQs immediately." });
    } catch (err) {
      console.error('Error saving FAQs:', err);
      toast({ variant: "destructive", title: "Failed to save FAQs" });
    } finally {
      setSavingFaqs(false);
    }
  };

  const handleAddFaq = () => {
    setEditingFaqIndex(null);
    setFaqQuestion("");
    setFaqAnswer("");
    setFaqDialogOpen(true);
  };

  const handleEditFaq = (index: number) => {
    setEditingFaqIndex(index);
    setFaqQuestion(panelFaqs[index].question);
    setFaqAnswer(panelFaqs[index].answer);
    setFaqDialogOpen(true);
  };

  const handleSaveFaq = () => {
    if (!faqQuestion.trim() || !faqAnswer.trim()) return;
    const updated = [...panelFaqs];
    if (editingFaqIndex !== null) {
      updated[editingFaqIndex] = { question: faqQuestion.trim(), answer: faqAnswer.trim() };
    } else {
      updated.push({ question: faqQuestion.trim(), answer: faqAnswer.trim() });
    }
    savePanelFaqs(updated);
    setFaqDialogOpen(false);
  };

  const handleDeleteFaq = (index: number) => {
    const updated = panelFaqs.filter((_, i) => i !== index);
    savePanelFaqs(updated);
  };

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
      
      // Update selected ticket messages in state
      setSelectedTicket(prev => prev ? {
        ...prev,
        messages: [...currentMessages, newMessageObj]
      } : null);
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

  const handleTicketSelect = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    if (isMobile) {
      setTicketSheetOpen(true);
    }
  };

  // Mobile Ticket Card Component
  const TicketCard = ({ ticket, onClick }: { ticket: Ticket; onClick: () => void }) => (
    <div
      onClick={onClick}
      className="p-4 bg-card border border-border rounded-xl active:bg-accent transition-colors cursor-pointer"
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-medium text-sm line-clamp-2 flex-1 pr-2">{ticket.subject}</h3>
        <Badge variant={getStatusColor(ticket.status)} className="text-xs shrink-0">
          {ticket.status}
        </Badge>
      </div>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{formatDate(ticket.created_at)}</span>
        <div className="flex items-center gap-2">
          <AlertCircle className={`w-3 h-3 ${getPriorityColor(ticket.priority)}`} />
          <span className={getPriorityColor(ticket.priority)}>{ticket.priority}</span>
          <MessageSquare className="w-3 h-3 ml-2" />
          <span>{ticket.messages?.length || 0}</span>
        </div>
      </div>
    </div>
  );

  // Ticket Details Content (used in both sheet and desktop view)
  const TicketDetailsContent = ({ ticket, isPlatformTicket }: { ticket: Ticket; isPlatformTicket: boolean }) => (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 px-1">
        {ticket.messages?.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No messages yet
          </div>
        ) : (
          ticket.messages?.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender_type === 'panel_owner' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] px-4 py-2 rounded-2xl ${
                  message.sender_type === 'panel_owner'
                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                    : message.sender_type === 'admin'
                    ? 'bg-violet-500/20 text-violet-400 rounded-bl-sm'
                    : 'bg-muted rounded-bl-sm'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium">{message.sender}</span>
                  <span className="text-xs opacity-70">
                    {formatDate(message.created_at)}
                  </span>
                </div>
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="border-t border-border pt-4 pb-safe">
        <div className="flex gap-2">
          <Textarea
            placeholder="Type your reply..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 min-h-[80px]"
            rows={3}
          />
        </div>
        <div className="flex gap-2 mt-2">
          <Button
            onClick={() => handleSendReply(ticket, isPlatformTicket)}
            disabled={!newMessage.trim()}
            className="flex-1 sm:flex-none"
          >
            <Send className="w-4 h-4 mr-2" />
            Send
          </Button>
          {!isPlatformTicket && (
            <Button variant="outline" size="sm" className="hidden sm:flex">
              <CheckCircle className="w-4 h-4 mr-1" />
              Resolve
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  const renderTicketList = (tickets: Ticket[], loading: boolean, isPlatformTicket: boolean) => {
    const filteredList = filterTickets(tickets);

    // Mobile view - full width card list
    if (isMobile) {
      return (
        <div className="space-y-4">
          {/* Search and filters */}
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
            <ScrollArea className="w-full">
              <div className="flex gap-2 pb-2">
                {["all", "open", "in_progress", "resolved"].map((status) => (
                  <Button
                    key={status}
                    variant={filterStatus === status ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilterStatus(status)}
                    className="shrink-0"
                  >
                    {status === "all" ? "All" : status === "in_progress" ? "In Progress" : status.charAt(0).toUpperCase() + status.slice(1)}
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Ticket list */}
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">Loading tickets...</div>
          ) : filteredList.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Inbox className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No tickets found</p>
            </div>
          ) : (
            <div className="space-y-3 pb-20">
              {filteredList.map((ticket) => (
                <TicketCard 
                  key={ticket.id} 
                  ticket={ticket} 
                  onClick={() => handleTicketSelect(ticket)}
                />
              ))}
            </div>
          )}
        </div>
      );
    }

    // Desktop view - original card design
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
    // On mobile, details are shown in a sheet
    if (isMobile) {
      return null;
    }

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
        <CardContent className="h-[calc(100%-120px)]">
          <TicketDetailsContent ticket={selectedTicket} isPlatformTicket={isPlatformTicket} />
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-20 md:pb-0">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Support Center</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Manage customer tickets, live chat, and platform support</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(val) => { setActiveTab(val); setSelectedTicket(null); }}>
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <TabsList className="inline-flex w-auto min-w-full sm:w-full sm:max-w-2xl sm:grid sm:grid-cols-4">
            <TabsTrigger value="knowledge" className="gap-1.5 text-xs sm:text-sm whitespace-nowrap px-3 sm:px-4">
              <Book className="w-4 h-4 hidden sm:block" />
              Knowledge
            </TabsTrigger>
            <TabsTrigger value="livechat" className="gap-1.5 text-xs sm:text-sm whitespace-nowrap px-3 sm:px-4">
              <MessagesSquare className="w-4 h-4 hidden sm:block" />
              Live Chat
            </TabsTrigger>
            <TabsTrigger value="customer" className="gap-1.5 text-xs sm:text-sm whitespace-nowrap px-3 sm:px-4">
              <Users className="w-4 h-4 hidden sm:block" />
              Customers
            </TabsTrigger>
            <TabsTrigger value="platform" className="gap-1.5 text-xs sm:text-sm whitespace-nowrap px-3 sm:px-4">
              <HeadphonesIcon className="w-4 h-4 hidden sm:block" />
              Platform
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="knowledge" className="mt-4 sm:mt-6 space-y-6">
          {/* FAQ Management for tenant users */}
          <Card className="bg-gradient-card border-border shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5" />
                  Tenant FAQs
                </div>
                <Button size="sm" onClick={handleAddFaq} className="gap-1">
                  <Plus className="w-4 h-4" />
                  Add FAQ
                </Button>
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Manage FAQs shown to your tenant users on their Support page.
              </p>
            </CardHeader>
            <CardContent>
              {panelFaqs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <HelpCircle className="w-10 h-10 mx-auto mb-3 opacity-40" />
                  <p>No FAQs added yet. Default FAQs will be shown to your users.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {panelFaqs.map((faq, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-lg border border-border bg-background">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{faq.question}</p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{faq.answer}</p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditFaq(idx)}>
                          <Edit className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteFaq(idx)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Panel owner knowledge base */}
          <KnowledgeBase />
        </TabsContent>

        <TabsContent value="livechat" className="mt-4 sm:mt-6">
          <ChatInbox embedded />
        </TabsContent>

        <TabsContent value="customer" className="mt-4 sm:mt-6">
          {isMobile ? (
            renderTicketList(customerTickets, loadingCustomerTickets, false)
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                {renderTicketList(customerTickets, loadingCustomerTickets, false)}
              </div>
              <div className="lg:col-span-2">
                {renderTicketDetails(false)}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="platform" className="mt-4 sm:mt-6">
          <div className="mb-4">
            <Button onClick={() => setNewTicketDialogOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              New Platform Ticket
            </Button>
          </div>
          {isMobile ? (
            renderTicketList(platformTickets, loadingPlatformTickets, true)
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                {renderTicketList(platformTickets, loadingPlatformTickets, true)}
              </div>
              <div className="lg:col-span-2">
                {renderTicketDetails(true)}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Mobile Ticket Details Sheet */}
      <Sheet open={ticketSheetOpen} onOpenChange={setTicketSheetOpen}>
        <SheetContent side="bottom" className="h-[90vh] rounded-t-2xl">
          <SheetHeader className="pb-4 border-b">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setTicketSheetOpen(false)}
                className="shrink-0"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex-1 min-w-0">
                <SheetTitle className="text-left text-base line-clamp-1">
                  {selectedTicket?.subject}
                </SheetTitle>
                <div className="flex items-center gap-2 mt-1">
                  {selectedTicket && (
                    <>
                      <Badge variant={getStatusColor(selectedTicket.status)} className="text-xs">
                        {selectedTicket.status}
                      </Badge>
                      <span className={`text-xs ${getPriorityColor(selectedTicket.priority)}`}>
                        {selectedTicket.priority}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </SheetHeader>
          <div className="flex-1 overflow-hidden pt-4 h-[calc(100%-80px)]">
            {selectedTicket && (
              <TicketDetailsContent 
                ticket={selectedTicket} 
                isPlatformTicket={activeTab === 'platform'} 
              />
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* New Platform Ticket Dialog */}
      <Dialog open={newTicketDialogOpen} onOpenChange={setNewTicketDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Contact Platform Support</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={newTicketCategory} onValueChange={setNewTicketCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="technical">Technical Issue</SelectItem>
                  <SelectItem value="billing">Billing</SelectItem>
                  <SelectItem value="feature">Feature Request</SelectItem>
                  <SelectItem value="general">General Question</SelectItem>
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
                value={newTicketSubject}
                onChange={(e) => setNewTicketSubject(e.target.value)}
                placeholder="Brief description of your issue"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea
                value={newTicketMessage}
                onChange={(e) => setNewTicketMessage(e.target.value)}
                placeholder="Describe your issue in detail..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setNewTicketDialogOpen(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button 
              onClick={handleCreatePlatformTicket}
              disabled={submittingTicket || !newTicketSubject.trim() || !newTicketMessage.trim()}
              className="w-full sm:w-auto"
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