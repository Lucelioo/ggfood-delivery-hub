export interface DashboardStats {
  totalOrders: number
  totalRevenue: number
  availableProducts: number
  availableDrivers: number
  pendingOrders: number
  todayOrders: number
}

export interface RevenueByPeriod {
  date: string
  revenue: number
  orderCount: number
}

export interface TopProduct {
  id: string
  name: string
  totalSold: number
  revenue: number
}
