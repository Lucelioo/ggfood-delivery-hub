import { OrderService } from '../services/OrderService.ts'
import { authenticateRequest } from '../middlewares/authMiddleware.ts'
import { requireAdmin, requireDriver, requireAdminOrDriver } from '../middlewares/roleMiddleware.ts'
import { corsHeaders, successResponse, errorResponse } from '../types/api.types.ts'
import { CreateOrderRequest, UpdateOrderStatusRequest, ClaimOrderRequest } from '../types/order.types.ts'

export class OrderController {
  private orderService = new OrderService()

  async handleRequest(req: Request): Promise<Response> {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders })
    }

    const url = new URL(req.url)
    const path = url.pathname.split('/').filter(Boolean)

    try {
      // POST /orders - Create order
      if (req.method === 'POST' && path.length === 1) {
        return this.create(req)
      }

      // GET /orders - List user orders
      if (req.method === 'GET' && path.length === 1) {
        return this.list(req)
      }

      // GET /orders/available - List available orders for drivers
      if (req.method === 'GET' && path[1] === 'available') {
        return this.listAvailable(req)
      }

      // POST /orders/:id/claim - Claim order (driver)
      if (req.method === 'POST' && path[2] === 'claim') {
        return this.claim(req, path[1])
      }

      // PATCH /orders/:id/status - Update order status
      if (req.method === 'PATCH' && path[2] === 'status') {
        return this.updateStatus(req, path[1])
      }

      return errorResponse('Rota não encontrada', 404)
    } catch (error) {
      console.error('OrderController error:', error)
      return errorResponse('Erro interno do servidor', 500)
    }
  }

  async create(req: Request): Promise<Response> {
    // Authenticate
    const authResult = await authenticateRequest(req)
    if (!authResult.success || !authResult.user) {
      return authResult.error!
    }

    try {
      const body: CreateOrderRequest = await req.json()

      // Validate required fields
      if (!body.items || !body.deliveryAddress || !body.paymentMethod) {
        return errorResponse('Dados incompletos do pedido')
      }

      const order = await this.orderService.createOrder(authResult.user.id, body)

      return successResponse(order, 'Pedido criado com sucesso')
    } catch (error) {
      console.error('Create order error:', error)
      return errorResponse(error instanceof Error ? error.message : 'Erro ao criar pedido')
    }
  }

  async list(req: Request): Promise<Response> {
    const authResult = await authenticateRequest(req)
    if (!authResult.success || !authResult.user) {
      return authResult.error!
    }

    try {
      const orders = await this.orderService.getUserOrders(authResult.user.id)
      return successResponse(orders)
    } catch (error) {
      console.error('List orders error:', error)
      return errorResponse('Erro ao listar pedidos')
    }
  }

  async listAvailable(req: Request): Promise<Response> {
    const authResult = await authenticateRequest(req)
    if (!authResult.success || !authResult.user) {
      return authResult.error!
    }

    // Check driver role
    const roleResult = await requireDriver(authResult.user.id)
    if (!roleResult.success) {
      return roleResult.error!
    }

    try {
      const orders = await this.orderService.getAvailableOrders()
      return successResponse({
        orders,
        count: orders.length,
        fetchedAt: new Date().toISOString(),
      })
    } catch (error) {
      console.error('List available orders error:', error)
      return errorResponse('Erro ao listar pedidos disponíveis')
    }
  }

  async claim(req: Request, orderId: string): Promise<Response> {
    const authResult = await authenticateRequest(req)
    if (!authResult.success || !authResult.user) {
      return authResult.error!
    }

    // Check driver role
    const roleResult = await requireDriver(authResult.user.id)
    if (!roleResult.success) {
      return roleResult.error!
    }

    try {
      const result = await this.orderService.claimOrder(orderId, authResult.user.id)
      return successResponse(result, 'Pedido atribuído com sucesso')
    } catch (error) {
      console.error('Claim order error:', error)
      return errorResponse(error instanceof Error ? error.message : 'Erro ao aceitar pedido')
    }
  }

  async updateStatus(req: Request, orderId: string): Promise<Response> {
    const authResult = await authenticateRequest(req)
    if (!authResult.success || !authResult.user) {
      return authResult.error!
    }

    // Check admin or driver role
    const roleResult = await requireAdminOrDriver(authResult.user.id)
    if (!roleResult.success) {
      return roleResult.error!
    }

    try {
      const body: UpdateOrderStatusRequest = await req.json()

      if (!body.status) {
        return errorResponse('Status não informado')
      }

      const order = await this.orderService.updateOrderStatus(
        orderId,
        body.status,
        body.driverId
      )

      return successResponse(order, 'Status atualizado com sucesso')
    } catch (error) {
      console.error('Update status error:', error)
      return errorResponse('Erro ao atualizar status')
    }
  }
}
