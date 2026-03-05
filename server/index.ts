import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialize Supabase admin client (server-side, uses service role)
function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!url || !key) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

function getSupabaseAnon() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
  const key = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';
  return createClient(url, key);
}

// ===== JWT HELPERS =====
const JWT_SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.BUYER_JWT_SECRET || 'buyer-jwt-secret-key';
const JWT_EXPIRY = 3600;

function base64UrlEncode(str: string): string {
  return Buffer.from(str).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(str: string): string {
  const padded = str + '='.repeat((4 - (str.length % 4)) % 4);
  return Buffer.from(padded.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString();
}

async function createJWT(payload: Record<string, any>): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const tokenPayload = { ...payload, iat: now, exp: now + JWT_EXPIRY };
  const encoded = `${base64UrlEncode(JSON.stringify(header))}.${base64UrlEncode(JSON.stringify(tokenPayload))}`;
  const sig = crypto.createHmac('sha256', JWT_SECRET).update(encoded).digest('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return `${encoded}.${sig}`;
}

async function verifyJWT(token: string): Promise<{ valid: boolean; payload?: any; error?: string }> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return { valid: false, error: 'Invalid token format' };
    const [header, payload, sig] = parts;
    const expectedSig = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${payload}`).digest('base64')
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    if (sig !== expectedSig) return { valid: false, error: 'Invalid signature' };
    const decoded = JSON.parse(base64UrlDecode(payload));
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) return { valid: false, error: 'Token expired' };
    return { valid: true, payload: decoded };
  } catch {
    return { valid: false, error: 'Verification failed' };
  }
}

// ===== PASSWORD HELPERS =====
async function hashPassword(password: string): Promise<string> {
  const salt = crypto.randomBytes(16);
  const iterations = 100000;
  const hash = crypto.pbkdf2Sync(password, salt, iterations, 32, 'sha256');
  return `$pbkdf2$${iterations}$${salt.toString('base64')}$${hash.toString('base64')}`;
}

async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  try {
    if (storedHash.startsWith('$pbkdf2$')) {
      const parts = storedHash.split('$');
      if (parts.length !== 5) return false;
      const iterations = parseInt(parts[2]);
      const salt = Buffer.from(parts[3], 'base64');
      const storedHashB64 = parts[4];
      const hash = crypto.pbkdf2Sync(password, salt, iterations, 32, 'sha256');
      return hash.toString('base64') === storedHashB64;
    }
    if (storedHash.startsWith('$2')) return false; // bcrypt - not supported
    return storedHash === password; // legacy plaintext
  } catch {
    return false;
  }
}

// Rate limiting map
const failedAttempts = new Map<string, { count: number; lastAttempt: number }>();
const LOCKOUT_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function checkRateLimit(key: string) {
  const k = key.toLowerCase();
  const now = Date.now();
  const record = failedAttempts.get(k);
  if (!record) return { allowed: true };
  if (now - record.lastAttempt > LOCKOUT_MS) { failedAttempts.delete(k); return { allowed: true }; }
  if (record.count >= MAX_ATTEMPTS) {
    return { allowed: false, remainingTime: Math.ceil((LOCKOUT_MS - (now - record.lastAttempt)) / 1000) };
  }
  return { allowed: true };
}
function recordFailedAttempt(key: string) {
  const k = key.toLowerCase();
  const now = Date.now();
  const r = failedAttempts.get(k);
  failedAttempts.set(k, r ? { count: r.count + 1, lastAttempt: now } : { count: 1, lastAttempt: now });
}
function clearFailedAttempts(key: string) { failedAttempts.delete(key.toLowerCase()); }

// ===== HEALTH CHECK =====
app.get('/health', (_req, res) => res.json({ ok: true }));

// ===== FUNCTIONS ROUTER =====
// All edge functions available at /functions/v1/:functionName
const fnRouter = express.Router();

// ─── buyer-auth ───────────────────────────────────────────────────────────────
fnRouter.post('/buyer-auth', async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    const body = req.body;
    const { panelId, action } = body;
    if (!panelId) return res.json({ error: 'Missing panel ID' });

    switch (action) {
      case 'login': {
        const { identifier, password } = body;
        if (!identifier || !password) return res.json({ error: 'Email/username and password are required' });
        const clientIP = (req.headers['x-forwarded-for'] as string || 'unknown').split(',')[0].trim();
        const rlKey = `${clientIP}:${identifier}`;
        const rl = checkRateLimit(rlKey);
        if (!rl.allowed) return res.json({ error: `Too many failed attempts. Try again in ${rl.remainingTime}s`, rateLimited: true });

        const norm = identifier.trim().toLowerCase();
        const { data: users } = await supabase.from('client_users').select('*').eq('panel_id', panelId)
          .or(`email.eq.${norm},username.ilike.${norm}`);
        if (!users?.length) { recordFailedAttempt(rlKey); return res.json({ error: 'No account found with this email or username' }); }
        const user = users[0];
        if (user.is_banned) return res.json({ error: 'Your account has been banned', reason: user.ban_reason });
        if (!user.is_active) return res.json({ error: 'Your account has been suspended' });

        const storedHash = user.password_hash || user.password_temp;
        let match = false;
        if (storedHash) {
          if (storedHash.startsWith('$pbkdf2$')) match = await verifyPassword(password, storedHash);
          else if (storedHash.startsWith('$2')) return res.json({ error: 'Please reset your password to continue', requiresPasswordReset: true });
          else { match = storedHash === password; if (match) { const nh = await hashPassword(password); await supabase.from('client_users').update({ password_hash: nh, password_temp: null }).eq('id', user.id); } }
        }
        if (!match) { recordFailedAttempt(rlKey); return res.json({ error: 'Incorrect password' }); }
        clearFailedAttempts(rlKey);
        await supabase.from('client_users').update({ last_login_at: new Date().toISOString() }).eq('id', user.id);
        const token = await createJWT({ sub: user.id, email: user.email, panelId, type: 'buyer' });
        const { password_hash, password_temp, ...safeUser } = user;
        return res.json({ success: true, user: safeUser, token, expiresIn: JWT_EXPIRY });
      }

      case 'signup': {
        const { email, password, fullName, username, referralCode } = body;
        if (!email || !password) return res.json({ error: 'Email and password are required' });
        const norm = email.trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(norm)) return res.json({ error: 'Invalid email format' });
        if (password.length < 8) return res.json({ error: 'Password must be at least 8 characters' });
        if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
          return res.json({ error: 'Password must contain uppercase, lowercase, and a number' });
        }
        const { data: existing } = await supabase.from('client_users').select('id').eq('email', norm).eq('panel_id', panelId).maybeSingle();
        if (existing) return res.json({ error: 'Email already registered', needsLogin: true });
        const hashedPw = await hashPassword(password);
        let referrerId = null;
        if (referralCode) {
          const { data: referrer } = await supabase.from('client_users').select('id').eq('referral_code', referralCode.toUpperCase()).eq('panel_id', panelId).maybeSingle();
          if (referrer) referrerId = referrer.id;
        }
        const { data: newUser, error: insertErr } = await supabase.from('client_users').insert({
          email: norm, full_name: fullName?.trim() || null, username: username?.trim() || null,
          password_hash: hashedPw, panel_id: panelId, is_active: true, is_banned: false,
          balance: 0, total_spent: 0, referral_count: 0, custom_discount: 0, referred_by: referrerId,
        }).select().single();
        if (insertErr || !newUser) return res.json({ error: insertErr?.message || 'Registration failed' });
        const token = await createJWT({ sub: newUser.id, email: newUser.email, panelId, type: 'buyer' });
        const { password_hash, password_temp, ...safeUser } = newUser;
        return res.json({ success: true, user: safeUser, token, expiresIn: JWT_EXPIRY });
      }

      case 'fetch': {
        const { buyerId, token } = body;
        if (token) {
          const v = await verifyJWT(token);
          if (!v.valid) return res.json({ error: 'Session expired', tokenExpired: true });
          if (v.payload?.sub !== buyerId || v.payload?.panelId !== panelId) return res.json({ error: 'Invalid session', tokenInvalid: true });
        }
        if (!buyerId) return res.json({ error: 'Buyer ID required' });
        const { data: user } = await supabase.from('client_users').select('*').eq('id', buyerId).eq('panel_id', panelId).maybeSingle();
        if (!user) return res.json({ error: 'User not found' });
        if (user.is_banned) return res.json({ error: 'Account banned', reason: user.ban_reason });
        if (!user.is_active) return res.json({ error: 'Account suspended' });
        const { password_hash, password_temp, ...safeUser } = user;
        return res.json({ success: true, user: safeUser });
      }

      case 'verify-token': {
        const { token } = body;
        if (!token) return res.json({ valid: false, error: 'No token provided' });
        return res.json(await verifyJWT(token));
      }

      case 'forgot-password': {
        const { email } = body;
        if (!email) return res.json({ error: 'Email is required' });
        const norm = email.trim().toLowerCase();
        const { data: user } = await supabase.from('client_users').select('id,email').eq('email', norm).eq('panel_id', panelId).maybeSingle();
        if (user) {
          // Generate temp password and update
          const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
          let tp = 'A1a';
          for (let i = 0; i < 9; i++) tp += chars[Math.floor(Math.random() * chars.length)];
          tp = tp.split('').sort(() => Math.random() - 0.5).join('');
          const hashed = await hashPassword(tp);
          await supabase.from('client_users').update({ password_hash: hashed, password_temp: null }).eq('id', user.id);
        }
        return res.json({ success: true, message: 'If an account exists, you will receive a reset link.' });
      }

      case 'change-password': {
        const { buyerId, token, currentPassword, newPassword } = body;
        if (token) {
          const v = await verifyJWT(token);
          if (!v.valid) return res.json({ error: 'Session expired', tokenExpired: true });
          if (v.payload?.sub !== buyerId) return res.json({ error: 'Invalid session' });
        }
        if (!buyerId || !currentPassword || !newPassword) return res.json({ error: 'Missing required fields' });
        if (newPassword.length < 8) return res.json({ error: 'Password must be at least 8 characters' });
        const { data: user } = await supabase.from('client_users').select('id,password_hash,password_temp').eq('id', buyerId).eq('panel_id', panelId).maybeSingle();
        if (!user) return res.json({ error: 'User not found' });
        const match = await verifyPassword(currentPassword, user.password_hash || user.password_temp || '');
        if (!match) return res.json({ error: 'Current password is incorrect' });
        const newHash = await hashPassword(newPassword);
        await supabase.from('client_users').update({ password_hash: newHash, password_temp: null }).eq('id', user.id);
        return res.json({ success: true, message: 'Password updated successfully' });
      }

      case 'generate-api-key': {
        const { buyerId, token } = body;
        if (!token) return res.json({ error: 'Authentication required' });
        const v = await verifyJWT(token);
        if (!v.valid) return res.json({ error: 'Session expired', tokenExpired: true });
        if (v.payload?.sub !== buyerId) return res.json({ error: 'Invalid session' });
        const prefix = panelId.substring(0, 8);
        const apiKey = `sk_${prefix}_${crypto.randomUUID().replace(/-/g, '')}`;
        const { error: updateErr } = await supabase.from('client_users').update({ api_key: apiKey }).eq('id', buyerId).eq('panel_id', panelId);
        if (updateErr) return res.json({ error: 'Failed to generate API key' });
        return res.json({ success: true, api_key: apiKey });
      }

      case 'resend-verification':
        return res.json({ success: true, message: 'Verification email sent' });

      case 'guest-order': {
        const { email, fullName, username } = body;
        if (!email) return res.json({ error: 'Email is required' });
        const norm = email.trim().toLowerCase();
        const { data: existingUser } = await supabase.from('client_users').select('*').eq('email', norm).eq('panel_id', panelId).maybeSingle();
        if (existingUser) {
          if (existingUser.is_banned) return res.json({ error: 'Account banned', reason: existingUser.ban_reason });
          if (!existingUser.is_active) return res.json({ error: 'Account suspended' });
          return res.json({ error: 'Account already exists. Please login to continue.', needsLogin: true, existingEmail: norm });
        }
        const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
        let tp = 'A1a';
        for (let i = 0; i < 9; i++) tp += chars[Math.floor(Math.random() * chars.length)];
        const tempPassword = tp.split('').sort(() => Math.random() - 0.5).join('');
        const hashed = await hashPassword(tempPassword);
        const { data: newUser, error: insertErr } = await supabase.from('client_users').insert({
          email: norm, full_name: fullName?.trim() || null, username: username?.trim() || null,
          password_hash: hashed, panel_id: panelId, is_active: true, is_banned: false,
          balance: 0, total_spent: 0, referral_count: 0, custom_discount: 0,
        }).select().single();
        if (insertErr || !newUser) return res.json({ error: 'Account creation failed' });
        const token = await createJWT({ sub: newUser.id, email: newUser.email, panelId, type: 'buyer' });
        const { password_hash, password_temp, ...safeUser } = newUser;
        return res.json({ success: true, user: safeUser, tempPassword, token, expiresIn: JWT_EXPIRY, isNewAccount: true });
      }

      default:
        return res.json({ error: 'Invalid action' });
    }
  } catch (err: any) {
    console.error('[buyer-auth]', err);
    return res.json({ error: err.message || 'Authentication failed' });
  }
});

// ─── buyer-api ────────────────────────────────────────────────────────────────
fnRouter.post('/buyer-api', async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    const params = req.body;
    const { key, action } = params;
    if (!key) return res.json({ error: 'Invalid API key' });
    if (!action) return res.json({ error: 'Action is required' });

    let panelId: string | null = null;
    let buyerId: string | null = null;
    const { data: panelKeyData } = await supabase.from('panel_api_keys').select('panel_id').eq('api_key', key).eq('is_active', true).maybeSingle();
    if (panelKeyData) { panelId = panelKeyData.panel_id; }
    else {
      const { data: buyerKeyData } = await supabase.from('client_users').select('id,panel_id').eq('api_key', key).maybeSingle();
      if (buyerKeyData) { panelId = buyerKeyData.panel_id; buyerId = buyerKeyData.id; }
    }
    if (!panelId) return res.json({ error: 'Invalid API key' });

    const formatStatus = (s: string) => ({ pending: 'Pending', processing: 'In progress', in_progress: 'In progress', completed: 'Completed', partial: 'Partial', cancelled: 'Canceled', canceled: 'Canceled', refunded: 'Refunded', failed: 'Failed' }[s?.toLowerCase()] || s || 'Pending');
    const formatCategory = (c: string) => ({ instagram: 'Instagram', facebook: 'Facebook', twitter: 'Twitter / X', youtube: 'YouTube', tiktok: 'TikTok', telegram: 'Telegram', linkedin: 'LinkedIn' }[c?.toLowerCase()] || c || 'Other');

    switch (action.toLowerCase()) {
      case 'services': {
        const { data: services } = await supabase.from('services').select('*').eq('panel_id', panelId).eq('is_active', true).order('display_order', { ascending: true });
        return res.json((services || []).map((s: any) => ({ service: s.provider_service_id || s.id, name: s.name, type: s.service_type || 'Default', category: formatCategory(s.category), rate: parseFloat(s.price).toFixed(4), min: s.min_quantity, max: s.max_quantity, refill: s.refill_available || false, cancel: s.cancel_available || false, dripfeed: false, desc: s.description || '' })));
      }
      case 'balance': {
        if (buyerId) {
          const { data: buyer } = await supabase.from('client_users').select('balance').eq('id', buyerId).single();
          return res.json({ balance: parseFloat(buyer?.balance || 0).toFixed(4), currency: 'USD' });
        }
        const { data: panel } = await supabase.from('panels').select('balance,default_currency').eq('id', panelId).maybeSingle();
        return res.json({ balance: parseFloat(panel?.balance || 0).toFixed(4), currency: panel?.default_currency || 'USD' });
      }
      case 'add': {
        const { service, link, quantity, comments } = params;
        if (!service) return res.json({ error: 'Service ID is required' });
        if (!link) return res.json({ error: 'Link is required' });
        const { data: serviceData } = await supabase.from('services').select('*').eq('panel_id', panelId).eq('is_active', true).or(`provider_service_id.eq.${service},id.eq.${service}`).maybeSingle();
        if (!serviceData) return res.json({ error: 'Service not found' });
        const qty = quantity || serviceData.min_quantity;
        if (qty < serviceData.min_quantity) return res.json({ error: `Min quantity: ${serviceData.min_quantity}` });
        if (qty > serviceData.max_quantity) return res.json({ error: `Max quantity: ${serviceData.max_quantity}` });
        const price = (serviceData.price / 1000) * qty;
        if (buyerId) {
          const { data: buyer } = await supabase.from('client_users').select('balance').eq('id', buyerId).single();
          if (!buyer || parseFloat(buyer.balance) < price) return res.json({ error: 'Not enough funds' });
          await supabase.from('client_users').update({ balance: parseFloat(buyer.balance) - price }).eq('id', buyerId);
        }
        const orderNum = 'ORD' + Date.now().toString().slice(-10) + Math.random().toString(36).slice(-4).toUpperCase();
        const { data: order, error: oErr } = await supabase.from('orders').insert({ panel_id: panelId, service_id: serviceData.id, order_number: orderNum, target_url: link, quantity: qty, price, status: 'pending', buyer_id: buyerId || null, notes: comments || null }).select('id,order_number').single();
        if (oErr) return res.json({ error: 'Failed to create order' });
        return res.json({ order: order.order_number });
      }
      case 'status': {
        const { order, orders } = params;
        if (orders) {
          const ids = orders.split(',').map((o: string) => o.trim());
          const { data: ords } = await supabase.from('orders').select('order_number,price,start_count,status,remains,quantity').eq('panel_id', panelId).in('order_number', ids);
          const result: Record<string, any> = {};
          ids.forEach((id: string) => { const f = ords?.find((o: any) => o.order_number === id); result[id] = f ? { charge: parseFloat(f.price).toFixed(4), start_count: String(f.start_count || 0), status: formatStatus(f.status), remains: String(f.remains || 0), currency: 'USD' } : { error: 'Incorrect order ID' }; });
          return res.json(result);
        }
        if (!order) return res.json({ error: 'Order ID required' });
        const { data: ord } = await supabase.from('orders').select('*').eq('panel_id', panelId).eq('order_number', String(order)).maybeSingle();
        if (!ord) return res.json({ error: 'Incorrect order ID' });
        return res.json({ charge: parseFloat(ord.price).toFixed(4), start_count: String(ord.start_count || 0), status: formatStatus(ord.status), remains: String(ord.remains || 0), currency: 'USD' });
      }
      default:
        return res.json({ error: `Unknown action: ${action}` });
    }
  } catch (err: any) {
    console.error('[buyer-api]', err);
    return res.json({ error: err.message || 'Internal server error' });
  }
});

// ─── buyer-order ──────────────────────────────────────────────────────────────
fnRouter.post('/buyer-order', async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    const { panelId, buyerId, serviceId, quantity, targetUrl, price, notes, paymentType } = req.body;
    if (!panelId || !serviceId || !quantity || !targetUrl) return res.json({ success: false, error: 'Missing required fields' });

    const { data: service } = await supabase.from('services').select('*').eq('id', serviceId).eq('panel_id', panelId).single();
    if (!service) return res.json({ success: false, error: 'Service not found' });

    const orderPrice = price || (service.price / 1000) * quantity;

    if (paymentType === 'balance' && buyerId) {
      const { data: buyer } = await supabase.from('client_users').select('balance').eq('id', buyerId).single();
      if (!buyer || parseFloat(buyer.balance) < orderPrice) return res.json({ success: false, error: 'Insufficient balance' });
      await supabase.from('client_users').update({ balance: parseFloat(buyer.balance) - orderPrice, total_spent: (buyer.total_spent || 0) + orderPrice }).eq('id', buyerId);
    }

    const orderNumber = 'ORD' + Date.now().toString().slice(-10) + Math.random().toString(36).slice(-4).toUpperCase();
    const { data: order, error: orderErr } = await supabase.from('orders').insert({
      panel_id: panelId, service_id: serviceId, buyer_id: buyerId || null,
      order_number: orderNumber, target_url: targetUrl, quantity, price: orderPrice, status: 'pending', notes: notes || null,
    }).select('id,order_number').single();

    if (orderErr) return res.json({ success: false, error: 'Failed to create order' });

    // Forward to provider
    try {
      const { data: svc } = await supabase.from('services').select('provider_id,provider_service_id').eq('id', serviceId).single();
      if (svc?.provider_id && svc?.provider_service_id) {
        const { data: provider } = await supabase.from('providers').select('api_endpoint,api_key,is_active').eq('id', svc.provider_id).single();
        if (provider?.is_active) {
          const fd = new URLSearchParams({ key: provider.api_key, action: 'add', service: svc.provider_service_id, link: targetUrl, quantity: String(quantity) });
          const provRes = await fetch(provider.api_endpoint, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: fd.toString() });
          const provData = await provRes.json();
          if (provData.order) await supabase.from('orders').update({ provider_order_id: String(provData.order), status: 'processing' }).eq('id', order.id);
        }
      }
    } catch (provErr) {
      console.error('[buyer-order] Provider forwarding error:', provErr);
    }

    return res.json({ success: true, order: { id: order.id, order_number: order.order_number } });
  } catch (err: any) {
    console.error('[buyer-order]', err);
    return res.json({ success: false, error: err.message });
  }
});

// ─── process-payment ──────────────────────────────────────────────────────────
fnRouter.post('/process-payment', async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    const body = req.body;

    if (body.action === 'verify-payment') {
      const { transactionId, gateway: gw } = body;
      if (!transactionId) return res.json({ success: false, error: 'Missing transactionId' });
      const { data: tx } = await supabase.from('transactions').select('*').eq('id', transactionId).single();
      if (!tx) return res.json({ success: false, error: 'Transaction not found' });
      if (tx.status === 'completed' || tx.status === 'failed') return res.json({ success: true, status: tx.status, amount: tx.amount });

      const verifyGateway = gw || tx.payment_method;
      let verified = false;
      let verifiedAmount = tx.amount;

      try {
        if (verifyGateway === 'stripe' && tx.external_id) {
          const { data: adminProvider } = await supabase.from('platform_payment_providers').select('config').eq('provider_name', 'stripe').eq('is_enabled', true).maybeSingle();
          const stripeKey = (adminProvider?.config as any)?.secret_key || process.env.STRIPE_SECRET_KEY;
          if (stripeKey) {
            const sessionRes = await fetch(`https://api.stripe.com/v1/checkout/sessions/${tx.external_id}`, { headers: { Authorization: `Bearer ${stripeKey}` } });
            const session = await sessionRes.json();
            if (session.payment_status === 'paid') { verified = true; verifiedAmount = (session.amount_total || 0) / 100; }
          }
        } else if (verifyGateway === 'paystack') {
          const { data: adminProvider } = await supabase.from('platform_payment_providers').select('config').eq('provider_name', 'paystack').eq('is_enabled', true).maybeSingle();
          const psKey = (adminProvider?.config as any)?.secret_key;
          if (psKey) {
            const psRes = await fetch(`https://api.paystack.co/transaction/verify/${transactionId}`, { headers: { Authorization: `Bearer ${psKey}` } });
            const psData = await psRes.json();
            if (psData.status && psData.data?.status === 'success') { verified = true; verifiedAmount = (psData.data.amount || 0) / 100; }
          }
        }
      } catch (verErr) {
        console.error('[process-payment] verify error:', verErr);
      }

      if (verified) {
        await supabase.from('transactions').update({ status: 'completed', updated_at: new Date().toISOString() }).eq('id', transactionId);
        if (tx.buyer_id) {
          const { data: buyer } = await supabase.from('client_users').select('balance').eq('id', tx.buyer_id).single();
          if (buyer) await supabase.from('client_users').update({ balance: (buyer.balance || 0) + verifiedAmount }).eq('id', tx.buyer_id);
        } else if (tx.panel_id) {
          const { data: panel } = await supabase.from('panels').select('balance').eq('id', tx.panel_id).single();
          if (panel) await supabase.from('panels').update({ balance: (panel.balance || 0) + verifiedAmount }).eq('id', tx.panel_id);
        }
        return res.json({ success: true, status: 'completed', amount: verifiedAmount });
      }
      return res.json({ success: true, status: tx.status, amount: tx.amount });
    }

    const { gateway, amount, panelId, buyerId, returnUrl, currency = 'usd', orderId, isOwnerDeposit, metadata } = body;
    if (!gateway || !amount || !buyerId) return res.json({ success: false, error: 'Missing required fields' });

    let gatewayConfig: any = null;
    const isOwnerPayment = isOwnerDeposit || metadata?.type === 'subscription';

    if (isOwnerPayment) {
      const { data: adminProvider } = await supabase.from('platform_payment_providers').select('*').eq('provider_name', gateway).eq('is_enabled', true).maybeSingle();
      if (!adminProvider) return res.json({ success: false, error: `Payment gateway "${gateway}" is not configured` });
      const cfg = (adminProvider.config as Record<string, any>) || {};
      gatewayConfig = { secretKey: cfg.secret_key || cfg.secretKey, apiKey: cfg.api_key || cfg.apiKey, publicKey: cfg.public_key || cfg.publicKey };
    } else if (panelId) {
      const { data: panelData } = await supabase.from('panels').select('settings,name').eq('id', panelId).single();
      if (!panelData) return res.json({ success: false, error: 'Panel not found' });
      const methods = (panelData.settings as any)?.payments?.enabledMethods || [];
      gatewayConfig = methods.find((m: any) => (typeof m === 'string' ? m : m.id) === gateway);
      if (typeof gatewayConfig === 'string') gatewayConfig = { id: gatewayConfig, enabled: true };
      if (!gatewayConfig) return res.json({ success: false, error: `${gateway} not enabled for this panel` });
    }

    const { data: newTx, error: txErr } = await supabase.from('transactions').insert({
      user_id: buyerId, ...(isOwnerPayment ? {} : { buyer_id: buyerId }),
      panel_id: panelId, amount, type: orderId ? 'order_payment' : 'deposit',
      payment_method: gateway, status: 'pending', description: `Deposit via ${gateway}`,
      metadata: { ...(metadata || {}), ...(orderId ? { orderId } : {}) },
    }).select('id').single();
    if (txErr) return res.json({ success: false, error: 'Failed to create transaction record' });
    const txId = newTx.id;

    let redirectUrl: string | null = null;
    let paymentId: string | null = null;
    const panelName = 'SMM Panel';

    if (gateway === 'stripe') {
      const stripeKey = gatewayConfig?.secretKey || process.env.STRIPE_SECRET_KEY;
      if (!stripeKey) return res.json({ success: false, error: 'Stripe not configured' });
      const params = new URLSearchParams({
        'payment_method_types[0]': 'card',
        'line_items[0][price_data][currency]': currency,
        'line_items[0][price_data][product_data][name]': `Account Deposit - ${panelName}`,
        'line_items[0][price_data][unit_amount]': String(Math.round(amount * 100)),
        'line_items[0][quantity]': '1',
        'mode': 'payment',
        'success_url': `${returnUrl}?success=true&session_id={CHECKOUT_SESSION_ID}&transaction_id=${txId}`,
        'cancel_url': `${returnUrl}?cancelled=true&transaction_id=${txId}`,
        'metadata[transactionId]': txId, 'metadata[buyerId]': buyerId, 'metadata[panelId]': panelId || '',
      });
      const stripeRes = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST', headers: { Authorization: `Bearer ${stripeKey}`, 'Content-Type': 'application/x-www-form-urlencoded' }, body: params.toString(),
      });
      const session = await stripeRes.json();
      if (session.error) return res.json({ success: false, error: session.error.message });
      redirectUrl = session.url; paymentId = session.id;
      await supabase.from('transactions').update({ external_id: session.id }).eq('id', txId);
    } else if (gateway === 'paypal') {
      const { apiKey: clientId, secretKey } = gatewayConfig || {};
      if (!clientId || !secretKey) return res.json({ success: false, error: 'PayPal not configured' });
      const tokenRes = await fetch('https://api-m.paypal.com/v1/oauth2/token', {
        method: 'POST', headers: { Authorization: `Basic ${Buffer.from(`${clientId}:${secretKey}`).toString('base64')}`, 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'grant_type=client_credentials',
      });
      const tokenData = await tokenRes.json();
      if (!tokenData.access_token) return res.json({ success: false, error: 'Failed to authenticate with PayPal' });
      const orderRes = await fetch('https://api-m.paypal.com/v2/checkout/orders', {
        method: 'POST', headers: { Authorization: `Bearer ${tokenData.access_token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ intent: 'CAPTURE', purchase_units: [{ amount: { currency_code: currency.toUpperCase(), value: amount.toFixed(2) }, custom_id: txId }], application_context: { return_url: `${returnUrl}?success=true&transaction_id=${txId}`, cancel_url: `${returnUrl}?cancelled=true&transaction_id=${txId}` } }),
      });
      const ppOrder = await orderRes.json();
      if (ppOrder.error) return res.json({ success: false, error: ppOrder.error.message });
      redirectUrl = ppOrder.links?.find((l: any) => l.rel === 'approve')?.href; paymentId = ppOrder.id;
    } else if (gateway === 'flutterwave') {
      const { secretKey } = gatewayConfig || {};
      if (!secretKey) return res.json({ success: false, error: 'Flutterwave not configured' });
      const { data: buyerProfile } = await supabase.from('client_users').select('email').eq('id', buyerId).single();
      const flwRes = await fetch('https://api.flutterwave.com/v3/payments', {
        method: 'POST', headers: { Authorization: `Bearer ${secretKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ tx_ref: txId, amount, currency: currency.toUpperCase(), redirect_url: `${returnUrl}?success=true&transaction_id=${txId}`, customer: { email: buyerProfile?.email || `buyer-${buyerId}@panel.local` }, meta: { panelId, buyerId } }),
      });
      const flwData = await flwRes.json();
      if (!flwData.data?.link) return res.json({ success: false, error: flwData.message || 'Flutterwave error' });
      redirectUrl = flwData.data.link;
    } else {
      return res.json({ success: false, error: `Gateway ${gateway} not supported server-side yet` });
    }

    return res.json({ success: true, redirectUrl, paymentId, transactionId: txId });
  } catch (err: any) {
    console.error('[process-payment]', err);
    return res.json({ success: false, error: err.message });
  }
});

