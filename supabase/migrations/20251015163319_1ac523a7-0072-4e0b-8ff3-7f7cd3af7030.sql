-- Create website_menu table for persisting public website navigation
CREATE TABLE IF NOT EXISTS public.website_menu (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  target TEXT NOT NULL DEFAULT '_self',
  parent_id UUID NULL,
  menu_order INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Self-referencing FK for nested menus
ALTER TABLE public.website_menu
  ADD CONSTRAINT website_menu_parent_fk
  FOREIGN KEY (parent_id) REFERENCES public.website_menu(id) ON DELETE CASCADE;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_website_menu_user ON public.website_menu(user_id);
CREATE INDEX IF NOT EXISTS idx_website_menu_user_order ON public.website_menu(user_id, menu_order);

-- Enable Row Level Security
ALTER TABLE public.website_menu ENABLE ROW LEVEL SECURITY;

-- RLS policies: users can manage their own menu items
CREATE POLICY menu_select_own
ON public.website_menu
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY menu_insert_own
ON public.website_menu
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY menu_update_own
ON public.website_menu
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY menu_delete_own
ON public.website_menu
FOR DELETE
USING (auth.uid() = user_id);

-- Updated_at trigger
CREATE TRIGGER website_menu_set_updated_at
BEFORE UPDATE ON public.website_menu
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();