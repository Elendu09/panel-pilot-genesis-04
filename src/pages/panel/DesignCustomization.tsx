import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Palette, Upload, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const DesignCustomization = () => {
  const { toast } = useToast();
  const [selectedTheme, setSelectedTheme] = useState("dark_gradient");
  const [customization, setCustomization] = useState({
    primaryColor: "#8B5CF6",
    secondaryColor: "#06B6D4",
    accentColor: "#F59E0B",
    backgroundColor: "#0F172A",
    textColor: "#F8FAFC",
    borderRadius: "8",
    logoUrl: "",
    faviconUrl: "",
    customCSS: "",
    headerTitle: "MyAwesome Panel",
    footerText: "© 2024 MyAwesome Panel. All rights reserved."
  });

  const themes = [
    {
      id: "dark_gradient",
      name: "Dark Gradient",
      preview: "bg-gradient-to-br from-purple-900 to-blue-900",
      description: "Modern dark theme with gradient accents"
    },
    {
      id: "professional",
      name: "Professional",
      preview: "bg-white border border-gray-200",
      description: "Clean and professional light theme"
    },
    {
      id: "vibrant",
      name: "Vibrant",
      preview: "bg-gradient-to-br from-pink-500 to-orange-500",
      description: "Colorful and energetic theme"
    }
  ];

  const handleSave = () => {
    toast({
      title: "Design saved",
      description: "Your panel design has been updated successfully.",
    });
  };

  const handlePreview = () => {
    toast({
      title: "Preview opened",
      description: "Opening preview in new tab...",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Design Customization</h1>
          <p className="text-muted-foreground">Customize your panel's appearance and branding</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handlePreview}>
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button onClick={handleSave} className="bg-gradient-primary hover:shadow-glow">
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        <Card className="bg-gradient-card border-border shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Palette className="w-5 h-5 mr-2" />
              Theme Selection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {themes.map((theme) => (
                <div
                  key={theme.id}
                  className={`relative p-4 border rounded-lg cursor-pointer transition-all ${
                    selectedTheme === theme.id ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                  }`}
                  onClick={() => setSelectedTheme(theme.id)}
                >
                  <div className={`w-full h-20 rounded-lg mb-3 ${theme.preview}`} />
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{theme.name}</h3>
                      <p className="text-sm text-muted-foreground">{theme.description}</p>
                    </div>
                    {selectedTheme === theme.id && (
                      <Badge variant="default">Active</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border shadow-card">
          <CardHeader>
            <CardTitle>Color Scheme</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Primary Color</Label>
                <div className="flex space-x-2">
                  <Input
                    id="primaryColor"
                    type="color"
                    value={customization.primaryColor}
                    onChange={(e) => setCustomization({...customization, primaryColor: e.target.value})}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={customization.primaryColor}
                    onChange={(e) => setCustomization({...customization, primaryColor: e.target.value})}
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondaryColor">Secondary Color</Label>
                <div className="flex space-x-2">
                  <Input
                    id="secondaryColor"
                    type="color"
                    value={customization.secondaryColor}
                    onChange={(e) => setCustomization({...customization, secondaryColor: e.target.value})}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={customization.secondaryColor}
                    onChange={(e) => setCustomization({...customization, secondaryColor: e.target.value})}
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="accentColor">Accent Color</Label>
                <div className="flex space-x-2">
                  <Input
                    id="accentColor"
                    type="color"
                    value={customization.accentColor}
                    onChange={(e) => setCustomization({...customization, accentColor: e.target.value})}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={customization.accentColor}
                    onChange={(e) => setCustomization({...customization, accentColor: e.target.value})}
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="backgroundColor">Background</Label>
                <div className="flex space-x-2">
                  <Input
                    id="backgroundColor"
                    type="color"
                    value={customization.backgroundColor}
                    onChange={(e) => setCustomization({...customization, backgroundColor: e.target.value})}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={customization.backgroundColor}
                    onChange={(e) => setCustomization({...customization, backgroundColor: e.target.value})}
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="textColor">Text Color</Label>
                <div className="flex space-x-2">
                  <Input
                    id="textColor"
                    type="color"
                    value={customization.textColor}
                    onChange={(e) => setCustomization({...customization, textColor: e.target.value})}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    value={customization.textColor}
                    onChange={(e) => setCustomization({...customization, textColor: e.target.value})}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border shadow-card">
          <CardHeader>
            <CardTitle>Branding & Logo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="logoUrl">Logo URL</Label>
                <div className="flex space-x-2">
                  <Input
                    id="logoUrl"
                    placeholder="https://example.com/logo.png"
                    value={customization.logoUrl}
                    onChange={(e) => setCustomization({...customization, logoUrl: e.target.value})}
                  />
                  <Button variant="outline" size="sm">
                    <Upload className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="faviconUrl">Favicon URL</Label>
                <div className="flex space-x-2">
                  <Input
                    id="faviconUrl"
                    placeholder="https://example.com/favicon.ico"
                    value={customization.faviconUrl}
                    onChange={(e) => setCustomization({...customization, faviconUrl: e.target.value})}
                  />
                  <Button variant="outline" size="sm">
                    <Upload className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="headerTitle">Header Title</Label>
                <Input
                  id="headerTitle"
                  value={customization.headerTitle}
                  onChange={(e) => setCustomization({...customization, headerTitle: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="borderRadius">Border Radius (px)</Label>
                <Input
                  id="borderRadius"
                  type="number"
                  value={customization.borderRadius}
                  onChange={(e) => setCustomization({...customization, borderRadius: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="footerText">Footer Text</Label>
              <Input
                id="footerText"
                value={customization.footerText}
                onChange={(e) => setCustomization({...customization, footerText: e.target.value})}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border shadow-card">
          <CardHeader>
            <CardTitle>Custom CSS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="customCSS">Custom CSS Code</Label>
              <Textarea
                id="customCSS"
                placeholder="/* Add your custom CSS here */&#10;.custom-button {&#10;  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);&#10;}"
                value={customization.customCSS}
                onChange={(e) => setCustomization({...customization, customCSS: e.target.value})}
                rows={8}
                className="font-mono text-sm"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DesignCustomization;