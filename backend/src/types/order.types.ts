export type OrderStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'preparing' 
  | 'ready' 
  | 'out_for_delivery' 
  | 'delivered' 
  | 'cancelled'

export type PaymentMethod = 'credit_card' | 'debit_card' | 'pix' | 'cash'

export interface DeliveryAddress {
  name: string
  phone: string
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state?: string
}

export interface OrderItem {
  productId: string
  productName: string
  productPrice: number
  quantity: number
  notes?: string
}

export interface CreateOrderRequest {
  items: OrderItem[]
  deliveryAddress: DeliveryAddress
  paymentMethod: PaymentMethod
  notes?: string
}

export interface UpdateOrderStatusRequest {
  orderId: string
  status: OrderStatus
  driverId?: string
}

export interface ClaimOrderRequest {
  orderId: string
}

export interface Order {
  id: string
  userId: string
  status: OrderStatus
  subtotal: number
  deliveryFee: number
  total: number
  deliveryAddress: DeliveryAddress
  paymentMethod: PaymentMethod
  notes?: string
  driverId?: string
  estimatedDelivery?: string
  deliveredAt?: string
  createdAt: string
  updatedAt: string
  items: OrderItem[]
}

export interface OrderWithCustomer extends Order {
  customer?: {
    name: string
    phone: string
  }
}
