import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface OrderItem {
  productId: string
  productName: string
  productPrice: number
  quantity: number
  notes?: string
}

interface DeliveryAddress {
  name: string
  phone: string
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state?: string
}

interface CreateOrderRequest {
  items: OrderItem[]
  deliveryAddress: DeliveryAddress
  paymentMethod: 'credit_card' | 'debit_card' | 'pix' | 'cash'
  notes?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Create Supabase client with user's auth token
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Usuário não autenticado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const { items, deliveryAddress, paymentMethod, notes }: CreateOrderRequest = await req.json()

    // Validate required fields
    if (!items || items.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Carrinho vazio' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!deliveryAddress || !deliveryAddress.street || !deliveryAddress.number) {
      return new Response(
        JSON.stringify({ error: 'Endereço de entrega incompleto' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!paymentMethod) {
      return new Response(
        JSON.stringify({ error: 'Método de pagamento não selecionado' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + item.productPrice * item.quantity, 0)
    const deliveryFee = subtotal >= 50 ? 0 : 5.99
    const total = subtotal + deliveryFee

    // Create order in database
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .insert([{
        user_id: user.id,
        delivery_address: deliveryAddress,
        subtotal,
        delivery_fee: deliveryFee,
        total,
        payment_method: paymentMethod,
        notes,
        estimated_delivery: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
      }])
      .select()
      .single()

    if (orderError) {
      console.error('Error creating order:', orderError)
      return new Response(
        JSON.stringify({ error: 'Erro ao criar pedido' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create order items
    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.productId,
      product_name: item.productName,
      product_price: item.productPrice,
      quantity: item.quantity,
      notes: item.notes,
    }))

    const { error: itemsError } = await supabaseClient
      .from('order_items')
      .insert(orderItems)

    if (itemsError) {
      console.error('Error creating order items:', itemsError)
      // Rollback: delete the order if items failed
      await supabaseClient.from('orders').delete().eq('id', order.id)
      return new Response(
        JSON.stringify({ error: 'Erro ao adicionar itens do pedido' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        order: { ...order, items: orderItems },
        message: 'Pedido criado com sucesso!'
      }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
