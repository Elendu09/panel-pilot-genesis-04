import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type PanelPaymentMethod = {
  id: string;
  enabled?: boolean;
  apiKey?: string;
  secretKey?: string;
};

export type AvailableGateway = {
  id: string;
  displayName: string;
  category?: string | null;
  feePercentage?: number | null;
  fixedFee?: number | null;
};

const DEFAULT_DISPLAY_NAME: Record<string, string> = {
  stripe: "Stripe",
  paypal: "PayPal",
  paystack: "Paystack",
  flutterwave: "Flutterwave",
  korapay: "Kora Pay",
  razorpay: "Razorpay",
  coinbase: "Coinbase Commerce",
  crypto: "Crypto",
};

const isConfiguredEnough = (m: PanelPaymentMethod) => {
  // Manual methods can be enabled without API keys
  if (m.id?.startsWith("manual_") || m.id === "manual_transfer") return true;
  // Most automatic gateways require at least one credential; secretKey is typical.
  return Boolean((m.apiKey && m.apiKey.trim()) || (m.secretKey && m.secretKey.trim()));
};

export const useAvailablePaymentGateways = (opts: {
  panelId?: string;
  panelSettings?: Record<string, any> | null;
}) => {
  const { panelId, panelSettings } = opts;
  const [loading, setLoading] = useState(true);
  const [platformEnabledProviders, setPlatformEnabledProviders] = useState<
    Array<{
      provider_name: string;
      display_name: string;
      category: string | null;
      is_enabled: boolean | null;
      fee_percentage: number | null;
      fixed_fee: number | null;
    }>
  >([]);
  const [resolvedPanelSettings, setResolvedPanelSettings] = useState<Record<string, any> | null>(
    panelSettings ?? null
  );

  const refresh = async () => {
    if (!panelId && !panelSettings) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [{ data: providers }, panelRes] = await Promise.all([
        supabase
          .from("platform_payment_providers")
          .select("provider_name, display_name, category, is_enabled, fee_percentage, fixed_fee")
          .eq("is_enabled", true),
        panelSettings
          ? Promise.resolve({ data: { settings: panelSettings } } as any)
          : (supabase as any).from("panels_public").select("settings").eq("id", panelId!).maybeSingle(),
      ]);

      setPlatformEnabledProviders((providers || []).filter((p) => p.is_enabled));
      setResolvedPanelSettings((panelRes as any)?.data?.settings ?? null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panelId]);

  const gateways = useMemo<AvailableGateway[]>(() => {
    const enabledProviderNames = new Set(platformEnabledProviders.map((p) => p.provider_name));
    const payments = (resolvedPanelSettings as any)?.payments || {};
    const enabledMethods: Array<string | PanelPaymentMethod> = payments.enabledMethods || [];
    const manualPayments: Array<{ id: string; title?: string; enabled?: boolean }> = payments.manualPayments || [];

    const normalizedEnabledMethods: PanelPaymentMethod[] = enabledMethods
      .map((m) => (typeof m === "string" ? ({ id: m, enabled: true } as PanelPaymentMethod) : (m as PanelPaymentMethod)))
      .filter((m) => m && m.id)
      .filter((m) => m.enabled !== false)
      .filter(isConfiguredEnough);

    // Manual methods are panel-defined; we keep them even if not listed in platform providers.
    const normalizedManual: AvailableGateway[] = manualPayments
      .filter((m) => m.enabled !== false)
      .map((m) => ({
        id: m.id,
        displayName: m.title || "Manual Payment",
        category: "manual",
        feePercentage: null,
        fixedFee: null,
      }));

    const normalizedAutomatic: AvailableGateway[] = normalizedEnabledMethods
      .filter((m) => {
        // If platform providers table has entries, require a platform-enabled match.
        if (platformEnabledProviders.length === 0) return true;
        return enabledProviderNames.has(m.id);
      })
      .map((m) => {
        const provider = platformEnabledProviders.find((p) => p.provider_name === m.id);
        return {
          id: m.id,
          displayName: provider?.display_name || DEFAULT_DISPLAY_NAME[m.id] || m.id,
          category: provider?.category ?? null,
          feePercentage: provider?.fee_percentage ?? null,
          fixedFee: provider?.fixed_fee ?? null,
        };
      });

    const merged = [...normalizedAutomatic, ...normalizedManual];
    // Stable sort by name
    merged.sort((a, b) => a.displayName.localeCompare(b.displayName));
    return merged;
  }, [platformEnabledProviders, resolvedPanelSettings]);

  return { gateways, loading, refresh };
};
