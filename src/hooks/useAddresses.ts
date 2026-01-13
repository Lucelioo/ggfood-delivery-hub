import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, TablesInsert } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';

export type Address = Tables<'addresses'>;

export const useAddresses = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['addresses', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false });
      
      if (error) throw error;
      return data as Address[];
    },
    enabled: !!user,
  });
};

export const useCreateAddress = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (address: Omit<TablesInsert<'addresses'>, 'user_id'>) => {
      if (!user) throw new Error('User must be logged in');

      const { data, error } = await supabase
        .from('addresses')
        .insert({
          ...address,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });
};

export const useSetDefaultAddress = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (addressId: string) => {
      if (!user) throw new Error('User must be logged in');

      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', user.id);

      const { error } = await supabase
        .from('addresses')
        .update({ is_default: true })
        .eq('id', addressId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });
};
