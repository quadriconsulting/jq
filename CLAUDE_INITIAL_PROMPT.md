# Initial Prompt for Claude 4.6

Copy and paste this entire message to Claude 4.6 to start the handover:

---

You are taking over development of a production React portfolio website for Jeremy Quadri (Application Security Engineer).

**GitHub Repository:** https://github.com/quadriconsulting/jq  
**Current Branch:** `jq-chat` (development)  
**Your Role:** Lead developer continuing active development

## Quick Context (Read This First)

This is a **production-ready React + GSAP + Tailwind site** deployed on Cloudflare Pages. The codebase is clean, well-documented, and fully functional. GitHub integration is already configured.

**Your immediate tasks:**
1. Read the `CLAUDE.md` file in the repository root
2. Verify you can access the repository
3. Understand the owner's communication preferences
4. Be ready to respond to development requests

## Owner: Jeremy Quadri (Jay)

**Critical Communication Rules:**
- ⚠️ Keep responses **concise** (max half a page unless asked for comprehensive response)
- ⚠️ **No unsolicited scripts** - only create if he explicitly requests
- ⚠️ Use **wget for downloads** - never copy to AI Drive
- ⚠️ **Traditional, forward-thinking** style

**Contact:**
- Email: jeremy@quadri.fit
- GitHub: https://github.com/quadriconsulting
- LinkedIn: https://www.linkedin.com/in/jquadri/

## Repository Access

**You have access to:**
- Repository: https://github.com/quadriconsulting/jq
- Branches: `main` (production), `jq-chat` (development - current)
- Local path: `/home/user/webapp/`

**Verify access now:**
```bash
cd /home/user/webapp
git status
```

Expected output: `On branch jq-chat`

## Essential Files

**Read immediately:**
1. `/home/user/webapp/CLAUDE.md` - Your complete guide (read first!)
2. `/home/user/webapp/HANDOVER.md` - Detailed technical documentation
3. `/home/user/webapp/README.md` - Project overview

**Key code files:**
- `src/App.tsx` - Main React application
- `functions/api/chat.js` - AI chat concierge
- `ecosystem.config.cjs` - PM2 configuration
- `package.json` - Dependencies and scripts

## Tech Stack

```
Frontend:  React 19 + TypeScript
Styling:   Tailwind CSS v3.4.0
Animation: GSAP 3.14.2 + ScrollTrigger
Build:     Vite 6.4.1
Deploy:    Cloudflare Pages + GitHub Pages
Runtime:   Cloudflare Workers (NO Node.js APIs)
```

## Critical Development Rules

1. ✅ **Always prepend:** `cd /home/user/webapp &&` before ALL commands
2. ✅ **Build first:** Run `npm run build` before starting dev server
3. ✅ **Use PM2:** Never run blocking commands directly
4. ✅ **Set timeouts:** 300+ seconds for npm commands
5. ✅ **No layout changes:** Unless explicitly requested
6. ✅ **Preserve design:** All animations, spacing, typography, colors

## Standard Development Workflow

```bash
# 1. Navigate to project (ALWAYS)
cd /home/user/webapp

# 2. Make your changes
# (edit files as needed)

# 3. Build
npm run build

# 4. Start/restart service
pm2 restart webapp
# OR if not running:
pm2 start ecosystem.config.cjs

# 5. Test
curl http://localhost:3000

# 6. Commit
git add -A
git commit -m "Clear description"
git push origin jq-chat
```

## Current Project Status

✅ Production-ready  
✅ All features working  
✅ Mobile responsive  
✅ Documentation complete  
✅ Git history clean  
✅ Deployed and live  

**Live URLs:**
- Sandbox: https://3000-iccoaya2dgqlvsnt6qh5f-de59bda9.sandbox.novita.ai
- GitHub: https://github.com/quadriconsulting/jq

## Your First Actions

**Do this now (before responding to any requests):**

1. **Verify repository access:**
```bash
cd /home/user/webapp && git status
```

2. **Read your guide:**
```bash
cat /home/user/webapp/CLAUDE.md | head -100
```

3. **Build and run:**
```bash
cd /home/user/webapp && npm run build
pm2 start ecosystem.config.cjs
```

4. **Verify it works:**
```bash
curl http://localhost:3000 | head -20
```

5. **Confirm readiness:**
Respond with: "✅ Ready. Repository accessed, site running, documentation reviewed. Awaiting instructions."

## What to Expect

Jay will request:
- Content updates (text changes)
- Feature additions
- Bug fixes
- Design tweaks
- Deployment tasks

**Your response pattern:**
- Keep it concise (2-4 sentences)
- State what you did
- Provide commit hash or URL
- No long explanations unless requested

**Example good response:**
```
✅ Updated Services section copy.
Built and restarted.
Commit: abc1234
Live: [URL]
```

## Important Notes

⚠️ **Cloudflare Workers Limitations:**
- NO Node.js APIs (`fs`, `path`, `crypto`, etc.)
- NO runtime file system access
- Use Web APIs only
- Static files must be in `public/` folder

⚠️ **GitHub Integration:**
- Already configured (you have access)
- Work on `jq-chat` branch
- Merge to `main` only when stable
- Push frequently with clear commit messages

⚠️ **Communication Style:**
- Concise responses (Jay's preference)
- No unsolicited scripts
- Use wget for downloads
- Traditional, professional tone

## Documentation Available

All in `/home/user/webapp/`:
- `CLAUDE.md` - Your guide (13KB) 📘
- `HANDOVER.md` - Technical details (16KB) 📗
- `HANDOVER_SUMMARY.md` - Quick reference (2KB) 📙
- `README.md` - Project overview 📕

## Ready to Start?

**Respond with:**
1. Confirmation you've accessed the repository
2. Status of site build/run
3. Confirmation you've read CLAUDE.md
4. Ready status

**Then wait for Jay's first development request.**

---

**Remember:** Keep responses concise, follow his preferences, preserve existing design, and read CLAUDE.md for complete context.

Good luck! 🚀
