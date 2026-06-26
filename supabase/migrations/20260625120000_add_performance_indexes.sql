-- Add performance indexes for frequently queried columns in products
CREATE INDEX IF NOT EXISTS products_category_idx ON public.products(category);
CREATE INDEX IF NOT EXISTS products_is_featured_idx ON public.products(is_featured);
CREATE INDEX IF NOT EXISTS products_show_in_carousel_idx ON public.products(show_in_carousel);
CREATE INDEX IF NOT EXISTS products_is_promotion_idx ON public.products(is_promotion);
CREATE INDEX IF NOT EXISTS products_quantity_idx ON public.products(quantity);

-- Add indexes for product relationships to optimize joins
CREATE INDEX IF NOT EXISTS product_images_product_id_idx ON public.product_images(product_id);
CREATE INDEX IF NOT EXISTS product_colors_product_id_idx ON public.product_colors(product_id);

-- Add index for user_favorites
CREATE INDEX IF NOT EXISTS user_favorites_user_id_idx ON public.user_favorites(user_id);
