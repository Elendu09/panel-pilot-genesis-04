import { useState, useEffect } from "react";

interface AnimatedTextProps {
  phrases: Array<{
    static: string;
    bold: string;
  }>;
  interval?: number;
}

export const AnimatedText = ({ phrases, interval = 3000 }: AnimatedTextProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % phrases.length);
        setIsAnimating(false);
      }, 500);
    }, interval);

    return () => clearInterval(timer);
  }, [phrases.length, interval]);

  return (
    <div className="text-center py-1">
      <div className="inline-flex items-center justify-center gap-3 bg-card/50 backdrop-blur-sm border border-border/20 rounded-2xl px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-300">
        <p className="text-base font-medium text-muted-foreground">
          {phrases[0].static}
        </p>
        <div className="relative h-6 flex items-center overflow-hidden min-w-[120px]">
          <div
            className={`absolute inset-0 transition-all duration-500 ease-out ${
              isAnimating 
                ? 'transform translate-y-full opacity-0 scale-95' 
                : 'transform translate-y-0 opacity-100 scale-100'
            }`}
          >
            <div className="inline-flex items-center">
              <span className="font-semibold text-base tracking-wide bg-gradient-primary bg-clip-text text-transparent">
                {phrases[currentIndex].bold}
              </span>
              <div className="ml-2 w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};