-- =====================================================
-- ALLOCATION HISTORY
-- Tracks changes to daily_allocation_minutes over time
-- =====================================================

CREATE TABLE public.allocation_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  user_id uuid NOT NULL
    REFERENCES public.users(id) ON DELETE CASCADE,
  
  category_id uuid NOT NULL
    REFERENCES public.focus_categories(id) ON DELETE CASCADE,
  
  old_allocation integer NOT NULL,
  new_allocation integer NOT NULL,
  
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- RLS for allocation_history
-- =====================================================

ALTER TABLE public.allocation_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own allocation history"
ON public.allocation_history
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- Indexes
-- =====================================================

CREATE INDEX idx_allocation_history_user ON public.allocation_history(user_id);
CREATE INDEX idx_allocation_history_category ON public.allocation_history(category_id);
CREATE INDEX idx_allocation_history_category_time ON public.allocation_history(category_id, created_at DESC);
