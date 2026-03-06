# Claude 4.6 Handover - Jeremy Quadri Portfolio

## 🎯 Your Role

You are taking over as the lead developer for Jeremy Quadri's personal portfolio website. This is a **production-ready React + GSAP + Tailwind site** deployed on Cloudflare Pages and GitHub Pages.

**Current Status:** Fully functional, all features working, active development on `jq-chat` branch.

---

## 📋 Essential Project Information

### Owner: Jeremy Quadri (Jay)
- **Nickname:** Jay
- **Email:** jeremy@quadri.fit
- **Occupation:** Application Security Engineer (Application Security specialist)
- **Location:** London, UK (born July 1969)
- **LinkedIn:** https://www.linkedin.com/in/jquadri/
- **X/Twitter:** https://x.com/jquadri
- **GitHub:** https://github.com/quadriconsulting

### His Communication Preferences
⚠️ **CRITICAL - Follow These Rules:**
1. **Keep responses concise** - Max half a page unless he requests comprehensive response
2. **No unsolicited scripts** - Only create scripts if he explicitly asks
3. **Use wget for downloads** - Never copy to AI Drive, always create wget scripts
4. **Response style:** Traditional, forward-thinking tone
5. **Respond in his language** - English expected

### His Technical Preferences
- Always uses **Cloudflare** for CDN/DNS/WAF
- Prefers **concise, actionable responses**
- Values **clear, direct communication**
- Drives: 2012 Lexus LS 460, K1300s motorcycle
- Interests: Movies, cybersecurity

---

## 🏗️ Project Architecture

### Tech Stack
```
Frontend:  React 19 + TypeScript
Styling:   Tailwind CSS v3.4.0
Animation: GSAP 3.14.2 + ScrollTrigger
Build:     Vite 6.4.1
Deploy:    Cloudflare Pages (primary), GitHub Pages (secondary)
Runtime:   Cloudflare Workers (NO Node.js APIs available)
```

### Repository Structure
```
Repository: https://github.com/quadriconsulting/jq
Branches:
  - main     (production, stable)
  - jq-chat  (development, current)

Local Path: /home/user/webapp/
```

### Live Environments
- **Sandbox:** https://3000-iccoaya2dgqlvsnt6qh5f-de59bda9.sandbox.novita.ai
- **GitHub Pages:** https://quadriconsulting.github.io/jq (when workflow deployed)
- **Local Dev:** http://localhost:3000 (via PM2)

---

## 🚀 Quick Start (First 10 Minutes)

### Step 1: Verify Repository Access
```bash
cd /home/user/webapp
git status
git branch -a
```

**Expected Output:**
```
On branch jq-chat
Your branch is up to date with 'origin/jq-chat'.
```

### Step 2: Understand Project Structure
```bash
# List key files
ls -la /home/user/webapp/

# Key files to know:
# - src/App.tsx              (main React app)
# - functions/api/chat.js    (AI chat concierge)
# - ecosystem.config.cjs     (PM2 config)
# - wrangler.jsonc          (Cloudflare config)
# - package.json            (dependencies)
```

### Step 3: Build & Run
```bash
cd /home/user/webapp
npm run build
pm2 start ecosystem.config.cjs
```

### Step 4: Verify It Works
```bash
curl http://localhost:3000
# Should return HTML with <title>Jeremy Quadri — Application Security Architect</title>
```

**You're ready to start!**

---

## ⚠️ CRITICAL RULES (Must Follow)

### Command Execution Rules
1. ✅ **Always use absolute path:** `cd /home/user/webapp &&` before EVERY command
2. ✅ **Build before dev server:** Run `npm run build` before starting PM2
3. ✅ **Use PM2 for services:** Never run blocking commands directly
4. ✅ **Set timeouts:** 300+ seconds for npm commands (install, build, create)
5. ✅ **Clean port 3000:** Run `fuser -k 3000/tcp 2>/dev/null || true` before starting new services

### GitHub Rules
1. ✅ **GitHub integrated:** Repository access already configured
2. ✅ **Current branch:** Work on `jq-chat` for development
3. ✅ **Merge to main:** Only when features are stable and tested
4. ✅ **Commit frequently:** Clear, descriptive commit messages

### Design Rules
1. ❌ **NO layout changes** unless explicitly requested
2. ❌ **NO new sections** unless explicitly requested
3. ❌ **NO emoji** unless explicitly requested
4. ✅ **Preserve:** All animations, spacing, typography, colors
5. ✅ **Text-only edits:** When doing copy changes, only modify text content

### Cloudflare Workers Limitations
⚠️ **Runtime restrictions (NO Node.js APIs):**
- ❌ Cannot use: `fs`, `path`, `crypto`, `child_process`, `os`, `net`
- ❌ Cannot read/write files at runtime
- ✅ Use Web APIs: Fetch API, Web Crypto API
- ✅ Static files: Must use `serveStatic` from `hono/cloudflare-workers`
- ✅ All static files go in `public/` folder

