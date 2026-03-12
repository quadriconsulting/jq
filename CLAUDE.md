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