import { memo, useMemo } from "react";

interface BackgroundEffectsProps {
  variant?: 'hero' | 'section' | 'minimal';
  showGrid?: boolean;
  showBubbles?: boolean;
  showParticles?: boolean;
  bubbleCount?: number;
  particleCount?: number;
}

// Use CSS animations instead of framer-motion to reduce TBT
const BackgroundEffectsComponent = ({
  variant = 'section',
  showGrid = true,
  showBubbles = true,
  showParticles = true,
  bubbleCount = 6,
  particleCount = 12,
}: BackgroundEffectsProps) => {
  // Memoize bubble and particle configs
  const bubbles = useMemo(() => 
    [...Array(bubbleCount)].map((_, i) => ({
      id: i,
      size: 30 + Math.random() * 150,
      left: Math.random() * 100,
      delay: Math.random() * 10,
      duration: 20 + Math.random() * 25,
      opacity: 0.03 + Math.random() * 0.07,
    })), [bubbleCount]
  );

  const particles = useMemo(() => 
    [...Array(particleCount)].map((_, i) => ({
      id: i,
      size: 3 + Math.random() * 5,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 3 + Math.random() * 4,
    })), [particleCount]
  );

  const gridOpacity = variant === 'hero' ? 0.04 : variant === 'minimal' ? 0.02 : 0.03;
  const gridSize = variant === 'hero' ? 50 : 60;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Static Grid Pattern - no animation needed */}
      {showGrid && (
        <div
          className="absolute inset-0 animate-fade-in"
          style={{
            opacity: gridOpacity,
            backgroundImage: `
              linear-gradient(to right, hsl(var(--primary) / 0.15) 1px, transparent 1px),
              linear-gradient(to bottom, hsl(var(--primary) / 0.15) 1px, transparent 1px)
            `,
            backgroundSize: `${gridSize}px ${gridSize}px`,
          }}
        />
      )}

      {/* Floating Bubbles - CSS animations */}
      {showBubbles && bubbles.map((bubble) => (
        <div
          key={`bubble-${bubble.id}`}
          className="absolute rounded-full bg-primary/10 backdrop-blur-[2px] animate-float-up"
          style={{
            width: bubble.size,
            height: bubble.size,
            left: `${bubble.left}%`,
            bottom: -bubble.size,
            opacity: bubble.opacity,
            animationDuration: `${bubble.duration}s`,
            animationDelay: `${bubble.delay}s`,
          }}
        />
      ))}

      {/* Micro Particles - CSS animations */}
      {showParticles && particles.map((particle) => (
        <div
          key={`particle-${particle.id}`}
          className="absolute rounded-full bg-primary animate-pulse-float"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}

      {/* Shimmer sweep effect - CSS animation */}
      {variant === 'hero' && (
        <div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer"
        />
      )}
    </div>
  );
};

export const BackgroundEffects = memo(BackgroundEffectsComponent);
export default BackgroundEffects;
