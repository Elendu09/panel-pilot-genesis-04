import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { LanguageContext, Language } from "@/contexts/LanguageContext";
import { BuyerAuthContext } from "@/contexts/BuyerAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { useContext, useState } from "react";

const languages: { code: Language; name: string; nativeName: string; flag: string }[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
];

export const LanguageSelector = () => {
  const languageContext = useContext(LanguageContext);
  const buyerAuthContext = useContext(BuyerAuthContext);
  const [fallbackLanguage, setFallbackLanguage] = useState<Language>('en');
  
  // Use context values if available, otherwise use fallbacks
  const language = languageContext?.language ?? fallbackLanguage;
  const setLanguage = languageContext?.setLanguage ?? setFallbackLanguage;
  const buyer = buyerAuthContext?.buyer ?? null;
  const panelId = buyerAuthContext?.panelId ?? null;

  const currentLanguage = languages.find(l => l.code === language);

  const handleChangeLanguage = async (code: Language) => {
    setLanguage(code);
    if (buyer) {
      try {
        await supabase
          .from('client_users')
          .update({ preferred_language: code })
          .eq('id', buyer.id)
          .eq('panel_id', panelId);
      } catch (e) {
        console.error('Failed to update preferred language', e);
      }
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Globe className="w-5 h-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleChangeLanguage(lang.code)}
            className={cn(
              "flex items-center gap-3 cursor-pointer",
              language === lang.code && "bg-primary/10"
            )}
          >
            <span className="text-lg">{lang.flag}</span>
            <div className="flex-1">
              <p className="text-sm font-medium">{lang.nativeName}</p>
              <p className="text-xs text-muted-foreground">{lang.name}</p>
            </div>
            {language === lang.code && (
              <span className="w-2 h-2 rounded-full bg-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector;
