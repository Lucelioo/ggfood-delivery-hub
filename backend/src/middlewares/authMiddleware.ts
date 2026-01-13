import { createUserClient } from '../config/supabase.ts'
import { AuthenticatedUser, errorResponse } from '../types/api.types.ts'

export interface AuthResult {
  success: boolean
  user?: AuthenticatedUser
  error?: Response
}

export async function authenticateRequest(req: Request): Promise<AuthResult> {
  const authHeader = req.headers.get('Authorization')

  if (!authHeader) {
    return {
      success: false,
      error: errorResponse('Token de autenticação não fornecido', 401),
    }
  }

  try {
    const supabase = createUserClient(authHeader)
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return {
        success: false,
        error: errorResponse('Usuário não autenticado', 401),
      }
    }

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
      },
    }
  } catch (error) {
    console.error('Authentication error:', error)
    return {
      success: false,
      error: errorResponse('Erro na autenticação', 500),
    }
  }
}

export function extractAuthHeader(req: Request): string | null {
  return req.headers.get('Authorization')
}
