import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const ShimmerOverlay = () => (
  <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-primary/5 to-transparent" />
);

const StatCardSkeleton = () => (
  <Card className="bg-card/80 backdrop-blur-sm border-border/50 relative overflow-hidden">
    <ShimmerOverlay />
    <CardContent className="p-3 md:p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-24 bg-primary/10" />
          <Skeleton className="h-8 md:h-10 w-32 bg-primary/15" />
          <Skeleton className="h-5 w-16 rounded-full bg-primary/10" />
        </div>
        <Skeleton className="h-12 w-12 rounded-xl bg-primary/10" />
      </div>
    </CardContent>
  </Card>
);

const WideChartSkeleton = ({ cols = 'lg:col-span-3' }: { cols?: string }) => (
  <Card className={`bg-card/80 backdrop-blur-sm border-border/50 relative overflow-hidden ${cols}`}>
    <ShimmerOverlay />
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-36 bg-primary/10" />
        <div className="flex gap-1">{[1,2,3].map(i => <Skeleton key={i} className="h-7 w-16 rounded bg-primary/10" />)}</div>
      </div>
    </CardHeader>
    <CardContent><Skeleton className="h-[240px] w-full bg-primary/5 rounded-lg" /></CardContent>
  </Card>
);

const ListSkeleton = ({ cols = 'lg:col-span-2' }: { cols?: string }) => (
  <Card className={`bg-card/80 backdrop-blur-sm border-border/50 relative overflow-hidden ${cols}`}>
    <ShimmerOverlay />
    <CardHeader className="pb-3"><Skeleton className="h-6 w-32 bg-primary/10" /></CardHeader>
    <CardContent className="space-y-3">
      {[1,2,3,4,5].map(i => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-2 w-2 rounded-full bg-primary/10" />
          <div className="flex-1 space-y-1"><Skeleton className="h-4 w-3/4 bg-primary/10" /><Skeleton className="h-3 w-1/2 bg-primary/5" /></div>
          <Skeleton className="h-4 w-12 bg-primary/10" />
        </div>
      ))}
    </CardContent>
  </Card>
);

const SmallCardSkeleton = () => (
  <Card className="bg-card/80 backdrop-blur-sm border-border/50 relative overflow-hidden">
    <ShimmerOverlay />
    <CardContent className="p-4 space-y-2">
      <div className="flex items-center justify-between"><Skeleton className="h-8 w-8 rounded-xl bg-primary/10" /><Skeleton className="h-4 w-4 bg-primary/5" /></div>
      <Skeleton className="h-4 w-20 bg-primary/10" />
      <Skeleton className="h-3 w-12 bg-primary/5" />
      <Skeleton className="h-6 w-24 bg-primary/15" />
    </CardContent>
  </Card>
);

const KPISkeleton = () => (
  <Card className="bg-card/80 backdrop-blur-sm border-border/50 relative overflow-hidden">
    <ShimmerOverlay />
    <CardContent className="p-4 space-y-2">
      <div className="flex items-center justify-between"><Skeleton className="h-4 w-4 bg-primary/10" /><Skeleton className="h-3.5 w-3.5 bg-primary/5" /></div>
      <Skeleton className="h-8 w-20 bg-primary/15" />
      <Skeleton className="h-2.5 w-16 bg-primary/5" />
    </CardContent>
  </Card>
);

const KanbanColSkeleton = () => (
  <div className="rounded-xl border border-border/50 border-t-2 border-t-primary/20 bg-muted/20 p-3 space-y-2">
    <div className="flex items-center justify-between mb-3"><Skeleton className="h-3 w-16 bg-primary/10" /><Skeleton className="h-5 w-8 rounded bg-primary/10" /></div>
    {[1,2,3].map(i => <Skeleton key={i} className="h-16 w-full rounded-lg bg-primary/5" />)}
  </div>
);

