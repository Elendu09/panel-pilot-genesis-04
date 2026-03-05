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
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [autoplayPaused, setAutoplayPaused] = useState(false);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
    setSelectedIndex(emblaApi.selectedScrollSnap());
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

  useEffect(() => {
    if (!emblaApi || providers.length <= 1 || autoplayPaused) return;
    const interval = setInterval(() => {
      emblaApi.scrollNext();
    }, 4000);
    return () => clearInterval(interval);
  }, [emblaApi, providers.length, autoplayPaused]);

  if (providers.length === 0) return null;

  return (
    <div
      className="space-y-4"
      onMouseEnter={() => setAutoplayPaused(true)}
      onMouseLeave={() => setAutoplayPaused(false)}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-amber-500/20 to-yellow-500/10">
            <Crown className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h3 className="font-semibold text-lg" data-testid="text-sponsored-title">Sponsored Providers</h3>
            <p className="text-xs text-muted-foreground">{providers.length} promoted panels</p>
          </div>
        </div>
        
        {providers.length > 1 && (
          <div className="flex gap-1">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={scrollPrev}
              disabled={!canScrollPrev}
              data-testid="button-slider-prev"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={scrollNext}
              disabled={!canScrollNext}
              data-testid="button-slider-next"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
        
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

      {providers.length > 1 && (
        <div className="flex items-center justify-center gap-1.5" data-testid="slider-dots">
          {providers.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={cn(
                "rounded-full transition-all duration-300",
                selectedIndex === index
                  ? "w-6 h-2 bg-amber-500"
                  : "w-2 h-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
              )}
              data-testid={`button-dot-${index}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
