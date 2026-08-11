-- Add display_name column to users table
-- The code references this column in backend handlers and frontend components
-- but it was never added in the initial schema
ALTER TABLE public.users
  ADD COLUMN display_name text;
