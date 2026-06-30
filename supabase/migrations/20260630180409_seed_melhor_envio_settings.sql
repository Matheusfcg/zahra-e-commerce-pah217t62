-- Ensure the row for Melhor Envio tokens exists
INSERT INTO public.site_content (section_key, content_value)
VALUES ('melhor_envio_settings', '{}')
ON CONFLICT (section_key) DO NOTHING;
