import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled'

interface UpdateOrderStatusRequest {
  orderId: string
  status: OrderStatus
  driverId?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Create Supabase client with service role for admin operations
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

    // Check if user has admin or driver role
    const { data: userRole } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    const isAdmin = userRole?.role === 'admin'
    const isDriver = userRole?.role === 'driver'

    if (!isAdmin && !isDriver) {
      return new Response(
        JSON.stringify({ error: 'Permissão negada' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parse request body
    const { orderId, status, driverId }: UpdateOrderStatusRequest = await req.json()

    // Validate required fields
    if (!orderId) {
      return new Response(
        JSON.stringify({ error: 'ID do pedido não fornecido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!status) {
      return new Response(
        JSON.stringify({ error: 'Status não fornecido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate status value
    const validStatuses: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled']
    if (!validStatuses.includes(status)) {
      return new Response(
        JSON.stringify({ error: 'Status inválido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // If driver, verify they are assigned to this order (for certain status changes)
    if (isDriver && !isAdmin) {
      const { data: driverData } = await supabaseAdmin
        .from('drivers')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (driverData) {
        const { data: order } = await supabaseAdmin
          .from('orders')
          .select('driver_id')
          .eq('id', orderId)
          .single()

        if (order?.driver_id !== driverData.id) {
          return new Response(
            JSON.stringify({ error: 'Você não está atribuído a este pedido' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
      }
    }

    // Prepare update data
    const updateData: Record<string, unknown> = { status }
    
    // Set delivered_at timestamp when status is 'delivered'
    if (status === 'delivered') {
      updateData.delivered_at = new Date().toISOString()
    }

    // Assign driver if provided (admin only)
    if (driverId && isAdmin) {
      updateData.driver_id = driverId
    }

    // Update order status
    const { data: updatedOrder, error: updateError } = await supabaseAdmin
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating order:', updateError)
      return new Response(
        JSON.stringify({ error: 'Erro ao atualizar pedido' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        order: updatedOrder,
        message: `Status atualizado para: ${status}`
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