// ─── payment-webhook ──────────────────────────────────────────────────────────
fnRouter.post('/payment-webhook', async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    const gateway = req.query.gateway as string || 'stripe';
    const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    let event: any;
    let transactionId: string | null = null;
    let status: 'completed' | 'failed' = 'failed';
    let amount = 0;
    let buyerId: string | null = null;
    let panelId: string | null = null;

    try { event = JSON.parse(body); } catch { event = req.body; }

    if (gateway === 'stripe') {
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        transactionId = session.metadata?.transactionId;
        status = 'completed'; amount = (session.amount_total || 0) / 100;
        buyerId = session.metadata?.buyerId; panelId = session.metadata?.panelId;
      } else if (event.type === 'checkout.session.expired') {
        transactionId = event.data.object?.metadata?.transactionId; status = 'failed';
      }
    } else if (gateway === 'paypal') {
      if (event.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
        transactionId = event.resource?.purchase_units?.[0]?.custom_id; status = 'completed';
        amount = parseFloat(event.resource?.purchase_units?.[0]?.amount?.value || '0');
      }
    } else if (gateway === 'flutterwave') {
      if (event.event === 'charge.completed' && event.data?.status === 'successful') {
        transactionId = event.data.tx_ref; status = 'completed'; amount = parseFloat(event.data.amount || '0');
        panelId = event.data.meta?.panelId; buyerId = event.data.meta?.buyerId;
      }
    }

    if (!transactionId) return res.json({ received: true });

    if (status === 'completed') {
      await supabase.from('transactions').update({ status: 'completed', updated_at: new Date().toISOString() }).eq('id', transactionId);
      if (buyerId) {
        const { data: buyer } = await supabase.from('client_users').select('balance').eq('id', buyerId).single();
        if (buyer) await supabase.from('client_users').update({ balance: (buyer.balance || 0) + amount }).eq('id', buyerId);
      } else if (panelId) {
        const { data: panel } = await supabase.from('panels').select('balance').eq('id', panelId).single();
        if (panel) await supabase.from('panels').update({ balance: (panel.balance || 0) + amount }).eq('id', panelId);
      }
    } else {
      await supabase.from('transactions').update({ status: 'failed', updated_at: new Date().toISOString() }).eq('id', transactionId);
    }

    return res.json({ received: true, status });
  } catch (err: any) {
    console.error('[payment-webhook]', err);
    return res.status(500).json({ error: err.message });
  }
});

