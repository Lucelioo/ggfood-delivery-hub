export interface Driver {
  id: string
  userId: string
  name: string
  phone: string
  vehicleType: string
  vehiclePlate: string
  isAvailable: boolean
  currentLatitude?: number
  currentLongitude?: number
  createdAt: string
  updatedAt: string
}

export interface DriverProfile {
  id: string
  userId: string
  name: string
  phone: string
  vehicleType: string
  vehiclePlate: string
  isAvailable: boolean
}

export interface UpdateDriverLocationRequest {
  latitude: number
  longitude: number
}

export interface UpdateDriverAvailabilityRequest {
  isAvailable: boolean
}
