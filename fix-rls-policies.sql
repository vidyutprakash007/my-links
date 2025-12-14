-- Fix RLS Policies for Link Tracker
-- Run this in Supabase SQL Editor if you're getting permission errors

-- First, drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to links" ON links;
DROP POLICY IF EXISTS "Allow public insert to links" ON links;
DROP POLICY IF EXISTS "Allow public update to links" ON links;
DROP POLICY IF EXISTS "Allow public delete to links" ON links;

DROP POLICY IF EXISTS "Allow public read access to link_clicks" ON link_clicks;
DROP POLICY IF EXISTS "Allow public insert to link_clicks" ON link_clicks;
DROP POLICY IF EXISTS "Allow public update to link_clicks" ON link_clicks;
DROP POLICY IF EXISTS "Allow public delete to link_clicks" ON link_clicks;

-- Recreate policies for links table
CREATE POLICY "Allow public read access to links" ON links
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert to links" ON links
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update to links" ON links
    FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow public delete to links" ON links
    FOR DELETE USING (true);

-- Recreate policies for link_clicks table
CREATE POLICY "Allow public read access to link_clicks" ON link_clicks
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert to link_clicks" ON link_clicks
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update to link_clicks" ON link_clicks
    FOR UPDATE USING (true) WITH CHECK (true);

CREATE POLICY "Allow public delete to link_clicks" ON link_clicks
    FOR DELETE USING (true);

