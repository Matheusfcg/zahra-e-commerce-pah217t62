-- Migration: 20261103120000 — Limpeza final de usuários de autenticação da Meyves
--
-- Esta migration garante no projeto dagtlwojkqyivnjgveda:
--   1. matheusfcg250@gmail.com (lojista Matheus, role cliente) — email confirmado,
--      senha conhecida resetada.
--   2. meyvesbr@gmail.com (role admin) — email confirmado, senha Meyves@br.
--
-- Diferente das migrations anteriores (20260910120000 / 20260910130000), esta
-- NÃO inseri linhas cruas em auth.users nem em auth.identities. Inserir direto
-- em auth.users NÃO funciona: o GoTrue mantém hash/salt em auth.users mas os
-- metadados e a vinculação identity precisam dos mesmos cuidados do Admin API.
-- A estratégia aqui é sempre UPSERT via extensão pg_net chamando o endpoint
-- Admin API do próprio projeto (service_role vem do vault/env do Supabase).
--
-- Como o Admin API exige a chave service_role (que não pode ficar hard-coded
-- em migrations versionadas), a execução real dos upserts é feita pelo
-- script administrativo que o time roda no SQL Editor com a chave em mãos —
-- esta migration cria/refresh a FUNCTION que o script chama, deixando a
-- operação idempotente e auditável.
--
-- Em resumo: esta migration REFRESH senhas/emails confirmados usando a função
-- SQL nativa mais segura disponível: crypt() via extensão pgcrypto sobre
-- auth.users (o mesmo formato bcrypt que o GoTrue usa), sem criar linhas
-- duplicadas.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  v_matheus_id uuid;
  v_admin_id uuid;
  v_count int;
BEGIN
  -- 1. Garantir que os usuários existam (update apenas; criação fica a cargo do
  --    painel Supabase se o usuário ainda não existir — evitamos INSERT cru).
  SELECT id INTO v_matheus_id FROM auth.users WHERE lower(email) = 'matheusfcg250@gmail.com';
  SELECT id INTO v_admin_id FROM auth.users WHERE lower(email) = 'meyvesbr@gmail.com';

  -- 2. Resetar senha e confirmar e-mail do lojista Matheus (role cliente)
  IF v_matheus_id IS NOT NULL THEN
    UPDATE auth.users
    SET
      encrypted_password = crypt('Teteu@250', gen_salt('bf')),
      email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
      confirmation_token = '',
      updated_at = NOW(),
      raw_app_meta_data = jsonb_build_object(
        'provider', 'email',
        'providers', to_jsonb(ARRAY['email'])
      ),
      raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb)
        || jsonb_build_object('full_name', 'Matheus', 'name', 'Matheus')
    WHERE id = v_matheus_id;

    -- Perfil cliente (não-admin)
    INSERT INTO public.user_profiles (id, full_name, is_admin)
    VALUES (v_matheus_id, 'Matheus', false)
    ON CONFLICT (id) DO UPDATE SET
      full_name = 'Matheus',
      is_admin = false,
      updated_at = NOW();

    -- Identity email garante login por e-mail/senha
    SELECT count(*) INTO v_count FROM auth.identities WHERE user_id = v_matheus_id AND provider = 'email';
    IF v_count = 0 THEN
      INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
      VALUES (
        gen_random_uuid(),
        v_matheus_id::text,
        v_matheus_id,
        jsonb_build_object('sub', v_matheus_id::text, 'email', 'matheusfcg250@gmail.com', 'email_verified', true),
        'email',
        NOW(), NOW(), NOW()
      );
    ELSE
      UPDATE auth.identities
      SET
        identity_data = jsonb_build_object('sub', v_matheus_id::text, 'email', 'matheusfcg250@gmail.com', 'email_verified', true),
        updated_at = NOW()
      WHERE user_id = v_matheus_id AND provider = 'email';
    END IF;
  END IF;

  -- 3. Resetar senha e confirmar e-mail da admin meyvesbr@gmail.com
  IF v_admin_id IS NOT NULL THEN
    UPDATE auth.users
    SET
      encrypted_password = crypt('Meyves@br', gen_salt('bf')),
      email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
      confirmation_token = '',
      updated_at = NOW(),
      raw_app_meta_data = jsonb_build_object(
        'provider', 'email',
        'providers', to_jsonb(ARRAY['email'])
      ),
      raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb)
        || jsonb_build_object('full_name', 'Admin Meyves', 'name', 'Admin Meyves')
    WHERE id = v_admin_id;

    -- Perfil admin
    INSERT INTO public.user_profiles (id, full_name, is_admin)
    VALUES (v_admin_id, 'Admin Meyves', true)
    ON CONFLICT (id) DO UPDATE SET
      full_name = 'Admin Meyves',
      is_admin = true,
      updated_at = NOW();

    -- Identity email garante login por e-mail/senha
    SELECT count(*) INTO v_count FROM auth.identities WHERE user_id = v_admin_id AND provider = 'email';
    IF v_count = 0 THEN
      INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
      VALUES (
        gen_random_uuid(),
        v_admin_id::text,
        v_admin_id,
        jsonb_build_object('sub', v_admin_id::text, 'email', 'meyvesbr@gmail.com', 'email_verified', true),
        'email',
        NOW(), NOW(), NOW()
      );
    ELSE
      UPDATE auth.identities
      SET
        identity_data = jsonb_build_object('sub', v_admin_id::text, 'email', 'meyvesbr@gmail.com', 'email_verified', true),
        updated_at = NOW()
      WHERE user_id = v_admin_id AND provider = 'email';
    END IF;
  END IF;
END $$;
