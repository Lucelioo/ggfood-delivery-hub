import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// Categories
export const useAdminCategories = () => {
  return useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('sort_order');

      if (error) throw error;
      return data;
    },
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (category: { name: string; icon?: string; sort_order?: number }) => {
      const { data, error } = await supabase
        .from('categories')
        .insert(category)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: { id: string; name?: string; icon?: string; sort_order?: number; is_active?: boolean }) => {
      const { error } = await supabase
        .from('categories')
        .update(data)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

// Products
export const useAdminProducts = () => {
  return useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name)')
        .order('sort_order');

      if (error) throw error;
      return data;
    },
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (product: {
      name: string;
      description?: string;
      price: number;
      image_url?: string;
      category_id?: string;
      is_available?: boolean;
      is_featured?: boolean;
    }) => {
      const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: {
      id: string;
      name?: string;
      description?: string;
      price?: number;
      image_url?: string;
      category_id?: string;
      is_available?: boolean;
      is_featured?: boolean;
    }) => {
      const { error } = await supabase
        .from('products')
        .update(data)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
};

// Orders
export const useAdminOrders = () => {
  return useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(*),
          drivers(name, phone)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch profiles separately
      const userIds = [...new Set(orders?.map(o => o.user_id).filter(Boolean) as string[])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, name, email, phone')
        .in('user_id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]));

      return orders?.map(order => ({
        ...order,
        profile: order.user_id ? profileMap.get(order.user_id) : null,
      }));
    },
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, driver_id }: { id: string; status: string; driver_id?: string }) => {
      const updateData: Record<string, unknown> = { status };
      if (driver_id !== undefined) {
        updateData.driver_id = driver_id;
      }
      if (status === 'delivered') {
        updateData.delivered_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    },
  });
};

// Drivers
export const useAdminDrivers = () => {
  return useQuery({
    queryKey: ['admin-drivers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .order('name');

      if (error) throw error;
      return data;
    },
  });
};

export const useCreateDriver = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (driver: {
      name: string;
      phone: string;
      vehicle_type?: string;
      vehicle_plate?: string;
      user_id: string;
    }) => {
      const { data, error } = await supabase
        .from('drivers')
        .insert(driver)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-drivers'] });
    },
  });
};

export const useUpdateDriver = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: {
      id: string;
      name?: string;
      phone?: string;
      vehicle_type?: string;
      vehicle_plate?: string;
      is_active?: boolean;
      is_available?: boolean;
    }) => {
      const { error } = await supabase
        .from('drivers')
        .update(data)
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-drivers'] });
    },
  });
};

export const useDeleteDriver = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('drivers')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-drivers'] });
    },
  });
};

// Users without driver role (for creating new drivers)
export const useUsersWithoutDriverRole = () => {
  return useQuery({
    queryKey: ['users-without-driver'],
    queryFn: async () => {
      // Get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, name, email, phone')
        .order('name');

      if (profilesError) throw profilesError;

      // Get users who already are drivers
      const { data: drivers, error: driversError } = await supabase
        .from('drivers')
        .select('user_id');

      if (driversError) throw driversError;

      const driverUserIds = new Set(drivers?.map(d => d.user_id) || []);

      // Filter out users who are already drivers
      return profiles?.filter(p => !driverUserIds.has(p.user_id)) || [];
    },
  });
};

export const useCreateDriverFromUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      user_id: string;
      name: string;
      phone: string;
      vehicle_type?: string;
      vehicle_plate?: string;
    }) => {
      // First add driver role to user_roles
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: data.user_id,
          role: 'driver',
        });

      if (roleError && !roleError.message.includes('duplicate')) {
        throw roleError;
      }

      // Then create driver record
      const { data: driver, error: driverError } = await supabase
        .from('drivers')
        .insert({
          user_id: data.user_id,
          name: data.name,
          phone: data.phone,
          vehicle_type: data.vehicle_type || 'moto',
          vehicle_plate: data.vehicle_plate || null,
          is_active: true,
          is_available: false,
        })
        .select()
        .single();

      if (driverError) throw driverError;
      return driver;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-drivers'] });
      queryClient.invalidateQueries({ queryKey: ['users-without-driver'] });
    },
  });
};

// Dashboard Stats
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const [ordersRes, productsRes, driversRes] = await Promise.all([
        supabase.from('orders').select('id, total, status, created_at'),
        supabase.from('products').select('id, is_available'),
        supabase.from('drivers').select('id, is_available'),
      ]);

      if (ordersRes.error) throw ordersRes.error;
      if (productsRes.error) throw productsRes.error;
      if (driversRes.error) throw driversRes.error;

      const orders = ordersRes.data || [];
      const todayOrders = orders.filter(o => new Date(o.created_at) >= today);
      const pendingOrders = orders.filter(o => ['pending', 'confirmed', 'preparing'].includes(o.status || ''));

      return {
        totalOrders: orders.length,
        todayOrders: todayOrders.length,
        todayRevenue: todayOrders.reduce((sum, o) => sum + Number(o.total), 0),
        totalRevenue: orders.reduce((sum, o) => sum + Number(o.total), 0),
        pendingOrders: pendingOrders.length,
        totalProducts: productsRes.data?.length || 0,
        availableProducts: productsRes.data?.filter(p => p.is_available).length || 0,
        totalDrivers: driversRes.data?.length || 0,
        availableDrivers: driversRes.data?.filter(d => d.is_available).length || 0,
      };
    },
  });
};
