-- Add invoice_url column to orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS invoice_url TEXT;

-- Enable pg_net extension for HTTP calls from database triggers
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Create notification function that calls the edge function
CREATE OR REPLACE FUNCTION public.notify_order_change()
RETURNS trigger AS $$
DECLARE
  v_url text := 'https://onfkaptmtujiihiunsnu.supabase.co/functions/v1/process-order-notifications';
  v_key text := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uZmthcHRtdHVqaWloaXVuc251Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxMzE2MjksImV4cCI6MjA5MTcwNzYyOX0.Gu7pMO_MeWKavt6IM0hpZFqSDYhtjPuityzjzbsSCdY';
  v_headers jsonb;
BEGIN
  v_headers := jsonb_build_object(
    'Content-Type', 'application/json',
    'Authorization', 'Bearer ' || v_key
  );

  IF TG_OP = 'INSERT' THEN
    PERFORM net.http_post(
      url := v_url,
      headers := v_headers,
      body := jsonb_build_object('order_id', NEW.id, 'event_type', 'order_created')
    );
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
      PERFORM net.http_post(
        url := v_url,
        headers := v_headers,
        body := jsonb_build_object(
          'order_id', NEW.id,
          'event_type', 'status_changed',
          'old_status', OLD.status,
          'new_status', NEW.status
        )
      );
    END IF;

    IF NEW.invoice_url IS NOT NULL AND OLD.invoice_url IS DISTINCT FROM NEW.invoice_url THEN
      PERFORM net.http_post(
        url := v_url,
        headers := v_headers,
        body := jsonb_build_object('order_id', NEW.id, 'event_type', 'invoice_added')
      );
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for order insert and update
DROP TRIGGER IF EXISTS on_order_change ON public.orders;
CREATE TRIGGER on_order_change
  AFTER INSERT OR UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.notify_order_change();
