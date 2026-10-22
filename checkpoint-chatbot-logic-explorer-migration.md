---
title: Chatbot Logic Explorer own-key migration checkpoint
date: 2026-10-22
status: checked
---

Plan: retain both chat interfaces and existing prompts; keep rules available without credentials; add memory-only Gemini key entry and clearing; initialise SDK lazily with Vertex AI disabled; invalidate in-flight results on key change/reset; bundle Tailwind locally and remove injected environment keys and CDN imports. Verify with synthetic credentials and intercepted requests only, build and typecheck, then commit and push. No deployment or paid calls.

Checks completed on 2026-10-22:

- `npm run typecheck`: passed.
- `npm test`: 3 tests passed. Covers keyless startup, explicit `vertexai: false`, memory key replacement/clearing and abort, redacted results/errors, intercepted synthetic chat request and rejection of an old-key result. ADC path is deliberately nonexistent; no real API calls.
- `npm run build`: passed with no credentials; local CSS and JavaScript emitted. Vite reports the existing SDK-containing chunk above 500 kB.
- T3 collaborative browser at local port 4311: keyless rules replied to “My name is Ada”; Gemini displayed the missing-key instruction; no provider request was made. With a synthetic key and intercepted fetch, Gemini displayed the synthetic reply; no key was in localStorage. Clear key emptied the input and displayed “No key set.”
- `git diff --check`: passed. Runtime source has no injected process API key, AI Studio importmap or Tailwind CDN.

Implementation retains original model, system instruction and rule semantics. Key changes clear both conversations; late chat results are discarded and the rules timer is cancelled on reset. Keys never enter saved result state.

Limitations: real credentials, quota and live provider behaviour deliberately untested; no deployment or DNS change. Tested using installed Node 26.12; documented Node minimum is 22.18. npm audit reported 7 dependency advisories (2 moderate, 5 high); dependency security upgrades were not part of this migration. Browser snapshot timed out once; browser interaction and evaluated assertions succeeded. Independent review remains with parent.

