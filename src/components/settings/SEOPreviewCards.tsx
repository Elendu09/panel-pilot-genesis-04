import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe, Facebook, Twitter, Linkedin } from "lucide-react";

interface SEOPreviewCardsProps {
  title: string;
  description: string;
  url: string;
  ogImage?: string;
  panelName: string;
}

export const SEOPreviewCards = ({
  title,
  description,
  url,
  ogImage,
  panelName,
}: SEOPreviewCardsProps) => {
  const displayTitle = title || panelName || "Your Panel Title";
  const displayDescription = description || "Your panel description will appear here...";
  const displayUrl = url || "yourpanel.homeofsmm.com";

  return (
    <div className="space-y-4">
      {/* Google Search Preview */}
      <Card className="bg-white dark:bg-slate-900 border overflow-hidden">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Globe className="w-4 h-4" />
            Google Search Preview
            <Badge variant="outline" className="text-[10px]">SERP</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
              {panelName?.charAt(0)?.toUpperCase() || "P"}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{displayUrl}</p>
              <p className="text-xs text-muted-foreground">https://{displayUrl}</p>
            </div>
          </div>
          <h3 className="text-lg text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-medium line-clamp-1">
            {displayTitle}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {displayDescription}
          </p>
        </CardContent>
      </Card>

      {/* Social Media Previews */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Facebook Preview */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-2 px-3 pt-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Facebook className="w-4 h-4 text-blue-600" />
              Facebook
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="bg-slate-100 dark:bg-slate-800 aspect-video flex items-center justify-center">
              {ogImage ? (
                <img src={ogImage} alt="OG" className="w-full h-full object-cover" />
              ) : (
                <div className="text-xs text-muted-foreground text-center p-4">
                  Add OG Image for preview
                </div>
              )}
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t">
              <p className="text-[10px] text-muted-foreground uppercase">{displayUrl}</p>
              <p className="text-sm font-semibold line-clamp-1">{displayTitle}</p>
              <p className="text-xs text-muted-foreground line-clamp-2">{displayDescription}</p>
            </div>
          </CardContent>
        </Card>

        {/* Twitter Preview */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-2 px-3 pt-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Twitter className="w-4 h-4" />
              Twitter/X
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="border rounded-xl overflow-hidden mx-3 mb-3">
              <div className="bg-slate-100 dark:bg-slate-800 aspect-video flex items-center justify-center">
                {ogImage ? (
                  <img src={ogImage} alt="OG" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-xs text-muted-foreground text-center p-4">
                    Add OG Image
                  </div>
                )}
              </div>
              <div className="p-2 bg-background">
                <p className="text-sm font-medium line-clamp-1">{displayTitle}</p>
                <p className="text-xs text-muted-foreground line-clamp-1">{displayDescription}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <Globe className="w-3 h-3" /> {displayUrl}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* LinkedIn Preview */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-2 px-3 pt-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Linkedin className="w-4 h-4 text-blue-700" />
              LinkedIn
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="bg-slate-100 dark:bg-slate-800 aspect-video flex items-center justify-center">
              {ogImage ? (
                <img src={ogImage} alt="OG" className="w-full h-full object-cover" />
              ) : (
                <div className="text-xs text-muted-foreground text-center p-4">
                  Add OG Image
                </div>
              )}
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t">
              <p className="text-sm font-semibold line-clamp-1">{displayTitle}</p>
              <p className="text-[10px] text-muted-foreground">{displayUrl}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SEOPreviewCards;
