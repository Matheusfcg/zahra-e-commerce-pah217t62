DO $DO$
BEGIN
  INSERT INTO storage.buckets (id, name, public) 
  VALUES ('category-images', 'category-images', true)
  ON CONFLICT (id) DO NOTHING;
END $DO$;

-- Drop existing policies to ensure idempotency
DROP POLICY IF EXISTS "Public Access Category Images" ON storage.objects;
DROP POLICY IF EXISTS "Auth Insert Category Images" ON storage.objects;
DROP POLICY IF EXISTS "Auth Update Category Images" ON storage.objects;
DROP POLICY IF EXISTS "Auth Delete Category Images" ON storage.objects;
DROP POLICY IF EXISTS "Admin Insert Category Images" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update Category Images" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete Category Images" ON storage.objects;

-- Allow public read access
CREATE POLICY "Public Access Category Images" ON storage.objects 
FOR SELECT USING (bucket_id = 'category-images');

-- Allow authenticated admins to insert
CREATE POLICY "Admin Insert Category Images" ON storage.objects 
FOR INSERT TO authenticated 
WITH CHECK (bucket_id = 'category-images' AND public.is_admin());

-- Allow authenticated admins to update
CREATE POLICY "Admin Update Category Images" ON storage.objects 
FOR UPDATE TO authenticated 
USING (bucket_id = 'category-images' AND public.is_admin());

-- Allow authenticated admins to delete
CREATE POLICY "Admin Delete Category Images" ON storage.objects 
FOR DELETE TO authenticated 
USING (bucket_id = 'category-images' AND public.is_admin());
