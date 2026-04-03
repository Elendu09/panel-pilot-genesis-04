import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star } from "lucide-react";
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
  MessagesSquare,
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useBuyerAuth } from "@/contexts/BuyerAuthContext";
import { useTenant } from "@/hooks/useTenant";
import BuyerLayout from "./BuyerLayout";
import { Bot } from "lucide-react";

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
  sender: "buyer" | "support" | "user";
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
  {
    question: "How long does delivery take?",
    answer:
      "Most orders begin processing within minutes of placement. Delivery speed depends on the service type — some complete instantly while others may take up to 72 hours.",
  },
  {
    question: "How do I add funds to my account?",
    answer:
      "Navigate to the Deposit page from your dashboard. We accept various payment methods. Your balance updates instantly after a successful payment.",
  },
  {
    question: "What payment methods are accepted?",
    answer:
      "We support multiple payment methods including cryptocurrency, credit cards, and various e-wallets depending on the payment gateway configured by the panel.",
  },
  {
    question: "Can I get a refund?",
    answer:
      "Refund policies vary by service. If an order is not delivered or only partially completed, please open a support ticket and our team will review your case.",
  },
  {
    question: "Is it safe to use your services?",
    answer:
      "Yes! We use secure payment processing and never ask for your social media passwords. All services are delivered through official platform APIs.",
  },
  {
    question: "What happens if my order fails?",
    answer:
      "If an order fails or is partially delivered, the remaining balance will be automatically refunded to your account. You can also contact support for assistance.",
  },
];

