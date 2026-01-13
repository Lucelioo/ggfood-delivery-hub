-- Expand driver visibility to include unassigned active orders (not yet delivered/cancelled)
DROP POLICY IF EXISTS "Drivers can view available orders" ON public.orders;

CREATE POLICY "Drivers can view available orders"
ON public.orders
FOR SELECT
USING (
  driver_id IS NULL
  AND status IN (
    'pending'::order_status,
    'confirmed'::order_status,
    'preparing'::order_status,
    'ready'::order_status
  )
  AND has_role(auth.uid(), 'driver'::app_role)
);