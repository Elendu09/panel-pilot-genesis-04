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
        themed ? "bg-primary/10" : "bg-muted",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
