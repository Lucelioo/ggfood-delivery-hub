import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ClaimOrderRequest {
  orderId: string
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
        JSON.stringify({ error: 'Apenas entregadores podem reivindicar pedidos' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get driver data
    const { data: driver, error: driverError } = await supabaseAdmin
      .from('drivers')
      .select('id, is_available')
      .eq('user_id', user.id)
      .single()

    if (driverError || !driver) {
      return new Response(
        JSON.stringify({ error: 'Perfil de entregador não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if driver is available/online
    if (!driver.is_available) {
      return new Response(
        JSON.stringify({ error: 'Você precisa estar online para pegar pedidos' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const { orderId }: ClaimOrderRequest = await req.json()

    if (!orderId) {
      return new Response(
        JSON.stringify({ error: 'ID do pedido não fornecido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if order is available
    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('id, status, driver_id')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ error: 'Pedido não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate order can be claimed
    if (order.driver_id) {
      return new Response(
        JSON.stringify({ error: 'Este pedido já foi atribuído a outro entregador' }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const claimableStatuses = ['pending', 'confirmed', 'preparing', 'ready']
    if (!claimableStatuses.includes(order.status)) {
      return new Response(
        JSON.stringify({ error: 'Este pedido não está mais disponível' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Claim the order - assign driver_id
    const { data: updatedOrder, error: updateError } = await supabaseAdmin
      .from('orders')
      .update({ 
        driver_id: driver.id,
        status: order.status === 'ready' ? 'out_for_delivery' : order.status
      })
      .eq('id', orderId)
      .eq('driver_id', null) // Double-check to prevent race conditions
      .select()
      .single()

    if (updateError) {
      console.error('Error claiming order:', updateError)
      return new Response(
        JSON.stringify({ error: 'Erro ao reivindicar pedido. Tente novamente.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!updatedOrder) {
      return new Response(
        JSON.stringify({ error: 'Pedido já foi atribuído a outro entregador' }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        order: updatedOrder,
        message: 'Pedido atribuído com sucesso!'
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
