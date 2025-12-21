import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  RefreshCw
} from "lucide-react";
import { Helmet } from "react-helmet-async";
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface Ticket {
  id: string;
  subject: string;
  status: string;
  priority: string;
  created_at: string;
  user?: {
    email: string;
    full_name: string;
  };
  panel?: {
    name: string;
  };
}

const SupportTickets = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const { data } = await supabase
        .from('support_tickets')
        .select(`
          *,
          user:profiles!support_tickets_user_id_fkey(email, full_name),
          panel:panels(name)
        `)
        .order('created_at', { ascending: false });

      setTickets((data || []) as Ticket[]);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
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

  const filteredTickets = tickets.filter(ticket =>
    ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      className="space-y-6"
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

      {/* Search */}
      <motion.div variants={itemVariants} className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search tickets..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
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
                      
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="sm" variant="outline" className="w-full text-xs gap-1">
                          View Details <ArrowUpRight className="w-3 h-3" />
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
    </motion.div>
  );
};

export default SupportTickets;
