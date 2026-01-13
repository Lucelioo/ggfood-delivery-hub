import { StatsRepository } from '../repositories/StatsRepository.ts'
import { DashboardStats } from '../types/dashboard.types.ts'

export class StatsService {
  private statsRepository = new StatsRepository()

  async getDashboardStats(): Promise<DashboardStats> {
    const [
      totalOrders,
      totalRevenue,
      availableProducts,
      availableDrivers,
      pendingOrders,
      todayOrders,
    ] = await Promise.all([
      this.statsRepository.getTotalOrdersCount(),
      this.statsRepository.getDeliveredOrdersRevenue(),
      this.statsRepository.getAvailableProductsCount(),
      this.statsRepository.getAvailableDriversCount(),
      this.statsRepository.getPendingOrdersCount(),
      this.statsRepository.getTodayOrdersCount(),
    ])

    return {
      totalOrders,
      totalRevenue,
      availableProducts,
      availableDrivers,
      pendingOrders,
      todayOrders,
    }
  }
}
