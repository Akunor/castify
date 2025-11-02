# Database Migrations

This directory contains SQL migration files for the Castify database schema.

## Migration Order

Migrations must be run in numerical order:

1. **001_initial_schema.sql** - Creates initial tables (documents, projects, podcasts) with RLS policies
2. **002_add_users_table.sql** - Adds users table in public schema and migrates foreign keys

## How to Apply Migrations

### Using Supabase Dashboard

1. Log in to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste the contents of `001_initial_schema.sql`
5. Click **Run** to execute
6. Repeat for `002_add_users_table.sql`

### Using Supabase CLI (Advanced)

If you have the Supabase CLI installed:

```bash
# Link your project
supabase link --project-ref your-project-ref

# Apply migrations
supabase db push
```

## What Each Migration Does

### 001_initial_schema.sql

Creates the core tables:
- `documents` - User uploaded documents
- `projects` - Groups of documents
- `podcasts` - Generated podcast content
- `project_documents` - Many-to-many relationship between projects and documents
- `podcast_documents` - Many-to-many relationship between podcasts and documents

Enables Row Level Security (RLS) on all tables and creates policies ensuring users can only access their own data.

### 002_add_users_table.sql

Creates:
- `users` table in the public schema to store user profile information
- Automatic trigger to create user profile when someone signs up via Supabase Auth
- Migrates all foreign key references from `auth.users` to `public.users`

Updates all RLS policies to work with the new users table structure.

## Important Notes

- **Never modify existing migrations** - Always create new migrations for changes
- **Run migrations in order** - Each migration builds on the previous one
- **Backup your database** - Before running migrations on production data
- **Test first** - Always test migrations on a staging environment first

## Troubleshooting

### "relation already exists" error

If you see this error, the migration may have been partially applied. Check which tables/policies already exist and skip those steps.

### "permission denied" error

Make sure you're running migrations as a user with proper permissions. In Supabase, this is typically the `postgres` role.

### RLS policies not working

After running migrations, verify that RLS is enabled on all tables:
```sql
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
```

Make sure all policies were created successfully:
```sql
SELECT * FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename, policyname;
```

## Adding New Migrations

When you need to add a new migration:

1. Create a new file with the next sequential number: `003_description.sql`
2. Follow the same format as existing migrations
3. Add comments explaining what the migration does
4. Update this README with a description of the new migration

Example:
```sql
-- Castify Migration 003: Add User Preferences
-- This migration adds a user_preferences table for storing user settings

CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  theme TEXT DEFAULT 'light',
  notifications_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- Add index
CREATE INDEX idx_user_preferences_user_id ON user_preferences(user_id);
```

