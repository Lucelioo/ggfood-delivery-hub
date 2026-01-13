import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useOrderReview = (orderId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['review', orderId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('order_id', orderId)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user && !!orderId,
  });
};

export const useCreateReview = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      orderId,
      rating,
      comment,
    }: {
      orderId: string;
      rating: number;
      comment?: string;
    }) => {
      if (!user) throw new Error('User must be logged in');

      const { data, error } = await supabase
        .from('reviews')
        .insert({
          order_id: orderId,
          user_id: user.id,
          rating,
          comment,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['review', variables.orderId] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useOrdersWithReviews = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['orders-reviews', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('reviews')
        .select('order_id')
        .eq('user_id', user.id);

      if (error) throw error;
      return data.map((r) => r.order_id);
    },
    enabled: !!user,
  });
};
