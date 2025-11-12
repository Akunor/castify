import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { DocumentProcessorService } from '@/lib/services/documentProcessor';
import { AIService } from '@/lib/services/aiService';
import { STORAGE_BUCKETS } from '@/lib/utils/constants';
import type { PodcastGenerationRequest } from '@/types/podcast';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: PodcastGenerationRequest = await request.json();
    const { documentIds, projectId, name, description } = body;

    // Validate input
    if (!documentIds && !projectId) {
      return NextResponse.json(
        { error: 'Either documentIds or projectId must be provided' },
        { status: 400 }
      );
    }

    let targetDocumentIds: string[] = [];

    // Get document IDs from project if projectId provided
    if (projectId) {
      // Verify project belongs to user
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('id')
        .eq('id', projectId)
        .eq('user_id', user.id)
        .single();

      if (projectError || !project) {
        return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      }

      // Get documents from project
      const { data: projectDocuments, error: pdError } = await supabase
        .from('project_documents')
        .select('document_id')
        .eq('project_id', projectId);

      if (pdError) {
        throw new Error(`Failed to fetch project documents: ${pdError.message}`);
      }

      targetDocumentIds = projectDocuments?.map((pd) => pd.document_id) || [];
    } else {
      targetDocumentIds = documentIds || [];
    }

    if (targetDocumentIds.length === 0) {
      return NextResponse.json(
        { error: 'No documents found to generate podcast from' },
        { status: 400 }
      );
    }

    // Create podcast record with pending status
    const podcastName = name || `Podcast ${new Date().toLocaleDateString()}`;
    const { data: podcast, error: podcastError } = await supabase
      .from('podcasts')
      .insert({
        user_id: user.id,
        project_id: projectId || null,
        name: podcastName,
        description: description || null,
        status: 'processing',
      })
      .select()
      .single();

    if (podcastError || !podcast) {
      return NextResponse.json(
        { error: `Failed to create podcast: ${podcastError?.message || 'Unknown error'}` },
        { status: 500 }
      );
    }

    // Link documents to podcast
    if (targetDocumentIds.length > 0) {
      const podcastDocuments = targetDocumentIds.map((docId) => ({
        podcast_id: podcast.id,
        document_id: docId,
      }));

      const { error: linkError } = await supabase
        .from('podcast_documents')
        .insert(podcastDocuments);

      if (linkError) {
        console.error('Error linking documents to podcast:', linkError);
        // Continue anyway - we can still generate the podcast
      }
    }

    // Process documents and generate podcast script asynchronously
    // Don't await - let it process in background
    processPodcastGeneration(podcast.id, targetDocumentIds, user.id, {
      name: podcastName,
      description: description || undefined,
    }).catch(async (error) => {
      console.error('Background podcast generation failed:', error);
      if (!(error as { cleanedUp?: boolean })?.cleanedUp) {
        try {
          await cleanupFailedPodcast(podcast.id);
        } catch (cleanupError) {
          console.error(
            `Failed to clean up podcast ${podcast.id} after generation error:`,
            cleanupError
          );
        }
      }
    });

    return NextResponse.json(
      {
        podcast,
        message: 'Podcast generation started. Check status endpoint for updates.',
      },
      { status: 202 }
    );
  } catch (error) {
    console.error('Error generating podcast:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}

/**
 * Background process to generate podcast script
 */
async function processPodcastGeneration(
  podcastId: string,
  documentIds: string[],
  userId: string,
  options?: { name?: string; description?: string }
) {
  const supabase = await createClient();

  try {
    // Get parsed document content
    const parsedDocuments = await DocumentProcessorService.getDocumentsContent(
      documentIds,
      userId
    );

    // Generate podcast script using LLM
    const script = await AIService.generatePodcastScript(parsedDocuments, options);

    const { error: updateError } = await supabase
      .from('podcasts')
      .update({
        transcript: script.transcript,
        duration: script.estimatedDuration || null,
        status: 'completed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', podcastId);

    if (updateError) {
      throw new Error(`Failed to update podcast: ${updateError.message}`);
    }

    console.log(`Podcast ${podcastId} generated successfully`);
  } catch (error) {
    console.error(`Error processing podcast ${podcastId}:`, error);

    try {
      await cleanupFailedPodcast(podcastId);
    } catch (cleanupError) {
      console.error(
        `Failed to clean up podcast ${podcastId} after processing error:`,
        cleanupError
      );
    }

    const failure =
      error instanceof Error ? error : new Error('Unknown podcast generation error');
    (failure as { cleanedUp?: boolean }).cleanedUp = true;
    throw failure;
  }
}

async function cleanupFailedPodcast(podcastId: string) {
  const supabase = await createClient();

  try {
    const { data: podcast } = await supabase
      .from('podcasts')
      .select('audio_url')
      .eq('id', podcastId)
      .single();

    if (podcast?.audio_url) {
      const urlParts = podcast.audio_url.split('/');
      const fileName = urlParts[urlParts.length - 1]?.split('?')[0];
      if (fileName) {
        await supabase.storage.from(STORAGE_BUCKETS.PODCASTS).remove([fileName]);
      }
    }
  } catch (error) {
    console.error(`Error fetching audio URL for cleanup of podcast ${podcastId}:`, error);
  }

  try {
    await supabase.from('podcast_documents').delete().eq('podcast_id', podcastId);
  } catch (error) {
    console.error(`Error deleting podcast_documents for ${podcastId}:`, error);
  }

  try {
    await supabase.from('podcasts').delete().eq('id', podcastId);
  } catch (error) {
    console.error(`Error deleting podcast ${podcastId}:`, error);
  }
}

