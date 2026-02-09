
-- Enable Realtime for messages table
begin;
  -- Check if publication exists, if not create it (standard supabase setup usually has it)
  -- But we just need to add the table to the publication 'supabase_realtime'
  
  -- This enables listening to changes on the messages table
  ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  
commit;
