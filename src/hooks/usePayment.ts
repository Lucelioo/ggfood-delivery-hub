import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PixPaymentResult {
  id: string;
  status: string;
  qrCode: string;
  qrCodeBase64: string;
  expirationDate: string;
}

export interface CardPaymentResult {
  id: string;
  status: string;
  statusDetail: string;
}

interface CreatePaymentParams {
  orderId: string;
  paymentMethod: 'pix' | 'credit_card' | 'debit_card';
  cardToken?: string;
  installments?: number;
  paymentMethodId?: string;
}

export const useCreatePayment = () => {
  return useMutation({
    mutationFn: async (params: CreatePaymentParams) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Não autenticado');

      const response = await supabase.functions.invoke('create-payment', {
        body: params,
      });

      if (response.error) {
        throw new Error(response.error.message || 'Erro ao processar pagamento');
      }

      return response.data;
    },
  });
};

export const useCheckPaymentStatus = () => {
  return useMutation({
    mutationFn: async (orderId: string) => {
      const { data, error } = await supabase
        .from('orders')
        .select('payment_status, payment_id')
        .eq('id', orderId)
        .single();

      if (error) throw error;
      return data;
    },
  });
};
