import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  Megaphone, 
  Sparkles, 
  Gift, 
  Bell, 
  Info, 
  Star, 
  Zap, 
  AlertTriangle,
  X 
} from 'lucide-react';
import { cn } from '@/lib/utils';

// =====================================================
// ANNOUNCEMENT POPUP
// Modal dialog version of announcements
// Used when displayMode === 'popup' in Integrations
// =====================================================

interface AnnouncementPopupProps {
  id?: string;
  enabled?: boolean;
  title?: string;
  text?: string;
  linkText?: string;
  linkUrl?: string;
  icon?: string;
  backgroundColor?: string;
  textColor?: string;
}

// Icon mapping for announcement popup
const ANNOUNCEMENT_ICONS: Record<string, typeof Megaphone> = {
  megaphone: Megaphone,
  sparkles: Sparkles,
  gift: Gift,
  bell: Bell,
  info: Info,
  star: Star,
  zap: Zap,
  alert: AlertTriangle,
};

export const AnnouncementPopup = ({
  id = 'default',
  enabled = true,
  title,
  text,
  linkText,
  linkUrl,
  icon = 'megaphone',
  backgroundColor = '#6366F1',
  textColor = '#FFFFFF',
}: AnnouncementPopupProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const storageKey = `announcementPopup_${id}_dismissed`;

  // Check if already dismissed in this session
  useEffect(() => {
    const dismissed = sessionStorage.getItem(storageKey) === 'true';
    // Show popup if enabled and has content and not dismissed
    if (enabled && (title || text) && !dismissed) {
      // Small delay to allow page to render first
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [enabled, title, text, storageKey]);

  const handleDismiss = () => {
    sessionStorage.setItem(storageKey, 'true');
    setIsOpen(false);
  };

  const handleLinkClick = () => {
    if (linkUrl) {
      window.open(linkUrl, '_blank', 'noopener,noreferrer');
    }
    handleDismiss();
  };

  // Don't render anything if not enabled or no content
  if (!enabled || (!title && !text)) {
    return null;
  }

  const IconComponent = ANNOUNCEMENT_ICONS[icon?.toLowerCase()] || Megaphone;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleDismiss()}>
      <DialogContent 
        className="max-w-md border-0 shadow-2xl"
        style={{
          backgroundColor: backgroundColor || '#6366F1',
          color: textColor || '#FFFFFF',
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-lg" style={{ color: textColor }}>
            <div 
              className="p-2 rounded-full"
              style={{ backgroundColor: `${textColor}20` }}
            >
              <IconComponent className="w-5 h-5" style={{ color: textColor }} />
            </div>
            {title || 'Announcement'}
          </DialogTitle>
        </DialogHeader>
        
        {text && (
          <DialogDescription 
            className="text-base leading-relaxed pt-2"
            style={{ color: `${textColor}CC` }}
          >
            {text}
          </DialogDescription>
        )}

        <DialogFooter className="flex-col sm:flex-row gap-2 pt-4">
          {linkUrl && (
            <Button
              onClick={handleLinkClick}
              className="w-full sm:w-auto"
              style={{
                backgroundColor: textColor,
                color: backgroundColor,
              }}
            >
              {linkText || 'Learn More'}
            </Button>
          )}
          <Button
            variant="ghost"
            onClick={handleDismiss}
            className="w-full sm:w-auto"
            style={{ color: textColor }}
          >
            Dismiss
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AnnouncementPopup;
