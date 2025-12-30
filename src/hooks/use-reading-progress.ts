import { useState, useEffect, RefObject } from 'react';

export function useReadingProgress(contentRef: RefObject<HTMLElement>) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current) return;

      const element = contentRef.current;
      const windowHeight = window.innerHeight;
      const elementTop = element.offsetTop;
      const elementHeight = element.offsetHeight;
      const scrollTop = window.scrollY;

      // Calculate progress
      const start = elementTop - windowHeight;
      const end = elementTop + elementHeight - windowHeight;
      const scrolled = scrollTop - start;
      const total = end - start;

      const calculatedProgress = Math.min(100, Math.max(0, (scrolled / total) * 100));
      setProgress(calculatedProgress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial calculation
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [contentRef]);

  return progress;
}
