-- Add soft delete columns to messages table
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS deleted_by_sender BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS deleted_by_receiver BOOLEAN DEFAULT FALSE;

-- Update Policies to allow users to update their "deleted" flags
-- We need to drop the restrictive update policy first or add a new one.
-- Currently: "Users can update read status of received messages" (FOR UPDATE USING receiver_id)

DROP POLICY IF EXISTS "Users can update read status of received messages" ON public.messages;

-- New generic update policy: allow sender or receiver to update the message (needed for marking read OR deleting)
CREATE POLICY "Users can update their own messages" ON public.messages
    FOR UPDATE USING (auth.uid() = receiver_id OR auth.uid() = sender_id);
