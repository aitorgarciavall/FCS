
-- REPARACIÓ INTEGRAL DE MISSATGERIA I NOTIFICACIONS
-- Executa aquest script sencer a l'Editor SQL de Supabase

BEGIN;

-- 1. Assegurar taula de MISSATGES
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subject TEXT,
    content TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Assegurar taula de NOTIFICACIONS
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT,
    link TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PERMISOS BÀSICS (Crucial per evitar errors de "permission denied")
GRANT ALL ON public.messages TO postgres, service_role;
GRANT ALL ON public.notifications TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.messages TO authenticated;
GRANT SELECT, UPDATE ON public.notifications TO authenticated;

-- 4. POLÍTIQUES DE SEGURETAT (RLS) - Les refem de zero per assegurar
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Neteja polítiques antigues
DROP POLICY IF EXISTS "Users can view their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can insert messages as sender" ON public.messages;
DROP POLICY IF EXISTS "Users can update read status of received messages" ON public.messages;
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;

-- Noves polítiques Messages
CREATE POLICY "Users can view their own messages" ON public.messages
    FOR SELECT USING (auth.uid() = receiver_id OR auth.uid() = sender_id);

CREATE POLICY "Users can insert messages as sender" ON public.messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update read status of received messages" ON public.messages
    FOR UPDATE USING (auth.uid() = receiver_id);

-- Noves polítiques Notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- 5. FUNCIÓ BROADCAST (Refeta)
CREATE OR REPLACE FUNCTION public.send_broadcast_message(
    p_sender_id UUID,
    p_role_code TEXT,
    p_subject TEXT,
    p_content TEXT
)
RETURNS VOID AS $$
DECLARE
    target_role_id BIGINT;
BEGIN
    SELECT id INTO target_role_id FROM public.roles WHERE code = p_role_code;
    
    IF target_role_id IS NULL THEN
        RAISE EXCEPTION 'Role code % not found', p_role_code;
    END IF;

    INSERT INTO public.messages (sender_id, receiver_id, subject, content)
    SELECT 
        p_sender_id, 
        ur.user_id, 
        p_subject, 
        p_content
    FROM public.user_roles ur
    WHERE ur.role_id = target_role_id
    AND ur.user_id != p_sender_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. TRIGGER DE NOTIFICACIONS (ROBUST)
-- Aquesta versió no falla si l'usuari no té nom o dades a public.users
CREATE OR REPLACE FUNCTION public.handle_new_message_notification()
RETURNS TRIGGER AS $$
DECLARE
    sender_name TEXT;
BEGIN
    -- Intentem obtenir el nom, si falla o és null, posem un per defecte
    BEGIN
        SELECT COALESCE(full_name, email, 'Un usuari') INTO sender_name
        FROM public.users
        WHERE id = NEW.sender_id;
    EXCEPTION WHEN OTHERS THEN
        sender_name := 'Un usuari';
    END;

    IF sender_name IS NULL OR sender_name = '' THEN
        sender_name := 'Un usuari';
    END IF;

    -- Inserim la notificació assegurant que no hi ha valors nuls crítics
    INSERT INTO public.notifications (user_id, type, title, content, link)
    VALUES (
        NEW.receiver_id,
        'message',
        'Nou missatge de ' || sender_name,
        COALESCE(SUBSTRING(NEW.subject FROM 1 FOR 50), 'Sense assumpte') || '...',
        '/keyper/messages'
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Reiniciem el trigger
DROP TRIGGER IF EXISTS on_new_message ON public.messages;
CREATE TRIGGER on_new_message
    AFTER INSERT ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_message_notification();

COMMIT;
