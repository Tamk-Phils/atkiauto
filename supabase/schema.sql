-- ═══════════════════════════════════════════════════════════════
-- AttkissonAutos — Complete Supabase Schema
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ═══════════════════════════════════════════════════════════════

-- ── EXTENSIONS ───────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── TABLES ───────────────────────────────────────────────────

-- Cars (inventory) with multi-image support
CREATE TABLE IF NOT EXISTS cars (
  id              UUID          DEFAULT uuid_generate_v4() PRIMARY KEY,
  make            TEXT          NOT NULL,
  model           TEXT          NOT NULL,
  year            INTEGER       NOT NULL,
  type            TEXT,
  price           DECIMAL(12,2) NOT NULL,
  mileage         TEXT,
  transmission    TEXT          DEFAULT 'Automatic',
  fuel            TEXT,
  status          TEXT          DEFAULT 'available',
  image_url       TEXT,               -- primary / first image
  images          TEXT[]        DEFAULT '{}', -- all uploaded images
  description     TEXT,
  features        TEXT[]        DEFAULT '{}',
  reservation_fee DECIMAL(10,2) DEFAULT 0.00,
  down_payment    DECIMAL(10,2) DEFAULT 0.00,
  created_at      TIMESTAMPTZ   DEFAULT NOW()
);

-- Leads (Contact + Finance form submissions)
CREATE TABLE IF NOT EXISTS leads (
  id          UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  name        TEXT        NOT NULL,
  email       TEXT        NOT NULL,
  phone       TEXT,
  income      TEXT,
  subject     TEXT,
  message     TEXT,
  type        TEXT        DEFAULT 'contact', -- 'contact' | 'inquiry'
  status      TEXT        DEFAULT 'new',     -- 'new' | 'responded'
  car_id      UUID        REFERENCES cars(id) ON DELETE SET NULL,
  down_payment DECIMAL(10,2) DEFAULT 0.00,
  data        JSONB       DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Appointments (Service booking)
CREATE TABLE IF NOT EXISTS appointments (
  id                UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  name              TEXT        NOT NULL,
  email             TEXT        NOT NULL,
  phone             TEXT,
  service_type      TEXT        DEFAULT 'General Maintenance',
  appointment_date  DATE        NOT NULL,
  appointment_time  TIME        NOT NULL,
  status            TEXT        DEFAULT 'pending', -- 'pending' | 'confirmed' | 'cancelled'
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews
CREATE TABLE IF NOT EXISTS reviews (
  id          UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  name        TEXT        NOT NULL,
  rating      INTEGER     CHECK (rating >= 1 AND rating <= 5),
  comment     TEXT,
  avatar_url  TEXT,
  car_model   TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles (extra user info)
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID        REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name   TEXT,
  email       TEXT        NOT NULL,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Reservations
CREATE TABLE IF NOT EXISTS reservations (
  id              UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id         UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  car_id          UUID        NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  fee             DECIMAL(10,2) NOT NULL,
  status          TEXT        DEFAULT 'pending', -- 'pending' | 'paid' | 'completed' | 'cancelled'
  payment_status  TEXT        DEFAULT 'unpaid',  -- 'unpaid' | 'paid'
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Live chat sessions
CREATE TABLE IF NOT EXISTS chats (
  id              UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id         UUID        CONSTRAINT chats_user_id_fkey REFERENCES profiles(id) ON DELETE SET NULL,
  subject         TEXT,
  status          TEXT        DEFAULT 'open', -- 'open' | 'closed'
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger function to update last_message_at safely
CREATE OR REPLACE FUNCTION update_chat_last_message()
RETURNS TRIGGER AS $$
BEGIN
  -- Safe update: only try if the column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'chats' AND column_name = 'last_message_at'
  ) THEN
    UPDATE chats SET last_message_at = NOW() WHERE id = NEW.chat_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_message_inserted ON messages;
CREATE TRIGGER on_message_inserted
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION update_chat_last_message();

-- Chat messages
CREATE TABLE IF NOT EXISTS messages (
  id          UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  chat_id     UUID        REFERENCES chats(id) ON DELETE CASCADE,
  sender      TEXT        NOT NULL, -- 'user' | 'admin'
  content     TEXT        NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── ROW LEVEL SECURITY ────────────────────────────────────────

ALTER TABLE profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE cars         ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads        ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews      ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats        ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages     ENABLE ROW LEVEL SECURITY;

-- Reservations: users can view and insert their own, admins full access
DROP POLICY IF EXISTS "Users can view own reservations" ON reservations;
CREATE POLICY "Users can view own reservations"
  ON reservations FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own reservations" ON reservations;
CREATE POLICY "Users can insert own reservations"
  ON reservations FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all reservations" ON reservations;
CREATE POLICY "Admins can manage all reservations"
  ON reservations FOR ALL USING (auth.role() = 'service_role');

-- Cars: public read, service role full access
DROP POLICY IF EXISTS "Public read cars" ON cars;
CREATE POLICY "Public read cars"
  ON cars FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role manages cars" ON cars;
CREATE POLICY "Service role manages cars"
  ON cars FOR ALL USING (auth.role() = 'service_role');

-- Leads: public insert, service role full access
DROP POLICY IF EXISTS "Public submit leads" ON leads;
CREATE POLICY "Public submit leads"
  ON leads FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Service role manages leads" ON leads;
CREATE POLICY "Service role manages leads"
  ON leads FOR ALL USING (auth.role() = 'service_role');

-- Appointments: public insert, service role full access
DROP POLICY IF EXISTS "Public submit appointments" ON appointments;
CREATE POLICY "Public submit appointments"
  ON appointments FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Service role manages appointments" ON appointments;
CREATE POLICY "Service role manages appointments"
  ON appointments FOR ALL USING (auth.role() = 'service_role');

-- Reviews: public read
DROP POLICY IF EXISTS "Public read reviews" ON reviews;
CREATE POLICY "Public read reviews"
  ON reviews FOR SELECT USING (true);

-- Profiles: users read/write own, admins read all
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id::uuid);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id::uuid);

DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR ALL USING (auth.role() = 'service_role');

-- Chats: users see own, public insert (for guests), admins see all
-- Ensure correct types (fixing potential legacy TEXT columns)
-- CRITICAL: Must drop dependent policies first
DROP POLICY IF EXISTS "Users can view own chats" ON chats;
DROP POLICY IF EXISTS "Users can view own messages" ON messages;
DROP POLICY IF EXISTS "Anyone can insert chats" ON chats;
DROP POLICY IF EXISTS "Admins can view all chats" ON chats;
DROP POLICY IF EXISTS "Anyone can insert messages" ON messages;
DROP POLICY IF EXISTS "Admins can view all messages" ON messages;

DO $$
BEGIN
  -- Convert user_id in chats if it's text
  IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'chats' AND column_name = 'user_id' AND data_type = 'text'
  ) THEN
      ALTER TABLE chats ALTER COLUMN user_id TYPE UUID USING user_id::UUID;
  END IF;

  -- Convert chat_id in messages if it's text
  IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'messages' AND column_name = 'chat_id' AND data_type = 'text'
  ) THEN
      ALTER TABLE messages ALTER COLUMN chat_id TYPE UUID USING chat_id::UUID;
  END IF;
END $$;

-- Recreate policies with explicit casting
CREATE POLICY "Users can view own chats"
  ON chats FOR SELECT USING (auth.uid() = user_id::uuid OR user_id IS NULL);

CREATE POLICY "Anyone can insert chats"
  ON chats FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all chats"
  ON chats FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Users can view own messages"
  ON messages FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chats 
      WHERE chats.id::uuid = messages.chat_id::uuid 
      AND (chats.user_id::uuid = auth.uid() OR chats.user_id IS NULL)
    )
  );

