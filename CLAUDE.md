# Project Standards: j.quadri.fit (Application Security Architect)

## 1. Tech Stack & Execution Environment
- **Frontend**: React 19, TypeScript, Tailwind CSS, GSAP (ScrollTrigger + `@gsap/react`), Lucide React. Use GSAP for scroll animations, but Framer Motion is allowed for micro-interactions (like the typewriter cursor)
- **Build Tool**: Vite 6.
- **Backend**: Cloudflare Pages Functions (`/functions/api/chat.js`).
- **AI/RAG**: Cloudflare Workers AI (`@cf/baai/bge-base-en-v1.5`), Cloudflare Vectorize, OpenAI (`gpt-4.1-mini`).
- **Package Manager**: `npm`.
- **Run Dev Server**: `npm run dev:sandbox` (Uses PM2 and Wrangler; DO NOT run standard `vite` dev server).
- **Build Project**: `npm run build`.

## 2. Core Architectural Rules
- **Anonymous UUID Memory (Silent Context)**: Implement `localStorage` logic in `AIConcierge.tsx` to generate and store a persistent UUID. Pass this UUID to `/api/chat.js` via the request body to maintain conversation context across sessions.


## 3. Brand & Design Identity
- **Theme**: High-Contrast Minimalism (Light Mode Default).
- **Vibe**: Architectural, precise, high-trust engineering. Not "hacker" or "start-up".
- **Color Palette**: 
  - Background: Pure White (`#FFFFFF`).
  - Primary Text & Borders: Pure Black (`#000000`).
  - Accents/Secondary Text: Neutral Grey (`#737373` or `#E5E5E5`).
- **Forbidden Styles**: NEVER use colorful gradients, drop shadows, or glowing effects.

## 4. Layout & Spacing Rules
- **Grid System**: Content must be strictly centered or aligned to a mathematical 12-column grid.
- **Whitespace**: Use massive whitespace between sections (e.g., `py-24` or `py-32` in Tailwind) to enforce focus and luxury pacing. 
- **Borders & Shapes**: Use only `1px` solid borders (black or `#E5E5E5`). 
- **Border Radius**: Strictly `0px` (sharp corners only). No rounded buttons or cards.

## 5. Typography Rules
- **Font Families**: Use clean, modern sans-serif fonts. Avoid highly decorative fonts.
- **Styling**: Favor high tracking (letter-spacing) for headers, particularly for the name "JEREMY QUADRI".
- **Hierarchy**: Maintain stark contrast in font sizes (e.g., very large headers, precise and small body text).

## 6. Animation & Motion Rules
- **Easing Curve**: All transitions must use `easeOutExpo`. 
  - CSS: `cubic-bezier(0.19, 1, 0.22, 1)`
  - Framer Motion: `ease: [0.19, 1, 0.22, 1]`
- **Speed**: Animations should be fast and responsive, not floaty or slow.
- **Scroll Effects**: Prefer subtle, staggered fade-ins and slide-ups as the user scrolls.

## 7. Specific Component Implementations
- **AI Chat/Responses**: Must use the `TypewriterResponse` component. The typing effect should feature a subtle geometric scramble (`—_/+X<>[]`) before locking in letters, and use a thin `2px` vertical blinking cursor.
- **Chat Window**: Must be a sharp, 1px-bordered container that slides up from the bottom with `easeOutExpo`. No chat "bubbles"; use a structured, terminal-like log layout but with the light-mode color palette.

## 8. Code Quality
- Write clean, modular, and DRY code.
- Ensure all components are fully responsive.
- Respect `prefers-reduced-motion` for accessibility.

## 9. AI Output & Backend Constraints (chat.js)
- **Brevity & UI Parsing**: The LLM must answer in exactly ONE short sentence (Max 60 words).
- **Button Extraction**: Suggested follow-ups MUST use literal hyphens and a space (`- `) on new lines. Never use unicode dots (`•`) or numbered lists. The frontend regex depends on this exact string to render UI buttons.
- **Language Lock**: The system ALWAYS responds in English only, regardless of the language the user writes in. Do NOT mirror or detect the user's language. The system prompt begins with `LANGUAGE: Respond in English only, regardless of the language the user writes in.`
- **Immutable Links**: When returning assets via JSON actions or text, NEVER hallucinate URLs. Use these exact links:
  - CV/Resume: `https://j.quadri.fit/cv.pdf`
  - Calendar: `https://calendar.app.google/R9rVquWQbqj8D26d6`
  - LinkedIn: `https://linkedin.com/in/jquadri`

## 10. Omnichannel Relay (Bidirectional Telegram Bridge)
The system implements a **pre-AI interceptor** and a **live two-way tunnel** for high-value inquiries.

**Trigger keywords** (regex: `\b(waf|quote|contract|rate|rates|pricing)\b`, case-insensitive).

**Backend behavior** (`functions/api/chat.js` & `sync.js`):
1. Interceptor fires **before** any Vectorize or OpenAI call.
2. Sends a Telegram Bot message to Jeremy and sets KV states: `last_active_session`, `last_active_session_ts`, and `handoff_active`.
3. **Two-Way Bridge:** While the tunnel is open, subsequent user messages bypass the AI and are forwarded directly to Telegram.
4. **Long-Polling Sync:** `sync.js` holds the connection open up to 18s, using `KV.list({ prefix })` to retrieve a reliable queue of timestamped messages (`reply:{sessionId}:{timestamp}`). 

**Frontend behavior** (`src/components/AIConcierge.tsx`):
- The `wait_for_jeremy` action renders a persistent "Jeremy is typing..." indicator.
- **Adaptive Throttling:** Polls `sync.js` every 5s when idle, or every 2s for a 2-minute burst after the user sends a message. Stops polling entirely if the browser tab is hidden.
- **Kill-Switch:** If there is 15 minutes of silence, the frontend sends `&end=1` to clean up KV keys, receives `__RELEASE_AI__`, and cleanly exits live mode back to the AI.

**Required secrets & KV:** - Env vars: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`.
- KV namespace: `CHAT_STATE` (binding in `wrangler.json`).
- Webhook registration: `POST https://api.telegram.org/bot{TOKEN}/setWebhook?url=https://{domain}/api/webhook/telegram`.

## 11 Core Project Guardrails (DO NOT VIOLATE)
1. **UI & Styling:** The `AIConcierge.tsx` component has a highly specific, polished Dark/Cream theme using Tailwind. NEVER alter existing padding, margins, structural classes, or colors unless explicitly instructed.
2. **Omnichannel Relay (Telegram Bridge):** The system relies on precise KV state management (`last_active_session`, `handoff_active`) and long-polling (`sync.js`). NEVER modify the KV polling intervals, WAF/quote interceptor logic, or the 15-minute kill-switch without explicit permission.
3. **JSON Contract Safety:** The AI in `chat.js` MUST return valid JSON. If asking the AI to generate code or Mermaid diagrams, explicitly instruct it to escape newlines (`\n`) and quotes to prevent `JSON.parse()` crashes on the frontend.
4. **Professional Tone & Actions:** The AI is a technical assistant, not a pushy salesperson. It must NEVER trigger `action: "SHOW_CV"` unless the user explicitly asks for a resume or CV.
