import { motion } from "framer-motion";

interface BackgroundEffectsProps {
  variant?: 'hero' | 'section' | 'minimal';
  showGrid?: boolean;
  showBubbles?: boolean;
  showParticles?: boolean;
  bubbleCount?: number;
  particleCount?: number;
}

// Generate random bubble configurations
const generateBubbles = (count: number) => {
  return [...Array(count)].map((_, i) => ({
    id: i,
    size: 30 + Math.random() * 150,
    left: Math.random() * 100,
    delay: Math.random() * 10,
    duration: 20 + Math.random() * 25,
    opacity: 0.03 + Math.random() * 0.07,
  }));
};

// Generate random particle configurations
const generateParticles = (count: number) => {
  return [...Array(count)].map((_, i) => ({
    id: i,
    size: 3 + Math.random() * 5,
    left: Math.random() * 100,
    top: Math.random() * 100,
    delay: Math.random() * 5,
    duration: 3 + Math.random() * 4,
  }));
};

export const BackgroundEffects = ({
  variant = 'section',
  showGrid = true,
  showBubbles = true,
  showParticles = true,
  bubbleCount = 6,
  particleCount = 12,
}: BackgroundEffectsProps) => {
  const bubbles = generateBubbles(bubbleCount);
  const particles = generateParticles(particleCount);

  const gridOpacity = variant === 'hero' ? 0.04 : variant === 'minimal' ? 0.02 : 0.03;
  const gridSize = variant === 'hero' ? 50 : 60;

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Animated Grid Pattern */}
      {showGrid && (
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: gridOpacity }}
          transition={{ duration: 1 }}
          style={{
            backgroundImage: `
              linear-gradient(to right, hsl(var(--primary) / 0.15) 1px, transparent 1px),
              linear-gradient(to bottom, hsl(var(--primary) / 0.15) 1px, transparent 1px)
            `,
            backgroundSize: `${gridSize}px ${gridSize}px`,
          }}
        />
      )}

      {/* Floating Bubbles */}
      {showBubbles && bubbles.map((bubble) => (
        <motion.div
          key={`bubble-${bubble.id}`}
          className="absolute rounded-full bg-primary/10 backdrop-blur-[2px]"
          style={{
            width: bubble.size,
            height: bubble.size,
            left: `${bubble.left}%`,
            bottom: -bubble.size,
            opacity: bubble.opacity,
          }}
          animate={{
            y: [0, -(window?.innerHeight || 1000) - bubble.size - 200],
            x: [0, (Math.random() - 0.5) * 100],
            rotate: [0, 360],
            scale: [1, 1.1, 0.9, 1],
          }}
          transition={{
            duration: bubble.duration,
            delay: bubble.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}

      {/* Micro Particles */}
      {showParticles && particles.map((particle) => (
        <motion.div
          key={`particle-${particle.id}`}
          className="absolute rounded-full bg-primary"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.left}%`,
            top: `${particle.top}%`,
          }}
          animate={{
            opacity: [0.1, 0.4, 0.1],
            scale: [1, 1.5, 1],
            y: [0, -15, 0],
            x: [0, (Math.random() - 0.5) * 20, 0],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Shimmer sweep effect */}
      {variant === 'hero' && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent"
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      )}
    </div>
  );
};

export default BackgroundEffects;
