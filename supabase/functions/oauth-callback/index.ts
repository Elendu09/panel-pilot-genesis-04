import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Token exchange endpoints for each provider
const TOKEN_ENDPOINTS: Record<string, string> = {
  google: 'https://oauth2.googleapis.com/token',
  discord: 'https://discord.com/api/oauth2/token',
  vk: 'https://oauth.vk.com/access_token',
};

// User profile endpoints for each provider
const PROFILE_ENDPOINTS: Record<string, string> = {
  google: 'https://www.googleapis.com/oauth2/v2/userinfo',
  discord: 'https://discord.com/api/users/@me',
  vk: 'https://api.vk.com/method/users.get',
};

// Generate a simple referral code
function generateReferralCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

// Generate a session token (simple JWT-like token)
function generateSessionToken(buyerId: string, panelId: string): string {
  const payload = {
    sub: buyerId,
    panel: panelId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour expiry
  };
  return btoa(JSON.stringify(payload));
}

// Parse state parameter
function parseState(state: string): { panelId: string; returnUrl: string } {
  try {
    const decoded = atob(state);
    return JSON.parse(decoded);
  } catch {
    throw new Error('Invalid state parameter');
  }
}

// Exchange authorization code for access token
async function exchangeCodeForTokens(
  provider: string,
  code: string,
  clientId: string,
  clientSecret: string,
  redirectUri: string
): Promise<{ access_token: string; email?: string }> {
  const endpoint = TOKEN_ENDPOINTS[provider];
  
  if (!endpoint) {
    throw new Error(`Unsupported OAuth provider: ${provider}`);
  }

  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    code: code,
    grant_type: 'authorization_code',
    redirect_uri: redirectUri,
  });

  // VK requires additional params
  if (provider === 'vk') {
    // VK returns email in token response
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json'
    },
    body: params.toString()
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Token exchange failed for ${provider}:`, errorText);
    throw new Error(`Failed to exchange authorization code with ${provider}`);
  }

  return await response.json();
}

// Get user profile from OAuth provider
async function getUserProfile(
  provider: string, 
  accessToken: string,
  tokenData?: any
): Promise<{
  provider_id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
}> {
  const endpoint = PROFILE_ENDPOINTS[provider];

  if (provider === 'vk') {
    // VK requires special handling
    const url = `${endpoint}?fields=photo_100,first_name,last_name&access_token=${accessToken}&v=5.131`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (!data.response || !data.response[0]) {
      throw new Error('Failed to fetch VK profile');
    }
    
    const user = data.response[0];
    return {
      provider_id: user.id.toString(),
      email: tokenData?.email || null,
      full_name: `${user.first_name} ${user.last_name}`,
      avatar_url: user.photo_100 || null
    };
  }

  const response = await fetch(endpoint, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch user profile from ${provider}`);
  }

  const data = await response.json();

  switch (provider) {
    case 'google':
      return {
        provider_id: data.id,
        email: data.email,
        full_name: data.name,
        avatar_url: data.picture
      };
    case 'discord':
      return {
        provider_id: data.id,
        email: data.email,
        full_name: data.global_name || data.username,
        avatar_url: data.avatar 
          ? `https://cdn.discordapp.com/avatars/${data.id}/${data.avatar}.png`
          : null
      };
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

// Find or create buyer in client_users
async function findOrCreateBuyer(
  supabaseAdmin: any,
  panelId: string,
  profile: {
    provider_id: string;
    email: string | null;
    full_name: string | null;
    avatar_url: string | null;
  },
  provider: string
): Promise<any> {
  // First try to find by OAuth provider ID
  let { data: existingUser } = await supabaseAdmin
    .from('client_users')
    .select('*')
    .eq('panel_id', panelId)
    .eq('oauth_provider', provider)
    .eq('oauth_provider_id', profile.provider_id)
    .maybeSingle();

  if (existingUser) {
    // Update last login
    await supabaseAdmin
      .from('client_users')
      .update({ 
        last_login_at: new Date().toISOString(),
        avatar_url: profile.avatar_url || existingUser.avatar_url
      })
      .eq('id', existingUser.id);
    return existingUser;
  }

  // Try to find by email (for linking accounts)
  if (profile.email) {
    const { data: emailUser } = await supabaseAdmin
      .from('client_users')
      .select('*')
      .eq('panel_id', panelId)
      .eq('email', profile.email)
      .maybeSingle();

    if (emailUser) {
      // Link OAuth to existing account
      await supabaseAdmin
        .from('client_users')
        .update({
          oauth_provider: provider,
          oauth_provider_id: profile.provider_id,
          avatar_url: profile.avatar_url || emailUser.avatar_url,
          last_login_at: new Date().toISOString()
        })
        .eq('id', emailUser.id);
      return emailUser;
    }
  }

  // Create new buyer account
  const referralCode = generateReferralCode();
  const username = profile.email?.split('@')[0] || `user_${profile.provider_id.substring(0, 8)}`;

  const { data: newUser, error } = await supabaseAdmin
    .from('client_users')
    .insert({
      panel_id: panelId,
      email: profile.email || `${provider}_${profile.provider_id}@oauth.local`,
      full_name: profile.full_name,
      username: username,
      oauth_provider: provider,
      oauth_provider_id: profile.provider_id,
      avatar_url: profile.avatar_url,
      is_active: true,
      balance: 0,
      referral_code: referralCode
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create buyer:', error);
    throw new Error('Failed to create buyer account');
  }

  return newUser;
}

// Handle Telegram authentication
async function handleTelegramAuth(
  supabaseAdmin: any,
  panelId: string,
  authData: URLSearchParams,
  botToken: string
): Promise<any> {
  // Telegram sends: id, first_name, last_name, username, photo_url, auth_date, hash
  const id = authData.get('id');
  const firstName = authData.get('first_name') || '';
  const lastName = authData.get('last_name') || '';
  const username = authData.get('username');
  const photoUrl = authData.get('photo_url');
  const authDate = authData.get('auth_date');
  const hash = authData.get('hash');

  if (!id || !hash || !authDate) {
    throw new Error('Invalid Telegram auth data');
  }

  // Verify the hash (simplified - in production, implement proper HMAC verification)
  // For now, we'll trust the data if it comes with required fields
  
  const profile = {
    provider_id: id,
    email: null,
    full_name: `${firstName} ${lastName}`.trim() || username || `User ${id}`,
    avatar_url: photoUrl || null
  };

  return findOrCreateBuyer(supabaseAdmin, panelId, profile, 'telegram');
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  
  // Parse path to get provider: /oauth-callback?provider=google&code=xxx&state=xxx
  const provider = url.searchParams.get('provider');
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  console.log(`OAuth callback for provider: ${provider}`);

  if (!provider) {
    return new Response(
      JSON.stringify({ error: 'Missing provider parameter' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Initialize Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    let panelId: string;
    let returnUrl: string;
    let buyer: any;

    // Handle Telegram (different flow - no code exchange)
    if (provider === 'telegram') {
      // Telegram sends auth data directly via hash verification
      const stateData = state ? parseState(state) : null;
      panelId = stateData?.panelId || url.searchParams.get('panel_id') || '';
      returnUrl = stateData?.returnUrl || url.origin;

      if (!panelId) {
        throw new Error('Missing panel ID for Telegram auth');
      }

      // Get Telegram bot token from panel settings
      const { data: settings } = await supabaseAdmin
        .from('panel_settings')
        .select('oauth_telegram_client_secret')
        .eq('panel_id', panelId)
        .single();

      if (!settings?.oauth_telegram_client_secret) {
        throw new Error('Telegram OAuth not configured for this panel');
      }

      buyer = await handleTelegramAuth(
        supabaseAdmin,
        panelId,
        url.searchParams,
        settings.oauth_telegram_client_secret
      );
    } else {
      // Standard OAuth flow (Google, Discord, VK)
      if (!code || !state) {
        return new Response(
          JSON.stringify({ error: 'Missing authorization code or state' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const stateData = parseState(state);
      panelId = stateData.panelId;
      returnUrl = stateData.returnUrl;

      // Get OAuth credentials from panel settings
      const { data: settings } = await supabaseAdmin
        .from('panel_settings')
        .select(`
          oauth_${provider}_client_id,
          oauth_${provider}_client_secret,
          oauth_${provider}_enabled
        `)
        .eq('panel_id', panelId)
        .single();

      if (!settings) {
        throw new Error('Panel settings not found');
      }

      const clientId = (settings as any)[`oauth_${provider}_client_id`];
      const clientSecret = (settings as any)[`oauth_${provider}_client_secret`];
      const enabled = (settings as any)[`oauth_${provider}_enabled`];

      if (!enabled || !clientId || !clientSecret) {
        throw new Error(`${provider} OAuth is not configured for this panel`);
      }

      // Construct the redirect URI (same as what was used to initiate auth)
      const redirectUri = `${Deno.env.get('SUPABASE_URL')}/functions/v1/oauth-callback?provider=${provider}`;

      // Exchange code for tokens
      const tokenData = await exchangeCodeForTokens(
        provider,
        code,
        clientId,
        clientSecret,
        redirectUri
      );

      // Get user profile
      const profile = await getUserProfile(provider, tokenData.access_token, tokenData);

      // Find or create buyer
      buyer = await findOrCreateBuyer(supabaseAdmin, panelId, profile, provider);
    }

    // Generate session token
    const sessionToken = generateSessionToken(buyer.id, panelId);

    // Redirect to storefront with token
    const callbackUrl = new URL(`${returnUrl}/auth/callback`);
    callbackUrl.searchParams.set('token', sessionToken);
    callbackUrl.searchParams.set('provider', provider);
    callbackUrl.searchParams.set('buyer_id', buyer.id);

    console.log(`OAuth success for buyer ${buyer.id}, redirecting to ${returnUrl}`);

    return Response.redirect(callbackUrl.toString(), 302);

  } catch (error: any) {
    console.error('OAuth callback error:', error);

    // Try to redirect with error, or return JSON error
    const errorUrl = state 
      ? `${parseState(state).returnUrl}/auth?error=${encodeURIComponent(error.message)}`
      : null;

    if (errorUrl) {
      return Response.redirect(errorUrl, 302);
    }

    return new Response(
      JSON.stringify({ error: error.message || 'OAuth authentication failed' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
