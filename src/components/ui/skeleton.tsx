import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Use themed shimmer effect with primary color */
  themed?: boolean;
}

function Skeleton({
  className,
  themed = false,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md",
        themed 
          ? "relative overflow-hidden bg-[hsl(var(--primary)/0.15)] dark:bg-[hsl(var(--primary)/0.1)]" 
          : "bg-muted",
        className
      )}
      {...props}
    >
      {themed && (
        <div 
          className="absolute inset-0 animate-shimmer"
          style={{
            backgroundImage: 'linear-gradient(90deg, transparent, hsl(var(--primary) / 0.08), transparent)',
            backgroundSize: '200% 100%',
          }}
        />
      )}
    </div>
  )
}

export { Skeleton }
