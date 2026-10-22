# Chatbot Logic Explorer: Rules vs. LLM

A comparative web application that visualizes the difference between traditional rule-based chatbots (symbolic AI) and modern Large Language Models (Generative AI). Users send a single message and receive simultaneous responses from both systems, complete with a breakdown of the logic or context used to generate the reply.

## 🏗 Architecture

This application is built as a **Single Page Application (SPA)** using React 19. Vite bundles React, the Gemini SDK and Tailwind CSS locally into a static production build. It needs no Google Cloud hosting or AI Studio proxy.

### Core Technology Stack
*   **Frontend Framework:** React 19
*   **Styling:** Tailwind CSS (bundled locally)
*   **AI SDK:** Google GenAI SDK (`@google/genai`)
*   **Language:** TypeScript (compiled by Vite)

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
├── index.html              # Vite entry point.
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

### Run and build

Use Node 22.18 or newer and npm. Run `npm ci`, `npm run dev`, `npm run typecheck`, `npm test`, and `npm run build`. The production output is `dist/` and can be served by any static host, including Cloudflare Pages (build: `npm run build`, output: `dist`). No deployment is performed by this repository.

### Visitor key

The rules-based bot works without a key. To use Gemini, enter your own Gemini API key in the app and choose **Use key**. The key stays in memory for this tab; it is never saved to browser storage, exported or injected by the build. **Clear key** or a reload removes it. Changing or clearing the key also resets the conversation and cancels pending results. A request already sent to Google cannot be recalled.

Requests go directly to the Gemini Developer API using the visitor's quota. Missing keys, rejected requests and quota errors appear in the conversation without raw provider details. Do not configure owner API keys as build variables.

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
