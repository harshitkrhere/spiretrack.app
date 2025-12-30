import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const RESERVED_USERNAMES = [
  "admin", "support", "root", "system", "owner", "spire", "team", "staff", "null", "undefined",
  "api", "dashboard", "settings", "profile", "login", "signup", "register", "auth", "user"
];

const USERNAME_REGEX = /^[a-z0-9._]{3,30}$/;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Admin client for checking existence without RLS blocks (for availability check)
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action, username, user_id } = await req.json()

    // --- HELPER: VALIDATE USERNAME ---
    const validateUsername = (u: string) => {
        const lower = u.toLowerCase();
        
        if (!USERNAME_REGEX.test(lower)) {
            return "Username must be 3-30 characters and contain only letters, numbers, dots, or underscores.";
        }
        if (lower.includes('..') || lower.includes('__')) {
            return "Username cannot contain consecutive dots or underscores.";
        }
        if (lower.startsWith('.') || lower.startsWith('_') || lower.endsWith('.') || lower.endsWith('_')) {
            return "Username cannot start or end with a dot or underscore.";
        }
        if (RESERVED_USERNAMES.includes(lower)) {
            return "This username is reserved.";
        }
        return null; // Valid
    };

    // --- ACTION: CHECK AVAILABILITY ---
    if (action === 'check_availability') {
        if (!username) throw new Error('Username is required');
        
        const lowerUsername = username.toLowerCase();
        const validationError = validateUsername(lowerUsername);
        
        if (validationError) {
            return new Response(JSON.stringify({ available: false, error: validationError }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        // Check DB
        const { count, error } = await adminClient
            .from('users')
            .select('*', { count: 'exact', head: true })
            .eq('username', lowerUsername); // Relies on case-insensitive collation or lower index

        // Note: Since we might not have case-insensitive collation setup, we should ideally query LOWER(username)
        // But Supabase doesn't support functional indexes in simple .eq() easily without a view or RPC.
        // However, our migration enforces lowercase storage, so .eq() is fine if we lowercase input.
        
        if (error) throw error;

        return new Response(JSON.stringify({ available: count === 0 }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // --- ACTION: SET / UPDATE USERNAME ---
    if (action === 'set_username' || action === 'update_username') {
        const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
        if (authError || !user) throw new Error('Unauthorized');

        if (!username) throw new Error('Username is required');

        const lowerUsername = username.toLowerCase();
        const validationError = validateUsername(lowerUsername);
        if (validationError) throw new Error(validationError);

        // Check if taken (by someone else)
        const { data: existing } = await adminClient
            .from('users')
            .select('id')
            .eq('username', lowerUsername)
            .single();

        if (existing && existing.id !== user.id) {
            throw new Error('Username is already taken');
        }

        // Update Profile
        const { error: updateError } = await adminClient
            .from('users')
            .update({ 
                username: lowerUsername,
                needs_username_update: false
            })
            .eq('id', user.id);

        if (updateError) throw updateError;

        return new Response(JSON.stringify({ success: true, username: lowerUsername }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    throw new Error('Invalid action');

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
