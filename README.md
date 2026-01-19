# Chatbot Logic Explorer: Rules vs. LLM

A comparative web application that visualizes the difference between traditional rule-based chatbots (symbolic AI) and modern Large Language Models (Generative AI). Users send a single message and receive simultaneous responses from both systems, complete with a breakdown of the logic or context used to generate the reply.

## 🏗 Architecture

This application is built as a **Single Page Application (SPA)** using React 19. It utilizes a **"No-Build" architecture**, leveraging native ES Modules and Import Maps to load dependencies directly from a CDN (`esm.sh`) without requiring a complex bundler step (like Webpack or Vite) for development.

### Core Technology Stack
*   **Frontend Framework:** React 19
*   **Styling:** Tailwind CSS (loaded via CDN)
*   **AI SDK:** Google GenAI SDK (`@google/genai`)
*   **Language:** TypeScript (Transpiled on-the-fly or pre-transpiled depending on the environment)

### The "Dual-Bot" Pattern

The application follows a dispatcher pattern managed by `App.tsx`.

1.  **State Dispatch:** When a user sends a message, `App.tsx` updates a shared `lastUserMessage` state.
2.  **Parallel Processing:**
    *   **RuleBasedBot:** Listens for state changes. It executes synchronous, deterministic logic (RegEx matching, keyword search) in the browser.
    *   **GeminiBot:** Listens for state changes. It calls `services/geminiService.ts` to communicate asynchronously with the Google Gemini API.
3.  **Explanation Layer:** Both bots return not just the response text, but an `explanation` object.
    *   The **Rule Bot** exposes the exact code snippet or "If/Then" logic that triggered.
    *   The **Gemini Bot** exposes the Context Window (System Instructions + Chat History) sent to the model.

## 📂 Project Structure

```text
/
├── index.html              # Entry point. Defines Import Maps for React & GenAI SDK.
├── index.tsx               # Application root mount.
├── App.tsx                 # Main layout and state orchestrator.
├── metadata.json           # Application metadata and permissions.
├── types.ts                # TypeScript interfaces for Messages and Props.
├── services/
│   └── geminiService.ts    # Google GenAI SDK initialization and API wrapper.
└── components/
    ├── ChatWindow.tsx      # Reusable UI for displaying chat logs.
    ├── ChatMessage.tsx     # Individual message bubble with "Show Logic" toggles.
    ├── RuleBasedBot.tsx    # Implementation of the heuristic/keyword logic.
    ├── GeminiBot.tsx       # Implementation of the LLM integration.
    └── icons.tsx           # SVG Icon assets.
```

## 🚀 Deployment

### Environment Variables
This application requires a valid Google Gemini API Key to function. The application expects the key to be available via:

```typescript
process.env.API_KEY
```

**Security Note:** In a client-side only application, API keys are typically visible in the network tab. For production environments, it is recommended to proxy these requests through a backend server. However, for this educational demo/explorer, the key is injected directly into the client execution context.

### Hosting

Because this project uses native ES modules and CDN imports, it can be hosted on any static hosting provider (Vercel, Netlify, Cloudflare Pages, Firebase Hosting) or a simple HTTP server.

**Requirements:**
1.  **HTTPS:** Required for secure browser features.
2.  **API Key Configuration:** The hosting environment must support injecting the `API_KEY` environment variable into the build or runtime context.

## 🧠 Logic Breakdown

### Rule-Based Logic (`RuleBasedBot.tsx`)
This bot mimics ELIZA-style architectures. It parses the input string for specific tokens:
*   **Name Extraction:** Looks for patterns like "My name is [X]" or "I'm [X]".
*   **Sentiment Analysis:** simple array lookup for words like "happy" (positive) or "terrible" (negative).
*   **Fallback:** If no patterns match, it outputs a default response.

### Generative Logic (`GeminiBot.tsx` & `geminiService.ts`)
This bot uses the **Gemini 2.5 Flash** model.
*   **System Instruction:** Defines the persona ("friendly and empathetic").
*   **Context Management:** `GeminiBot` constructs a history string of previous turns to show the user exactly what the LLM "sees" before generating a response. This demystifies the "black box" nature of LLMs.
