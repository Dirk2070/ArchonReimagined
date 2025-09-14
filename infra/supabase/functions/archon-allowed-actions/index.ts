import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { state } = await req.json()

  // Validate input
  if (!state || typeof state !== 'object') {
    return new Response(JSON.stringify({ error: 'Invalid state' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    // Basic validation - in production, import core logic
    if (!state.units || !Array.isArray(state.units)) {
      return new Response(JSON.stringify({ error: 'Invalid game state' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Mock allowed actions - replace with actual GameLogic.getAllowedActions(state)
    const actions = [
      {
        type: 'END_TURN',
        unitId: '',
        cost: { ap: 0 }
      }
    ]

    // Add unit-specific actions
    if (state.units && state.active) {
      state.units
        .filter((unit: any) => unit.side === state.active && !unit.hasMoved)
        .forEach((unit: any) => {
          // Add basic move actions (simplified)
          for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
              if (dx === 0 && dy === 0) continue
              const newX = unit.position.x + dx
              const newY = unit.position.y + dy
              if (newX >= 0 && newX < 9 && newY >= 0 && newY < 9) {
                actions.push({
                  type: 'MOVE',
                  unitId: unit.id,
                  from: [unit.position.x, unit.position.y],
                  to: [newX, newY],
                  cost: { ap: 1 }
                })
              }
            }
          }
        })
    }

    return new Response(JSON.stringify({ actions }), {
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})
