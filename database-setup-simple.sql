-- SmartAgri Database Setup Script - Simple Version
-- Run this script in your Supabase SQL Editor

-- Step 1: Create all tables first
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  first_name text,
  last_name text,
  email text,
  phone text,
  state text,
  district text,
  avatar_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.farms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  area_ha numeric,
  location jsonb,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  farm_id uuid REFERENCES public.farms(id) ON DELETE CASCADE,
  season text,
  crop text,
  yield_t_ha numeric,
  notes text,
  recorded_at date DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  farm_id uuid REFERENCES public.farms(id) ON DELETE CASCADE,
  type text CHECK (type IN ('weather','market','pest')),
  title text NOT NULL,
  message text,
  read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  language text DEFAULT 'en',
  notifications boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.chat_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  query text NOT NULL,
  response text NOT NULL,
  location jsonb,
  timestamp timestamp with time zone DEFAULT now()
);

-- Step 2: Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;

-- Step 3: Create policies (run these one by one if needed)
CREATE POLICY "owner-select-user-profiles" ON public.user_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "owner-modify-user-profiles" ON public.user_profiles FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "owner-select-farms" ON public.farms FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "owner-modify-farms" ON public.farms FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "owner-select-history" ON public.history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "owner-modify-history" ON public.history FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "owner-select-alerts" ON public.alerts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "owner-modify-alerts" ON public.alerts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "owner-select-preferences" ON public.preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "owner-modify-preferences" ON public.preferences FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "owner-select-chat-history" ON public.chat_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "owner-modify-chat-history" ON public.chat_history FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Step 4: Create indexes
CREATE INDEX idx_user_profiles_user_id ON public.user_profiles(user_id);
CREATE INDEX idx_farms_user_id ON public.farms(user_id);
CREATE INDEX idx_history_user_id ON public.history(user_id);
CREATE INDEX idx_alerts_user_id ON public.alerts(user_id);
CREATE INDEX idx_preferences_user_id ON public.preferences(user_id);
CREATE INDEX idx_chat_history_user_id ON public.chat_history(user_id);

-- Success message
SELECT 'Database setup completed successfully!' as message;




