-- Add 'skipped' to task_status enum
-- Skipped means "intentionally not done today, but should reappear later"
-- This is different from 'cancelled' which means "abandoned permanently"
-- Idempotent: safe to run even if the value already exists
DO $$ BEGIN
  ALTER TYPE task_status ADD VALUE 'skipped';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
