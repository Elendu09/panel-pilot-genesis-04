import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useMemo, useCallback } from "react";

// All five theme presets with complete defaults
const themeDefaults: Record<string, any> = {
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
    primaryColor: "#6366F1",
    secondaryColor: "#8B5CF6",
    accentColor: "#EC4899",
  },
  alipanel: {
    fontFamily: "Inter",
    headingFont: "Inter",
    borderRadius: "16",
    cardRadius: 20,
    buttonRadius: 14,
    buttonStyle: "gradient",
    shadowIntensity: "high",
    enableAnimations: true,
    animationStyle: "slide",
    heroAnimatedTexts: ["Social Media Growth", "Fast Delivery", "Quality Services"],
    backgroundPattern: "grid",
    patternOpacity: 0.05,
    primaryColor: "#3B82F6",
    secondaryColor: "#1D4ED8",
    accentColor: "#60A5FA",
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
    animationStyle: "scale",
    heroAnimatedTexts: ["Boost Your Presence", "Real Engagement", "24/7 Support"],
    backgroundPattern: "dots",
    patternOpacity: 0.05,
    primaryColor: "#8B5CF6",
    secondaryColor: "#7C3AED",
    accentColor: "#A78BFA",
  },
  modern: {
    fontFamily: "Inter",
    headingFont: "Inter",
    borderRadius: "24",
    cardRadius: 24,
    buttonRadius: 24,
    buttonStyle: "solid",
    shadowIntensity: "low",
    enableAnimations: true,
    animationStyle: "fade",
    heroAnimatedTexts: ["Modern Solutions", "Fast Results", "Premium Quality"],
    backgroundPattern: "lines",
    patternOpacity: 0.02,
    primaryColor: "#10B981",
    secondaryColor: "#059669",
    accentColor: "#34D399",
  },
  minimal: {
    fontFamily: "System UI",
    headingFont: "System UI",
    borderRadius: "4",
    cardRadius: 8,
    buttonRadius: 6,
    buttonStyle: "outline",
    shadowIntensity: "none",
    enableAnimations: false,
    animationStyle: "none",
    heroAnimatedTexts: ["Simple & Clean", "Effective Tools", "Minimal Design"],
    backgroundPattern: "none",
    patternOpacity: 0,
    primaryColor: "#1F2937",
    secondaryColor: "#374151",
    accentColor: "#4B5563",
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
    refetch,
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
    staleTime: 0, // Always fetch fresh data for preview
    refetchInterval: 1000, // Poll every second for live preview
    refetchOnWindowFocus: true, // Refetch when user returns to tab
  });

  // Process and memoize customization data with preview support
  const customization = useMemo(() => {
    if (!rawData) return null;

    const branding = (rawData?.custom_branding as Record<string, any>) || {};
    const selectedTheme = branding.selectedTheme || rawData?.theme_type || "default";

    // Get theme defaults - merge with base defaults first
    const baseDefaults = themeDefaults.default;
    const themeSpecificDefaults = themeDefaults[selectedTheme] || baseDefaults;
    const themeDefaultsData = { ...baseDefaults, ...themeSpecificDefaults };

    // Determine theme mode (light/dark) - separate from theme selection
    const themeMode = branding.themeMode || "dark";
    const isLight = themeMode === "light";

    // Get mode-specific colors
    const modeColors = isLight
      ? { ...lightModeDefaults, ...branding.lightModeColors }
      : { ...darkModeDefaults, ...branding.darkModeColors };

    // Merge all data: defaults -> saved branding -> mode colors -> direct DB values
    const mergedData = {
      // Start with theme defaults
      ...themeDefaultsData,

      // Override with saved branding
      ...branding,

      // Critical fields from database (highest priority)
      selectedTheme,
      themeType: selectedTheme,
      themeMode,
      isLightMode: isLight,
      isDarkMode: !isLight,

      // Colors from mode-specific settings
      backgroundColor: modeColors.backgroundColor,
      surfaceColor: modeColors.surfaceColor,
      cardColor: modeColors.cardColor,
      textColor: modeColors.textColor,
      mutedColor: modeColors.mutedColor,
      borderColor: modeColors.borderColor,

      // Preserve mode color objects for editing
      lightModeColors: branding.lightModeColors || lightModeDefaults,
      darkModeColors: branding.darkModeColors || darkModeDefaults,

      // Database columns with fallbacks
      primaryColor: branding.primaryColor || rawData?.primary_color || themeDefaultsData.primaryColor,
      secondaryColor: branding.secondaryColor || rawData?.secondary_color || themeDefaultsData.secondaryColor,
      logoUrl: branding.logoUrl || rawData?.logo_url,
      companyName: branding.companyName || rawData?.name,
      showBlogInMenu: branding.showBlogInMenu ?? rawData?.blog_enabled ?? false,

      // Ensure hero animated texts exist (preserve user changes or use theme defaults)
      heroAnimatedTexts:
        branding.heroAnimatedTexts?.length > 0 ? branding.heroAnimatedTexts : themeDefaultsData.heroAnimatedTexts,

      // Ensure arrays exist
      platformFeatures: branding.platformFeatures || [],
      stats: branding.stats || [],
      featureCards: branding.featureCards || [],
      testimonials: branding.testimonials || [],
      faqs: branding.faqs || [],

      // Layout with default
      homepageLayout: branding.homepageLayout || ["hero", "platform", "stats", "features", "testimonials", "faqs"],

      // Footer text
      footerText:
        branding.footerText ||
        `© ${new Date().getFullYear()} ${branding.companyName || rawData?.name || "Your Panel"}. All rights reserved.`,

      // Additional UI flags
      enableAnimations: branding.enableAnimations ?? true,
      enableParallax: branding.enableParallax ?? false,
      backgroundPattern: branding.backgroundPattern || themeDefaultsData.backgroundPattern,
    };

    return mergedData;
  }, [rawData]);

  // Helper to get theme defaults
  const getThemeDefaults = useCallback((themeName: string) => {
    return themeDefaults[themeName] || themeDefaults.default;
  }, []);

  const saveMutation = useMutation({
    mutationFn: async (updates: Record<string, any>) => {
      if (!panelId) throw new Error("No panel ID");

      // Get current branding data
      const currentData = (rawData?.custom_branding as Record<string, any>) || {};
      const currentTheme = currentData.selectedTheme || rawData?.theme_type || "default";
      const newTheme = updates.selectedTheme || currentTheme;

      // Check if theme is changing
      const isThemeChanging = newTheme !== currentTheme;

      // Start with current data
      let mergedUpdates = { ...currentData, ...updates };

      // If theme changed, apply theme defaults but preserve user content
      if (isThemeChanging) {
        const newDefaults = getThemeDefaults(newTheme);

        // Apply new theme defaults for styling, keep content
        mergedUpdates = {
          ...newDefaults, // Apply new theme styling
          ...updates, // Apply explicit updates
          // Preserve user content (don't overwrite with defaults)
          heroTitle: updates.heroTitle ?? currentData.heroTitle ?? "",
          heroSubtitle: updates.heroSubtitle ?? currentData.heroSubtitle ?? "",
          heroAnimatedTexts:
            updates.heroAnimatedTexts ?? currentData.heroAnimatedTexts ?? newDefaults.heroAnimatedTexts,
          faqs: updates.faqs ?? currentData.faqs ?? [],
          testimonials: updates.testimonials ?? currentData.testimonials ?? [],
          stats: updates.stats ?? currentData.stats ?? [],
          featureCards: updates.featureCards ?? currentData.featureCards ?? [],
          platformFeatures: updates.platformFeatures ?? currentData.platformFeatures ?? [],
          // Keep the new theme colors unless explicitly overridden
          primaryColor: updates.primaryColor ?? newDefaults.primaryColor,
          secondaryColor: updates.secondaryColor ?? newDefaults.secondaryColor,
        };
      }

      // Handle light/dark mode color updates
      const isLightMode = mergedUpdates.themeMode === "light";

      // Build final custom_branding object
      const customBranding: Record<string, any> = {
        ...currentData,
        ...mergedUpdates,

        // Ensure theme identification
        selectedTheme: newTheme,
        themeMode: mergedUpdates.themeMode || currentData.themeMode || "dark",

        // Update mode-specific colors if provided
        lightModeColors: {
          ...currentData.lightModeColors,
          ...mergedUpdates.lightModeColors,
        },
        darkModeColors: {
          ...currentData.darkModeColors,
          ...mergedUpdates.darkModeColors,
        },

        // Ensure arrays
        heroAnimatedTexts: mergedUpdates.heroAnimatedTexts ?? currentData.heroAnimatedTexts ?? [],
        platformFeatures: mergedUpdates.platformFeatures ?? currentData.platformFeatures ?? [],
        stats: mergedUpdates.stats ?? currentData.stats ?? [],
        featureCards: mergedUpdates.featureCards ?? currentData.featureCards ?? [],
        testimonials: mergedUpdates.testimonials ?? currentData.testimonials ?? [],
        faqs: mergedUpdates.faqs ?? currentData.faqs ?? [],
        homepageLayout: mergedUpdates.homepageLayout ??
          currentData.homepageLayout ?? ["hero", "platform", "stats", "features", "testimonials", "faqs"],
      };

      // Update database
      const { error } = await supabase
        .from("panels")
        .update({
          custom_branding: customBranding,
          theme_type: newTheme,
          primary_color: customBranding.primaryColor,
          secondary_color: customBranding.secondaryColor,
          logo_url: customBranding.logoUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", panelId);

      if (error) throw error;

      // Force immediate preview update
      try {
        const timestamp = Date.now();
        localStorage.setItem("panelDesignUpdatedAt", String(timestamp));
        localStorage.setItem("panelDesignData", JSON.stringify(customBranding));

        // Dispatch multiple events for cross-component communication
        window.dispatchEvent(new Event("panelDesignUpdated"));
        window.dispatchEvent(
          new StorageEvent("storage", {
            key: "panelDesignUpdatedAt",
            newValue: String(timestamp),
          }),
        );

        // Custom event with data for immediate preview
        window.dispatchEvent(
          new CustomEvent("panelDesignChanged", {
            detail: customBranding,
          }),
        );
      } catch {
        // ignore
      }
    },
    onSuccess: async () => {
      // Immediate invalidation and refetch
      await queryClient.invalidateQueries({ queryKey: ["panel-customization", panelId] });
      await queryClient.refetchQueries({ queryKey: ["panel-customization", panelId], exact: true });

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ["panel-buyer-theme", panelId] });
      queryClient.invalidateQueries({ queryKey: ["tenant"] });

      toast({ title: "Design saved successfully!" });
    },
    onError: (error: any) => {
      toast({ title: "Error saving design", description: error.message, variant: "destructive" });
    },
  });

  // Toggle between light and dark mode
  const toggleThemeMode = useCallback(() => {
    if (!customization) return;
    const newMode = customization.themeMode === "light" ? "dark" : "light";

    // Get the appropriate default colors for the new mode
    const newModeColors = newMode === "light" ? lightModeDefaults : darkModeDefaults;

    saveMutation.mutate({
      themeMode: newMode,
      // Apply mode colors immediately
      ...(newMode === "light"
        ? {
            lightModeColors: { ...customization.lightModeColors, ...newModeColors },
          }
        : {
            darkModeColors: { ...customization.darkModeColors, ...newModeColors },
          }),
    });
  }, [customization, saveMutation]);

  // Switch to a different theme preset
  const switchTheme = useCallback(
    (themeName: string) => {
      if (!customization) return;
      const defaults = getThemeDefaults(themeName);

      saveMutation.mutate({
        selectedTheme: themeName,
        ...defaults,
        // Preserve current light/dark mode
        themeMode: customization.themeMode,
      });
    },
    [customization, getThemeDefaults, saveMutation],
  );

  // Force refresh function
  const refresh = useCallback(() => {
    refetch();
    queryClient.invalidateQueries({ queryKey: ["panel-customization", panelId] });
  }, [refetch, queryClient, panelId]);

  return {
    customization,
    isLoading,
    error,
    save: saveMutation.mutate,
    isSaving: saveMutation.isPending,
    toggleThemeMode,
    switchTheme,
    refresh,
  };
}
