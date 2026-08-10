-- =====================================================
-- RECURRING TASKS
-- Supports daily, weekly, monthly recurrence patterns
-- =====================================================

-- New enum type for recurrence patterns
create type task_recurrence as enum ('none', 'daily', 'weekly', 'monthly');

-- Add recurrence columns to tasks table
ALTER TABLE public.tasks
  ADD COLUMN recurrence_pattern task_recurrence DEFAULT 'none';

ALTER TABLE public.tasks
  ADD COLUMN recurring_series_id uuid
    REFERENCES public.tasks(id) ON DELETE SET NULL;

-- Index for efficiently finding recurring tasks / series
CREATE INDEX idx_tasks_recurrence_series
  ON public.tasks(recurring_series_id)
  WHERE recurring_series_id IS NOT NULL;

-- Index for finding all tasks in a series
CREATE INDEX idx_tasks_series_lookup
  ON public.tasks(recurring_series_id);