const BuyerSupport = () => {
  const { buyer, loading: authLoading, panelId: authPanelId } = useBuyerAuth();
  const { panel, loading: panelLoading } = useTenant();
  const resolvedPanelId =
    authPanelId || panel?.id || (typeof window !== "undefined" ? localStorage.getItem("current_panel_id") : null);
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
  const [chatFilter, setChatFilter] = useState<"active" | "archived">("active");
  const [aiMode, setAiMode] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // New Dialog States
  const [isEndChatDialogOpen, setIsEndChatDialogOpen] = useState(false);
  const [isRatingDialogOpen, setIsRatingDialogOpen] = useState(false);
  const [chatRating, setChatRating] = useState(0);

  // Refs for smart polling
  const isFirstLoad = useRef(true);
  const isTabVisible = useRef(true);
  const prevSessionsRef = useRef<string>("");

  // FAQ state
  const [faqs, setFaqs] = useState(defaultFAQs);

  // New ticket form
  const [newTicket, setNewTicket] = useState({
    subject: "",
    priority: "medium",
    message: "",
  });

  // Visibility tracking to pause polling when tab is hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      isTabVisible.current = document.visibilityState === "visible";
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // Fetch panel FAQs from custom_branding
  useEffect(() => {
    const fetchFaqs = async () => {
      if (!panel?.id) return;
      const { data } = await (supabase as any)
        .from("panels_public")
        .select("custom_branding")
        .eq("id", panel.id)
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

  // Fetch chat sessions - Smart polling without UI interruption
  const fetchChats = async (silent = false) => {
    if (!buyer?.id || !resolvedPanelId) return;

    // Only show loading on first load, not on background refreshes
    if (!silent && isFirstLoad.current) {
      setChatLoading(true);
    }

    try {
      const { data: fnData, error: fnError } = await supabase.functions.invoke("buyer-auth", {
        body: { action: "list-chat-sessions", panelId: resolvedPanelId, buyerId: buyer.id },
      });
      if (fnError) throw fnError;

      const newSessions = fnData?.sessions || [];
      const newSessionsJson = JSON.stringify(newSessions);

      // Only update state if data actually changed to prevent unnecessary re-renders
      if (prevSessionsRef.current !== newSessionsJson) {
        prevSessionsRef.current = newSessionsJson;
        setChatSessions(newSessions);
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
    } finally {
      if (!silent && isFirstLoad.current) {
        setChatLoading(false);
        isFirstLoad.current = false;
      }
    }
  };

  // Fetch messages for selected chat - Extracted function for reuse
  const fetchChatMessages = async (sessionId: string) => {
    if (!buyer?.id || !sessionId) return;

    try {
      const { data: fnData, error: fnError } = await supabase.functions.invoke("buyer-auth", {
        body: {
          action: "list-chat-messages",
          sessionId: sessionId,
          buyerId: buyer.id,
          panelId: resolvedPanelId,
        },
      });

      if (fnError) throw fnError;

      if (fnData?.messages) {
        setChatMessages(fnData.messages);
        setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  // Fetch chat sessions on mount
  useEffect(() => {
    fetchChats(); // Initial load with loading state

    // Poll for new sessions every 15s only when tab is visible (silent refresh)
    const interval = setInterval(() => {
      if (isTabVisible.current) {
        fetchChats(true); // Silent = true, no loading state
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [buyer?.id, resolvedPanelId]);

  // Fetch messages for selected chat & poll for new ones
  useEffect(() => {
    if (!selectedChat) {
      setChatMessages([]);
      return;
    }

    fetchChatMessages(selectedChat.id);

    // Poll for new messages every 2s only when tab is visible
    const interval = setInterval(() => {
      if (isTabVisible.current) {
        fetchChatMessages(selectedChat.id);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [selectedChat?.id, buyer?.id]);

  const fetchTickets = async () => {
    if (!buyer?.id || !resolvedPanelId) return;
    setLoading(true);
    setError(null);
    try {
      const { data: fnData, error: fnError } = await supabase.functions.invoke("buyer-auth", {
        body: { action: "list-tickets", panelId: resolvedPanelId, buyerId: buyer.id },
      });
      if (fnError) throw fnError;
      const transformedTickets = (fnData?.tickets || []).map((ticket: any) => ({
        ...ticket,
        messages: Array.isArray(ticket.messages) ? ticket.messages : [],
      })) as Ticket[];
      setTickets(transformedTickets);
    } catch (error: any) {
      console.error("Error fetching tickets:", error);
      setTickets([]);
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
      toast({
        variant: "destructive",
        title: "Error",
        description: "Unable to connect. Please refresh the page and try again.",
      });
      return;
    }
    setSubmitting(true);
    try {
      const { data: fnData, error: fnError } = await supabase.functions.invoke("buyer-auth", {
        body: {
          action: "create-support-ticket",
          panelId: resolvedPanelId,
          buyerId: buyer.id,
          subject: newTicket.subject,
          message: newTicket.message,
          senderName: buyer.full_name || buyer.email,
          senderEmail: buyer.email,
        },
      });
      if (fnError || fnData?.error) throw new Error(fnData?.error || fnError?.message || "Failed to create ticket");

      try {
        const { data: panelData } = await supabase.from("panels").select("owner_id").eq("id", resolvedPanelId).single();
        if (panelData?.owner_id) {
          await supabase.from("panel_notifications").insert({
            user_id: panelData.owner_id,
            title: "New Support Ticket",
            message: `${buyer.full_name || buyer.email} submitted: "${newTicket.subject}"`,
            type: "system",
            is_read: false,
          });
        }
      } catch (e) {
        /* notification failure is non-critical */
      }

      toast({ title: "Ticket Created", description: "We'll respond as soon as possible" });
      setIsNewTicketOpen(false);
      setNewTicket({ subject: "", priority: "medium", message: "" });
      fetchTickets();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to create ticket." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket || !buyer?.id) return;
    setSubmitting(true);
    try {
      const { data: fnData, error: fnError } = await supabase.functions.invoke("buyer-auth", {
        body: {
          action: "reply-ticket",
          panelId: resolvedPanelId || "",
          buyerId: buyer.id,
          ticketId: selectedTicket.id,
          content: newMessage.trim(),
        },
      });
      if (fnError || fnData?.error) throw new Error(fnData?.error || "Failed to send reply");
      const updatedMessages = fnData.messages || [
        ...(selectedTicket.messages || []),
        { sender: "buyer", content: newMessage.trim(), timestamp: new Date().toISOString() },
      ];
      setSelectedTicket({ ...selectedTicket, messages: updatedMessages });
      setTickets((prev) => prev.map((t) => (t.id === selectedTicket.id ? { ...t, messages: updatedMessages } : t)));
      setNewMessage("");
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to send message" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseTicket = async (ticketId: string) => {
    if (!buyer?.id) return;
    try {
      const { data: fnData, error: fnError } = await supabase.functions.invoke("buyer-auth", {
        body: { action: "close-ticket", panelId: resolvedPanelId || "", buyerId: buyer.id, ticketId },
      });
      if (fnError || fnData?.error) throw new Error(fnData?.error || "Failed to close ticket");
      toast({ title: "Ticket closed" });
      if (selectedTicket?.id === ticketId) setSelectedTicket({ ...selectedTicket, status: "closed" });
      fetchTickets();
    } catch {
      toast({ variant: "destructive", title: "Failed to close ticket" });
    }
  };

  // Open confirmation dialog when user clicks End Chat
  const handleEndChatClick = () => {
    setIsEndChatDialogOpen(true);
  };

  // Actual end chat execution after confirmation
  const confirmEndChat = async () => {
    if (!buyer?.id || !selectedChat) return;
    try {
      const { data: fnData, error: fnError } = await supabase.functions.invoke("buyer-auth", {
        body: { action: "end-chat", panelId: resolvedPanelId || "", buyerId: buyer.id, sessionId: selectedChat.id },
      });
      if (fnError || fnData?.error) throw new Error(fnData?.error || "Failed to end chat");

      // Update local state
      setChatSessions((prev) => prev.map((s) => (s.id === selectedChat.id ? { ...s, status: "closed" } : s)));
      setIsEndChatDialogOpen(false);
      setIsRatingDialogOpen(true); // Open rating dialog instead of inline
      toast({ title: "Conversation ended" });
    } catch {
      toast({ variant: "destructive", title: "Failed to end conversation" });
    }
  };

  // Submit rating from dialog
  const submitRating = async (rating: number) => {
    if (!buyer?.id || !selectedChat) return;
    try {
      await supabase.functions.invoke("buyer-auth", {
        body: {
          action: "rate-chat",
          panelId: resolvedPanelId || "",
          buyerId: buyer.id,
          sessionId: selectedChat.id,
          rating,
        },
      });
      toast({ title: "Thanks for your feedback!" });
      setIsRatingDialogOpen(false);
      setChatRating(0);
      setSelectedChat(null);
    } catch {
      toast({ variant: "destructive", title: "Failed to submit rating" });
    }
  };

  const handleResolveTicket = async (ticketId: string) => {
    if (!buyer?.id) return;
    try {
      const { data: fnData, error: fnError } = await supabase.functions.invoke("buyer-auth", {
        body: { action: "close-ticket", panelId: resolvedPanelId || "", buyerId: buyer.id, ticketId },
      });
      if (fnError || fnData?.error) throw new Error(fnData?.error || "Failed to resolve ticket");
      toast({ title: "Ticket resolved" });
      if (selectedTicket?.id === ticketId) setSelectedTicket({ ...selectedTicket, status: "resolved" });
      fetchTickets();
    } catch {
      toast({ variant: "destructive", title: "Failed to update ticket" });
    }
  };

  // Chat: send message via edge function
  const handleSendChatMessage = async (sessionOverride?: ChatSession) => {
    let activeSession = sessionOverride || selectedChat;
    if (!chatInput.trim() || !buyer?.id) return;

    const msgContent = chatInput.trim();

    if (!activeSession) {
      activeSession = await handleStartChat();
      if (!activeSession) return;
    }

    setChatInput("");

    const tempId = `temp-${Date.now()}`;
    const optimisticMsg: ChatMessage = {
      id: tempId,
      session_id: activeSession.id,
      sender_type: "visitor",
      content: msgContent,
      created_at: new Date().toISOString(),
    };

    setChatMessages((prev) => [...prev, optimisticMsg]);
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);

    try {
      const action = aiMode ? "send-ai-chat-message" : "send-chat-message";
      const { data: fnData, error: fnError } = await supabase.functions.invoke("buyer-auth", {
        body: {
          action,
          panelId: resolvedPanelId,
          sessionId: activeSession.id,
          buyerId: buyer.id,
          content: msgContent,
        },
      });

      if (fnError || fnData?.error) {
        throw new Error(fnData?.error || fnError?.message);
      }

      if (aiMode && fnData?.userMessage) {
        setChatMessages((prev) => [
          ...prev.filter((m) => m.id !== tempId),
          fnData.userMessage,
          ...(fnData.aiMessage ? [fnData.aiMessage] : []),
        ]);
      } else if (fnData?.message) {
        setChatMessages((prev) => prev.map((m) => (m.id === tempId ? fnData.message : m)));
      }

      // Silent refresh of session list
      fetchChats(true);
    } catch (error: any) {
      console.error("Send message error:", error);
      toast({ variant: "destructive", title: error.message || "Failed to send message" });
      setChatInput(msgContent);
      setChatMessages((prev) => prev.filter((m) => m.id !== tempId));
    }
  };

  // Chat: create new session
  const handleStartChat = async (): Promise<ChatSession | null> => {
    if (!buyer?.id) {
      toast({ variant: "destructive", title: "Please log in to start a chat" });
      return null;
    }
    if (!resolvedPanelId) {
      toast({
        variant: "destructive",
        title: "Unable to connect",
        description: "Panel ID not found. Please refresh the page and try again.",
      });
      return null;
    }

    const hasActive = chatSessions.some((s) => s.status === "active" || s.status === "open");
    if (hasActive) {
      const active = chatSessions.find((s) => s.status === "active" || s.status === "open")!;
      setSelectedChat(active);
      toast({
        title: "Active chat exists",
        description: "Please end your current conversation before starting a new one.",
      });
      return active;
    }

    try {
      const { data: fnData, error: fnError } = await supabase.functions.invoke("buyer-auth", {
        body: {
          action: "create-chat-session",
          panelId: resolvedPanelId,
          buyerId: buyer.id,
          buyerName: buyer.full_name || buyer.email,
          buyerEmail: buyer.email,
        },
      });

      if (fnError || fnData?.error) {
        console.error("Chat creation error:", fnError || fnData?.error);
        toast({ variant: "destructive", title: fnData?.error || "Failed to start chat" });
        return null;
      }

      if (fnData?.session) {
        setChatSessions((prev) => [fnData.session, ...prev]);
        setSelectedChat(fnData.session);
        await fetchChatMessages(fnData.session.id);
        return fnData.session;
      }
      return null;
    } catch (err) {
      console.error("Chat start error:", err);
      toast({ variant: "destructive", title: "Failed to start chat" });
      return null;
    }
  };

  // Quick reply chips
  const quickReplies = [
    { label: "💰 Deposit Issue", text: "I need help with a deposit" },
    { label: "📦 Order Issue", text: "I have an issue with my order" },
    { label: "💳 Transaction", text: "I need help with a transaction" },
    { label: "🔑 Account", text: "I need help with my account" },
  ];

  const handleQuickReply = async (text: string) => {
    setChatInput(text);
    let session = selectedChat;
    if (!session) {
      session = await handleStartChat();
    }
    if (session) {
      setChatInput("");
      const tempId = `temp-${Date.now()}`;
      const optimisticMsg: ChatMessage = {
        id: tempId,
        session_id: session.id,
        sender_type: "visitor",
        content: text,
        created_at: new Date().toISOString(),
      };
      setChatMessages((prev) => [...prev, optimisticMsg]);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);

      try {
        const { data: fnData, error: fnError } = await supabase.functions.invoke("buyer-auth", {
          body: {
            action: "send-chat-message",
            panelId: resolvedPanelId,
            sessionId: session.id,
            buyerId: buyer?.id,
            content: text,
          },
        });

        if (fnError || fnData?.error) {
          throw new Error(fnData?.error || fnError?.message);
        }

        if (fnData?.message) {
          setChatMessages((prev) => prev.map((m) => (m.id === tempId ? fnData.message : m)));
        }

        fetchChats(true);
      } catch (error: any) {
        toast({ variant: "destructive", title: error.message || "Failed to send message" });
        setChatMessages((prev) => prev.filter((m) => m.id !== tempId));
      }
    }
  };

  const openTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsTicketViewOpen(true);
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter;
    const matchesSearch = ticket.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const kanbanColumns = [
    { id: "open", title: "Open", tickets: filteredTickets.filter((t) => t.status === "open") },
    { id: "in_progress", title: "In Progress", tickets: filteredTickets.filter((t) => t.status === "in_progress") },
    { id: "resolved", title: "Resolved", tickets: filteredTickets.filter((t) => t.status === "resolved") },
    { id: "closed", title: "Closed", tickets: filteredTickets.filter((t) => t.status === "closed") },
  ];

  if (panelLoading || authLoading) {
    return (
      <BuyerLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </BuyerLayout>
    );
  }

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
          <div className="hidden md:block">
            <Button onClick={() => setIsNewTicketOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              New Ticket
            </Button>
          </div>
        </motion.div>

        {/* Tabs: Tickets | Live Chat | FAQ */}
        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="chat" className="gap-2">
              <MessagesSquare className="w-4 h-4" />
              Live Chat
            </TabsTrigger>
            <TabsTrigger value="tickets" className="gap-2">
              <MessageSquare className="w-4 h-4" />
              Tickets
            </TabsTrigger>
            <TabsTrigger value="faq" className="gap-2">
              <HelpCircle className="w-4 h-4" />
              FAQ
            </TabsTrigger>
          </TabsList>

          {/* ===== TICKETS TAB ===== */}
          <TabsContent value="tickets" className="space-y-4 mt-4">
            <div className="flex flex-col md:flex-row gap-4">
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
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredTickets.length === 0 ? (
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
                        <Badge variant="secondary" className="ml-auto">
                          {column.tickets.length}
                        </Badge>
                      </div>
                      <div className="space-y-2 min-h-[200px] p-2 rounded-xl bg-muted/30">
                        <AnimatePresence>
                          {column.tickets.map((ticket) => (
                            <motion.div
                              key={ticket.id}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
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
                                      {ticket.messages.length} message{ticket.messages.length > 1 ? "s" : ""}
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
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* ===== LIVE CHAT TAB ===== */}
          <TabsContent value="chat" className="mt-4">
            <Card className="glass-card overflow-hidden">
              <CardContent className="p-0 flex flex-col" style={{ height: "calc(100vh - 280px)", minHeight: "400px" }}>
                {/* Chat Header */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50 bg-card/80">
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                    <MessagesSquare className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm">{panel?.name || "Support"}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Online
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant={chatFilter === "active" ? "default" : "ghost"}
                      size="sm"
                      className="text-xs h-7 px-2"
                      onClick={() => {
                        setChatFilter("active");
                        setSelectedChat(null);
                      }}
                    >
                      Active
                    </Button>
                    <Button
                      variant={chatFilter === "archived" ? "default" : "ghost"}
                      size="sm"
                      className="text-xs h-7 px-2"
                      onClick={() => {
                        setChatFilter("archived");
                        setSelectedChat(null);
                      }}
                    >
                      Archived
                    </Button>
                  </div>
                </div>

                {/* Messages Area */}
                <ScrollArea className="flex-1 px-4">
                  <div className="space-y-3 py-4">
                    {chatLoading && isFirstLoad.current ? (
                      <div className="flex justify-center py-12">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                      </div>
                    ) : chatFilter === "archived" ? (
                      !selectedChat ? (
                        <div className="space-y-2">
                          {chatSessions.filter((s) => s.status === "closed" || s.status === "archived").length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                              <Clock className="w-10 h-10 text-muted-foreground mb-3 opacity-50" />
                              <h3 className="font-semibold mb-1">No Chat History</h3>
                              <p className="text-sm text-muted-foreground">
                                Your previous conversations will appear here
                              </p>
                            </div>
                          ) : (
                            chatSessions
                              .filter((s) => s.status === "closed" || s.status === "archived")
                              .map((session) => (
                                <motion.div
                                  key={session.id}
                                  initial={{ opacity: 0, y: 5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="p-3 rounded-xl bg-muted/40 hover:bg-muted/60 cursor-pointer transition-colors"
                                  onClick={() => setSelectedChat(session)}
                                >
                                  <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium">Chat #{session.id.slice(0, 6)}</p>
                                    <Badge variant="secondary" className="text-[10px]">
                                      Ended
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {session.last_message_at
                                      ? new Date(session.last_message_at).toLocaleString()
                                      : new Date(session.created_at).toLocaleString()}
                                  </p>
                                </motion.div>
                              ))
                          )}
                        </div>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs gap-1 mb-2"
                            onClick={() => setSelectedChat(null)}
                          >
                            ← Back to history
                          </Button>
                          <div className="flex items-center justify-center mb-3">
                            <Badge variant="secondary" className="text-xs gap-1">
                              <Clock className="w-3 h-3" /> Conversation ended
                            </Badge>
                          </div>
                          {chatMessages.map((msg) => (
                            <motion.div
                              key={msg.id}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={cn("flex gap-2", msg.sender_type === "visitor" ? "flex-row-reverse" : "")}
                            >
                              <div
                                className={cn(
                                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium shrink-0",
                                  msg.sender_type === "visitor"
                                    ? "bg-primary text-primary-foreground"
                                    : msg.sender_type === "ai"
                                      ? "bg-violet-500 text-white"
                                      : "bg-muted text-muted-foreground",
                                )}
                              >
                                {msg.sender_type === "visitor" ? (
                                  buyer?.full_name?.[0] || "Y"
                                ) : msg.sender_type === "ai" ? (
                                  <Bot className="w-4 h-4" />
                                ) : (
                                  "S"
                                )}
                              </div>
                              <div
                                className={cn(
                                  "max-w-[75%] px-3 py-2 rounded-2xl text-sm",
                                  msg.sender_type === "visitor"
                                    ? "bg-primary text-primary-foreground rounded-br-sm"
                                    : msg.sender_type === "ai"
                                      ? "bg-violet-500/10 border border-violet-500/20 rounded-bl-sm"
                                      : "bg-muted rounded-bl-sm",
                                )}
                              >
                                {msg.sender_type === "ai" && (
                                  <p className="text-[10px] font-medium text-violet-500 mb-0.5">AI Assistant</p>
                                )}
                                <p className="whitespace-pre-wrap">{msg.content}</p>
                                <p
                                  className={cn(
                                    "text-[10px] mt-1",
                                    msg.sender_type === "visitor"
                                      ? "text-primary-foreground/60"
                                      : "text-muted-foreground",
                                  )}
                                >
                                  {new Date(msg.created_at).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </p>
                              </div>
                            </motion.div>
                          ))}
                          <div ref={chatEndRef} />
                        </>
                      )
                    ) : (
                      (() => {
                        const activeSession = chatSessions.find((s) => s.status === "active" || s.status === "open");
                        const currentChat = selectedChat || activeSession;

                        if (!currentChat) {
                          return (
                            <div className="flex flex-col items-center justify-center py-16 text-center">
                              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                <MessagesSquare className="w-8 h-8 text-primary" />
                              </div>
                              <h3 className="font-semibold mb-1">Start a Conversation</h3>
                              <p className="text-sm text-muted-foreground mb-4">
                                Type a message below or tap a quick reply to chat with support
                              </p>
                            </div>
                          );
                        }

                        if (!selectedChat && activeSession) {
                          setTimeout(() => setSelectedChat(activeSession), 0);
                        }

                        return (
                          <>
                            {chatMessages.map((msg) => (
                              <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={cn("flex gap-2", msg.sender_type === "visitor" ? "flex-row-reverse" : "")}
                              >
                                <div
                                  className={cn(
                                    "w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium shrink-0",
                                    msg.sender_type === "visitor"
                                      ? "bg-primary text-primary-foreground"
                                      : msg.sender_type === "ai"
                                        ? "bg-violet-500 text-white"
                                        : "bg-muted text-muted-foreground",
                                  )}
                                >
                                  {msg.sender_type === "visitor" ? (
                                    buyer?.full_name?.[0] || "Y"
                                  ) : msg.sender_type === "ai" ? (
                                    <Bot className="w-4 h-4" />
                                  ) : (
                                    "S"
                                  )}
                                </div>
                                <div
                                  className={cn(
                                    "max-w-[75%] px-3 py-2 rounded-2xl text-sm",
                                    msg.sender_type === "visitor"
                                      ? "bg-primary text-primary-foreground rounded-br-sm"
                                      : msg.sender_type === "ai"
                                        ? "bg-violet-500/10 border border-violet-500/20 rounded-bl-sm"
                                        : "bg-muted rounded-bl-sm",
                                  )}
                                >
                                  {msg.sender_type === "ai" && (
                                    <p className="text-[10px] font-medium text-violet-500 mb-0.5">AI Assistant</p>
                                  )}
                                  <p className="whitespace-pre-wrap">{msg.content}</p>
                                  <p
                                    className={cn(
                                      "text-[10px] mt-1",
                                      msg.sender_type === "visitor"
                                        ? "text-primary-foreground/60"
                                        : "text-muted-foreground",
                                    )}
                                  >
                                    {new Date(msg.created_at).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </p>
                                </div>
                              </motion.div>
                            ))}
                            {/* AI mode indicator + toggle + End Chat */}
                            {chatMessages.length > 0 && currentChat.status !== "closed" && (
                              <div className="flex flex-col items-center gap-2 pt-3">
                                {aiMode && (
                                  <Badge variant="secondary" className="gap-1 text-xs">
                                    <Bot className="w-3 h-3" /> AI Mode Active
                                  </Badge>
                                )}
                                <div className="flex gap-2">
                                  <Button
                                    variant={aiMode ? "default" : "outline"}
                                    size="sm"
                                    className="text-xs gap-1.5 rounded-full"
                                    onClick={() => setAiMode(!aiMode)}
                                  >
                                    <Bot className="w-3 h-3" /> {aiMode ? "Continue with Human" : "Continue with AI"}
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    className="text-xs gap-1.5 rounded-full"
                                    onClick={handleEndChatClick} // Changed to open dialog
                                  >
                                    <XCircle className="w-3 h-3" /> End Chat
                                  </Button>
                                </div>
                              </div>
                            )}
                            <div ref={chatEndRef} />
                          </>
                        );
                      })()
                    )}
                  </div>
                </ScrollArea>

                {/* Quick Replies */}
                {chatFilter === "active" && !chatSessions.find((s) => s.status === "active" || s.status === "open") && (
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
                {chatFilter === "active" && (!selectedChat || selectedChat.status !== "closed") && (
                  <div className="px-4 py-3 border-t border-border/50 bg-card/80">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Type a message..."
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={async (e) => {
                          if (e.key === "Enter" && chatInput.trim()) {
                            const hasActive = chatSessions.some((s) => s.status === "active" || s.status === "open");
                            let session = selectedChat;
                            if (!session && !hasActive) {
                              session = await handleStartChat();
                            } else if (!session && hasActive) {
                              const active = chatSessions.find((s) => s.status === "active" || s.status === "open");
                              if (active) {
                                setSelectedChat(active);
                                session = active;
                              }
                            }
                            if (session) handleSendChatMessage(session);
                          }
                        }}
                        className="bg-muted/50 border-0"
                      />
                      <Button
                        size="icon"
                        disabled={!chatInput.trim()}
                        onClick={async () => {
                          const hasActive = chatSessions.some((s) => s.status === "active" || s.status === "open");
                          let session = selectedChat;
                          if (!session && !hasActive) {
                            session = await handleStartChat();
                          } else if (!session && hasActive) {
                            const active = chatSessions.find((s) => s.status === "active" || s.status === "open");
                            if (active) {
                              setSelectedChat(active);
                              session = active;
                            }
                          }
                          if (session) handleSendChatMessage(session);
                        }}
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===== FAQ TAB ===== */}
          <TabsContent value="faq" className="mt-4">
            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <HelpCircle className="w-6 h-6 text-primary" />
                  </div>
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
                      <AccordionContent className="text-sm text-muted-foreground">{faq.answer}</AccordionContent>
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
                />
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={newTicket.priority} onValueChange={(v) => setNewTicket({ ...newTicket, priority: v })}>
                  <SelectTrigger>
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
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsNewTicketOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTicket} disabled={submitting}>
                {submitting ? "Creating..." : "Create Ticket"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Ticket View Dialog */}
        <Dialog open={isTicketViewOpen} onOpenChange={setIsTicketViewOpen}>
          <DialogContent className="glass-card max-w-lg max-h-[80vh] flex flex-col">
            <DialogHeader>
              <div className="space-y-1">
                <DialogTitle className="pr-8">{selectedTicket?.subject}</DialogTitle>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={cn(statusConfig[selectedTicket?.status || "open"].color)}>
                    {statusConfig[selectedTicket?.status || "open"].label}
                  </Badge>
                  <Badge className={cn(priorityConfig[selectedTicket?.priority || "medium"])}>
                    {selectedTicket?.priority}
                  </Badge>
                  {(selectedTicket?.status === "open" || selectedTicket?.status === "in_progress") && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="ml-auto text-xs gap-1"
                        onClick={() => selectedTicket && handleResolveTicket(selectedTicket.id)}
                      >
                        <CheckCircle className="w-3 h-3" />
                        Resolve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="text-xs gap-1"
                        onClick={() => selectedTicket && handleCloseTicket(selectedTicket.id)}
                      >
                        <XCircle className="w-3 h-3" />
                        Close
                      </Button>
                    </>
                  )}
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
                      msg.sender === "buyer" || msg.sender === "user"
                        ? "ml-auto bg-primary text-primary-foreground"
                        : "bg-muted",
                    )}
                  >
                    <p className="text-sm">{msg.content}</p>
                    <p
                      className={cn(
                        "text-xs mt-1",
                        msg.sender === "buyer" || msg.sender === "user"
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground",
                      )}
                    >
                      {new Date(msg.timestamp).toLocaleString()}
                    </p>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
            {selectedTicket?.status !== "closed" && selectedTicket?.status !== "resolved" && (
              <div className="flex gap-2 pt-4 border-t">
                <Input
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <Button onClick={handleSendMessage} disabled={submitting || !newMessage.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* End Chat Confirmation Dialog */}
        <Dialog open={isEndChatDialogOpen} onOpenChange={setIsEndChatDialogOpen}>
          <DialogContent className="glass-card">
            <DialogHeader>
              <DialogTitle>End Conversation?</DialogTitle>
              <DialogDescription>
                Are you sure you want to end this chat session? You won't be able to send new messages after closing.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setIsEndChatDialogOpen(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmEndChat}>
                Yes, End Chat
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Rating Dialog */}
        <Dialog open={isRatingDialogOpen} onOpenChange={setIsRatingDialogOpen}>
          <DialogContent className="glass-card">
            <DialogHeader>
              <DialogTitle>How was your experience?</DialogTitle>
              <DialogDescription>Please rate your support conversation to help us improve.</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setChatRating(star)}
                    className="p-2 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={cn(
                        "w-8 h-8",
                        star <= chatRating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground",
                      )}
                    />
                  </button>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                {chatRating > 0
                  ? `You rated this ${chatRating} star${chatRating > 1 ? "s" : ""}`
                  : "Tap a star to rate"}
              </p>
            </div>
            <DialogFooter className="gap-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setIsRatingDialogOpen(false);
                  setChatRating(0);
                  setSelectedChat(null);
                }}
              >
                Skip
              </Button>
              <Button disabled={chatRating === 0} onClick={() => submitRating(chatRating)}>
                Submit Rating
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </BuyerLayout>
  );
};

export default BuyerSupport;
