
-- 1. Create Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'message', 'alert', 'system'
    title TEXT NOT NULL,
    content TEXT,
    link TEXT, -- URL to redirect when clicked
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Security Policies (RLS)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;

CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- 3. Database Trigger for New Messages
-- This function runs automatically whenever a new row is added to the 'messages' table
CREATE OR REPLACE FUNCTION public.handle_new_message_notification()
RETURNS TRIGGER AS $$
DECLARE
    sender_name TEXT;
BEGIN
    -- Try to get sender name (optional, cosmetic)
    SELECT COALESCE(full_name, email, 'Un usuari') INTO sender_name
    FROM public.users
    WHERE id = NEW.sender_id;

    INSERT INTO public.notifications (user_id, type, title, content, link)
    VALUES (
        NEW.receiver_id,
        'message',
        'Nou missatge de ' || sender_name,
        SUBSTRING(NEW.subject FROM 1 FOR 50) || '...',
        '/keyper/messages'
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind the trigger to the messages table
DROP TRIGGER IF EXISTS on_new_message ON public.messages;
CREATE TRIGGER on_new_message
    AFTER INSERT ON public.messages
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_message_notification();
