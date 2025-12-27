import { motion } from "framer-motion";
import { Instagram, Facebook, Twitter, Youtube, MessageCircle, Send, Linkedin } from "lucide-react";
import { TikTokIcon } from "@/components/icons/SocialIcons";

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
  const enabledPlatforms = socialPlatforms.filter(p => p.enabled !== false);
  const isDark = variant === 'dark';
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`py-12 px-4 ${isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900 border-t'}`}>
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand Column */}
          <div className="md:col-span-1">
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
            <h4 className="font-semibold mb-4">Services</h4>
            <ul className={`space-y-2 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              <li><a href="#services" className={`hover:${isDark ? 'text-white' : 'text-slate-900'} transition-colors`}>Instagram</a></li>
              <li><a href="#services" className={`hover:${isDark ? 'text-white' : 'text-slate-900'} transition-colors`}>YouTube</a></li>
              <li><a href="#services" className={`hover:${isDark ? 'text-white' : 'text-slate-900'} transition-colors`}>TikTok</a></li>
              <li><a href="#services" className={`hover:${isDark ? 'text-white' : 'text-slate-900'} transition-colors`}>Twitter</a></li>
            </ul>
          </div>
          
          {/* Company Column */}
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className={`space-y-2 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              <li><a href="#" className={`hover:${isDark ? 'text-white' : 'text-slate-900'} transition-colors`}>About Us</a></li>
              <li><a href="#" className={`hover:${isDark ? 'text-white' : 'text-slate-900'} transition-colors`}>Contact</a></li>
              <li><a href="#" className={`hover:${isDark ? 'text-white' : 'text-slate-900'} transition-colors`}>Blog</a></li>
            </ul>
          </div>
          
          {/* Support Column */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className={`space-y-2 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              <li><a href="#faq" className={`hover:${isDark ? 'text-white' : 'text-slate-900'} transition-colors`}>FAQ</a></li>
              <li><a href="#" className={`hover:${isDark ? 'text-white' : 'text-slate-900'} transition-colors`}>Terms of Service</a></li>
              <li><a href="#" className={`hover:${isDark ? 'text-white' : 'text-slate-900'} transition-colors`}>Privacy Policy</a></li>
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
