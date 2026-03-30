import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageSquare, 
  Plus, 
  Clock, 
  CheckCircle,
  XCircle,
  Send,
  Search,
  Inbox,
  Loader2,
  AlertTriangle,
  LogIn,
  HelpCircle,
  MessagesSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

interface ChatSession {
  id: string;
  visitor_id: string;
  visitor_name: string | null;
  visitor_email: string | null;
  status: string;
  created_at: string;
  last_message_at: string | null;
}

interface ChatMessage {
  id: string;
  session_id: string;
  sender_type: string;
  content: string;
  created_at: string;
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

const defaultFAQs = [
  { question: "How long does delivery take?", answer: "Most orders begin processing within minutes of placement. Delivery speed depends on the service type — some complete instantly while others may take up to 72 hours." },
  { question: "How do I add funds to my account?", answer: "Navigate to the Deposit page from your dashboard. We accept various payment methods. Your balance updates instantly after a successful payment." },
  { question: "What payment methods are accepted?", answer: "We support multiple payment methods including cryptocurrency, credit cards, and various e-wallets depending on the payment gateway configured by the panel." },
  { question: "Can I get a refund?", answer: "Refund policies vary by service. If an order is not delivered or only partially completed, please open a support ticket and our team will review your case." },
  { question: "Is it safe to use your services?", answer: "Yes! We use secure payment processing and never ask for your social media passwords. All services are delivered through official platform APIs." },
  { question: "What happens if my order fails?", answer: "If an order fails or is partially delivered, the remaining balance will be automatically refunded to your account. You can also contact support for assistance." },
];

const BuyerSupport = () => {
  const { buyer, loading: authLoading, panelId: authPanelId } = useBuyerAuth();
  const { panel, loading: panelLoading } = useTenant();
  // Triple fallback for panel ID: auth context -> tenant hook -> localStorage
  const resolvedPanelId = authPanelId || panel?.id || (typeof window !== 'undefined' ? localStorage.getItem('current_panel_id') : null);
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

  // Chat state
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatSession | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatFilter, setChatFilter] = useState<'active' | 'archived'>('active');
  const [showAIChat, setShowAIChat] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // FAQ state
  const [faqs, setFaqs] = useState(defaultFAQs);

  // New ticket form
  const [newTicket, setNewTicket] = useState({
    subject: "",
    priority: "medium",
    message: ""
  });

  // Fetch panel FAQs from custom_branding
  useEffect(() => {
    const fetchFaqs = async () => {
      if (!panel?.id) return;
      const { data } = await (supabase as any)
        .from('panels_public')
        .select('custom_branding')
        .eq('id', panel.id)
        .single();
      const branding = data?.custom_branding as any;
      if (branding?.faqs?.length > 0) {
        setFaqs(branding.faqs);
      }
    };
    fetchFaqs();
  }, [panel?.id]);

  useEffect(() => {
    fetchTickets();
  }, [buyer?.id, resolvedPanelId]);

