export type DocumentStatus = 'uploaded' | 'processing' | 'processed' | 'error';

export interface DocumentProjectLink {
  project_id: string;
}

export interface Document {
  id: string;
  user_id: string;
  filename: string;
  original_name: string;
  mime_type: string;
  size: number;
  storage_path: string;
  status: DocumentStatus;
  content: string | null;
  created_at: string;
  updated_at: string;
  project_documents?: DocumentProjectLink[];
}

export interface DocumentUploadResult {
  document: Document;
  storageUrl: string;
}

export interface ParsedDocument {
  text: string;
  metadata?: {
    title?: string;
    author?: string;
    pageCount?: number;
  };
}

