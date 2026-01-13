import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { OrderService } from '../../../backend/src/services/OrderService.ts'
import { authenticateRequest } from '../../../backend/src/middlewares/authMiddleware.ts'
import { requireDriver } from '../../../backend/src/middlewares/roleMiddleware.ts'
import { corsHeaders, successResponse, errorResponse } from '../../../backend/src/types/api.types.ts'
import { ClaimOrderRequest } from '../../../backend/src/types/order.types.ts'

/**
 * Edge Function: claim-order
 * 
 * Endpoint para entregadores reivindicarem pedidos.
 * Apenas entregadores online podem usar este endpoint.
 * 
 * POST /claim-order
 * Body: { orderId }
 */

const orderService = new OrderService()

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

    // Check driver role
    const roleResult = await requireDriver(authResult.user.id)
    if (!roleResult.success) {
      return roleResult.error!
    }

    // Parse request body
    const { orderId }: ClaimOrderRequest = await req.json()

    if (!orderId) {
      return errorResponse('ID do pedido não fornecido')
    }

    // Claim order using service
    const result = await orderService.claimOrder(orderId, authResult.user.id)

    return successResponse(result, 'Pedido atribuído com sucesso!')

  } catch (error) {
    console.error('Claim order error:', error)
    return errorResponse(
      error instanceof Error ? error.message : 'Erro interno do servidor',
      error instanceof Error && error.message.includes('não') ? 400 : 500
    )
  }
})
