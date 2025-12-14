-- COMPLETE FIX - Run this in Supabase SQL Editor
-- This will drop and recreate tables with correct structure

-- Step 1: Drop existing tables (deletes all data)
DROP TABLE IF EXISTS link_clicks CASCADE;
DROP TABLE IF EXISTS links CASCADE;

-- Step 2: Create links table with ALL required columns
CREATE TABLE links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Step 3: Create link_clicks table
CREATE TABLE link_clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    link_id UUID NOT NULL REFERENCES links(id) ON DELETE CASCADE,
    ip_address VARCHAR(45),
    country VARCHAR(100),
    city VARCHAR(100),
    region VARCHAR(100),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    user_agent TEXT,
    clicked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Step 4: Create indexes
CREATE INDEX idx_link_clicks_link_id ON link_clicks(link_id);
CREATE INDEX idx_links_slug ON links(slug);

-- Step 5: Enable RLS
ALTER TABLE links ENABLE ROW LEVEL SECURITY;
ALTER TABLE link_clicks ENABLE ROW LEVEL SECURITY;

-- Step 6: Create policies for public access
CREATE POLICY "Allow public read access to links" ON links
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert to links" ON links
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access to link_clicks" ON link_clicks
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert to link_clicks" ON link_clicks
    FOR INSERT WITH CHECK (true);

-- Step 7: Verify tables were created correctly
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name IN ('links', 'link_clicks')
ORDER BY table_name, ordinal_position;

