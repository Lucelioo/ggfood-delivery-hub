import { OrderRepository } from '../repositories/OrderRepository.ts'
import { DriverRepository } from '../repositories/DriverRepository.ts'
import { 
  CreateOrderRequest, 
  OrderItem, 
  OrderStatus,
  OrderWithCustomer 
} from '../types/order.types.ts'

export class OrderService {
  private orderRepository = new OrderRepository()
  private driverRepository = new DriverRepository()

  calculateTotals(items: OrderItem[]) {
    const subtotal = items.reduce(
      (sum, item) => sum + item.productPrice * item.quantity,
      0
    )
    const deliveryFee = 5.00 // Taxa fixa de entrega
    const total = subtotal + deliveryFee

    return { subtotal, deliveryFee, total }
  }

  validateOrderItems(items: OrderItem[]): { valid: boolean; error?: string } {
    if (!items || items.length === 0) {
      return { valid: false, error: 'Carrinho vazio' }
    }

    for (const item of items) {
      if (!item.productId || !item.productName || item.quantity <= 0) {
        return { valid: false, error: 'Item inválido no carrinho' }
      }
      if (item.productPrice < 0) {
        return { valid: false, error: 'Preço inválido' }
      }
    }

    return { valid: true }
  }

  async createOrder(userId: string, orderData: CreateOrderRequest) {
    // Validate items
    const validation = this.validateOrderItems(orderData.items)
    if (!validation.valid) {
      throw new Error(validation.error)
    }

    // Calculate totals
    const { subtotal, deliveryFee, total } = this.calculateTotals(orderData.items)

    // Create order
    const order = await this.orderRepository.create(
      userId,
      subtotal,
      deliveryFee,
      total,
      orderData.deliveryAddress,
      orderData.paymentMethod,
      orderData.notes
    )

    // Create order items
    await this.orderRepository.createOrderItems(order.id, orderData.items)

    return {
      ...order,
      subtotal,
      deliveryFee,
      total,
      items: orderData.items,
    }
  }

  async getOrderById(orderId: string) {
    return this.orderRepository.findById(orderId)
  }

  async getUserOrders(userId: string) {
    return this.orderRepository.findByUserId(userId)
  }

  async getAvailableOrders(): Promise<OrderWithCustomer[]> {
    const orders = await this.orderRepository.findAvailable()
    
    return orders?.map(order => this.formatOrderWithCustomer(order)) || []
  }

  async getDriverOrders(driverId: string) {
    const orders = await this.orderRepository.findByDriverId(driverId)
    return orders?.map(order => this.formatOrderWithCustomer(order)) || []
  }

  async getAllOrders() {
    return this.orderRepository.findAll()
  }

  async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    driverId?: string
  ) {
    // If status is delivered, set delivered_at
    const deliveredAt = status === 'delivered' 
      ? new Date().toISOString() 
      : undefined

    // Update status
    const order = await this.orderRepository.updateStatus(orderId, status, deliveredAt)

    // If driverId provided, assign driver
    if (driverId) {
      await this.orderRepository.assignDriver(orderId, driverId)
    }

    return order
  }

  async claimOrder(orderId: string, userId: string) {
    // Get driver info
    const driver = await this.driverRepository.findByUserId(userId)
    
    if (!driver) {
      throw new Error('Entregador não encontrado')
    }

    if (!driver.is_available) {
      throw new Error('Você precisa estar online para aceitar pedidos')
    }

    // Check if order is available
    const order = await this.orderRepository.findById(orderId)
    
    if (!order) {
      throw new Error('Pedido não encontrado')
    }

    if (order.driver_id) {
      throw new Error('Pedido já foi atribuído a outro entregador')
    }

    const claimableStatuses = ['pending', 'confirmed', 'preparing', 'ready']
    if (!claimableStatuses.includes(order.status)) {
      throw new Error('Este pedido não está disponível para entrega')
    }

    // Assign driver to order
    const newStatus = order.status === 'ready' ? 'out_for_delivery' : order.status
    const updatedOrder = await this.orderRepository.assignDriver(
      orderId,
      driver.id,
      newStatus as OrderStatus
    )

    return {
      order: updatedOrder,
      driver: {
        id: driver.id,
        name: driver.name,
      },
    }
  }

  private formatOrderWithCustomer(order: Record<string, unknown>): OrderWithCustomer {
    const profiles = order.profiles as { name?: string; phone?: string } | null
    const orderItems = order.order_items as Array<{
      product_name: string
      quantity: number
      product_price: number
      notes?: string
    }> | null

    return {
      id: order.id as string,
      userId: order.user_id as string,
      status: order.status as OrderStatus,
      subtotal: order.subtotal as number,
      deliveryFee: order.delivery_fee as number,
      total: order.total as number,
      deliveryAddress: order.delivery_address as OrderWithCustomer['deliveryAddress'],
      paymentMethod: order.payment_method as OrderWithCustomer['paymentMethod'],
      notes: order.notes as string | undefined,
      driverId: order.driver_id as string | undefined,
      estimatedDelivery: order.estimated_delivery as string | undefined,
      deliveredAt: order.delivered_at as string | undefined,
      createdAt: order.created_at as string,
      updatedAt: order.updated_at as string,
      customer: profiles ? {
        name: profiles.name || '',
        phone: profiles.phone || '',
      } : undefined,
      items: orderItems?.map(item => ({
        productId: '',
        productName: item.product_name,
        productPrice: item.product_price,
        quantity: item.quantity,
        notes: item.notes,
      })) || [],
    }
  }
}
