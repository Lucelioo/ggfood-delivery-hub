import { DriverService } from '../services/DriverService.ts'
import { OrderService } from '../services/OrderService.ts'
import { authenticateRequest } from '../middlewares/authMiddleware.ts'
import { requireDriver } from '../middlewares/roleMiddleware.ts'
import { corsHeaders, successResponse, errorResponse } from '../types/api.types.ts'
import { UpdateDriverLocationRequest, UpdateDriverAvailabilityRequest } from '../types/driver.types.ts'

export class DriverController {
  private driverService = new DriverService()
  private orderService = new OrderService()

  async handleRequest(req: Request): Promise<Response> {
    if (req.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders })
    }

    const url = new URL(req.url)
    const path = url.pathname.split('/').filter(Boolean)

    try {
      if (req.method === 'GET' && path[1] === 'profile') {
        return this.getProfile(req)
      }

      if (req.method === 'PATCH' && path[1] === 'availability') {
        return this.updateAvailability(req)
      }

      if (req.method === 'PATCH' && path[1] === 'location') {
        return this.updateLocation(req)
      }

      if (req.method === 'GET' && path[1] === 'orders') {
        return this.getOrders(req)
      }

      if (req.method === 'GET' && path[1] === 'history') {
        return this.getHistory(req)
      }

      return errorResponse('Rota não encontrada', 404)
    } catch (error) {
      console.error('DriverController error:', error)
      return errorResponse('Erro interno do servidor', 500)
    }
  }

  async getProfile(req: Request): Promise<Response> {
    const authResult = await authenticateRequest(req)
    if (!authResult.success || !authResult.user) {
      return authResult.error!
    }

    const roleResult = await requireDriver(authResult.user.id)
    if (!roleResult.success) {
      return roleResult.error!
    }

    try {
      const profile = await this.driverService.getDriverProfile(authResult.user.id)
      return successResponse(profile)
    } catch (error) {
      console.error('Get profile error:', error)
      return errorResponse(error instanceof Error ? error.message : 'Erro ao buscar perfil')
    }
  }

  async updateAvailability(req: Request): Promise<Response> {
    const authResult = await authenticateRequest(req)
    if (!authResult.success || !authResult.user) {
      return authResult.error!
    }

    const roleResult = await requireDriver(authResult.user.id)
    if (!roleResult.success) {
      return roleResult.error!
    }

    try {
      const body: UpdateDriverAvailabilityRequest = await req.json()

      if (typeof body.isAvailable !== 'boolean') {
        return errorResponse('Campo isAvailable é obrigatório')
      }

      const result = await this.driverService.updateAvailability(
        authResult.user.id,
        body.isAvailable
      )

      return successResponse(result, `Status atualizado para ${body.isAvailable ? 'online' : 'offline'}`)
    } catch (error) {
      console.error('Update availability error:', error)
      return errorResponse('Erro ao atualizar disponibilidade')
    }
  }

  async updateLocation(req: Request): Promise<Response> {
    const authResult = await authenticateRequest(req)
    if (!authResult.success || !authResult.user) {
      return authResult.error!
    }

    const roleResult = await requireDriver(authResult.user.id)
    if (!roleResult.success) {
      return roleResult.error!
    }

    try {
      const body: UpdateDriverLocationRequest = await req.json()

      if (typeof body.latitude !== 'number' || typeof body.longitude !== 'number') {
        return errorResponse('Latitude e longitude são obrigatórios')
      }

      const result = await this.driverService.updateLocation(
        authResult.user.id,
        body.latitude,
        body.longitude
      )

      return successResponse(result)
    } catch (error) {
      console.error('Update location error:', error)
      return errorResponse(error instanceof Error ? error.message : 'Erro ao atualizar localização')
    }
  }

  async getOrders(req: Request): Promise<Response> {
    const authResult = await authenticateRequest(req)
    if (!authResult.success || !authResult.user) {
      return authResult.error!
    }

    const roleResult = await requireDriver(authResult.user.id)
    if (!roleResult.success) {
      return roleResult.error!
    }

    try {
      const driver = await this.driverService.getDriverProfile(authResult.user.id)
      const orders = await this.orderService.getDriverOrders(driver.id)

      return successResponse({
        orders,
        count: orders.length,
      })
    } catch (error) {
      console.error('Get driver orders error:', error)
      return errorResponse('Erro ao buscar pedidos')
    }
  }

  async getHistory(req: Request): Promise<Response> {
    const authResult = await authenticateRequest(req)
    if (!authResult.success || !authResult.user) {
      return authResult.error!
    }

    const roleResult = await requireDriver(authResult.user.id)
    if (!roleResult.success) {
      return roleResult.error!
    }

    try {
      const history = await this.driverService.getDeliveryHistory(authResult.user.id)

      return successResponse({
        deliveries: history,
        count: history.length,
      })
    } catch (error) {
      console.error('Get history error:', error)
      return errorResponse('Erro ao buscar histórico')
    }
  }
}