// ─── mfa-setup ────────────────────────────────────────────────────────────────
fnRouter.post('/mfa-setup', async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    const authHeader = req.headers.authorization;
    const { action, totpToken } = req.body;

    if (!authHeader) return res.status(401).json({ error: 'Authorization required' });
    const supabaseAnon = getSupabaseAnon();
    const { data: { user }, error: authErr } = await supabaseAnon.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authErr || !user) return res.status(401).json({ error: 'Invalid token' });

    if (action === 'setup') {
      const secret = crypto.randomBytes(20).toString('base64').toUpperCase().replace(/[^A-Z2-7]/g, 'A').slice(0, 32);
      await supabase.from('profiles').update({ mfa_secret: secret }).eq('user_id', user.id);
      const otpUrl = `otpauth://totp/SMM Panel:${user.email}?secret=${secret}&issuer=SMMPanel`;
      return res.json({ success: true, secret, otpUrl });
    }
    if (action === 'verify' || action === 'confirm') {
      const { data: profile } = await supabase.from('profiles').select('mfa_secret').eq('user_id', user.id).single();
      if (!profile?.mfa_secret) return res.json({ success: false, error: 'MFA not set up' });
      // Simple TOTP verification
      const totp = require('otplib');
      const isValid = totp.totp.verify({ token: totpToken, secret: profile.mfa_secret });
      if (isValid) await supabase.from('profiles').update({ mfa_enabled: true }).eq('user_id', user.id);
      return res.json({ success: isValid, error: isValid ? undefined : 'Invalid TOTP code' });
    }
    if (action === 'status') {
      const { data: profile } = await supabase.from('profiles').select('mfa_enabled').eq('user_id', user.id).single();
      return res.json({ enabled: profile?.mfa_enabled || false });
    }
    if (action === 'disable') {
      await supabase.from('profiles').update({ mfa_enabled: false, mfa_secret: null }).eq('user_id', user.id);
      return res.json({ success: true });
    }
    return res.json({ error: 'Invalid action' });
  } catch (err: any) {
    console.error('[mfa-setup]', err);
    return res.json({ error: err.message });
  }
});

