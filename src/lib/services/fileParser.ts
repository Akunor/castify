import mammoth from 'mammoth';
import type { ParsedDocument } from '@/types/document';
import { ALLOWED_MIME_TYPES } from '@/lib/utils/constants';

export class FileParserService {
  /**
   * Parse a file buffer and extract text content
   */
  static async parseFile(
    buffer: Buffer,
    mimeType: string,
    filename: string
  ): Promise<ParsedDocument> {
    try {
      switch (mimeType) {
        case 'application/pdf':
          return await this.parsePDF(buffer);

        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        case 'application/msword':
          return await this.parseDocx(buffer);

        case 'text/plain':
        case 'text/markdown':
          return await this.parseText(buffer);

        default:
          throw new Error(`Unsupported file type: ${mimeType}`);
      }
    } catch (error) {
      console.error('Error parsing file:', error);
      throw new Error(
        `Failed to parse file ${filename}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Parse PDF file
   */
  private static async parsePDF(buffer: Buffer): Promise<ParsedDocument> {
    // pdf-parse v2+ uses ESM exports, but the main export is the function itself
    // Use dynamic import and access the function correctly
    // The module exports the parse function as the default export in CommonJS wrapper
    const pdfParseModule = await import('pdf-parse');
    
    // Handle different export patterns:
    // 1. Direct function export
    // 2. Module with default property
    // 3. Module.exports pattern
    let pdfParse: any;
    
    if (typeof pdfParseModule === 'function') {
      pdfParse = pdfParseModule;
    } else {
      // Try accessing as CommonJS module.exports or ESM default
      pdfParse = (pdfParseModule as any).default || 
                 (pdfParseModule as any).pdfParse ||
                 pdfParseModule;
    }
    
    // If still not a function, the module might export differently
    // Access the parse function directly from the module object
    if (typeof pdfParse !== 'function') {
      // Try accessing any function property on the module
      const moduleKeys = Object.keys(pdfParseModule as any);
      const parseFn = moduleKeys.find(key => 
        typeof (pdfParseModule as any)[key] === 'function'
      );
      if (parseFn) {
        pdfParse = (pdfParseModule as any)[parseFn];
      } else {
        // Last resort: the module itself should be callable
        pdfParse = pdfParseModule;
      }
    }
    
    const data = await pdfParse(buffer);

    return {
      text: data.text,
      metadata: {
        title: data.info?.Title || undefined,
        author: data.info?.Author || undefined,
        pageCount: data.numpages,
      },
    };
  }

  /**
   * Parse DOCX file
   */
  private static async parseDocx(buffer: Buffer): Promise<ParsedDocument> {
    const result = await mammoth.extractRawText({ buffer });

    return {
      text: result.value,
      metadata: {
        // DOCX metadata extraction is limited with mammoth
        // Could use another library for more metadata if needed
      },
    };
  }

  /**
   * Parse plain text or markdown file
   */
  private static async parseText(buffer: Buffer): Promise<ParsedDocument> {
    const text = buffer.toString('utf-8');

    return {
      text,
    };
  }

  /**
   * Validate file type
   */
  static isSupportedFileType(mimeType: string): boolean {
    return (ALLOWED_MIME_TYPES as readonly string[]).includes(mimeType);
  }

  /**
   * Validate file size
   */
  static validateFileSize(size: number, maxSize: number = 10 * 1024 * 1024): boolean {
    return size <= maxSize;
  }
}

