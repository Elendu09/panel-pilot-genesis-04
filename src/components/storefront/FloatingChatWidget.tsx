import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Loader2, RotateCcw, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface FloatingChatWidgetProps {
  panelId?: string;
  panelName?: string;
  whatsappNumber?: string;
  telegramUsername?: string;
  messengerUsername?: string;
  discordInvite?: string;
  customUrl?: string;
  customLabel?: string;
  position?: 'bottom-right' | 'bottom-left';
  message?: string;
  enableAI?: boolean;
  pageContext?: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// FormattedMessage component to render markdown-like formatting
const FormattedMessage = ({ content }: { content: string }) => {
  const parseContent = (text: string) => {
    const elements: JSX.Element[] = [];
    const lines = text.split('\n');
    let currentList: { type: 'ol' | 'ul'; items: string[] } | null = null;
    let listKey = 0;

    const parseInlineFormatting = (line: string, key: number) => {
      // Parse bold text (**text** or __text__)
      const parts = line.split(/(\*\*[^*]+\*\*|__[^_]+__)/g);
      return (
        <span key={key}>
          {parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
            }
            if (part.startsWith('__') && part.endsWith('__')) {
              return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
            }
            return part;
          })}
        </span>
      );
    };

    const flushList = () => {
      if (currentList) {
        const ListTag = currentList.type === 'ol' ? 'ol' : 'ul';
        elements.push(
          <ListTag
            key={`list-${listKey++}`}
            className={currentList.type === 'ol' ? 'list-decimal pl-4 space-y-1 my-2' : 'list-disc pl-4 space-y-1 my-2'}
          >
            {currentList.items.map((item, i) => (
              <li key={i} className="text-sm">{parseInlineFormatting(item, i)}</li>
            ))}
          </ListTag>
        );
        currentList = null;
      }
    };

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Check for numbered list (1. 2. 3. etc)
      const numberedMatch = trimmedLine.match(/^(\d+)\.\s+(.+)$/);
      if (numberedMatch) {
        if (!currentList || currentList.type !== 'ol') {
          flushList();
          currentList = { type: 'ol', items: [] };
        }
        currentList.items.push(numberedMatch[2]);
        return;
      }

      // Check for bullet list (- or *)
      const bulletMatch = trimmedLine.match(/^[-*•]\s+(.+)$/);
      if (bulletMatch) {
        if (!currentList || currentList.type !== 'ul') {
          flushList();
          currentList = { type: 'ul', items: [] };
        }
        currentList.items.push(bulletMatch[1]);
        return;
      }

      // Not a list item, flush any current list
      flushList();

      // Empty line = paragraph break
      if (trimmedLine === '') {
        elements.push(<div key={`break-${index}`} className="h-2" />);
        return;
      }

      // Regular text
      elements.push(
        <p key={`p-${index}`} className="text-sm leading-relaxed">
          {parseInlineFormatting(trimmedLine, index)}
        </p>
      );
    });

    // Flush any remaining list
    flushList();

    return elements;
  };

  return <div className="space-y-1">{parseContent(content)}</div>;
};

// WhatsApp SVG Icon
const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

// Telegram SVG Icon
const TelegramIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
  </svg>
);

// Facebook Messenger SVG Icon
const MessengerIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
    <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.092.301 2.246.464 3.443.464 6.627 0 12-4.974 12-11.111S18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8l3.131 3.259L19.752 8l-6.561 6.963z"/>
  </svg>
);

// Discord SVG Icon
const DiscordIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
);

