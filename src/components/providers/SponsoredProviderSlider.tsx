import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { DirectProviderCard } from "./DirectProviderCard";

interface DirectPanel {
  id: string;
  name: string;
  subdomain: string | null;
  custom_domain: string | null;
  logo_url: string | null;
  service_count?: number;
  ad_type?: 'sponsored' | 'top' | 'best' | 'featured' | null;
  is_connected?: boolean;
}

interface SponsoredProviderSliderProps {
  providers: DirectPanel[];
  onEnable: (provider: DirectPanel) => Promise<void>;
  enablingId: string | null;
}

export function SponsoredProviderSlider({
  providers,
  onEnable,
  enablingId
}: SponsoredProviderSliderProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'start',
    slidesToScroll: 1,
    containScroll: 'trimSnaps',
    skipSnaps: false
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  // Auto-scroll every 5 seconds
  useEffect(() => {
    if (!emblaApi || providers.length <= 1) return;
    const interval = setInterval(() => {
      emblaApi.scrollNext();
    }, 5000);
    return () => clearInterval(interval);
  }, [emblaApi, providers.length]);

  if (providers.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500/20 to-yellow-500/10">
            <Crown className="w-5 h-5 text-amber-500" />
          </div>
          <h3 className="font-semibold text-lg">Sponsored Providers</h3>
        </div>
        
        {providers.length > 1 && (
          <div className="flex gap-1">
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8"
              onClick={scrollPrev}
              disabled={!canScrollPrev}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8"
              onClick={scrollNext}
              disabled={!canScrollNext}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="relative">
        {/* Gradient fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
        
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-transparent to-amber-500/10 rounded-xl blur-xl -z-10" />

        <div className="overflow-hidden rounded-xl" ref={emblaRef}>
          <div className="flex gap-4">
            {providers.map((provider) => (
              <div 
                key={provider.id} 
                className={cn(
                  "flex-[0_0_100%] min-w-0",
                  "sm:flex-[0_0_calc(50%-8px)]",
                  "lg:flex-[0_0_calc(33.333%-11px)]"
                )}
              >
                <DirectProviderCard
                  provider={provider}
                  onEnable={onEnable}
                  isEnabled={provider.is_connected}
                  isLoading={enablingId === provider.id}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
