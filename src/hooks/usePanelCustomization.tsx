import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useMemo } from "react";

// Theme-specific defaults
const themeDefaults: Record<string, any> = {
  alipanel: {
    fontFamily: "Inter",
    headingFont: "Inter",
    borderRadius: "12",
    cardRadius: 16,
    buttonRadius: 12,
    buttonStyle: "solid",
    shadowIntensity: "medium",
    enableAnimations: true,
    animationStyle: "fade",
    heroAnimatedTexts: ["Social Media Growth", "Fast Delivery", "Quality Services"],
    backgroundPattern: "none",
    patternOpacity: 0.03,
  },
  smmvisit: {
    fontFamily: "Poppins",
    headingFont: "Poppins",
    borderRadius: "8",
    cardRadius: 12,
    buttonRadius: 8,
    buttonStyle: "gradient",
    shadowIntensity: "high",
    enableAnimations: true,
    animationStyle: "slide",
    heroAnimatedTexts: ["Boost Your Presence", "Real Engagement", "24/7 Support"],
    backgroundPattern: "dots",
    patternOpacity: 0.05,
  },
  default: {
    fontFamily: "Inter",
    headingFont: "Inter",
    borderRadius: "12",
    cardRadius: 16,
    buttonRadius: 12,
    buttonStyle: "solid",
    shadowIntensity: "medium",
    enableAnimations: true,
    animationStyle: "fade",
    heroAnimatedTexts: ["Welcome to our Panel", "Best SMM Services", "Grow your Social Media"],
    backgroundPattern: "none",
    patternOpacity: 0.03,
  },
};

// Light mode defaults
const lightModeDefaults = {
  backgroundColor: "#FAFBFC",
  surfaceColor: "#FFFFFF",
  cardColor: "#FFFFFF",
  textColor: "#1F2937",
  mutedColor: "#6B7280",
  borderColor: "#E5E7EB",
};

// Dark mode defaults
const darkModeDefaults = {
  backgroundColor: "#0F172A",
  surfaceColor: "#1E293B",
  cardColor: "#1E293B",
  textColor: "#FFFFFF",
  mutedColor: "#94A3B8",
  borderColor: "#334155",
};

