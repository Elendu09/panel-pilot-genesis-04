import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  X, 
  Send, 
  Minimize2, 
  Loader2
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
  sender_type: 'visitor' | 'owner';
  content: string;
  created_at: string;
  session_id?: string;
  is_read?: boolean;
}

interface LiveChatWidgetProps {
  panelId: string;
  visitorName?: string;
  visitorEmail?: string;
  panelName?: string;
}

const getVisitorId = () => {
  let visitorId = localStorage.getItem('chat_visitor_id');
  if (!visitorId) {
    visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    localStorage.setItem('chat_visitor_id', visitorId);
  }
  return visitorId;
};

export const LiveChatWidget = ({ panelId, visitorName, visitorEmail, panelName }: LiveChatWidgetProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [visitorId] = useState(getVisitorId);
  const [ownerTyping, setOwnerTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!panelId) return;
    const initChat = async () => {
      const { data: existingSession } = await supabase
        .from('chat_sessions')
        .select('id')
        .eq('panel_id', panelId)
        .eq('visitor_id', visitorId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingSession) {
        setSessionId(existingSession.id);
      }
    };
    initChat();
  }, [panelId, visitorId]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      const currentSessionId = sessionId;
      if (!currentSessionId) return;

      const messageContent = newMessage.trim();
      setNewMessage('');

      const optimisticMsg: ChatMessage = {
        id: `temp-${Date.now()}`,
        sender_type: 'visitor',
        content: messageContent,
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, optimisticMsg]);

      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          session_id: currentSessionId,
          sender_type: 'visitor',
          content: messageContent
        })
        .select()
        .single();

      if (error) throw error;

      setMessages(prev => prev.map(m => 
        m.id === optimisticMsg.id ? { ...data, sender_type: data.sender_type as 'visitor' | 'owner' } : m
      ));

      await supabase
        .from('chat_sessions')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', currentSessionId);

      if (data?.id) {
        await supabase.functions.invoke('send-notification', {
          body: {
            panelId,
            type: 'chat',
            title: `New Chat Message from ${visitorName || 'Visitor'}`,
            message: messageContent,
            metadata: {
              sessionId: currentSessionId,
              messageId: data.id,
              visitorName: visitorName || 'Visitor'
            }
          }
        });
      }

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
  };

  return (
    <div />
  );
};

export default LiveChatWidget;
