import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type AdminGateway = {
  id: string;
  displayName: string;
  category?: string | null;
  feePercentage?: number | null;
  fixedFee?: number | null;
  config?: Record<string, any>;
};

/**
 * Hook for fetching admin-controlled payment gateways from platform_payment_providers.
 * Used for panel owner billing/deposits (NOT buyer deposits).
 * 
 * Panel owner billing uses platform-level gateways configured by admin.
 * Buyer deposits use panel-configured gateways from panels.settings.payments.
 */
export const useAdminPaymentGateways = () => {
  const [loading, setLoading] = useState(true);
  const [gateways, setGateways] = useState<AdminGateway[]>([]);

  const refresh = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("platform_payment_providers")
        .select("*")
        .eq("is_enabled", true);

      if (error) throw error;

      const mapped: AdminGateway[] = (data || []).map((p) => ({
        id: p.provider_name,
        displayName: p.display_name,
        category: p.category,
        feePercentage: p.fee_percentage,
        fixedFee: p.fixed_fee,
        config: (p.config as Record<string, any>) || {}
      }));

      // Sort alphabetically
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
