-- =====================================================
-- FOCUS CATEGORIES MIGRATION
-- Replace workspaces with focus categories
-- =====================================================

-- =====================================================
-- STEP 1: Create category_status enum
-- =====================================================

CREATE TYPE category_status AS ENUM ('active', 'completed');

-- =====================================================
-- STEP 2: Create focus_categories table
-- =====================================================

CREATE TABLE public.focus_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  user_id uuid NOT NULL
    REFERENCES public.users(id) ON DELETE CASCADE,
  
  name text NOT NULL,
  color text DEFAULT '#6366f1',
  daily_allocation_minutes integer DEFAULT 60,
  position integer,
  
  status category_status DEFAULT 'active',
  completed_at timestamptz,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- STEP 3: RLS for focus_categories
-- =====================================================

ALTER TABLE public.focus_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own focus categories"
ON public.focus_categories
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- STEP 4: Indexes for focus_categories
-- =====================================================

CREATE INDEX idx_focus_categories_user ON public.focus_categories(user_id);
CREATE INDEX idx_focus_categories_position ON public.focus_categories(user_id, position);
CREATE INDEX idx_focus_categories_status ON public.focus_categories(user_id, status);

-- =====================================================
-- STEP 5: Updated_at trigger for focus_categories
-- =====================================================

CREATE TRIGGER update_focus_categories_updated_at
BEFORE UPDATE ON public.focus_categories
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- STEP 6: Add category_id to tasks table
-- =====================================================

ALTER TABLE public.tasks 
  ADD COLUMN category_id uuid 
  REFERENCES public.focus_categories(id) ON DELETE SET NULL;

CREATE INDEX idx_tasks_category ON public.tasks(category_id);

-- =====================================================
-- STEP 7: Data Migration
-- Create default "Uncategorized" category for each user
-- and assign all existing tasks to it
-- =====================================================

DO $$
DECLARE
  user_record RECORD;
  default_category_id uuid;
BEGIN
  FOR user_record IN SELECT id FROM public.users LOOP
    -- Create default category
    INSERT INTO public.focus_categories (user_id, name, color, daily_allocation_minutes, status)
    VALUES (user_record.id, 'Uncategorized', '#6b7280', 60, 'active')
    RETURNING id INTO default_category_id;
    
    -- Assign all user's tasks to this category
    UPDATE public.tasks
    SET category_id = default_category_id
    WHERE user_id = user_record.id AND category_id IS NULL;
  END LOOP;
END $$;

-- =====================================================
-- STEP 8: Make category_id NOT NULL after migration
-- =====================================================

ALTER TABLE public.tasks 
  ALTER COLUMN category_id SET NOT NULL;

-- =====================================================
-- STEP 9: Remove workspace_id column from tasks
-- =====================================================

ALTER TABLE public.tasks 
  DROP COLUMN IF EXISTS workspace_id;

-- =====================================================
-- STEP 10: Drop workspaces table and related objects
-- =====================================================

DROP TABLE IF EXISTS public.workspaces CASCADE;
DROP SEQUENCE IF EXISTS public.workspaces_public_id_seq;

-- =====================================================
-- STEP 11: Update task handlers to work with categories
-- =====================================================

-- Drop old workspace-related indexes if they exist
DROP INDEX IF EXISTS public.idx_tasks_workspace;
DROP INDEX IF EXISTS public.idx_tasks_workspace_status;
