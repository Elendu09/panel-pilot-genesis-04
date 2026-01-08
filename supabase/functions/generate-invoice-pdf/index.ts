import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const translations: Record<string, Record<string, string>> = {
  en: {
    invoice: "INVOICE",
    billTo: "Bill To",
    invoiceNumber: "Invoice Number",
    date: "Date",
    dueDate: "Due Date",
    description: "Description",
    quantity: "Qty",
    unitPrice: "Unit Price",
    amount: "Amount",
    subtotal: "Subtotal",
    tax: "Tax",
    total: "Total",
    paymentMethod: "Payment Method",
    thankYou: "Thank you for your business!",
  },
  es: {
    invoice: "FACTURA",
    billTo: "Facturar A",
    invoiceNumber: "Número de Factura",
    date: "Fecha",
    dueDate: "Fecha de Vencimiento",
    description: "Descripción",
    quantity: "Cant",
    unitPrice: "Precio Unitario",
    amount: "Importe",
    subtotal: "Subtotal",
    tax: "Impuesto",
    total: "Total",
    paymentMethod: "Método de Pago",
    thankYou: "¡Gracias por su preferencia!",
  },
  fr: {
    invoice: "FACTURE",
    billTo: "Facturer À",
    invoiceNumber: "Numéro de Facture",
    date: "Date",
    dueDate: "Date d'Échéance",
    description: "Description",
    quantity: "Qté",
    unitPrice: "Prix Unitaire",
    amount: "Montant",
    subtotal: "Sous-total",
    tax: "Taxe",
    total: "Total",
    paymentMethod: "Mode de Paiement",
    thankYou: "Merci pour votre confiance!",
  },
};

function getTranslation(lang: string, key: string): string {
  return translations[lang]?.[key] || translations.en[key] || key;
}

