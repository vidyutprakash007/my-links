-- ============================================
-- ADD AUTHENTICATION: Users Table
-- ============================================
-- Run this in Supabase SQL Editor after COMPLETE-SETUP.sql

-- Step 1: Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Step 2: Insert default user
-- Password: Mydanam@560 (will be hashed in application)
INSERT INTO users (username, password) 
VALUES ('vidyut007', 'Mydanam@560')
ON CONFLICT (username) DO NOTHING;

-- Step 3: Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Step 4: Create policy to allow reading users (for login verification)
CREATE POLICY "Allow read for login" ON users
    FOR SELECT USING (true);

-- Step 5: Verify user was created
SELECT username, created_at FROM users WHERE username = 'vidyut007';

