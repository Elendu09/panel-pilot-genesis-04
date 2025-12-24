import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Instagram, 
  Youtube, 
  Twitter, 
  Facebook, 
  Linkedin,
  MessageCircle,
  Music,
  Hash,
  Globe,
  GripVertical,
  Eye,
  EyeOff,
  Search
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, Reorder } from "framer-motion";

interface SocialPlatform {
  id: string;
  name: string;
  icon: any;
  color: string;
  bgColor: string;
  enabled: boolean;
  url?: string;
}

interface SocialIconSelectorProps {
  platforms: SocialPlatform[];
  onChange: (platforms: SocialPlatform[]) => void;
  showUrls?: boolean;
}

const defaultPlatforms: SocialPlatform[] = [
  { id: 'instagram', name: 'Instagram', icon: Instagram, color: 'text-pink-500', bgColor: 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400', enabled: true },
  { id: 'youtube', name: 'YouTube', icon: Youtube, color: 'text-red-500', bgColor: 'bg-red-500', enabled: true },
  { id: 'twitter', name: 'Twitter/X', icon: Twitter, color: 'text-sky-500', bgColor: 'bg-slate-900', enabled: true },
  { id: 'facebook', name: 'Facebook', icon: Facebook, color: 'text-blue-600', bgColor: 'bg-blue-600', enabled: true },
  { id: 'tiktok', name: 'TikTok', icon: Hash, color: 'text-foreground', bgColor: 'bg-gradient-to-br from-cyan-400 via-slate-900 to-pink-500', enabled: true },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: 'text-blue-700', bgColor: 'bg-blue-700', enabled: false },
  { id: 'telegram', name: 'Telegram', icon: MessageCircle, color: 'text-sky-400', bgColor: 'bg-sky-500', enabled: false },
  { id: 'spotify', name: 'Spotify', icon: Music, color: 'text-green-500', bgColor: 'bg-green-500', enabled: false },
];

export const SocialIconSelector = ({
  platforms = defaultPlatforms,
  onChange,
  showUrls = false
}: SocialIconSelectorProps) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPlatforms = platforms.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const togglePlatform = (id: string) => {
    const updated = platforms.map(p => 
      p.id === id ? { ...p, enabled: !p.enabled } : p
    );
    onChange(updated);
  };

  const updateUrl = (id: string, url: string) => {
    const updated = platforms.map(p => 
      p.id === id ? { ...p, url } : p
    );
    onChange(updated);
  };

  const enabledPlatforms = platforms.filter(p => p.enabled);

  return (
    <div className="space-y-4">
      {/* Preview Bar */}
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <Label className="text-xs text-muted-foreground mb-3 block">Hero Section Preview</Label>
          <div className="flex items-center justify-center gap-3 py-4 bg-background/50 rounded-lg">
            {enabledPlatforms.length > 0 ? (
              enabledPlatforms.map((platform) => {
                const Icon = platform.icon;
                return (
                  <motion.div
                    key={platform.id}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center transition-transform hover:scale-110 cursor-pointer shadow-lg",
                      platform.bgColor
                    )}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </motion.div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground">No platforms selected</p>
            )}
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            {enabledPlatforms.length} platforms enabled
          </p>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search platforms..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Platform List */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
        {filteredPlatforms.map((platform) => {
          const Icon = platform.icon;
          return (
            <Card 
              key={platform.id}
              className={cn(
                "transition-all",
                platform.enabled ? "bg-primary/5 border-primary/20" : "bg-muted/30"
              )}
            >
              <CardContent className="p-3">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    platform.enabled ? platform.bgColor : "bg-muted"
                  )}>
                    <Icon className={cn("w-5 h-5", platform.enabled ? "text-white" : "text-muted-foreground")} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{platform.name}</span>
                      {platform.enabled && (
                        <Badge variant="outline" className="text-xs">Active</Badge>
                      )}
                    </div>
                    
                    {showUrls && platform.enabled && (
                      <Input
                        placeholder={`https://${platform.id}.com/...`}
                        value={platform.url || ''}
                        onChange={(e) => updateUrl(platform.id, e.target.value)}
                        className="mt-2 h-8 text-xs"
                      />
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-8 w-8",
                      platform.enabled ? "text-primary" : "text-muted-foreground"
                    )}
                    onClick={() => togglePlatform(platform.id)}
                  >
                    {platform.enabled ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onChange(platforms.map(p => ({ ...p, enabled: true })))}
        >
          Enable All
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onChange(platforms.map(p => ({ ...p, enabled: false })))}
        >
          Disable All
        </Button>
      </div>
    </div>
  );
};

export default SocialIconSelector;
