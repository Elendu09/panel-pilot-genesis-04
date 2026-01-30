import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface MiniSparklineProps {
  data: number[];
  color?: string;
  height?: number;
  width?: number;
  showArea?: boolean;
  className?: string;
}

export function MiniSparkline({ 
  data, 
  color = 'hsl(var(--primary))', 
  height = 40, 
  width = 80,
  showArea = false,
  className
}: MiniSparklineProps) {
  const { pathD, areaD, viewBox } = useMemo(() => {
    if (data.length === 0) return { pathD: '', areaD: '', viewBox: '0 0 100 40' };
    
    const max = Math.max(...data, 1);
    const min = Math.min(...data, 0);
    const range = max - min || 1;
    
    const points = data.map((value, index) => ({
      x: (index / (data.length - 1)) * 100,
      y: 40 - ((value - min) / range) * 35 - 2.5
    }));
    
    // Line path
    const pathD = points
      .map((point, i) => `${i === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
      .join(' ');
    
    // Area path (for filled sparklines)
    const areaD = pathD + ` L ${points[points.length - 1]?.x || 0} 40 L 0 40 Z`;
    
    return { pathD, areaD, viewBox: '0 0 100 40' };
  }, [data]);

  if (data.length === 0) {
    return (
      <div style={{ width, height }} className="flex items-center justify-center">
        <div className="w-full h-0.5 bg-muted rounded" />
      </div>
    );
  }

  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 100 40" 
      className={cn("overflow-visible", className)}
      preserveAspectRatio="none"
    >
      {showArea && (
        <path
          d={areaD}
          fill={color}
          fillOpacity={0.1}
        />
      )}
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