function generateInvoiceHTML(invoice: any, settings: any, lang: string = "en"): string {
  const t = (key: string) => getTranslation(lang, key);
  const company = invoice.company_snapshot || {};
  const customer = invoice.customer_snapshot || {};
  const lineItems = Array.isArray(invoice.line_items) ? invoice.line_items : [];

  const logoHtml = company.logo_url 
    ? `<img src="${company.logo_url}" alt="Logo" style="max-height: 60px; max-width: 200px;" />`
    : `<h1 style="font-size: 24px; font-weight: bold; color: #3b82f6;">${company.name || 'Company'}</h1>`;

  const itemsHtml = lineItems.map((item: any) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.description || 'Service'}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity || 1}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${(item.unit_price || 0).toFixed(2)}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${(item.amount || 0).toFixed(2)}</td>
    </tr>
  `).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1f2937; line-height: 1.5; }
    .container { max-width: 800px; margin: 0 auto; padding: 40px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; }
    .invoice-title { font-size: 32px; font-weight: bold; color: #3b82f6; letter-spacing: 2px; }
    .company-details { text-align: right; font-size: 12px; color: #6b7280; }
    .info-grid { display: flex; justify-content: space-between; margin-bottom: 30px; }
    .bill-to, .invoice-info { width: 48%; }
    .section-title { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #9ca3af; margin-bottom: 8px; }
    .customer-name { font-size: 16px; font-weight: 600; margin-bottom: 4px; }
    .invoice-info { text-align: right; }
    .info-row { display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 13px; }
    .info-label { color: #6b7280; }
    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    .items-table th { background: #f9fafb; padding: 12px; text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280; border-bottom: 2px solid #e5e7eb; }
    .items-table th:nth-child(2), .items-table th:nth-child(3), .items-table th:nth-child(4) { text-align: right; }
    .totals { margin-left: auto; width: 280px; }
    .total-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
    .total-row.grand-total { border-top: 2px solid #1f2937; padding-top: 12px; margin-top: 8px; font-size: 18px; font-weight: bold; }
    .footer { margin-top: 60px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 12px; color: #9ca3af; }
    .payment-badge { display: inline-block; background: #ecfdf5; color: #059669; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; margin-top: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div>
        ${logoHtml}
        <div class="invoice-title" style="margin-top: 12px;">${t('invoice')}</div>
      </div>
      <div class="company-details">
        <div style="font-weight: 600; color: #1f2937; margin-bottom: 4px;">${company.name || ''}</div>
        <div>${company.address || ''}</div>
        <div>${company.email || ''}</div>
        <div>${company.phone || ''}</div>
        ${company.vat_id ? `<div>VAT: ${company.vat_id}</div>` : ''}
      </div>
    </div>

    <div class="info-grid">
      <div class="bill-to">
        <div class="section-title">${t('billTo')}</div>
        <div class="customer-name">${customer.name || customer.email || 'Customer'}</div>
        <div style="font-size: 13px; color: #6b7280;">
          ${customer.company_name ? `<div>${customer.company_name}</div>` : ''}
          ${customer.address ? `<div>${customer.address}</div>` : ''}
          <div>${customer.email || ''}</div>
          ${customer.vat_id ? `<div>VAT: ${customer.vat_id}</div>` : ''}
        </div>
      </div>
      <div class="invoice-info">
        <div class="info-row">
          <span class="info-label">${t('invoiceNumber')}:</span>
          <span style="font-weight: 600;">${invoice.invoice_number}</span>
        </div>
        <div class="info-row">
          <span class="info-label">${t('date')}:</span>
          <span>${new Date(invoice.issued_at || invoice.created_at).toLocaleDateString()}</span>
        </div>
        ${invoice.payment_method ? `
        <div class="payment-badge">${invoice.payment_method}</div>
        ` : ''}
      </div>
    </div>

    <table class="items-table">
      <thead>
        <tr>
          <th>${t('description')}</th>
          <th style="text-align: center;">${t('quantity')}</th>
          <th style="text-align: right;">${t('unitPrice')}</th>
          <th style="text-align: right;">${t('amount')}</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml || `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">Account Deposit</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">1</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${invoice.subtotal.toFixed(2)}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">$${invoice.subtotal.toFixed(2)}</td>
        </tr>
        `}
      </tbody>
    </table>

    <div class="totals">
      <div class="total-row">
        <span>${t('subtotal')}</span>
        <span>$${invoice.subtotal.toFixed(2)}</span>
      </div>
      ${invoice.tax_amount && invoice.tax_amount > 0 ? `
      <div class="total-row">
        <span>${t('tax')} (${invoice.tax_rate || 0}%)</span>
        <span>$${invoice.tax_amount.toFixed(2)}</span>
      </div>
      ` : ''}
      <div class="total-row grand-total">
        <span>${t('total')}</span>
        <span>$${invoice.total_amount.toFixed(2)} ${invoice.currency || 'USD'}</span>
      </div>
    </div>

    <div class="footer">
      <p>${settings?.invoice_footer_text || t('thankYou')}</p>
    </div>
  </div>
</body>
</html>
  `;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { invoiceId, paymentId, transactionId, createNew } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let invoice: any;

    if (invoiceId) {
      // Fetch existing invoice
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .eq("id", invoiceId)
        .single();

      if (error) throw new Error(`Invoice not found: ${error.message}`);
      invoice = data;
    } else if (createNew && (paymentId || transactionId)) {
      // Create new invoice from payment/transaction
      const { data: transaction, error: txError } = await supabase
        .from("transactions")
        .select("*, user:profiles(*)")
        .eq("id", paymentId || transactionId)
        .single();

      if (txError) throw new Error(`Transaction not found: ${txError.message}`);

      // Get panel settings for company snapshot
      let companySnapshot = { name: "SMM Panel" };
      let settings = null;

      if (transaction.panel_id) {
        const { data: settingsData } = await supabase
          .from("invoice_settings")
          .select("*")
          .eq("panel_id", transaction.panel_id)
          .maybeSingle();

        if (settingsData) {
          settings = settingsData;
          companySnapshot = {
            name: settingsData.company_name,
            address: settingsData.company_address,
            email: settingsData.company_email,
            phone: settingsData.company_phone,
            logo_url: settingsData.company_logo_url,
            vat_id: settingsData.company_vat_id,
          };
        }
      }

      // Generate invoice number
      const { data: invoiceNumber } = await supabase.rpc("generate_invoice_number", {
        p_panel_id: transaction.panel_id,
      });

      // Create customer snapshot
      const customerSnapshot = {
        name: transaction.user?.full_name,
        email: transaction.user?.email,
      };

      // Create invoice
      const { data: newInvoice, error: insertError } = await supabase
        .from("invoices")
        .insert({
          user_id: transaction.user_id,
          panel_id: transaction.panel_id,
          invoice_number: invoiceNumber || `INV-${Date.now()}`,
          invoice_type: "panel_funding",
          payment_id: transaction.id,
          subtotal: transaction.amount,
          tax_rate: settings?.tax_rate || 0,
          tax_amount: settings?.tax_enabled ? (transaction.amount * (settings.tax_rate / 100)) : 0,
          total_amount: transaction.amount + (settings?.tax_enabled ? (transaction.amount * (settings.tax_rate / 100)) : 0),
          currency: "USD",
          company_snapshot: companySnapshot,
          customer_snapshot: customerSnapshot,
          line_items: [{ description: "Account Deposit", quantity: 1, unit_price: transaction.amount, amount: transaction.amount }],
          payment_method: transaction.payment_method,
          status: transaction.status === "completed" ? "paid" : "issued",
        })
        .select()
        .single();

      if (insertError) throw new Error(`Failed to create invoice: ${insertError.message}`);
      invoice = newInvoice;
    } else {
      throw new Error("Either invoiceId or (createNew + paymentId/transactionId) is required");
    }

    // Get settings for language
    let lang = "en";
    if (invoice.panel_id) {
      const { data: settings } = await supabase
        .from("invoice_settings")
        .select("invoice_language")
        .eq("panel_id", invoice.panel_id)
        .maybeSingle();
      
      if (settings?.invoice_language) {
        lang = settings.invoice_language;
      }
    }

    // Generate HTML
    const html = generateInvoiceHTML(invoice, null, lang);

    // For now, return the HTML content
    // In production, you'd convert this to PDF using a service like Puppeteer or wkhtmltopdf
    // and store it in Supabase Storage

    console.log(`Generated invoice HTML for ${invoice.invoice_number}`);

    return new Response(
      JSON.stringify({
        success: true,
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoice_number,
        html: html,
        // In production: pdfUrl: uploadedPdfUrl
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error generating invoice:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
