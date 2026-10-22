import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getVisitorKey, setVisitorKey, providerSession, safeProviderError } from '../services/visitorKey.ts';
process.env.GOOGLE_APPLICATION_CREDENTIALS = '/nonexistent/visitor-key-tests';
test('keyless startup, explicit Developer API, cancellation and redacted output', () => {
  setVisitorKey('');
  assert.equal(getVisitorKey(), '');
  assert.throws(() => providerSession(), /Enter your Gemini API key/);
  setVisitorKey('synthetic-test-key-never-real');
  const session = providerSession();
  assert.equal(session.ai.vertexai, false);
  assert.equal(session.cleanText('echo synthetic-test-key-never-real'), 'echo [redacted]');
  setVisitorKey('synthetic-replacement-key');
  assert.throws(session.assertCurrent, /key changed/);
  assert.equal(session.signal.aborted, true);
  setVisitorKey('');
  assert.throws(() => providerSession(), /Enter your/);
});
test('provider errors never expose raw credential-bearing details', () => {
  for (const status of [400, 401, 403, 429, 500]) {
    const error = safeProviderError({ status, message: 'synthetic-secret', url: '?key=synthetic-secret' });
    assert.equal(error.message.includes('synthetic-secret'), false);
  }
});

test('chat uses only synthetic intercepted requests and discards an old-key result', async () => {
  const { getGeminiResponse, resetGeminiChat } = await import('../services/geminiService.ts');
  const original = globalThis.fetch;
  let requests = 0;
  let release: () => void = () => {};
  globalThis.fetch = async () => {
    requests++;
    await new Promise<void>(resolve => { release = resolve; });
    return new Response(JSON.stringify({ candidates: [{ content: { role: 'model', parts: [{ text: 'old result' }] } }] }), { headers: { 'content-type': 'application/json' } });
  };
  try {
    setVisitorKey('synthetic-chat-test');
    resetGeminiChat();
    const pending = getGeminiResponse('hello');
    while (!requests) await new Promise(resolve => setTimeout(resolve, 1));
    setVisitorKey('');
    release();
    await assert.rejects(pending, /key changed|could not complete/);
    await assert.rejects(getGeminiResponse('another turn'), /Enter your/);
    assert.equal(requests, 1);
  } finally { globalThis.fetch = original; resetGeminiChat(); setVisitorKey(''); }
});
