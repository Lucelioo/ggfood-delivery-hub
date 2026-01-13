import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Create Supabase client with service role for database operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Create client with user token for auth check
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

    // Check if user has driver role
    const { data: userRole } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (userRole?.role !== 'driver') {
      return new Response(
        JSON.stringify({ error: 'Acesso negado. Apenas entregadores.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch available orders (no driver assigned, ready statuses)
    const { data: orders, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select(`
        *,
        order_items (*),
        profiles:user_id (
          id,
          name,
          phone
        )
      `)
      .is('driver_id', null)
      .in('status', ['pending', 'confirmed', 'preparing', 'ready'])
      .order('created_at', { ascending: false })

    if (ordersError) {
      console.error('Error fetching orders:', ordersError)
      return new Response(
        JSON.stringify({ error: 'Erro ao buscar pedidos' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Format orders for response
    const formattedOrders = orders?.map(order => ({
      id: order.id,
      status: order.status,
      total: order.total,
      subtotal: order.subtotal,
      deliveryFee: order.delivery_fee,
      deliveryAddress: order.delivery_address,
      paymentMethod: order.payment_method,
      notes: order.notes,
      estimatedDelivery: order.estimated_delivery,
      createdAt: order.created_at,
      customer: order.profiles ? {
        name: order.profiles.name,
        phone: order.profiles.phone,
      } : null,
      items: order.order_items?.map((item: { product_name: string; quantity: number; product_price: number; notes?: string }) => ({
        name: item.product_name,
        quantity: item.quantity,
        price: item.product_price,
        notes: item.notes,
      })) || [],
    })) || []

    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        orders: formattedOrders,
        count: formattedOrders.length,
        fetchedAt: new Date().toISOString()
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
