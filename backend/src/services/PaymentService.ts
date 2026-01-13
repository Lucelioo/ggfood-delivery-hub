import { 
  CreatePixPaymentRequest, 
  CreateCardPaymentRequest, 
  PixPaymentResponse, 
  CardPaymentResponse,
  MercadoPagoPayment 
} from '../types/payment.types.ts'

const MERCADOPAGO_API_URL = 'https://api.mercadopago.com/v1'

export class PaymentService {
  private accessToken: string

  constructor() {
    this.accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN') || ''
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${MERCADOPAGO_API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': crypto.randomUUID(),
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Mercado Pago API error:', error)
      throw new Error(error.message || 'Erro ao processar pagamento')
    }

    return response.json()
  }

  async createPixPayment(request: CreatePixPaymentRequest): Promise<PixPaymentResponse> {
    const expirationDate = new Date()
    expirationDate.setMinutes(expirationDate.getMinutes() + 30)

    const paymentData = {
      transaction_amount: request.amount,
      description: request.description,
      payment_method_id: 'pix',
      payer: {
        email: request.payerEmail,
      },
      external_reference: request.orderId,
      date_of_expiration: expirationDate.toISOString(),
    }

    const payment: MercadoPagoPayment = await this.makeRequest('/payments', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    })

    return {
      paymentId: String(payment.id),
      status: this.mapStatus(payment.status),
      qrCode: payment.point_of_interaction?.transaction_data?.qr_code || '',
      qrCodeBase64: payment.point_of_interaction?.transaction_data?.qr_code_base64 || '',
      expirationDate: payment.date_of_expiration || expirationDate.toISOString(),
    }
  }

  async createCardPayment(request: CreateCardPaymentRequest): Promise<CardPaymentResponse> {
    const paymentData = {
      transaction_amount: request.amount,
      description: request.description,
      token: request.token,
      installments: request.installments,
      payment_method_id: request.paymentMethodId,
      payer: {
        email: request.payerEmail,
      },
      external_reference: request.orderId,
    }

    const payment: MercadoPagoPayment = await this.makeRequest('/payments', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    })

    return {
      paymentId: String(payment.id),
      status: this.mapStatus(payment.status),
      statusDetail: payment.status_detail,
    }
  }

  async getPayment(paymentId: string): Promise<MercadoPagoPayment> {
    return this.makeRequest(`/payments/${paymentId}`)
  }

  private mapStatus(mpStatus: string): 'pending' | 'approved' | 'rejected' | 'refunded' | 'cancelled' {
    const statusMap: Record<string, 'pending' | 'approved' | 'rejected' | 'refunded' | 'cancelled'> = {
      'pending': 'pending',
      'in_process': 'pending',
      'in_mediation': 'pending',
      'approved': 'approved',
      'authorized': 'approved',
      'rejected': 'rejected',
      'cancelled': 'cancelled',
      'refunded': 'refunded',
      'charged_back': 'refunded',
    }
    return statusMap[mpStatus] || 'pending'
  }
}
