import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface FloatingChatWidgetProps {
  panelId?: string;
  whatsappNumber?: string;
  telegramUsername?: string;
  position?: 'bottom-right' | 'bottom-left';
  message?: string;
}

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

export const FloatingChatWidget = ({
  panelId,
  whatsappNumber,
  telegramUsername,
  position = 'bottom-right',
  message = 'Need help? Chat with us!'
}: FloatingChatWidgetProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState({
    enabled: false,
    whatsapp: whatsappNumber || '',
    telegram: telegramUsername || '',
    position: position,
    message: message
  });

  // Fetch settings from database if panelId is provided
  useEffect(() => {
    if (panelId) {
      const fetchSettings = async () => {
        const { data } = await supabase
          .from('panel_settings')
          .select('floating_chat_enabled, floating_chat_whatsapp, floating_chat_telegram, floating_chat_position, floating_chat_message')
          .eq('panel_id', panelId)
          .single();

        if (data) {
          setSettings({
            enabled: data.floating_chat_enabled || false,
            whatsapp: data.floating_chat_whatsapp || '',
            telegram: data.floating_chat_telegram || '',
            position: (data.floating_chat_position as 'bottom-right' | 'bottom-left') || 'bottom-right',
            message: data.floating_chat_message || 'Need help? Chat with us!'
          });
        }
      };
      fetchSettings();
    } else {
      // Use props directly
      setSettings({
        enabled: !!(whatsappNumber || telegramUsername),
        whatsapp: whatsappNumber || '',
        telegram: telegramUsername || '',
        position: position,
        message: message
      });
    }
  }, [panelId, whatsappNumber, telegramUsername, position, message]);

  // Don't render if no chat options available
  if (!settings.enabled && !settings.whatsapp && !settings.telegram) {
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

  return (
    <div className={`fixed bottom-4 sm:bottom-6 ${positionClasses} z-50`}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="mb-4 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden w-72"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  <span className="font-semibold">Chat with us</span>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-white/80 mt-1">{settings.message}</p>
            </div>

            {/* Chat options */}
            <div className="p-4 space-y-3">
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating button - shows based on primary channel */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center text-white transition-all ${
          isOpen 
            ? 'bg-slate-600' 
            : settings.whatsapp 
              ? 'bg-green-500 hover:bg-green-600' 
              : 'bg-sky-500 hover:bg-sky-600'
        }`}
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
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
            >
              {settings.whatsapp ? <WhatsAppIcon /> : <TelegramIcon />}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Pulse animation */}
      {!isOpen && (
        <span className="absolute -top-1 -right-1 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
        </span>
      )}
    </div>
  );
};