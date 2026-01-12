import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useDriverProfile = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['driver-profile', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

export const useUpdateDriverAvailability = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (is_available: boolean) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('drivers')
        .update({ is_available })
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driver-profile'] });
    },
  });
};

export const useUpdateDriverLocation = () => {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ latitude, longitude }: { latitude: number; longitude: number }) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('drivers')
        .update({
          current_latitude: latitude,
          current_longitude: longitude,
        })
        .eq('user_id', user.id);

      if (error) throw error;
    },
  });
};

export const useDriverOrders = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['driver-orders', user?.id],
    queryFn: async () => {
      if (!user) return [];

      // First get the driver id
      const { data: driver } = await supabase
        .from('drivers')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!driver) return [];

      const { data: orders, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('driver_id', driver.id)
        .in('status', ['ready', 'delivering'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch profiles separately
      const userIds = [...new Set(orders?.map(o => o.user_id).filter(Boolean) as string[])];
      
      if (userIds.length === 0) return orders?.map(o => ({ ...o, profile: null })) || [];

      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, name, phone')
        .in('user_id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]));

      return orders?.map(order => ({
        ...order,
        profile: order.user_id ? profileMap.get(order.user_id) : null,
      })) || [];
    },
    enabled: !!user,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};

export const useDriverDeliveryHistory = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['driver-history', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data: driver } = await supabase
        .from('drivers')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!driver) return [];

      const { data: orders, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('driver_id', driver.id)
        .eq('status', 'delivered')
        .order('delivered_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return orders || [];
    },
    enabled: !!user,
  });
};

export const useUpdateDeliveryStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: 'delivering' | 'delivered' }) => {
      const updateData: Record<string, unknown> = { status };
      
      if (status === 'delivered') {
        updateData.delivered_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', orderId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driver-orders'] });
      queryClient.invalidateQueries({ queryKey: ['driver-history'] });
    },
  });
};
