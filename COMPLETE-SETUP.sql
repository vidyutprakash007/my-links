-- ============================================
-- COMPLETE DATABASE SETUP FOR LINK TRACKER
-- ============================================
-- Copy ALL of this and paste into Supabase SQL Editor
-- Then click "Run" button

-- Step 1: Drop any existing tables (if they exist)
DROP TABLE IF EXISTS link_clicks CASCADE;
DROP TABLE IF EXISTS links CASCADE;

-- Step 2: Create the links table
CREATE TABLE links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Step 3: Create the link_clicks table
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

-- Step 4: Create indexes for better performance
CREATE INDEX idx_link_clicks_link_id ON link_clicks(link_id);
CREATE INDEX idx_links_slug ON links(slug);

-- Step 5: Enable Row Level Security
ALTER TABLE links ENABLE ROW LEVEL SECURITY;
ALTER TABLE link_clicks ENABLE ROW LEVEL SECURITY;

-- Step 6: Create policies to allow public access
-- (Required when using anon key)

CREATE POLICY "Allow public read access to links" ON links
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert to links" ON links
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access to link_clicks" ON link_clicks
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert to link_clicks" ON link_clicks
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update to link_clicks" ON link_clicks
    FOR UPDATE USING (true) WITH CHECK (true);

-- Step 7: Verify the tables were created
-- You should see both 'links' and 'link_clicks' in the results
SELECT 
    'Table: ' || table_name as info,
    COUNT(*) as column_count
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name IN ('links', 'link_clicks')
GROUP BY table_name;

-- Step 8: Show all columns (verify structure)
SELECT 
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name IN ('links', 'link_clicks')
ORDER BY table_name, ordinal_position;

