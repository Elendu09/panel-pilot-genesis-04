import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  X, 
  Send, 
  Minimize2, 
  Loader2,
  Paperclip,
  Smile
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ChatMessage {
  id: string;
  sender: 'buyer' | 'support';
  content: string;
  timestamp: string;
}

interface LiveChatWidgetProps {
  panelId: string;
  buyerId: string;
  buyerName?: string;
  panelName?: string;
}

export const LiveChatWidget = ({ panelId, buyerId, buyerName, panelName }: LiveChatWidgetProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [chatSessionId, setChatSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Create or get chat session
  useEffect(() => {
    if (!panelId || !buyerId) return;
    
    const initChat = async () => {
      // Check for existing open chat session
      const { data: existingSession } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('panel_id', panelId)
        .eq('user_id', buyerId)
        .eq('ticket_type', 'live_chat')
        .in('status', ['open', 'in_progress'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingSession) {
        setChatSessionId(existingSession.id);
        const chatMessages = Array.isArray(existingSession.messages) 
          ? existingSession.messages.map((msg: any, idx: number) => ({
              id: `msg-${idx}`,
              sender: msg.sender,
              content: msg.content,
              timestamp: msg.timestamp
            }))
          : [];
        setMessages(chatMessages);
      }
    };

    initChat();
  }, [panelId, buyerId]);

  // Real-time subscription for new messages
  useEffect(() => {
    if (!chatSessionId) return;

    const channel = supabase
      .channel(`chat-${chatSessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'support_tickets',
          filter: `id=eq.${chatSessionId}`
        },
        (payload) => {
          const updatedMessages = payload.new.messages as any[];
          if (updatedMessages && Array.isArray(updatedMessages)) {
            const formattedMessages = updatedMessages.map((msg, idx) => ({
              id: `msg-${idx}`,
              sender: msg.sender as 'buyer' | 'support',
              content: msg.content,
              timestamp: msg.timestamp
            }));
            setMessages(formattedMessages);
            
            // Count unread if widget is closed or minimized
            if (!isOpen || isMinimized) {
              const lastSupportMsg = formattedMessages.filter(m => m.sender === 'support').pop();
              if (lastSupportMsg) {
                setUnreadCount(prev => prev + 1);
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chatSessionId, isOpen, isMinimized]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Clear unread when opening
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setUnreadCount(0);
    }
  }, [isOpen, isMinimized]);

  const startNewChat = async () => {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .insert({
          panel_id: panelId,
          user_id: buyerId,
          subject: 'Live Chat Support',
          ticket_type: 'live_chat',
          status: 'open',
          priority: 'medium',
          messages: []
        })
        .select()
        .single();

      if (error) throw error;
      setChatSessionId(data.id);
      return data.id;
    } catch (error) {
      console.error('Error starting chat:', error);
      toast({ variant: 'destructive', title: 'Failed to start chat' });
      return null;
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      let sessionId = chatSessionId;
      if (!sessionId) {
        sessionId = await startNewChat();
        if (!sessionId) return;
      }

      const newMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        sender: 'buyer',
        content: newMessage.trim(),
        timestamp: new Date().toISOString()
      };

      const updatedMessages = [...messages, newMsg];
      setMessages(updatedMessages);
      setNewMessage('');

      // Save to database
      const { error } = await supabase
        .from('support_tickets')
        .update({
          messages: updatedMessages.map(m => ({
            sender: m.sender,
            content: m.content,
            timestamp: m.timestamp
          })),
          updated_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (error) throw error;

      // Focus input
      inputRef.current?.focus();
    } catch (error) {
      console.error('Error sending message:', error);
      toast({ variant: 'destructive', title: 'Failed to send message' });
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleChat = () => {
    if (isMinimized) {
      setIsMinimized(false);
    } else if (!isOpen) {
      setIsOpen(true);
    } else {
      setIsMinimized(true);
    }
  };

  return (
    <>
      {/* Chat Button */}
      <AnimatePresence>
        {(!isOpen || isMinimized) && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={toggleChat}
            className={cn(
              "fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full",
              "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground",
              "shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40",
              "transition-all duration-300 flex items-center justify-center"
            )}
          >
            <MessageCircle className="w-6 h-6" />
            {unreadCount > 0 && (
              <Badge 
                className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-destructive text-destructive-foreground text-xs"
              >
                {unreadCount}
              </Badge>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={cn(
              "fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-48px)]",
              "bg-card border border-border rounded-2xl shadow-2xl overflow-hidden",
              "flex flex-col max-h-[500px]"
            )}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{panelName || 'Support'}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-white/80">
                      <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      Online
                    </div>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10"
                    onClick={() => setIsMinimized(true)}
                  >
                    <Minimize2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/10"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageCircle className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">
                      Start a conversation! We're here to help.
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={cn(
                        "flex gap-2",
                        msg.sender === 'buyer' ? "flex-row-reverse" : ""
                      )}
                    >
                      <Avatar className="w-8 h-8 shrink-0">
                        <AvatarFallback className={cn(
                          msg.sender === 'buyer' 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-muted"
                        )}>
                          {msg.sender === 'buyer' ? (buyerName?.[0] || 'Y') : 'S'}
                        </AvatarFallback>
                      </Avatar>
                      <div className={cn(
                        "max-w-[75%] rounded-2xl px-4 py-2",
                        msg.sender === 'buyer'
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-muted rounded-bl-sm"
                      )}>
                        <p className="text-sm">{msg.content}</p>
                        <p className={cn(
                          "text-[10px] mt-1",
                          msg.sender === 'buyer' ? "text-white/60" : "text-muted-foreground"
                        )}>
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </motion.div>
                  ))
                )}
                
                {typing && (
                  <div className="flex items-center gap-2">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-muted">S</AvatarFallback>
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
            <div className="p-3 border-t border-border bg-card">
              <div className="flex items-center gap-2">
                <Input
                  ref={inputRef}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type a message..."
                  className="flex-1 bg-muted/50 border-0"
                  disabled={sending}
                />
                <Button
                  size="icon"
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || sending}
                  className="shrink-0"
                >
                  {sending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LiveChatWidget;