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
        .select('custom_branding, theme_type, primary_color, secondary_color, logo_url, name')
        .eq('id', panelId)
        .single();

      if (error) throw error;
      
      return {
        ...(data?.custom_branding as Record<string, any> || {}),
        themeType: data?.theme_type,
        primaryColor: data?.primary_color,
        secondaryColor: data?.secondary_color,
        logoUrl: data?.logo_url,
        companyName: data?.name,
      };
    },
    enabled: !!panelId,
    staleTime: 60000, // Cache for 1 minute
  });

  const saveMutation = useMutation({
    mutationFn: async (updates: Record<string, any>) => {
      if (!panelId) throw new Error('No panel ID');
      
      const { error } = await supabase
        .from('panels')
        .update({
          custom_branding: updates,
          theme_type: updates.themeType || 'dark_gradient',
          primary_color: updates.primaryColor,
          secondary_color: updates.secondaryColor,
          logo_url: updates.logoUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', panelId);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['panel-customization', panelId] });
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
