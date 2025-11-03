# Supabase Storage Setup Instructions

## Step 1: Create Storage Buckets

1. Go to your Supabase Dashboard
2. Navigate to **Storage** in the sidebar
3. Create two buckets:
   - **`documents`** - for uploaded document files
   - **`podcasts`** - for generated audio files

### Bucket Configuration:
- **Public bucket**: Leave unchecked (these should be private)
- **File size limit**: Set appropriate limit (e.g., 10MB for documents, 50MB for podcasts)
- **Allowed MIME types**: Leave empty to allow all types

## Step 2: Create Storage Policies

Run the SQL from `004_storage_policies.sql` in your Supabase SQL Editor:

1. Go to **SQL Editor** in your Supabase Dashboard
2. Click **New Query**
3. Copy and paste the contents of `db_migrations/004_storage_policies.sql`
4. Click **Run** to execute

## Step 3: Verify Policies

After running the SQL, verify the policies are created:

```sql
SELECT * FROM pg_policies WHERE schemaname = 'storage';
```

You should see policies for:
- `Users can upload documents to own folder`
- `Users can read own documents`
- `Users can update own documents`
- `Users can delete own documents`
- `Users can upload podcasts to own folder`
- `Users can read own podcasts`
- `Users can delete own podcasts`

## Troubleshooting

If you still get RLS errors:

1. **Check bucket exists**: Ensure both `documents` and `podcasts` buckets are created
2. **Check policies**: Verify the storage policies were created successfully
3. **Check authentication**: Ensure the user is properly authenticated (cookies should be set)
4. **Check file path**: The file path format should be `{user_id}/{filename}`

## Alternative: Public Buckets (Not Recommended)

If you need to bypass RLS temporarily (not recommended for production):

1. Mark buckets as public in Supabase Dashboard
2. This allows anyone with the URL to access files
3. Only use for development/testing

