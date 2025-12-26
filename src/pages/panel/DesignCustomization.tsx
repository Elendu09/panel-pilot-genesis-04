import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Save, ExternalLink, Smartphone, Tablet, Monitor, ChevronDown, Palette, Image, Type, Layout, Zap, BarChart3, HelpCircle, MessageSquare, Loader2, Sparkles, Settings } from 'lucide-react';

const defaultCustomization = {
  logoUrl: '', faviconUrl: '', companyName: '', tagline: 'Best SMM Services',
  primaryColor: '#6366F1', secondaryColor: '#8B5CF6', accentColor: '#EC4899',
  backgroundColor: '#0F172A', surfaceColor: '#1E293B', textColor: '#FFFFFF',
  fontFamily: 'Inter, system-ui, sans-serif', borderRadius: '12',
  enableFastOrder: true, heroTitle: 'Boost Your Social Media Presence',
  heroSubtitle: 'Get real followers, likes, and views at the lowest prices.',
  heroCTAText: 'Get Started', heroImageUrl: '',
  enableFeatures: true, enableStats: true, enableFAQs: true,
  faqs: [{ question: 'How fast is delivery?', answer: 'Most orders start within 0-1 hour.' }],
  footerAbout: '', footerText: '', selectedTheme: 'dark_gradient'
};

const themes = [
  { id: 'dark_gradient', name: 'Dark Gradient', colors: ['#0F172A', '#6366F1', '#8B5CF6'] },
  { id: 'ocean_blue', name: 'Ocean Blue', colors: ['#0C4A6E', '#0EA5E9', '#38BDF8'] },
  { id: 'forest_green', name: 'Forest Green', colors: ['#14532D', '#22C55E', '#4ADE80'] },
  { id: 'professional', name: 'Professional', colors: ['#FFFFFF', '#3B82F6', '#1E40AF'] },
  { id: 'vibrant', name: 'Vibrant', colors: ['#FFF7ED', '#F97316', '#F59E0B'] },
  { id: 'grace', name: 'Grace', colors: ['#5D3A1A', '#F59E0B', '#6B4226'] },
];

