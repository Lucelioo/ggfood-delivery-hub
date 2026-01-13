import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { OrderService } from '../../../backend/src/services/OrderService.ts'
import { authenticateRequest } from '../../../backend/src/middlewares/authMiddleware.ts'
import { requireAdminOrDriver, checkUserRole } from '../../../backend/src/middlewares/roleMiddleware.ts'
import { corsHeaders, successResponse, errorResponse } from '../../../backend/src/types/api.types.ts'
import { OrderStatus, UpdateOrderStatusRequest } from '../../../backend/src/types/order.types.ts'

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

    const roleResult = await requireAdminOrDriver(authResult.user.id)
    if (!roleResult.success) {
      return roleResult.error!
    }

    const { orderId, status, driverId }: UpdateOrderStatusRequest = await req.json()

    if (!orderId) {
      return errorResponse('ID do pedido não fornecido')
    }

    if (!status) {
      return errorResponse('Status não fornecido')
    }

    const validStatuses: OrderStatus[] = [
      'pending', 'confirmed', 'preparing', 'ready', 
      'out_for_delivery', 'delivered', 'cancelled'
    ]
    
    if (!validStatuses.includes(status)) {
      return errorResponse('Status inválido')
    }

     Update order status using service
    const order = await orderService.updateOrderStatus(orderId, status, driverId)

    return successResponse(order, `Status atualizado para: ${status}`)

  } catch (error) {
    console.error('Update order status error:', error)
    return errorResponse(
      error instanceof Error ? error.message : 'Erro interno do servidor',
      500
    )
  }
})
