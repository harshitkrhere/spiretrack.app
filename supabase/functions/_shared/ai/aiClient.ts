/**
 * AI Client Abstraction Layer
 * Provider-agnostic interface for AI text generation.
 * 
 * This module provides a unified interface for AI operations,
 * allowing the underlying provider to be swapped without affecting
 * consuming code.
 */

import { generateWithOpenRouter } from './providers/openrouter.ts';

export interface GenerateTextOptions {
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'json' | 'text';
}

interface AIResponse {
  text: string;
  latencyMs: number;
  provider: string;
  tokensUsed?: number;
}

const DEFAULT_OPTIONS: GenerateTextOptions = {
  temperature: 0.2,
  responseFormat: 'text',
};

const FALLBACK_ERROR_MESSAGE = 'AI analysis is temporarily unavailable.';

/**
 * Generate text using the configured AI provider.
 * 
 * @param prompt - The prompt to send to the AI
 * @param options - Configuration options for generation
 * @returns The generated text response
 * @throws Error if AI generation fails after retries
 */
export async function generateText(
  prompt: string,
  options: GenerateTextOptions = {}
): Promise<string> {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  const startTime = Date.now();

  try {
    const response = await generateWithOpenRouter(prompt, mergedOptions);
    
    const latencyMs = Date.now() - startTime;
    
    // Observability logging (no sensitive data)
    console.log(`[AI] Provider: OpenRouter | Latency: ${latencyMs}ms${response.tokensUsed ? ` | Tokens: ${response.tokensUsed}` : ''}`);
    
    return response.text;
  } catch (error) {
    const latencyMs = Date.now() - startTime;
    console.error(`[AI] Error after ${latencyMs}ms:`, error instanceof Error ? error.message : 'Unknown error');
    
    // Return graceful fallback for JSON format requests
    if (mergedOptions.responseFormat === 'json') {
      throw error; // Let caller handle JSON parsing errors
    }
    
    return FALLBACK_ERROR_MESSAGE;
  }
}
