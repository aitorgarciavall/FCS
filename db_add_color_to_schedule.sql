-- Add color column to training_schedules table
ALTER TABLE public.training_schedules 
ADD COLUMN IF NOT EXISTS color TEXT DEFAULT '#055894';
