import { DriverRepository } from '../repositories/DriverRepository.ts'
import { StatsRepository } from '../repositories/StatsRepository.ts'

export class DriverService {
  private driverRepository = new DriverRepository()
  private statsRepository = new StatsRepository()

  async getDriverProfile(userId: string) {
    const driver = await this.driverRepository.findByUserId(userId)
    
    if (!driver) {
      throw new Error('Perfil de entregador não encontrado')
    }

    return {
      id: driver.id,
      userId: driver.user_id,
      name: driver.name,
      phone: driver.phone,
      vehicleType: driver.vehicle_type,
      vehiclePlate: driver.vehicle_plate,
      isAvailable: driver.is_available,
    }
  }

  async updateAvailability(userId: string, isAvailable: boolean) {
    const driver = await this.driverRepository.updateAvailability(userId, isAvailable)
    
    return {
      id: driver.id,
      isAvailable: driver.is_available,
    }
  }

  async updateLocation(userId: string, latitude: number, longitude: number) {
    if (latitude < -90 || latitude > 90) {
      throw new Error('Latitude inválida')
    }
    if (longitude < -180 || longitude > 180) {
      throw new Error('Longitude inválida')
    }

    const driver = await this.driverRepository.updateLocation(userId, latitude, longitude)
    
    return {
      id: driver.id,
      currentLatitude: driver.current_latitude,
      currentLongitude: driver.current_longitude,
    }
  }

  async getDeliveryHistory(userId: string, limit: number = 50) {
    const driver = await this.driverRepository.findByUserId(userId)
    
    if (!driver) {
      throw new Error('Entregador não encontrado')
    }

    const orders = await this.statsRepository.getDriverDeliveryHistory(driver.id, limit)
    
    return orders?.map(order => ({
      id: order.id,
      status: order.status,
      total: order.total,
      deliveryAddress: order.delivery_address,
      deliveredAt: order.delivered_at,
      customer: order.profiles ? {
        name: order.profiles.name,
        phone: order.profiles.phone,
      } : null,
    })) || []
  }

  async getAllDrivers() {
    return this.driverRepository.findAll()
  }

  async getAvailableDrivers() {
    return this.driverRepository.findAvailable()
  }
}
