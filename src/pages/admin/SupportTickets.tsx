import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Search,
  User,
  Calendar,
  ArrowUpRight,
  Inbox,
  RefreshCw,
  Send,
  Reply,
  Crown
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface TicketMessage {
  id: string;
  content: string;
  sender: string;
  sender_type: 'user' | 'admin';
  created_at: string;
}

interface Ticket {
  id: string;
  subject: string;
  status: string;
  priority: string;
  created_at: string;
  ticket_type?: string;
  messages?: TicketMessage[];
  user?: {
    email: string;
    full_name: string;
  };
  panel?: {
    name: string;
  };
}

const defaultQuickReplies = [
  "Thank you for contacting support. We're looking into your issue.",
  "Your issue has been resolved. Please let us know if you need further assistance.",
  "We need more information to help you. Please provide additional details.",
  "This has been escalated to our technical team."
];

const SupportTickets = () => {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [ticketTypeFilter, setTicketTypeFilter] = useState<'all' | 'user_to_panel' | 'panel_to_admin'>('all');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [newPriority, setNewPriority] = useState('');
  const [quickReplies, setQuickReplies] = useState<string[]>(defaultQuickReplies);

  useEffect(() => {
    fetchTickets();
    fetchQuickReplies();
  }, []);

  const fetchQuickReplies = async () => {
    try {
      const { data } = await supabase
        .from('platform_settings')
        .select('setting_value')
        .eq('setting_key', 'quick_replies')
        .maybeSingle();
      if (data?.setting_value) {
        const parsed = Array.isArray(data.setting_value) ? data.setting_value : [];
        if (parsed.length > 0) setQuickReplies(parsed as string[]);
      }
    } catch (error) {
      console.error('Error fetching quick replies:', error);
    }
  };

  const fetchTickets = async () => {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*, user:profiles(email, full_name), panel:panels(name)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTickets((data || []) as unknown as Ticket[]);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const openTicketDetails = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setNewStatus(ticket.status);
    setNewPriority(ticket.priority);
    setReplyText('');
    setDetailsDialogOpen(true);
  };

  const handleSendReply = async () => {
    if (!selectedTicket || !replyText.trim()) return;

    try {
      const currentMessages = Array.isArray(selectedTicket.messages) ? selectedTicket.messages : [];
      const newMessage = {
        id: crypto.randomUUID(),
        content: replyText,
        sender: 'Admin',
        sender_type: 'admin',
        created_at: new Date().toISOString()
      };

      await supabase
        .from('support_tickets')
        .update({
          messages: [...currentMessages, newMessage] as any,
          status: newStatus,
          priority: newPriority
        })
        .eq('id', selectedTicket.id);

      toast({
        title: "Reply Sent",
        description: "Your reply has been sent to the user"
      });

      setReplyText('');
      fetchTickets();
      setDetailsDialogOpen(false);
    } catch (error) {
      console.error('Error sending reply:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send reply"
      });
    }
  };

  const updateTicketStatus = async (ticketId: string, status: string) => {
    try {
      await supabase
        .from('support_tickets')
        .update({ status })
        .eq('id', ticketId);

      toast({
        title: "Status Updated",
        description: `Ticket marked as ${status}`
      });
      fetchTickets();
    } catch (error) {
      console.error('Error updating ticket:', error);
    }
  };

  const kanbanColumns = [
    { 
      title: 'Open', 
      status: 'open', 
      icon: Inbox, 
      color: 'from-amber-500 to-amber-600',
      bg: 'bg-amber-500/10',
      textColor: 'text-amber-500'
    },
    { 
      title: 'In Progress', 
      status: 'in_progress', 
      icon: Clock, 
      color: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-500/10',
      textColor: 'text-blue-500'
    },
    { 
      title: 'Resolved', 
      status: 'resolved', 
      icon: CheckCircle, 
      color: 'from-emerald-500 to-emerald-600',
      bg: 'bg-emerald-500/10',
      textColor: 'text-emerald-500'
    }
  ];

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      high: 'bg-red-500/20 text-red-500',
      medium: 'bg-amber-500/20 text-amber-500',
      low: 'bg-slate-500/20 text-slate-500'
    };
    return colors[priority] || colors.medium;
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = ticketTypeFilter === 'all' || ticket.ticket_type === ticketTypeFilter;
    return matchesSearch && matchesType;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4 md:space-y-6"
    >
      <Helmet>
        <title>Support Tickets - Admin</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Support Tickets</h1>
          <p className="text-muted-foreground">Manage and respond to user support requests</p>
        </div>
        <Button onClick={fetchTickets} variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card-hover">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <MessageSquare className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Tickets</p>
            </div>
          </CardContent>
        </Card>
        {kanbanColumns.map(col => (
          <Card key={col.status} className="glass-card-hover">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={cn("p-2 rounded-lg", col.bg)}>
                <col.icon className={cn("w-5 h-5", col.textColor)} />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {col.status === 'open' ? stats.open : col.status === 'in_progress' ? stats.inProgress : stats.resolved}
                </p>
                <p className="text-xs text-muted-foreground">{col.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Search and Filter */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search tickets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={ticketTypeFilter} onValueChange={(value: 'all' | 'user_to_panel' | 'panel_to_admin') => setTicketTypeFilter(value)}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tickets</SelectItem>
            <SelectItem value="user_to_panel">User Tickets</SelectItem>
            <SelectItem value="panel_to_admin">Panel Owner Tickets</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Kanban Board */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {kanbanColumns.map((column) => {
          const columnTickets = filteredTickets.filter(t => t.status === column.status);
          const Icon = column.icon;
          
          return (
            <div key={column.status} className="space-y-4">
              {/* Column Header */}
              <div className="glass-card p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-lg bg-gradient-to-br", column.color)}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{column.title}</h3>
                      <p className="text-xs text-muted-foreground">{columnTickets.length} tickets</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={column.bg}>
                    {columnTickets.length}
                  </Badge>
                </div>
              </div>

              {/* Column Items */}
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {loading ? (
                  [1, 2, 3].map(i => (
                    <div key={i} className="h-28 bg-muted rounded-xl animate-pulse" />
                  ))
                ) : columnTickets.length === 0 ? (
                  <div className="glass-card p-6 text-center">
                    <Icon className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">No {column.title.toLowerCase()} tickets</p>
                  </div>
                ) : (
                  columnTickets.map((ticket) => (
                    <motion.div
                      key={ticket.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="glass-card-hover p-4 space-y-3 cursor-pointer group"
                      onClick={() => openTicketDetails(ticket)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium text-sm group-hover:text-primary transition-colors line-clamp-2">
                          {ticket.subject}
                        </p>
                        <Badge className={cn("text-xs shrink-0", getPriorityBadge(ticket.priority))}>
                          {ticket.priority}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <User className="w-3 h-3" />
                        <span className="truncate">{ticket.user?.full_name || ticket.user?.email || 'Unknown'}</span>
                        {ticket.ticket_type === 'panel_to_admin' && (
                          <Badge variant="outline" className="text-[10px] bg-violet-500/10 text-violet-500 border-violet-500/20">
                            <Crown className="w-2 h-2 mr-0.5" />
                            Panel Owner
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(ticket.created_at).toLocaleDateString()}
                        </div>
                        {ticket.panel && (
                          <span className="truncate max-w-[100px]">{ticket.panel.name}</span>
                        )}
                      </div>
                      
                      <div className="invisible group-hover:visible transition-[visibility]">
                        <Button size="sm" variant="outline" className="w-full text-xs gap-1">
                          View & Reply <ArrowUpRight className="w-3 h-3" />
                        </Button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* Ticket Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-2xl mx-4 sm:mx-auto max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              {selectedTicket?.subject}
            </DialogTitle>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-4 mt-4">
              {/* Ticket Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-accent/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">User</p>
                  <p className="font-medium">{selectedTicket.user?.full_name || selectedTicket.user?.email}</p>
                </div>
                <div className="p-3 bg-accent/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Created</p>
                  <p className="font-medium">{new Date(selectedTicket.created_at).toLocaleString()}</p>
                </div>
              </div>

              {/* Status & Priority Controls */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={newStatus} onValueChange={setNewStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={newPriority} onValueChange={setNewPriority}>
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
              </div>

              {/* Message History */}
              <div className="space-y-2">
                <Label>Message History</Label>
                <div className="border border-border rounded-lg p-4 max-h-60 overflow-y-auto space-y-3">
                  {Array.isArray(selectedTicket.messages) && selectedTicket.messages.length > 0 ? (
                    selectedTicket.messages.map((msg: TicketMessage) => (
                      <div
                        key={msg.id}
                        className={cn(
                          "p-3 rounded-lg",
                          msg.sender_type === 'admin' ? 'bg-primary/10 ml-8' : 'bg-accent/50 mr-8'
                        )}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium">{msg.sender}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(msg.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm">{msg.content}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">No messages yet</p>
                  )}
                </div>
              </div>

              {/* Quick Replies */}
              <div className="space-y-2">
                <Label>Quick Replies</Label>
                <div className="flex flex-wrap gap-2">
                  {quickReplies.map((reply, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => setReplyText(reply)}
                    >
                      {reply.substring(0, 30)}...
                    </Button>
                  ))}
                </div>
              </div>

              {/* Reply Input */}
              <div className="space-y-2">
                <Label>Your Reply</Label>
                <Textarea
                  placeholder="Type your reply here..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          )}
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setDetailsDialogOpen(false)} className="w-full sm:w-auto">Cancel</Button>
            <Button onClick={handleSendReply} disabled={!replyText.trim()} className="w-full sm:w-auto">
              <Send className="w-4 h-4 mr-2" />
              Send Reply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default SupportTickets;
