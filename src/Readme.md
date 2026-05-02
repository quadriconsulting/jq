# 🛡️ AppSec AI Concierge & Omnichannel Relay

A highly optimized, edge-compute AI assistant built for an AppSec consulting portfolio. It serves as a Level 1 security analyst and automated lead-capture gateway, featuring Retrieval-Augmented Generation (RAG), dynamic Mermaid architecture diagrams, and a real-time bidirectional Telegram bridge.



## 🚀 Core Features

* **Omnichannel Relay (Live Handoff):** Detects high-value inquiries (e.g., `WAF`, `Audit`, `Pricing`) and intercepts the AI response. It alerts the site owner via Telegram and opens a real-time, bidirectional chat tunnel between the visitor and the Telegram app.
* **Edge-Optimized Polling:** Implements adaptive throttling (2s burst / 5s idle) and tab-visibility checks on the frontend, combined with server-side long-polling (`sync.js`) to stay within Cloudflare's Free Tier limits while providing instant message delivery.
* **Mermaid Architecture Rendering:** Automatically generates technical architecture and workflow diagrams (e.g., Zero Trust flows, CI/CD pipelines) using an injected React component with high-contrast, professional styling.
* **Strict Professional Guardrails:** Prompt engineering ensures the assistant maintains a concise, 60-word limit, avoids aggressive sales tactics (no unprompted CV links), and strictly anchors answers to retrieved context.

## 🏗️ Technology Stack

* **Frontend:** React, Tailwind CSS (`AIConcierge.tsx`), Mermaid.js
* **Backend:** Cloudflare Pages / Workers (`functions/api/chat.js`, `sync.js`, `webhook/telegram.js`)
* **AI Models:** * Embeddings: Cloudflare Workers AI (`@cf/baai/bge-base-en-v1.5`)
    * Generation: OpenAI API
* **Database / State:** Cloudflare KV (`CHAT_STATE`), Cloudflare Vectorize (`VEC_INDEX`)

## 🗄️ KV State Management (`CHAT_STATE`)

To prevent dropped messages and manage the live tunnel, the system uses a heavily optimized KV schema:

* `last_active_session`: The UUID of the current user in a live Telegram tunnel.
* `handoff_active`: A temporary 15-minute TTL key that flags a session as "waiting for Jeremy."
* `last_active_session_ts`: Timestamp used to track idle time for the Kill-Switch.
* `reply:{sessionId}:{timestamp}`: A reliable, prefix-based message queue for Jeremy's Telegram replies. Ensures rapid-fire messages aren't overwritten.

## 🛡️ Kill-Switch & Cleanup

If the chat is idle for 15 minutes during a live session, the frontend automatically sends an `&end=1` command. This clears the KV keys, releases the Telegram tunnel, and returns the chat cleanly to AI control (`__RELEASE_AI__`), preventing ghost sessions from accumulating in KV.

## 🛠️ Environment Setup & Secrets

The following variables must be bound to the Cloudflare Pages environment (both Preview and Production):

```bash
# Telegram Setup
TELEGRAM_BOT_TOKEN="your_bot_token"
TELEGRAM_CHAT_ID="your_chat_id"

# AI Setup
OPENAI_API_KEY="your_openai_key"

# Bindings (wrangler.json)
# - KV Namespace: CHAT_STATE
# - Vectorize: VEC_INDEX
# - AI: @cf/baai/bge-base-en-v1.5