// ─── currency-convert ─────────────────────────────────────────────────────────
fnRouter.post('/currency-convert', async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    const { from, to, amount, panelId } = req.body;
    const fallbackRates: Record<string, number> = { USD:1, EUR:0.92, GBP:0.79, NGN:1550, INR:83, BRL:4.97, TRY:32, RUB:92, AED:3.67, CAD:1.36, KES:129, GHS:12.5, ZAR:18.5, PKR:278, PHP:56, IDR:15800, MXN:17.2, COP:4000, ARS:850, CLP:900, PEN:3.7, EGP:31, MAD:10, THB:35, VND:24500, MYR:4.7, SGD:1.35, HKD:7.8, JPY:150, KRW:1350, CNY:7.2, AUD:1.55, NZD:1.68, CHF:0.89, SEK:10.5, NOK:10.8, DKK:6.9, PLN:4.0, UAH:37, BDT:110 };
    const fromRate = fallbackRates[from] || 1;
    const toRate = fallbackRates[to] || 1;
    const usdAmount = (amount || 1) / fromRate;
    const converted = usdAmount * toRate;
    return res.json({ success: true, from, to, amount: amount || 1, converted: parseFloat(converted.toFixed(4)), rate: toRate / fromRate });
  } catch (err: any) {
    return res.json({ success: false, error: err.message });
  }
});

