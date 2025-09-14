import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ftgnrwxzuecauxwxtkwp.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0Z25yd3h6dWVjYXV4d3h0a3dwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4MDcyNjQsImV4cCI6MjA3MzM4MzI2NH0.sylSikqfQnEFazKmJdmwNTEznwkeYbU7VzpS8_w2-_w'

export const supabase = createClient(supabaseUrl, supabaseKey)

// Game persistence functions
export const gameService = {
  async saveGame(gameState: any, userId?: string) {
    if (!userId) return null

    const { data, error } = await supabase
      .from('games')
      .upsert({
        player_id: userId,
        game_state: gameState,
        status: 'active',
        turn_count: gameState.turn,
        light_cycle: gameState.cycle.step
      })
      .select()

    if (error) throw error
    return data
  },

  async loadGame(userId: string) {
    const { data, error } = await supabase
      .from('games')
      .select('game_state')
      .eq('player_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data?.game_state || null
  },

  async getLeaderboard(limit = 10) {
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*')
      .order('score', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data
  },

  async submitScore(userId: string, score: number, difficulty: string, victoryType: string) {
    const { data, error } = await supabase
      .from('leaderboard')
      .insert({
        player_id: userId,
        score,
        ai_difficulty: difficulty,
        victory_type: victoryType,
        turns: Math.floor(score / 10)
      })

    if (error) throw error
    return data
  }
}

// Auth helpers
export const authService = {
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  async signInAnonymously() {
    const { data, error } = await supabase.auth.signInAnonymously()
    if (error) throw error
    return data
  }
}
