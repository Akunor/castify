-- Castify Add Users Table Migration
-- This migration creates a users table in the public schema
-- and updates existing tables to reference it instead of auth.users

-- Create users table in public schema
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add unique constraint on email
CREATE UNIQUE INDEX users_email_idx ON users(email);

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Function to automatically create a user profile when they sign up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function when a new user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- UPDATE EXISTING TABLES
-- ==========================================

-- Drop existing foreign key constraints and recreate them to point to public.users
-- Note: This requires dropping and recreating the constraints

-- Documents table
ALTER TABLE documents DROP CONSTRAINT documents_user_id_fkey;
ALTER TABLE documents ADD CONSTRAINT documents_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Projects table
ALTER TABLE projects DROP CONSTRAINT projects_user_id_fkey;
ALTER TABLE projects ADD CONSTRAINT projects_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- Podcasts table
ALTER TABLE podcasts DROP CONSTRAINT podcasts_user_id_fkey;
ALTER TABLE podcasts ADD CONSTRAINT podcasts_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

-- ==========================================
-- UPDATE RLS POLICIES
-- ==========================================

-- Drop old policies
DROP POLICY IF EXISTS "Users can view own documents" ON documents;
DROP POLICY IF EXISTS "Users can insert own documents" ON documents;
DROP POLICY IF EXISTS "Users can update own documents" ON documents;
DROP POLICY IF EXISTS "Users can delete own documents" ON documents;

DROP POLICY IF EXISTS "Users can view own projects" ON projects;
DROP POLICY IF EXISTS "Users can insert own projects" ON projects;
DROP POLICY IF EXISTS "Users can update own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON projects;

DROP POLICY IF EXISTS "Users can view own podcasts" ON podcasts;
DROP POLICY IF EXISTS "Users can insert own podcasts" ON podcasts;
DROP POLICY IF EXISTS "Users can update own podcasts" ON podcasts;
DROP POLICY IF EXISTS "Users can delete own podcasts" ON podcasts;

DROP POLICY IF EXISTS "Users can view own project documents" ON project_documents;
DROP POLICY IF EXISTS "Users can insert own project documents" ON project_documents;
DROP POLICY IF EXISTS "Users can update own project documents" ON project_documents;
DROP POLICY IF EXISTS "Users can delete own project documents" ON project_documents;

DROP POLICY IF EXISTS "Users can view own podcast documents" ON podcast_documents;
DROP POLICY IF EXISTS "Users can insert own podcast documents" ON podcast_documents;
DROP POLICY IF EXISTS "Users can update own podcast documents" ON podcast_documents;
DROP POLICY IF EXISTS "Users can delete own podcast documents" ON podcast_documents;

-- Create new policies using public.users
-- Documents policies
CREATE POLICY "Users can view own documents" ON documents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents" ON documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents" ON documents
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents" ON documents
  FOR DELETE USING (auth.uid() = user_id);

-- Projects policies
CREATE POLICY "Users can view own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON projects
  FOR DELETE USING (auth.uid() = user_id);

-- Project-Documents policies
CREATE POLICY "Users can view own project documents" ON project_documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_documents.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own project documents" ON project_documents
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_documents.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own project documents" ON project_documents
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_documents.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own project documents" ON project_documents
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_documents.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Podcasts policies
CREATE POLICY "Users can view own podcasts" ON podcasts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own podcasts" ON podcasts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own podcasts" ON podcasts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own podcasts" ON podcasts
  FOR DELETE USING (auth.uid() = user_id);

-- Podcast-Documents policies
CREATE POLICY "Users can view own podcast documents" ON podcast_documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM podcasts
      WHERE podcasts.id = podcast_documents.podcast_id
      AND podcasts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own podcast documents" ON podcast_documents
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM podcasts
      WHERE podcasts.id = podcast_documents.podcast_id
      AND podcasts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own podcast documents" ON podcast_documents
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM podcasts
      WHERE podcasts.id = podcast_documents.podcast_id
      AND podcasts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own podcast documents" ON podcast_documents
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM podcasts
      WHERE podcasts.id = podcast_documents.podcast_id
      AND podcasts.user_id = auth.uid()
    )
  );

-- ==========================================
-- ADD INDEXES
-- ==========================================

CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);
CREATE INDEX IF NOT EXISTS users_created_at_idx ON users(created_at);

