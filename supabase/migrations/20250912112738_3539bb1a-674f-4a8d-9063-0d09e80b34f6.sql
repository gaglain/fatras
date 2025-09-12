-- Fix critical security vulnerability in notifications table
-- Remove overly permissive policy that allows all authenticated users access to all notifications

-- Drop the dangerous policy that grants all access
DROP POLICY IF EXISTS "Enable all access for authenticated users on notifications" ON public.notifications;

-- Ensure we have proper user-scoped policies only
-- Keep existing secure policies and only remove the problematic one
-- The remaining policies already correctly restrict access to user_id = auth.uid()