---
title: chatbot-logic-explorer Pages preview deployment
date: 2026-11-19
register: FOR AGENTS
---

# Pages preview deployment

Cloudflare Pages project: `chatbot-logic-explorer`. Preview: https://chatbot-logic-explorer.pages.dev/ .
Production canonical and citation URL: https://chatbotlogicexplorer.edutools.fyi/ .
This phase attaches no custom domains and changes no DNS or Cloud Run services.

From a clean checkout with no build secrets:

```sh
npm ci
npm run build
env -u CLOUDFLARE_API_TOKEN CLOUDFLARE_ACCOUNT_ID=b6ae5bced06492ee6f0c8f92776804da npx wrangler@4 pages deploy dist --project-name chatbot-logic-explorer --branch main
```

When creating a missing project with Wrangler 4.165, use `pages project create <name> --production-branch main --force` to target the original Pages API. Once the project exists, omit `--force` from deploy commands. The project's pages.dev address is for review only; production switching requires separate approval.

AI uses a visitor-provided key in the existing rebuild; no application key is shipped.
