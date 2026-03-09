import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const JWT_SECRET = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || 'fallback-secret-key';

function base64UrlDecode(data: string): string {
  const padded = data + '='.repeat((4 - data.length % 4) % 4);
  return atob(padded.replace(/-/g, '+').replace(/_/g, '/'));
}

async function verifyJWT(token: string): Promise<{ valid: boolean; payload?: any; error?: string }> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return { valid: false, error: 'Invalid token format' };
    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    const signatureInput = `${encodedHeader}.${encodedPayload}`;
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw', encoder.encode(JWT_SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']
    );
    const signatureBytes = Uint8Array.from(
      base64UrlDecode(encodedSignature).split('').map(c => c.charCodeAt(0))
    );
    const isValid = await crypto.subtle.verify('HMAC', key, signatureBytes, encoder.encode(signatureInput));
    if (!isValid) return { valid: false, error: 'Invalid signature' };
    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return { valid: false, error: 'Token expired' };
    }
    return { valid: true, payload };
  } catch (error) {
    return { valid: false, error: 'Token verification failed' };
  }
}

function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

// Role-based access control
const ACTION_ROLES: Record<string, string[]> = {
  'list-orders': ['panel_admin', 'manager', 'agent'],
  'list-services': ['panel_admin', 'manager'],
  'list-customers': ['panel_admin'],
  'list-support': ['panel_admin', 'manager', 'agent'],
  'get-analytics': ['panel_admin'],
  'update-order-status': ['panel_admin', 'manager'],
  'reply-support': ['panel_admin', 'manager', 'agent'],
  'update-service': ['panel_admin', 'manager'],
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action, token } = body;

    if (!token) return jsonResponse({ error: 'Authentication required' }, 401);

    const verification = await verifyJWT(token);
    if (!verification.valid) return jsonResponse({ error: verification.error || 'Invalid token' }, 401);

    const { sub: memberId, panelId, role, type } = verification.payload;
    if (type !== 'team_member') return jsonResponse({ error: 'Invalid token type' }, 401);

    // Check role permission
    const allowedRoles = ACTION_ROLES[action];
    if (!allowedRoles) return jsonResponse({ error: 'Invalid action' }, 400);
    if (!allowedRoles.includes(role)) return jsonResponse({ error: 'Insufficient permissions' }, 403);

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    switch (action) {
      case 'list-orders':
        return await listOrders(supabaseAdmin, panelId, body);
      case 'list-services':
        return await listServices(supabaseAdmin, panelId, body);
      case 'list-customers':
        return await listCustomers(supabaseAdmin, panelId, body);
      case 'list-support':
        return await listSupport(supabaseAdmin, panelId, body);
      case 'get-analytics':
        return await getAnalytics(supabaseAdmin, panelId, body);
      case 'update-order-status':
        return await updateOrderStatus(supabaseAdmin, panelId, body);
      case 'reply-support':
        return await replySupport(supabaseAdmin, panelId, body);
      case 'update-service':
        return await updateService(supabaseAdmin, panelId, body);
      default:
        return jsonResponse({ error: 'Unknown action' }, 400);
    }
  } catch (error: unknown) {
    console.error('Team data error:', error);
    return jsonResponse({ error: (error as Error).message || 'Internal error' }, 500);
  }
});

// --- Action Handlers ---

async function listOrders(db: any, panelId: string, body: any) {
  const { status, search, page = 0, limit = 50 } = body;
  let query = db
    .from('orders')
    .select('id, order_number, quantity, price, status, target_url, created_at, updated_at, buyer_id, service_id, provider_order_id, progress, remains, start_count', { count: 'exact' })
    .eq('panel_id', panelId)
    .order('created_at', { ascending: false })
    .range(page * limit, (page + 1) * limit - 1);

  if (status && status !== 'all') query = query.eq('status', status);
  if (search) query = query.or(`order_number.ilike.%${search}%,target_url.ilike.%${search}%`);

  const { data, error, count } = await query;
  if (error) return jsonResponse({ error: error.message }, 500);

  // Fetch related buyer emails and service names
  const buyerIds = [...new Set((data || []).map((o: any) => o.buyer_id).filter(Boolean))];
  const serviceIds = [...new Set((data || []).map((o: any) => o.service_id).filter(Boolean))];

  let buyers: Record<string, string> = {};
  let services: Record<string, string> = {};

  if (buyerIds.length > 0) {
    const { data: bData } = await db.from('client_users').select('id, email, username').in('id', buyerIds);
    (bData || []).forEach((b: any) => { buyers[b.id] = b.username || b.email; });
  }
  if (serviceIds.length > 0) {
    const { data: sData } = await db.from('services').select('id, name').in('id', serviceIds);
    (sData || []).forEach((s: any) => { services[s.id] = s.name; });
  }

  const enriched = (data || []).map((o: any) => ({
    ...o,
    buyer_name: buyers[o.buyer_id] || 'Unknown',
    service_name: services[o.service_id] || 'Unknown',
  }));

  return jsonResponse({ data: enriched, total: count });
}

async function listServices(db: any, panelId: string, body: any) {
  const { search, page = 0, limit = 50 } = body;
  let query = db
    .from('services')
    .select('id, name, category, price_per_1000, min_quantity, max_quantity, is_active, platform, created_at', { count: 'exact' })
    .eq('panel_id', panelId)
    .order('name', { ascending: true })
    .range(page * limit, (page + 1) * limit - 1);

  if (search) query = query.ilike('name', `%${search}%`);

  const { data, error, count } = await query;
  if (error) return jsonResponse({ error: error.message }, 500);
  return jsonResponse({ data: data || [], total: count });
}

