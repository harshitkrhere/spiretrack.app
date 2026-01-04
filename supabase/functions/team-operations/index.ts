import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { action, team_id, week_start, ...payload } = await req.json()
    
    // Get User
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) throw new Error('Unauthorized')



    // Create Admin Client for DB operations to bypass RLS
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // --- ACTION: CREATE TEAM ---
    if (action === 'create_team') {
      const { name, description } = payload
      
      // 1. Create Team (Generate ID explicitly)
      const teamId = crypto.randomUUID();
      const { data: team, error: createError } = await adminClient
        .from('teams')
        .insert({ id: teamId, name, description, created_by: user.id })
        .select()
        .single()
      
      if (createError) {
        console.error('Team Create Error:', createError);
        throw createError;
      }

      // 2. Add Creator as Admin (Generate ID explicitly)
      const memberId = crypto.randomUUID();
      const { data: memberData, error: memberError } = await adminClient
        .from('team_members')
        .insert({ id: memberId, team_id: team.id, user_id: user.id, role: 'admin' })
        .select()

      if (memberError) {
        console.error('Team Member Error:', memberError);
        console.error('Attempted to insert:', { id: memberId, team_id: team.id, user_id: user.id, role: 'admin' });
        // Don't throw - return team anyway so user can still access it
        // throw memberError;
      } else {
        console.log('Successfully added team member:', memberData);
      }

      return new Response(JSON.stringify(team), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // --- ACTION: DELETE TEAM ---
    if (action === 'delete_team') {
      // 1. Verify user is admin of this team
      const { data: member } = await adminClient
        .from('team_members')
        .select('role')
        .eq('team_id', team_id)
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();
      
      if (!member) {
        throw new Error('Only admins can delete teams');
      }

      // 2. Delete all related records (cascade may not work with RLS)
      // Delete in order: activity_logs, member_roles, members, roles, then team
      await adminClient.from('team_activity_logs').delete().eq('team_id', team_id);
      await adminClient.from('team_member_roles').delete().eq('team_id', team_id);
      await adminClient.from('team_members').delete().eq('team_id', team_id);
      await adminClient.from('team_roles').delete().eq('team_id', team_id);
      await adminClient.from('team_channels').delete().eq('team_id', team_id);
      await adminClient.from('team_consolidated_reports').delete().eq('team_id', team_id);
      await adminClient.from('team_weekly_reviews').delete().eq('team_id', team_id);
      await adminClient.from('team_form_questions').delete().eq('team_id', team_id);
      await adminClient.from('team_ban_records').delete().eq('team_id', team_id);
      await adminClient.from('team_kick_records').delete().eq('team_id', team_id);
      await adminClient.from('team_whitelist').delete().eq('team_id', team_id);
      
      // 3. Finally delete the team itself
      const { error: deleteError } = await adminClient
        .from('teams')
        .delete()
        .eq('id', team_id);
      
      if (deleteError) {
        console.error('Error deleting team:', deleteError);
        throw deleteError;
      }

      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // --- ACTION: GET ADMIN METRICS ---
    if (action === 'get_admin_metrics') {
      // This action uses admin client to fetch all teams with member counts
      // bypassing RLS to give admin dashboard full visibility
      
      // Get all teams that have at least one active member
      const { data: allMemberships, error: membersError } = await adminClient
        .from('team_members')
        .select('team_id, status, teams(id, name)')
        .eq('status', 'active');
      
      if (membersError) {
        console.error('[get_admin_metrics] Error fetching team members:', membersError);
      }
      
      // Build unique teams with member counts
      const teamCounts = new Map<string, { id: string; name: string; memberCount: number }>();
      if (allMemberships) {
        for (const membership of allMemberships) {
          if (membership.teams) {
            const teamId = membership.team_id;
            const team = membership.teams as { id: string; name: string };
            if (teamCounts.has(teamId)) {
              teamCounts.get(teamId)!.memberCount++;
            } else {
              teamCounts.set(teamId, {
                id: team.id,
                name: team.name,
                memberCount: 1
              });
            }
          }
        }
      }
      
      // Only return teams with at least 1 member
      const teamsWithMembers = Array.from(teamCounts.values()).filter(t => t.memberCount > 0);
      
      console.log('[get_admin_metrics] Returning teams:', teamsWithMembers.length);
      
      return new Response(JSON.stringify({ 
        teams: teamsWithMembers,
        totalTeams: teamsWithMembers.length
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // --- ACTION: JOIN TEAM ---
    // --- ACTION: JOIN TEAM ---
    // --- ACTION: JOIN TEAM ---
    if (action === 'join_team') {
      // 0. Check Whitelist
      const { data: teamData } = await adminClient
        .from('teams')
        .select('is_whitelist_enabled')
        .eq('id', team_id)
        .single();

      if (teamData?.is_whitelist_enabled) {
        // Check if user is whitelisted
        // 1. Check by user_id
        const { data: whitelistById } = await adminClient
          .from('team_whitelist')
          .select('id')
          .eq('team_id', team_id)
          .eq('user_id', user.id)
          .maybeSingle();

        // 2. Check by username (if not found by ID)
        let isWhitelisted = !!whitelistById;
        
        if (!isWhitelisted) {
           // Fetch user's username from public.users
           const { data: userData } = await adminClient
             .from('users')
             .select('username')
             .eq('id', user.id)
             .single();
             
           if (userData?.username) {
             const { data: whitelistByName } = await adminClient
               .from('team_whitelist')
               .select('id')
               .eq('team_id', team_id)
               .eq('username', userData.username.toLowerCase())
               .maybeSingle();
               
             if (whitelistByName) {
               isWhitelisted = true;
               // Link user_id to the whitelist entry for future
               await adminClient
                 .from('team_whitelist')
                 .update({ user_id: user.id })
                 .eq('id', whitelistByName.id);
             }
           }
        }

        if (!isWhitelisted) {
           return new Response(JSON.stringify({ error: 'This team is whitelist-only. You are not whitelisted.' }), { 
             status: 403, 
             headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
           });
        }
      }

      // 1. Check Ban
      const { data: ban } = await adminClient
        .from('team_ban_records')
        .select('id')
        .eq('team_id', team_id)
        .eq('user_id', user.id)
        .single();
        
      if (ban) {
        return new Response(JSON.stringify({ error: 'You are banned from this team.' }), { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      }

      // 2. Check Kick Cooldown
      const { data: kick } = await adminClient
        .from('team_kick_records')
        .select('kicked_until')
        .eq('team_id', team_id)
        .eq('user_id', user.id)
        .gt('kicked_until', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (kick) {
        const remaining = Math.ceil((new Date(kick.kicked_until).getTime() - Date.now()) / 60000);
        return new Response(JSON.stringify({ 
          error: `You were removed recently. Please try again in ${remaining} minutes.`,
          kicked_until: kick.kicked_until
        }), { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        });
      }

      // 3. Proceed with Join
      const memberId = crypto.randomUUID();
      const { error: joinError } = await adminClient
        .from('team_members')
        .insert({ id: memberId, team_id, user_id: user.id, role: 'member' })

      if (joinError) {
        console.error('Join Team Error:', joinError);
        throw joinError;
      }

      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // --- ACTION: CONSOLIDATE REPORT ---
    if (action === 'consolidate_report') {
      // 1. Verify Admin Role
      const { data: member } = await supabaseClient
        .from('team_members')
        .select('role')
        .eq('team_id', team_id)
        .eq('user_id', user.id)
        .single()

      if (member?.role !== 'admin') throw new Error('Only admins can generate reports')

      if (!week_start) throw new Error('Week start date is required')

      // 2. Fetch All Reviews for Week from team_weekly_reviews
      const adminClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )

      // Fetch weekly reviews with responses
      const { data: reviews, error: reviewsError } = await adminClient
        .from('team_weekly_reviews')
        .select('user_id, responses, created_at')
        .eq('team_id', team_id)
        .eq('week_start', week_start);

      if (reviewsError) throw reviewsError;
      if (!reviews || reviews.length === 0) throw new Error('No submissions found for this week. Team members need to submit their weekly reviews first.');

      // Fetch User Details
      const userIds = [...new Set(reviews.map((r: any) => r.user_id))];
      const { data: users } = await adminClient
        .from('users')
        .select('id, full_name, username')
        .in('id', userIds);

      // Construct Submissions Object
      const allReviews = reviews.map((review: any) => {
        const user = users?.find((u: any) => u.id === review.user_id);
        return {
          user: user?.full_name || user?.username || 'Unknown',
          responses: review.responses || {}
        };
      });

      // Get team stats
      const { count: totalMembers } = await adminClient
        .from('team_members')
        .select('*', { count: 'exact', head: true })
        .eq('team_id', team_id)

      const submittedCount = allReviews.length

      // Get team name
      const { data: teamData } = await adminClient
        .from('teams')
        .select('name')
        .eq('id', team_id)
        .single()

      // 3. Generate Comprehensive Consolidated Report via AI
      const prompt = `You are an AI Team Operations Analyst. Generate an enterprise-grade consolidated team report based ONLY on the weekly reviews provided for the selected week. Do not mix with any other week. Produce clear, actionable insights suitable for leadership.

TEAM: ${teamData?.name || 'Unknown'}
WEEK: ${week_start}
SUBMISSIONS: ${submittedCount}/${totalMembers}

Here are all member submissions for this week (identity + answers):
${JSON.stringify(allReviews, null, 2)}

Generate a consolidated executive report with scores, themes, wins, blockers, delegation, risks, critical path, and next-week KPIs.

Return STRICT JSON with the following structure:
{
  "morale_score": <0-100, average of team morale/collaboration ratings>,
  "productivity_score": <0-100, based on completions, quality, efficiency>,
  "risk_score": <0-100, based on blockers, risks, missed deadlines>,
  "stress_score": <0-100, average stress/workload levels>,
  "alignment_score": <0-100, based on goal clarity and collaboration>,
  
  "collective_wins": [<array of team achievements from responses>],
  "collective_blockers": [<array of challenges and obstacles>],
  "team_risks": [<array of identified risks, ranked by severity>],
  
  "themes": [<recurring patterns: productivity, morale, collaboration, delays>],
  "delegation_suggestions": [<tasks suitable for delegation based on workload/skills>],
  "critical_path": [<max 6 most important action items for next week>],
  
  "operational_issues": [<workflow problems, process gaps, resource constraints>],
  "long_term_risks": [<strategic risks beyond immediate week>],
  "recommended_manager_actions": [<specific actions for leadership>],
  
  "next_week_strategy": "<strategic recommendation for next week based on team priorities>",
  "departmental_insights": {<role/department>: "<insight>"},
  
  "improvement_plan": {
    "urgent": [<3 urgent improvements needed immediately>],
    "medium": [<3 medium-priority improvements>],
    "long_term": [<3 long-term strategic improvements>]
  },
  
  "summary_text": "<2-3 sentence executive summary of team state>",
  "meta": {
    "submitted_count": ${submittedCount},
    "total_members": ${totalMembers},
    "week_start": "${week_start}"
  }
}

CRITICAL RULES:
- Use ONLY actual data from the reviews above
- Do NOT hallucinate or make up information
- If data is missing, acknowledge it (e.g., "Limited data on X")
- Be direct, data-driven, and executive-level
- Scores should reflect actual team input, not aspirational goals`

      const { generateText } = await import('../_shared/ai/aiClient.ts');
      const generatedText = await generateText(prompt, {
        responseFormat: 'json',
        temperature: 0.3
      });
      
      const reportData = JSON.parse(generatedText);

      // 4. Save Report
      const { error: saveError } = await adminClient
        .from('team_consolidated_reports')
        .upsert({
          team_id,
          week_start,
          report: reportData,
          ai_version: 'v2'
        })

      if (saveError) throw saveError

      // 5. Track Metrics for Trend Charts
      await adminClient
        .from('team_metrics_history')
        .upsert({
          team_id,
          week_start,
          morale_score: reportData.morale_score || 0,
          productivity_score: reportData.productivity_score || 0,
          stress_score: reportData.stress_score || 0,
          collaboration_score: reportData.alignment_score || 0,
          alignment_score: reportData.alignment_score || 0,
          risk_score: reportData.risk_score || 0
        })

      // 6. Create notifications for all team admins (except the one who generated)
      try {
        const { data: adminMembers } = await adminClient
          .from('team_members')
          .select('user_id, users(email)')
          .eq('team_id', team_id)
          .eq('role', 'admin');

        if (adminMembers && adminMembers.length > 0) {
          const notificationsToInsert = adminMembers
            .filter(m => m.user_id !== user.id)
            .map(m => ({
              user_id: m.user_id,
              type: 'report_ready',
              title: `Weekly report ready for ${teamData?.name || 'your team'}`,
              body: `Week of ${week_start} - ${reportData.meta?.submitted_count || 0}/${reportData.meta?.total_members || 0} submissions`,
              link: `/app/team/${team_id}`,
              metadata: { team_id, week_start }
            }));

          if (notificationsToInsert.length > 0) {
            await adminClient.from('notifications').insert(notificationsToInsert);
          }
        }
      } catch (notifyErr) {
        console.error('Failed to create report notifications:', notifyErr);
        // Don't fail the report generation if notifications fail
      }

      return new Response(JSON.stringify(reportData), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // --- ACTION: GET REPORT HISTORY ---
    if (action === 'get_report_history') {
      // Verify user is a team member
      const { data: member } = await adminClient
        .from('team_members')
        .select('role')
        .eq('team_id', team_id)
        .eq('user_id', user.id)
        .single()

      if (!member) throw new Error('Not a team member')

      // Fetch all reports for this team
      const { data: reports, error: reportError } = await adminClient
        .from('team_consolidated_reports')
        .select('id, week_start, report, created_at')
        .eq('team_id', team_id)
        .or('archived.is.null,archived.eq.false')
        .order('week_start', { ascending: false })

      if (reportError) {
        console.error('Error fetching report history:', reportError)
        throw reportError
      }

      console.log('[get_report_history] Returning', reports?.length || 0, 'reports for team:', team_id)
      
      return new Response(JSON.stringify({ reports: reports || [] }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    // Phase 2: Create Task
    if (action === 'create_task') {
      const { title, description, assigned_to, priority, due_date, source } = payload

      const { data, error } = await supabaseClient
        .from('team_tasks')
        .insert({
          team_id,
          title,
          description,
          assigned_to,
          created_by: user.id,
          priority: priority || 'medium',
          due_date,
          source: source || 'manual',
          status: 'todo'
        })
        .select()
        .single()

      if (error) throw error
      return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // Phase 2: Update Task Status
    if (action === 'update_task_status') {
      const { task_id, status } = payload

      const { data, error } = await supabaseClient
        .from('team_tasks')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', task_id)
        .select()
        .single()

      if (error) throw error
      return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // Generate Action Plan with AI
    if (action === 'generate_action_plan') {
      try {
        const { report_data } = payload
        console.log('Generating action plan for team:', team_id, 'week:', week_start)

        const prompt = `You are an expert team management consultant. Based on the following team report data, create a comprehensive action plan.

CRITICAL PATH:
${JSON.stringify(report_data.critical_path || [], null, 2)}

BLOCKERS:
${JSON.stringify(report_data.blockers || [], null, 2)}

RISKS:
${JSON.stringify(report_data.risks || [], null, 2)}

RECOMMENDED MANAGER ACTIONS:
${JSON.stringify(report_data.manager_actions || [], null, 2)}

Create a structured action plan with:
1. A brief summary (2-3 sentences)
2. Immediate actions (this week) - 3-5 urgent items
3. Short-term actions (2-4 weeks) - 3-5 important items
4. Long-term actions (1-3 months) - 2-4 strategic items

Return ONLY a valid JSON object with this structure:
{
  "summary": "Brief overview of the action plan",
  "immediate_actions": ["action 1", "action 2", ...],
  "short_term_actions": ["action 1", "action 2", ...],
  "long_term_actions": ["action 1", "action 2", ...]
}

Be specific, actionable, and prioritize based on urgency and impact.`

        const { generateText } = await import('../_shared/ai/aiClient.ts');
        console.log('Calling AI API...');
        let rawText = await generateText(prompt, {
          responseFormat: 'json',
          temperature: 0.7,
          maxTokens: 2000
        });
        console.log('AI response received');
        
        // Extract JSON from markdown code blocks if present
        let actionPlanText = rawText;
        if (rawText.includes('```json')) {
          actionPlanText = rawText.split('```json')[1].split('```')[0].trim();
        } else if (rawText.includes('```')) {
          actionPlanText = rawText.split('```')[1].split('```')[0].trim();
        }
        
        const actionPlan = JSON.parse(actionPlanText);
        console.log('Action plan generated successfully')

        return new Response(JSON.stringify(actionPlan), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      } catch (error: any) {
        console.error('Error in generate_action_plan:', error)
        throw new Error(`Action plan generation failed: ${error.message}`)
      }
    }

    // ===== ROLE MANAGEMENT ACTIONS =====

    // Helper: Check if user is admin (checks both legacy and new role systems)
    async function isTeamAdmin(teamId: string, userId: string): Promise<boolean> {
      // 1. Check legacy admin role in team_members
      const { data: legacyMember } = await adminClient
        .from('team_members')
        .select('role')
        .eq('team_id', teamId)
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();
        
      if (legacyMember) return true;

      // 2. Check new role system in team_member_roles
      const { data } = await adminClient
        .from('team_member_roles')
        .select('role_id, team_roles!inner(is_admin)')
        .eq('team_id', teamId)
        .eq('user_id', userId)
        .eq('team_roles.is_admin', true)
        .limit(1)
        .maybeSingle();
      
      return !!data;
    }

    // CREATE ROLE
    if (action === 'create_role') {
      const { name, color, icon, position, is_admin } = payload;
      
      if (!await isTeamAdmin(team_id, user.id)) {
        throw new Error('Only admins can create roles');
      }
      
      const { data, error } = await adminClient
        .from('team_roles')
        .insert({
          team_id,
          name,
          color: color || '#808080',
          icon,
          position: position || 0,
          is_admin: is_admin || false,
          created_by: user.id
        })
        .select()
        .single();
        
      if (error) throw error;
      return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // UPDATE ROLE
    if (action === 'update_role') {
      const { role_id, name, color, icon, position, is_admin } = payload;
      
      const { data: role } = await adminClient
        .from('team_roles')
        .select('team_id')
        .eq('id', role_id)
        .single();
      
      if (!role || !await isTeamAdmin(role.team_id, user.id)) {
        throw new Error('Only admins can update roles');
      }
      
      const { data, error } = await adminClient
        .from('team_roles')
        .update({ name, color, icon, position, is_admin })
        .eq('id', role_id)
        .select()
        .single();
        
      if (error) throw error;
      return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // DELETE ROLE
    if (action === 'delete_role') {
      const { role_id } = payload;
      
      const { data: role } = await adminClient
        .from('team_roles')
        .select('team_id')
        .eq('id', role_id)
        .single();
      
      if (!role || !await isTeamAdmin(role.team_id, user.id)) {
        throw new Error('Only admins can delete roles');
      }
      
      const { error } = await adminClient
        .from('team_roles')
        .delete()
        .eq('id', role_id);
        
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // REORDER ROLES (Batch)
    if (action === 'reorder_roles') {
      const { role_positions } = payload;
      
      if (!await isTeamAdmin(team_id, user.id)) {
        throw new Error('Only admins can reorder roles');
      }
      
      for (const { id, position } of role_positions) {
        await adminClient
          .from('team_roles')
          .update({ position })
          .eq('id', id)
          .eq('team_id', team_id);
      }
      
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // ASSIGN ROLE
    if (action === 'assign_role') {
      const { user_id, role_id } = payload;
      
      if (!await isTeamAdmin(team_id, user.id)) {
        throw new Error('Only admins can assign roles');
      }
      
      const { data, error } = await adminClient
        .from('team_member_roles')
        .insert({ team_id, user_id: user_id, role_id })
        .select()
        .single();
        
      if (error) throw error;
      return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // UNASSIGN ROLE
    if (action === 'unassign_role') {
      const { user_id, role_id } = payload;
      
      if (!await isTeamAdmin(team_id, user.id)) {
        throw new Error('Only admins can unassign roles');
      }
      
      const { error } = await adminClient
        .from('team_member_roles')
        .delete()
        .eq('team_id', team_id)
        .eq('user_id', user_id)
        .eq('role_id', role_id);
        
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // KICK MEMBER
    if (action === 'kick_member') {
      const { user_id: target_user_id } = payload;
      
      if (!await isTeamAdmin(team_id, user.id)) {
        throw new Error('Only admins can kick members');
      }
      
      // 1. Delete from team_members
      const { error: deleteError } = await adminClient
        .from('team_members')
        .delete()
        .eq('team_id', team_id)
        .eq('user_id', target_user_id);
        
      if (deleteError) throw deleteError;
      
      // 2. Create kick record (5 min cooldown)
      const kickedUntil = new Date(Date.now() + 5 * 60 * 1000).toISOString();
      const { error: kickError } = await adminClient
        .from('team_kick_records')
        .insert({
          team_id,
          user_id: target_user_id,
          kicked_until: kickedUntil
        });
        
      if (kickError) throw kickError;
      
      return new Response(JSON.stringify({ success: true, kicked_until: kickedUntil }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // BAN MEMBER
    if (action === 'ban_member') {
      const { user_id: target_user_id, reason } = payload;
      
      if (!await isTeamAdmin(team_id, user.id)) {
        throw new Error('Only admins can ban members');
      }
      
      // 1. Delete from team_members
      const { error: deleteError } = await adminClient
        .from('team_members')
        .delete()
        .eq('team_id', team_id)
        .eq('user_id', target_user_id);
        
      if (deleteError) throw deleteError;
      
      // 2. Delete existing kick records (Ban overrides kick)
      await adminClient
        .from('team_kick_records')
        .delete()
        .eq('team_id', team_id)
        .eq('user_id', target_user_id);
      
      // 3. Create ban record
      const { error: banError } = await adminClient
        .from('team_ban_records')
        .insert({
          team_id,
          user_id: target_user_id,
          ban_reason: reason
        });
        
      if (banError) throw banError;
      
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // UNBAN MEMBER
    if (action === 'unban_member') {
      const { user_id: target_user_id } = payload;
      
      if (!await isTeamAdmin(team_id, user.id)) {
        throw new Error('Only admins can unban members');
      }
      
      // 1. Delete from ban records
      const { error: unbanError } = await adminClient
        .from('team_ban_records')
        .delete()
        .eq('team_id', team_id)
        .eq('user_id', target_user_id);
        
      if (unbanError) throw unbanError;
      
      // 2. Cleanup kick records
      await adminClient
        .from('team_kick_records')
        .delete()
        .eq('team_id', team_id)
        .eq('user_id', target_user_id);
      
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // UPDATE PRESENCE - Update user's last_active_at timestamp
    if (action === 'update_presence') {
      const { error } = await adminClient
        .from('team_members')
        .update({ last_active_at: new Date().toISOString() })
        .eq('team_id', team_id)
        .eq('user_id', user.id);
        
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // GET TEAM MEMBERS (Active + Banned)
    if (action === 'get_team_members') {
      // 1. Fetch Active Members
      const { data: activeMembers, error: membersError } = await adminClient
        .from('team_members')
        .select('user_id, avatar_url, status, last_active_at')
        .eq('team_id', team_id);
      
      if (membersError) throw membersError;

      // 2. Fetch Banned Members
      const { data: bannedRecords, error: bansError } = await adminClient
        .from('team_ban_records')
        .select('user_id, ban_reason, created_at')
        .eq('team_id', team_id);
        
      if (bansError) throw bansError;

      // 3. Fetch User Details for ALL users
      const activeUserIds = activeMembers.map(m => m.user_id);
      const bannedUserIds = (bannedRecords || []).map(b => b.user_id);
      const allUserIds = [...new Set([...activeUserIds, ...bannedUserIds])];
      
      const { data: users, error: usersError } = await adminClient
        .from('users')
        .select('id, email, username, full_name, avatar_url')
        .in('id', allUserIds);
      
      if (usersError) console.error('Error fetching users:', usersError);
      
      const userMap = new Map((users || []).map(u => [u.id, {
        email: u.email,
        username: u.username,
        full_name: u.full_name,
        avatar_url: u.avatar_url
      }]));

      // 4. Fetch Roles for Active Members
      const { data: memberRoles } = await adminClient
        .from('team_member_roles')
        .select('user_id, team_roles(id, name, color, icon, position, is_admin)')
        .eq('team_id', team_id);

      // 5. Format Active Members
      const formattedActive = activeMembers.map(member => {
        const userData = userMap.get(member.user_id);
        const userRoles = (memberRoles || [])
          .filter((mr: any) => mr.user_id === member.user_id)
          .map((mr: any) => Array.isArray(mr.team_roles) ? mr.team_roles[0] : mr.team_roles)
          .filter((role: any) => role)
          .sort((a: any, b: any) => (b.position || 0) - (a.position || 0));

        // Calculate status based on last_active_at
        let status = 'offline';
        if (member.last_active_at) {
          const lastActive = new Date(member.last_active_at);
          const now = new Date();
          const diffMinutes = (now.getTime() - lastActive.getTime()) / (1000 * 60);
          
          if (diffMinutes < 5) {
            status = 'online';
          } else if (diffMinutes < 15) {
            status = 'away';
          } else {
            status = 'offline';
          }
        }

        return {
          ...member,
          status,
          email: userData?.email || 'Unknown',
          username: userData?.username || 'user',
          full_name: userData?.full_name,
          avatar_url: member.avatar_url || userData?.avatar_url,
          roles: userRoles
        };
      });

      // 6. Format Banned Members
      const formattedBanned = (bannedRecords || []).map(ban => {
        const userData = userMap.get(ban.user_id);
        return {
          user_id: ban.user_id,
          email: userData?.email || 'Unknown',
          username: userData?.username || 'user',
          full_name: userData?.full_name,
          avatar_url: userData?.avatar_url,
          ban_reason: ban.ban_reason,
          banned_at: ban.created_at,
          status: 'banned'
        };
      });

      return new Response(JSON.stringify({
        active_members: formattedActive,
        banned_members: formattedBanned
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    
    // GET WEEKLY SUBMISSION STATUS
    if (action === 'get_weekly_submission_status') {
      // week_start is already available from the top-level destructuring
      console.log('Fetching submission status for:', { team_id, week_start });
      
      if (!await isTeamAdmin(team_id, user.id)) {
        console.error('User is not admin:', user.id);
        throw new Error('Only admins can view submission status');
      }
      
      // 1. Fetch all team members
      const { data: members, error: membersError } = await adminClient
        .from('team_members')
        .select('user_id, avatar_url')
        .eq('team_id', team_id);
      
      if (membersError) throw membersError;
      
      // 2. Fetch user details (names/emails)
      const { data: usersData, error: usersError } = await adminClient.auth.admin.listUsers();
      if (usersError) console.error('Error fetching users:', usersError);
      
      const userMap = new Map((usersData?.users || []).map(u => [u.id, { 
        email: u.email, 
        name: u.user_metadata?.full_name || u.user_metadata?.name || 'User' 
      }]));
      
      // 3. Fetch submissions for the week
      const { data: submissions, error: submissionsError } = await adminClient
        .from('team_weekly_reviews')
        .select('user_id, created_at, responses')
        .eq('team_id', team_id)
        .eq('week_start', week_start);
        
      if (submissionsError) throw submissionsError;
      
      const submittedUserIds = new Set(submissions?.map(s => s.user_id) || []);
      
      // 4. Fetch Roles for context
      const { data: memberRoles } = await adminClient
        .from('team_member_roles')
        .select('user_id, team_roles(name, color, icon)')
        .eq('team_id', team_id);
        
      // 5. Build Result Lists
      const submitted = [];
      const missing = [];
      
      for (const member of members) {
        const userDetails = userMap.get(member.user_id) || { email: 'Unknown', name: 'Unknown' };
        const roles = (memberRoles || [])
          .filter((mr: any) => mr.user_id === member.user_id)
          .map((mr: any) => Array.isArray(mr.team_roles) ? mr.team_roles[0] : mr.team_roles)
          .filter(Boolean);
          
        const submission = submissions?.find(s => s.user_id === member.user_id);
        
        const memberData = {
          user_id: member.user_id,
          name: userDetails.name,
          email: userDetails.email,
          avatar_url: member.avatar_url,
          roles,
          submitted_at: submission?.created_at,
          responses: submission?.responses
        };
        
        if (submittedUserIds.has(member.user_id)) {
          submitted.push(memberData);
        } else {
          missing.push(memberData);
        }
      }
      
      return new Response(JSON.stringify({
        week_start,
        total_members: members.length,
        submitted_count: submitted.length,
        missing_count: missing.length,
        submitted,
        missing
      }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // --- ACTION: GET TEAM FORM ---
    if (action === 'get_team_form') {
      const { data: questions, error } = await adminClient
        .from('team_forms')
        .select('*')
        .eq('team_id', team_id)
        .order('position', { ascending: true });
      
      if (error) throw error;
      
      return new Response(JSON.stringify({ questions: questions || [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }


    // --- ACTION: REORDER FORM QUESTIONS ---
    if (action === 'reorder_form_questions') {
      // Check admin permission
      const { data: isAdmin } = await adminClient.rpc('is_team_admin', {
        team_id_input: team_id,
        user_id_input: user.id
      });
      
      if (!isAdmin) throw new Error('Only team admins can reorder questions');
      
      const { question_positions } = payload; // Array of { id, position }
      
      // Atomic batch update
      for (const { id, position } of question_positions) {
        await adminClient
          .from('team_forms')
          .update({ position, updated_at: new Date().toISOString() })
          .eq('id', id)
          .eq('team_id', team_id);
      }
      
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // --- ACTION: CREATE FORM SNAPSHOT ---
    if (action === 'create_form_snapshot') {
      // Check if snapshot already exists for this week
      const { data: existingSnapshot } = await adminClient
        .from('team_form_snapshots')
        .select('id')
        .eq('team_id', team_id)
        .eq('week_start', week_start)
        .limit(1)
        .single();
      
      if (existingSnapshot) {
        return new Response(JSON.stringify({ snapshot_created: false, message: 'Snapshot already exists' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      
      // Fetch current live form
      const { data: liveQuestions, error: fetchError } = await adminClient
        .from('team_forms')
        .select('*')
        .eq('team_id', team_id)
        .order('position', { ascending: true });
      
      if (fetchError) throw fetchError;
      
      if (!liveQuestions || liveQuestions.length === 0) {
        throw new Error('No form questions found for this team');
      }
      
      // Create snapshot
      const snapshotData = liveQuestions.map(q => ({
        team_id,
        week_start,
        original_question_id: q.id,
        snapshot_question_text: q.question_text,
        snapshot_question_type: q.question_type,
        snapshot_position: q.position,
        is_required_at_snapshot: q.is_required
      }));
      
      const { error: insertError } = await adminClient
        .from('team_form_snapshots')
        .insert(snapshotData);
      
      if (insertError) throw insertError;
      
      return new Response(JSON.stringify({ snapshot_created: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // --- ACTION: SUBMIT TEAM REVIEW RESPONSES ---
    if (action === 'submit_team_review_responses') {
      const { responses } = payload; // Array of { snapshot_question_id, answer_text?, answer_number? }
      
      // Verify user is team member
      const { data: membership } = await adminClient
        .from('team_members')
        .select('id')
        .eq('team_id', team_id)
        .eq('user_id', user.id)
        .single();
      
      if (!membership) throw new Error('Not a team member');
      
      // Upsert responses
      const responsesToUpsert = responses.map((r: any) => ({
        team_id,
        user_id: user.id,
        week_start,
        snapshot_question_id: r.snapshot_question_id,
        answer_text: r.answer_text || null,
        answer_number: r.answer_number || null,
        updated_at: new Date().toISOString()
      }));
      
      const { error: upsertError } = await adminClient
        .from('team_member_form_responses')
        .upsert(responsesToUpsert, { 
          onConflict: 'team_id,user_id,week_start,snapshot_question_id' 
        });
      
      if (upsertError) throw upsertError;
      
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // --- ACTION: GET MEMBER RESPONSES ---
    if (action === 'get_member_responses') {
      const { user_id: target_user_id } = payload;
      
      // Fetch responses with snapshot question details
      const { data: responses, error } = await adminClient
        .from('team_member_form_responses')
        .select(`
          *,
          snapshot_question:team_form_snapshots(
            snapshot_question_text,
            snapshot_question_type,
            snapshot_position,
            is_required_at_snapshot
          )
        `)
        .eq('team_id', team_id)
        .eq('user_id', target_user_id || user.id)
        .eq('week_start', week_start)
        .order('snapshot_question_id', { ascending: true });
      
      if (error) throw error;
      
      return new Response(JSON.stringify({ responses: responses || [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // --- ACTION: GET FORM SNAPSHOT ---
    if (action === 'get_form_snapshot') {
      const { data: snapshot, error } = await adminClient
        .from('team_form_snapshots')
        .select('*')
        .eq('team_id', team_id)
        .eq('week_start', week_start)
        .order('snapshot_position', { ascending: true });
      
      if (error) throw error;
      
      return new Response(JSON.stringify({ snapshot: snapshot || [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // ===== TEAM CHAT SYSTEM ACTIONS =====

    // 1. CREATE CHANNEL
    if (action === 'create_channel') {
      const { name } = payload;
      
      if (!await isTeamAdmin(team_id, user.id)) {
        throw new Error('Only admins can create channels');
      }

      // Get max position
      const { data: maxPos } = await adminClient
        .from('team_channels')
        .select('position')
        .eq('team_id', team_id)
        .order('position', { ascending: false })
        .limit(1)
        .maybeSingle();

      const position = (maxPos?.position || 0) + 1;

      const { data, error } = await adminClient
        .from('team_channels')
        .insert({
          team_id,
          name,
          position,
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // 2. RENAME CHANNEL
    if (action === 'rename_channel') {
      const { channel_id, new_name } = payload;
      
      if (!await isTeamAdmin(team_id, user.id)) {
        throw new Error('Only admins can rename channels');
      }

      const { data, error } = await adminClient
        .from('team_channels')
        .update({ name: new_name, updated_at: new Date().toISOString() })
        .eq('id', channel_id)
        .eq('team_id', team_id)
        .select()
        .single();

      if (error) throw error;
      return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // 3. DELETE CHANNEL
    if (action === 'delete_channel') {
      const { channel_id } = payload;
      
      if (!await isTeamAdmin(team_id, user.id)) {
        throw new Error('Only admins can delete channels');
      }

      const { error } = await adminClient
        .from('team_channels')
        .delete()
        .eq('id', channel_id)
        .eq('team_id', team_id);

      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // 4. REORDER CHANNELS
    if (action === 'reorder_channels') {
      const { channel_positions } = payload; // Array of { id, position }
      
      if (!await isTeamAdmin(team_id, user.id)) {
        throw new Error('Only admins can reorder channels');
      }

      for (const { id, position } of channel_positions) {
        await adminClient
          .from('team_channels')
          .update({ position })
          .eq('id', id)
          .eq('team_id', team_id);
      }

      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // 5. FETCH CHANNELS
    if (action === 'fetch_channels') {
      // Any member can fetch
      const { data, error } = await adminClient
        .from('team_channels')
        .select('*')
        .eq('team_id', team_id)
        .order('position', { ascending: true });

      if (error) throw error;
      return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // 6. SEND MESSAGE
    if (action === 'send_message') {
      const { channel_id, content, attachments, mentions } = payload;

      // Validate membership (implicit via auth but good to double check if needed, though RLS handles it)
      // We use adminClient here so we should verify membership manually if we were strict, 
      // but let's rely on the fact that they must be authenticated and we can check team_members.
      
      const { data: member } = await adminClient
        .from('team_members')
        .select('role')
        .eq('team_id', team_id)
        .eq('user_id', user.id)
        .single();

      if (!member) throw new Error('You are not a member of this team');

      // Check for @team mention
      const isTeamPing = content.includes('@team');
      if (isTeamPing) {
        // Only admins can ping @team
        if (!await isTeamAdmin(team_id, user.id)) {
          throw new Error('Only admins can use @team mention');
        }
      }

      // Insert Message
      const { data: message, error } = await adminClient
        .from('team_messages')
        .insert({
          team_id,
          channel_id,
          user_id: user.id,
          content,
          attachments: attachments || [],
          mentions: mentions || []
        })
        .select()
        .single();

      if (error) throw error;

      // NOTIFICATIONS LOGIC (Placeholder for now, but structure is ready)
      // If we had a notifications table, we would insert here.
      // For now, we just return the message.
      
      return new Response(JSON.stringify(message), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // 7. FETCH MESSAGES
    if (action === 'fetch_messages') {
      const { channel_id, page = 0, limit = 50 } = payload;
      const offset = page * limit;

      // SECURITY: Verify user is a team member before fetching messages
      const { data: membership } = await adminClient
        .from('team_members')
        .select('id')
        .eq('team_id', team_id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (!membership) {
        return new Response(
          JSON.stringify({ error: 'Access denied. You are not a member of this team.' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // First, fetch main messages only (exclude thread replies)
      const { data: messages, error } = await adminClient
        .from('team_messages')
        .select('*')
        .eq('team_id', team_id)
        .eq('channel_id', channel_id)
        .is('parent_message_id', null)  // Only parent messages, not thread replies
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      // Fetch pinned message IDs for this channel
      const { data: pinnedMessages } = await adminClient
        .from('pinned_messages')
        .select('message_id')
        .eq('channel_id', channel_id);

      const pinnedMessageIds = new Set(pinnedMessages?.map(pm => pm.message_id) || []);

      // Then, fetch user details for each unique user_id
      const userIds = [...new Set(messages?.map(m => m.user_id).filter(Boolean))] as string[];
      
      const userDetailsMap: Record<string, any> = {};
      
      if (userIds.length > 0) {
        // Fetch from users table instead of profiles
        const { data: profiles } = await adminClient
          .from('users')
          .select('id, email, full_name, avatar_url')
          .in('id', userIds);
          
        profiles?.forEach(profile => {
          userDetailsMap[profile.id] = {
            id: profile.id,
            email: profile.email,
            full_name: profile.full_name,
            avatar_url: profile.avatar_url
          };
        });
      }

      // Transform messages to include user data and is_pinned status
      const formattedMessages = messages?.map((msg: any) => ({
        ...msg,
        is_pinned: pinnedMessageIds.has(msg.id),
        user: userDetailsMap[msg.user_id] || {
          id: msg.user_id,
          email: 'Unknown',
          full_name: 'Unknown User',
          avatar_url: null
        }
      })) || [];

      return new Response(JSON.stringify(formattedMessages), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // ===== WHITELIST ACTIONS =====

    // UPDATE WHITELIST STATUS
    if (action === 'update_whitelist_status') {
      const { enabled } = payload;
      
      if (!await isTeamAdmin(team_id, user.id)) {
        throw new Error('Only admins can change whitelist settings');
      }
      
      const { data, error } = await adminClient
        .from('teams')
        .update({ is_whitelist_enabled: enabled })
        .eq('id', team_id)
        .select()
        .single();
        
      if (error) throw error;
      return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // ADD TO WHITELIST
    if (action === 'add_to_whitelist') {
      const { username, target_user_id } = payload;
      
      if (!await isTeamAdmin(team_id, user.id)) {
        throw new Error('Only admins can manage whitelist');
      }

      let insertData: any = { team_id, added_by: user.id };

      if (target_user_id) {
        // Add by User ID
        insertData.user_id = target_user_id;
        
        // Try to fetch username for completeness
        const { data: u } = await adminClient.from('users').select('username').eq('id', target_user_id).single();
        if (u?.username) insertData.username = u.username.toLowerCase();
      } else if (username) {
        // Add by Username
        const lowerUsername = username.toLowerCase();
        insertData.username = lowerUsername;
        
        // Check if user exists to link ID immediately
        const { data: u } = await adminClient.from('users').select('id').eq('username', lowerUsername).maybeSingle();
        if (u) insertData.user_id = u.id;
      } else {
        throw new Error('Must provide username or user_id');
      }

      const { data, error } = await adminClient
        .from('team_whitelist')
        .insert(insertData)
        .select()
        .single();
        
      if (error) {
        if (error.code === '23505') throw new Error('User is already whitelisted');
        throw error;
      }
      return new Response(JSON.stringify(data), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // REMOVE FROM WHITELIST
    if (action === 'remove_from_whitelist') {
      const { whitelist_id } = payload;
      
      if (!await isTeamAdmin(team_id, user.id)) {
        throw new Error('Only admins can manage whitelist');
      }
      
      const { error } = await adminClient
        .from('team_whitelist')
        .delete()
        .eq('id', whitelist_id)
        .eq('team_id', team_id); // Ensure belongs to team
        
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // GET WHITELIST
    if (action === 'get_whitelist') {
      if (!await isTeamAdmin(team_id, user.id)) {
        throw new Error('Only admins can view whitelist');
      }
      
      const { data: whitelist, error } = await adminClient
        .from('team_whitelist')
        .select('*')
        .eq('team_id', team_id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;

      // Enhance with user details if user_id is present
      const userIds = whitelist.map((w: any) => w.user_id).filter(Boolean);
      
      if (userIds.length > 0) {
        const { data: users } = await adminClient
          .from('users')
          .select('id, full_name, avatar_url, username')
          .in('id', userIds);
          
        const userMap = new Map(users?.map((u: any) => [u.id, u]));
        
        const enhancedWhitelist = whitelist.map((w: any) => {
          if (w.user_id && userMap.has(w.user_id)) {
            const u = userMap.get(w.user_id);
            return {
              ...w,
              full_name: u.full_name,
              avatar_url: u.avatar_url,
              current_username: u.username // In case it changed
            };
          }
          return w;
        });
        
        return new Response(JSON.stringify(enhancedWhitelist), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      
    }

    // --- ACTION: SAVE TEAM FORM ---
    if (action === 'save_team_form') {
      const { questions } = payload;
      
      console.log('save_team_form called with:', { team_id, user_id: user.id, questions });
      
      // Verify user is admin OR creator (fallback)
      const { data: team } = await adminClient
        .from('teams')
        .select('created_by')
        .eq('id', team_id)
        .single();

      console.log('Team data:', team);

      const { data: member } = await adminClient
        .from('team_members')
        .select('role')
        .eq('team_id', team_id)
        .eq('user_id', user.id)
        .single();
        
      console.log('Member data:', member);
        
      const isCreator = team?.created_by === user.id;
      const isAdmin = member?.role === 'admin';
      
      console.log('Permission check:', { isCreator, isAdmin });
        
      if (!isCreator && !isAdmin) {
        console.error('Permission denied');
        throw new Error('Only admins can modify the team form');
      }
      
      console.log('Deleting existing questions for team:', team_id);
      // Delete existing questions
      const { error: deleteError } = await adminClient
        .from('team_form_questions')
        .delete()
        .eq('team_id', team_id);
        
      if (deleteError) {
        console.error('Delete error:', deleteError);
      }
      
      // Insert new questions
      if (questions && questions.length > 0) {
        const questionsToInsert = questions.map((q: any) => ({
          team_id: team_id,
          question_text: q.question_text,
          question_type: q.question_type,
          position: q.position,
          is_required: q.is_required
        }));
        
        console.log('Inserting questions:', questionsToInsert);
        
        const { data: insertedData, error: insertError } = await adminClient
          .from('team_form_questions')
          .insert(questionsToInsert)
          .select();
          
        if (insertError) {
          console.error('Insert error:', insertError);
          throw insertError;
        }
        
        console.log('Successfully inserted:', insertedData);
      }
      
      return new Response(JSON.stringify({ success: true }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // --- ACTION: GET TEAM FORM ---
    if (action === 'get_team_form') {
      console.log('get_team_form called for team_id:', team_id);
      console.log('Querying team_form_questions table with team_id:', team_id);
      
      const { data: questions, error, count } = await adminClient
        .from('team_form_questions')
        .select('*', { count: 'exact' })
        .eq('team_id', team_id)
        .order('position', { ascending: true });
        
      console.log('Raw query result:', { 
        questions, 
        error, 
        count,
        questionsLength: questions?.length,
        questionsType: typeof questions,
        isArray: Array.isArray(questions)
      });
        
      if (error) {
        console.error('get_team_form error:', error);
        throw error;
      }
      
      const result = { questions: questions || [] };
      console.log('Returning response:', JSON.stringify(result));
      
      return new Response(JSON.stringify(result), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // =====================================================
    // WHITELIST MANAGEMENT ACTIONS
    // =====================================================

    // GET WHITELIST
    if (action === 'get_whitelist') {
      if (!await isTeamAdmin(team_id, user.id)) {
        throw new Error('Only admins can view whitelist');
      }
      
      const { data: whitelist, error } = await adminClient
        .from('team_whitelist')
        .select('id, user_id, username, created_at')
        .eq('team_id', team_id);
        
      if (error) throw error;
      
      // Enrich with user details where user_id exists
      const userIdsWithValues = (whitelist || []).filter(w => w.user_id).map(w => w.user_id);
      
      let userMap = new Map();
      if (userIdsWithValues.length > 0) {
        const { data: users } = await adminClient
          .from('users')
          .select('id, full_name, username, avatar_url')
          .in('id', userIdsWithValues);
          
        userMap = new Map((users || []).map(u => [u.id, u]));
      }
      
      const enrichedWhitelist = (whitelist || []).map(entry => {
        const userData = entry.user_id ? userMap.get(entry.user_id) : null;
        return {
          ...entry,
          full_name: userData?.full_name,
          avatar_url: userData?.avatar_url
        };
      });
      
      return new Response(JSON.stringify(enrichedWhitelist), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // UPDATE WHITELIST STATUS (Enable/Disable)
    if (action === 'update_whitelist_status') {
      const { enabled } = payload;
      
      if (!await isTeamAdmin(team_id, user.id)) {
        throw new Error('Only admins can update whitelist status');
      }
      
      const { error } = await adminClient
        .from('teams')
        .update({ is_whitelist_enabled: enabled })
        .eq('id', team_id);
        
      if (error) throw error;
      
      return new Response(JSON.stringify({ success: true }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // ADD TO WHITELIST
    if (action === 'add_to_whitelist') {
      const { target_user_id, username } = payload;
      
      if (!await isTeamAdmin(team_id, user.id)) {
        throw new Error('Only admins can add to whitelist');
      }
      
      // If username provided, normalize it
      const normalizedUsername = username?.toLowerCase().trim();
      
      // Check for duplicates
      if (target_user_id) {
        const { data: existing } = await adminClient
          .from('team_whitelist')
          .select('id')
          .eq('team_id', team_id)
          .eq('user_id', target_user_id)
          .maybeSingle();
          
        if (existing) {
          throw new Error('User is already whitelisted');
        }
      }
      
      if (normalizedUsername) {
        const { data: existing } = await adminClient
          .from('team_whitelist')
          .select('id')
          .eq('team_id', team_id)
          .eq('username', normalizedUsername)
          .maybeSingle();
          
        if (existing) {
          throw new Error('Username is already whitelisted');
        }
        
        // Check if username corresponds to an existing user
        const { data: existingUser } = await adminClient
          .from('users')
          .select('id')
          .eq('username', normalizedUsername)
          .maybeSingle();
          
        // If user found, add with user_id
        if (existingUser) {
          const { data, error } = await adminClient
            .from('team_whitelist')
            .insert({
              team_id,
              user_id: existingUser.id,
              username: normalizedUsername,
              added_by: user.id
            })
            .select()
            .single();
            
          if (error) throw error;
          return new Response(JSON.stringify(data), { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          });
        }
      }
      
      // Insert whitelist entry
      const { data, error } = await adminClient
        .from('team_whitelist')
        .insert({
          team_id,
          user_id: target_user_id || null,
          username: normalizedUsername || null,
          added_by: user.id
        })
        .select()
        .single();
        
      if (error) throw error;
      
      return new Response(JSON.stringify(data), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    // REMOVE FROM WHITELIST
    if (action === 'remove_from_whitelist') {
      const { whitelist_id } = payload;
      
      if (!await isTeamAdmin(team_id, user.id)) {
        throw new Error('Only admins can remove from whitelist');
      }
      
      const { error } = await adminClient
        .from('team_whitelist')
        .delete()
        .eq('id', whitelist_id)
        .eq('team_id', team_id);
        
      if (error) throw error;
      
      return new Response(JSON.stringify({ success: true }), { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }

    throw new Error('Invalid action')
  } catch (error: any) {
    console.error(error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
