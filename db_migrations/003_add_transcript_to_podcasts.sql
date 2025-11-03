-- Add transcript column to podcasts table
-- This column stores the podcast script/transcript ready for text-to-speech conversion

ALTER TABLE podcasts
ADD COLUMN IF NOT EXISTS transcript TEXT;

-- Add comment to document the column purpose
COMMENT ON COLUMN podcasts.transcript IS 'Podcast script/transcript ready for text-to-speech conversion';

