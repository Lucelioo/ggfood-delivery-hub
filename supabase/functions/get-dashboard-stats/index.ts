import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { StatsService } from '../../../backend/src/services/StatsService.ts'
import { authenticateRequest } from '../../../backend/src/middlewares/authMiddleware.ts'
import { requireAdmin } from '../../../backend/src/middlewares/roleMiddleware.ts'
import { corsHeaders, successResponse, errorResponse } from '../../../backend/src/types/api.types.ts'

/**
 * Edge Function: get-dashboard-stats
 * 
 * Endpoint para buscar estatísticas do dashboard administrativo.
 * Apenas administradores podem acessar.
 * 
 * GET /get-dashboard-stats
 */

const statsService = new StatsService()

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Authenticate user
    const authResult = await authenticateRequest(req)
    if (!authResult.success || !authResult.user) {
      return authResult.error!
    }

    // Check admin role
    const roleResult = await requireAdmin(authResult.user.id)
    if (!roleResult.success) {
      return roleResult.error!
    }

    // Get dashboard stats using service
    const stats = await statsService.getDashboardStats()

    return successResponse({
      stats,
      generatedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Get dashboard stats error:', error)
    return errorResponse('Erro ao buscar estatísticas', 500)
  }
})
