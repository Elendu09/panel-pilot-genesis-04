import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import { Twitter, Facebook, Linkedin, Link2, Share2 } from "lucide-react";

interface ShareButtonsProps {
  title: string;
  url: string;
  vertical?: boolean;
}

export const ShareButtons = ({ title, url, vertical = false }: ShareButtonsProps) => {
  const { toast } = useToast();

  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link copied!",
        description: "The article link has been copied to your clipboard.",
      });
    } catch {
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually from the address bar.",
        variant: "destructive",
      });
    }
  };

  const openShareWindow = (shareUrl: string) => {
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const buttons = [
    {
      icon: Twitter,
      label: "Share on X",
      onClick: () => openShareWindow(shareUrls.twitter),
      className: "hover:bg-[#1DA1F2]/10 hover:text-[#1DA1F2]",
    },
    {
      icon: Facebook,
      label: "Share on Facebook",
      onClick: () => openShareWindow(shareUrls.facebook),
      className: "hover:bg-[#1877F2]/10 hover:text-[#1877F2]",
    },
    {
      icon: Linkedin,
      label: "Share on LinkedIn",
      onClick: () => openShareWindow(shareUrls.linkedin),
      className: "hover:bg-[#0A66C2]/10 hover:text-[#0A66C2]",
    },
    {
      icon: Link2,
      label: "Copy link",
      onClick: handleCopyLink,
      className: "hover:bg-primary/10 hover:text-primary",
    },
  ];

  return (
    <div className={vertical ? "flex flex-col gap-2" : "flex items-center gap-2"}>
      {!vertical && (
        <span className="text-sm text-muted-foreground flex items-center gap-1 mr-2">
          <Share2 className="h-4 w-4" />
          Share
        </span>
      )}
      {buttons.map((button) => (
        <Tooltip key={button.label}>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={button.onClick}
              className={button.className}
            >
              <button.icon className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side={vertical ? "right" : "bottom"}>
            {button.label}
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
};
