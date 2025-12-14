-- ============================================
-- FIX: Add UPDATE Policy for link_clicks
-- ============================================
-- Run this in Supabase SQL Editor to fix latitude/longitude not saving

-- Drop existing UPDATE policy if it exists
DROP POLICY IF EXISTS "Allow public update to link_clicks" ON link_clicks;

-- Create UPDATE policy for link_clicks
CREATE POLICY "Allow public update to link_clicks" ON link_clicks
    FOR UPDATE USING (true) WITH CHECK (true);

-- Verify the policy was created
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public' 
AND tablename = 'link_clicks'
AND cmd = 'UPDATE';

-- You should see one row with the UPDATE policy

