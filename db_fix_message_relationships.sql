
-- REPARACIÓ DE RELACIONS DE MISSATGERIA
-- Canviem les claus externes perquè apuntin a public.users en lloc d'auth.users
-- Això permet que l'API (PostgREST) pugui fer el join per obtenir el full_name i avatar_url

BEGIN;

-- 1. Eliminem les claus externes actuals
ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_sender_id_fkey;
ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_receiver_id_fkey;

-- 2. Afegim les noves claus externes apuntant a la taula pública 'users'
ALTER TABLE public.messages 
  ADD CONSTRAINT messages_sender_id_fkey 
  FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE public.messages 
  ADD CONSTRAINT messages_receiver_id_fkey 
  FOREIGN KEY (receiver_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- 3. Fem el mateix per a la taula de notificacions si cal
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_user_id_fkey;
ALTER TABLE public.notifications 
  ADD CONSTRAINT notifications_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

COMMIT;
