-- Add DELETE policy for links table
-- Run this in Supabase SQL Editor

-- Add DELETE policy for links
CREATE POLICY "Allow public delete to links" ON links
    FOR DELETE USING (true);

-- Add DELETE policy for link_clicks (optional, but good to have)
CREATE POLICY "Allow public delete to link_clicks" ON link_clicks
    FOR DELETE USING (true);

