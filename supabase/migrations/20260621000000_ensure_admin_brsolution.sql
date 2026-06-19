DO $$
DECLARE
  v_user_id uuid;
BEGIN
  -- Verify brsolutiontransport@gmail.com is an admin to fulfill the role check criteria
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'brsolutiontransport@gmail.com';
  
  IF v_user_id IS NOT NULL THEN
    UPDATE public.user_profiles
    SET is_admin = true
    WHERE id = v_user_id;
  END IF;
END $$;
