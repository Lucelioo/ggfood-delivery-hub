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

    // Check if user has admin role
    const { data: userRole } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (userRole?.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Acesso negado. Apenas administradores.' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch dashboard statistics in parallel
    const [ordersResult, revenueResult, productsResult, driversResult, pendingOrdersResult, todayOrdersResult] = await Promise.all([
      // Total orders count
      supabaseAdmin.from('orders').select('id', { count: 'exact', head: true }),
      
      // Total revenue (sum of delivered orders)
      supabaseAdmin
        .from('orders')
        .select('total')
        .eq('status', 'delivered'),
      
      // Available products count
      supabaseAdmin
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('is_available', true),
      
      // Available drivers count
      supabaseAdmin
        .from('drivers')
        .select('id', { count: 'exact', head: true })
        .eq('is_available', true),
      
      // Pending orders count
      supabaseAdmin
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .in('status', ['pending', 'confirmed', 'preparing']),
      
      // Today's orders count
      supabaseAdmin
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', new Date().toISOString().split('T')[0])
    ])

    // Calculate total revenue
    const totalRevenue = revenueResult.data?.reduce((sum, order) => sum + (order.total || 0), 0) || 0

    // Build statistics object
    const stats = {
      totalOrders: ordersResult.count || 0,
      totalRevenue,
      availableProducts: productsResult.count || 0,
      availableDrivers: driversResult.count || 0,
      pendingOrders: pendingOrdersResult.count || 0,
      todayOrders: todayOrdersResult.count || 0,
    }

    // Return success response
    return new Response(
      JSON.stringify({ 
        success: true, 
        stats,
        generatedAt: new Date().toISOString()
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
