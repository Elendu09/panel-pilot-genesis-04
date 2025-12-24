import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { HOSTING_PROVIDERS, type HostingProvider } from "@/lib/hosting-config";

interface HostingProviderSelectorProps {
  selected: HostingProvider;
  onSelect: (provider: HostingProvider) => void;
  customTarget?: string;
  onCustomTargetChange?: (target: string) => void;
}

export const HostingProviderSelector = ({
  selected,
  onSelect,
  customTarget = '',
  onCustomTargetChange,
}: HostingProviderSelectorProps) => {
  const providers = Object.values(HOSTING_PROVIDERS);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {providers.map((provider) => (
          <Button
            key={provider.id}
            variant={selected === provider.id ? "default" : "outline"}
            className={cn(
              "h-auto py-4 flex flex-col gap-2 transition-all",
              selected === provider.id && "ring-2 ring-primary shadow-lg"
            )}
            onClick={() => onSelect(provider.id)}
          >
            <span className="text-2xl">{provider.icon}</span>
            <span className="font-medium text-sm">{provider.name}</span>
          </Button>
        ))}
      </div>

      {selected === 'custom' && onCustomTargetChange && (
        <Card className="border-dashed">
          <CardContent className="pt-4">
            <div className="space-y-2">
              <Label htmlFor="customTarget">Custom Server IP or Hostname</Label>
              <Input
                id="customTarget"
                placeholder="e.g., 123.45.67.89 or my-server.example.com"
                value={customTarget}
                onChange={(e) => onCustomTargetChange(e.target.value)}
                className="bg-background/50"
              />
              <p className="text-xs text-muted-foreground">
                Enter your server's IP address (for A record) or hostname (for CNAME record)
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {selected && (
        <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
          <p className="text-sm text-muted-foreground">
            {HOSTING_PROVIDERS[selected].description}
          </p>
        </div>
      )}
    </div>
  );
};

export default HostingProviderSelector;
