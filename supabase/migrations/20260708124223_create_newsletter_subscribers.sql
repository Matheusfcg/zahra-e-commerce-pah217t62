CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_insert_newsletter_subscribers" ON public.newsletter_subscribers;
CREATE POLICY "allow_insert_newsletter_subscribers" ON public.newsletter_subscribers
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_select_newsletter_subscribers" ON public.newsletter_subscribers;
CREATE POLICY "admin_select_newsletter_subscribers" ON public.newsletter_subscribers
  FOR SELECT TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "admin_delete_newsletter_subscribers" ON public.newsletter_subscribers;
CREATE POLICY "admin_delete_newsletter_subscribers" ON public.newsletter_subscribers
  FOR DELETE TO authenticated USING (public.is_admin());
