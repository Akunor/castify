import OpenAI from 'openai';
import type { ParsedDocument } from '@/types/document';
import { OPENAI_CONFIG, SPEAKING_RATE } from '@/lib/utils/constants';

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not set in environment variables');
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface PodcastScript {
  transcript: string;
  estimatedDuration?: number; // in seconds
}

export class AIService {
  /**
   * Generate a podcast-style script from document content
   */
  static async generatePodcastScript(
    documents: ParsedDocument[],
    options?: {
      name?: string;
      description?: string;
    }
  ): Promise<PodcastScript> {
    try {
      // Combine all document texts
      const combinedText = documents
        .map((doc) => doc.text)
        .join('\n\n---\n\n')
        .trim();

      // Truncate if too long (OpenAI has token limits)
      // Approximately 1 token = 4 characters, GPT-4 has ~128k context window
      const textToProcess =
        combinedText.length > OPENAI_CONFIG.MAX_INPUT_CHARS
          ? combinedText.substring(0, OPENAI_CONFIG.MAX_INPUT_CHARS) +
            '\n\n[Content truncated due to length]'
          : combinedText;

      const systemPrompt = `You are a talented podcast script writer. Your job is to convert document content into an engaging, conversational podcast script that feels natural and easy to listen to.

Guidelines:
- Create a script suitable for a podcast conversation between two hosts
- Make it engaging, clear, and easy to follow
- Break down complex topics into digestible segments
- Use natural dialogue markers (e.g., "Host 1:", "Host 2:")
- Include transitions and natural flow
- Maintain accuracy to the original content
- Keep a conversational, friendly tone
- Structure the content logically with clear sections
- The script should be ready to be read aloud by text-to-speech

Format the output as a clean transcript with clear speaker labels and natural dialogue.`;

      const userPrompt = `Convert the following document${documents.length > 1 ? 's' : ''} into a podcast script:

${options?.name ? `Title: ${options.name}\n` : ''}${options?.description ? `Context: ${options.description}\n\n` : ''}
${textToProcess}

Please create an engaging podcast script that captures the key points and makes them accessible and interesting for listeners.`;

      const completion = await openai.chat.completions.create({
        model: OPENAI_CONFIG.MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: OPENAI_CONFIG.TEMPERATURE,
        max_tokens: OPENAI_CONFIG.MAX_TOKENS,
      });

      const transcript = completion.choices[0]?.message?.content;

      if (!transcript) {
        throw new Error('No transcript generated from OpenAI');
      }

      // Estimate duration based on speaking rate
      const wordCount = transcript.split(/\s+/).length;
      const estimatedDuration = Math.ceil(
        (wordCount / SPEAKING_RATE.WORDS_PER_MINUTE) * 60
      );

      return {
        transcript,
        estimatedDuration,
      };
    } catch (error) {
      console.error('Error generating podcast script:', error);
      throw new Error(
        `Failed to generate podcast script: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Generate a summary of the document(s) for use in podcast metadata
   */
  static async generateSummary(documents: ParsedDocument[]): Promise<string> {
    try {
      const combinedText = documents
        .map((doc) => doc.text)
        .join('\n\n---\n\n')
        .trim();

      // Smaller limit for summary (100k chars = ~25k tokens)
      const maxSummaryLength = 100000;
      const textToProcess =
        combinedText.length > maxSummaryLength
          ? combinedText.substring(0, maxSummaryLength) + '\n\n[Content truncated]'
          : combinedText;

      const completion = await openai.chat.completions.create({
        model: OPENAI_CONFIG.MODEL,
        messages: [
          {
            role: 'system',
            content:
              'You are a content summarizer. Create concise, informative summaries of documents.',
          },
          {
            role: 'user',
            content: `Please provide a brief summary (2-3 sentences) of the following content:\n\n${textToProcess}`,
          },
        ],
        temperature: 0.5,
        max_tokens: 200,
      });

      return completion.choices[0]?.message?.content || 'No summary available';
    } catch (error) {
      console.error('Error generating summary:', error);
      return 'Summary generation failed';
    }
  }
}

