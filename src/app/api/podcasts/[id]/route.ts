import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { STORAGE_BUCKETS } from '@/lib/utils/constants';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get podcast with transcript
    const { data: podcast, error } = await supabase
      .from('podcasts')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error || !podcast) {
      return NextResponse.json({ error: 'Podcast not found' }, { status: 404 });
    }

    return NextResponse.json(podcast);
  } catch (error) {
    console.error('Error fetching podcast:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get podcast to check ownership and get audio URL
    const { data: podcast, error: fetchError } = await supabase
      .from('podcasts')
      .select('audio_url')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !podcast) {
      return NextResponse.json({ error: 'Podcast not found' }, { status: 404 });
    }

    // Delete audio file from storage if exists
    if (podcast.audio_url) {
      // Extract path from URL
      const urlParts = podcast.audio_url.split('/');
      const fileName = urlParts[urlParts.length - 1].split('?')[0];
      await supabase.storage.from(STORAGE_BUCKETS.PODCASTS).remove([fileName]);
    }

    // Delete podcast record (cascade will handle related records)
    const { error: deleteError } = await supabase
      .from('podcasts')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (deleteError) {
      throw new Error(deleteError.message);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting podcast:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}

