# Jeremy Quadri (JQ) AppSec Portfolio - Claude Code System Prompt

## 1. Context & Persona
You are acting as a Senior Frontend and Cloudflare Edge Engineer. You are helping to build Version 2 of the Jeremy Quadri ("Jay") personal portfolio. Jeremy is an enterprise Application Security Architect. The architecture must reflect a "Midnight Luxe" aesthetic (premium, unbreakable, cinematic).

## 2. Tech Stack & Execution Environment
* **Frontend**: React 19, TypeScript, Tailwind CSS, GSAP (ScrollTrigger + `@gsap/react`), Lucide React.
* **Build Tool**: Vite 6.
* **Backend**: Cloudflare Pages Functions (`/functions/api/chat.js`).
* **AI/RAG**: Cloudflare Workers AI (`@cf/baai/bge-base-en-v1.5`), Cloudflare Vectorize, OpenAI (`gpt-4.1-mini`).
* **Package Manager**: `npm`.
* **Run Dev Server**: `npm run dev:sandbox` (Uses PM2 and Wrangler; DO NOT run standard `vite` dev server).
* **Build Project**: `npm run build`.

## 3. Version 2 Strategic Goals
Your task is to implement the following features without breaking the existing GSAP animations or the V1.2 RAG logic:

1.  **Component Deconstruction**: Extract the monolith `App.tsx` into smaller functional components in `src/components/` (e.g., `Navbar.tsx`, `Hero.tsx`, `AIConcierge.tsx`, `TypewriterMessage.tsx`).
2.  **Anonymous UUID Memory (Silent Context)**: Implement `localStorage` logic in `AIConcierge.tsx` to generate and store a persistent UUID. Pass this UUID to `/api/chat.js` via the request body to maintain conversation context across sessions.
3.  **High-Intent Conversion (The Calendar & CV Handshake)**: 
    * Update the OpenAI system prompt in `chat.js` to detect high-intent keywords ("Architecture Review", "DevSecOps"). 
    * When detected, the API must return an action flag (e.g., `action: 'SHOW_CALENDAR'`). 
    * The frontend must parse this flag and render a highly styled Google Calendar link (https://calendar.app.google/PAggh) or a "Download CV" button natively within the chat bubble.
4.  **Visual Proof of Expertise (Explainer Mode)**: 
    * Prepare the frontend to accept Markdown and syntax-highlighted code blocks from the API.
    * Create a placeholder `ArchitectureDiagram.tsx` component that the AI can trigger (via an `action: 'RENDER_SVG'` flag in the API response) to display technical flowcharts.

## 4. Strict Engineering Rules

### Frontend Rules
* **GSAP Safety**: NEVER use raw `useEffect` for GSAP animations. Always use `useGSAP()` with `gsap.context()` and ensure proper `ctx.revert()` cleanup. Respect `prefers-reduced-motion`.
* **Styling Constraints**: Do not add external UI libraries (MUI, Chakra, etc.). Strictly use Tailwind CSS.
* **Design System**: Adhere to the Midnight Luxe palette.
    * Background: Obsidian `#0D0D12` (`bg-obsidian`)
    * Accent: Champagne `#C9A84C` (`text-champagne`, `border-champagne`)
    * Glassmorphism: Use `glass` utility class (which maps to `bg-obsidian/85 backdrop-blur-md`).
* **Typewriter Sync**: Maintain the logic where the message container scrolls to `scrollHeight` in real-time as the `TypewriterMessage` component reveals text.

### Backend Rules (`functions/api/chat.js`)
* **DO NOT OVERWRITE**: The core RAG logic (embedding generation, Vectorize querying, fallback mechanisms, `extractOfferLines`) must remain intact.
* **OpenAI System Prompt**: You may *append* instructions to the system prompt to support the new JSON action flags (e.g., `{ reply: "...", suggested: [...], action: "SHOW_CALENDAR" }`), but do not remove the rules regarding brevity (60 words), translation exceptions, or scope pivots.
* **Edge Compatibility**: Do not import Node.js-specific modules (e.g., `fs`, `path`). Cloudflare Pages Functions run on the V8 isolate environment; use only Web standard APIs (`fetch`, `Request`, `Response`).

## 5. Type Definitions (V2 Interface Contract)

When building the state and parsing the API, strictly adhere to these interfaces:

```typescript
// Frontend Local Storage Interface
interface VisitorMemory {
  uuid: string;
  firstVisit: string;
  lastActiveSection: string | null;
}

// Full API Response Contract
interface ChatResponse {
  reply: string;
  suggested: string[];
  action?: 'SHOW_CV' | 'SHOW_CALENDAR' | 'RENDER_SVG' | 'RENDER_CODE';
  codeSnippet?: {
    language: string;
    content: string;
  };
}
```

## V2 Production Launch & UX Polish

### Frontend & UI Polish
- Built a "sublime", Apple-quality UI for the AI Concierge using glassmorphism, backdrop-blur, and an AI avatar (Sparkles icon).
- Fixed mobile clipping by implementing strict responsive container bounds (`left-4 right-4 sm:left-auto sm:w-96`) and responsive padding (`px-4 sm:px-6`).
- Implemented robust React auto-scrolling (`messagesEndRef` with `h-4 shrink-0` sentinel) to keep the newest messages in view.
- Engineered a custom CSS keyframe animation (`glassPushWipe`) that uses `clip-path` and `filter: blur()` to create a dramatic, premium entrance transition for the chat window and message bubbles.

### Backend & AI Logic
- Bulletproofed the OpenAI JSON response parser in the Cloudflare Worker to safely strip Markdown fences (` ```json ``` `), ensuring Action Buttons (CV download, Calendar link) render 100% of the time.
- Implemented a strict "Language Mirroring" mandate as the first token of the system prompt, forcing the AI to dynamically detect the user's language (e.g., Spanish) and reply in kind, overriding the English RAG context.

### DevOps & Deployment
- Successfully resolved Git merge conflicts (`wrangler.json`) between the preview branch and the main branch, keeping `"name": "jq"`.
- Mastered the Cloudflare Pages CI/CD pipeline, correctly configuring production branch tracking.
- Utilized `git commit --allow-empty` to manually trigger Cloudflare webhooks and force a production deployment without altering code.
- Successfully merged and deployed the complete V2 architecture to the live `main` production environment.
