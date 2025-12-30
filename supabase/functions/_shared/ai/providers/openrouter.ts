/**
 * OpenRouter AI Provider
 * Implementation for OpenRouter API using openai/gpt-oss-20b model.
 */

import type { GenerateTextOptions } from '../aiClient.ts';

const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'openai/gpt-oss-20b';
const TIMEOUT_MS = 90000;
const MAX_RETRIES = 2;
const INITIAL_RETRY_DELAY_MS = 1000;

interface OpenRouterResponse {
  text: string;
  tokensUsed?: number;
}

interface OpenRouterAPIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  usage?: {
    total_tokens: number;
  };
}

/**
 * Sleep for a specified duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate text using OpenRouter API
 * 
 * @param prompt - The prompt to send
 * @param options - Generation options
 * @returns Response with generated text and metadata
 */
export async function generateWithOpenRouter(
  prompt: string,
  options: GenerateTextOptions
): Promise<OpenRouterResponse> {
  const apiKey = Deno.env.get('OPENROUTER_API_KEY');
  
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY not configured');
  }

  const requestBody: Record<string, unknown> = {
    model: MODEL,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: options.temperature ?? 0.2,
  };

  // Add max_tokens if specified
  if (options.maxTokens) {
    requestBody.max_tokens = options.maxTokens;
  }

  // Request JSON response format if specified
  if (options.responseFormat === 'json') {
    requestBody.response_format = { type: 'json_object' };
  }

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

      const response = await fetch(OPENROUTER_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://spiretrack.app',
          'X-Title': 'SpireTrack',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenRouter API error (${response.status}): ${errorText}`);
      }

      const data: OpenRouterAPIResponse = await response.json();

      if (!data.choices?.[0]?.message?.content) {
        throw new Error('Invalid response structure from OpenRouter');
      }

      return {
        text: data.choices[0].message.content,
        tokensUsed: data.usage?.total_tokens,
      };

    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Don't retry on abort (timeout) or final attempt
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('AI request timed out');
      }

      if (attempt < MAX_RETRIES) {
        const delayMs = INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt);
        console.log(`[OpenRouter] Retry ${attempt + 1}/${MAX_RETRIES} after ${delayMs}ms`);
        await sleep(delayMs);
      }
    }
  }

  throw lastError || new Error('AI generation failed after retries');
}
