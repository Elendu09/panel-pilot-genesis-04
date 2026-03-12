import { useState, useEffect, useCallback, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Ripple {
  id: number;
  x: number;
  y: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
}

const CursorEffectsComponent = () => {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isMoving, setIsMoving] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // Defer initialization to reduce initial TBT
  useEffect(() => {
    const timer = requestIdleCallback 
      ? requestIdleCallback(() => setIsReady(true), { timeout: 500 })
      : setTimeout(() => setIsReady(true), 200);
    return () => {
      if (requestIdleCallback && typeof timer === 'number') {
        cancelIdleCallback(timer);
      } else {
        clearTimeout(timer as unknown as number);
      }
    };
  }, []);

  // Throttle particle creation more aggressively
  const createParticle = useCallback((x: number, y: number) => {
    if (!isReady) return;
    const particle: Particle = {
      id: Date.now() + Math.random(),
      x,
      y,
      size: 4 + Math.random() * 6,
      color: Math.random() > 0.5 ? 'primary' : 'accent',
    };
    setParticles(prev => [...prev.slice(-10), particle]); // Reduced from 15 to 10
  }, [isReady]);

  // Handle mouse move with more aggressive throttling
  useEffect(() => {
    if (!isReady) return;
    
    let lastTime = 0;
    let moveTimeout: ReturnType<typeof setTimeout>;

    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      setMousePos({ x: e.clientX, y: e.clientY });
      setIsMoving(true);

      // Create particles every 80ms while moving (increased from 50ms)
      if (now - lastTime > 80) {
        createParticle(e.clientX, e.clientY);
        lastTime = now;
      }

      // Reset moving state after mouse stops
      clearTimeout(moveTimeout);
      moveTimeout = setTimeout(() => setIsMoving(false), 150);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(moveTimeout);
    };
  }, [createParticle, isReady]);

  // Handle click for ripple effect
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const ripple: Ripple = {
        id: Date.now(),
        x: e.clientX,
        y: e.clientY,
      };
      setRipples(prev => [...prev, ripple]);

      // Remove ripple after animation
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== ripple.id));
      }, 1000);
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  // Clean up old particles
  useEffect(() => {
    const cleanup = setInterval(() => {
      setParticles(prev => prev.slice(-12));
    }, 500);
    return () => clearInterval(cleanup);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {/* Cursor glow follower */}
      <motion.div
        className="absolute w-64 h-64 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, hsl(var(--primary) / 0.08) 0%, transparent 70%)',
          x: mousePos.x - 128,
          y: mousePos.y - 128,
        }}
        animate={{
          scale: isMoving ? 1.2 : 1,
          opacity: isMoving ? 1 : 0.5,
        }}
        transition={{ type: "spring", stiffness: 150, damping: 15 }}
      />

      {/* Trailing particles */}
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className={`absolute rounded-full ${
              particle.color === 'primary' ? 'bg-primary' : 'bg-accent'
            }`}
            style={{
              width: particle.size,
              height: particle.size,
              left: particle.x - particle.size / 2,
              top: particle.y - particle.size / 2,
            }}
            initial={{ opacity: 0.8, scale: 1 }}
            animate={{
              opacity: 0,
              scale: 0,
              y: -30 + Math.random() * 60,
              x: -30 + Math.random() * 60,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        ))}
      </AnimatePresence>

      {/* Click ripples */}
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.div
            key={ripple.id}
            className="absolute rounded-full border-2 border-primary/40"
            style={{
              left: ripple.x,
              top: ripple.y,
            }}
            initial={{ width: 0, height: 0, x: 0, y: 0, opacity: 1 }}
            animate={{
              width: 200,
              height: 200,
              x: -100,
              y: -100,
              opacity: 0,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        ))}
      </AnimatePresence>

      {/* Secondary ripple ring */}
      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.div
            key={`${ripple.id}-inner`}
            className="absolute rounded-full bg-primary/10"
            style={{
              left: ripple.x,
              top: ripple.y,
            }}
            initial={{ width: 0, height: 0, x: 0, y: 0, opacity: 0.5 }}
            animate={{
              width: 100,
              height: 100,
              x: -50,
              y: -50,
              opacity: 0,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export const CursorEffects = memo(CursorEffectsComponent);
export default CursorEffects;
