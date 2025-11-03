import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
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

    // Verify project ownership
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (projectError || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const body = await request.json();
    const { documentIds } = body;

    if (!Array.isArray(documentIds) || documentIds.length === 0) {
      return NextResponse.json(
        { error: 'documentIds array is required' },
        { status: 400 }
      );
    }

    // Verify all documents belong to user
    const { data: documents, error: docsError } = await supabase
      .from('documents')
      .select('id')
      .in('id', documentIds)
      .eq('user_id', user.id);

    if (docsError || !documents || documents.length !== documentIds.length) {
      return NextResponse.json(
        { error: 'One or more documents not found or access denied' },
        { status: 403 }
      );
    }

    // Remove existing associations for this project
    await supabase.from('project_documents').delete().eq('project_id', id);

    // Create new associations
    const projectDocuments = documentIds.map((docId: string) => ({
      project_id: id,
      document_id: docId,
    }));

    const { error: insertError } = await supabase
      .from('project_documents')
      .insert(projectDocuments);

    if (insertError) {
      throw new Error(insertError.message);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating project documents:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}

