import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, 
  Globe, 
  Link2, 
  Code, 
  Eye, 
  EyeOff,
  Info,
  Sparkles,
  RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ServiceSEOTabProps {
  serviceName: string;
  seoData: {
    indexStatus: "index" | "noindex";
    slug: string;
    canonicalUrl: string;
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string;
    customHtmlEnabled: boolean;
    customHtml: string;
    internalLinkingEnabled: boolean;
  };
  onUpdate: (data: Partial<ServiceSEOTabProps["seoData"]>) => void;
}

export const ServiceSEOTab = ({ serviceName, seoData, onUpdate }: ServiceSEOTabProps) => {
  const [showCustomHtml, setShowCustomHtml] = useState(seoData.customHtmlEnabled);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const generateMetaFromName = () => {
    const title = serviceName;
    const description = `Buy ${serviceName} at affordable prices. Fast delivery, high quality, and 24/7 support. Order now and boost your social presence!`;
    const keywords = serviceName
      .toLowerCase()
      .split(/\s+/)
      .filter(w => w.length > 2)
      .join(', ');

    onUpdate({
      metaTitle: title,
      metaDescription: description,
      metaKeywords: keywords,
      slug: generateSlug(serviceName)
    });
  };

  const metaTitleLength = seoData.metaTitle.length;
  const metaDescLength = seoData.metaDescription.length;

  return (
    <div className="space-y-6">
      {/* Auto-Generate Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold flex items-center gap-2">
            <Search className="w-4 h-4" />
            SEO Settings
          </h3>
          <p className="text-sm text-muted-foreground">Optimize for search engines</p>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={generateMetaFromName}
          className="gap-2"
        >
          <Sparkles className="w-4 h-4" />
          Auto-Generate
        </Button>
      </div>

      {/* Index Status & Slug */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Index Status
          </Label>
          <Select 
            value={seoData.indexStatus} 
            onValueChange={(v: "index" | "noindex") => onUpdate({ indexStatus: v })}
          >
            <SelectTrigger className="bg-background/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="index">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-green-500" />
                  Index (Visible to Search)
                </div>
              </SelectItem>
              <SelectItem value="noindex">
                <div className="flex items-center gap-2">
                  <EyeOff className="w-4 h-4 text-amber-500" />
                  No Index (Hidden)
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {seoData.indexStatus === "index" 
              ? "Search engines can find this page" 
              : "Hidden from search results"}
          </p>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Link2 className="w-4 h-4" />
            URL Slug
          </Label>
          <div className="flex gap-2">
            <Input 
              value={seoData.slug}
              onChange={(e) => onUpdate({ slug: e.target.value })}
              placeholder="service-slug"
              className="bg-background/50"
            />
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => onUpdate({ slug: generateSlug(serviceName) })}
              title="Generate from name"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground truncate">
            /services/{seoData.slug || "your-slug"}
          </p>
        </div>
      </div>

      {/* Canonical URL */}
      <div className="space-y-2">
        <Label>Canonical URL (Optional)</Label>
        <Input 
          value={seoData.canonicalUrl}
          onChange={(e) => onUpdate({ canonicalUrl: e.target.value })}
          placeholder="https://yoursite.com/services/original-page"
          className="bg-background/50"
        />
        <p className="text-xs text-muted-foreground">
          Use if this content exists elsewhere to avoid duplicate content issues
        </p>
      </div>

      {/* Meta Title */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Meta Title</Label>
          <Badge 
            variant="outline" 
            className={cn(
              metaTitleLength > 60 ? "text-red-500 border-red-500/20" : 
              metaTitleLength > 50 ? "text-amber-500 border-amber-500/20" : 
              "text-green-500 border-green-500/20"
            )}
          >
            {metaTitleLength}/60
          </Badge>
        </div>
        <Input 
          value={seoData.metaTitle}
          onChange={(e) => onUpdate({ metaTitle: e.target.value })}
          placeholder="Your Service Title - Brand Name"
          className="bg-background/50"
          maxLength={70}
        />
        {metaTitleLength > 60 && (
          <p className="text-xs text-red-500 flex items-center gap-1">
            <Info className="w-3 h-3" />
            Title may be truncated in search results
          </p>
        )}
      </div>

      {/* Meta Description */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Meta Description</Label>
          <Badge 
            variant="outline" 
            className={cn(
              metaDescLength > 160 ? "text-red-500 border-red-500/20" : 
              metaDescLength > 140 ? "text-amber-500 border-amber-500/20" : 
              "text-green-500 border-green-500/20"
            )}
          >
            {metaDescLength}/160
          </Badge>
        </div>
        <Textarea 
          value={seoData.metaDescription}
          onChange={(e) => onUpdate({ metaDescription: e.target.value })}
          placeholder="A compelling description of your service..."
          className="bg-background/50 min-h-[80px]"
          maxLength={200}
        />
      </div>

      {/* Meta Keywords */}
      <div className="space-y-2">
        <Label>Meta Keywords</Label>
        <Input 
          value={seoData.metaKeywords}
          onChange={(e) => onUpdate({ metaKeywords: e.target.value })}
          placeholder="instagram, followers, social media, growth"
          className="bg-background/50"
        />
        <p className="text-xs text-muted-foreground">
          Separate keywords with commas
        </p>
      </div>

      {/* Search Preview */}
      <Card className="bg-muted/30 border-border/50">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground mb-2">Search Preview</p>
          <div className="space-y-1">
            <p className="text-blue-500 hover:underline cursor-pointer text-lg truncate">
              {seoData.metaTitle || serviceName || "Service Title"}
            </p>
            <p className="text-green-600 text-sm truncate">
              yoursite.com/services/{seoData.slug || "service-slug"}
            </p>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {seoData.metaDescription || "Add a meta description to see how your service appears in search results..."}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Custom HTML */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4" />
            <Label>Custom HTML/Schema</Label>
          </div>
          <Switch 
            checked={showCustomHtml}
            onCheckedChange={(checked) => {
              setShowCustomHtml(checked);
              onUpdate({ customHtmlEnabled: checked });
            }}
          />
        </div>
        
        {showCustomHtml && (
          <Textarea 
            value={seoData.customHtml}
            onChange={(e) => onUpdate({ customHtml: e.target.value })}
            placeholder='<script type="application/ld+json">...</script>'
            className="bg-background/50 font-mono text-xs min-h-[100px]"
          />
        )}
      </div>

      {/* Internal Linking */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
        <div className="flex items-center gap-3">
          <Link2 className="w-4 h-4 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Internal Linking</p>
            <p className="text-xs text-muted-foreground">
              Show related services on this page
            </p>
          </div>
        </div>
        <Switch 
          checked={seoData.internalLinkingEnabled}
          onCheckedChange={(checked) => onUpdate({ internalLinkingEnabled: checked })}
        />
      </div>
    </div>
  );
};

export default ServiceSEOTab;
