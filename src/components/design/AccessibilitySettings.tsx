import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Eye, 
  Type, 
  Contrast, 
  MousePointer2, 
  Volume2,
  Accessibility,
  Sun
} from "lucide-react";

interface AccessibilitySettingsProps {
  settings: {
    highContrast: boolean;
    largeText: boolean;
    fontSize: number;
    reduceMotion: boolean;
    focusIndicators: boolean;
    screenReaderOptimized: boolean;
  };
  onChange: (settings: AccessibilitySettingsProps['settings']) => void;
}

export const AccessibilitySettings = ({
  settings,
  onChange
}: AccessibilitySettingsProps) => {
  const updateSetting = <K extends keyof typeof settings>(
    key: K, 
    value: typeof settings[K]
  ) => {
    onChange({ ...settings, [key]: value });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Accessibility className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Accessibility Features</h3>
        <Badge variant="outline" className="ml-auto">WCAG 2.1</Badge>
      </div>

      {/* Vision Settings */}
      <Card className="bg-muted/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Vision
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* High Contrast */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Contrast className="w-4 h-4 text-muted-foreground" />
              <div>
                <Label>High Contrast Mode</Label>
                <p className="text-xs text-muted-foreground">Increase color contrast for better visibility</p>
              </div>
            </div>
            <Switch
              checked={settings.highContrast}
              onCheckedChange={(checked) => updateSetting('highContrast', checked)}
            />
          </div>

          {/* Large Text */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Type className="w-4 h-4 text-muted-foreground" />
              <div>
                <Label>Large Text</Label>
                <p className="text-xs text-muted-foreground">Increase default text size</p>
              </div>
            </div>
            <Switch
              checked={settings.largeText}
              onCheckedChange={(checked) => updateSetting('largeText', checked)}
            />
          </div>

          {/* Font Size Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Base Font Size</Label>
              <span className="text-sm font-medium">{settings.fontSize}px</span>
            </div>
            <Slider
              value={[settings.fontSize]}
              onValueChange={([value]) => updateSetting('fontSize', value)}
              min={12}
              max={24}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Small</span>
              <span>Normal</span>
              <span>Large</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Motion & Interaction */}
      <Card className="bg-muted/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <MousePointer2 className="w-4 h-4" />
            Motion & Interaction
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Reduce Motion */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-muted-foreground" />
              <div>
                <Label>Reduce Motion</Label>
                <p className="text-xs text-muted-foreground">Minimize animations and transitions</p>
              </div>
            </div>
            <Switch
              checked={settings.reduceMotion}
              onCheckedChange={(checked) => updateSetting('reduceMotion', checked)}
            />
          </div>

          {/* Focus Indicators */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MousePointer2 className="w-4 h-4 text-muted-foreground" />
              <div>
                <Label>Enhanced Focus Indicators</Label>
                <p className="text-xs text-muted-foreground">Larger, more visible focus outlines</p>
              </div>
            </div>
            <Switch
              checked={settings.focusIndicators}
              onCheckedChange={(checked) => updateSetting('focusIndicators', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Screen Reader */}
      <Card className="bg-muted/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Volume2 className="w-4 h-4" />
            Screen Reader
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Accessibility className="w-4 h-4 text-muted-foreground" />
              <div>
                <Label>Screen Reader Optimized</Label>
                <p className="text-xs text-muted-foreground">Add extra ARIA labels and descriptions</p>
              </div>
            </div>
            <Switch
              checked={settings.screenReaderOptimized}
              onCheckedChange={(checked) => updateSetting('screenReaderOptimized', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card className="border-dashed">
        <CardContent className="p-4">
          <div className="text-center">
            <p 
              className="mb-2"
              style={{ 
                fontSize: `${settings.fontSize}px`,
                fontWeight: settings.largeText ? 600 : 400
              }}
            >
              Preview Text Sample
            </p>
            <p className="text-xs text-muted-foreground">
              This shows how text will appear with your accessibility settings
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccessibilitySettings;
