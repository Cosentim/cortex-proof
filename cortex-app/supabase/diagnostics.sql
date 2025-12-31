-- CORTEX Supabase Diagnostics
-- Run this in Supabase SQL Editor to check your setup

-- 1. Check if tables exist
SELECT 
  'Tables Check' as check_type,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles') as user_profiles_exists,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'memories') as memories_exists,
  EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'chat_logs') as chat_logs_exists;

-- 2. Check if extensions are enabled
SELECT 
  'Extensions Check' as check_type,
  EXISTS(SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp') as uuid_ossp_enabled,
  EXISTS(SELECT 1 FROM pg_extension WHERE extname = 'vector') as vector_enabled;

-- 3. Check RLS policies
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 4. Check if trigger exists
SELECT 
  'Trigger Check' as check_type,
  EXISTS(
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'on_auth_user_created'
  ) as user_creation_trigger_exists;

-- 5. Check user_profiles count
SELECT 
  'User Profiles' as check_type,
  COUNT(*) as count
FROM user_profiles;

-- 6. Check memories count
SELECT 
  'Memories' as check_type,
  COUNT(*) as count
FROM memories;

-- 7. Check if current user has a profile (run while logged in)
SELECT 
  'Current User Profile' as check_type,
  id,
  email,
  display_name,
  created_at
FROM user_profiles
WHERE id = auth.uid();

-- 8. List any errors in recent function calls (if logged)
-- This won't exist by default, just informational

SELECT '✅ Diagnostics complete! Check results above.' as status;
