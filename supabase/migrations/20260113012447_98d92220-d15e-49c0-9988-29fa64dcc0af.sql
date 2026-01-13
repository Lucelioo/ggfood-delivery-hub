-- Add policy for drivers to claim available orders (update driver_id when it's null)
CREATE POLICY "Drivers can claim available orders" 
ON public.orders 
FOR UPDATE 
USING (
  driver_id IS NULL 
  AND status IN ('pending', 'confirmed', 'preparing', 'ready') 
  AND has_role(auth.uid(), 'driver'::app_role)
)
WITH CHECK (
  driver_id IN (
    SELECT id FROM drivers WHERE user_id = auth.uid()
  )
);