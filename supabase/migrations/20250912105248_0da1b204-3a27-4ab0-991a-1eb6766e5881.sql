-- Fix infinite recursion in RLS policies by creating security definer functions
-- This resolves the "infinite recursion detected in policy" error

-- Create security definer function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  );
$$;

-- Drop problematic admin policies that cause recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all user profiles" ON public.user_profiles;

-- Recreate admin policies using the security definer function
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.is_admin_user());

CREATE POLICY "Admins can view all user profiles"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (public.is_admin_user());

-- Add admin policies for user management
CREATE POLICY "Admins can update all user profiles"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (public.is_admin_user());

CREATE POLICY "Admins can insert user profiles"
ON public.user_profiles
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin_user());

-- Fix tasks table to ensure proper user assignment
-- Add CSV import functionality by creating a tasks import table
CREATE TABLE IF NOT EXISTS public.task_imports (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    filename text NOT NULL,
    status text NOT NULL DEFAULT 'pending',
    total_rows integer DEFAULT 0,
    processed_rows integer DEFAULT 0,
    errors jsonb DEFAULT '[]',
    created_at timestamptz DEFAULT now(),
    completed_at timestamptz
);

-- Enable RLS on task_imports
ALTER TABLE public.task_imports ENABLE ROW LEVEL SECURITY;

-- Create policy for task imports
CREATE POLICY "Users can manage their own task imports"
ON public.task_imports
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);