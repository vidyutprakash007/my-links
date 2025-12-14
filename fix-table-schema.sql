-- Fix Table Schema
-- Run this in Supabase SQL Editor to fix the table structure

-- First, let's check what columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'links';

-- Drop the table if it exists with wrong structure (WARNING: This deletes all data!)
-- Uncomment the next line if you want to start fresh:
-- DROP TABLE IF EXISTS link_clicks CASCADE;
-- DROP TABLE IF EXISTS links CASCADE;

-- Or, if you want to keep data, alter the existing table:
-- Check if name column exists, if not add it
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'links' 
        AND column_name = 'name'
    ) THEN
        ALTER TABLE links ADD COLUMN name VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'links' 
        AND column_name = 'slug'
    ) THEN
        ALTER TABLE links ADD COLUMN slug VARCHAR(255) UNIQUE;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'links' 
        AND column_name = 'created_at'
    ) THEN
        ALTER TABLE links ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

-- Make name NOT NULL if it's not already
ALTER TABLE links ALTER COLUMN name SET NOT NULL;
ALTER TABLE links ALTER COLUMN slug SET NOT NULL;

-- Now recreate the table properly (SAFER: Drop and recreate)
-- This will delete any existing data, but ensures correct structure

DROP TABLE IF EXISTS link_clicks CASCADE;
DROP TABLE IF EXISTS links CASCADE;

-- Create links table with correct structure
CREATE TABLE links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create link_clicks table
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

-- Create indexes
CREATE INDEX idx_link_clicks_link_id ON link_clicks(link_id);
CREATE INDEX idx_links_slug ON links(slug);

-- Enable RLS
ALTER TABLE links ENABLE ROW LEVEL SECURITY;
ALTER TABLE link_clicks ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access to links" ON links
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert to links" ON links
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access to link_clicks" ON link_clicks
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert to link_clicks" ON link_clicks
    FOR INSERT WITH CHECK (true);

