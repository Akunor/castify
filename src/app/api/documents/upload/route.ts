import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { FileParserService } from '@/lib/services/fileParser';
import { DocumentProcessorService } from '@/lib/services/documentProcessor';
import { MAX_FILE_SIZE, STORAGE_BUCKETS } from '@/lib/utils/constants';
import type { DocumentUploadResult } from '@/types/document';

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

    // Ensure user session is properly set for storage operations
    // The session should be available from the authenticated client

    // Get form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!FileParserService.isSupportedFileType(file.type)) {
      return NextResponse.json(
        { error: `Unsupported file type: ${file.type}` },
        { status: 400 }
      );
    }

    // Validate file size
    if (!FileParserService.validateFileSize(file.size, MAX_FILE_SIZE)) {
      return NextResponse.json(
        { error: `File size exceeds maximum of ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop();
    const filename = `${user.id}/${timestamp}-${randomString}.${fileExtension}`;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKETS.DOCUMENTS)
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return NextResponse.json(
        { error: `Failed to upload file: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Get public URL (optional, for preview)
    const {
      data: { publicUrl },
    } = supabase.storage.from(STORAGE_BUCKETS.DOCUMENTS).getPublicUrl(filename);

    // Create document record in database
    const { data: document, error: dbError } = await supabase
      .from('documents')
      .insert({
        user_id: user.id,
        filename,
        original_name: file.name,
        mime_type: file.type,
        size: file.size,
        storage_path: uploadData.path,
        status: 'uploaded',
      })
      .select()
      .single();

    if (dbError || !document) {
      // Clean up uploaded file if DB insert fails
      await supabase.storage.from(STORAGE_BUCKETS.DOCUMENTS).remove([filename]);

      return NextResponse.json(
        { error: `Failed to create document record: ${dbError?.message || 'Unknown error'}` },
        { status: 500 }
      );
    }

    // Process document asynchronously (parse content)
    // Don't await - let it process in background
    DocumentProcessorService.processDocument(document.id, user.id).catch((error) => {
      console.error('Background document processing failed:', error);
    });

    const result: DocumentUploadResult = {
      document,
      storageUrl: publicUrl,
    };

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}

