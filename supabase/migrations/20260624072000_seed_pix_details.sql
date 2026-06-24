DO $$
BEGIN
  INSERT INTO public.site_content (section_key, content_value, updated_at)
  VALUES (
    'pix_details',
    '{"name": "ELLEN CRISTINA", "key": "64278774000161", "institution": "InfinitePay", "formattedKey": "64.278.774/0001-61"}',
    NOW()
  )
  ON CONFLICT (section_key) DO UPDATE
  SET content_value = EXCLUDED.content_value,
      updated_at = EXCLUDED.updated_at;
END $$;
