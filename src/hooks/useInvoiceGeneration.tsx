import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface GenerateInvoiceParams {
  transactionId: string;
  panelId?: string;
  buyerId?: string;
  invoiceType: "panel_funding" | "buyer_funding" | "order";
}

export const useInvoiceGeneration = () => {
  const generateInvoice = async ({
    transactionId,
    panelId,
    buyerId,
    invoiceType,
  }: GenerateInvoiceParams) => {
    try {
      // Check if auto-generate is enabled
      if (panelId) {
        const { data: settings } = await supabase
          .from("invoice_settings")
          .select("auto_generate_on_payment")
          .eq("panel_id", panelId)
          .maybeSingle();

        if (settings && !settings.auto_generate_on_payment) {
          console.log("Auto-generate invoices is disabled for this panel");
          return null;
        }
      }

      // Fetch transaction details
      const { data: transaction, error: txError } = await supabase
        .from("transactions")
        .select("*")
        .eq("id", transactionId)
        .single();

      if (txError || !transaction) {
        console.error("Transaction not found:", txError);
        return null;
      }

      // Get invoice settings for company snapshot
      let companySnapshot: Record<string, any> = { name: "SMM Panel" };
      let taxRate = 0;
      let taxEnabled = false;

      if (panelId) {
        const { data: settings } = await supabase
          .from("invoice_settings")
          .select("*")
          .eq("panel_id", panelId)
          .maybeSingle();

        if (settings) {
          companySnapshot = {
            name: settings.company_name || "SMM Panel",
            address: settings.company_address,
            email: settings.company_email,
            phone: settings.company_phone,
            logo_url: settings.company_logo_url,
            vat_id: settings.company_vat_id,
          };
          taxRate = settings.tax_rate || 0;
          taxEnabled = settings.tax_enabled || false;
        }
      }

      // Get customer details
      let customerSnapshot: Record<string, any> = {};

      if (buyerId) {
        const { data: buyer } = await supabase
          .from("client_users")
          .select("email, full_name, invoice_company_name, invoice_address, invoice_vat_id")
          .eq("id", buyerId)
          .single();

        if (buyer) {
          customerSnapshot = {
            name: buyer.full_name,
            email: buyer.email,
            company_name: buyer.invoice_company_name,
            address: buyer.invoice_address,
            vat_id: buyer.invoice_vat_id,
          };
        }
      } else if (transaction.user_id) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("email, full_name")
          .eq("id", transaction.user_id)
          .single();

        if (profile) {
          customerSnapshot = {
            name: profile.full_name,
            email: profile.email,
          };
        }
      }

      // Generate invoice number using database function
      const { data: invoiceNumber } = await supabase.rpc("generate_invoice_number", {
        p_panel_id: panelId || "00000000-0000-0000-0000-000000000000",
      });

      // Calculate tax
      const subtotal = transaction.amount;
      const taxAmount = taxEnabled ? subtotal * (taxRate / 100) : 0;
      const totalAmount = subtotal + taxAmount;

      // Create invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from("invoices")
        .insert({
          user_id: invoiceType === "panel_funding" ? transaction.user_id : null,
          buyer_id: buyerId || null,
          panel_id: panelId,
          invoice_number: invoiceNumber || `INV-${Date.now()}`,
          invoice_type: invoiceType,
          payment_id: transactionId,
          subtotal,
          tax_rate: taxRate,
          tax_amount: taxAmount,
          total_amount: totalAmount,
          currency: "USD",
          company_snapshot: companySnapshot,
          customer_snapshot: customerSnapshot,
          line_items: [
            {
              description: invoiceType === "order" ? "Service Order" : "Account Deposit",
              quantity: 1,
              unit_price: subtotal,
              amount: subtotal,
            },
          ],
          payment_method: transaction.payment_method,
          status: transaction.status === "completed" ? "paid" : "issued",
        })
        .select()
        .single();

      if (invoiceError) {
        console.error("Error creating invoice:", invoiceError);
        return null;
      }

      console.log("Invoice generated:", invoice.invoice_number);
      return invoice;
    } catch (error) {
      console.error("Error in generateInvoice:", error);
      return null;
    }
  };

  return { generateInvoice };
};
