-- Add 'skipped' to task_status enum
-- Skipped means "intentionally not done today, but should reappear later"
-- This is different from 'cancelled' which means "abandoned permanently"
ALTER TYPE task_status ADD VALUE 'skipped';