---

## 📂 Site Structure & Features

### Navigation Sections (in order)
1. **Navbar** - Fixed header with glass effect on scroll
2. **Hero** - Full-screen with subtle parallax (12px desktop / 6px mobile)
3. **Services** - 4 core capability cards (2x2 grid)
4. **Philosophy** - Fixed background statement
5. **Engagement Protocol** - 4 stacked cards (responsive: pin on desktop, flow on mobile)
6. **CTA** - Contact section
7. **Footer** - Social links and contact info
8. **AI Chat** - Floating button with chat panel (OpenAI-powered)

### Key Features Implemented
✅ **Hero Parallax:** Subtle background movement (accessibility-aware)
✅ **Responsive Cards:** Protocol section adapts to mobile (no overlap)
✅ **GSAP Animations:** Entrance effects, scroll triggers, smooth scrolling
✅ **Glass Morphism:** Premium translucent UI elements
✅ **AI Chat Concierge:** OpenAI gpt-4o-mini integration
✅ **Mobile Optimized:** Tested and working on small screens

### Color Palette (Midnight Luxe)
- **Background:** `#0D0D12` (obsidian)
- **Accent:** `#C9A84C` (champagne)
- **Text:** white, gray-300, gray-400, gray-500
- **Fonts:** Inter (sans-serif), Playfair Display (serif)

---

## 🛠️ Common Development Tasks

### Make Content Changes
```bash
# 1. Edit file (e.g., src/App.tsx)
# 2. Build
cd /home/user/webapp && npm run build

# 3. Restart service
pm2 restart webapp

# 4. Test
curl http://localhost:3000 | head -30

# 5. Commit
cd /home/user/webapp && git add -A && git commit -m "Update: description"

# 6. Push
cd /home/user/webapp && git push origin jq-chat
```

### Deploy to Production (GitHub)
```bash
# Merge to main
cd /home/user/webapp
git checkout main
git merge jq-chat
git push origin main

# GitHub Actions auto-deploys to GitHub Pages
```

### Deploy to Cloudflare Pages
```bash
# Setup API key first (one-time)
setup_cloudflare_api_key

# Deploy
cd /home/user/webapp && npm run build
cd /home/user/webapp && npx wrangler pages deploy dist --project-name jq
```

### Check Service Status
```bash
pm2 list                          # List all services
pm2 logs webapp --nostream        # Check logs (non-blocking)
pm2 restart webapp                # Restart service
pm2 delete webapp                 # Stop and remove
```

### Troubleshooting
```bash
# Port 3000 in use
fuser -k 3000/tcp 2>/dev/null || true

# Service won't start
pm2 delete webapp
cd /home/user/webapp && npm run build
pm2 start ecosystem.config.cjs

# Check build output
ls -lh /home/user/webapp/dist/
```

---

## 📖 Documentation Files

**Read these for detailed information:**

1. **HANDOVER.md** - Comprehensive 16KB guide (most important)
2. **HANDOVER_SUMMARY.md** - 1-page quick reference
3. **HANDOVER_PACKAGE.md** - Transfer guide
4. **README.md** - Project overview
5. **VERSION_HISTORY.md** - Complete changelog
6. **DEPLOY_WORKFLOW.md** - GitHub Actions workflow
7. **PARALLAX_IMPLEMENTATION.md** - Hero parallax details
8. **MOBILE_FIX.md** - Mobile responsiveness fix

**Location:** All in `/home/user/webapp/`

---

## 🔑 Key Files You'll Edit

### Primary Code Files
- **`src/App.tsx`** - Main React application (all sections, components)
- **`src/index.css`** - Global styles (Tailwind + custom CSS)
- **`functions/api/chat.js`** - AI chat concierge (Cloudflare Function)

### Configuration Files
- **`package.json`** - Dependencies and scripts
- **`ecosystem.config.cjs`** - PM2 process manager config
- **`wrangler.jsonc`** - Cloudflare Pages configuration
- **`vite.config.ts`** - Vite build configuration
- **`tailwind.config.js`** - Tailwind CSS configuration

### Documentation Files
- **`README.md`** - Keep updated with features
- **`VERSION_HISTORY.md`** - Update on major changes

---

## 🎓 Development Patterns

### Standard Workflow
```
1. Read file before editing (use Read tool)
2. Make precise changes (use Edit/MultiEdit)
3. Build project (npm run build)
4. Test locally (curl or browser)
5. Commit with clear message
6. Push to jq-chat branch
```

### Git Workflow
```
Development: work on jq-chat
Testing: test locally + on sandbox
Ready: merge to main
Deploy: GitHub Actions auto-deploys
```

