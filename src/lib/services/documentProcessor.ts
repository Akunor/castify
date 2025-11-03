import { createClient } from '@/lib/supabase/server';
import { FileParserService } from './fileParser';
import { STORAGE_BUCKETS } from '@/lib/utils/constants';
import type { Document, DocumentUploadResult } from '@/types/document';
import type { ParsedDocument } from '@/types/document';

export class DocumentProcessorService {
  /**
   * Process an uploaded file: parse content and update document record
   */
  static async processDocument(
    documentId: string,
    userId: string
  ): Promise<{ success: boolean; content?: string; error?: string }> {
    const supabase = await createClient();

    try {
      // Get document record
      const { data: document, error: docError } = await supabase
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .eq('user_id', userId)
        .single();

      if (docError || !document) {
        throw new Error(`Document not found: ${docError?.message || 'Unknown error'}`);
      }

      // Update status to processing
      await supabase
        .from('documents')
        .update({ status: 'processing', updated_at: new Date().toISOString() })
        .eq('id', documentId);

      // Download file from Supabase Storage
      const { data: fileData, error: downloadError } = await supabase.storage
        .from(STORAGE_BUCKETS.DOCUMENTS)
        .download(document.storage_path);

      if (downloadError || !fileData) {
        throw new Error(`Failed to download file: ${downloadError?.message || 'Unknown error'}`);
      }

      // Convert blob to buffer
      const arrayBuffer = await fileData.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Parse file content
      const parsed = await FileParserService.parseFile(
        buffer,
        document.mime_type,
        document.filename
      );

      // Update document with parsed content
      const { error: updateError } = await supabase
        .from('documents')
        .update({
          content: parsed.text,
          status: 'processed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', documentId);

      if (updateError) {
        throw new Error(`Failed to update document: ${updateError.message}`);
      }

      return {
        success: true,
        content: parsed.text,
      };
    } catch (error) {
      console.error('Error processing document:', error);

      // Update document status to error
      const supabase = await createClient();
      await supabase
        .from('documents')
        .update({
          status: 'error',
          updated_at: new Date().toISOString(),
        })
        .eq('id', documentId);

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Get parsed content for multiple documents
   */
  static async getDocumentsContent(
    documentIds: string[],
    userId: string
  ): Promise<ParsedDocument[]> {
    const supabase = await createClient();

    const { data: documents, error } = await supabase
      .from('documents')
      .select('*')
      .in('id', documentIds)
      .eq('user_id', userId)
      .eq('status', 'processed');

    if (error) {
      throw new Error(`Failed to fetch documents: ${error.message}`);
    }

    if (!documents || documents.length === 0) {
      throw new Error('No processed documents found');
    }

    // Return parsed documents
    return documents.map((doc) => ({
      text: doc.content || '',
      metadata: {
        title: doc.original_name,
      },
    }));
  }
}