// ─── domain-health-check ──────────────────────────────────────────────────────
fnRouter.post('/domain-health-check', async (req, res) => {
  try {
    const { domain } = req.body;
    if (!domain) return res.json({ success: false, error: 'Domain is required' });
    let aRecords: string[] = [];
    let cnameRecords: string[] = [];
    try {
      const aRes = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=A`, { headers: { Accept: 'application/dns-json' } });
      if (aRes.ok) { const d = await aRes.json(); aRecords = (d.Answer || []).filter((r: any) => r.type === 1).map((r: any) => r.data); }
    } catch {}
    try {
      const cRes = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=CNAME`, { headers: { Accept: 'application/dns-json' } });
      if (cRes.ok) { const d = await cRes.json(); cnameRecords = (d.Answer || []).map((r: any) => r.data); }
    } catch {}
    const vercelIps = ['76.76.21.21'];
    const isVercel = aRecords.some(ip => vercelIps.includes(ip)) || cnameRecords.some(c => c.includes('vercel'));
    return res.json({ success: true, domain, aRecords, cnameRecords, isVercel, configured: isVercel, ssl: isVercel ? 'active' : 'pending' });
  } catch (err: any) {
    return res.json({ success: false, error: err.message });
  }
});

// ─── add-vercel-domain ────────────────────────────────────────────────────────
fnRouter.post('/add-vercel-domain', async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    const { domain, panel_id } = req.body;
    if (!domain || !panel_id) return res.json({ error: 'Domain and panel_id are required' });
    const { data: configData } = await supabase.from('platform_config').select('key,value').in('key', ['vercel_token', 'vercel_project_id', 'vercel_team_id']);
    const vercelToken = configData?.find((c: any) => c.key === 'vercel_token')?.value;
    const vercelProjectId = configData?.find((c: any) => c.key === 'vercel_project_id')?.value;
    const vercelTeamId = configData?.find((c: any) => c.key === 'vercel_team_id')?.value;
    const verificationToken = crypto.randomUUID().substring(0, 16);
    await supabase.from('panel_domains').upsert({ panel_id, domain, verification_status: 'pending', verification_token: verificationToken, txt_verification_record: `homeofsmm-verify=${verificationToken}`, expected_target: '76.76.21.21', dns_configured: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }, { onConflict: 'panel_id,domain' });
    if (vercelToken && vercelProjectId) {
      let url = `https://api.vercel.com/v10/projects/${vercelProjectId}/domains`;
      if (vercelTeamId) url += `?teamId=${vercelTeamId}`;
      await fetch(url, { method: 'POST', headers: { Authorization: `Bearer ${vercelToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ name: domain }) });
    }
    return res.json({ success: true, domain, verification_token: verificationToken, dns_records: [{ type: 'A', name: '@', value: '76.76.21.21', ttl: 3600 }, { type: 'CNAME', name: 'www', value: 'cname.vercel-dns.com', ttl: 3600 }, { type: 'TXT', name: '_homeofsmm', value: `homeofsmm-verify=${verificationToken}`, ttl: 3600 }] });
  } catch (err: any) {
    return res.json({ success: false, error: err.message });
  }
});

// ─── verify-domain-dns ────────────────────────────────────────────────────────
fnRouter.post('/verify-domain-dns', async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    const { domain, panel_id } = req.body;
    if (!domain) return res.json({ success: false, error: 'Domain required' });
    const aRes = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=A`, { headers: { Accept: 'application/dns-json' } });
    const aData = await aRes.json();
    const aRecords = (aData.Answer || []).filter((r: any) => r.type === 1).map((r: any) => r.data);
    const verified = aRecords.includes('76.76.21.21');
    if (verified && panel_id) {
      await supabase.from('panel_domains').update({ verification_status: 'verified', dns_configured: true, verified_at: new Date().toISOString() }).eq('panel_id', panel_id).eq('domain', domain);
    }
    return res.json({ success: true, verified, aRecords });
  } catch (err: any) {
    return res.json({ success: false, error: err.message });
  }
});

// ─── ai-chat-reply ────────────────────────────────────────────────────────────
fnRouter.post('/ai-chat-reply', async (req, res) => {
  try {
    const { message, pageContext, panelInfo, conversationHistory } = req.body;
    if (!message) return res.status(400).json({ error: 'Message is required' });
    const apiKey = process.env.LOVABLE_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) return res.status(500).json({ error: 'AI service not configured' });
    const systemPrompt = `You are a friendly customer support assistant for "${panelInfo?.name || 'SMM Panel'}". You help customers with questions about social media marketing services. Be brief and helpful. Current page: ${pageContext || 'Homepage'}.`;
    const messages = [{ role: 'system', content: systemPrompt }, ...(conversationHistory || []).slice(-6), { role: 'user', content: message }];
    const endpoint = process.env.LOVABLE_API_KEY ? 'https://ai.gateway.lovable.dev/v1/chat/completions' : 'https://api.openai.com/v1/chat/completions';
    const model = process.env.LOVABLE_API_KEY ? 'google/gemini-2.5-flash' : 'gpt-4o-mini';
    const aiRes = await fetch(endpoint, { method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model, messages, max_tokens: 400, temperature: 0.7 }) });
    if (!aiRes.ok) return res.status(aiRes.status).json({ error: 'AI service error' });
    const data = await aiRes.json();
    return res.json({ reply: data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ─── admin-panel-ops ──────────────────────────────────────────────────────────
fnRouter.post('/admin-panel-ops', async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Missing authorization header' });
    const supabaseAnon = getSupabaseAnon();
    const { data: { user }, error: authErr } = await supabaseAnon.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authErr || !user) return res.status(401).json({ error: 'Invalid token' });
    const { data: profile } = await supabase.from('profiles').select('role').eq('user_id', user.id).single();
    if (!profile || profile.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });

    const body = req.body;
    if (body.action === 'add_funds') {
      const { panel_id, amount, type, reason } = body;
      const { data: panel } = await supabase.from('panels').select('balance,name,owner_id').eq('id', panel_id).single();
      if (!panel) return res.status(404).json({ error: 'Panel not found' });
      const adjustment = type === 'credit' ? Math.abs(amount) : -Math.abs(amount);
      const newBalance = (panel.balance || 0) + adjustment;
      if (newBalance < 0) return res.status(400).json({ error: 'Insufficient balance for debit' });
      await supabase.from('panels').update({ balance: newBalance }).eq('id', panel_id);
      await supabase.from('transactions').insert({ panel_id, type: type === 'credit' ? 'admin_credit' : 'admin_debit', amount: adjustment, status: 'completed', description: reason || `Admin ${type}`, payment_method: 'admin_adjustment' });
      return res.json({ success: true, previous_balance: panel.balance, new_balance: newBalance, adjustment, panel_name: panel.name });
    }
    if (body.action === 'bulk_update') {
      const { panel_ids, updates } = body;
      await supabase.from('panels').update(updates).in('id', panel_ids);
      return res.json({ success: true, updated_count: panel_ids.length, updates });
    }
    if (body.action === 'update_subscription') {
      const { panel_id, operation, new_plan, extend_days } = body;
      const { data: sub } = await supabase.from('panel_subscriptions').select('*').eq('panel_id', panel_id).single();
      if (!sub) return res.status(404).json({ error: 'Subscription not found' });
      const updates: Record<string, any> = {};
      if (operation === 'upgrade' || operation === 'downgrade') { updates.plan_type = new_plan; updates.status = 'active'; }
      else if (operation === 'extend' && extend_days) { const d = new Date(sub.expires_at || new Date()); d.setDate(d.getDate() + extend_days); updates.expires_at = d.toISOString(); updates.status = 'active'; }
      else if (operation === 'cancel') { updates.status = 'cancelled'; updates.expires_at = new Date().toISOString(); }
      await supabase.from('panel_subscriptions').update(updates).eq('id', sub.id);
      return res.json({ success: true, operation, new_plan: updates.plan_type || sub.plan_type });
    }
    return res.status(400).json({ error: 'Invalid action' });
  } catch (err: any) {
    console.error('[admin-panel-ops]', err);
    return res.status(500).json({ error: err.message });
  }
});

