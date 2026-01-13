import { createAdminClient } from '../config/supabase.ts'

export class StatsRepository {
  private supabase = createAdminClient()

  async getTotalOrdersCount() {
    const { count, error } = await this.supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })

    if (error) throw error
    return count || 0
  }

  async getDeliveredOrdersRevenue() {
    const { data, error } = await this.supabase
      .from('orders')
      .select('total')
      .eq('status', 'delivered')

    if (error) throw error
    return data?.reduce((sum, order) => sum + (order.total || 0), 0) || 0
  }

  async getAvailableProductsCount() {
    const { count, error } = await this.supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('is_available', true)

    if (error) throw error
    return count || 0
  }

  async getAvailableDriversCount() {
    const { count, error } = await this.supabase
      .from('drivers')
      .select('id', { count: 'exact', head: true })
      .eq('is_available', true)

    if (error) throw error
    return count || 0
  }

  async getPendingOrdersCount() {
    const { count, error } = await this.supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .in('status', ['pending', 'confirmed', 'preparing'])

    if (error) throw error
    return count || 0
  }

  async getTodayOrdersCount() {
    const today = new Date().toISOString().split('T')[0]
    
    const { count, error } = await this.supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', today)

    if (error) throw error
    return count || 0
  }

  async getDriverDeliveryHistory(driverId: string, limit: number = 50) {
    const { data, error } = await this.supabase
      .from('orders')
      .select(`
        *,
        order_items (*),
        profiles:user_id (id, name, phone)
      `)
      .eq('driver_id', driverId)
      .eq('status', 'delivered')
      .order('delivered_at', { ascending: false })
      .limit(limit)

    if (error) throw error
    return data
  }
}
