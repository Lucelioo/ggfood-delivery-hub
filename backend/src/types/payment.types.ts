export type PaymentStatus = 'pending' | 'approved' | 'rejected' | 'refunded' | 'cancelled'

export interface CreatePixPaymentRequest {
  orderId: string
  amount: number
  description: string
  payerEmail: string
}

export interface CreateCardPaymentRequest {
  orderId: string
  amount: number
  description: string
  token: string
  installments: number
  payerEmail: string
  paymentMethodId: string
}

export interface PixPaymentResponse {
  paymentId: string
  status: PaymentStatus
  qrCode: string
  qrCodeBase64: string
  expirationDate: string
}

export interface CardPaymentResponse {
  paymentId: string
  status: PaymentStatus
  statusDetail: string
}

export interface PaymentWebhookData {
  id: string
  action: string
  data: {
    id: string
  }
}

export interface MercadoPagoPayment {
  id: number
  status: string
  status_detail: string
  external_reference: string
  transaction_amount: number
  payment_method_id: string
  payment_type_id: string
  payer: {
    email: string
  }
  point_of_interaction?: {
    transaction_data?: {
      qr_code?: string
      qr_code_base64?: string
    }
  }
  date_of_expiration?: string
}