### Animation Changes (GSAP)
```
- Always use gsap.context for cleanup
- Always return ctx.revert() in cleanup
- Respect prefers-reduced-motion
- Use GPU transforms only (transform, not left/top)
- Keep animations subtle (premium, not gimmicky)
```

### Responsive Design
```
Breakpoint: 768px (mobile/desktop)
Mobile: Simplified animations, smaller spacing
Desktop: Full effects, larger spacing
Always test both viewports
```

---

## 🚨 Known Issues & Solutions

### Issue: Port 3000 Already in Use
```bash
fuser -k 3000/tcp 2>/dev/null || true
```

### Issue: PM2 Won't Start
```bash
pm2 delete webapp
cd /home/user/webapp && npm run build
pm2 start ecosystem.config.cjs
```

### Issue: Build Fails
```bash
# Check error output
cd /home/user/webapp && npm run build

# Common causes:
# - TypeScript syntax error in src/App.tsx
# - Missing dependency (npm install)
# - Incorrect import path
```

### Issue: Animations Not Working
```bash
# Verify GSAP cleanup
# Check useGSAP hook
# Test on live site (not just curl)
# Check browser console for errors
```

---

## 📊 Project Status

**Current State:**
- ✅ Production-ready
- ✅ All features functional
- ✅ Mobile responsive
- ✅ Animations working
- ✅ Documentation complete
- ✅ Git history clean
- ✅ Deployed and live

**Active Branch:** `jq-chat` (development)  
**Stable Branch:** `main` (production)

**Recent Changes:**
- Parallax effect added to Hero (subtle, accessible)
- Mobile card overlap fixed (Protocol section)
- Chat subheading updated
- Engagement Protocol title changed
- Handover documentation created

---

## 💬 Communication Style with Jay

### Good Response Example:
```
✅ Updated Hero background parallax to 8px (from 12px).
Built and deployed. Live at: [URL]
Commit: abc1234
```

### Bad Response Example:
```
❌ I've implemented a comprehensive parallax system with multiple 
layers of depth and sophisticated easing functions that create 
an immersive experience. I've also added several new animation 
sequences and... [continues for 3 pages]
```

**Key Points:**
- ✅ Concise (2-4 sentences)
- ✅ Actionable (what was done, where to see it)
- ✅ Specific (commit hash, URLs)
- ❌ No long explanations unless requested
- ❌ No unsolicited suggestions
- ❌ No scripts unless requested

---

## 🎯 Your First Task

### Recommended First Actions:

1. **Verify Access (2 min)**
```bash
cd /home/user/webapp
git status
git branch -a
```

2. **Build & Run (3 min)**
```bash
cd /home/user/webapp && npm run build
pm2 start ecosystem.config.cjs
curl http://localhost:3000 | head -20
```

3. **Review Recent Changes (5 min)**
```bash
cd /home/user/webapp && git log --oneline -10
```

4. **Read Documentation (15 min)**
```bash
cat /home/user/webapp/HANDOVER_SUMMARY.md
# Then read HANDOVER.md for full context
```

5. **Ready for Work**
You're now ready to respond to Jay's requests!

---

## 📞 Quick Reference

### Essential Commands
```bash
# Navigate
cd /home/user/webapp

# Build
npm run build

# Start
pm2 start ecosystem.config.cjs

# Status
pm2 list

# Logs
pm2 logs webapp --nostream

# Restart
pm2 restart webapp

# Stop
pm2 delete webapp

# Git
git status
git add -A
git commit -m "message"
git push origin jq-chat
```

### Essential Tools Available
- `setup_github_environment` - Configure GitHub access (already done)
- `setup_cloudflare_api_key` - Configure Cloudflare API
- `meta_info` - Read/write project metadata
- `Read` - Read file contents
- `Edit` - Make precise text replacements
- `MultiEdit` - Multiple edits in one file
- `Bash` - Execute shell commands
- `ProjectBackup` - Create project archive

### Essential URLs
- **Repo:** https://github.com/quadriconsulting/jq
- **Sandbox:** https://3000-iccoaya2dgqlvsnt6qh5f-de59bda9.sandbox.novita.ai
- **Docs:** /home/user/webapp/HANDOVER.md

---

## ✅ Handover Complete

You have everything needed to continue development:
- ✅ Full codebase access (GitHub integrated)
- ✅ Complete documentation
- ✅ Working development environment
- ✅ Build and deployment pipelines
- ✅ Jay's preferences and rules
- ✅ Recent change history

**Start by building and running the project, then wait for Jay's next request.**

**Remember:** Keep responses concise, follow his preferences, and preserve the existing design unless explicitly asked to change it.

---

**Created:** 2026-02-24  
**For:** Claude 4.6  
**Project:** Jeremy Quadri Portfolio  
**Status:** Ready for Handover ✅
