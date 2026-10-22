import React, { useState } from 'react';
import { getVisitorKey, setVisitorKey } from '../services/visitorKey';

export default function ApiKeySettings({ onChange }: { onChange?: () => void }) {
  const [draft, setDraft] = useState('');
  const [configured, setConfigured] = useState(Boolean(getVisitorKey()));
  const apply = (value: string) => {
    setVisitorKey(value);
    setConfigured(Boolean(value.trim()));
    setDraft('');
    onChange?.();
  };
  return <section aria-label="Gemini API key settings" className="px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 text-sm text-gray-800 dark:text-gray-100">
    <div className="flex flex-wrap items-center justify-center gap-2">
      <label htmlFor="visitor-gemini-key">Your Gemini API key</label>
      <input id="visitor-gemini-key" type="password" autoComplete="off" value={draft} onChange={e => setDraft(e.target.value)} placeholder="Enter your own key" className="border rounded px-2 py-1 bg-white text-gray-900" />
      <button type="button" disabled={!draft.trim()} onClick={() => apply(draft)} className="rounded bg-blue-600 text-white px-3 py-1 disabled:opacity-50">Use key</button>
      <button type="button" onClick={() => apply('')} className="rounded border px-3 py-1">Clear key</button>
      <span role="status">{configured ? 'Key ready for this tab.' : 'No key set.'}</span>
    </div>
    <p className="text-center mt-1">Kept in memory only; reload or clear to remove it. AI sends your content directly to Google and uses your quota.</p>
  </section>;
}
