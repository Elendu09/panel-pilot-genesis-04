import { useState, useEffect } from 'react';
import { X, Megaphone, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnnouncementBarProps {
  text?: string;
  linkText?: string;
  linkUrl?: string;
  link?: string; // Legacy field support
  backgroundColor?: string;
  textColor?: string;
  enabled?: boolean;
}

export const AnnouncementBar = ({
  text,
  linkText,
  linkUrl,
  link, // Legacy support
  backgroundColor = '#6366F1',
  textColor = '#FFFFFF',
  enabled = true,
}: AnnouncementBarProps) => {
  const [dismissed, setDismissed] = useState(false);

  // Check sessionStorage on mount
  useEffect(() => {
    const isDismissed = sessionStorage.getItem('announcementBarDismissed') === 'true';
    setDismissed(isDismissed);
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem('announcementBarDismissed', 'true');
    setDismissed(true);
  };

  // Use linkUrl or fallback to legacy link field
  const finalLinkUrl = linkUrl || link;

  if (!enabled || dismissed || !text) {
    return null;
  }

  return (
    <div 
      className="relative py-2.5 px-4 text-center text-sm font-medium shadow-sm"
      style={{ backgroundColor, color: textColor }}
    >
      <div className="container mx-auto flex items-center justify-center gap-2 flex-wrap">
        <Megaphone className="w-4 h-4 shrink-0" />
        <span>{text}</span>
        {finalLinkUrl && (
          <a 
            href={finalLinkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:no-underline inline-flex items-center gap-1 font-semibold"
          >
            {linkText || 'Learn More'}
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
      <button
        onClick={handleDismiss}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-white/20 transition-colors"
        aria-label="Dismiss announcement"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default AnnouncementBar;