export function usePanelCustomization(panelId: string | undefined) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: rawData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["panel-customization", panelId],
    queryFn: async () => {
      if (!panelId) return null;

      const { data, error } = await (supabase as any)
        .from("panels_public")
        .select("custom_branding, theme_type, primary_color, secondary_color, logo_url, name, blog_enabled")
        .eq("id", panelId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!panelId,
    staleTime: 1000, // Reduced to 1 second for better preview responsiveness
    refetchInterval: 2000, // Poll every 2 seconds for preview updates
  });

  // Process and memoize customization data
  const customization = useMemo(() => {
    if (!rawData) return null;

    const branding = (rawData?.custom_branding as Record<string, any>) || {};
    const selectedTheme = branding.selectedTheme || rawData?.theme_type || "default";

    // Get theme defaults
    const themeDefaultsData = themeDefaults[selectedTheme] || themeDefaults.default;

    // Merge base branding with defaults
    const baseData = {
      ...themeDefaultsData, // Apply theme defaults first
      ...branding, // Then override with saved values

      // Critical fields from database
      selectedTheme,
      themeType: selectedTheme,
      primaryColor: branding.primaryColor || rawData?.primary_color || "#6366F1",
      secondaryColor: branding.secondaryColor || rawData?.secondary_color || "#8B5CF6",
      logoUrl: branding.logoUrl || rawData?.logo_url,
      companyName: branding.companyName || rawData?.name,
      showBlogInMenu: branding.showBlogInMenu ?? rawData?.blog_enabled ?? false,

      // Theme mode (light/dark)
      themeMode: branding.themeMode || "dark",

      // Mode-specific colors with defaults
      lightModeColors: {
        ...lightModeDefaults,
        ...branding.lightModeColors,
      },
      darkModeColors: {
        ...darkModeDefaults,
        ...branding.darkModeColors,
      },

      // Ensure arrays
      heroAnimatedTexts: branding.heroAnimatedTexts || themeDefaultsData.heroAnimatedTexts || [],
      platformFeatures: branding.platformFeatures || [],
      stats: branding.stats || [],
      featureCards: branding.featureCards || [],
      testimonials: branding.testimonials || [],
      faqs: branding.faqs || [],

      // Layout
      homepageLayout: branding.homepageLayout || ["hero", "platform", "stats", "features", "testimonials", "faqs"],

      // Footer
      footerText:
        branding.footerText ||
        `© ${new Date().getFullYear()} ${branding.companyName || rawData?.name || "Your Panel"}. All rights reserved.`,
    };

    // Calculate current colors based on theme mode
    const isLight = baseData.themeMode === "light";
    const currentColors = isLight ? baseData.lightModeColors : baseData.darkModeColors;

    return {
      ...baseData,
      // Inject current mode colors at top level for easy access
      backgroundColor: currentColors.backgroundColor,
      surfaceColor: currentColors.surfaceColor,
      cardColor: currentColors.cardColor,
      textColor: currentColors.textColor,
      mutedColor: currentColors.mutedColor,
      borderColor: currentColors.borderColor,

      // Raw mode colors for editing
      lightModeColors: baseData.lightModeColors,
      darkModeColors: baseData.darkModeColors,

      // Additional computed properties
      isDarkMode: !isLight,
      themeLabel: isLight ? "Light" : "Dark",
    };
  }, [rawData]);

  // Helper to apply theme defaults when switching themes
  const getThemeDefaults = (themeName: string) => {
    return themeDefaults[themeName] || themeDefaults.default;
  };

  const saveMutation = useMutation({
    mutationFn: async (updates: Record<string, any>) => {
      if (!panelId) throw new Error("No panel ID");

      // Get current data to merge with
      const currentData = (rawData?.custom_branding as Record<string, any>) || {};

      // If theme is changing, apply theme defaults first
      let mergedUpdates = { ...updates };
      if (updates.selectedTheme && updates.selectedTheme !== currentData.selectedTheme) {
        const newThemeDefaults = getThemeDefaults(updates.selectedTheme);
        mergedUpdates = {
          ...newThemeDefaults, // Apply new theme defaults
          ...updates, // Override with explicit updates
          // Preserve user content
          heroTitle: updates.heroTitle ?? currentData.heroTitle ?? "",
          heroSubtitle: updates.heroSubtitle ?? currentData.heroSubtitle ?? "",
          faqs: updates.faqs ?? currentData.faqs ?? [],
          testimonials: updates.testimonials ?? currentData.testimonials ?? [],
          stats: updates.stats ?? currentData.stats ?? [],
          featureCards: updates.featureCards ?? currentData.featureCards ?? [],
          platformFeatures: updates.platformFeatures ?? currentData.platformFeatures ?? [],
        };
      }

      // Build complete custom_branding object preserving existing data
      const customBranding = {
        ...currentData, // Preserve existing values
        ...mergedUpdates, // Apply new updates

        // Ensure critical fields are set
        selectedTheme: mergedUpdates.selectedTheme || currentData.selectedTheme || "default",
        themeMode: mergedUpdates.themeMode || currentData.themeMode || "dark",

        // Merge mode colors carefully
        lightModeColors: {
          ...currentData.lightModeColors,
          ...mergedUpdates.lightModeColors,
        },
        darkModeColors: {
          ...currentData.darkModeColors,
          ...mergedUpdates.darkModeColors,
        },

        // Preserve arrays if not explicitly updated
        heroAnimatedTexts: mergedUpdates.heroAnimatedTexts ?? currentData.heroAnimatedTexts ?? [],
        platformFeatures: mergedUpdates.platformFeatures ?? currentData.platformFeatures ?? [],
        stats: mergedUpdates.stats ?? currentData.stats ?? [],
        featureCards: mergedUpdates.featureCards ?? currentData.featureCards ?? [],
        testimonials: mergedUpdates.testimonials ?? currentData.testimonials ?? [],
        faqs: mergedUpdates.faqs ?? currentData.faqs ?? [],
        homepageLayout: mergedUpdates.homepageLayout ??
          currentData.homepageLayout ?? ["hero", "platform", "stats", "features", "testimonials", "faqs"],
      };

      const { error } = await supabase
        .from("panels")
        .update({
          custom_branding: customBranding,
          theme_type: customBranding.selectedTheme,
          primary_color: customBranding.primaryColor,
          secondary_color: customBranding.secondaryColor,
          logo_url: customBranding.logoUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", panelId);

      if (error) throw error;

      // Broadcast update for real-time preview
      try {
        localStorage.setItem("panelDesignUpdatedAt", String(Date.now()));
        window.dispatchEvent(new Event("panelDesignUpdated"));
        // Also dispatch storage event for cross-tab sync
        window.dispatchEvent(
          new StorageEvent("storage", {
            key: "panelDesignUpdatedAt",
            newValue: String(Date.now()),
          }),
        );
      } catch {
        // ignore
      }
    },
    onSuccess: () => {
      // Immediate invalidation for preview
      queryClient.invalidateQueries({ queryKey: ["panel-customization", panelId] });
      queryClient.invalidateQueries({ queryKey: ["panel-buyer-theme", panelId] });
      queryClient.invalidateQueries({ queryKey: ["tenant"] });

      // Force immediate refetch
      queryClient.refetchQueries({ queryKey: ["panel-customization", panelId], exact: true });

      toast({ title: "Design saved successfully!" });
    },
    onError: (error: any) => {
      toast({ title: "Error saving design", description: error.message, variant: "destructive" });
    },
  });

  // Toggle theme mode helper
  const toggleThemeMode = () => {
    if (!customization) return;
    const newMode = customization.themeMode === "light" ? "dark" : "light";
    saveMutation.mutate({ themeMode: newMode });
  };

  // Switch theme preset helper
  const switchTheme = (themeName: string) => {
    if (!customization) return;
    const defaults = getThemeDefaults(themeName);
    saveMutation.mutate({
      selectedTheme: themeName,
      ...defaults,
    });
  };

  return {
    customization,
    isLoading,
    error,
    save: saveMutation.mutate,
    isSaving: saveMutation.isPending,
    toggleThemeMode,
    switchTheme,
    refresh: () => queryClient.invalidateQueries({ queryKey: ["panel-customization", panelId] }),
  };
}
