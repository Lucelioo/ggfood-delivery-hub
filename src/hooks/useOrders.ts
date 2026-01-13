import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tables, Json } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';

export type Order = Tables<'orders'>;
export type OrderItem = Tables<'order_items'>;

export const useOrders = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['orders', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });
};

interface DeliveryAddress {
  name: string;
  phone: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state?: string;
}

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      items,
      deliveryAddress,
      paymentMethod,
      notes,
    }: {
      items: { productId: string; productName: string; productPrice: number; quantity: number; notes?: string }[];
      deliveryAddress: DeliveryAddress;
      paymentMethod: 'credit_card' | 'debit_card' | 'pix' | 'cash';
      notes?: string;
    }) => {
      if (!user) throw new Error('User must be logged in');

      const subtotal = items.reduce((sum, item) => sum + item.productPrice * item.quantity, 0);
      const deliveryFee = subtotal >= 50 ? 0 : 5.99;
      const total = subtotal + deliveryFee;

      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert([{
          user_id: user.id,
          delivery_address: deliveryAddress as unknown as Json,
          subtotal,
          delivery_fee: deliveryFee,
          total,
          payment_method: paymentMethod,
          notes,
          estimated_delivery: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.productId,
        product_name: item.productName,
        product_price: item.productPrice,
        quantity: item.quantity,
        notes: item.notes,
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      return order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useConfirmOrderReceipt = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (orderId: string) => {
      if (!user) throw new Error('User must be logged in');

      const { data, error } = await supabase
        .from('orders')
        .update({ customer_confirmed_at: new Date().toISOString() })
        .eq('id', orderId)
        .eq('user_id', user.id)
        .eq('status', 'delivered')
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};
