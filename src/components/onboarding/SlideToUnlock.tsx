import { useState, useRef } from 'react';
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SlideToUnlockProps {
  onUnlock: () => void;
  unlocked?: boolean;
  label?: string;
}

export const SlideToUnlock = ({ onUnlock, unlocked = false, label = 'Slide right to continue' }: SlideToUnlockProps) => {
  const [isUnlocked, setIsUnlocked] = useState(unlocked);
  const trackRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);

  const getTrackWidth = () => {
    if (!trackRef.current) return 300;
    return trackRef.current.offsetWidth - 56; // thumb width ~56px
  };

  const threshold = 0.85;

  const bgOpacity = useTransform(x, [0, getTrackWidth()], [0.15, 0.4]);
  const textOpacity = useTransform(x, [0, getTrackWidth() * 0.5], [1, 0]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    const trackWidth = getTrackWidth();
    if (x.get() >= trackWidth * threshold) {
      setIsUnlocked(true);
      x.set(trackWidth);
      onUnlock();
    } else {
      x.set(0);
    }
  };

  if (isUnlocked || unlocked) {
    return (
      <div className="relative h-14 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center gap-2 overflow-hidden">
        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
        <span className="text-sm font-medium text-emerald-500">Unlocked — Click Next to continue</span>
      </div>
    );
  }

  return (
    <div
      ref={trackRef}
      className="relative h-14 rounded-xl bg-amber-500/10 border border-amber-500/30 overflow-hidden select-none"
    >
      {/* Animated fill */}
      <motion.div
        className="absolute inset-0 bg-amber-500/20 rounded-xl"
        style={{ opacity: bgOpacity }}
      />

      {/* Label */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        style={{ opacity: textOpacity }}
      >
        <span className="text-sm text-amber-500 font-medium flex items-center gap-2">
          {label}
          <ArrowRight className="w-4 h-4 animate-pulse" />
        </span>
      </motion.div>

      {/* Draggable thumb */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: getTrackWidth() }}
        dragElastic={0}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        style={{ x }}
        className={cn(
          "absolute top-1 left-1 w-12 h-12 rounded-lg cursor-grab active:cursor-grabbing",
          "bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/30",
          "hover:bg-amber-400 transition-colors z-10"
        )}
        whileTap={{ scale: 0.95 }}
      >
        <ArrowRight className="w-5 h-5 text-white" />
      </motion.div>
    </div>
  );
};
