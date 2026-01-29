import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type AdminGateway = {
  id: string;
  displayName: string;
  category?: string | null;
  feePercentage?: number | null;
  fixedFee?: number | null;
};

/**
 * Hook for fetching admin-controlled payment gateways from platform_payment_providers.
 * Use this for panel owner billing (subscriptions, deposits) - NOT for buyer/tenant payments.
 * 
 * Panel owners should pay using gateways configured by the platform admin,
 * while buyers should use gateways configured by the panel owner in their settings.
 */
export const useAdminPaymentGateways = () => {
  const [loading, setLoading] = useState(true);
  const [gateways, setGateways] = useState<AdminGateway[]>([]);

  const refresh = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("platform_payment_providers")
        .select("provider_name, display_name, category, fee_percentage, fixed_fee, is_enabled")
        .eq("is_enabled", true);

      if (error) throw error;

      const mapped: AdminGateway[] = (data || []).map((p) => ({
        id: p.provider_name,
        displayName: p.display_name,
        category: p.category,
        feePercentage: p.fee_percentage,
        fixedFee: p.fixed_fee,
      }));

      // Sort alphabetically by display name
      mapped.sort((a, b) => a.displayName.localeCompare(b.displayName));
      setGateways(mapped);
    } catch (error) {
      console.error("Error fetching admin payment gateways:", error);
      setGateways([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return { gateways, loading, refresh };
};
