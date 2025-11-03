/**
 * Application constants and configuration
 */

// File upload limits
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

// Supported MIME types for document upload
export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'text/plain',
  'text/markdown',
] as const;

// Document statuses
export const DOCUMENT_STATUS = {
  UPLOADED: 'uploaded',
  PROCESSING: 'processing',
  PROCESSED: 'processed',
  ERROR: 'error',
} as const;

// Podcast statuses
export const PODCAST_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  ERROR: 'error',
} as const;

// Supabase Storage bucket names
export const STORAGE_BUCKETS = {
  DOCUMENTS: 'documents',
  PODCASTS: 'podcasts',
} as const;

// OpenAI configuration
export const OPENAI_CONFIG = {
  MODEL: 'gpt-4-turbo-preview',
  MAX_TOKENS: 4000,
  TEMPERATURE: 0.7,
  MAX_INPUT_CHARS: 400000, // ~100k tokens (1 token ≈ 4 chars)
} as const;

// Speaking rate estimation (words per minute)
export const SPEAKING_RATE = {
  WORDS_PER_MINUTE: 150,
} as const;

