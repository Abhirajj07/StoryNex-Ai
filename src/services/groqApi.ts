// ============================================================
// Groq API Wrapper — Isolated provider layer
// Swap this file to change LLM providers without touching the rest.
// ============================================================

import type { LLMSettings } from '../types/comic';

interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GroqResponse {
  choices: { message: { content: string } }[];
}

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export async function callGroq(
  messages: GroqMessage[],
  settings: LLMSettings
): Promise<string> {
  if (!settings.apiKey) {
    throw new Error('No API key configured. Please set your Groq API key in Settings.');
  }

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${settings.apiKey}`,
    },
    body: JSON.stringify({
      model: settings.model,
      messages,
      temperature: settings.temperature,
      max_tokens: settings.maxTokens,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Groq API error (${response.status}): ${errorBody}`);
  }

  const data: GroqResponse = await response.json();
  return data.choices[0]?.message?.content ?? '';
}

export async function testGroqConnection(settings: LLMSettings): Promise<boolean> {
  try {
    const result = await callGroq(
      [
        { role: 'system', content: 'You are a test assistant. Respond with JSON: {"status":"ok"}' },
        { role: 'user', content: 'Ping' },
      ],
      { ...settings, maxTokens: 20 }
    );
    const parsed = JSON.parse(result);
    return parsed.status === 'ok';
  } catch {
    return false;
  }
}

export const GROQ_MODELS = [
  { value: 'llama-3.3-70b-versatile', label: 'Llama 3.3 70B (Versatile)' },
  { value: 'llama-3.1-70b-versatile', label: 'Llama 3.1 70B (Versatile)' },
  { value: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B (Instant)' },
  { value: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B (32K)' },
  { value: 'gemma2-9b-it', label: 'Gemma 2 9B IT' },
];
