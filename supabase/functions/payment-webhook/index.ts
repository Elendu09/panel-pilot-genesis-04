import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature, x-paystack-signature, x-flutterwave-signature',
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
        event = JSON.parse(body);
        // In production, verify webhook signature with Stripe
        // const sig = req.headers.get('stripe-signature');
        
        if (event.type === 'checkout.session.completed') {
          const session = event.data.object;
          transactionId = session.metadata?.transactionId;
          status = 'completed';
          amount = (session.amount_total || 0) / 100;
          buyerId = session.metadata?.buyerId;
          panelId = session.metadata?.panelId;
          console.log(`[payment-webhook] Stripe checkout completed: ${transactionId}, amount: ${amount}`);
        } else if (event.type === 'checkout.session.expired' || event.type === 'payment_intent.payment_failed') {
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
        } else if (event.event_type === 'PAYMENT.CAPTURE.DENIED' || event.event_type === 'CHECKOUT.ORDER.CANCELLED') {
          transactionId = event.resource?.purchase_units?.[0]?.custom_id;
          status = 'failed';
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

      case 'flutterwave': {
        event = JSON.parse(body);
        // Verify webhook signature in production
        // const signature = req.headers.get('verif-hash');
        
        if (event.event === 'charge.completed' && event.data?.status === 'successful') {
          transactionId = event.data?.tx_ref;
          status = 'completed';
          amount = parseFloat(event.data?.amount || '0');
          panelId = event.data?.meta?.panelId;
          buyerId = event.data?.meta?.buyerId;
          console.log(`[payment-webhook] Flutterwave payment completed: ${transactionId}, amount: ${amount}`);
        } else if (event.event === 'charge.failed' || event.data?.status === 'failed') {
          transactionId = event.data?.tx_ref;
          status = 'failed';
        }
        break;
      }

      case 'paystack': {
        event = JSON.parse(body);
        // Verify webhook signature in production
        // const signature = req.headers.get('x-paystack-signature');
        
        if (event.event === 'charge.success') {
          transactionId = event.data?.reference;
          status = 'completed';
          amount = (event.data?.amount || 0) / 100; // Paystack uses kobo
          panelId = event.data?.metadata?.panelId;
          buyerId = event.data?.metadata?.buyerId;
          console.log(`[payment-webhook] Paystack payment completed: ${transactionId}, amount: ${amount}`);
        } else if (event.event === 'charge.failed') {
          transactionId = event.data?.reference;
          status = 'failed';
        }
        break;
      }

      case 'korapay': {
        event = JSON.parse(body);
        if (event.event === 'charge.success' || event.data?.status === 'success') {
          transactionId = event.data?.reference;
          status = 'completed';
          amount = parseFloat(event.data?.amount || '0');
          panelId = event.data?.metadata?.panelId;
          buyerId = event.data?.metadata?.buyerId;
          console.log(`[payment-webhook] Kora Pay payment completed: ${transactionId}, amount: ${amount}`);
        } else if (event.event === 'charge.failed' || event.data?.status === 'failed') {
          transactionId = event.data?.reference;
          status = 'failed';
        }
        break;
      }

      case 'razorpay': {
        event = JSON.parse(body);
        // Verify webhook signature in production
        
        if (event.event === 'payment.captured' || event.event === 'order.paid') {
          const payment = event.payload?.payment?.entity || event.payload?.order?.entity;
          transactionId = payment?.receipt || payment?.notes?.transactionId;
          status = 'completed';
          amount = (payment?.amount || 0) / 100; // Razorpay uses paise
          panelId = payment?.notes?.panelId;
          buyerId = payment?.notes?.buyerId;
          console.log(`[payment-webhook] Razorpay payment completed: ${transactionId}, amount: ${amount}`);
        } else if (event.event === 'payment.failed') {
          const payment = event.payload?.payment?.entity;
          transactionId = payment?.receipt || payment?.notes?.transactionId;
          status = 'failed';
        }
        break;
      }

      case 'monnify': {
        event = JSON.parse(body);
        if (event.eventType === 'SUCCESSFUL_TRANSACTION' || event.eventData?.paymentStatus === 'PAID') {
          transactionId = event.eventData?.paymentReference;
          status = 'completed';
          amount = parseFloat(event.eventData?.amountPaid || event.eventData?.amount || '0');
          console.log(`[payment-webhook] Monnify payment completed: ${transactionId}, amount: ${amount}`);
        } else if (event.eventType === 'FAILED_TRANSACTION' || event.eventData?.paymentStatus === 'FAILED') {
          transactionId = event.eventData?.paymentReference;
          status = 'failed';
        }
        break;
      }

      case 'mercadopago': {
        event = JSON.parse(body);
        if (event.type === 'payment' && event.action === 'payment.created') {
          // Fetch payment details from Mercado Pago API
          transactionId = event.data?.id?.toString();
          status = 'completed';
          console.log(`[payment-webhook] Mercado Pago payment received: ${transactionId}`);
        }
        break;
      }

      case 'payu': {
        event = JSON.parse(body);
        if (event.status === 'APPROVED' || event.transactionState === 'APPROVED') {
          transactionId = event.referenceCode || event.reference;
          status = 'completed';
          amount = parseFloat(event.amount || event.value || '0');
          console.log(`[payment-webhook] PayU payment completed: ${transactionId}, amount: ${amount}`);
        } else if (event.status === 'DECLINED' || event.status === 'ERROR') {
          transactionId = event.referenceCode || event.reference;
          status = 'failed';
        }
        break;
      }

      case 'mollie': {
        event = JSON.parse(body);
        // Mollie sends payment ID, need to fetch status
        if (event.id) {
          transactionId = event.metadata?.transactionId || event.id;
          // Status would need to be fetched from Mollie API
          // For now, assume it's a success notification
          status = 'completed';
          console.log(`[payment-webhook] Mollie payment webhook: ${transactionId}`);
        }
        break;
      }

      case 'nowpayments': {
        event = JSON.parse(body);
        if (event.payment_status === 'finished' || event.payment_status === 'confirmed') {
          transactionId = event.order_id;
          status = 'completed';
          amount = parseFloat(event.price_amount || '0');
          console.log(`[payment-webhook] NowPayments completed: ${transactionId}, amount: ${amount}`);
        } else if (event.payment_status === 'failed' || event.payment_status === 'expired') {
          transactionId = event.order_id;
          status = 'failed';
        }
        break;
      }

      case 'coingate': {
        event = JSON.parse(body);
        if (event.status === 'paid') {
          transactionId = event.order_id;
          status = 'completed';
          amount = parseFloat(event.price_amount || '0');
          console.log(`[payment-webhook] CoinGate payment completed: ${transactionId}, amount: ${amount}`);
        } else if (event.status === 'canceled' || event.status === 'expired' || event.status === 'invalid') {
          transactionId = event.order_id;
          status = 'failed';
        }
        break;
      }

      case 'binancepay': {
        event = JSON.parse(body);
        if (event.bizStatus === 'PAY_SUCCESS') {
          transactionId = event.data?.merchantTradeNo;
          status = 'completed';
          amount = parseFloat(event.data?.orderAmount || '0');
          console.log(`[payment-webhook] Binance Pay completed: ${transactionId}, amount: ${amount}`);
        } else if (event.bizStatus === 'PAY_CLOSED') {
          transactionId = event.data?.merchantTradeNo;
          status = 'failed';
        }
        break;
      }

      case 'square': {
        event = JSON.parse(body);
        if (event.type === 'payment.completed' || event.data?.object?.status === 'COMPLETED') {
          transactionId = event.data?.object?.order_id || event.data?.object?.note;
          status = 'completed';
          amount = (event.data?.object?.amount_money?.amount || 0) / 100;
          buyerId = event.data?.object?.buyer_email_address;
          console.log(`[payment-webhook] Square payment completed: ${transactionId}, amount: ${amount}`);
        } else if (event.type === 'payment.failed') {
          transactionId = event.data?.object?.order_id;
          status = 'failed';
        }
        break;
      }

      case 'braintree': {
        event = JSON.parse(body);
        if (event.kind === 'transaction_settled' || event.kind === 'disbursement') {
          transactionId = event.transaction?.id || event.subject?.transactions?.[0]?.id;
          status = 'completed';
          amount = parseFloat(event.transaction?.amount || '0');
          console.log(`[payment-webhook] Braintree payment settled: ${transactionId}, amount: ${amount}`);
        } else if (event.kind === 'transaction_settled_failed' || event.kind === 'transaction_settlement_declined') {
          transactionId = event.transaction?.id;
          status = 'failed';
        }
        break;
      }

      case 'ach':
      case 'sepa': {
        // ACH/SEPA use Stripe under the hood
        event = JSON.parse(body);
        if (event.type === 'checkout.session.completed') {
          const session = event.data.object;
          transactionId = session.metadata?.transactionId;
          status = 'completed';
          amount = (session.amount_total || 0) / 100;
          buyerId = session.metadata?.buyerId;
          panelId = session.metadata?.panelId;
          console.log(`[payment-webhook] ${gateway.toUpperCase()} payment completed: ${transactionId}, amount: ${amount}`);
        } else if (event.type === 'checkout.session.expired' || event.type === 'payment_intent.payment_failed') {
          transactionId = event.data.object.metadata?.transactionId;
          status = 'failed';
        }
        break;
      }

      case 'btcpay': {
        event = JSON.parse(body);
        if (event.type === 'InvoiceSettled' || event.type === 'InvoiceProcessing') {
          transactionId = event.invoiceId || event.metadata?.orderId;
          status = 'completed';
          amount = parseFloat(event.price || event.btcPaid || '0');
          console.log(`[payment-webhook] BTCPay invoice settled: ${transactionId}, amount: ${amount}`);
        } else if (event.type === 'InvoiceExpired' || event.type === 'InvoiceInvalid') {
          transactionId = event.invoiceId;
          status = 'failed';
        }
        break;
      }

      case 'wise': {
        event = JSON.parse(body);
        if (event.event_type === 'transfers#state-change' && event.data?.current_state === 'outgoing_payment_sent') {
          transactionId = event.data?.resource?.id?.toString();
          status = 'completed';
          amount = parseFloat(event.data?.resource?.targetValue || '0');
          console.log(`[payment-webhook] Wise transfer completed: ${transactionId}, amount: ${amount}`);
        } else if (event.data?.current_state === 'cancelled' || event.data?.current_state === 'funds_refunded') {
          transactionId = event.data?.resource?.id?.toString();
          status = 'failed';
        }
        break;
      }

      case 'cryptomus': {
        // Cryptomus crypto payment webhook
        event = JSON.parse(body);
        // Cryptomus status: paid, paid_over, wrong_amount, process, confirm_check, wrong_amount_waiting, check, fail, cancel, system_fail, refund_process, refund_fail, refund_paid
        if (event.status === 'paid' || event.status === 'paid_over') {
          transactionId = event.order_id;
          status = 'completed';
          amount = parseFloat(event.amount || '0');
          // Parse additional data for panelId and buyerId
          try {
            const additionalData = JSON.parse(event.additional_data || '{}');
            panelId = additionalData.panelId;
            buyerId = additionalData.buyerId;
          } catch (e) {
            console.log('[payment-webhook] Cryptomus: Could not parse additional_data');
          }
          console.log(`[payment-webhook] Cryptomus payment completed: ${transactionId}, amount: ${amount}`);
        } else if (event.status === 'fail' || event.status === 'cancel' || event.status === 'system_fail') {
          transactionId = event.order_id;
          status = 'failed';
        }
        break;
      }

      default: {
        console.log(`[payment-webhook] Unknown gateway: ${gateway}`);
        return new Response(
          JSON.stringify({ received: true, processed: false, reason: 'Unknown gateway' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
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
      // Try to find by external_id if direct ID lookup fails
      const { data: txByExternal } = await supabase
        .from('transactions')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('external_id', transactionId)
        .select()
        .single();
      
      if (!txByExternal) {
        return new Response(
          JSON.stringify({ error: 'Transaction not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    const tx = transaction || null;

    // If payment completed, handle based on transaction type
    if (status === 'completed') {
      const userId = tx?.user_id || buyerId;
      const depositAmount = tx?.amount || amount;
      const txPanelId = tx?.panel_id || panelId;
      const txType = tx?.type || 'deposit';
      const txMetadata = tx?.metadata as Record<string, any> || {};
      const orderId = txMetadata?.orderId;

      if (userId) {
        // Check if this is an order payment or a deposit
        if (txType === 'order_payment' && orderId) {
          // This is a direct order payment - update order status, don't credit balance
          const { error: orderError } = await supabase
            .from('orders')
            .update({ 
              status: 'pending', // Move from awaiting_payment to pending
              updated_at: new Date().toISOString()
            })
            .eq('id', orderId);

          if (orderError) {
            console.error('[payment-webhook] Error updating order:', orderError);
          } else {
            console.log(`[payment-webhook] Order ${orderId} moved to pending after payment`);
          }

          // Create notification for order payment success
          await supabase
            .from('buyer_notifications')
            .insert({
              buyer_id: userId,
              panel_id: txPanelId,
              order_id: orderId,
              type: 'order',
              title: 'Order Payment Successful',
              message: `Your payment of $${depositAmount.toFixed(2)} was successful. Your order is now being processed.`,
            });
        } else {
          // Handle subscription payments first
          if (txMetadata?.type === 'subscription' && txPanelId) {
            const planName = txMetadata.plan || 'basic';
            
            // Update panel subscription tier
            await supabase.from('panels').update({
              subscription_tier: planName,
              subscription_status: 'active',
            }).eq('id', txPanelId);
            
            // Upsert panel_subscriptions record
            const expiresAt = new Date();
            expiresAt.setMonth(expiresAt.getMonth() + 1);
            
            await supabase.from('panel_subscriptions').upsert({
              panel_id: txPanelId,
              plan_type: planName,
              price: depositAmount,
              status: 'active',
              started_at: new Date().toISOString(),
              expires_at: expiresAt.toISOString(),
            }, { onConflict: 'panel_id' });
            
            console.log(`[payment-webhook] Subscription updated: ${planName} for panel ${txPanelId}`);

            // Notify panel owner
            const { data: subPanel } = await supabase
              .from('panels')
              .select('owner_id')
              .eq('id', txPanelId)
              .single();

            if (subPanel?.owner_id) {
              await supabase.from('panel_notifications').insert({
                panel_id: txPanelId,
                user_id: subPanel.owner_id,
                type: 'payment',
                title: 'Subscription Activated',
                message: `Your ${planName} plan subscription has been activated successfully.`,
              });
            }
          }

          // This is a regular deposit - credit balance
          const { data: buyer } = await supabase
            .from('client_users')
            .select('balance, total_spent')
            .eq('id', userId)
            .single();

          if (buyer) {
            // Buyer (client_user) deposit
            const newBalance = (buyer.balance || 0) + depositAmount;
            
            await supabase
              .from('client_users')
              .update({ 
                balance: newBalance,
                total_spent: (buyer.total_spent || 0) + depositAmount
              })
              .eq('id', userId);

            console.log(`[payment-webhook] Credited $${depositAmount} to buyer ${userId}, new balance: ${newBalance}`);

            // Create buyer notification for deposit
            await supabase
              .from('buyer_notifications')
              .insert({
                buyer_id: userId,
                panel_id: txPanelId,
                type: 'deposit',
                title: 'Deposit Successful',
                message: `$${depositAmount.toFixed(2)} has been added to your account via ${gateway}`,
              });

            // Also create panel notification for panel owner
            if (txPanelId) {
              const { data: panelOwner } = await supabase
                .from('panels')
                .select('owner_id')
                .eq('id', txPanelId)
                .single();

              if (panelOwner?.owner_id) {
                await supabase
                  .from('panel_notifications')
                  .insert({
                    panel_id: txPanelId,
                    user_id: panelOwner.owner_id,
                    type: 'payment',
                    title: 'Payment Received',
                    message: `A deposit of $${depositAmount.toFixed(2)} was completed via ${gateway}.`,
                  });
              }
            }
          } else if (txPanelId) {
            // Not a client_user — check if this is a panel owner deposit
            const { data: panelData } = await supabase
              .from('panels')
              .select('balance, owner_id')
              .eq('id', txPanelId)
              .single();

            if (panelData && panelData.owner_id === userId) {
              const newBalance = (panelData.balance || 0) + depositAmount;
              await supabase
                .from('panels')
                .update({ balance: newBalance })
                .eq('id', txPanelId);
              console.log(`[payment-webhook] Credited $${depositAmount} to panel ${txPanelId}, new balance: ${newBalance}`);

              // Notify panel owner
              await supabase.from('panel_notifications').insert({
                panel_id: txPanelId,
                user_id: userId,
                type: 'payment',
                title: 'Deposit Successful',
                message: `$${depositAmount.toFixed(2)} has been added to your panel balance via ${gateway}.`,
              });
            }
          }
        }
      }
    } else if (status === 'failed') {
      const userId = tx?.user_id || buyerId;
      const txPanelId = tx?.panel_id || panelId;
      
      if (userId) {
        // Create notification for failed payment
        await supabase
          .from('buyer_notifications')
          .insert({
            buyer_id: userId,
            panel_id: txPanelId,
            type: 'payment',
            title: 'Payment Failed',
            message: `Your ${gateway} payment could not be processed. Please try again.`,
          });
      }
    }

    return new Response(
      JSON.stringify({ 
        received: true, 
        processed: true,
        transactionId,
        status,
        gateway
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('[payment-webhook] Error:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message || 'Webhook processing failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
