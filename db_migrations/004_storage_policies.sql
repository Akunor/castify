-- Storage Bucket Policies for Supabase Storage
-- These policies control access to the storage buckets
--
-- IMPORTANT: Before running this migration:
-- 1. Create the storage buckets in Supabase Dashboard:
--    - Go to Storage > Create bucket
--    - Create bucket named "documents" (private)
--    - Create bucket named "podcasts" (private)
-- 2. Then run this SQL in the Supabase SQL Editor
--
-- These policies allow authenticated users to:
-- - Upload files to folders named with their user ID
-- - Read/update/delete only their own files
-- File path format: {user_id}/{filename}

-- ==========================================
-- DOCUMENTS BUCKET POLICIES
-- ==========================================

-- Allow authenticated users to upload files to their own folder
-- File path format: {user_id}/{filename}
CREATE POLICY "Users can upload documents to own folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND
  (string_to_array(name, '/'))[1] = auth.uid()::text
);

-- Allow authenticated users to read their own documents
CREATE POLICY "Users can read own documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' AND
  (string_to_array(name, '/'))[1] = auth.uid()::text
);

-- Allow authenticated users to update their own documents
CREATE POLICY "Users can update own documents"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documents' AND
  (string_to_array(name, '/'))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'documents' AND
  (string_to_array(name, '/'))[1] = auth.uid()::text
);

-- Allow authenticated users to delete their own documents
CREATE POLICY "Users can delete own documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents' AND
  (string_to_array(name, '/'))[1] = auth.uid()::text
);

-- ==========================================
-- PODCASTS BUCKET POLICIES
-- ==========================================

-- Allow authenticated users to upload podcasts to their own folder
CREATE POLICY "Users can upload podcasts to own folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'podcasts' AND
  (string_to_array(name, '/'))[1] = auth.uid()::text
);

-- Allow authenticated users to read their own podcasts
CREATE POLICY "Users can read own podcasts"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'podcasts' AND
  (string_to_array(name, '/'))[1] = auth.uid()::text
);

-- Allow authenticated users to delete their own podcasts
CREATE POLICY "Users can delete own podcasts"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'podcasts' AND
  (string_to_array(name, '/'))[1] = auth.uid()::text
);