CREATE POLICY "Anyone can insert messages"
  ON messages FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all messages"
  ON messages FOR ALL USING (auth.role() = 'service_role');

-- ── REALTIME ─────────────────────────────────────────────────
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'cars') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE cars;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'leads') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE leads;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'appointments') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE appointments;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'reviews') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE reviews;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'reservations') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE reservations;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'chats') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE chats;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'messages') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE messages;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'profiles') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
  END IF;
END $$;

-- ── STORAGE BUCKET (car images) ──────────────────────────────
-- Creates a public bucket for car photo uploads via the admin portal.

INSERT INTO storage.buckets (id, name, public)
VALUES ('car-images', 'car-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read car images" ON storage.objects;
CREATE POLICY "Public read car images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'car-images');

DROP POLICY IF EXISTS "Anyone can upload car images" ON storage.objects;
CREATE POLICY "Anyone can upload car images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'car-images');

DROP POLICY IF EXISTS "Anyone can delete car images" ON storage.objects;
CREATE POLICY "Anyone can delete car images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'car-images');

-- ── OPTIMIZATIONS ─────────────────────────────────────────────
-- Enable full replica identity for better Realtime filtering
ALTER TABLE chats REPLICA IDENTITY FULL;
ALTER TABLE messages REPLICA IDENTITY FULL;

-- Backfill missing profiles (for users created before the trigger)
INSERT INTO public.profiles (id, email, full_name)
SELECT id, email, COALESCE(raw_user_meta_data->>'full_name', 'Legacy User')
FROM auth.users
ON CONFLICT (id) DO NOTHING;