export default function DesignCustomization() {
  const [panelId, setPanelId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [customization, setCustomization] = useState(defaultCustomization);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ themes: true });
  const { toast } = useToast();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data: profile } = await supabase.from('profiles').select('id').eq('user_id', user.id).single();
        if (!profile) return;
        const { data: panel } = await supabase.from('panels').select('id, name, custom_branding, theme_type').eq('owner_id', profile.id).single();
        if (panel) {
          setPanelId(panel.id);
          const branding = panel.custom_branding as any || {};
          setCustomization({ ...defaultCustomization, companyName: panel.name || '', selectedTheme: branding.selectedTheme || panel.theme_type || 'dark_gradient', ...branding });
        }
      } catch (error) { console.error('Error:', error); }
      finally { setLoading(false); }
    };
    fetchSettings();
  }, []);

  const updateCustomization = (key: string, value: any) => { setCustomization(prev => ({ ...prev, [key]: value })); setHasUnsavedChanges(true); };
  const applyTheme = (themeId: string) => {
    const theme = themes.find(t => t.id === themeId);
    if (theme) { setCustomization(prev => ({ ...prev, selectedTheme: themeId, backgroundColor: theme.colors[0], primaryColor: theme.colors[1], secondaryColor: theme.colors[2] })); setHasUnsavedChanges(true); }
  };
  const handleSave = async () => {
    if (!panelId) return;
    setSaving(true);
    try {
      await supabase.from('panels').update({ custom_branding: customization, theme_type: customization.selectedTheme as any }).eq('id', panelId);
      toast({ title: 'Design saved!' }); setHasUnsavedChanges(false);
    } catch (error: any) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  const sections = [
    { id: 'themes', title: 'Theme Gallery', icon: Palette },
    { id: 'branding', title: 'Branding', icon: Image },
    { id: 'colors', title: 'Colors', icon: Sparkles },
    { id: 'hero', title: 'Hero Section', icon: Layout },
    { id: 'features', title: 'Features & Stats', icon: BarChart3 },
    { id: 'footer', title: 'Footer', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20"><Settings className="w-5 h-5 text-primary" /></div>
          <div><h1 className="text-xl font-bold">Design Editor</h1><p className="text-sm text-muted-foreground">Customize your storefront</p></div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => window.open('/storefront-preview', '_blank')}><ExternalLink className="w-4 h-4 mr-2" />Preview</Button>
          <Button onClick={handleSave} disabled={saving || !hasUnsavedChanges} className="relative">
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            {hasUnsavedChanges ? 'Save' : 'Saved'}
            {hasUnsavedChanges && <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full animate-pulse" />}
          </Button>
        </div>
      </div>

      <div className="flex h-[calc(100vh-73px)]">
        <div className="w-[400px] border-r border-border/50 overflow-y-auto bg-card/30 p-4 space-y-2">
          {sections.map((section) => (
            <Collapsible key={section.id} open={openSections[section.id]} onOpenChange={() => setOpenSections(prev => ({ ...prev, [section.id]: !prev[section.id] }))}>
              <CollapsibleTrigger className="w-full flex items-center justify-between p-3 rounded-lg bg-card hover:bg-accent/50">
                <div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-primary/10 text-primary"><section.icon className="w-4 h-4" /></div><span className="font-medium">{section.title}</span></div>
                <ChevronDown className={`w-4 h-4 transition-transform ${openSections[section.id] ? 'rotate-180' : ''}`} />
              </CollapsibleTrigger>
              <CollapsibleContent className="p-4 space-y-4">
                {section.id === 'themes' && (
                  <div className="grid grid-cols-2 gap-3">
                    {themes.map(theme => (
                      <button key={theme.id} onClick={() => applyTheme(theme.id)} className={`p-3 rounded-xl border-2 transition-all ${customization.selectedTheme === theme.id ? 'border-primary ring-2 ring-primary/20' : 'border-border hover:border-primary/50'}`}>
                        <div className="flex gap-1 mb-2">{theme.colors.map((c, i) => <div key={i} className="w-6 h-6 rounded-full" style={{ backgroundColor: c }} />)}</div>
                        <p className="text-xs font-medium text-left">{theme.name}</p>
                      </button>
                    ))}
                  </div>
                )}
                {section.id === 'branding' && (
                  <div className="space-y-4">
                    <div><Label>Logo URL</Label><Input value={customization.logoUrl} onChange={(e) => updateCustomization('logoUrl', e.target.value)} placeholder="https://..." /></div>
                    <div><Label>Company Name</Label><Input value={customization.companyName} onChange={(e) => updateCustomization('companyName', e.target.value)} /></div>
                    <div><Label>Tagline</Label><Input value={customization.tagline} onChange={(e) => updateCustomization('tagline', e.target.value)} /></div>
                  </div>
                )}
                {section.id === 'colors' && (
                  <div className="space-y-3">
                    {['primaryColor', 'secondaryColor', 'backgroundColor', 'textColor'].map(key => (
                      <div key={key} className="flex items-center gap-3">
                        <input type="color" value={(customization as any)[key]} onChange={(e) => updateCustomization(key, e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border-0" />
                        <div className="flex-1"><Label className="text-sm capitalize">{key.replace('Color', ' Color')}</Label><Input value={(customization as any)[key]} onChange={(e) => updateCustomization(key, e.target.value)} className="h-8 text-xs font-mono" /></div>
                      </div>
                    ))}
                  </div>
                )}
                {section.id === 'hero' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-accent/30">
                      <div className="flex items-center gap-2"><Zap className="w-4 h-4 text-yellow-500" /><span className="font-medium">Enable Fast Order</span></div>
                      <Switch checked={customization.enableFastOrder} onCheckedChange={(checked) => updateCustomization('enableFastOrder', checked)} />
                    </div>
                    <p className="text-xs text-muted-foreground">{customization.enableFastOrder ? '⚡ Fast Order button in hero' : '🚀 Get Started + Services buttons'}</p>
                    <div><Label>Hero Title</Label><Textarea value={customization.heroTitle} onChange={(e) => updateCustomization('heroTitle', e.target.value)} rows={2} /></div>
                    <div><Label>Hero Subtitle</Label><Textarea value={customization.heroSubtitle} onChange={(e) => updateCustomization('heroSubtitle', e.target.value)} rows={3} /></div>
                  </div>
                )}
                {section.id === 'features' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-accent/30"><span>Show Features</span><Switch checked={customization.enableFeatures} onCheckedChange={(c) => updateCustomization('enableFeatures', c)} /></div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-accent/30"><span>Show Stats</span><Switch checked={customization.enableStats} onCheckedChange={(c) => updateCustomization('enableStats', c)} /></div>
                  </div>
                )}
                {section.id === 'footer' && (
                  <div className="space-y-4">
                    <div><Label>Footer About</Label><Textarea value={customization.footerAbout} onChange={(e) => updateCustomization('footerAbout', e.target.value)} rows={2} /></div>
                    <div><Label>Footer Text</Label><Input value={customization.footerText} onChange={(e) => updateCustomization('footerText', e.target.value)} /></div>
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>

        <div className="flex-1 flex flex-col bg-muted/20">
          <div className="flex items-center justify-center gap-2 p-4 border-b border-border/50">
            {(['desktop', 'tablet', 'mobile'] as const).map(device => (
              <Button key={device} variant={previewDevice === device ? 'default' : 'ghost'} size="sm" onClick={() => setPreviewDevice(device)}>
                {device === 'desktop' ? <Monitor className="w-4 h-4 mr-2" /> : device === 'tablet' ? <Tablet className="w-4 h-4 mr-2" /> : <Smartphone className="w-4 h-4 mr-2" />}
                {device.charAt(0).toUpperCase() + device.slice(1)}
              </Button>
            ))}
          </div>
          <div className="flex-1 overflow-auto p-6">
            <div className={`mx-auto transition-all duration-300 ${previewDevice === 'mobile' ? 'max-w-[375px]' : previewDevice === 'tablet' ? 'max-w-[768px]' : 'w-full'}`}>
              <div className="rounded-2xl overflow-hidden shadow-2xl border border-border/50" style={{ backgroundColor: customization.backgroundColor, fontFamily: customization.fontFamily }}>
                <div className="p-4 border-b flex items-center justify-between" style={{ backgroundColor: customization.surfaceColor }}>
                  <div className="flex items-center gap-3">
                    {customization.logoUrl ? <img src={customization.logoUrl} alt="Logo" className="h-8 w-8 rounded-lg object-cover" /> : <div className="h-8 w-8 rounded-lg flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: customization.primaryColor }}>{customization.companyName?.[0] || 'P'}</div>}
                    <span className="font-bold" style={{ color: customization.textColor }}>{customization.companyName || 'Your Panel'}</span>
                  </div>
                  <div className="px-4 py-2 rounded-lg text-white text-sm" style={{ backgroundColor: customization.primaryColor }}>Login</div>
                </div>
                <div className="p-8 text-center">
                  <h1 className="text-3xl font-bold mb-4" style={{ color: customization.textColor }}>{customization.heroTitle}</h1>
                  <p className="text-lg mb-8 opacity-80" style={{ color: customization.textColor }}>{customization.heroSubtitle}</p>
                  <div className="flex flex-wrap gap-4 justify-center">
                    {customization.enableFastOrder ? (
                      <button className="px-8 py-3 text-white font-semibold flex items-center gap-2" style={{ background: `linear-gradient(135deg, ${customization.primaryColor}, ${customization.secondaryColor})`, borderRadius: `${customization.borderRadius}px` }}><Zap className="w-5 h-5" />Fast Order</button>
                    ) : (
                      <>
                        <button className="px-8 py-3 text-white font-semibold" style={{ backgroundColor: customization.primaryColor, borderRadius: `${customization.borderRadius}px` }}>{customization.heroCTAText || 'Get Started'}</button>
                        <button className="px-8 py-3 font-semibold border" style={{ borderColor: customization.primaryColor, color: customization.textColor, borderRadius: `${customization.borderRadius}px` }}>Services</button>
                      </>
                    )}
                  </div>
                </div>
                <div className="p-4 text-center text-sm opacity-60" style={{ backgroundColor: customization.surfaceColor, color: customization.textColor }}>{customization.footerText || `© ${new Date().getFullYear()} ${customization.companyName}`}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
