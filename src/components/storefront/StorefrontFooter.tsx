import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Instagram, Facebook, Twitter, Youtube, MessageCircle, Send, Linkedin } from "lucide-react";
import { TikTokIcon } from "@/components/icons/SocialIcons";
import { useLanguage } from "@/contexts/LanguageContext";

interface SocialPlatform {
  id: string;
  name: string;
  url?: string;
  enabled?: boolean;
}

interface StorefrontFooterProps {
  panelName: string;
  footerAbout?: string;
  footerText?: string;
  socialPlatforms?: SocialPlatform[];
  primaryColor?: string;
  variant?: 'dark' | 'light';
}

const SOCIAL_ICONS: Record<string, any> = {
  instagram: Instagram,
  facebook: Facebook,
  twitter: Twitter,
  youtube: Youtube,
  tiktok: TikTokIcon,
  telegram: Send,
  linkedin: Linkedin,
  whatsapp: MessageCircle,
};

const SOCIAL_COLORS: Record<string, string> = {
  instagram: 'from-purple-500 via-pink-500 to-orange-400',
  facebook: 'from-blue-600 to-blue-700',
  twitter: 'from-slate-800 to-slate-900',
  youtube: 'from-red-500 to-red-600',
  tiktok: 'from-cyan-400 via-slate-900 to-pink-500',
  telegram: 'from-sky-400 to-sky-500',
  linkedin: 'from-blue-600 to-blue-700',
  whatsapp: 'from-green-500 to-green-600',
};

export const StorefrontFooter = ({
  panelName,
  footerAbout,
  footerText,
  socialPlatforms = [],
  primaryColor = '#3B82F6',
  variant = 'dark'
}: StorefrontFooterProps) => {
  // Get translations - wrapped in try/catch since it may not always be available
  let t = (key: string) => key;
  try {
    const lang = useLanguage();
    t = lang.t;
  } catch {
    // Not within LanguageProvider context
  }
  
  const enabledPlatforms = socialPlatforms.filter(p => p.enabled !== false);
  const isDark = variant === 'dark';
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`py-12 px-4 ${isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900 border-t'}`}>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 sm:gap-8 mb-8">
          {/* Brand Column - full width on mobile */}
          <div className="col-span-2 sm:col-span-3 md:col-span-1">
            <h3 className="font-bold text-lg mb-4">{panelName}</h3>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {footerAbout || 'Professional social media marketing services with high-quality results.'}
            </p>
            
            {/* Social Icons */}
            {enabledPlatforms.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {enabledPlatforms.map((platform) => {
                  const Icon = SOCIAL_ICONS[platform.id] || MessageCircle;
                  const gradient = SOCIAL_COLORS[platform.id] || 'from-slate-500 to-slate-600';
                  
                  return (
                    <motion.a
                      key={platform.id}
                      href={platform.url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className={`w-9 h-9 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow`}
                    >
                      <Icon className="w-4 h-4 text-white" />
                    </motion.a>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* Services Column */}
          <div>
            <h4 className="font-semibold mb-4">{t('storefront.footer.services')}</h4>
            <ul className={`space-y-2 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              <li><Link to="/services" className={`hover:${isDark ? 'text-white' : 'text-slate-900'} transition-colors`}>Instagram</Link></li>
              <li><Link to="/services" className={`hover:${isDark ? 'text-white' : 'text-slate-900'} transition-colors`}>YouTube</Link></li>
              <li><Link to="/services" className={`hover:${isDark ? 'text-white' : 'text-slate-900'} transition-colors`}>TikTok</Link></li>
              <li><Link to="/services" className={`hover:${isDark ? 'text-white' : 'text-slate-900'} transition-colors`}>Twitter</Link></li>
            </ul>
          </div>
          
          {/* Company Column */}
          <div>
            <h4 className="font-semibold mb-4">{t('storefront.footer.company')}</h4>
            <ul className={`space-y-2 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              <li><Link to="/contact" className={`hover:${isDark ? 'text-white' : 'text-slate-900'} transition-colors`}>{t('storefront.footer.aboutUs')}</Link></li>
              <li><Link to="/contact" className={`hover:${isDark ? 'text-white' : 'text-slate-900'} transition-colors`}>{t('storefront.footer.contact')}</Link></li>
              <li><Link to="/blog" className={`hover:${isDark ? 'text-white' : 'text-slate-900'} transition-colors`}>{t('storefront.nav.blog')}</Link></li>
            </ul>
          </div>
          
          {/* Support Column */}
          <div>
            <h4 className="font-semibold mb-4">{t('storefront.footer.support')}</h4>
            <ul className={`space-y-2 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              <li><a href="#faq" className={`hover:${isDark ? 'text-white' : 'text-slate-900'} transition-colors`}>{t('storefront.nav.faq')}</a></li>
              <li><Link to="/terms" className={`hover:${isDark ? 'text-white' : 'text-slate-900'} transition-colors`}>{t('storefront.footer.termsOfService')}</Link></li>
              <li><Link to="/privacy" className={`hover:${isDark ? 'text-white' : 'text-slate-900'} transition-colors`}>{t('storefront.footer.privacyPolicy')}</Link></li>
            </ul>
          </div>
        </div>
        
        <div className={`border-t ${isDark ? 'border-slate-800' : 'border-slate-200'} pt-8 text-center`}>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
            {footerText || `© ${currentYear} ${panelName}. All rights reserved.`}
          </p>
        </div>
      </div>
    </footer>
  );
};