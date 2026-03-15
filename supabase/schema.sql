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

-- Live chat sessions
CREATE TABLE IF NOT EXISTS chats (
  id          UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id     TEXT,
  subject     TEXT,
  status      TEXT        DEFAULT 'open', -- 'open' | 'closed'
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Chat messages
CREATE TABLE IF NOT EXISTS messages (
  id          UUID        DEFAULT uuid_generate_v4() PRIMARY KEY,
  chat_id     UUID        REFERENCES chats(id) ON DELETE CASCADE,
  sender      TEXT        NOT NULL, -- 'user' | 'admin'
  content     TEXT        NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── ROW LEVEL SECURITY ────────────────────────────────────────

ALTER TABLE cars         ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads        ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews      ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats        ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages     ENABLE ROW LEVEL SECURITY;

-- Cars: public read, service role full access
CREATE POLICY "Public read cars"
  ON cars FOR SELECT USING (true);

CREATE POLICY "Service role manages cars"
  ON cars FOR ALL USING (auth.role() = 'service_role');

-- Leads: public insert, service role full access
CREATE POLICY "Public submit leads"
  ON leads FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role manages leads"
  ON leads FOR ALL USING (auth.role() = 'service_role');

-- Appointments: public insert, service role full access
CREATE POLICY "Public submit appointments"
  ON appointments FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role manages appointments"
  ON appointments FOR ALL USING (auth.role() = 'service_role');

-- Reviews: public read
CREATE POLICY "Public read reviews"
  ON reviews FOR SELECT USING (true);

-- Chats & Messages: public read + insert (for live chat widget)
CREATE POLICY "Public read and insert chats"
  ON chats FOR ALL USING (true);

CREATE POLICY "Public read and insert messages"
  ON messages FOR ALL USING (true);

-- ── REALTIME ─────────────────────────────────────────────────

ALTER PUBLICATION supabase_realtime ADD TABLE cars;
ALTER PUBLICATION supabase_realtime ADD TABLE leads;
ALTER PUBLICATION supabase_realtime ADD TABLE appointments;
ALTER PUBLICATION supabase_realtime ADD TABLE reviews;
ALTER PUBLICATION supabase_realtime ADD TABLE chats;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- ── STORAGE BUCKET (car images) ──────────────────────────────
-- Creates a public bucket for car photo uploads via the admin portal.

INSERT INTO storage.buckets (id, name, public)
VALUES ('car-images', 'car-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read car images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'car-images');

CREATE POLICY "Anyone can upload car images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'car-images');

CREATE POLICY "Anyone can delete car images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'car-images');
