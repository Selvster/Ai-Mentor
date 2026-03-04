import { GoogleGenAI } from '@google/genai';
import { env } from '../config/env.js';

let ai: GoogleGenAI | null = null;

function getClient() {
  if (!ai) {
    ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  }
  return ai;
}

export async function generateWithGemini(prompt: string): Promise<string> {
  const response = await getClient().models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });
  return response.text ?? '';
}

/**
 * Generate JSON output with forced JSON mime type + retry on parse failure.
 * Retries once with lower temperature if the first attempt returns invalid JSON.
 */
export async function generateJsonWithGemini<T>(prompt: string): Promise<T> {
  const client = getClient();

  // First attempt: structured JSON output
  const response = await client.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
    },
  });

  const raw = response.text ?? '';

  try {
    return JSON.parse(raw) as T;
  } catch {
    // Retry with lower temperature for more deterministic output
    console.warn('Gemini JSON parse failed, retrying with low temperature...');

    const retryResponse = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt + '\n\nIMPORTANT: Your previous response was not valid JSON. Return ONLY a valid JSON object, no extra text.',
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const retryRaw = retryResponse.text ?? '';
    // Strip markdown fences as last resort
    const cleaned = retryRaw.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    return JSON.parse(cleaned) as T;
  }
}
