import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export type HeroAnimationStyle = 'plain' | 'glow-box' | 'underline' | 'highlight' | 'typewriter' | 'gradient-wave' | 'text-reveal' | 'bounce';

interface AnimatedHeroTextProps {
  text: string;
  animationStyle: HeroAnimationStyle;
  primaryColor: string;
  secondaryColor?: string;
  enableAnimations?: boolean;
}

// Get default animation style for each theme
export const getThemeDefaultAnimationStyle = (themeKey: string): HeroAnimationStyle => {
  const defaults: Record<string, HeroAnimationStyle> = {
    'smmstay': 'glow-box',
    'flysmm': 'gradient-wave',
    'tgref': 'typewriter',
    'alipanel': 'highlight',
    'smmvisit': 'text-reveal',
    'default': 'plain',
  };
  return defaults[themeKey] || 'plain';
};

// Typewriter animation component
const TypewriterText = ({ text, color }: { text: string; color: string }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index <= text.length) {
        setDisplayedText(text.slice(0, index));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 100);
    
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530);
    
    return () => {
      clearInterval(interval);
      clearInterval(cursorInterval);
    };
  }, [text]);
  
  return (
    <span style={{ background: `linear-gradient(to right, ${color}, ${color})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
      {displayedText}
      <span style={{ opacity: showCursor ? 1 : 0, color }}>|</span>
    </span>
  );
};

// Gradient wave animation component
const GradientWaveText = ({ text, primaryColor, secondaryColor }: { text: string; primaryColor: string; secondaryColor: string }) => {
  return (
    <motion.span
      style={{
        background: `linear-gradient(90deg, ${primaryColor}, ${secondaryColor}, ${primaryColor})`,
        backgroundSize: '200% 100%',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        display: 'inline-block',
      }}
      animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
    >
      {text}
    </motion.span>
  );
};

// Text reveal animation component
const TextRevealText = ({ text, color }: { text: string; color: string }) => {
  return (
    <span className="overflow-hidden inline-block">
      <motion.span
        style={{ 
          display: 'inline-block',
          background: `linear-gradient(to right, ${color}, ${color})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
        initial={{ y: '100%', opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
      >
        {text}
      </motion.span>
    </span>
  );
};

// Bounce animation component
const BounceText = ({ text, primaryColor, secondaryColor }: { text: string; primaryColor: string; secondaryColor: string }) => {
  return (
    <span>
      {text.split('').map((char, i) => (
        <motion.span
          key={i}
          style={{ 
            display: 'inline-block',
            background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ 
            delay: i * 0.05, 
            type: 'spring', 
            stiffness: 300, 
            damping: 15 
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </span>
  );
};

// Glow box animation component
const GlowBoxText = ({ text, color }: { text: string; color: string }) => {
  return (
    <motion.span
      style={{
        display: 'inline-block',
        padding: '0.1em 0.4em',
        border: `2px solid ${color}`,
        borderRadius: '8px',
        background: `${color}15`,
        boxShadow: `0 0 20px ${color}50, inset 0 0 20px ${color}20`,
      }}
      animate={{ 
        boxShadow: [
          `0 0 20px ${color}50, inset 0 0 20px ${color}20`,
          `0 0 35px ${color}70, inset 0 0 25px ${color}30`,
          `0 0 20px ${color}50, inset 0 0 20px ${color}20`
        ] 
      }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      <span style={{ 
        background: `linear-gradient(to right, ${color}, ${color})`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}>
        {text}
      </span>
    </motion.span>
  );
};

// Underline animation component
const UnderlineText = ({ text, color }: { text: string; color: string }) => {
  return (
    <span 
      className="relative inline-block"
      style={{ 
        background: `linear-gradient(to right, ${color}, ${color})`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}
    >
      {text}
      <motion.span
        className="absolute bottom-0 left-0 h-1 rounded-full"
        style={{ backgroundColor: color }}
        initial={{ width: 0 }}
        animate={{ width: '100%' }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
    </span>
  );
};

// Highlight animation component
const HighlightText = ({ text, color }: { text: string; color: string }) => {
  return (
    <span className="relative inline-block">
      <motion.span
        className="absolute inset-0 -z-10"
        style={{ 
          background: `linear-gradient(transparent 60%, ${color}40 60%)`,
        }}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
      <span style={{ 
        background: `linear-gradient(to right, ${color}, ${color})`,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
      }}>
        {text}
      </span>
    </span>
  );
};

// Plain gradient text (default)
const PlainGradientText = ({ text, primaryColor, secondaryColor }: { text: string; primaryColor: string; secondaryColor: string }) => {
  return (
    <span style={{ 
      background: `linear-gradient(to right, ${primaryColor}, ${secondaryColor})`,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    }}>
      {text}
    </span>
  );
};

export const AnimatedHeroText = ({ 
  text, 
  animationStyle, 
  primaryColor, 
  secondaryColor,
  enableAnimations = true 
}: AnimatedHeroTextProps) => {
  const secondary = secondaryColor || primaryColor;
  
  // If animations are disabled, just return plain gradient text
  if (!enableAnimations && animationStyle !== 'plain') {
    return <PlainGradientText text={text} primaryColor={primaryColor} secondaryColor={secondary} />;
  }
  
  switch (animationStyle) {
    case 'typewriter':
      return <TypewriterText text={text} color={primaryColor} />;
    case 'gradient-wave':
      return <GradientWaveText text={text} primaryColor={primaryColor} secondaryColor={secondary} />;
    case 'text-reveal':
      return <TextRevealText text={text} color={primaryColor} />;
    case 'bounce':
      return <BounceText text={text} primaryColor={primaryColor} secondaryColor={secondary} />;
    case 'glow-box':
      return <GlowBoxText text={text} color={primaryColor} />;
    case 'underline':
      return <UnderlineText text={text} color={primaryColor} />;
    case 'highlight':
      return <HighlightText text={text} color={primaryColor} />;
    case 'plain':
    default:
      return <PlainGradientText text={text} primaryColor={primaryColor} secondaryColor={secondary} />;
  }
};

export default AnimatedHeroText;
