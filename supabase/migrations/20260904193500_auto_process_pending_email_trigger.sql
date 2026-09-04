-- Migration: Auto trigger to process pending email logs when created
-- Timestamp: 20260904193500

-- Create a helper function that invokes the process-order-notifications function for pending email_logs
CREATE OR REPLACE FUNCTION public.process_pending_email_log_trigger()
RETURNS TRIGGER AS $$
DECLARE
  v_url text := 'https://onfkaptmtujiihiunsnu.supabase.co/functions/v1/process-order-notifications';
  v_anon_key text := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uZmthcHRtdHVqaWloaXVuc251Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAwMzgwNTUsImV4cCI6MjA1NTYxNDA1NX0.1B-hW7gUe_2s3y4r3x7t_test';
  v_headers jsonb;
  v_payload jsonb;
BEGIN
  -- Only trigger if status is 'pending'
  IF NEW.status = 'pending' THEN
    v_headers := jsonb_build_object(
      'Content-Type', 'application/json'
    );
    v_payload := jsonb_build_object(
      'action', 'process_pending',
      'specific_log_id', NEW.id
    );

    BEGIN
      PERFORM net.http_post(
        url := v_url,
        headers := v_headers,
        body := v_payload
      );
    EXCEPTION WHEN OTHERS THEN
      -- In case pg_net is not active or fails, do not block the row insert
      NULL;
    END;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_email_log_pending_created ON public.email_logs;
CREATE TRIGGER on_email_log_pending_created
  AFTER INSERT ON public.email_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.process_pending_email_log_trigger();
