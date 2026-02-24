import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { orderId, buyerId, orderAmount, panelId } = await req.json();

    console.log('Processing referral reward for order:', orderId);

    if (!orderId || !buyerId || !orderAmount || !panelId) {
      console.error('Missing required fields:', { orderId, buyerId, orderAmount, panelId });
      return new Response(
        JSON.stringify({ error: 'Missing required fields: orderId, buyerId, orderAmount, panelId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get buyer's info to check if they were referred
    const { data: buyer, error: buyerError } = await supabase
      .from('client_users')
      .select('id, referred_by, panel_id')
      .eq('id', buyerId)
      .single();

    if (buyerError || !buyer) {
      console.log('Buyer not found or error:', buyerError);
      return new Response(
        JSON.stringify({ message: 'Buyer not found', rewarded: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if buyer was referred by someone
    if (!buyer.referred_by) {
      console.log('Buyer was not referred by anyone');
      return new Response(
        JSON.stringify({ message: 'Buyer was not referred', rewarded: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find the referrer by their referral code
    const { data: referrer, error: referrerError } = await supabase
      .from('client_users')
      .select('id, balance, referral_count')
      .eq('referral_code', buyer.referred_by)
      .eq('panel_id', panelId)
      .single();

    if (referrerError || !referrer) {
      console.log('Referrer not found:', referrerError);
      return new Response(
        JSON.stringify({ message: 'Referrer not found', rewarded: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate reward (default 5% of order amount)
    const rewardPercentage = 5.00;
    const rewardAmount = parseFloat((orderAmount * rewardPercentage / 100).toFixed(2));

    console.log('Calculating reward:', { rewardPercentage, rewardAmount, orderAmount });

    // Start transaction-like operations
    // 1. Credit referrer's balance
    const newBalance = parseFloat(((referrer.balance || 0) + rewardAmount).toFixed(2));
    const { error: updateBalanceError } = await supabase
      .from('client_users')
      .update({ 
        balance: newBalance,
        referral_count: (referrer.referral_count || 0) + 1 
      })
      .eq('id', referrer.id);

    if (updateBalanceError) {
      console.error('Error updating referrer balance:', updateBalanceError);
      throw new Error('Failed to update referrer balance');
    }

    // 2. Create referral reward record
    const { error: rewardError } = await supabase
      .from('referral_rewards')
      .insert({
        panel_id: panelId,
        referrer_id: referrer.id,
        referred_id: buyerId,
        order_id: orderId,
        order_amount: orderAmount,
        reward_percentage: rewardPercentage,
        reward_amount: rewardAmount,
        status: 'completed'
      });

    if (rewardError) {
      console.error('Error creating reward record:', rewardError);
      // Don't throw - the balance was already credited
    }

    console.log('Referral reward processed successfully:', {
      referrerId: referrer.id,
      rewardAmount,
      newBalance
    });

    return new Response(
      JSON.stringify({ 
        success: true,
        rewarded: true,
        rewardAmount,
        referrerId: referrer.id,
        message: `Referral reward of $${rewardAmount} credited to referrer`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error processing referral reward:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
