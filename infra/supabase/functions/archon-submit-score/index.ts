import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { userId, score, mode, difficulty } = await req.json()

  // Validate input
  if (!userId || typeof score !== 'number' || score < 0) {
    return new Response(JSON.stringify({ error: 'Invalid input parameters' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Validate user exists
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Validate score (basic anti-cheat)
    if (score > 10000) {
      return new Response(JSON.stringify({ error: 'Score too high' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Insert leaderboard entry
    const { data, error } = await supabase
      .from('leaderboard')
      .insert({
        player_id: userId,
        game_mode: mode || 'single_player',
        ai_difficulty: difficulty,
        score: score,
        turns: Math.floor(score / 10), // Estimate turns from score
        victory_type: 'elimination'
      })
      .select()

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({
      success: true,
      entry: data[0]
    }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})
