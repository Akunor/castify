import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { Document } from '@/types/document';

export async function GET(request: NextRequest) {
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

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const projectId = searchParams.get('project_id');

    let query = supabase
      .from('documents')
      .select('*, project_documents(project_id)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    // Filter by status if provided
    if (status) {
      query = query.eq('status', status);
    }

    // If project_id is provided, get documents for that project
    if (projectId) {
      const { data: projectDocuments } = await supabase
        .from('project_documents')
        .select('document_id')
        .eq('project_id', projectId);

      if (projectDocuments && projectDocuments.length > 0) {
        const documentIds = projectDocuments.map((pd) => pd.document_id);
        query = query.in('id', documentIds);
      } else {
        // No documents in project, return empty array
        return NextResponse.json([]);
      }
    }

    const { data: documents, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json(documents || []);
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}

