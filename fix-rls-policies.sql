-- Fix RLS Policies for SmartAgri
-- Run this in Supabase SQL Editor

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "owner-select-user-profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "owner-modify-user-profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "owner-select-preferences" ON public.preferences;
DROP POLICY IF EXISTS "owner-modify-preferences" ON public.preferences;
DROP POLICY IF EXISTS "owner-select-farms" ON public.farms;
DROP POLICY IF EXISTS "owner-modify-farms" ON public.farms;
DROP POLICY IF EXISTS "owner-select-history" ON public.history;
DROP POLICY IF EXISTS "owner-modify-history" ON public.history;
DROP POLICY IF EXISTS "owner-select-alerts" ON public.alerts;
DROP POLICY IF EXISTS "owner-modify-alerts" ON public.alerts;
DROP POLICY IF EXISTS "owner-select-chat-history" ON public.chat_history;
DROP POLICY IF EXISTS "owner-modify-chat-history" ON public.chat_history;

-- Create new, simpler policies
CREATE POLICY "user_profiles_select_policy" ON public.user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "user_profiles_insert_policy" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_profiles_update_policy" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_profiles_delete_policy" ON public.user_profiles
  FOR DELETE USING (auth.uid() = user_id);

-- Preferences policies
CREATE POLICY "preferences_select_policy" ON public.preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "preferences_insert_policy" ON public.preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "preferences_update_policy" ON public.preferences
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "preferences_delete_policy" ON public.preferences
  FOR DELETE USING (auth.uid() = user_id);

-- Farms policies
CREATE POLICY "farms_select_policy" ON public.farms
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "farms_insert_policy" ON public.farms
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "farms_update_policy" ON public.farms
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "farms_delete_policy" ON public.farms
  FOR DELETE USING (auth.uid() = user_id);

-- History policies
CREATE POLICY "history_select_policy" ON public.history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "history_insert_policy" ON public.history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "history_update_policy" ON public.history
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "history_delete_policy" ON public.history
  FOR DELETE USING (auth.uid() = user_id);

-- Alerts policies
CREATE POLICY "alerts_select_policy" ON public.alerts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "alerts_insert_policy" ON public.alerts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "alerts_update_policy" ON public.alerts
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "alerts_delete_policy" ON public.alerts
  FOR DELETE USING (auth.uid() = user_id);

-- Chat history policies
CREATE POLICY "chat_history_select_policy" ON public.chat_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "chat_history_insert_policy" ON public.chat_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "chat_history_update_policy" ON public.chat_history
  FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "chat_history_delete_policy" ON public.chat_history
  FOR DELETE USING (auth.uid() = user_id);

-- Success message
SELECT 'RLS policies fixed successfully!' as message;




