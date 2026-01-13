import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const MERCADOPAGO_API_URL = 'https://api.mercadopago.com/v1'

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

    const body = await req.json()
    console.log('Webhook received:', JSON.stringify(body))

    if (body.type !== 'payment' && body.action !== 'payment.updated' && body.action !== 'payment.created') {
      return new Response(
        JSON.stringify({ message: 'Notification type ignored' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const paymentId = body.data?.id
    if (!paymentId) {
      return new Response(
        JSON.stringify({ error: 'Payment ID not found' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const paymentResponse = await fetch(`${MERCADOPAGO_API_URL}/payments/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    if (!paymentResponse.ok) {
      throw new Error('Falha ao buscar detalhes do pagamento')
    }

    const payment = await paymentResponse.json()

    const orderId = payment.external_reference
    if (!orderId) {
      console.log('No order reference in payment')
      return new Response(
        JSON.stringify({ message: 'No order reference' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const paymentStatus = mapStatus(payment.status)
    
    const updateData: Record<string, string> = {
      payment_status: paymentStatus,
      payment_id: String(payment.id),
    }

    if (paymentStatus === 'paid') {
      const { data: order } = await supabase
        .from('orders')
        .select('status')
        .eq('id', orderId)
        .single()

      if (order?.status === 'pending') {
        updateData.status = 'confirmed'
      }
    }

    const { error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)

    if (updateError) {
      console.error('Error updating order:', updateError)
      throw updateError
    }

    console.log(`Order ${orderId} updated with payment status: ${paymentStatus}`)

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro interno' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
