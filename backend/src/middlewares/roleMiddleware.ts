import { createAdminClient } from '../config/supabase.ts'
import { AuthenticatedUser, errorResponse } from '../types/api.types.ts'

export type UserRole = 'admin' | 'driver' | 'customer'

export interface RoleCheckResult {
  success: boolean
  role?: UserRole
  error?: Response
}

export async function checkUserRole(userId: string): Promise<RoleCheckResult> {
  try {
    const supabase = createAdminClient()

    const { data: userRole, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('Error fetching user role:', error)
      return {
        success: true,
        role: 'customer', // Default role if not found
      }
    }

    return {
      success: true,
      role: userRole?.role as UserRole || 'customer',
    }
  } catch (error) {
    console.error('Role check error:', error)
    return {
      success: false,
      error: errorResponse('Erro ao verificar permissões', 500),
    }
  }
}

export async function requireRole(
  userId: string,
  requiredRoles: UserRole[]
): Promise<RoleCheckResult> {
  const roleResult = await checkUserRole(userId)

  if (!roleResult.success) {
    return roleResult
  }

  if (!roleResult.role || !requiredRoles.includes(roleResult.role)) {
    return {
      success: false,
      error: errorResponse(
        `Acesso negado. Requer: ${requiredRoles.join(' ou ')}`,
        403
      ),
    }
  }

  return roleResult
}

export async function requireAdmin(userId: string): Promise<RoleCheckResult> {
  return requireRole(userId, ['admin'])
}

export async function requireDriver(userId: string): Promise<RoleCheckResult> {
  return requireRole(userId, ['driver'])
}

export async function requireAdminOrDriver(userId: string): Promise<RoleCheckResult> {
  return requireRole(userId, ['admin', 'driver'])
}
