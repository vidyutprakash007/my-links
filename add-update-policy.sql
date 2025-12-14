-- Add UPDATE policy for link_clicks table
-- Run this in Supabase SQL Editor if updates are not working

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
    cmd
FROM pg_policies
WHERE schemaname = 'public' 
AND tablename = 'link_clicks'
AND cmd = 'UPDATE';