// ─── panel-customers ──────────────────────────────────────────────────────────
fnRouter.post('/panel-customers', async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    const { action, panelId, customer } = req.body;
    if (!panelId) return res.status(400).json({ error: 'Panel ID required' });
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Authorization required' });
    const supabaseAnon = getSupabaseAnon();
    const { data: { user }, error: authErr } = await supabaseAnon.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authErr || !user) return res.status(401).json({ error: 'Invalid token' });

    if (action === 'create') {
      const { email, password, fullName, username } = customer;
      if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
      const hashed = await hashPassword(password);
      const { data: newCustomer, error: insertErr } = await supabase.from('client_users').insert({ email: email.toLowerCase(), full_name: fullName || null, username: username || null, password_hash: hashed, panel_id: panelId, is_active: true, is_banned: false, balance: 0 }).select().single();
      if (insertErr) return res.status(400).json({ error: insertErr.message });
      const { password_hash, password_temp, ...safe } = newCustomer;
      return res.json({ success: true, customer: safe });
    }
    if (action === 'update') {
      const { customerId, ...updates } = customer;
      if (updates.password) { updates.password_hash = await hashPassword(updates.password); delete updates.password; }
      const { data: updated } = await supabase.from('client_users').update(updates).eq('id', customerId).eq('panel_id', panelId).select().single();
      return res.json({ success: true, customer: updated });
    }
    return res.status(400).json({ error: 'Invalid action' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ─── import-provider-services ─────────────────────────────────────────────────
fnRouter.post('/import-provider-services', async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    const { providerId, panelId } = req.body;
    if (!providerId) return res.status(400).json({ error: 'Provider ID required' });
    const { data: provider } = await supabase.from('providers').select('*').eq('id', providerId).single();
    if (!provider) return res.status(404).json({ error: 'Provider not found' });
    const fd = new URLSearchParams({ key: provider.api_key, action: 'services' });
    const apiRes = await fetch(provider.api_endpoint, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: fd.toString() });
    const services = await apiRes.json();
    if (!Array.isArray(services)) return res.json({ success: false, error: 'Invalid provider response', raw: services });
    let stored = 0;
    for (const svc of services.slice(0, 500)) {
      try {
        await supabase.from('provider_services').upsert({ provider_id: providerId, provider_service_id: String(svc.service), name: svc.name, category: svc.category || 'other', rate: parseFloat(String(svc.rate)) || 0, min_quantity: parseInt(String(svc.min)) || 10, max_quantity: parseInt(String(svc.max)) || 10000, description: svc.desc || '', refill: svc.refill === true || svc.refill === 'true' || svc.refill === 1, cancel: svc.cancel === true || svc.cancel === 'true' || svc.cancel === 1 }, { onConflict: 'provider_id,provider_service_id' });
        stored++;
      } catch {}
    }
    return res.json({ success: true, providerId, totalFetched: services.length, rawStored: stored });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// ─── provider-balance ─────────────────────────────────────────────────────────
fnRouter.post('/provider-balance', async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    const { providerId } = req.body;
    const { data: provider } = await supabase.from('providers').select('*').eq('id', providerId).single();
    if (!provider) return res.json({ success: false, error: 'Provider not found' });
    const fd = new URLSearchParams({ key: provider.api_key, action: 'balance' });
    const apiRes = await fetch(provider.api_endpoint, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: fd.toString() });
    const data = await apiRes.json();
    return res.json({ success: true, balance: data.balance, currency: data.currency });
  } catch (err: any) {
    return res.json({ success: false, error: err.message });
  }
});

// ─── provider-services ────────────────────────────────────────────────────────
fnRouter.post('/provider-services', async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    const { providerId } = req.body;
    const { data: provider } = await supabase.from('providers').select('*').eq('id', providerId).single();
    if (!provider) return res.json({ success: false, error: 'Provider not found' });
    const fd = new URLSearchParams({ key: provider.api_key, action: 'services' });
    const apiRes = await fetch(provider.api_endpoint, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: fd.toString() });
    const services = await apiRes.json();
    return res.json({ success: true, services: Array.isArray(services) ? services : [] });
  } catch (err: any) {
    return res.json({ success: false, error: err.message });
  }
});

// ─── track-order ──────────────────────────────────────────────────────────────
fnRouter.post('/track-order', async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    const { orderNumber, panelId } = req.body;
    if (!orderNumber) return res.json({ success: false, error: 'Order number required' });
    let q = supabase.from('orders').select('*,services(name,category)').eq('order_number', orderNumber);
    if (panelId) q = q.eq('panel_id', panelId);
    const { data: order } = await q.maybeSingle();
    if (!order) return res.json({ success: false, error: 'Order not found' });
    return res.json({ success: true, order });
  } catch (err: any) {
    return res.json({ success: false, error: err.message });
  }
});

// ─── generate-service-description ────────────────────────────────────────────
fnRouter.post('/generate-service-description', async (req, res) => {
  try {
    const { serviceName, category } = req.body;
    const apiKey = process.env.LOVABLE_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) return res.json({ description: `High-quality ${serviceName} service. Fast delivery and great results.` });
    const endpoint = process.env.LOVABLE_API_KEY ? 'https://ai.gateway.lovable.dev/v1/chat/completions' : 'https://api.openai.com/v1/chat/completions';
    const model = process.env.LOVABLE_API_KEY ? 'google/gemini-2.5-flash' : 'gpt-4o-mini';
    const aiRes = await fetch(endpoint, { method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model, messages: [{ role: 'user', content: `Write a brief, compelling 2-sentence product description for this SMM service: "${serviceName}" (category: ${category}). Be specific and persuasive.` }], max_tokens: 100 }) });
    const data = await aiRes.json();
    return res.json({ description: data.choices?.[0]?.message?.content || `High-quality ${serviceName} service.` });
  } catch (err: any) {
    return res.json({ description: `High-quality service. Fast delivery guaranteed.` });
  }
});

