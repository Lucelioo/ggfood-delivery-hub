import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { StatsService } from '../../../backend/src/services/StatsService.ts'
import { authenticateRequest } from '../../../backend/src/middlewares/authMiddleware.ts'
import { requireAdmin } from '../../../backend/src/middlewares/roleMiddleware.ts'
import { corsHeaders, successResponse, errorResponse } from '../../../backend/src/types/api.types.ts'

const statsService = new StatsService()

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const authResult = await authenticateRequest(req)
    if (!authResult.success || !authResult.user) {
      return authResult.error!
    }

    const roleResult = await requireAdmin(authResult.user.id)
    if (!roleResult.success) {
      return roleResult.error!
    }

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
