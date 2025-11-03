import type { Document } from './document';

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectWithDocuments extends Project {
  documents: Document[];
}

