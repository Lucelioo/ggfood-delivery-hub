-- Allow drivers to view orders that are ready and have no driver assigned
CREATE POLICY "Drivers can view available orders" 
ON public.orders 
FOR SELECT 
USING (
  status = 'ready' 
  AND driver_id IS NULL 
  AND has_role(auth.uid(), 'driver'::app_role)
);