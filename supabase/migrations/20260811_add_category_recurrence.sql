-- =====================================================
-- CATEGORY RECURRENCE
-- Auto-generate tasks from recurring categories
-- =====================================================

-- Add recurrence columns to focus_categories
ALTER TABLE public.focus_categories
  ADD COLUMN recurrence_pattern task_recurrence DEFAULT 'none';

ALTER TABLE public.focus_categories
  ADD COLUMN last_generated_at timestamptz;

-- Index for finding recurring categories efficiently
CREATE INDEX idx_focus_categories_recurrence
  ON public.focus_categories(user_id, status)
  WHERE recurrence_pattern != 'none' AND status = 'active';
