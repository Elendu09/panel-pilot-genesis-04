import { Globe, Check } from "lucide-react";
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
import { useContext, useState, useCallback } from "react";
import { toast } from "sonner";
import { 
  FlagUS, 
  FlagES, 
  FlagBR, 
  FlagFR, 
  FlagDE, 
  FlagSA, 
  FlagTR, 
  FlagRU, 
  FlagCN, 
  FlagIN,
  type FlagProps 
} from "@/components/icons/FlagIcons";

interface LanguageItem {
  code: Language;
  name: string;
  nativeName: string;
  FlagComponent: React.FC<FlagProps>;
}

const languages: LanguageItem[] = [
  { code: 'en', name: 'English', nativeName: 'English', FlagComponent: FlagUS },
  { code: 'es', name: 'Spanish', nativeName: 'Español', FlagComponent: FlagES },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', FlagComponent: FlagBR },
  { code: 'fr', name: 'French', nativeName: 'Français', FlagComponent: FlagFR },
  { code: 'de', name: 'German', nativeName: 'Deutsch', FlagComponent: FlagDE },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', FlagComponent: FlagSA },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', FlagComponent: FlagTR },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', FlagComponent: FlagRU },
  { code: 'zh', name: 'Chinese', nativeName: '中文', FlagComponent: FlagCN },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', FlagComponent: FlagIN },
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

  const handleChangeLanguage = useCallback(async (code: Language) => {
    setLanguage(code);
    
    // Show feedback
    const selectedLang = languages.find(l => l.code === code);
    toast.success(selectedLang?.nativeName || 'Language updated', {
      description: 'Language updated successfully',
      duration: 2000,
    });
    
    // Persist to database if logged in
    if (buyer && panelId) {
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
  }, [buyer, panelId, setLanguage]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-8 w-8 sm:h-9 sm:w-9" title="Change language">
          {currentLanguage ? (
            <currentLanguage.FlagComponent className="w-5 h-5 sm:w-6 sm:h-6 rounded-sm" />
          ) : (
            <Globe className="w-5 h-5" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 max-h-80 overflow-y-auto bg-popover border border-border shadow-lg z-50">
        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
          Select Language
        </div>
        {languages.map((lang) => {
          const isSelected = language === lang.code;
          const FlagIcon = lang.FlagComponent;
          return (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => handleChangeLanguage(lang.code)}
              className={cn(
                "flex items-center gap-3 cursor-pointer py-2.5",
                isSelected && "bg-primary/10"
              )}
            >
              <FlagIcon className="w-6 h-6 rounded-sm shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{lang.nativeName}</p>
                <p className="text-xs text-muted-foreground">{lang.name}</p>
              </div>
              {isSelected && (
                <Check className="w-4 h-4 text-primary shrink-0" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSelector;
