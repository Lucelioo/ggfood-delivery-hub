import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { OrderService } from '../../../backend/src/services/OrderService.ts'
import { authenticateRequest } from '../../../backend/src/middlewares/authMiddleware.ts'
import { corsHeaders, successResponse, errorResponse } from '../../../backend/src/types/api.types.ts'
import { CreateOrderRequest } from '../../../backend/src/types/order.types.ts'

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

    const body: CreateOrderRequest = await req.json()

    if (!body.items || body.items.length === 0) {
      return errorResponse('Carrinho vazio')
    }

    if (!body.deliveryAddress || !body.deliveryAddress.street || !body.deliveryAddress.number) {
      return errorResponse('Endereço de entrega incompleto')
    }

    if (!body.paymentMethod) {
      return errorResponse('Método de pagamento não selecionado')
    }

    const order = await orderService.createOrder(authResult.user.id, body)

    return new Response(
      JSON.stringify({ 
        success: true, 
        order,
        message: 'Pedido criado com sucesso!'
      }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Create order error:', error)
    return errorResponse(
      error instanceof Error ? error.message : 'Erro interno do servidor',
      500
    )
  }
})
