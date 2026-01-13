import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type AppRole = 'admin' | 'customer' | 'driver';

export const useUserRoles = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-roles', user?.id],
    queryFn: async (): Promise<AppRole[]> => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching user roles:', error);
        return [];
      }

      return (data?.map(r => r.role as AppRole)) || [];
    },
    enabled: !!user,
  });
};

export const useUserRole = () => {
  const { data: roles, isLoading } = useUserRoles();
  return { 
    data: roles?.[0] || null, 
    isLoading 
  };
};

export const useIsAdmin = () => {
  const { data: roles, isLoading } = useUserRoles();
  return { isAdmin: roles?.includes('admin') ?? false, isLoading };
};

export const useIsDriver = () => {
  const { data: roles, isLoading } = useUserRoles();
  return { isDriver: roles?.includes('driver') ?? false, isLoading };
};