  // Fetch chat sessions
  useEffect(() => {
    if (!buyer?.id || !resolvedPanelId) return;
    const fetchChats = async () => {
      setChatLoading(true);
      const { data } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('panel_id', resolvedPanelId)
        .eq('visitor_id', buyer.id)
        .order('last_message_at', { ascending: false, nullsFirst: false });
      setChatSessions(data || []);
      setChatLoading(false);
    };
    fetchChats();

    // Realtime subscription for chat sessions
    const channel = supabase
      .channel('buyer-chat-sessions')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'chat_sessions',
        filter: `visitor_id=eq.${buyer.id}`
      }, () => { fetchChats(); })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [buyer?.id, resolvedPanelId]);

  // Fetch messages for selected chat & subscribe to realtime
  useEffect(() => {
    if (!selectedChat) { setChatMessages([]); return; }
    
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', selectedChat.id)
        .order('created_at', { ascending: true });
      setChatMessages(data || []);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    };
    fetchMessages();

    const channel = supabase
      .channel(`buyer-chat-${selectedChat.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `session_id=eq.${selectedChat.id}`
      }, (payload) => {
        setChatMessages(prev => [...prev, payload.new as ChatMessage]);
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedChat?.id]);

  const fetchTickets = async () => {
    if (!buyer?.id || !resolvedPanelId) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('panel_id', resolvedPanelId)
        .eq('user_id', buyer.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
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
    if (!buyer?.id) {
      toast({ variant: "destructive", title: "Error", description: "Please log in to submit a ticket." });
      return;
    }
    if (!resolvedPanelId) {
      toast({ variant: "destructive", title: "Error", description: "Unable to connect. Please refresh the page and try again." });
      return;
    }
    setSubmitting(true);
    try {
      const initialMessage = { sender: 'buyer' as const, content: newTicket.message, timestamp: new Date().toISOString() };
      // Route through edge function to bypass RLS
      const { data: fnData, error: fnError } = await supabase.functions.invoke('buyer-auth', {
        body: {
          action: 'create-support-ticket',
          panelId: resolvedPanelId,
          buyerId: buyer.id,
          subject: newTicket.subject,
          message: newTicket.message,
          senderName: buyer.full_name || buyer.email,
          senderEmail: buyer.email,
        }
      });
      if (fnError || fnData?.error) throw new Error(fnData?.error || fnError?.message || 'Failed to create ticket');

      // Notify panel owner
      try {
        const { data: panelData } = await supabase.from('panels').select('owner_id').eq('id', resolvedPanelId).single();
        if (panelData?.owner_id) {
          await supabase.from('panel_notifications').insert({ user_id: panelData.owner_id, title: 'New Support Ticket', message: `${buyer.full_name || buyer.email} submitted: "${newTicket.subject}"`, type: 'system', is_read: false });
        }
      } catch (e) { /* notification failure is non-critical */ }

      toast({ title: "Ticket Created", description: "We'll respond as soon as possible" });
      setIsNewTicketOpen(false);
      setNewTicket({ subject: "", priority: "medium", message: "" });
      fetchTickets();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to create ticket." });
    } finally { setSubmitting(false); }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket) return;
    setSubmitting(true);
    try {
      const newMsg: Message = { sender: 'buyer', content: newMessage, timestamp: new Date().toISOString() };
      const updatedMessages = [...(selectedTicket.messages || []), newMsg];
      const { error } = await supabase.from('support_tickets').update({ messages: updatedMessages, updated_at: new Date().toISOString() }).eq('id', selectedTicket.id);
      if (error) throw error;
      setSelectedTicket({ ...selectedTicket, messages: updatedMessages });
      setTickets(prev => prev.map(t => t.id === selectedTicket.id ? { ...t, messages: updatedMessages } : t));
      setNewMessage("");
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to send message" });
    } finally { setSubmitting(false); }
  };

  const handleResolveTicket = async (ticketId: string) => {
    try {
      const { error } = await supabase.from('support_tickets').update({ status: 'resolved', updated_at: new Date().toISOString() }).eq('id', ticketId);
      if (error) throw error;
      toast({ title: "Ticket resolved" });
      if (selectedTicket?.id === ticketId) setSelectedTicket({ ...selectedTicket, status: 'resolved' });
      fetchTickets();
    } catch { toast({ variant: "destructive", title: "Failed to update ticket" }); }
  };

  // Chat: send message via edge function (bypasses RLS)
  const handleSendChatMessage = async (sessionOverride?: ChatSession) => {
    let activeSession = sessionOverride || selectedChat;
    if (!chatInput.trim() || !buyer?.id) return;
    
    // Auto-create session if none exists
    if (!activeSession) {
      activeSession = await handleStartChat();
      if (!activeSession) return;
    }
    
    const msgContent = chatInput.trim();
    setChatInput("");
    
    const { data: fnData, error: fnError } = await supabase.functions.invoke('buyer-auth', {
      body: {
        action: 'send-chat-message',
        sessionId: activeSession.id,
        buyerId: buyer.id,
        content: msgContent,
      }
    });
    if (fnError || fnData?.error) {
      toast({ variant: "destructive", title: fnData?.error || "Failed to send message" });
      setChatInput(msgContent); // restore on failure
    }
  };

  // Chat: create new session - returns the session for immediate use
  const handleStartChat = async (): Promise<ChatSession | null> => {
    if (!buyer?.id) {
      toast({ variant: "destructive", title: "Please log in to start a chat" });
      return null;
    }
    if (!resolvedPanelId) {
      toast({ variant: "destructive", title: "Unable to connect", description: "Panel ID not found. Please refresh the page and try again." });
      return null;
    }
    try {
      const { data: fnData, error: fnError } = await supabase.functions.invoke('buyer-auth', {
        body: {
          panelId: resolvedPanelId,
          action: 'create-chat-session',
          buyerId: buyer.id,
          buyerName: buyer.full_name || buyer.email,
          buyerEmail: buyer.email,
        }
      });
      if (fnError || fnData?.error) {
        toast({ variant: "destructive", title: fnData?.error || "Failed to start chat" });
        return null;
      }
      if (fnData?.session) {
        setChatSessions(prev => [fnData.session, ...prev]);
        setSelectedChat(fnData.session);
        return fnData.session;
      }
      return null;
    } catch {
      toast({ variant: "destructive", title: "Failed to start chat" });
      return null;
    }
  };

  // Quick reply chips
  const quickReplies = [
    { label: '💰 Deposit Issue', text: 'I need help with a deposit' },
    { label: '📦 Order Issue', text: 'I have an issue with my order' },
    { label: '💳 Transaction', text: 'I need help with a transaction' },
    { label: '🔑 Account', text: 'I need help with my account' },
  ];

  const handleQuickReply = async (text: string) => {
    setChatInput(text);
    let session = selectedChat;
    if (!session) {
      session = await handleStartChat();
    }
    if (session) {
      const tempInput = text;
      setChatInput("");
      const { data: fnData } = await supabase.functions.invoke('buyer-auth', {
        body: { action: 'send-chat-message', sessionId: session.id, buyerId: buyer?.id, content: tempInput }
      });
      if (fnData?.error) {
        toast({ variant: "destructive", title: fnData.error });
      }
    }
  };

  const openTicket = (ticket: Ticket) => { setSelectedTicket(ticket); setIsTicketViewOpen(true); };

  const filteredTickets = tickets.filter(ticket => {
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    const matchesSearch = ticket.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const kanbanColumns = [
    { id: 'open', title: 'Open', tickets: filteredTickets.filter(t => t.status === 'open') },
    { id: 'in_progress', title: 'In Progress', tickets: filteredTickets.filter(t => t.status === 'in_progress') },
    { id: 'resolved', title: 'Resolved', tickets: filteredTickets.filter(t => t.status === 'resolved') },
    { id: 'closed', title: 'Closed', tickets: filteredTickets.filter(t => t.status === 'closed') },
  ];

  if (panelLoading || authLoading) {
    return (<BuyerLayout><div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div></BuyerLayout>);
  }

  if (!buyer) {
    return (
      <BuyerLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4"><LogIn className="w-8 h-8 text-primary" /></div>
          <h2 className="text-xl font-bold mb-2">Login Required</h2>
          <p className="text-muted-foreground mb-4 text-sm">Please sign in to access support.</p>
          <Button asChild><a href="/auth">Sign In</a></Button>
        </div>
      </BuyerLayout>
    );
  }

  if (error) {
    return (
      <BuyerLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <div className="w-16 h-16 rounded-full bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center mb-4"><AlertTriangle className="w-8 h-8 text-amber-500" /></div>
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
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">Support Center</h1>
            <p className="text-muted-foreground">Get help with your orders and account</p>
          </div>
          <div className="hidden md:block">
            <Button onClick={() => setIsNewTicketOpen(true)} className="gap-2"><Plus className="w-4 h-4" />New Ticket</Button>
          </div>
        </motion.div>

        {/* Tabs: Tickets | Live Chat | FAQ */}
        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="chat" className="gap-2"><MessagesSquare className="w-4 h-4" />Live Chat</TabsTrigger>
            <TabsTrigger value="tickets" className="gap-2"><MessageSquare className="w-4 h-4" />Tickets</TabsTrigger>
            <TabsTrigger value="faq" className="gap-2"><HelpCircle className="w-4 h-4" />FAQ</TabsTrigger>
          </TabsList>

          {/* ===== TICKETS TAB ===== */}
          <TabsContent value="tickets" className="space-y-4 mt-4">
            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search tickets..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 bg-card/50" />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="Filter by status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tickets</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Kanban Board */}
            {loading ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
            ) : filteredTickets.length === 0 ? (
              <Card className="glass-card">
                <CardContent className="py-12 text-center">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No tickets yet</h3>
                  <p className="text-muted-foreground mb-4">Create your first support ticket</p>
                  <Button onClick={() => setIsNewTicketOpen(true)} className="gap-2"><Plus className="w-4 h-4" />New Ticket</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {kanbanColumns.map((column) => {
                  const config = statusConfig[column.id];
                  const StatusIcon = config.icon;
                  return (
                    <div key={column.id} className="space-y-3">
                      <div className="flex items-center gap-2 px-2">
                        <StatusIcon className="w-4 h-4 text-muted-foreground" />
                        <h3 className="font-semibold">{column.title}</h3>
                        <Badge variant="secondary" className="ml-auto">{column.tickets.length}</Badge>
                      </div>
                      <div className="space-y-2 min-h-[200px] p-2 rounded-xl bg-muted/30">
                        <AnimatePresence>
                          {column.tickets.map((ticket) => (
                            <motion.div key={ticket.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
                              <Card className="glass-card cursor-pointer hover:shadow-lg transition-all duration-200" onClick={() => openTicket(ticket)}>
                                <CardContent className="p-3 space-y-2">
                                  <p className="font-medium text-sm line-clamp-2">{ticket.subject}</p>
                                  <div className="flex items-center justify-between">
                                    <Badge className={cn("text-xs", priorityConfig[ticket.priority])}>{ticket.priority}</Badge>
                                    <span className="text-xs text-muted-foreground">{new Date(ticket.created_at).toLocaleDateString()}</span>
                                  </div>
                                  {ticket.messages?.length > 0 && (
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                      <MessageSquare className="w-3 h-3" />{ticket.messages.length} message{ticket.messages.length > 1 ? 's' : ''}
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                        {column.tickets.length === 0 && <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">No tickets</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* ===== LIVE CHAT TAB (Twitter-style unified) ===== */}
          <TabsContent value="chat" className="mt-4">
            <Card className="glass-card overflow-hidden">
            <CardContent className="p-0 flex flex-col" style={{ height: 'calc(100vh - 280px)', minHeight: '400px' }}>
                {/* Chat Header */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50 bg-card/80">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                    <MessagesSquare className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm">{panel?.name || 'Support'}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Online
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {/* Filter: Active / Archived */}
                    <Button
                      variant={chatFilter === 'active' ? 'default' : 'ghost'}
                      size="sm"
                      className="text-xs h-7 px-2"
                      onClick={() => setChatFilter('active')}
                    >Active</Button>
                    <Button
                      variant={chatFilter === 'archived' ? 'default' : 'ghost'}
                      size="sm"
                      className="text-xs h-7 px-2"
                      onClick={() => setChatFilter('archived')}
                    >Archived</Button>
                    {/* New Chat */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-7 px-2 gap-1"
                      onClick={async () => {
                        const session = await handleStartChat();
                        if (session) setChatFilter('active');
                      }}
                    >
                      <Plus className="w-3 h-3" />New
                    </Button>
                  </div>
                  {selectedChat && (
                    <Badge variant={selectedChat.status === 'active' ? 'default' : 'secondary'} className="text-[10px]">
                      {selectedChat.status}
                    </Badge>
                  )}
                </div>

                {/* Messages Area */}
                <ScrollArea className="flex-1 px-4">
                  <div className="space-y-3 py-4">
                    {chatLoading ? (
                      <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
                    ) : !selectedChat && chatSessions.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                          <MessagesSquare className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="font-semibold mb-1">Start a Conversation</h3>
                        <p className="text-sm text-muted-foreground mb-4">Type a message below or tap a quick reply to chat with support</p>
                      </div>
                    ) : !selectedChat ? (
                      /* Session List */
                      <div className="space-y-2">
                        {chatSessions
                          .filter(s => chatFilter === 'archived' 
                            ? (s.status === 'closed' || s.status === 'archived')
                            : (s.status === 'active' || s.status === 'open'))
                          .map(session => (
                            <motion.div
                              key={session.id}
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="p-3 rounded-xl bg-muted/40 hover:bg-muted/60 cursor-pointer transition-colors"
                              onClick={() => setSelectedChat(session)}
                            >
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium">Chat #{session.id.slice(0, 6)}</p>
                                <Badge variant={session.status === 'active' ? 'default' : 'secondary'} className="text-[10px]">{session.status}</Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                {session.last_message_at ? new Date(session.last_message_at).toLocaleString() : new Date(session.created_at).toLocaleString()}
                              </p>
                            </motion.div>
                          ))}
                        {chatSessions.filter(s => chatFilter === 'archived' 
                          ? (s.status === 'closed' || s.status === 'archived')
                          : (s.status === 'active' || s.status === 'open')).length === 0 && (
                          <div className="text-center py-8 text-sm text-muted-foreground">
                            No {chatFilter} conversations
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        {/* Back button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs gap-1 mb-2"
                          onClick={() => setSelectedChat(null)}
                        >
                          ← Back to chats
                        </Button>
                        {chatMessages.map(msg => (
                          <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={cn(
                              "flex gap-2",
                              msg.sender_type === 'visitor' ? "flex-row-reverse" : ""
                            )}
                          >
                            <div className={cn(
                              "w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium shrink-0",
                              msg.sender_type === 'visitor' ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                            )}>
                              {msg.sender_type === 'visitor' ? (buyer?.full_name?.[0] || 'Y') : 'S'}
                            </div>
                            <div className={cn(
                              "max-w-[75%] px-3 py-2 rounded-2xl text-sm",
                              msg.sender_type === 'visitor'
                                ? "bg-primary text-primary-foreground rounded-br-sm"
                                : "bg-muted rounded-bl-sm"
                            )}>
                              <p>{msg.content}</p>
                              <p className={cn(
                                "text-[10px] mt-1",
                                msg.sender_type === 'visitor' ? "text-primary-foreground/60" : "text-muted-foreground"
                              )}>
                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                        {/* Continue with AI button when chat has messages but no recent reply */}
                        {chatMessages.length > 0 && chatMessages[chatMessages.length - 1]?.sender_type === 'visitor' && (
                          <div className="flex justify-center pt-3">
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs gap-1.5 rounded-full"
                              onClick={() => setShowAIChat(true)}
                            >
                              🤖 Continue with AI
                            </Button>
                          </div>
                        )}
                        <div ref={chatEndRef} />
                      </>
                    )}
                  </div>
                </ScrollArea>

                {/* Quick Replies */}
                {chatMessages.length === 0 && !selectedChat && (
                  <div className="px-4 py-2 flex gap-2 flex-wrap border-t border-border/30">
                    {quickReplies.map((qr, i) => (
                      <Button
                        key={i}
                        variant="outline"
                        size="sm"
                        className="text-xs rounded-full"
                        onClick={() => handleQuickReply(qr.text)}
                      >
                        {qr.label}
                      </Button>
                    ))}
                  </div>
                )}

                {/* Input Area */}
                <div className="px-4 py-3 border-t border-border/50 bg-card/80">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={async (e) => {
                        if (e.key === 'Enter' && chatInput.trim()) {
                          let session = selectedChat;
                          if (!session) {
                            session = await handleStartChat();
                          }
                          if (session) {
                            handleSendChatMessage(session);
                          }
                        }
                      }}
                      className="bg-muted/50 border-0"
                    />
                    <Button
                      size="icon"
                      disabled={!chatInput.trim()}
                      onClick={async () => {
                        let session = selectedChat;
                        if (!session) {
                          session = await handleStartChat();
                        }
                        if (session) {
                          handleSendChatMessage(session);
                        }
                      }}
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Chat Modal */}
            {showAIChat && (
              <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end justify-center sm:items-center">
                <div className="w-full max-w-md h-[80vh] relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 z-10"
                    onClick={() => setShowAIChat(false)}
                  >
                    <XCircle className="w-5 h-5" />
                  </Button>
                  <FloatingChatWidget />
                </div>
              </div>
            )}
          </TabsContent>

          {/* ===== FAQ TAB ===== */}
          <TabsContent value="faq" className="mt-4">
            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-primary/10"><HelpCircle className="w-6 h-6 text-primary" /></div>
                  <div>
                    <h2 className="font-semibold text-lg">Frequently Asked Questions</h2>
                    <p className="text-sm text-muted-foreground">Find quick answers to common questions</p>
                  </div>
                </div>
                <Accordion type="single" collapsible className="w-full space-y-2">
                  {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`faq-${index}`} className="border rounded-lg px-4">
                      <AccordionTrigger className="text-sm font-medium hover:no-underline">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* New Ticket Dialog */}
        <Dialog open={isNewTicketOpen} onOpenChange={setIsNewTicketOpen}>
          <DialogContent className="glass-card border-primary/20">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10"><MessageSquare className="w-5 h-5 text-primary" /></div>
                <div><DialogTitle>Create New Ticket</DialogTitle><DialogDescription>Describe your issue and we'll help you</DialogDescription></div>
              </div>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input placeholder="Brief description of your issue" value={newTicket.subject} onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={newTicket.priority} onValueChange={(v) => setNewTicket({ ...newTicket, priority: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
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
                <Textarea placeholder="Describe your issue in detail..." value={newTicket.message} onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })} rows={4} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNewTicketOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateTicket} disabled={submitting}>{submitting ? "Creating..." : "Create Ticket"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Ticket View Dialog */}
        <Dialog open={isTicketViewOpen} onOpenChange={setIsTicketViewOpen}>
          <DialogContent className="glass-card max-w-lg max-h-[80vh] flex flex-col">
            <DialogHeader>
              <div className="space-y-1">
                <DialogTitle className="pr-8">{selectedTicket?.subject}</DialogTitle>
                <div className="flex items-center gap-2">
                  <Badge className={cn(statusConfig[selectedTicket?.status || 'open'].color)}>{statusConfig[selectedTicket?.status || 'open'].label}</Badge>
                  <Badge className={cn(priorityConfig[selectedTicket?.priority || 'medium'])}>{selectedTicket?.priority}</Badge>
                  {selectedTicket?.status === 'open' || selectedTicket?.status === 'in_progress' ? (
                    <Button size="sm" variant="outline" className="ml-auto text-xs gap-1" onClick={() => selectedTicket && handleResolveTicket(selectedTicket.id)}>
                      <CheckCircle className="w-3 h-3" />Resolve
                    </Button>
                  ) : null}
                </div>
              </div>
            </DialogHeader>
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4 py-4">
                {(selectedTicket?.messages || []).map((msg: Message, index: number) => (
                  <motion.div key={index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
                    className={cn("p-3 rounded-xl max-w-[85%]", msg.sender === 'buyer' ? "ml-auto bg-primary text-primary-foreground" : "bg-muted")}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p className={cn("text-xs mt-1", msg.sender === 'buyer' ? "text-primary-foreground/70" : "text-muted-foreground")}>{new Date(msg.timestamp).toLocaleString()}</p>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
            {selectedTicket?.status !== 'closed' && selectedTicket?.status !== 'resolved' && (
              <div className="flex gap-2 pt-4 border-t">
                <Input placeholder="Type your message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} />
                <Button onClick={handleSendMessage} disabled={submitting || !newMessage.trim()}><Send className="w-4 h-4" /></Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Live Chat Widget hidden on support page to avoid disturbance */}
    </BuyerLayout>
  );
};

export default BuyerSupport;
