export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number
  page: number
  limit: number
}

export interface AuthenticatedUser {
  id: string
  email?: string
  role?: 'admin' | 'driver' | 'customer'
}

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

export function jsonResponse<T>(data: ApiResponse<T>, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

export function errorResponse(error: string, status: number = 400): Response {
  return jsonResponse({ success: false, error }, status)
}

export function successResponse<T>(data: T, message?: string): Response {
  return jsonResponse({ success: true, data, message }, 200)
}
