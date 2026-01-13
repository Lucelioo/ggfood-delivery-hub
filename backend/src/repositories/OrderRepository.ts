import { createAdminClient } from '../config/supabase.ts'
import { Order, OrderStatus, CreateOrderRequest, DeliveryAddress, PaymentMethod } from '../types/order.types.ts'

export class OrderRepository {
  private supabase = createAdminClient()

  async create(
    userId: string,
    subtotal: number,
    deliveryFee: number,
    total: number,
    deliveryAddress: DeliveryAddress,
    paymentMethod: PaymentMethod,
    notes?: string
  ) {
    const { data, error } = await this.supabase
      .from('orders')
      .insert({
        user_id: userId,
        subtotal,
        delivery_fee: deliveryFee,
        total,
        delivery_address: deliveryAddress,
        payment_method: paymentMethod,
        notes,
        status: 'pending',
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async createOrderItems(
    orderId: string,
    items: { productId: string; productName: string; productPrice: number; quantity: number; notes?: string }[]
  ) {
    const orderItems = items.map(item => ({
      order_id: orderId,
      product_id: item.productId,
      product_name: item.productName,
      product_price: item.productPrice,
      quantity: item.quantity,
      notes: item.notes,
    }))

    const { error } = await this.supabase
      .from('order_items')
      .insert(orderItems)

    if (error) throw error
  }

  async findById(orderId: string) {
    const { data, error } = await this.supabase
      .from('orders')
      .select(`
        *,
        order_items (*),
        profiles:user_id (id, name, phone)
      `)
      .eq('id', orderId)
      .single()

    if (error) throw error
    return data
  }

  async findByUserId(userId: string) {
    const { data, error } = await this.supabase
      .from('orders')
      .select(`*, order_items (*)`)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  async findAvailable() {
    const { data, error } = await this.supabase
      .from('orders')
      .select(`
        *,
        order_items (*),
        profiles:user_id (id, name, phone)
      `)
      .is('driver_id', null)
      .in('status', ['pending', 'confirmed', 'preparing', 'ready'])
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  async findByDriverId(driverId: string) {
    const { data, error } = await this.supabase
      .from('orders')
      .select(`
        *,
        order_items (*),
        profiles:user_id (id, name, phone)
      `)
      .eq('driver_id', driverId)
      .neq('status', 'delivered')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  async findAll() {
    const { data, error } = await this.supabase
      .from('orders')
      .select(`
        *,
        order_items (*),
        profiles:user_id (id, name, phone),
        drivers:driver_id (id, name, phone)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  async updateStatus(orderId: string, status: OrderStatus, deliveredAt?: string) {
    const updateData: Record<string, unknown> = { status }
    if (deliveredAt) {
      updateData.delivered_at = deliveredAt
    }

    const { data, error } = await this.supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async assignDriver(orderId: string, driverId: string, status?: OrderStatus) {
    const updateData: Record<string, unknown> = { driver_id: driverId }
    if (status) {
      updateData.status = status
    }

    const { data, error } = await this.supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async delete(orderId: string) {
    const { error } = await this.supabase
      .from('orders')
      .delete()
      .eq('id', orderId)

    if (error) throw error
  }
}
