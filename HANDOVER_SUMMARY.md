# Quick Handover Summary

## 🎯 What You Need

### 1. Repository Access
- **GitHub:** https://github.com/quadriconsulting/jq
- **Branch:** `jq-chat` (development) | `main` (production)
- **Local Path:** `/home/user/webapp/`

### 2. Essential Commands
```bash
# Navigate to project
cd /home/user/webapp

# Build
npm run build

# Start service
pm2 start ecosystem.config.cjs

# Deploy to GitHub
git push origin jq-chat  # or main

# Deploy to Cloudflare
setup_cloudflare_api_key
npm run deploy:prod
```

### 3. Key Files
- **`src/App.tsx`** - Main React application (all sections)
- **`functions/api/chat.js`** - AI chat concierge
- **`HANDOVER.md`** - Complete documentation (READ THIS)
- **`package.json`** - Dependencies and scripts
- **`ecosystem.config.cjs`** - PM2 configuration

### 4. Live Sites
- **Sandbox:** https://3000-iccoaya2dgqlvsnt6qh5f-de59bda9.sandbox.novita.ai
- **GitHub:** https://github.com/quadriconsulting/jq

### 5. Owner Preferences
- Keep responses **concise** (half page max)
- **No scripts** unless requested
- Use **wget** for downloads
- **Traditional, forward-thinking** style

### 6. Critical Rules
✅ Always `cd /home/user/webapp &&` before commands  
✅ Build before starting dev server  
✅ Use PM2 for services (never blocking commands)  
✅ Call `setup_github_environment` before git push  
✅ Call `setup_cloudflare_api_key` before deploy  
✅ Set 300s+ timeout for npm commands  

### 7. Project Status
- ✅ Production-ready
- ✅ All features working
- ✅ Mobile responsive
- ✅ Documentation complete
- 🔄 Active development on `jq-chat` branch

---

**READ `HANDOVER.md` FOR COMPLETE DETAILS**

Owner: Jeremy Quadri (Jay)  
Email: jeremy@quadri.fit  
Tech: React + GSAP + Tailwind + Cloudflare Pages
