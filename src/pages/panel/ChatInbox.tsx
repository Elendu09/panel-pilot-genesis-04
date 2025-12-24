import { useState, useEffect, useRef, useCallback } from 'react';
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
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

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

type SenderType = 'visitor' | 'owner';

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
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'active' | 'archived'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [panelId, setPanelId] = useState<string | null>(null);
  const [cannedResponses, setCannedResponses] = useState<CannedResponse[]>([]);
  const [cannedDialogOpen, setCannedDialogOpen] = useState(false);
  const [editingCanned, setEditingCanned] = useState<CannedResponse | null>(null);
  const [cannedForm, setCannedForm] = useState({ title: '', content: '', shortcut: '', category: 'general' });
  const [visitorTyping, setVisitorTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get panel ID
  useEffect(() => {
    const fetchPanelId = async () => {
      if (!profile?.id) return;
      
      const { data } = await supabase
        .from('panels')
        .select('id')
        .eq('owner_id', profile.id)
        .single();
      
      if (data) {
        setPanelId(data.id);
      }
    };

    fetchPanelId();
  }, [profile?.id]);

  // Fetch canned responses
  useEffect(() => {
    if (!panelId) return;

    const fetchCannedResponses = async () => {
      const { data } = await supabase
        .from('canned_responses')
        .select('*')
        .eq('panel_id', panelId)
        .order('usage_count', { ascending: false });

      if (data) {
        setCannedResponses(data);
      }
    };

    fetchCannedResponses();
  }, [panelId]);

  // Fetch chat sessions
  useEffect(() => {
    if (!panelId) return;

    const fetchSessions = async () => {
      setLoading(true);
      const status = filter === 'active' ? 'active' : 'closed';
      
      const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('panel_id', panelId)
        .eq('status', status)
        .order('last_message_at', { ascending: false });

      if (error) {
        console.error('Error fetching sessions:', error);
        return;
      }

      // Get unread counts and last messages
      const sessionsWithDetails = await Promise.all((data || []).map(async (session) => {
        const { count } = await supabase
          .from('chat_messages')
          .select('*', { count: 'exact', head: true })
          .eq('session_id', session.id)
          .eq('sender_type', 'visitor')
          .eq('is_read', false);

        const { data: lastMsg } = await supabase
          .from('chat_messages')
          .select('content')
          .eq('session_id', session.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        return {
          ...session,
          unread_count: count || 0,
          last_message: lastMsg?.content || 'No messages yet'
        };
      }));

      setSessions(sessionsWithDetails);
      setLoading(false);
    };

    fetchSessions();

    // Subscribe to new sessions
    const channel = supabase
      .channel('chat-sessions-panel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_sessions',
          filter: `panel_id=eq.${panelId}`
        },
        () => {
          fetchSessions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [panelId, filter]);

  // Fetch messages for selected session
  useEffect(() => {
    if (!selectedSession) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', selectedSession.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      setMessages((data || []).map(m => ({
        ...m,
        sender_type: m.sender_type as SenderType
      })));

      // Mark messages as read
      await supabase
        .from('chat_messages')
        .update({ is_read: true })
        .eq('session_id', selectedSession.id)
        .eq('sender_type', 'visitor')
        .eq('is_read', false);
    };

    fetchMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`chat-messages-panel-${selectedSession.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `session_id=eq.${selectedSession.id}`
        },
        (payload) => {
          const newMsg = payload.new as ChatMessage;
          setMessages(prev => {
            if (prev.some(m => m.id === newMsg.id)) return prev;
            return [...prev, { ...newMsg, sender_type: newMsg.sender_type as SenderType }];
          });

          // Mark as read if from visitor
          if (newMsg.sender_type === 'visitor') {
            supabase
              .from('chat_messages')
              .update({ is_read: true })
              .eq('id', newMsg.id);
          }
        }
      )
      .subscribe();

    // Typing indicator subscription
    const typingChannel = supabase
      .channel(`typing-${selectedSession.id}`)
      .on('broadcast', { event: 'typing' }, (payload) => {
        if (payload.payload.sender_type === 'visitor') {
          setVisitorTyping(true);
          if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
          }
          typingTimeoutRef.current = setTimeout(() => {
            setVisitorTyping(false);
          }, 3000);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(typingChannel);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [selectedSession]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Broadcast typing status
  const broadcastTyping = useCallback(() => {
    if (!selectedSession) return;
    
    supabase.channel(`typing-${selectedSession.id}`).send({
      type: 'broadcast',
      event: 'typing',
      payload: { sender_type: 'owner' }
    });
  }, [selectedSession]);

  const sendMessage = async (content?: string) => {
    const messageContent = content || newMessage.trim();
    if (!messageContent || !selectedSession) return;

    setSending(true);
    if (!content) setNewMessage('');

    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          session_id: selectedSession.id,
          sender_type: 'owner',
          content: messageContent
        });

      if (error) throw error;

      // Update session last_message_at
      await supabase
        .from('chat_sessions')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', selectedSession.id);

      inputRef.current?.focus();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({ variant: 'destructive', title: 'Failed to send message' });
      if (!content) setNewMessage(messageContent);
    } finally {
      setSending(false);
    }
  };

  const useCannedResponse = async (response: CannedResponse) => {
    setNewMessage(response.content);
    inputRef.current?.focus();

    // Increment usage count
    await supabase
      .from('canned_responses')
      .update({ usage_count: (response.usage_count || 0) + 1 })
      .eq('id', response.id);
  };

  const saveCannedResponse = async () => {
    if (!panelId || !cannedForm.title || !cannedForm.content) {
      toast({ variant: 'destructive', title: 'Please fill in title and content' });
      return;
    }

    try {
      if (editingCanned) {
        await supabase
          .from('canned_responses')
          .update({
            title: cannedForm.title,
            content: cannedForm.content,
            shortcut: cannedForm.shortcut || null,
            category: cannedForm.category
          })
          .eq('id', editingCanned.id);
      } else {
        await supabase
          .from('canned_responses')
          .insert({
            panel_id: panelId,
            title: cannedForm.title,
            content: cannedForm.content,
            shortcut: cannedForm.shortcut || null,
            category: cannedForm.category
          });
      }

      // Refresh canned responses
      const { data } = await supabase
        .from('canned_responses')
        .select('*')
        .eq('panel_id', panelId)
        .order('usage_count', { ascending: false });

      if (data) setCannedResponses(data);

      toast({ title: editingCanned ? 'Response updated' : 'Response created' });
      setCannedDialogOpen(false);
      setEditingCanned(null);
      setCannedForm({ title: '', content: '', shortcut: '', category: 'general' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Failed to save response' });
    }
  };

  const deleteCannedResponse = async (id: string) => {
    try {
      await supabase.from('canned_responses').delete().eq('id', id);
      setCannedResponses(prev => prev.filter(r => r.id !== id));
      toast({ title: 'Response deleted' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Failed to delete response' });
    }
  };

  const archiveSession = async (session: ChatSession) => {
    try {
      await supabase
        .from('chat_sessions')
        .update({ status: 'closed' })
        .eq('id', session.id);

      if (selectedSession?.id === session.id) {
        setSelectedSession(null);
      }
      
      toast({ title: 'Chat archived' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Failed to archive chat' });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    broadcastTyping();

    // Check for shortcut trigger
    const value = e.target.value;
    if (value.startsWith('/')) {
      const shortcut = value.slice(1).toLowerCase();
      const match = cannedResponses.find(r => r.shortcut?.toLowerCase() === shortcut);
      if (match && value === `/${shortcut}`) {
        setNewMessage(match.content);
      }
    }
  };

  const filteredSessions = sessions.filter(s => 
    (s.visitor_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     s.visitor_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
     s.visitor_id.toLowerCase().includes(searchQuery.toLowerCase()))
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
    <div className="flex h-[calc(100vh-120px)] gap-4">
      {/* Sessions List */}
      <Card className="w-96 flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Live Chat Inbox
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setCannedDialogOpen(true);
                setEditingCanned(null);
                setCannedForm({ title: '', content: '', shortcut: '', category: 'general' });
              }}
              title="Manage Quick Replies"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Tabs value={filter} onValueChange={(v) => setFilter(v as 'active' | 'archived')}>
            <TabsList className="w-full">
              <TabsTrigger value="active" className="flex-1">Active</TabsTrigger>
              <TabsTrigger value="archived" className="flex-1">Archived</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <ScrollArea className="flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No conversations yet</p>
            </div>
          ) : (
            filteredSessions.map((session) => (
              <div
                key={session.id}
                onClick={() => setSelectedSession(session)}
                className={cn(
                  "p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors",
                  selectedSession?.id === session.id && "bg-muted"
                )}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {session.visitor_name?.[0] || 'V'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium truncate">
                        {session.visitor_name || 'Visitor'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(session.last_message_at)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {session.last_message}
                    </p>
                  </div>
                  {(session.unread_count || 0) > 0 && (
                    <Badge className="shrink-0">{session.unread_count}</Badge>
                  )}
                </div>
              </div>
            ))
          )}
        </ScrollArea>
      </Card>

      {/* Chat Area */}
      <Card className="flex-1 flex flex-col">
        {selectedSession ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {selectedSession.visitor_name?.[0] || 'V'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">
                    {selectedSession.visitor_name || 'Visitor'}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    Started {new Date(selectedSession.created_at).toLocaleDateString()}
                    {selectedSession.visitor_email && (
                      <>
                        <span>•</span>
                        {selectedSession.visitor_email}
                      </>
                    )}
                  </div>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => archiveSession(selectedSession)}>
                    <Archive className="w-4 h-4 mr-2" />
                    Archive Chat
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex gap-2",
                      msg.sender_type === 'owner' ? "flex-row-reverse" : ""
                    )}
                  >
                    <Avatar className="w-8 h-8 shrink-0">
                      <AvatarFallback className={cn(
                        msg.sender_type === 'owner' 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-muted"
                      )}>
                        {msg.sender_type === 'owner' ? 'Y' : (selectedSession.visitor_name?.[0] || 'V')}
                      </AvatarFallback>
                    </Avatar>
                    <div className={cn(
                      "max-w-[70%] rounded-2xl px-4 py-2",
                      msg.sender_type === 'owner'
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-muted rounded-bl-sm"
                    )}>
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      <div className={cn(
                        "flex items-center gap-1 mt-1",
                        msg.sender_type === 'owner' ? "justify-end" : ""
                      )}>
                        <span className={cn(
                          "text-[10px]",
                          msg.sender_type === 'owner' ? "text-white/60" : "text-muted-foreground"
                        )}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {msg.sender_type === 'owner' && (
                          <CheckCheck className={cn(
                            "w-3 h-3",
                            msg.is_read ? "text-white/80" : "text-white/40"
                          )} />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Typing indicator */}
                {visitorTyping && (
                  <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-muted">
                        {selectedSession.visitor_name?.[0] || 'V'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 border-t">
              {/* Quick Replies */}
              {cannedResponses.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {cannedResponses.slice(0, 5).map((response) => (
                    <Button
                      key={response.id}
                      variant="outline"
                      size="sm"
                      onClick={() => useCannedResponse(response)}
                      className="text-xs"
                    >
                      <Zap className="w-3 h-3 mr-1" />
                      {response.title}
                    </Button>
                  ))}
                  {cannedResponses.length > 5 && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="text-xs">
                          +{cannedResponses.length - 5} more
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64 p-2">
                        <ScrollArea className="max-h-48">
                          <div className="space-y-1">
                            {cannedResponses.slice(5).map((response) => (
                              <Button
                                key={response.id}
                                variant="ghost"
                                size="sm"
                                onClick={() => useCannedResponse(response)}
                                className="w-full justify-start text-xs"
                              >
                                <Zap className="w-3 h-3 mr-2" />
                                {response.title}
                              </Button>
                            ))}
                          </div>
                        </ScrollArea>
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
              )}
              
              <div className="flex items-end gap-2">
                <Textarea
                  ref={inputRef}
                  value={newMessage}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyPress}
                  placeholder="Type a reply... (/ for shortcuts)"
                  className="flex-1 min-h-[44px] max-h-32 resize-none"
                  disabled={sending}
                  rows={1}
                />
                <Button
                  onClick={() => sendMessage()}
                  disabled={!newMessage.trim() || sending}
                >
                  {sending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send
                    </>
                  )}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <CardContent className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
              <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
              <p className="text-muted-foreground">
                Choose a chat from the list to start responding
              </p>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Canned Responses Dialog */}
      <Dialog open={cannedDialogOpen} onOpenChange={setCannedDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingCanned ? 'Edit Quick Reply' : 'Quick Replies'}
            </DialogTitle>
            <DialogDescription>
              Create and manage quick reply templates for faster responses.
            </DialogDescription>
          </DialogHeader>

          {editingCanned || cannedResponses.length === 0 ? (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={cannedForm.title}
                    onChange={(e) => setCannedForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Greeting"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Shortcut (optional)</Label>
                  <Input
                    value={cannedForm.shortcut}
                    onChange={(e) => setCannedForm(prev => ({ ...prev, shortcut: e.target.value }))}
                    placeholder="e.g., greet (type /greet to use)"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Content</Label>
                <Textarea
                  value={cannedForm.content}
                  onChange={(e) => setCannedForm(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Enter your quick reply message..."
                  rows={4}
                />
              </div>
              <DialogFooter>
                {editingCanned && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setEditingCanned(null);
                      setCannedForm({ title: '', content: '', shortcut: '', category: 'general' });
                    }}
                  >
                    Cancel
                  </Button>
                )}
                <Button onClick={saveCannedResponse}>
                  {editingCanned ? 'Update' : 'Create'} Quick Reply
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button
                  onClick={() => {
                    setEditingCanned({} as CannedResponse);
                    setCannedForm({ title: '', content: '', shortcut: '', category: 'general' });
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Quick Reply
                </Button>
              </div>
              <ScrollArea className="max-h-96">
                <div className="space-y-2">
                  {cannedResponses.map((response) => (
                    <div
                      key={response.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{response.title}</span>
                          {response.shortcut && (
                            <Badge variant="outline" className="text-xs">
                              /{response.shortcut}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {response.content}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingCanned(response);
                            setCannedForm({
                              title: response.title,
                              content: response.content,
                              shortcut: response.shortcut || '',
                              category: response.category
                            });
                          }}
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteCannedResponse(response.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChatInbox;
