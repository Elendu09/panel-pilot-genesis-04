import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface DateRange {
  start: Date;
  end: Date;
}

interface ComparisonDatePickerProps {
  currentRange: DateRange;
  comparisonRange: DateRange;
  onCurrentRangeChange: (range: DateRange) => void;
  onComparisonRangeChange: (range: DateRange) => void;
  presets?: { label: string; value: string }[];
  activePreset?: string;
  onPresetChange?: (preset: string) => void;
}

export function ComparisonDatePicker({
  currentRange,
  comparisonRange,
  onCurrentRangeChange,
  onComparisonRangeChange,
  presets = [
    { label: 'Daily', value: '1d' },
    { label: '7D', value: '7d' },
    { label: '30D', value: '30d' },
    { label: '90D', value: '90d' },
    { label: 'Custom', value: 'custom' }
  ],
  activePreset = '30d',
  onPresetChange
}: ComparisonDatePickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [selectingCurrent, setSelectingCurrent] = useState(true);
  
  const formatRange = (range: DateRange) => {
    return `${format(range.start, 'MMM dd')} - ${format(range.end, 'MMM dd')}`;
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-background/60 backdrop-blur-sm border border-border/50 rounded-lg p-2">
      {/* Presets */}
      <div className="flex items-center gap-1 flex-wrap">
        {presets.slice(0, 4).map((preset) => (
          <Button
            key={preset.value}
            variant={activePreset === preset.value ? 'default' : 'ghost'}
            size="sm"
            onClick={() => onPresetChange?.(preset.value)}
            className={cn(
              "h-8",
              activePreset === preset.value && "bg-primary shadow-sm"
            )}
          >
            {preset.label}
          </Button>
        ))}
      </div>
      
      {/* Date Range Display */}
      <Popover open={showPicker} onOpenChange={setShowPicker}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-8 gap-2 text-xs",
              activePreset === 'custom' && "border-primary"
            )}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>{formatRange(currentRange)}</span>
            <span className="text-muted-foreground">compared to</span>
            <span>{formatRange(comparisonRange)}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-4" align="end">
          <div className="space-y-4">
            {/* Toggle between current and comparison */}
            <div className="flex gap-2">
              <Button
                variant={selectingCurrent ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectingCurrent(true)}
              >
                Current Period
              </Button>
              <Button
                variant={!selectingCurrent ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectingCurrent(false)}
              >
                Compare To
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium mb-2">Start Date</p>
                <Calendar
                  mode="single"
                  selected={selectingCurrent ? currentRange.start : comparisonRange.start}
                  onSelect={(date) => {
                    if (!date) return;
                    if (selectingCurrent) {
                      onCurrentRangeChange({ ...currentRange, start: date });
                    } else {
                      onComparisonRangeChange({ ...comparisonRange, start: date });
                    }
                  }}
                  disabled={(date) => date > new Date()}
                  className="rounded-md border pointer-events-auto"
                />
              </div>
              <div>
                <p className="text-sm font-medium mb-2">End Date</p>
                <Calendar
                  mode="single"
                  selected={selectingCurrent ? currentRange.end : comparisonRange.end}
                  onSelect={(date) => {
                    if (!date) return;
                    if (selectingCurrent) {
                      onCurrentRangeChange({ ...currentRange, end: date });
                    } else {
                      onComparisonRangeChange({ ...comparisonRange, end: date });
                    }
                  }}
                  disabled={(date) => date > new Date()}
                  className="rounded-md border pointer-events-auto"
                />
              </div>
            </div>
            
            <div className="flex justify-between items-center pt-2 border-t">
              <div className="text-xs text-muted-foreground">
                <span className="font-medium">{formatRange(currentRange)}</span>
                <ArrowRight className="inline w-3 h-3 mx-1" />
                <span>{formatRange(comparisonRange)}</span>
              </div>
              <Button size="sm" onClick={() => {
                setShowPicker(false);
                onPresetChange?.('custom');
              }}>
                Apply
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
