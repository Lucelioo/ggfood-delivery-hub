import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type AppRole = 'admin' | 'customer' | 'driver';

export const useUserRole = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-role', user?.id],
    queryFn: async (): Promise<AppRole | null> => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user role:', error);
        return null;
      }

      return data?.role as AppRole || null;
    },
    enabled: !!user,
  });
};

export const useIsAdmin = () => {
  const { data: role, isLoading } = useUserRole();
  return { isAdmin: role === 'admin', isLoading };
};

export const useIsDriver = () => {
  const { data: role, isLoading } = useUserRole();
  return { isDriver: role === 'driver', isLoading };
};
