-- Add completed column to notes table
ALTER TABLE public.notes ADD COLUMN completed BOOLEAN NOT NULL DEFAULT false;