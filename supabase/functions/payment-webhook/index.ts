import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const url = new URL(req.url);
    const gateway = url.searchParams.get('gateway') || 'stripe';
    
    console.log(`[payment-webhook] Received ${gateway} webhook`);

    const body = await req.text();
    let event: any;
    let transactionId: string | null = null;
    let status: 'completed' | 'failed' = 'failed';
    let amount: number = 0;
    let buyerId: string | null = null;
    let panelId: string | null = null;

    switch (gateway) {
      case 'stripe': {
        // Parse Stripe webhook
        event = JSON.parse(body);
        
        // In production, verify webhook signature
        // const sig = req.headers.get('stripe-signature');
        // const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
        
        if (event.type === 'checkout.session.completed') {
          const session = event.data.object;
          transactionId = session.metadata?.transactionId;
          status = 'completed';
          amount = (session.amount_total || 0) / 100;
          buyerId = session.metadata?.buyerId;
          panelId = session.metadata?.panelId;
          
          console.log(`[payment-webhook] Stripe checkout completed: ${transactionId}, amount: ${amount}`);
        } else if (event.type === 'checkout.session.expired') {
          const session = event.data.object;
          transactionId = session.metadata?.transactionId;
          status = 'failed';
        }
        break;
      }

      case 'paypal': {
        event = JSON.parse(body);
        
        if (event.event_type === 'CHECKOUT.ORDER.APPROVED' || event.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
          const resource = event.resource;
          transactionId = resource.purchase_units?.[0]?.custom_id;
          status = 'completed';
          amount = parseFloat(resource.purchase_units?.[0]?.amount?.value || '0');
          
          console.log(`[payment-webhook] PayPal payment completed: ${transactionId}, amount: ${amount}`);
        }
        break;
      }

      case 'coinbase': {
        event = JSON.parse(body);
        
        if (event.event?.type === 'charge:confirmed' || event.event?.type === 'charge:resolved') {
          const charge = event.event.data;
          transactionId = charge.metadata?.transactionId;
          status = 'completed';
          amount = parseFloat(charge.pricing?.local?.amount || '0');
          buyerId = charge.metadata?.buyerId;
          panelId = charge.metadata?.panelId;
          
          console.log(`[payment-webhook] Coinbase payment confirmed: ${transactionId}, amount: ${amount}`);
        } else if (event.event?.type === 'charge:failed' || event.event?.type === 'charge:expired') {
          const charge = event.event.data;
          transactionId = charge.metadata?.transactionId;
          status = 'failed';
        }
        break;
      }
    }

    if (!transactionId) {
      console.log('[payment-webhook] No transaction ID found, ignoring event');
      return new Response(
        JSON.stringify({ received: true, processed: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update transaction status
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', transactionId)
      .select()
      .single();

    if (txError) {
      console.error('[payment-webhook] Error updating transaction:', txError);
      return new Response(
        JSON.stringify({ error: 'Failed to update transaction' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If payment completed, credit buyer's balance
    if (status === 'completed' && transaction) {
      const userId = transaction.user_id;
      const depositAmount = transaction.amount || amount;

      // Get current buyer balance
      const { data: buyer } = await supabase
        .from('client_users')
        .select('balance')
        .eq('id', userId)
        .single();

      if (buyer) {
        const newBalance = (buyer.balance || 0) + depositAmount;
        
        // Update buyer balance
        await supabase
          .from('client_users')
          .update({ 
            balance: newBalance,
            total_spent: (buyer as any).total_spent || 0 + depositAmount
          })
          .eq('id', userId);

        console.log(`[payment-webhook] Credited $${depositAmount} to buyer ${userId}, new balance: ${newBalance}`);

        // Create buyer notification
        await supabase
          .from('buyer_notifications')
          .insert({
            buyer_id: userId,
            panel_id: transaction.panel_id || panelId,
            type: 'deposit',
            title: 'Deposit Successful',
            message: `$${depositAmount.toFixed(2)} has been added to your account`,
          });
      }
    }

    return new Response(
      JSON.stringify({ 
        received: true, 
        processed: true,
        transactionId,
        status
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[payment-webhook] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Webhook processing failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
