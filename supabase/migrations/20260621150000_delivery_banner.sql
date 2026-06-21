DO $$
BEGIN
  -- Insert the new delivery text
  INSERT INTO public.site_content (section_key, content_value)
  VALUES ('delivery_banner_text', 'Entregamos para todo Brasil')
  ON CONFLICT (section_key) DO NOTHING;

  -- Delete the old values sections if they exist
  DELETE FROM public.site_content
  WHERE section_key IN (
    'values_1_title',
    'values_1_desc',
    'values_2_title',
    'values_2_desc',
    'values_3_title',
    'values_3_desc'
  );
END $$;
