import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function usePanelCustomization(panelId: string | undefined) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: customization, isLoading, error } = useQuery({
    queryKey: ['panel-customization', panelId],
    queryFn: async () => {
      if (!panelId) return null;
      
      // Fetch panel with custom_branding in a single query
      const { data, error } = await supabase
        .from('panels')
        .select('custom_branding, theme_type, primary_color, secondary_color, logo_url, name, blog_enabled')
        .eq('id', panelId)
        .single();

      if (error) throw error;
      
      const branding = (data?.custom_branding as Record<string, any>) || {};
      
      return {
        // Spread all custom_branding fields first
        ...branding,
        // Override with direct column values for backward compatibility
        themeType: branding.selectedTheme || data?.theme_type,
        selectedTheme: branding.selectedTheme || data?.theme_type,
        primaryColor: branding.primaryColor || data?.primary_color,
        secondaryColor: branding.secondaryColor || data?.secondary_color,
        logoUrl: branding.logoUrl || data?.logo_url,
        companyName: branding.companyName || data?.name,
        showBlogInMenu: branding.showBlogInMenu ?? data?.blog_enabled ?? false,
        // Ensure all color fields have values
        accentColor: branding.accentColor || '#EC4899',
        backgroundColor: branding.backgroundColor || '#0F172A',
        surfaceColor: branding.surfaceColor || '#1E293B',
        cardColor: branding.cardColor || branding.surfaceColor || '#1E293B',
        textColor: branding.textColor || '#FFFFFF',
        mutedColor: branding.mutedColor || '#94A3B8',
        borderColor: branding.borderColor || '#334155',
        successColor: branding.successColor || '#22C55E',
        warningColor: branding.warningColor || '#F59E0B',
        infoColor: branding.infoColor || '#3B82F6',
        errorColor: branding.errorColor || '#EF4444',
        // Typography
        fontFamily: branding.fontFamily || 'Inter',
        headingFont: branding.headingFont || 'Inter',
        baseFontSize: branding.baseFontSize || 16,
        headingWeight: branding.headingWeight || '700',
        bodyWeight: branding.bodyWeight || '400',
        lineHeight: branding.lineHeight || 1.6,
        letterSpacing: branding.letterSpacing || 0,
        borderRadius: branding.borderRadius || '12',
        // Theme mode
        themeMode: branding.themeMode || 'dark',
        // Section toggles
        enableFastOrder: branding.enableFastOrder ?? true,
        enablePlatformFeatures: branding.enablePlatformFeatures ?? true,
        enableStats: branding.enableStats ?? true,
        enableFeatures: branding.enableFeatures ?? true,
        enableTestimonials: branding.enableTestimonials ?? true,
        enableFAQs: branding.enableFAQs ?? true,
        // Content arrays
        platformFeatures: branding.platformFeatures || [],
        stats: branding.stats || [],
        featureCards: branding.featureCards || [],
        testimonials: branding.testimonials || [],
        faqs: branding.faqs || [],
        // Hero content
        heroTitle: branding.heroTitle || '',
        heroSubtitle: branding.heroSubtitle || '',
        heroBadgeText: branding.heroBadgeText || '',
        heroCTAText: branding.heroCTAText || 'Get Started',
        heroSecondaryCTAText: branding.heroSecondaryCTAText || 'View Services',
        heroAnimatedTexts: branding.heroAnimatedTexts || [],
        // Footer
        footerAbout: branding.footerAbout || '',
        footerText: branding.footerText || '',
        socialLinks: branding.socialLinks || {},
        // Layout
        homepageLayout: branding.homepageLayout || ['hero', 'platform', 'stats', 'features', 'testimonials', 'faqs'],
      };
    },
    enabled: !!panelId,
    staleTime: 60000, // Cache for 1 minute
  });

  const saveMutation = useMutation({
    mutationFn: async (updates: Record<string, any>) => {
      if (!panelId) throw new Error('No panel ID');
      
      // Build the complete custom_branding object
      const customBranding = {
        // Spread all updates
        ...updates,
        // Ensure all critical fields are included
        primaryColor: updates.primaryColor,
        secondaryColor: updates.secondaryColor,
        accentColor: updates.accentColor,
        backgroundColor: updates.backgroundColor,
        surfaceColor: updates.surfaceColor,
        cardColor: updates.cardColor,
        textColor: updates.textColor,
        mutedColor: updates.mutedColor,
        borderColor: updates.borderColor,
        successColor: updates.successColor,
        warningColor: updates.warningColor,
        infoColor: updates.infoColor,
        errorColor: updates.errorColor,
        // Typography
        fontFamily: updates.fontFamily,
        headingFont: updates.headingFont,
        baseFontSize: updates.baseFontSize,
        headingWeight: updates.headingWeight,
        bodyWeight: updates.bodyWeight,
        lineHeight: updates.lineHeight,
        letterSpacing: updates.letterSpacing,
        borderRadius: updates.borderRadius,
        // Theme
        selectedTheme: updates.selectedTheme || updates.themeType,
        themeMode: updates.themeMode,
      };
      
      const { error } = await supabase
        .from('panels')
        .update({
          custom_branding: customBranding,
          theme_type: updates.themeType || updates.selectedTheme || 'dark_gradient',
          primary_color: updates.primaryColor,
          secondary_color: updates.secondaryColor,
          logo_url: updates.logoUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', panelId);
        
      if (error) throw error;
      
      // Dispatch event to notify other components
      try {
        localStorage.setItem('panelDesignUpdatedAt', String(Date.now()));
        window.dispatchEvent(new Event('panelDesignUpdated'));
      } catch {
        // ignore
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['panel-customization', panelId] });
      queryClient.invalidateQueries({ queryKey: ['panel-buyer-theme', panelId] });
      queryClient.invalidateQueries({ queryKey: ['tenant'] });
      toast({ title: 'Design saved successfully!' });
    },
    onError: (error: any) => {
      toast({ title: 'Error saving design', description: error.message, variant: 'destructive' });
    },
  });

  return {
    customization,
    isLoading,
    error,
    save: saveMutation.mutate,
    isSaving: saveMutation.isPending,
  };
}
