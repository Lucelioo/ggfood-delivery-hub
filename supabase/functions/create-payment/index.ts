import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const MERCADOPAGO_API_URL = 'https://api.mercadopago.com/v1'

async function makePaymentRequest(endpoint: string, accessToken: string, options: RequestInit = {}) {
  const response = await fetch(`${MERCADOPAGO_API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
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

function mapStatus(mpStatus: string): string {
  const statusMap: Record<string, string> = {
    'pending': 'pending',
    'in_process': 'pending',
    'in_mediation': 'pending',
    'approved': 'paid',
    'authorized': 'paid',
    'rejected': 'failed',
    'cancelled': 'failed',
    'refunded': 'refunded',
    'charged_back': 'refunded',
  }
  return statusMap[mpStatus] || 'pending'
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')
    if (!accessToken) {
      throw new Error('MERCADOPAGO_ACCESS_TOKEN não configurado')
    }

    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Não autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const token = authHeader.replace('Bearer ', '')
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token)
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: 'Token inválido' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const userId = claimsData.claims.sub
    const userEmail = claimsData.claims.email as string

    const { orderId, paymentMethod, cardToken, installments, paymentMethodId } = await req.json()

    if (!orderId || !paymentMethod) {
      return new Response(
        JSON.stringify({ error: 'Dados incompletos' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify order belongs to user
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { data: order, error: orderError } = await adminClient
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('user_id', userId)
      .single()

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ error: 'Pedido não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (paymentMethod === 'pix') {
      const expirationDate = new Date()
      expirationDate.setMinutes(expirationDate.getMinutes() + 30)

      const paymentData = {
        transaction_amount: Number(order.total),
        description: `Pedido #${order.order_number}`,
        payment_method_id: 'pix',
        payer: {
          email: userEmail,
        },
        external_reference: orderId,
        date_of_expiration: expirationDate.toISOString(),
      }

      const payment = await makePaymentRequest('/payments', accessToken, {
        method: 'POST',
        body: JSON.stringify(paymentData),
      })

      const paymentStatus = mapStatus(payment.status)

      // Update order with payment info
      await adminClient
        .from('orders')
        .update({
          payment_id: String(payment.id),
          payment_status: paymentStatus,
        })
        .eq('id', orderId)

      return new Response(
        JSON.stringify({
          success: true,
          payment: {
            id: String(payment.id),
            status: paymentStatus,
            qrCode: payment.point_of_interaction?.transaction_data?.qr_code || '',
            qrCodeBase64: payment.point_of_interaction?.transaction_data?.qr_code_base64 || '',
            expirationDate: payment.date_of_expiration || expirationDate.toISOString(),
          },
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else if (paymentMethod === 'credit_card' || paymentMethod === 'debit_card') {
      if (!cardToken || !paymentMethodId) {
        return new Response(
          JSON.stringify({ error: 'Token do cartão não fornecido' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const paymentData = {
        transaction_amount: Number(order.total),
        description: `Pedido #${order.order_number}`,
        token: cardToken,
        installments: installments || 1,
        payment_method_id: paymentMethodId,
        payer: {
          email: userEmail,
        },
        external_reference: orderId,
      }

      const payment = await makePaymentRequest('/payments', accessToken, {
        method: 'POST',
        body: JSON.stringify(paymentData),
      })

      const paymentStatus = mapStatus(payment.status)

      // Update order with payment info
      const newStatus = paymentStatus === 'paid' ? 'confirmed' : order.status
      await adminClient
        .from('orders')
        .update({
          payment_id: String(payment.id),
          payment_status: paymentStatus,
          status: newStatus,
        })
        .eq('id', orderId)

      return new Response(
        JSON.stringify({
          success: true,
          payment: {
            id: String(payment.id),
            status: paymentStatus,
            statusDetail: payment.status_detail,
          },
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else {
      return new Response(
        JSON.stringify({ error: 'Método de pagamento inválido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
  } catch (error) {
    console.error('Create payment error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro interno' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