// ─── generate-sitemap ─────────────────────────────────────────────────────────
fnRouter.post('/generate-sitemap', async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    const { panelId, domain } = req.body;
    const { data: panel } = await supabase.from('panels').select('name,subdomain,custom_domain').eq('id', panelId).single();
    const baseUrl = domain || (panel?.custom_domain ? `https://${panel.custom_domain}` : `https://${panel?.subdomain}.homeofsmm.com`);
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${baseUrl}/</loc><changefreq>daily</changefreq><priority>1.0</priority></url><url><loc>${baseUrl}/services</loc><changefreq>daily</changefreq><priority>0.9</priority></url></urlset>`;
    return res.json({ success: true, sitemap });
  } catch (err: any) {
    return res.json({ success: false, error: err.message });
  }
});

// ─── generate-robots ──────────────────────────────────────────────────────────
fnRouter.post('/generate-robots', async (req, res) => {
  try {
    const { domain, disallowPaths } = req.body;
    const baseUrl = domain || 'https://homeofsmm.com';
    const disallow = (disallowPaths || ['/admin', '/panel']).map((p: string) => `Disallow: ${p}`).join('\n');
    const robots = `User-agent: *\n${disallow}\nSitemap: ${baseUrl}/sitemap.xml`;
    return res.json({ success: true, robots });
  } catch (err: any) {
    return res.json({ success: false, error: err.message });
  }
});

// ─── save-platform-config ─────────────────────────────────────────────────────
fnRouter.post('/save-platform-config', async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Authorization required' });
    const supabaseAnon = getSupabaseAnon();
    const { data: { user }, error: authErr } = await supabaseAnon.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authErr || !user) return res.status(401).json({ error: 'Invalid token' });
    const { configs } = req.body;
    if (!Array.isArray(configs)) return res.status(400).json({ error: 'configs must be an array' });
    for (const { key, value } of configs) {
      await supabase.from('platform_config').upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
    }
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ─── send-notification ────────────────────────────────────────────────────────
fnRouter.post('/send-notification', async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    const { panelId, userId, title, message, type } = req.body;
    await supabase.from('panel_notifications').insert({ panel_id: panelId, user_id: userId, title, message, type: type || 'info' });
    return res.json({ success: true });
  } catch (err: any) {
    return res.json({ success: false, error: err.message });
  }
});

// ─── webhook-notify ───────────────────────────────────────────────────────────
fnRouter.post('/webhook-notify', async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    const { panelId, event, payload } = req.body;
    const { data: webhooks } = await supabase.from('admin_webhooks').select('*').eq('is_active', true);
    const results = [];
    for (const wh of webhooks || []) {
      if (!wh.events?.includes(event)) continue;
      try {
        const whRes = await fetch(wh.url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(wh.secret ? { 'X-Webhook-Secret': wh.secret } : {}) }, body: JSON.stringify({ event, payload, panelId, timestamp: new Date().toISOString() }) });
        results.push({ id: wh.id, status: whRes.status, success: whRes.ok });
        await supabase.from('admin_webhooks').update({ last_status: whRes.status, last_triggered_at: new Date().toISOString() }).eq('id', wh.id);
      } catch (whErr: any) {
        results.push({ id: wh.id, error: whErr.message });
      }
    }
    return res.json({ success: true, results });
  } catch (err: any) {
    return res.json({ success: false, error: err.message });
  }
});

// ─── team-auth ────────────────────────────────────────────────────────────────
fnRouter.post('/team-auth', async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    const { action, panelId, email, role } = req.body;
    if (action === 'invite') {
      const { data: panel } = await supabase.from('panels').select('name,owner_id').eq('id', panelId).single();
      return res.json({ success: true, message: `Invitation sent to ${email}` });
    }
    const { data: members } = await supabase.from('team_members').select('*').eq('panel_id', panelId);
    return res.json({ success: true, members: members || [] });
  } catch (err: any) {
    return res.json({ success: false, error: err.message });
  }
});

// ─── update-security-settings ─────────────────────────────────────────────────
fnRouter.post('/update-security-settings', async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Authorization required' });
    const supabaseAnon = getSupabaseAnon();
    const { data: { user } } = await supabaseAnon.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) return res.status(401).json({ error: 'Invalid token' });
    const { panelId, settings } = req.body;
    const { data: panel } = await supabase.from('panels').select('settings').eq('id', panelId).single();
    const updated = { ...(panel?.settings as any || {}), security: settings };
    await supabase.from('panels').update({ settings: updated }).eq('id', panelId);
    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// ─── categorize-others ────────────────────────────────────────────────────────
fnRouter.post('/categorize-others', async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    const { serviceIds, panelId } = req.body;
    const apiKey = process.env.LOVABLE_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey || !serviceIds?.length) return res.json({ success: false, error: 'AI key or services missing' });
    const { data: services } = await supabase.from('services').select('id,name').in('id', serviceIds).eq('panel_id', panelId);
    let categorized = 0;
    for (const svc of services || []) {
      const cats = ['instagram','facebook','twitter','youtube','tiktok','telegram','linkedin','other'];
      const detected = cats.find(c => svc.name.toLowerCase().includes(c)) || 'other';
      await supabase.from('services').update({ category: detected }).eq('id', svc.id);
      categorized++;
    }
    return res.json({ success: true, categorized });
  } catch (err: any) {
    return res.json({ success: false, error: err.message });
  }
});

// ─── sync-provider-services ───────────────────────────────────────────────────
fnRouter.post('/sync-provider-services', async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    const { panelId, providerId } = req.body;
    const { data: provider } = await supabase.from('providers').select('*').eq('id', providerId).single();
    if (!provider) return res.json({ success: false, error: 'Provider not found' });
    const fd = new URLSearchParams({ key: provider.api_key, action: 'services' });
    const apiRes = await fetch(provider.api_endpoint, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: fd.toString() });
    const services = await apiRes.json();
    let synced = 0;
    if (Array.isArray(services)) {
      for (const svc of services.slice(0, 500)) {
        await supabase.from('provider_services').upsert({ provider_id: providerId, provider_service_id: String(svc.service), name: svc.name, rate: parseFloat(String(svc.rate)) || 0, min_quantity: parseInt(String(svc.min)) || 10, max_quantity: parseInt(String(svc.max)) || 10000 }, { onConflict: 'provider_id,provider_service_id' }).catch(() => {});
        synced++;
      }
    }
    return res.json({ success: true, synced });
  } catch (err: any) {
    return res.json({ success: false, error: err.message });
  }
});

// ─── enable-direct-provider ───────────────────────────────────────────────────
fnRouter.post('/enable-direct-provider', async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    const { panelId, providerId, enabled } = req.body;
    await supabase.from('panel_providers').upsert({ panel_id: panelId, provider_id: providerId, is_enabled: enabled }, { onConflict: 'panel_id,provider_id' });
    return res.json({ success: true });
  } catch (err: any) {
    return res.json({ success: false, error: err.message });
  }
});

// ─── enhance-seo-text ─────────────────────────────────────────────────────────
fnRouter.post('/enhance-seo-text', async (req, res) => {
  try {
    const { text, context } = req.body;
    const apiKey = process.env.LOVABLE_API_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) return res.json({ enhanced: text });
    const endpoint = process.env.LOVABLE_API_KEY ? 'https://ai.gateway.lovable.dev/v1/chat/completions' : 'https://api.openai.com/v1/chat/completions';
    const model = process.env.LOVABLE_API_KEY ? 'google/gemini-2.5-flash' : 'gpt-4o-mini';
    const aiRes = await fetch(endpoint, { method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model, messages: [{ role: 'user', content: `Enhance this SEO text for an SMM panel website. Keep it concise and compelling:\n\n"${text}"` }], max_tokens: 200 }) });
    const data = await aiRes.json();
    return res.json({ enhanced: data.choices?.[0]?.message?.content || text });
  } catch {
    return res.json({ enhanced: req.body.text });
  }
});

// ─── generate-theme ───────────────────────────────────────────────────────────
fnRouter.post('/generate-theme', async (req, res) => {
  try {
    const { style, primaryColor } = req.body;
    return res.json({ success: true, theme: { primary: primaryColor || '#7c3aed', style: style || 'modern', generated: true } });
  } catch (err: any) {
    return res.json({ success: false, error: err.message });
  }
});

// ─── generate-invoice-pdf ─────────────────────────────────────────────────────
fnRouter.post('/generate-invoice-pdf', async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    const { orderId, transactionId } = req.body;
    return res.json({ success: true, message: 'Invoice generation requires PDF library. Returning order data.', orderId, transactionId });
  } catch (err: any) {
    return res.json({ success: false, error: err.message });
  }
});

// ─── normalize-services ───────────────────────────────────────────────────────
fnRouter.post('/normalize-services', async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    const { panelId, providerId } = req.body;
    const { data: providerServices } = await supabase.from('provider_services').select('*').eq('provider_id', providerId);
    let normalized = 0;
    for (const svc of providerServices || []) {
      const cats = ['instagram','facebook','twitter','youtube','tiktok','telegram','linkedin','spotify','discord','twitch'];
      const cat = cats.find(c => svc.name?.toLowerCase().includes(c)) || 'other';
      await supabase.from('normalized_services').upsert({ provider_id: providerId, provider_service_id: svc.provider_service_id, name: svc.name, category: cat, rate: svc.rate, min_quantity: svc.min_quantity, max_quantity: svc.max_quantity }, { onConflict: 'provider_id,provider_service_id' }).catch(() => {});
      normalized++;
    }
    return res.json({ success: true, normalized });
  } catch (err: any) {
    return res.json({ success: false, error: err.message });
  }
});

// ─── panel-api ────────────────────────────────────────────────────────────────
fnRouter.post('/panel-api', async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    const params = req.body;
    const { key, action } = params;
    if (!key) return res.json({ success: false, error: 'API key required' });
    const { data: apiKeyData } = await supabase.from('panel_api_keys').select('panel_id,panel_owner_id').eq('api_key', key).eq('is_active', true).single();
    if (!apiKeyData) return res.json({ success: false, error: 'Invalid API key' });
    const panelId = apiKeyData.panel_id;
    if (action === 'services') {
      const { data: services } = await supabase.from('services').select('*').eq('panel_id', panelId).eq('is_active', true);
      return res.json(services || []);
    }
    if (action === 'orders') {
      const { data: orders } = await supabase.from('orders').select('*').eq('panel_id', panelId).limit(params.limit || 50).range(params.offset || 0, (params.offset || 0) + (params.limit || 50) - 1);
      return res.json({ success: true, orders: orders || [] });
    }
    return res.json({ success: false, error: 'Unknown action' });
  } catch (err: any) {
    return res.json({ success: false, error: err.message });
  }
});

// ─── admin-data ──────────────────────────────────────────────────────────────
fnRouter.post('/admin-data', async (req, res) => {
  try {
    const supabase = getSupabaseAdmin();
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Authorization required' });
    }
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('user_id', user.id)
      .single();

    if (!profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .in('role', ['admin', 'super_admin'])
        .limit(1);
      if (!roleData || roleData.length === 0) {
        return res.status(403).json({ success: false, error: 'Admin access required' });
      }
    }

    const { action } = req.body;

    if (action === 'get_panels') {
      const { data: panelsData } = await supabase
        .from('panels')
        .select(`
          *,
          owner:profiles!panels_owner_id_fkey(email, full_name),
          subscription:panel_subscriptions(plan_type, status)
        `)
        .order('created_at', { ascending: false });

      if (panelsData) {
        const panelIds = panelsData.map((p: any) => p.id);
        const [servicesRes, providersRes] = await Promise.all([
          supabase.from('services').select('panel_id').in('panel_id', panelIds),
          supabase.from('providers').select('panel_id').in('panel_id', panelIds)
        ]);

        const serviceCounts = (servicesRes.data || []).reduce((acc: Record<string, number>, s: any) => {
          acc[s.panel_id] = (acc[s.panel_id] || 0) + 1;
          return acc;
        }, {});

        const providerCounts = (providersRes.data || []).reduce((acc: Record<string, number>, p: any) => {
          acc[p.panel_id] = (acc[p.panel_id] || 0) + 1;
          return acc;
        }, {});

        const enrichedPanels = panelsData.map((p: any) => ({
          ...p,
          subscription: Array.isArray(p.subscription) ? p.subscription[0] : p.subscription,
          _serviceCount: serviceCounts[p.id] || 0,
          _providerCount: providerCounts[p.id] || 0
        }));

        return res.json({ success: true, data: enrichedPanels });
      }
      return res.json({ success: true, data: [] });
    }

    if (action === 'get_panel_stats') {
      const { panelId } = req.body;
      if (!panelId) return res.json({ success: false, error: 'panelId required' });
      const [servicesRes, ordersRes, clientsRes] = await Promise.all([
        supabase.from('services').select('id', { count: 'exact' }).eq('panel_id', panelId),
        supabase.from('orders').select('id', { count: 'exact' }).eq('panel_id', panelId),
        supabase.from('client_users').select('id', { count: 'exact' }).eq('panel_id', panelId)
      ]);
      return res.json({
        success: true,
        data: {
          services: servicesRes.count || 0,
          orders: ordersRes.count || 0,
          clients: clientsRes.count || 0
        }
      });
    }

    if (action === 'get_panel_finance') {
      const { panelId } = req.body;
      if (!panelId) return res.json({ success: false, error: 'panelId required' });

      const [depositsRes, ordersRes, txRes, subRes] = await Promise.all([
        supabase.from('transactions').select('amount').eq('panel_id', panelId).eq('type', 'deposit').eq('status', 'completed'),
        supabase.from('orders').select('price, provider_cost').eq('panel_id', panelId),
        supabase.from('transactions').select('*').eq('panel_id', panelId).order('created_at', { ascending: false }).limit(10),
        supabase.from('panel_subscriptions').select('*').eq('panel_id', panelId).maybeSingle()
      ]);

      const totalDeposits = (depositsRes.data || []).reduce((sum: number, d: any) => sum + (Number(d.amount) || 0), 0);
      const totalOrderAmount = (ordersRes.data || []).reduce((sum: number, o: any) => sum + (Number(o.price) || 0), 0);
      const profitFromOrders = (ordersRes.data || []).reduce((sum: number, o: any) => sum + ((Number(o.price) || 0) - (Number(o.provider_cost) || 0)), 0);

      return res.json({
        success: true,
        data: {
          totalDeposits,
          totalOrderAmount,
          profitFromOrders,
          transactions: txRes.data || [],
          subscription: subRes.data || null
        }
      });
    }

    if (action === 'get_overview_stats') {
      const [panelsRes, usersRes, settingsRes, activityRes, depositsRes] = await Promise.all([
        supabase.from('panels').select('*, owner:profiles!panels_owner_id_fkey(email, full_name)').order('created_at', { ascending: false }),
        supabase.from('profiles').select('id, is_active, created_at'),
        supabase.from('platform_settings').select('*'),
        supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(10),
        supabase.from('transactions').select('*, panel:panels(id, name, subdomain)').eq('type', 'deposit').order('created_at', { ascending: false }).limit(10)
      ]);

      const panels = panelsRes.data || [];
      const activeUsers = (usersRes.data || []).filter((u: any) => u.is_active).length;
      const totalRevenue = panels.reduce((sum: number, p: any) => sum + (p.monthly_revenue || 0), 0);

      let securityScore = 60;
      const allSettings = settingsRes.data || [];
      const securitySetting = allSettings.find((s: any) => s.setting_key === 'security');
      if (securitySetting?.setting_value) {
        const sv = securitySetting.setting_value;
        if (sv.enforce_2fa) securityScore += 10;
        if (sv.password_min_length >= 12) securityScore += 10;
        if (sv.rate_limit_enabled) securityScore += 10;
        if (sv.ip_whitelist_enabled) securityScore += 10;
      } else {
        allSettings.forEach((s: any) => {
          const v = s.setting_value;
          if (s.setting_key === 'enforce_2fa' && v === true) securityScore += 10;
          if (s.setting_key === 'password_min_length' && typeof v === 'number' && v >= 12) securityScore += 10;
          if (s.setting_key === 'rate_limit_enabled' && v === true) securityScore += 10;
          if (s.setting_key === 'ip_whitelist_enabled' && v === true) securityScore += 10;
        });
      }

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

      const allUsers = usersRes.data || [];
      const totalUsers = allUsers.length;
      const recentUsers = allUsers.filter((u: any) => u.created_at && new Date(u.created_at) >= thirtyDaysAgo).length;
      const prevUsers = allUsers.filter((u: any) => u.created_at && new Date(u.created_at) >= sixtyDaysAgo && new Date(u.created_at) < thirtyDaysAgo).length;

      return res.json({
        success: true,
        data: {
          stats: {
            totalPanels: panels.length,
            activeUsers,
            totalUsers,
            recentUsers,
            prevUsers,
            platformRevenue: totalRevenue,
            pendingPanels: panels.filter((p: any) => p.status === 'pending').length,
            activePanels: panels.filter((p: any) => p.status === 'active').length,
            suspendedPanels: panels.filter((p: any) => p.status === 'suspended').length,
            securityScore
          },
          recentPanels: panels.slice(0, 20),
          recentActivity: activityRes.data || [],
          recentDeposits: depositsRes.data || []
        }
      });
    }

    if (action === 'get_transactions') {
      const { data: txData } = await supabase
        .from('transactions')
        .select(`
          *,
          panel:panels(
            id, name, subdomain,
            owner:profiles!panels_owner_id_fkey(email, full_name)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(500);

      const { data: panelData } = await supabase
        .from('panels')
        .select('id, name, balance')
        .order('name');

      const { data: feeData } = await supabase
        .from('platform_fees')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      return res.json({
        success: true,
        data: {
          transactions: txData || [],
          panels: panelData || [],
          platformFees: feeData || []
        }
      });
    }

    if (action === 'get_health') {
      const startTime = performance.now();
      const [panelResult, userResult, orderResult] = await Promise.all([
        supabase.from('panels').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('*', { count: 'exact', head: true })
      ]);
      const dbResponseTime = performance.now() - startTime;

      const { data: logs } = await supabase
        .from('system_health_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      let authStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
      let authResponseTime = 0;
      try {
        const authStart = performance.now();
        await supabase.auth.getSession();
        authResponseTime = performance.now() - authStart;
        authStatus = authResponseTime < 300 ? 'healthy' : authResponseTime < 600 ? 'warning' : 'critical';
      } catch {
        authStatus = 'critical';
        authResponseTime = 9999;
      }

      const dbStatus = panelResult.error || userResult.error || orderResult.error ? 'critical' :
        dbResponseTime < 200 ? 'healthy' : dbResponseTime < 500 ? 'warning' : 'critical';

      const totalLogs = (logs || []).length;
      const healthyLogs = (logs || []).filter((l: any) => l.status === 'healthy').length;
      const dbUptime = totalLogs > 0 ? ((healthyLogs / totalLogs) * 100).toFixed(2) + '%' : '99.9%';

      return res.json({
        success: true,
        data: {
          dbResponseTime: Math.round(dbResponseTime),
          dbStatus,
          authStatus,
          authResponseTime: Math.round(authResponseTime),
          panelCount: panelResult.count || 0,
          userCount: userResult.count || 0,
          orderCount: orderResult.count || 0,
          dbUptime,
          healthLogs: logs || [],
          errors: {
            panels: panelResult.error?.message || null,
            users: userResult.error?.message || null,
            orders: orderResult.error?.message || null
          }
        }
      });
    }

    if (action === 'get_tickets') {
      const { data: ticketsData } = await supabase
        .from('support_tickets')
        .select(`
          *,
          user:profiles!support_tickets_user_id_fkey(email, full_name),
          panel:panels(name)
        `)
        .order('created_at', { ascending: false });

      return res.json({ success: true, data: ticketsData || [] });
    }

    if (action === 'get_quick_replies') {
      const { data } = await supabase
        .from('platform_settings')
        .select('setting_value')
        .eq('setting_key', 'quick_replies')
        .maybeSingle();

      return res.json({ success: true, data: data?.setting_value || null });
    }

    return res.json({ success: false, error: 'Unknown action' });
  } catch (err: any) {
    console.error('[admin-data] Error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// Mount the functions router
app.use('/functions/v1', fnRouter);

// ─── Also support old supabase function URL pattern for compatibility ──────────
app.use('/rest/v1', (_req, res) => res.status(404).json({ error: 'Use Supabase client for REST API' }));

app.listen(PORT, () => {
  console.log(`[server] Express API running on port ${PORT}`);
});

export default app;
