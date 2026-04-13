import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MessageCircle, 
  Send, 
  Search, 
  Clock, 
  CheckCheck,
  Loader2,
  Archive,
  MoreVertical,
  Zap,
  Plus,
  Settings,
  Trash2,
  ArrowLeft,
  DollarSign,
  ShoppingCart,
  CheckCircle,
  History,
  Bot
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

interface ChatSession {
  id: string;
  panel_id: string;
  visitor_id: string;
  visitor_name: string | null;
  visitor_email: string | null;
  status: string;
  last_message_at: string;
  created_at: string;
  unread_count?: number;
  last_message?: string;
}

type SenderType = 'visitor' | 'owner' | 'ai';

interface ChatMessage {
  id: string;
  session_id: string;
  sender_type: SenderType;
  content: string;
  is_read: boolean;
  created_at: string;
}

interface CannedResponse {
  id: string;
  title: string;
  content: string;
  shortcut: string | null;
  category: string;
  usage_count?: number;
}

interface ChatInboxProps {
  embedded?: boolean;
}

const ChatInbox = ({ embedded = false }: ChatInboxProps) => {
  const { profile } = useAuth();
  const isMobile = useIsMobile();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'active' | 'archived'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [panelId, setPanelId] = useState<string | null>(null);
  const [cannedResponses, setCannedResponses] = useState<CannedResponse[]>([]);
  const [cannedDialogOpen, setCannedDialogOpen] = useState(false);
  const [editingCanned, setEditingCanned] = useState<CannedResponse | null>(null);
  const [cannedForm, setCannedForm] = useState({ title: '', content: '', shortcut: '', category: 'general' });
  const [visitorTyping, setVisitorTyping] = useState(false);
  const [chatSheetOpen, setChatSheetOpen] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevSessionsHash = useRef<string>('');
  const prevMessagesLength = useRef<number>(0);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Get panel ID
  useEffect(() => {
    const fetchPanelId = async () => {
      if (!profile?.id) return;
      const { data } = await supabase.from('panels').select('id').eq('owner_id', profile.id).limit(1).maybeSingle();
      if (data) setPanelId(data.id);
    };
    fetchPanelId();
  }, [profile?.id]);

  // Fetch Canned Responses
  useEffect(() => {
    if (!panelId) return;
    const fetchCanned = async () => {
      const { data } = await supabase.from('canned_responses').select('*').eq('panel_id', panelId).order('usage_count', { ascending: false });
      if (data) setCannedResponses(data);
    };
    fetchCanned();
  }, [panelId]);

  // Fetch Sessions
  const fetchSessions = useCallback(async () => {
    if (!panelId) return;
    const status = filter === 'active' ? 'active' : 'closed';
    const { data, error } = await supabase.from('chat_sessions').select('*').eq('panel_id', panelId).eq('status', status).order('last_message_at', { ascending: false });
    if (error) return;

    const sessionsWithDetails = await Promise.all((data || []).map(async (session) => {
      const { count } = await supabase.from('chat_messages').select('*', { count: 'exact', head: true }).eq('session_id', session.id).eq('sender_type', 'visitor').eq('is_read', false);
      const { data: lastMsg } = await supabase.from('chat_messages').select('content').eq('session_id', session.id).order('created_at', { ascending: false }).limit(1).single();
      return { ...session, unread_count: count || 0, last_message: lastMsg?.content || 'No messages yet' };
    }));

    const currentHash = JSON.stringify(sessionsWithDetails.map(s => ({ id: s.id, last: s.last_message_at })));
    if (prevSessionsHash.current !== currentHash) {
      prevSessionsHash.current = currentHash;
      setSessions(sessionsWithDetails);
    }
  }, [panelId, filter]);

  useEffect(() => {
    if (!panelId) return;
    setLoading(true);
    fetchSessions().finally(() => setLoading(false));

    const channel = supabase.channel('chat-sessions-panel').on('postgres_changes', { event: '*', schema: 'public', table: 'chat_sessions', filter: `panel_id=eq.${panelId}` }, () => fetchSessions()).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [panelId, filter, fetchSessions]);

  // Fetch messages
  useEffect(() => {
    if (!selectedSession) return;

    const fetchMessages = async () => {
      const { data } = await supabase.from('chat_messages').select('*').eq('session_id', selectedSession.id).order('created_at', { ascending: true });
      if (data) setMessages(data as ChatMessage[]);
      await supabase.from('chat_messages').update({ is_read: true }).eq('session_id', selectedSession.id).eq('sender_type', 'visitor').eq('is_read', false);
    };

    fetchMessages();

    const channel = supabase.channel(`chat-messages-panel-${selectedSession.id}`).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `session_id=eq.${selectedSession.id}` }, (payload) => {
      const newMsg = payload.new as ChatMessage;
      setMessages(prev => {
        if (prev.some(m => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
      if (newMsg.sender_type === 'visitor') supabase.from('chat_messages').update({ is_read: true }).eq('id', newMsg.id);
    }).subscribe();

    const typingChannel = supabase.channel(`typing-in-${selectedSession.id}`).on('broadcast', { event: 'typing' }, (payload) => {
      if (payload.payload.sender_type === 'visitor') {
        setVisitorTyping(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => setVisitorTyping(false), 3000);
      }
    }).subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(typingChannel);
    };
  }, [selectedSession]);

  // FIXED AUTO SCROLL: Only scrolls if a NEW message is added. Doesn't scroll when you type.
  useEffect(() => {
    if (messages.length > prevMessagesLength.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      prevMessagesLength.current = messages.length;
    }
  }, [messages]);

  const handleSendMessage = useCallback(async (content: string) => {
    if (!selectedSession) return;
    try {
      await supabase.from('chat_messages').insert({ session_id: selectedSession.id, sender_type: 'owner', content });
      await supabase.from('chat_sessions').update({ last_message_at: new Date().toISOString() }).eq('id', selectedSession.id);
      fetchSessions();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Failed to send message' });
    }
  }, [selectedSession, fetchSessions]);

  const archiveSession = async (session: ChatSession) => {
    try {
      await supabase.from('chat_sessions').update({ status: 'closed' }).eq('id', session.id);
      if (selectedSession?.id === session.id) { setSelectedSession(null); setChatSheetOpen(false); }
      fetchSessions();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Failed to archive chat' });
    }
  };

  const navigate = useNavigate();

  const filteredSessions = sessions.filter(s => 
    (s.visitor_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     s.visitor_email?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatTime = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className={cn("flex gap-4", embedded ? "h-[calc(100vh-200px)]" : "h-[calc(100vh-120px)]")}>
      {/* Sessions List */}
      <Card className="w-96 flex flex-col shrink-0">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold flex items-center gap-2"><MessageCircle className="w-5 h-5" />Live Chat</h2>
            <Button variant="ghost" size="icon" onClick={() => setCannedDialogOpen(true)}><Settings className="w-4 h-4" /></Button>
          </div>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
          </div>
          <Tabs value={filter} onValueChange={(v) => setFilter(v as 'active' | 'archived')}>
            <TabsList className="w-full"><TabsTrigger value="active" className="flex-1">Active</TabsTrigger><TabsTrigger value="archived" className="flex-1">Archived</TabsTrigger></TabsList>
          </Tabs>
        </div>

        <ScrollArea className="flex-1">
          {loading ? <div className="flex justify-center py-8"><Loader2 className="animate-spin" /></div> : filteredSessions.length === 0 ? <div className="text-center py-8 text-muted-foreground">No conversations yet</div> : (
            filteredSessions.map((session) => (
              <div key={session.id} onClick={() => { setSelectedSession(session); if (isMobile) setChatSheetOpen(true); }} className={cn("p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors", selectedSession?.id === session.id && "bg-muted")}>
                <div className="flex items-start gap-3">
                  <Avatar><AvatarFallback>{session.visitor_name?.[0] || 'V'}</AvatarFallback></Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between mb-1"><span className="font-medium truncate">{session.visitor_name || 'Visitor'}</span><span className="text-xs text-muted-foreground">{formatTime(session.last_message_at)}</span></div>
                    <p className="text-sm text-muted-foreground truncate">{session.last_message}</p>
                  </div>
                  {(session.unread_count || 0) > 0 && <Badge>{session.unread_count}</Badge>}
                </div>
              </div>
            ))
          )}
        </ScrollArea>
      </Card>

      {/* Chat Area */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        {selectedSession ? (
          <>
            <div className="p-4 border-b flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <Avatar><AvatarFallback>{selectedSession.visitor_name?.[0] || 'V'}</AvatarFallback></Avatar>
                <div>
                  <h3 className="font-semibold">{selectedSession.visitor_name || 'Visitor'}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-3 h-3" />Started {new Date(selectedSession.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => archiveSession(selectedSession)}>Archive Chat</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={cn("flex gap-2", msg.sender_type === 'owner' ? "flex-row-reverse" : "")}>
                    <Avatar className="shrink-0"><AvatarFallback className={cn(msg.sender_type === 'owner' && "bg-primary text-primary-foreground")}>{msg.sender_type === 'owner' ? 'Y' : 'V'}</AvatarFallback></Avatar>
                    <div className={cn("max-w-[75%] rounded-2xl px-4 py-2", msg.sender_type === 'owner' ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted rounded-bl-sm")}>
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
                {visitorTyping && <div className="text-xs text-muted-foreground">User is typing...</div>}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* FIXED UNCONTROLLED KEYBOARD MODULE */}
            <ZeroLagInput 
              key={selectedSession.id}
              sessionId={selectedSession.id} 
              onSend={handleSendMessage} 
              cannedResponses={cannedResponses} 
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">Select a conversation to start messaging.</div>
        )}
      </Card>
    </div>
  );
};

// ZERO-LAG UNCONTROLLED INPUT (No keystroke freezes)
interface ZeroLagProps {
  sessionId: string;
  onSend: (content: string) => Promise<void>;
  cannedResponses: CannedResponse[];
}

const ZeroLagInput = memo(({ sessionId, onSend, cannedResponses }: ZeroLagProps) => {
  const [sending, setSending] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const lastTypingTimeRef = useRef<number>(0);

  const handleSend = async () => {
    const text = inputRef.current?.value.trim();
    if (!text || sending) return;
    setSending(true);
    await onSend(text);
    if (inputRef.current) inputRef.current.value = ''; // Direct reset
    setSending(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const broadcastTyping = useCallback(() => {
    const now = Date.now();
    if (now - lastTypingTimeRef.current > 3000) {
      lastTypingTimeRef.current = now;
      supabase.channel(`typing-out-${sessionId}`).send({
        type: 'broadcast',
        event: 'typing',
        payload: { sender_type: 'owner' }
      });
    }
  }, [sessionId]);

  return (
    <div className="p-4 border-t pb-safe bg-card shrink-0">
      {cannedResponses.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {cannedResponses.slice(0, 5).map((response) => (
            <Button key={response.id} variant="outline" size="sm" onClick={() => { if (inputRef.current) inputRef.current.value = response.content; }} className="text-xs">
              <Zap className="w-3 h-3 mr-1" />{response.title}
            </Button>
          ))}
        </div>
      )}
      <div className="flex items-end gap-2">
        <Textarea
          ref={inputRef}
          onChange={broadcastTyping}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder="Type a reply..."
          className="flex-1 min-h-[44px] max-h-32 resize-none"
          rows={1}
        />
        <Button onClick={handleSend} disabled={sending}>
          {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
});

export default ChatInbox;
