-- Add customer confirmation tracking to orders table
ALTER TABLE public.orders 
ADD COLUMN customer_confirmed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.orders.customer_confirmed_at IS 'Timestamp when customer confirmed order receipt';