import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatOperationRequest {
  action: string;
  team_id?: string;
  channel_id?: string;
  message_id?: string;
  user_id?: string;
  parent_message_id?: string;
  content?: string;
  reaction_type?: string;
  is_system_message?: boolean;
  system_event_type?: string;
  system_event_data?: any;
  page?: number;
  limit?: number;
  search_query?: string;
  search_filters?: {
    channel_ids?: string[];
    user_ids?: string[];
    date_from?: string;
    date_to?: string;
    include_threads?: boolean;
    include_system?: boolean;
  };
  // For tab content operations
  tab_id?: string;
  tab_content?: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    console.log('Auth header present:', !!authHeader);

    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing Authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Admin client for bypassing RLS
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Extract token to be safe and pass directly if needed, though global headers should work.
    // However, some versions of supabase-js behave differently in Deno.
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError) {
      console.error('Auth error:', authError);
      return new Response(JSON.stringify({ error: 'Authentication failed', details: authError.message }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    if (!user) {
      console.error('No user found');
      return new Response(JSON.stringify({ error: 'Unauthorized - no user session' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('User authenticated:', user.id);

    const body: ChatOperationRequest = await req.json();
    const { action } = body;

    let result;

    switch (action) {
      case 'fetch_thread':
        result = await fetchThread(supabaseClient, body, user.id);
        break;
      
      case 'add_reaction':
        result = await addReaction(supabaseClient, body, user.id);
        break;
      
      case 'remove_reaction':
        result = await removeReaction(supabaseClient, body, user.id);
        break;
      
      case 'pin_message':
        result = await pinMessage(supabaseClient, body, user.id);
        break;
      
      case 'unpin_message':
        result = await unpinMessage(supabaseClient, body, user.id);
        break;
      
      case 'get_pinned_messages':
        result = await getPinnedMessages(supabaseClient, body, user.id);
        break;
      
      case 'create_system_message':
        result = await createSystemMessage(supabaseClient, body, user.id);
        break;
      
      case 'search_messages':
        result = await searchMessages(supabaseClient, body, user.id);
        break;
      
      case 'edit_message':
        result = await editMessage(supabaseClient, body, user.id);
        break;
      
      case 'save_tab_content':
        result = await saveTabContent(adminClient, body, user.id);
        break;

      case 'bot_reply':
        result = await botReply(supabaseClient, body, user.id);
        break;
      
      default:
        return new Response(JSON.stringify({ error: 'Unknown action' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in chat-operations:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// ========================================
// THREAD OPERATIONS
// ========================================

async function fetchThread(supabaseClient: any, body: ChatOperationRequest, userId: string) {
  const { message_id, limit = 50, page = 0 } = body;

  if (!message_id) {
    throw new Error('message_id required');
  }

  // Fetch thread replies with user data
  const { data: threadReplies, error } = await supabaseClient
    .from('team_messages')
    .select(`
      *,
      user:users(id, email, full_name, avatar_url)
    `)
    .eq('parent_message_id', message_id)
    .order('created_at', { ascending: true })
    .range(page * limit, (page + 1) * limit - 1);

  if (error) throw error;

  // Also fetch the parent message
  const { data: parentMessage, error: parentError } = await supabaseClient
    .from('team_messages')
    .select(`
      *,
      user:users(id, email, full_name, avatar_url)
    `)
    .eq('id', message_id)
    .single();

  if (parentError) throw parentError;

  return {
    parent: parentMessage,
    replies: threadReplies || [],
    has_more: threadReplies && threadReplies.length === limit,
  };
}

// ========================================
// REACTION OPERATIONS
// ========================================

async function addReaction(supabaseClient: any, body: ChatOperationRequest, userId: string) {
  const { message_id, reaction_type } = body;

  if (!message_id || !reaction_type) {
    throw new Error('message_id and reaction_type required');
  }

  // Validate reaction type
  const validTypes = ['acknowledge', 'seen', 'completed', 'important'];
  if (!validTypes.includes(reaction_type)) {
    throw new Error(`Invalid reaction_type. Must be one of: ${validTypes.join(', ')}`);
  }

  // Check if message is a system message (cannot react to system messages)
  const { data: message } = await supabaseClient
    .from('team_messages')
    .select('is_system_message')
    .eq('id', message_id)
    .single();

  if (message?.is_system_message) {
    throw new Error('Cannot react to system messages');
  }

  // Insert reaction (UNIQUE constraint will prevent duplicates)
  const { data, error } = await supabaseClient
    .from('message_reactions')
    .insert({
      message_id,
      user_id: userId,
      reaction_type,
    })
    .select()
    .single();

  if (error) {
    // If duplicate, that's fine - idempotent operation
    if (error.code === '23505') {
      return { success: true, message: 'Reaction already exists' };
    }
    throw error;
  }

  return { success: true, data };
}

async function removeReaction(supabaseClient: any, body: ChatOperationRequest, userId: string) {
  const { message_id, reaction_type } = body;

  if (!message_id || !reaction_type) {
    throw new Error('message_id and reaction_type required');
  }

  const { error } = await supabaseClient
    .from('message_reactions')
    .delete()
    .eq('message_id', message_id)
    .eq('user_id', userId)
    .eq('reaction_type', reaction_type);

  if (error) throw error;

  return { success: true };
}

// ========================================
// PIN OPERATIONS
// ========================================

async function pinMessage(supabaseClient: any, body: ChatOperationRequest, userId: string) {
  const { message_id, team_id } = body;

  if (!message_id || !team_id) {
    throw new Error('message_id and team_id required');
  }

  // Get message and channel info
  const { data: message, error: msgError } = await supabaseClient
    .from('team_messages')
    .select('channel_id, team_id')
    .eq('id', message_id)
    .single();

  if (msgError) throw msgError;

  // Insert pin (trigger will enforce 10-pin limit)
  const { data, error } = await supabaseClient
    .from('pinned_messages')
    .insert({
      message_id,
      channel_id: message.channel_id,
      team_id: message.team_id,
      pinned_by: userId,
    })
    .select()
    .single();

  if (error) {
    if (error.message.includes('Maximum 10 pinned messages')) {
      throw new Error('Maximum 10 pinned messages per channel reached. Unpin a message first.');
    }
    throw error;
  }

  return { success: true, data };
}

async function unpinMessage(supabaseClient: any, body: ChatOperationRequest, userId: string) {
  const { message_id } = body;

  if (!message_id) {
    throw new Error('message_id required');
  }

  const { error } = await supabaseClient
    .from('pinned_messages')
    .delete()
    .eq('message_id', message_id);

  if (error) throw error;

  return { success: true };
}

async function getPinnedMessages(supabaseClient: any, body: ChatOperationRequest, userId: string) {
  const { channel_id } = body;

  if (!channel_id) {
    throw new Error('channel_id required');
  }

  const { data, error } = await supabaseClient
    .from('pinned_messages')
    .select(`
      *,
      message:team_messages(
        *,
        user:users(id, email, full_name, avatar_url)
      )
    `)
    .eq('channel_id', channel_id)
    .order('pinned_at', { ascending: false })
    .limit(10);

  if (error) throw error;

  return data || [];
}

// ========================================
// SYSTEM MESSAGE OPERATIONS
// ========================================

async function createSystemMessage(supabaseClient: any, body: ChatOperationRequest, userId: string) {
  const { team_id, channel_id, content, system_event_type, system_event_data } = body;

  if (!team_id || !channel_id || !content || !system_event_type) {
    throw new Error('team_id, channel_id, content, and system_event_type required');
  }

  // Verify user has permission to create system messages (admin only)
  const { data: adminCheck } = await supabaseClient.rpc('is_team_admin', {
    p_team_id: team_id,
    p_user_id: userId,
  });

  if (!adminCheck) {
    throw new Error('Only admins can create system messages');
  }

  const { data, error } = await supabaseClient
    .from('team_messages')
    .insert({
      team_id,
      channel_id,
      user_id: null, // System messages have no user
      content,
      is_system_message: true,
      system_event_type,
      system_event_data: system_event_data || {},
    })
    .select()
    .single();

  if (error) throw error;

  return { success: true, data };
}

// ========================================
// SEARCH OPERATIONS
// ========================================

async function searchMessages(supabaseClient: any, body: ChatOperationRequest, userId: string) {
  const { team_id, search_query, search_filters = {}, limit = 50, page = 0 } = body;

  if (!team_id || !search_query) {
    throw new Error('team_id and search_query required');
  }

  const {
    channel_ids = [],
    user_ids = [],
    date_from,
    date_to,
    include_threads = true,
    include_system = true,
  } = search_filters;

  // Build search query
  let query = supabaseClient
    .from('team_messages')
    .select(`
      *,
      user:users(id, email, full_name, avatar_url),
      channel:team_channels(id, name)
    `)
    .eq('team_id', team_id)
    .textSearch('search_vector', search_query.split(' ').join(' & '))
    .order('created_at', { ascending: false })
    .range(page * limit, (page + 1) * limit - 1);

  // Apply filters
  if (channel_ids.length > 0) {
    query = query.in('channel_id', channel_ids);
  }

  if (user_ids.length > 0) {
    query = query.in('user_id', user_ids);
  }

  if (date_from) {
    query = query.gte('created_at', date_from);
  }

  if (date_to) {
    query = query.lte('created_at', date_to);
  }

  if (!include_threads) {
    query = query.is('parent_message_id', null);
  }

  if (!include_system) {
    query = query.eq('is_system_message', false);
  }

  const { data, error } = await query;

  if (error) throw error;

  return {
    results: data || [],
    query: search_query,
    has_more: data && data.length === limit,
  };
}

// ========================================
// EDIT MESSAGE
// ========================================

async function editMessage(supabaseClient: any, body: ChatOperationRequest, userId: string) {
  const { message_id, content } = body;

  if (!message_id || !content) {
    throw new Error('message_id and content required');
  }

  // RLS will enforce: own message, not system message, within 15 minutes
  const { data, error } = await supabaseClient
    .from('team_messages')
    .update({
      content,
      edited_at: new Date().toISOString(),
    })
    .eq('id', message_id)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      throw new Error('Cannot edit: either not your message, too old (>15min), or system message');
    }
    throw error;
  }

  return { success: true, data };
}

// ========================================
// TAB CONTENT OPERATIONS (OVERVIEW SAVE)
// ========================================

async function saveTabContent(adminClient: any, body: ChatOperationRequest, userId: string) {
  const { tab_id, tab_content, team_id } = body;

  if (!tab_id || !tab_content || !team_id) {
    throw new Error('tab_id, tab_content, and team_id required');
  }

  // Verify user is admin or owner of this team
  const { data: memberData, error: memberError } = await adminClient
    .from('team_members')
    .select('role')
    .eq('team_id', team_id)
    .eq('user_id', userId)
    .single();

  if (memberError || !memberData) {
    throw new Error('You are not a member of this team');
  }

  // Check if user has admin role via team_member_roles
  const { data: roleData } = await adminClient
    .from('team_member_roles')
    .select('team_roles(is_admin)')
    .eq('team_id', team_id)
    .eq('user_id', userId);

  const hasAdminRole = roleData?.some((r: any) => r.team_roles?.is_admin) || false;
  const isOwnerOrAdmin = memberData.role === 'owner' || memberData.role === 'admin' || hasAdminRole;

  if (!isOwnerOrAdmin) {
    throw new Error('Only team admins and owners can edit Overview content');
  }

  // Check if content exists
  const { data: existing } = await adminClient
    .from('channel_tab_content')
    .select('id')
    .eq('tab_id', tab_id)
    .single();

  let result;
  
  if (existing) {
    // Update existing
    const { data, error } = await adminClient
      .from('channel_tab_content')
      .update({ 
        content: tab_content, 
        updated_by: userId, 
        updated_at: new Date().toISOString() 
      })
      .eq('tab_id', tab_id)
      .select()
      .single();

    if (error) {
      console.error('Update tab content error:', error);
      throw error;
    }
    result = data;
  } else {
    // Insert new
    const { data, error } = await adminClient
      .from('channel_tab_content')
      .insert({ 
        tab_id, 
        content: tab_content, 
        updated_by: userId 
      })
      .select()
      .single();

    if (error) {
      console.error('Insert tab content error:', error);
      throw error;
    }
    result = data;
  }

  return { success: true, data: result };
}

// ========================================
// BOT OPERATIONS
// ========================================

async function botReply(supabaseClient: any, body: ChatOperationRequest, userId: string) {
  const { team_id, channel_id, content } = body;
  
  if (!team_id || !channel_id || !content) {
    throw new Error('team_id, channel_id, and content required');
  }

  // 1. Fetch recent context
  const { data: messages, error: contextError } = await supabaseClient
    .from('team_messages')
    .select(`
      content,
      user_id,
      created_at,
      user:users(full_name)
    `)
    .eq('channel_id', channel_id)
    .order('created_at', { ascending: false })
    .limit(100);
    
  if (contextError) {
    console.error('[Bot] Context fetch error:', contextError);
    // Proceed without context if fail
  }

  let context = (messages || [])
    .filter((m: any) => m.user_id !== null) // Exclude bot messages
    .reverse()
    .map((m: any) => {
      const sender = m.user?.full_name || 'Unknown User';
      const time = new Date(m.created_at).toLocaleString('en-US', { 
        weekday: 'short', 
        hour: 'numeric', 
        minute: 'numeric',
        hour12: true 
      });
      return `[${time}] ${sender}: ${m.content}`;
    })
    .join('\n');

  if (!context.trim()) {
    context = "(No conversation history found in the last 100 messages)";
  }

  const systemPrompt = `You are Spire AI, a smart assistant for the team.
Your goal is to help with productivity, answer questions, summarize discussions, and provide insights.
You have access to the recent conversation history provided below (last 100 messages).

CRITICAL INSTRUCTIONS:
1. CONTEXT VS KNOWLEDGE: 
   - IF the user asks about the chat (summaries, "what did X say", "decisions made"), use ONLY the provided "Conversation History". Do NOT invent messages or names.
   - IF the user asks a general question (e.g. "Who is Elon Musk?", "Write a Python script", "Draft an email"), use your own internal knowledge. You do NOT need the chat history for these.

2. ZERO HALLUCINATION (CHAT): When answering questions about the chat, if the info isn't there, say "I don't see that in the chat history." Do NOT make up team members or conversations.

3. TIMESTAMPS: Use the provided timestamps for time-aware queries (e.g. "summarize today").

4. EMPTY HISTORY: If the history is empty, you can still answer general knowledge questions. But for chat summaries, state that no history is available.

Conversation History:
${context}
`;

  // 2. Call OpenRouter
  try {
    const apiKey = Deno.env.get('OPENROUTER_API_KEY');
    if (!apiKey) {
        console.error('[Bot] OPENROUTER_API_KEY is missing');
        throw new Error('Configuration error: Missing API Key');
    }
    console.log('[Bot] Calling OpenRouter with key length:', apiKey.length);

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b:free',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content }
        ]
      })
    });

    console.log('[Bot] OpenRouter Status:', response.status);

    if (!response.ok) {
        const errText = await response.text();
        console.error('[Bot] OpenRouter error body:', errText);
        throw new Error(`OpenRouter API error: ${response.status} - ${errText.substring(0, 100)}`);
    }

    const aiData = await response.json();
    console.log('[Bot] AI Response received');
    
    // Check if we got a valid choice
    const replyContent = aiData.choices?.[0]?.message?.content;
    if (!replyContent) {
        console.error('[Bot] No content in AI response:', JSON.stringify(aiData));
        throw new Error('Empty response from AI');
    }

    // 3. Insert Bot Message
    console.log('[Bot] Inserting message...');
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data, error } = await adminClient
      .from('team_messages')
      .insert({
        team_id,
        channel_id,
        user_id: null,
        content: replyContent,
        is_system_message: false
      })
      .select()
      .single();
      
    if (error) {
        console.error('[Bot] Insert error:', error);
        throw error;
    }
    
    console.log('[Bot] Success:', data.id);
    return { success: true, data };

  } catch (err) {
    console.error('[Bot] Process error:', err);
    throw err;
  }
}
