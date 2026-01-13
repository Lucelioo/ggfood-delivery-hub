-- Allow customers to update their own orders to confirm receipt
CREATE POLICY "Users can confirm their own orders" 
ON public.orders 
FOR UPDATE 
USING (auth.uid() = user_id AND status = 'delivered')
WITH CHECK (auth.uid() = user_id);