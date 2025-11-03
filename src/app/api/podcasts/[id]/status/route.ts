import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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

    // Get podcast
    const { data: podcast, error } = await supabase
      .from('podcasts')
      .select('id, status, transcript, duration, name, created_at, updated_at')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error || !podcast) {
      return NextResponse.json({ error: 'Podcast not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: podcast.id,
      status: podcast.status,
      hasTranscript: !!podcast.transcript,
      duration: podcast.duration,
      name: podcast.name,
      created_at: podcast.created_at,
      updated_at: podcast.updated_at,
    });
  } catch (error) {
    console.error('Error fetching podcast status:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}

