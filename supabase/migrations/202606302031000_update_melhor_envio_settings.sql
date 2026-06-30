-- Update melhor_envio_settings with default from CEP
INSERT INTO public.site_content (section_key, content_value)
VALUES (
  'melhor_envio_settings',
  '{"from_cep": "01153000"}'
)
ON CONFLICT (section_key) DO UPDATE
SET content_value = public.site_content.content_value;
