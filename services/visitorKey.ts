import { GoogleGenAI } from '@google/genai';

let key = '';
let revision = 0;
let controller = new AbortController();
export class ProviderError extends Error {}
export const getVisitorKey = () => key;
export function setVisitorKey(value: string) {
  controller.abort();
  controller = new AbortController();
  key = value.trim();
  revision++;
}
export function invalidateRequests() {
  controller.abort();
  controller = new AbortController();
  revision++;
}
export function providerSession() {
  if (!key) throw new ProviderError('Enter your Gemini API key to use AI. You can still use the app without AI.');
  if (/\s/.test(key)) throw new ProviderError('The API key contains spaces. Check and enter it again.');
  const sessionKey = key;
  const version = revision;
  const signal = controller.signal;
  const assertCurrent = () => {
    if (version !== revision || signal.aborted) throw new ProviderError('The key changed or the request was cancelled. Try again with your current key.');
  };
  return {
    ai: new GoogleGenAI({ apiKey: sessionKey, vertexai: false }),
    signal, assertCurrent,
    cleanText: (text: string) => text.split(sessionKey).join('[redacted]'),
  };
}
export function safeProviderError(error: unknown): ProviderError {
  if (error instanceof ProviderError) return error;
  const status = typeof error === 'object' && error !== null && 'status' in error ? Number(error.status) : 0;
  if (status === 400 || status === 401 || status === 403) return new ProviderError('Gemini rejected the request or API key. Check your key and its permissions.');
  if (status === 429) return new ProviderError('Gemini quota or rate limit reached. Check your account and try again later.');
  return new ProviderError('Gemini could not complete the request. Check your connection, key and model access, then try again.');
}
