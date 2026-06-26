ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS description text;

UPDATE public.categories 
SET description = 'Descubra nossa coleção de conjuntos elegantes.'
WHERE name ILIKE '%conjunto%' AND description IS NULL;
