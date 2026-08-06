-- Enable Realtime for tasks table
-- This allows the frontend to subscribe to real-time changes

ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
