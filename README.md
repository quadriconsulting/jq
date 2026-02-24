# Jeremy Quadri — Application Security Architect

> Cinematic portfolio site showcasing vulnerability intelligence architecture, AI-augmented security workflows, and enterprise-scale secure system design.

## 🎯 Project Overview

**Brand**: Jeremy Quadri  
**Position**: Application Security Architect & AI-Driven Risk Systems Builder  
**Aesthetic**: Midnight Luxe (Obsidian #0D0D12 / Champagne #C9A84C)  
**Tech Stack**: Hono + React + GSAP + Tailwind CSS + Cloudflare Pages

## ✨ Features

### Currently Implemented
- **Cinematic Hero Section**: Full-bleed background with GSAP-animated typography
- **Core Capabilities Showcase**: Three feature cards highlighting key value propositions
- **Philosophy Statement**: Parallax section with risk-intelligent positioning
- **Engagement Protocol**: Pinned stacking cards showing 3-step methodology
- **CTA Section**: Direct contact invitation with email link
- **AI Concierge**: Floating chat interface with OpenAI GPT-4o-mini integration
- **Responsive Design**: Mobile-first with glassmorphic UI elements
- **Global Noise Texture**: SVG filter overlay for visual depth

### Key Value Propositions
1. **Vulnerability Intelligence Architecture** — End-to-end NVD → EPSS → KEV → Risk scoring
2. **AI-Augmented Security Workflows** — Intelligent automation for threat detection
3. **Enterprise-Scale Secure Systems** — Cloudflare, k3s, PKI, Zero Trust, SAST/DAST

## 🌐 URLs

### Local Development
- Development Server: `http://localhost:3000`
- API Endpoint: `http://localhost:3000/api/chat`

### Production (After Deployment)
- **Cloudflare Pages**: `https://webapp.pages.dev`
- **GitHub Pages**: `https://[username].github.io/webapp`

## 🏗️ Architecture

### Frontend
- **Framework**: React 19 with TypeScript
- **Animations**: GSAP with ScrollTrigger for cinematic scroll effects
- **Styling**: Tailwind CSS with custom Midnight Luxe theme
- **Icons**: Lucide React
- **Fonts**: Inter (sans-serif) + Playfair Display (serif)

### Backend
- **Runtime**: Cloudflare Pages Functions (Workers)
- **API**: `/api/chat` endpoint for AI concierge
- **AI Model**: OpenAI GPT-4o-mini
- **Security**: Content guardrails, fallback responses, defensive parsing

### Data Storage
- No persistent storage required (stateless API calls)
- Environment variables for API keys

## 🚀 Development Workflow

### Prerequisites
```bash
npm install
```

### Local Development
```bash
# Build the project first
npm run build

# Start development server with PM2
fuser -k 3000/tcp 2>/dev/null || true
pm2 start ecosystem.config.cjs

# Test the service
curl http://localhost:3000
```

### Environment Variables
Create `.dev.vars` for local development:
```
OPENAI_API_KEY=your_openai_api_key_here
```

**IMPORTANT**: Never commit `.dev.vars` to git (already in `.gitignore`)

## 📦 Deployment

### Cloudflare Pages

1. **Setup API Key**:
   ```bash
   # Set OPENAI_API_KEY in Cloudflare Dashboard
   npx wrangler pages secret put OPENAI_API_KEY --project-name webapp
   ```

2. **Deploy**:
   ```bash
   npm run deploy:prod
   ```

3. **Production URL**: Access via Cloudflare-provided URL

### GitHub Pages

1. **Enable GitHub Pages** in repository settings (Source: GitHub Actions)
2. **Push to main branch** — workflow deploys automatically
3. **Note**: AI Concierge will be offline (no Cloudflare Functions runtime)

## 🔧 Configuration Files

- `vite.config.ts` — Build configuration with `base: './'`
- `tailwind.config.js` — Custom Midnight Luxe color scheme
- `wrangler.jsonc` — Cloudflare Pages configuration
- `ecosystem.config.cjs` — PM2 process management
- `.github/workflows/deploy.yml` — GitHub Pages automation
- `functions/_middleware.js` — SPA fallback routing
- `public/404.html` — GitHub Pages SPA support

## 🎨 Design System

### Colors (Midnight Luxe)
- **Obsidian**: `#0D0D12` — Primary background
- **Champagne**: `#C9A84C` — Accent color
- **Obsidian Light**: `#1A1A24` — Secondary background

### Typography
- **Headings**: Playfair Display (serif)
- **Body**: Inter (sans-serif)

### Micro-Interactions
- Magnetic buttons with `scale(1.03)` hover
- Glassmorphic panels with `backdrop-blur-xl`
- Smooth scroll animations via GSAP ScrollTrigger

## 📊 Component Structure

```
App
├── Navbar (fixed, morphs on scroll)
├── Hero (100dvh, GSAP text animations)
├── Features (3 cards, staggered reveal)
├── Philosophy (parallax background)
├── Protocol (pinned stacking cards)
├── CTA (email contact)
├── Footer (rounded top, deep dark)
└── AIConcierge (floating chat panel)
```

## 🛡️ Security Features

- **API Key Protection**: Environment variables only
- **Content Guardrails**: Filters AI responses for forbidden patterns
- **Graceful Degradation**: Offline mode if API fails
- **CORS**: Proper headers for API routes
- **Input Validation**: Defensive parsing of all user input

## 📝 Git Workflow

```bash
# Initialize repository
git init
git add .
git commit -m "Initial commit: Cinematic portfolio with AI concierge"

# Push to GitHub (after setup_github_environment)
git remote add origin https://github.com/username/webapp.git
git push -u origin main
```

## 🔮 Future Enhancements

### Not Yet Implemented
- [ ] Contact form with email integration
- [ ] Blog/articles section for security insights
- [ ] Case studies showcase
- [ ] Testimonials section
- [ ] Dark/light theme toggle
- [ ] Advanced analytics integration
- [ ] Multi-language support

### Recommended Next Steps
1. **Content Expansion**: Add blog section for security thought leadership
2. **Case Studies**: Showcase real-world vulnerability intelligence implementations
3. **Interactive Demos**: Build live demos of risk scoring algorithms
4. **Integration Examples**: Document integration patterns with popular security tools
5. **API Documentation**: Create comprehensive docs for custom integrations

## 📄 License

© 2026 Jeremy Quadri. All rights reserved.

## 🤝 Contact

- **Email**: jeremy@quadri.security
- **LinkedIn**: [linkedin.com/in/jeremyquadri](https://linkedin.com/in/jeremyquadri)
- **GitHub**: [github.com/jquadri](https://github.com/jquadri)

---

**Built with precision. Deployed to the edge.**
