import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { OrderService } from '../../../backend/src/services/OrderService.ts'
import { authenticateRequest } from '../../../backend/src/middlewares/authMiddleware.ts'
import { requireDriver } from '../../../backend/src/middlewares/roleMiddleware.ts'
import { corsHeaders, successResponse, errorResponse } from '../../../backend/src/types/api.types.ts'

const orderService = new OrderService()

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const authResult = await authenticateRequest(req)
    if (!authResult.success || !authResult.user) {
      return authResult.error!
    }

    const roleResult = await requireDriver(authResult.user.id)
    if (!roleResult.success) {
      return roleResult.error!
    }

    const orders = await orderService.getAvailableOrders()

    return successResponse({
      orders,
      count: orders.length,
      fetchedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Get available orders error:', error)
    return errorResponse('Erro ao buscar pedidos disponíveis', 500)
  }
})
