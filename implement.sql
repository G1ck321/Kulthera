-- ============================================
-- KULTHERA DATABASE SCHEMA
-- Supabase PostgreSQL
-- ============================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. ROOMS — Museum wing containers
-- ============================================
CREATE TABLE IF NOT EXISTS rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR NOT NULL UNIQUE,
    name VARCHAR NOT NULL,
    tagline VARCHAR NOT NULL,
    description VARCHAR NOT NULL,
    image_url VARCHAR NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rooms_slug ON rooms(slug);

-- ============================================
-- 2. CREATORS — Artists & cultural custodians
-- ============================================
CREATE TABLE IF NOT EXISTS creators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR NOT NULL,
    role VARCHAR NOT NULL,
    bio VARCHAR NOT NULL,
    avatar_url VARCHAR NOT NULL,
    wallet_address VARCHAR NOT NULL,
    country VARCHAR NOT NULL,
    language VARCHAR NOT NULL,
    email VARCHAR,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- 3. EXHIBITS — Individual artworks/performances
-- ============================================
CREATE TABLE IF NOT EXISTS exhibits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
    title VARCHAR NOT NULL,
    description VARCHAR NOT NULL,
    cultural_context VARCHAR NOT NULL,
    media_type VARCHAR NOT NULL,  -- 'audio', 'painting', 'artifact', 'story'
    media_url VARCHAR NOT NULL,
    preview_url VARCHAR NOT NULL,
    wallet_address VARCHAR NOT NULL,
    country VARCHAR NOT NULL,
    region VARCHAR NOT NULL,
    language_code VARCHAR NOT NULL,
    tags JSONB NOT NULL DEFAULT '[]'::jsonb,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exhibits_room ON exhibits(room_id);
CREATE INDEX IF NOT EXISTS idx_exhibits_creator ON exhibits(creator_id);
CREATE INDEX IF NOT EXISTS idx_exhibits_media_type ON exhibits(media_type);

-- ============================================
-- 4. VISITOR_SESSIONS — Anonymous visitor sessions
-- ============================================
CREATE TABLE IF NOT EXISTS visitor_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_token VARCHAR NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_visitor_sessions_token ON visitor_sessions(session_token);

-- ============================================
-- 5. EXHIBIT_VIEW_SESSIONS — Attention tracking per exhibit
-- ============================================
CREATE TABLE IF NOT EXISTS exhibit_view_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visitor_session_token VARCHAR NOT NULL REFERENCES visitor_sessions(session_token) ON DELETE CASCADE,
    exhibit_id UUID NOT NULL REFERENCES exhibits(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
    wallet_address VARCHAR NOT NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    duration_seconds INTEGER NOT NULL DEFAULT 0,
    monetized_seconds INTEGER NOT NULL DEFAULT 0,
    last_monetization_state VARCHAR NOT NULL DEFAULT 'idle',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_evs_exhibit ON exhibit_view_sessions(exhibit_id);
CREATE INDEX IF NOT EXISTS idx_evs_creator ON exhibit_view_sessions(creator_id);

-- ============================================
-- 6. MONETIZATION_EVENTS — Granular payment records
-- ============================================
CREATE TABLE IF NOT EXISTS monetization_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exhibit_view_session_id UUID NOT NULL REFERENCES exhibit_view_sessions(id) ON DELETE CASCADE,
    event_type VARCHAR NOT NULL,
    state VARCHAR NOT NULL,
    amount VARCHAR,
    asset_code VARCHAR,
    asset_scale INTEGER,
    raw_event JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    wallet_address VARCHAR
);

CREATE INDEX IF NOT EXISTS idx_me_session ON monetization_events(exhibit_view_session_id);

-- ============================================
-- AUTO-UPDATE updated_at TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_creators_updated_at BEFORE UPDATE ON creators
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exhibits_updated_at BEFORE UPDATE ON exhibits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS) policies
-- ============================================
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE exhibits ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exhibit_view_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE monetization_events ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Public read access" ON rooms FOR SELECT USING (true);
CREATE POLICY "Public read access" ON creators FOR SELECT USING (true);
CREATE POLICY "Public read access" ON exhibits FOR SELECT USING (true);

-- Allow public inserts for analytics/view sessions
CREATE POLICY "Public insert access" ON visitor_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public insert access" ON exhibit_view_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public insert access" ON monetization_events FOR ALL USING (true) WITH CHECK (true);
