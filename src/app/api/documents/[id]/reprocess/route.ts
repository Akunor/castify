'use server';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { DocumentProcessorService } from '@/lib/services/documentProcessor';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: document, error: fetchError } = await supabase
      .from('documents')
      .select('id, user_id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const result = await DocumentProcessorService.processDocument(id, user.id);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error ?? 'Failed to reprocess document',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      content: result.content ?? null,
      message: 'Document reprocessing started successfully.',
    });
  } catch (error) {
    console.error('Error reprocessing document:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}

