import { StatsService } from '../services/StatsService.ts'
import { authenticateRequest } from '../middlewares/authMiddleware.ts'
import { requireAdmin } from '../middlewares/roleMiddleware.ts'
import { corsHeaders, successResponse, errorResponse } from '../types/api.types.ts'

export class DashboardController {
  private statsService = new StatsService()

  async handleRequest(req: Request): Promise<Response> {
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders })
    }

    const url = new URL(req.url)
    const path = url.pathname.split('/').filter(Boolean)

    try {
      if (req.method === 'GET' && path[1] === 'stats') {
        return this.getStats(req)
      }

      return errorResponse('Rota não encontrada', 404)
    } catch (error) {
      console.error('DashboardController error:', error)
      return errorResponse('Erro interno do servidor', 500)
    }
  }

  async getStats(req: Request): Promise<Response> {
    const authResult = await authenticateRequest(req)
    if (!authResult.success || !authResult.user) {
      return authResult.error!
    }

    const roleResult = await requireAdmin(authResult.user.id)
    if (!roleResult.success) {
      return roleResult.error!
    }

    try {
      const stats = await this.statsService.getDashboardStats()

      return successResponse({
        stats,
        generatedAt: new Date().toISOString(),
      })
    } catch (error) {
      console.error('Get stats error:', error)
      return errorResponse('Erro ao buscar estatísticas')
    }
  }
}