async function listCustomers(db: any, panelId: string, body: any) {
  const { search, page = 0, limit = 50 } = body;
  let query = db
    .from('client_users')
    .select('id, email, username, full_name, balance, is_active, is_banned, is_vip, total_spent, last_login_at, created_at', { count: 'exact' })
    .eq('panel_id', panelId)
    .order('created_at', { ascending: false })
    .range(page * limit, (page + 1) * limit - 1);

  if (search) query = query.or(`email.ilike.%${search}%,username.ilike.%${search}%,full_name.ilike.%${search}%`);

  const { data, error, count } = await query;
  if (error) return jsonResponse({ error: error.message }, 500);
  return jsonResponse({ data: data || [], total: count });
}

async function listSupport(db: any, panelId: string, body: any) {
  const { status: chatStatus, page = 0, limit = 30 } = body;
  let query = db
    .from('chat_sessions')
    .select('id, visitor_id, visitor_name, visitor_email, status, created_at, last_message_at, updated_at', { count: 'exact' })
    .eq('panel_id', panelId)
    .order('last_message_at', { ascending: false, nullsFirst: false })
    .range(page * limit, (page + 1) * limit - 1);

  if (chatStatus && chatStatus !== 'all') query = query.eq('status', chatStatus);

  const { data, error, count } = await query;
  if (error) return jsonResponse({ error: error.message }, 500);

  // Fetch last message for each session
  const sessionIds = (data || []).map((s: any) => s.id);
  let lastMessages: Record<string, any> = {};

  if (sessionIds.length > 0) {
    // Get the most recent message per session
    const { data: msgs } = await db
      .from('chat_messages')
      .select('session_id, content, sender_type, created_at')
      .in('session_id', sessionIds)
      .order('created_at', { ascending: false });

    const seen = new Set<string>();
    (msgs || []).forEach((m: any) => {
      if (!seen.has(m.session_id)) {
        seen.add(m.session_id);
        lastMessages[m.session_id] = m;
      }
    });
  }

  const enriched = (data || []).map((s: any) => ({
    ...s,
    last_message: lastMessages[s.id] || null,
  }));

  return jsonResponse({ data: enriched, total: count });
}

async function getAnalytics(db: any, panelId: string, body: any) {
  const { days = 30 } = body;
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - days);

  const { data, error } = await db
    .from('panel_analytics')
    .select('*')
    .eq('panel_id', panelId)
    .gte('date', fromDate.toISOString().split('T')[0])
    .order('date', { ascending: true });

  if (error) return jsonResponse({ error: error.message }, 500);

  // Also get summary stats
  const [ordersRes, customersRes, servicesRes] = await Promise.all([
    db.from('orders').select('id, price, status', { count: 'exact' }).eq('panel_id', panelId),
    db.from('client_users').select('id', { count: 'exact' }).eq('panel_id', panelId),
    db.from('services').select('id', { count: 'exact' }).eq('panel_id', panelId).eq('is_active', true),
  ]);

  const totalRevenue = (ordersRes.data || [])
    .filter((o: any) => o.status === 'completed')
    .reduce((sum: number, o: any) => sum + (o.price || 0), 0);

  return jsonResponse({
    data: data || [],
    summary: {
      totalOrders: ordersRes.count || 0,
      totalCustomers: customersRes.count || 0,
      activeServices: servicesRes.count || 0,
      totalRevenue,
    },
  });
}

async function updateOrderStatus(db: any, panelId: string, body: any) {
  const { orderId, newStatus } = body;
  if (!orderId || !newStatus) return jsonResponse({ error: 'orderId and newStatus required' }, 400);

  const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled', 'partial', 'refunded'];
  if (!validStatuses.includes(newStatus)) return jsonResponse({ error: 'Invalid status' }, 400);

  const { data, error } = await db
    .from('orders')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', orderId)
    .eq('panel_id', panelId)
    .select()
    .single();

  if (error) return jsonResponse({ error: error.message }, 500);
  return jsonResponse({ success: true, data });
}

async function replySupport(db: any, panelId: string, body: any) {
  const { sessionId, content } = body;
  if (!sessionId || !content) return jsonResponse({ error: 'sessionId and content required' }, 400);

  // Verify session belongs to this panel
  const { data: session } = await db
    .from('chat_sessions')
    .select('id')
    .eq('id', sessionId)
    .eq('panel_id', panelId)
    .maybeSingle();

  if (!session) return jsonResponse({ error: 'Chat session not found' }, 404);

  const { data, error } = await db
    .from('chat_messages')
    .insert({
      session_id: sessionId,
      content,
      sender_type: 'agent',
    })
    .select()
    .single();

  if (error) return jsonResponse({ error: error.message }, 500);

  // Update session last_message_at
  await db
    .from('chat_sessions')
    .update({ last_message_at: new Date().toISOString(), status: 'active' })
    .eq('id', sessionId);

  return jsonResponse({ success: true, data });
}

async function updateService(db: any, panelId: string, body: any) {
  const { serviceId, updates } = body;
  if (!serviceId) return jsonResponse({ error: 'serviceId required' }, 400);

  // Only allow safe fields to be updated
  const allowedFields = ['price_per_1000', 'is_active', 'min_quantity', 'max_quantity'];
  const safeUpdates: Record<string, any> = {};
  for (const key of allowedFields) {
    if (updates && key in updates) safeUpdates[key] = updates[key];
  }

  if (Object.keys(safeUpdates).length === 0) return jsonResponse({ error: 'No valid fields to update' }, 400);

  const { data, error } = await db
    .from('services')
    .update({ ...safeUpdates, updated_at: new Date().toISOString() })
    .eq('id', serviceId)
    .eq('panel_id', panelId)
    .select()
    .single();

  if (error) return jsonResponse({ error: error.message }, 500);
  return jsonResponse({ success: true, data });
}
