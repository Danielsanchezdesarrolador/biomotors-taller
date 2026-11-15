-- PostgreSQL 17 synthetic lab ONLY. Never execute against the hosted project.
CREATE ROLE anon NOLOGIN;
CREATE ROLE authenticated NOLOGIN;
CREATE ROLE service_role NOLOGIN BYPASSRLS;
CREATE SCHEMA auth;
CREATE TABLE auth.users (id uuid PRIMARY KEY, email text NOT NULL UNIQUE);
CREATE TABLE public.workshops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.workshop_memberships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_id uuid NOT NULL REFERENCES public.workshops(id),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  role text NOT NULL CHECK (role IN ('owner','admin','mechanic','reception')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','disabled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(workshop_id,user_id)
);
ALTER TABLE public.workshops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workshop_memberships ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.workshops,public.workshop_memberships FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT,UPDATE,DELETE ON public.workshops,public.workshop_memberships TO service_role;
INSERT INTO auth.users(id,email) VALUES
 ('11111111-1111-4111-8111-111111111111','ownera@example.com'),
 ('22222222-2222-4222-8222-222222222222','admina@example.com'),
 ('33333333-3333-4333-8333-333333333333','mechanica@example.com'),
 ('44444444-4444-4444-8444-444444444444','receptiona@example.com'),
 ('55555555-5555-4555-8555-555555555555','ownerb@example.com'),
 ('66666666-6666-4666-8666-666666666666','newmech1@example.com'),
 ('77777777-7777-4777-8777-777777777777','newmech2@example.com');
INSERT INTO public.workshops(id,name) VALUES
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','A - Test only'),
 ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','B - Test only');
INSERT INTO public.workshop_memberships(workshop_id,user_id,role) VALUES
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','11111111-1111-4111-8111-111111111111','owner'),
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','22222222-2222-4222-8222-222222222222','admin'),
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','33333333-3333-4333-8333-333333333333','mechanic'),
 ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa','44444444-4444-4444-8444-444444444444','reception'),
 ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb','55555555-5555-4555-8555-555555555555','owner');
