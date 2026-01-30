import { useState, useEffect } from 'react';
import { X, Megaphone, ExternalLink, Sparkles, Gift, Bell, Info, Star, Zap, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnnouncementBarProps {
  id?: string; // Unique ID for session storage dismiss key
  title?: string;
  text?: string;
  linkText?: string;
  linkUrl?: string;
  link?: string; // Legacy field support
  backgroundColor?: string;
  textColor?: string;
  enabled?: boolean;
  icon?: 'megaphone' | 'sparkles' | 'gift' | 'bell' | 'info' | 'star' | 'zap' | 'alert';
}

const ICON_MAP = {
  megaphone: Megaphone,
  sparkles: Sparkles,
  gift: Gift,
  bell: Bell,
  info: Info,
  star: Star,
  zap: Zap,
  alert: AlertTriangle,
};

export const AnnouncementBar = ({
  id = 'default',
  title,
  text,
  linkText,
  linkUrl,
  link, // Legacy support
  backgroundColor = '#6366F1',
  textColor = '#FFFFFF',
  enabled = true,
  icon = 'megaphone',
}: AnnouncementBarProps) => {
  const [dismissed, setDismissed] = useState(false);
  const storageKey = `announcementBar_${id}_dismissed`;

  // Check sessionStorage on mount with unique key per announcement
  useEffect(() => {
    const isDismissed = sessionStorage.getItem(storageKey) === 'true';
    setDismissed(isDismissed);
  }, [storageKey]);

  const handleDismiss = () => {
    sessionStorage.setItem(storageKey, 'true');
    setDismissed(true);
  };

  // Use linkUrl or fallback to legacy link field
  const finalLinkUrl = linkUrl || link;

  // Must have enabled true AND either title or text to render
  if (!enabled || dismissed || (!text && !title)) {
    return null;
  }

  const IconComponent = ICON_MAP[icon] || Megaphone;

  return (
    <div 
      className="relative py-2.5 px-4 text-center text-sm font-medium shadow-sm"
      style={{ backgroundColor, color: textColor }}
    >
      <div className="container mx-auto flex items-center justify-center gap-2 flex-wrap">
        <div className="p-1 rounded-full bg-white/20 shrink-0">
          <IconComponent className="w-3.5 h-3.5" />
        </div>
        {title && (
          <span className="font-bold">{title}</span>
        )}
        {title && text && <span className="opacity-60">—</span>}
        {text && <span className="opacity-90">{text}</span>}
        {finalLinkUrl && (
          <a 
            href={finalLinkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:no-underline inline-flex items-center gap-1 font-semibold ml-1"
          >
            {linkText || 'Learn More'}
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
      <button
        onClick={handleDismiss}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-white/20 transition-colors"
        aria-label="Dismiss announcement"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export default AnnouncementBar;