import { createAdminClient } from '../config/supabase.ts'
import { Driver } from '../types/driver.types.ts'

export class DriverRepository {
  private supabase = createAdminClient()

  async findByUserId(userId: string) {
    const { data, error } = await this.supabase
      .from('drivers')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  async findById(driverId: string) {
    const { data, error } = await this.supabase
      .from('drivers')
      .select('*')
      .eq('id', driverId)
      .single()

    if (error) throw error
    return data
  }

  async findAll() {
    const { data, error } = await this.supabase
      .from('drivers')
      .select('*')
      .order('name')

    if (error) throw error
    return data
  }

  async findAvailable() {
    const { data, error } = await this.supabase
      .from('drivers')
      .select('*')
      .eq('is_available', true)

    if (error) throw error
    return data
  }

  async countAvailable() {
    const { count, error } = await this.supabase
      .from('drivers')
      .select('id', { count: 'exact', head: true })
      .eq('is_available', true)

    if (error) throw error
    return count || 0
  }

  async updateAvailability(userId: string, isAvailable: boolean) {
    const { data, error } = await this.supabase
      .from('drivers')
      .update({ is_available: isAvailable })
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async updateLocation(userId: string, latitude: number, longitude: number) {
    const { data, error } = await this.supabase
      .from('drivers')
      .update({
        current_latitude: latitude,
        current_longitude: longitude,
      })
      .eq('user_id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async create(driverData: Partial<Driver>) {
    const { data, error } = await this.supabase
      .from('drivers')
      .insert(driverData)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async update(driverId: string, driverData: Partial<Driver>) {
    const { data, error } = await this.supabase
      .from('drivers')
      .update(driverData)
      .eq('id', driverId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async delete(driverId: string) {
    const { error } = await this.supabase
      .from('drivers')
      .delete()
      .eq('id', driverId)

    if (error) throw error
  }
}