const FunnelSkeleton = () => (
  <Card className="lg:col-span-2 bg-card/80 backdrop-blur-sm border-border/50 relative overflow-hidden">
    <ShimmerOverlay />
    <CardHeader className="pb-3"><div className="flex items-center justify-between"><Skeleton className="h-6 w-36 bg-primary/10" /><Skeleton className="h-5 w-20 rounded-full bg-primary/10" /></div></CardHeader>
    <CardContent>
      <div className="flex md:grid md:grid-cols-5 gap-3 overflow-x-auto pb-2">
        {[1,2,3,4,5].map(i => (<div key={i} className="flex-shrink-0 min-w-[112px] md:min-w-0 p-3 rounded-xl bg-muted/30 space-y-2"><div className="flex items-center gap-2"><Skeleton className="h-2 w-2 rounded-full bg-primary/20" /><Skeleton className="h-3 w-16 bg-primary/10" /></div><Skeleton className="h-6 w-12 bg-primary/15" /><Skeleton className="h-1.5 w-full rounded-full bg-primary/10" /></div>))}
      </div>
    </CardContent>
  </Card>
);

const CompactCardSkeleton = () => (
  <Card className="bg-card/80 backdrop-blur-sm border-border/50 relative overflow-hidden">
    <ShimmerOverlay />
    <CardHeader className="pb-2"><Skeleton className="h-5 w-24 bg-primary/10" /></CardHeader>
    <CardContent className="space-y-3">
      <div className="flex items-center justify-between"><Skeleton className="h-8 w-20 bg-primary/15" /><Skeleton className="h-5 w-14 rounded-full bg-primary/10" /></div>
      <Skeleton className="h-10 w-full bg-primary/5" /><Skeleton className="h-3 w-16 bg-primary/10" />
    </CardContent>
  </Card>
);

const ChartSkeleton = () => (
  <Card className="bg-card/80 backdrop-blur-sm border-border/50 relative overflow-hidden">
    <ShimmerOverlay />
    <CardHeader className="pb-2"><Skeleton className="h-5 w-32 bg-primary/10" /></CardHeader>
    <CardContent><div className="h-[220px] md:h-[280px] w-full flex items-end gap-2 p-4">{[40,65,45,80,55,70,50,85,60,75].map((h, i) => (<div key={i} className="flex-1"><Skeleton className="w-full rounded-t bg-primary/10" style={{ height: `${h}%` }} /></div>))}</div></CardContent>
  </Card>
);

export function AnalyticsSkeleton() {
  return (
    <div className="space-y-6 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2"><Skeleton className="h-8 w-48 bg-primary/10" /><Skeleton className="h-4 w-64 bg-primary/5" /></div>
          <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">{[1,2,3,4,5].map(i => <Skeleton key={i} className="h-8 w-16 rounded bg-primary/10" />)}</div>
        </div>
      </div>

      {/* Row 1: Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[1,2,3,4].map(i => <StatCardSkeleton key={i} />)}</div>

      {/* Row 2: Order Analytics + Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <WideChartSkeleton cols="lg:col-span-3" />
        <ListSkeleton cols="lg:col-span-2" />
      </div>

      {/* Row 3: Platform Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[1,2,3,4].map(i => <SmallCardSkeleton key={i} />)}</div>

      {/* Row 4: KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">{[1,2,3,4,5,6].map(i => <KPISkeleton key={i} />)}</div>

      {/* Row 5: Kanban */}
      <Card className="bg-card/80 backdrop-blur-sm border-border/50 relative overflow-hidden">
        <ShimmerOverlay />
        <CardHeader className="pb-3"><Skeleton className="h-6 w-32 bg-primary/10" /></CardHeader>
        <CardContent><div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[1,2,3,4].map(i => <KanbanColSkeleton key={i} />)}</div></CardContent>
      </Card>

      {/* Row 6: Activity + Traffic */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <ListSkeleton cols="lg:col-span-3" />
        <ListSkeleton cols="lg:col-span-2" />
      </div>

      {/* Row 7: Rev vs Expenses + Providers + Health */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">{[1,2,3].map(i => <ChartSkeleton key={i} />)}</div>

      {/* Existing sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6"><FunnelSkeleton /><ChartSkeleton /></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">{[1,2,3,4].map(i => <CompactCardSkeleton key={i} />)}</div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><ChartSkeleton /><ChartSkeleton /></div>
    </div>
  );
}
