import { useState } from "react";
import { X, ExternalLink, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FreeTierBannerProps {
  onDismiss: () => void;
  platformUrl?: string;
  platformName?: string;
}

export const FreeTierBanner = ({ 
  onDismiss, 
  platformUrl = 'https://homeofsmm.com',
  platformName = 'HOME OF SMM'
}: FreeTierBannerProps) => {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed bottom-0 left-0 right-0 z-[9999] bg-gradient-to-r from-primary via-primary/90 to-primary text-white py-2.5 px-4 shadow-lg"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 sm:gap-4 text-sm">
        <Sparkles className="w-4 h-4 shrink-0 hidden sm:block" />
        
        <span className="flex items-center gap-1.5 flex-wrap justify-center">
          <span className="opacity-90">Powered by</span>
          <a 
            href={platformUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="font-semibold hover:underline inline-flex items-center gap-1"
          >
            {platformName}
            <ExternalLink className="w-3 h-3" />
          </a>
        </span>
        
        <span className="hidden sm:inline text-white/60">•</span>
        
        <a 
          href={platformUrl} 
          target="_blank" 
          rel="noopener noreferrer"
          className="hidden sm:inline hover:underline opacity-90 hover:opacity-100 transition-opacity"
        >
          Create your own panel for free
        </a>
        
        <button 
          onClick={onDismiss} 
          className="ml-2 sm:ml-4 p-1.5 hover:bg-white/20 rounded-full transition-colors shrink-0"
          aria-label="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

export default FreeTierBanner;
