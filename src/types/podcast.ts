export type PodcastStatus = 'pending' | 'processing' | 'completed' | 'error';

export interface Podcast {
  id: string;
  user_id: string;
  project_id: string | null;
  name: string;
  description: string | null;
  audio_url: string | null;
  duration: number | null;
  transcript: string | null; // Podcast script/transcript ready for TTS
  status: PodcastStatus;
  created_at: string;
  updated_at: string;
}

export interface PodcastStatusResponse {
  id: string;
  status: PodcastStatus;
  hasTranscript: boolean;
  duration: number | null;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface PodcastGenerationRequest {
  documentIds?: string[];
  projectId?: string;
  name?: string;
  description?: string;
}

