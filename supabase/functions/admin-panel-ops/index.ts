import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AddFundsRequest {
  action: 'add_funds';
  panel_id: string;
  amount: number;
  type: 'credit' | 'debit';
  reason: string;
}

interface UpdateSubscriptionRequest {
  action: 'update_subscription';
  panel_id: string;
  operation: 'upgrade' | 'downgrade' | 'extend' | 'cancel';
  new_plan?: 'free' | 'basic' | 'pro';
  extend_days?: number;
  reason?: string;
}

interface BulkUpdateRequest {
  action: 'bulk_update';
  panel_ids: string[];
  updates: {
    commission_rate?: number;
    status?: 'active' | 'suspended';
  };
  reason?: string;
}

type AdminRequest = AddFundsRequest | UpdateSubscriptionRequest | BulkUpdateRequest;

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify admin role
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body: AdminRequest = await req.json();
    console.log('Admin operation:', body.action, 'by user:', user.id);

    switch (body.action) {
      case 'add_funds': {
        const { panel_id, amount, type, reason } = body;
        
        // Get current balance
        const { data: panel, error: panelError } = await supabase
          .from('panels')
          .select('balance, name')
          .eq('id', panel_id)
          .single();

        if (panelError || !panel) {
          return new Response(
            JSON.stringify({ error: 'Panel not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const currentBalance = panel.balance || 0;
        const adjustedAmount = type === 'credit' ? Math.abs(amount) : -Math.abs(amount);
        const newBalance = currentBalance + adjustedAmount;

        if (newBalance < 0) {
          return new Response(
            JSON.stringify({ error: 'Insufficient balance for debit' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Update panel balance
        const { error: updateError } = await supabase
          .from('panels')
          .update({ balance: newBalance })
          .eq('id', panel_id);

        if (updateError) throw updateError;

        // Create transaction record
        const { error: txError } = await supabase
          .from('transactions')
          .insert({
            panel_id,
            type: type === 'credit' ? 'admin_credit' : 'admin_debit',
            amount: adjustedAmount,
            status: 'completed',
            description: reason || `Admin ${type} adjustment`,
            payment_method: 'admin_adjustment'
          });

        if (txError) console.error('Error creating transaction:', txError);

        // Create notification for panel owner
        const { data: panelData } = await supabase
          .from('panels')
          .select('owner_id')
          .eq('id', panel_id)
          .single();

        if (panelData?.owner_id) {
          await supabase.from('panel_notifications').insert({
            panel_id,
            user_id: panelData.owner_id,
            title: type === 'credit' ? 'Funds Added to Your Account' : 'Funds Deducted from Your Account',
            message: `$${Math.abs(adjustedAmount).toFixed(2)} has been ${type === 'credit' ? 'added to' : 'deducted from'} your panel balance. ${reason ? `Reason: ${reason}` : ''}`,
            type: type === 'credit' ? 'info' : 'warning'
          });
        }

        // Create audit log
        await supabase
          .from('audit_logs')
          .insert({
            user_id: user.id,
            action: 'panel_funds_adjustment',
            resource_type: 'panel',
            resource_id: panel_id,
            details: {
              previous_balance: currentBalance,
              new_balance: newBalance,
              adjustment: adjustedAmount,
              type,
              reason
            }
          });

        console.log(`Funds ${type}ed for panel ${panel_id}: $${adjustedAmount}`);

        return new Response(
          JSON.stringify({
            success: true,
            previous_balance: currentBalance,
            new_balance: newBalance,
            adjustment: adjustedAmount,
            panel_name: panel.name
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'update_subscription': {
        const { panel_id, operation, new_plan, extend_days, reason } = body;

        // Get current subscription
        const { data: subscription, error: subError } = await supabase
          .from('panel_subscriptions')
          .select('*')
          .eq('panel_id', panel_id)
          .single();

        if (subError || !subscription) {
          return new Response(
            JSON.stringify({ error: 'Subscription not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const previousPlan = subscription.plan_type;
        const previousExpiry = subscription.expires_at;
        let updates: Record<string, any> = {};

        switch (operation) {
          case 'upgrade':
          case 'downgrade':
            if (!new_plan) {
              return new Response(
                JSON.stringify({ error: 'New plan required for upgrade/downgrade' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              );
            }
            const prices: Record<string, number> = { free: 0, basic: 29, pro: 79 };
            updates = { 
              plan_type: new_plan, 
              price: prices[new_plan],
              status: 'active'
            };
            break;

          case 'extend':
            if (!extend_days || extend_days < 1) {
              return new Response(
                JSON.stringify({ error: 'Valid extend_days required' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
              );
            }
            const currentExpiry = subscription.expires_at ? new Date(subscription.expires_at) : new Date();
            const newExpiry = new Date(currentExpiry);
            newExpiry.setDate(newExpiry.getDate() + extend_days);
            updates = { expires_at: newExpiry.toISOString(), status: 'active' };
            break;

          case 'cancel':
            updates = { status: 'cancelled', expires_at: new Date().toISOString() };
            break;
        }

        const { error: updateError } = await supabase
          .from('panel_subscriptions')
          .update(updates)
          .eq('id', subscription.id);

        if (updateError) throw updateError;

        // Get panel owner for notification
        const { data: panelData } = await supabase
          .from('panels')
          .select('owner_id, name')
          .eq('id', panel_id)
          .single();

        // Create notification based on operation
        if (panelData?.owner_id) {
          let notifTitle = '';
          let notifMessage = '';
          let notifType = 'info';

          switch (operation) {
            case 'upgrade':
              notifTitle = 'Subscription Upgraded';
              notifMessage = `Your subscription has been upgraded to ${updates.plan_type?.toUpperCase()}. Enjoy your new features!`;
              break;
            case 'downgrade':
              notifTitle = 'Subscription Changed';
              notifMessage = `Your subscription has been changed to ${updates.plan_type?.toUpperCase()}.`;
              notifType = 'warning';
              break;
            case 'extend':
              notifTitle = 'Subscription Extended';
              notifMessage = `Your subscription has been extended. New expiry: ${new Date(updates.expires_at).toLocaleDateString()}`;
              break;
            case 'cancel':
              notifTitle = 'Subscription Cancelled';
              notifMessage = 'Your subscription has been cancelled. Please contact support if you have questions.';
              notifType = 'warning';
              break;
          }

          await supabase.from('panel_notifications').insert({
            panel_id,
            user_id: panelData.owner_id,
            title: notifTitle,
            message: notifMessage,
            type: notifType
          });
        }

        // Create transaction record for paid operations
        if (operation === 'upgrade' && updates.plan_type !== 'free') {
          await supabase.from('transactions').insert({
            panel_id,
            type: 'subscription',
            amount: updates.price || 0,
            status: 'completed',
            description: `Subscription ${operation} to ${updates.plan_type}`,
            payment_method: 'admin_adjustment'
          });
        }

        // Create audit log
        await supabase
          .from('audit_logs')
          .insert({
            user_id: user.id,
            action: 'subscription_update',
            resource_type: 'subscription',
            resource_id: subscription.id,
            details: {
              panel_id,
              operation,
              previous_plan: previousPlan,
              new_plan: updates.plan_type || previousPlan,
              previous_expiry: previousExpiry,
              new_expiry: updates.expires_at,
              reason
            }
          });

        console.log(`Subscription ${operation} for panel ${panel_id}`);

        return new Response(
          JSON.stringify({
            success: true,
            operation,
            previous_plan: previousPlan,
            new_plan: updates.plan_type || previousPlan,
            new_expiry: updates.expires_at,
            panel_name: panelData?.name
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'bulk_update': {
        const { panel_ids, updates, reason } = body;

        if (!panel_ids || panel_ids.length === 0) {
          return new Response(
            JSON.stringify({ error: 'No panels selected' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { error: updateError, count } = await supabase
          .from('panels')
          .update(updates)
          .in('id', panel_ids);

        if (updateError) throw updateError;

        // Create audit log for bulk operation
        await supabase
          .from('audit_logs')
          .insert({
            user_id: user.id,
            action: 'bulk_panel_update',
            resource_type: 'panel',
            resource_id: panel_ids.join(','),
            details: {
              panel_count: panel_ids.length,
              updates,
              reason
            }
          });

        console.log(`Bulk update for ${panel_ids.length} panels`);

        return new Response(
          JSON.stringify({
            success: true,
            updated_count: count || panel_ids.length,
            updates
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
  } catch (error: unknown) {
    console.error('Admin operation error:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
