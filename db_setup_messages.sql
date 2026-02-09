
-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subject TEXT,
    content TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Policies
-- Drop existing policies if they exist to avoid errors on re-run
DROP POLICY IF EXISTS "Users can view their own messages" ON public.messages;
DROP POLICY IF EXISTS "Users can insert messages as sender" ON public.messages;
DROP POLICY IF EXISTS "Users can update read status of received messages" ON public.messages;

CREATE POLICY "Users can view their own messages" ON public.messages
    FOR SELECT USING (auth.uid() = receiver_id OR auth.uid() = sender_id);

CREATE POLICY "Users can insert messages as sender" ON public.messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update read status of received messages" ON public.messages
    FOR UPDATE USING (auth.uid() = receiver_id);

-- Function for broadcast
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
    -- Get role ID from code
    SELECT id INTO target_role_id FROM public.roles WHERE code = p_role_code;
    
    IF target_role_id IS NULL THEN
        RAISE EXCEPTION 'Role code % not found', p_role_code;
    END IF;

    -- Insert messages for all users with that role
    INSERT INTO public.messages (sender_id, receiver_id, subject, content)
    SELECT 
        p_sender_id, 
        ur.user_id, 
        p_subject, 
        p_content
    FROM public.user_roles ur
    WHERE ur.role_id = target_role_id
    AND ur.user_id != p_sender_id; -- Avoid sending to self

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
