import { Smartphone, Tablet, Monitor } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DeviceKey } from '@/hooks/use-device-key';

interface DevicePreviewTabsProps {
  activeDevice: DeviceKey;
  onDeviceChange: (device: DeviceKey) => void;
  className?: string;
}

const devices: { key: DeviceKey; icon: typeof Smartphone; label: string }[] = [
  { key: 'mobile', icon: Smartphone, label: 'Mobile' },
  { key: 'tablet', icon: Tablet, label: 'Tablet' },
  { key: 'desktop', icon: Monitor, label: 'Desktop' },
];

export function DevicePreviewTabs({ activeDevice, onDeviceChange, className }: DevicePreviewTabsProps) {
  return (
    <div className={cn("inline-flex rounded-full border bg-slate-900/60 p-0.5", className)}>
      {devices.map(({ key, icon: Icon, label }) => (
        <button
          key={key}
          type="button"
          onClick={() => onDeviceChange(key)}
          className={cn(
            "px-2.5 py-1 text-[11px] rounded-full capitalize flex items-center gap-1 transition-colors",
            activeDevice === key
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Icon className="w-3 h-3" />
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}