export const FloatingChatWidget = ({
  panelId,
  panelName,
  whatsappNumber,
  telegramUsername,
  messengerUsername,
  discordInvite,
  customUrl,
  customLabel,
  position = 'bottom-right',
  message = 'Need help? Chat with us!',
  enableAI = true,
  pageContext = 'Homepage'
}: FloatingChatWidgetProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasPreviousSession, setHasPreviousSession] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [settings, setSettings] = useState({
    enabled: false,
    whatsapp: whatsappNumber || '',
    telegram: telegramUsername || '',
    messenger: messengerUsername || '',
    discord: discordInvite || '',
    customUrl: customUrl || '',
    customLabel: customLabel || 'Live Chat',
    position: position,
    message: message
  });

  // Storage key for chat history - use global key for cross-page persistence
  const storageKey = `chat_history_${panelId || 'default'}`;
  const sessionTimestampKey = `chat_session_time_${panelId || 'default'}`;

  // Check for previous session on mount - BEFORE rendering options
  useEffect(() => {
    try {
      const savedMessages = localStorage.getItem(storageKey);
      const sessionTime = localStorage.getItem(sessionTimestampKey);
      
      if (savedMessages) {
        const parsed = JSON.parse(savedMessages);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Check if session is less than 24 hours old
          const sessionAge = sessionTime ? Date.now() - parseInt(sessionTime) : Infinity;
          const isRecentSession = sessionAge < 24 * 60 * 60 * 1000; // 24 hours
          
          if (isRecentSession) {
            setHasPreviousSession(true);
          } else {
            // Clear old session
            localStorage.removeItem(storageKey);
            localStorage.removeItem(sessionTimestampKey);
          }
        }
      }
    } catch {
      // Ignore parse errors
    }
    setSessionChecked(true);
  }, [storageKey, sessionTimestampKey]);

  // Save messages to localStorage when they change
  useEffect(() => {
    if (messages.length > 0) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(messages));
        localStorage.setItem(sessionTimestampKey, Date.now().toString());
      } catch {
        // Ignore storage errors
      }
    }
  }, [messages, storageKey, sessionTimestampKey]);

  // Auto-restore previous session when widget opens if recent
  useEffect(() => {
    if (isOpen && hasPreviousSession && messages.length === 0) {
      // Auto-restore the previous session
      try {
        const savedMessages = localStorage.getItem(storageKey);
        if (savedMessages) {
          const parsed = JSON.parse(savedMessages);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed);
            setShowAIChat(true);
          }
        }
      } catch {
        // Start fresh if error
      }
    }
  }, [isOpen, hasPreviousSession, messages.length, storageKey]);

  // Add AI greeting when opening chat (only for new sessions)
  useEffect(() => {
    if (showAIChat && messages.length === 0 && !hasPreviousSession) {
      // Immediate AI greeting
      setMessages([{
        role: 'assistant',
        content: `Hi! 👋 Welcome to **${panelName || 'our panel'}**!\n\nHow can I help you today? I can assist with:\n\n1. **Orders** - placing new orders or checking status\n2. **Services** - finding the right service for your needs\n3. **Pricing** - understanding our competitive rates\n4. **Account** - deposits, balance, and settings`
      }]);
    }
  }, [showAIChat, messages.length, hasPreviousSession, panelName]);

  // Continue previous session
  const continuePreviousSession = () => {
    try {
      const savedMessages = localStorage.getItem(storageKey);
      if (savedMessages) {
        const parsed = JSON.parse(savedMessages);
        if (Array.isArray(parsed)) {
          setMessages(parsed);
        }
      }
    } catch {
      // Start fresh if error
      setMessages([{
        role: 'assistant',
        content: `Hi! 👋 Welcome back to **${panelName || 'our panel'}**!\n\nHow can I help you today?`
      }]);
    }
    setHasPreviousSession(false);
    setShowAIChat(true);
  };

  // Start new session
  const startNewSession = () => {
    localStorage.removeItem(storageKey);
    localStorage.removeItem(sessionTimestampKey);
    setMessages([{
      role: 'assistant',
      content: `Hi! 👋 Welcome to **${panelName || 'our panel'}**!\n\nHow can I help you today? I can assist with:\n\n1. **Orders** - placing new orders or checking status\n2. **Services** - finding the right service for your needs\n3. **Pricing** - understanding our competitive rates\n4. **Account** - deposits, balance, and settings`
    }]);
    setHasPreviousSession(false);
    setShowAIChat(true);
  };

  // Clear chat history
  const clearHistory = () => {
    localStorage.removeItem(storageKey);
    localStorage.removeItem(sessionTimestampKey);
    setMessages([{
      role: 'assistant',
      content: `Chat cleared! How can I help you today?`
    }]);
  };

  // Fetch settings from database if panelId is provided
  useEffect(() => {
    if (panelId) {
      const fetchSettings = async () => {
        const { data } = await supabase
          .from('panel_settings')
          .select('floating_chat_enabled, floating_chat_whatsapp, floating_chat_telegram, floating_chat_messenger, floating_chat_discord, floating_chat_custom_url, floating_chat_custom_label, floating_chat_position, floating_chat_message, integrations')
          .eq('panel_id', panelId)
          .single();

        if (data) {
          // Check integrations JSONB for social platforms (new integration system)
          const integrations = data.integrations as Record<string, any> || {};
          
          setSettings({
            enabled: data.floating_chat_enabled || false,
            // Priority: floating_chat columns > integrations JSONB
            whatsapp: data.floating_chat_whatsapp || integrations.whatsapp?.phone || '',
            telegram: data.floating_chat_telegram || integrations.telegram?.username || '',
            messenger: data.floating_chat_messenger || integrations.messenger?.username || '',
            discord: data.floating_chat_discord || integrations.discord?.invite_url || '',
            customUrl: data.floating_chat_custom_url || '',
            customLabel: data.floating_chat_custom_label || 'Live Chat',
            position: (data.floating_chat_position as 'bottom-right' | 'bottom-left') || 'bottom-right',
            message: data.floating_chat_message || integrations.whatsapp?.message || 'Need help? Chat with us!'
          });
        }
      };
      fetchSettings();
    } else {
      setSettings({
        enabled: !!(whatsappNumber || telegramUsername || messengerUsername || discordInvite || customUrl || enableAI),
        whatsapp: whatsappNumber || '',
        telegram: telegramUsername || '',
        messenger: messengerUsername || '',
        discord: discordInvite || '',
        customUrl: customUrl || '',
        customLabel: customLabel || 'Live Chat',
        position: position,
        message: message
      });
    }
  }, [panelId, whatsappNumber, telegramUsername, messengerUsername, discordInvite, customUrl, customLabel, position, message, enableAI]);

  // Enhanced auto-scroll function with smooth behavior - ensures latest message is visible
  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      // Use requestAnimationFrame for smoother scroll timing
      requestAnimationFrame(() => {
        if (scrollRef.current) {
          const scrollElement = scrollRef.current;
          // Force scroll to absolute bottom
          scrollElement.scrollTo({
            top: scrollElement.scrollHeight + 1000,
            behavior: 'smooth'
          });
        }
      });
    }
  }, []);

  // Auto scroll to bottom when messages change - multiple attempts to ensure visibility
  useEffect(() => {
    // Immediate scroll
    scrollToBottom();
    // Delayed scrolls to handle async content rendering
    const timer1 = setTimeout(scrollToBottom, 100);
    const timer2 = setTimeout(scrollToBottom, 300);
    const timer3 = setTimeout(scrollToBottom, 500);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [messages, scrollToBottom, isLoading]);

  // Show widget if AI is enabled OR any social platform is configured
  const hasAnyChatOption = settings.whatsapp || settings.telegram || settings.messenger || settings.discord || settings.customUrl || enableAI;
  
  // Only hide if truly no options exist
  if (!hasAnyChatOption) {
    return null;
  }

  const positionClasses = settings.position === 'bottom-left' 
    ? 'left-4 sm:left-6' 
    : 'right-4 sm:right-6';

  const handleWhatsApp = () => {
    const cleanNumber = settings.whatsapp.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanNumber}`, '_blank');
  };

  const handleTelegram = () => {
    const username = settings.telegram.replace('@', '');
    window.open(`https://t.me/${username}`, '_blank');
  };

  const handleMessenger = () => {
    const username = settings.messenger.replace('@', '');
    window.open(`https://m.me/${username}`, '_blank');
  };

  const handleDiscord = () => {
    window.open(settings.discord, '_blank');
  };

  const handleCustom = () => {
    window.open(settings.customUrl, '_blank');
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('ai-chat-reply', {
        body: {
          message: userMessage,
          pageContext,
          panelInfo: { name: panelName },
          conversationHistory: messages.slice(-6)
        }
      });

      if (error) throw error;

      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      // Ensure scroll to AI response after state update
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('AI chat error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Sorry, I'm having trouble responding right now. Please try again or use one of our other contact options." 
      }]);
      setTimeout(scrollToBottom, 100);
    } finally {
      setIsLoading(false);
    }
  };

  // AI Chat always uses MessageCircle icon - social platforms are separate
  const getAIIcon = () => <MessageCircle className="w-6 h-6" />;
  
  // Check which social platforms are configured
  const hasSocialPlatforms = settings.whatsapp || settings.telegram || settings.messenger || settings.discord;

  return (
    <div className={`fixed bottom-20 sm:bottom-6 ${positionClasses} z-40`}>
      {/* Social Platform Quick Buttons - positioned above AI chat */}
      {!isOpen && hasSocialPlatforms && (
        <div className="flex flex-col gap-2 mb-3">
          {settings.whatsapp && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleWhatsApp}
              className="p-3 rounded-full text-white shadow-lg bg-green-500 hover:bg-green-600 transition-colors"
              title="WhatsApp"
            >
              <WhatsAppIcon />
            </motion.button>
          )}
          {settings.telegram && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleTelegram}
              className="p-3 rounded-full text-white shadow-lg bg-sky-500 hover:bg-sky-600 transition-colors"
              title="Telegram"
            >
              <TelegramIcon />
            </motion.button>
          )}
          {settings.messenger && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleMessenger}
              className="p-3 rounded-full text-white shadow-lg bg-blue-500 hover:bg-blue-600 transition-colors"
              title="Messenger"
            >
              <MessengerIcon />
            </motion.button>
          )}
          {settings.discord && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleDiscord}
              className="p-3 rounded-full text-white shadow-lg bg-indigo-500 hover:bg-indigo-600 transition-colors"
              title="Discord"
            >
              <DiscordIcon />
            </motion.button>
          )}
        </div>
      )}
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="mb-4 bg-card rounded-2xl shadow-2xl border border-border overflow-hidden w-80"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-primary to-primary/80 p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  <span className="font-semibold">{showAIChat ? 'AI Assistant' : 'Chat with us'}</span>
                </div>
                <div className="flex items-center gap-1">
                  {showAIChat && messages.length > 1 && (
                    <button 
                      onClick={clearHistory}
                      className="p-1 hover:bg-white/20 rounded-full transition-colors"
                      title="Clear chat"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <button 
                    onClick={() => { setIsOpen(false); setShowAIChat(false); }}
                    className="p-1 hover:bg-white/20 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-white/80 mt-1">
                {showAIChat && hasPreviousSession ? 'Continuing previous conversation' : settings.message}
              </p>
            </div>

            {showAIChat ? (
              /* AI Chat Interface */
              <div className="flex flex-col h-80">
                <div
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto p-3 scroll-smooth"
                >
                  <div className="space-y-3">
                    {messages.map((msg, i) => (
                      <div
                        key={i}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] px-3 py-2 rounded-xl ${
                            msg.role === 'user'
                              ? 'bg-primary text-white rounded-br-sm'
                              : 'bg-muted text-foreground rounded-bl-sm'
                          }`}
                        >
                          {msg.role === 'assistant' ? (
                            <FormattedMessage content={msg.content} />
                          ) : (
                            <p className="text-sm">{msg.content}</p>
                          )}
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-muted px-4 py-2 rounded-xl rounded-bl-sm">
                          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="p-3 border-t border-border">
                  <form
                    onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                    className="flex gap-2"
                  >
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 h-9"
                      disabled={isLoading}
                    />
                    <Button type="submit" size="sm" disabled={!inputValue.trim() || isLoading}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </form>
                  <button
                    onClick={() => setShowAIChat(false)}
                    className="w-full mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    ← Back to options
                  </button>
                </div>
              </div>
            ) : (
              /* Chat options */
              <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
                {/* Previous Session Banner - Always show if there's a previous session */}
                {enableAI && hasPreviousSession && sessionChecked && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-primary/10 border border-primary/20 rounded-xl"
                  >
                    <p className="text-sm font-medium text-foreground mb-2">
                      Continue previous conversation?
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={continuePreviousSession}
                        className="flex-1 gap-1"
                      >
                        <RotateCcw className="w-3 h-3" /> Continue
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={startNewSession}
                        className="flex-1"
                      >
                        New Chat
                      </Button>
                    </div>
                  </motion.div>
                )}

                {enableAI && !hasPreviousSession && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={startNewSession}
                    className="w-full flex items-center gap-3 p-3 bg-gradient-to-r from-primary to-primary/80 text-white rounded-xl transition-colors"
                  >
                    <MessageCircle className="w-6 h-6" />
                    <div className="text-left">
                      <p className="font-semibold">AI Assistant</p>
                      <p className="text-xs text-white/80">Get instant answers</p>
                    </div>
                  </motion.button>
                )}

                {settings.whatsapp && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleWhatsApp}
                    className="w-full flex items-center gap-3 p-3 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors"
                  >
                    <WhatsAppIcon />
                    <div className="text-left">
                      <p className="font-semibold">WhatsApp</p>
                      <p className="text-xs text-white/80">Chat on WhatsApp</p>
                    </div>
                  </motion.button>
                )}

                {settings.telegram && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleTelegram}
                    className="w-full flex items-center gap-3 p-3 bg-sky-500 hover:bg-sky-600 text-white rounded-xl transition-colors"
                  >
                    <TelegramIcon />
                    <div className="text-left">
                      <p className="font-semibold">Telegram</p>
                      <p className="text-xs text-white/80">Message on Telegram</p>
                    </div>
                  </motion.button>
                )}

                {settings.messenger && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleMessenger}
                    className="w-full flex items-center gap-3 p-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors"
                  >
                    <MessengerIcon />
                    <div className="text-left">
                      <p className="font-semibold">Messenger</p>
                      <p className="text-xs text-white/80">Chat on Facebook</p>
                    </div>
                  </motion.button>
                )}

                {settings.discord && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDiscord}
                    className="w-full flex items-center gap-3 p-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl transition-colors"
                  >
                    <DiscordIcon />
                    <div className="text-left">
                      <p className="font-semibold">Discord</p>
                      <p className="text-xs text-white/80">Join our server</p>
                    </div>
                  </motion.button>
                )}

                {settings.customUrl && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCustom}
                    className="w-full flex items-center gap-3 p-3 bg-slate-600 hover:bg-slate-700 text-white rounded-xl transition-colors"
                  >
                    <MessageCircle className="w-6 h-6" />
                    <div className="text-left">
                      <p className="font-semibold">{settings.customLabel}</p>
                      <p className="text-xs text-white/80">Open chat</p>
                    </div>
                  </motion.button>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Chat Floating Button - Always uses MessageCircle icon */}
      {enableAI && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="p-4 rounded-full text-white shadow-lg bg-primary hover:bg-primary/90 transition-colors relative"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
              >
                <X className="w-6 h-6" />
              </motion.div>
            ) : (
              <motion.div
                key="open"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
              >
                {getAIIcon()}
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* Notification dot when there's a previous session */}
          {!isOpen && hasPreviousSession && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
          )}
          
          {/* Pulse animation when closed */}
          {!isOpen && !hasPreviousSession && (
            <span className="absolute inset-0 rounded-full animate-ping opacity-30 bg-current" />
          )}
        </motion.button>
      )}
    </div>
  );
};

export default FloatingChatWidget;
