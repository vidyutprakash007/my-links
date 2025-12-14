-- Supabase Migration SQL
-- Run this in your Supabase SQL Editor

-- Enable UUID extension (usually enabled by default in Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Links table: stores generated links with names
CREATE TABLE IF NOT EXISTS links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Location tracking table: stores location details when links are clicked
CREATE TABLE IF NOT EXISTS link_clicks (
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

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_link_clicks_link_id ON link_clicks(link_id);
CREATE INDEX IF NOT EXISTS idx_links_slug ON links(slug);

-- Enable Row Level Security (RLS) - optional, adjust based on your needs
ALTER TABLE links ENABLE ROW LEVEL SECURITY;
ALTER TABLE link_clicks ENABLE ROW LEVEL SECURITY;

-- Create policies to allow public read/write (adjust based on your security needs)
-- For service role key, these may not be needed, but good for anon key
CREATE POLICY "Allow public read access to links" ON links
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert to links" ON links
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access to link_clicks" ON link_clicks
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert to link_clicks" ON link_clicks
    FOR INSERT WITH CHECK (true);

