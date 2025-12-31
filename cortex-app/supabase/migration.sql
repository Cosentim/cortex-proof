-- CORTEX Schema Migration / Update Script
-- Run this in Supabase SQL Editor to update existing tables safely
-- This will NOT delete your existing data

-- ===========================================
-- 1. ENABLE EXTENSIONS (safe to run multiple times)
-- ===========================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ===========================================
-- 2. UPDATE user_profiles TABLE
-- ===========================================

-- Add missing columns if they don't exist
DO $$ 
BEGIN
  -- Add cognitive_profile if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'cognitive_profile') THEN
    ALTER TABLE user_profiles ADD COLUMN cognitive_profile JSONB DEFAULT '{}';
  END IF;
  
  -- Add onboarding_progress if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'onboarding_progress') THEN
    ALTER TABLE user_profiles ADD COLUMN onboarding_progress JSONB DEFAULT '{}';
  END IF;
  
  -- Add preferences if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'preferences') THEN
    ALTER TABLE user_profiles ADD COLUMN preferences JSONB DEFAULT '{"model": "balanced", "theme": "system"}';
  END IF;
  
  -- Add display_name if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'display_name') THEN
    ALTER TABLE user_profiles ADD COLUMN display_name TEXT;
  END IF;
  
  -- Add updated_at if missing
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_profiles' AND column_name = 'updated_at') THEN
    ALTER TABLE user_profiles ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- ===========================================
-- 3. CREATE/UPDATE memories TABLE
-- ===========================================

CREATE TABLE IF NOT EXISTS memories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  layer TEXT NOT NULL CHECK (layer IN ('identity', 'preferences', 'knowledge', 'relational', 'temporal')),
  memory_type TEXT NOT NULL,
  content TEXT NOT NULL,
  embedding VECTOR(1536),
  confidence REAL DEFAULT 0.8,
  source TEXT DEFAULT 'conversation',
  metadata JSONB DEFAULT '{}',
  is_pinned BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  access_count INTEGER DEFAULT 0,
  retrieval_boost REAL DEFAULT 1.0,
  last_accessed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns to memories if table already existed
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'memories' AND column_name = 'retrieval_boost') THEN
    ALTER TABLE memories ADD COLUMN retrieval_boost REAL DEFAULT 1.0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'memories' AND column_name = 'access_count') THEN
    ALTER TABLE memories ADD COLUMN access_count INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'memories' AND column_name = 'last_accessed_at') THEN
    ALTER TABLE memories ADD COLUMN last_accessed_at TIMESTAMPTZ;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'memories' AND column_name = 'is_active') THEN
    ALTER TABLE memories ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
  END IF;
END $$;

-- ===========================================
-- 4. CREATE chat_logs TABLE
-- ===========================================

CREATE TABLE IF NOT EXISTS chat_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  model_id TEXT NOT NULL,
  query_tokens INTEGER,
  response_tokens INTEGER,
  context_tokens INTEGER,
  memory_count INTEGER,
  layers_used TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===========================================
-- 5. CREATE/UPDATE INDEXES
-- ===========================================

CREATE INDEX IF NOT EXISTS idx_memories_user_layer 
ON memories(user_id, layer) 
WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_memories_pinned 
ON memories(user_id) 
WHERE is_pinned = TRUE AND is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_chat_logs_user_created 
ON chat_logs(user_id, created_at DESC);

-- Vector index (may fail if not enough data - that's OK)
DO $$
BEGIN
  CREATE INDEX IF NOT EXISTS idx_memories_embedding 
  ON memories 
  USING ivfflat (embedding vector_cosine_ops) 
  WITH (lists = 100);
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Vector index skipped (needs more data or already exists)';
END $$;

-- ===========================================
-- 6. CREATE/REPLACE FUNCTIONS
-- ===========================================

-- Vector similarity search function
CREATE OR REPLACE FUNCTION match_memories(
  query_embedding VECTOR(1536),
  match_user_id UUID,
  match_layer TEXT,
  match_threshold FLOAT,
  match_count INT
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  layer TEXT,
  memory_type TEXT,
  content TEXT,
  confidence REAL,
  source TEXT,
  metadata JSONB,
  is_pinned BOOLEAN,
  access_count INTEGER,
  retrieval_boost REAL,
  created_at TIMESTAMPTZ,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id,
    m.user_id,
    m.layer,
    m.memory_type,
    m.content,
    m.confidence,
    m.source,
    m.metadata,
    m.is_pinned,
    m.access_count,
    m.retrieval_boost,
    m.created_at,
    1 - (m.embedding <=> query_embedding) AS similarity
  FROM memories m
  WHERE m.user_id = match_user_id
    AND m.layer = match_layer
    AND m.is_active = TRUE
    AND 1 - (m.embedding <=> query_embedding) > match_threshold
  ORDER BY m.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Increment memory access count
CREATE OR REPLACE FUNCTION increment_memory_access(memory_ids UUID[])
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE memories
  SET 
    access_count = access_count + 1,
    last_accessed_at = NOW()
  WHERE id = ANY(memory_ids);
END;
$$;

-- ===========================================
-- 7. ENABLE ROW LEVEL SECURITY
-- ===========================================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_logs ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- 8. CREATE/REPLACE RLS POLICIES
-- ===========================================

-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own memories" ON memories;
DROP POLICY IF EXISTS "Users can insert own memories" ON memories;
DROP POLICY IF EXISTS "Users can update own memories" ON memories;
DROP POLICY IF EXISTS "Users can delete own memories" ON memories;
DROP POLICY IF EXISTS "Users can view own chat logs" ON chat_logs;
DROP POLICY IF EXISTS "Users can insert own chat logs" ON chat_logs;

-- Recreate policies
CREATE POLICY "Users can view own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view own memories" ON memories FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own memories" ON memories FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own memories" ON memories FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own memories" ON memories FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own chat logs" ON chat_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own chat logs" ON chat_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ===========================================
-- 9. CREATE/REPLACE TRIGGERS
-- ===========================================

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
BEFORE UPDATE ON user_profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_memories_updated_at ON memories;
CREATE TRIGGER update_memories_updated_at
BEFORE UPDATE ON memories
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ===========================================
-- 10. CREATE PROFILE FOR EXISTING USERS
-- ===========================================

-- This ensures all existing auth users have profiles
INSERT INTO user_profiles (id, email, display_name)
SELECT 
  id, 
  email, 
  COALESCE(raw_user_meta_data->>'display_name', split_part(email, '@', 1))
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- ===========================================
-- DONE!
-- ===========================================

SELECT '✅ Migration complete! Your CORTEX schema is now up to date.' as status;
