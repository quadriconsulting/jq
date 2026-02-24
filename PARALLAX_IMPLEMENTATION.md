# Parallax Implementation Summary

## ✅ Completed: Subtle Hero Background Parallax

**Date:** 2026-02-24  
**Commit:** f223482 → 28c13ef (after rebase)  
**Status:** Live and deployed

---

## What Was Implemented

A **premium, barely-perceptible parallax effect** on the Hero section background layer only.

### Technical Specifications

**Movement Range:**
- Desktop: **12px max** translateY (upward)
- Mobile: **6px max** translateY (upward)
- Direction: Background moves **up** slightly as user scrolls down

**Performance:**
- GPU-accelerated transform (`will-change: transform`)
- GSAP ScrollTrigger with `scrub: 0.4` for smooth interpolation
- No layout thrash, no repaints
- Pointer events disabled on background layer

**Accessibility:**
- **Respects `prefers-reduced-motion: reduce`** media query
- Parallax is **completely disabled** for users with motion sensitivity
- Implemented via: `window.matchMedia('(prefers-reduced-motion: reduce)').matches`

**Responsive Behavior:**
- Desktop (>768px): 12px movement
- Mobile (≤768px): 6px movement
- Detected via: `window.matchMedia('(max-width: 768px)').matches`

---

## Code Changes

### File: `/home/user/webapp/src/App.tsx`

**1. Added Background Reference**
```tsx
const heroBgRef = useRef<HTMLDivElement>(null)
```

**2. Background Layer Extraction**
Changed from:
```tsx
<section style={{ backgroundImage: '...', backgroundSize: 'cover', backgroundPosition: 'center' }}>
```

To:
```tsx
<section>
  <div 
    ref={heroBgRef}
    className="absolute inset-0"
    style={{
      backgroundImage: '...',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      willChange: 'transform',
      pointerEvents: 'none'
    }}
  />
  {/* gradient overlay */}
  {/* content */}
</section>
```

**3. GSAP ScrollTrigger Animation**
Added to existing `useGSAP` hook:
```tsx
// Subtle background parallax (accessibility-aware)
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
if (!prefersReducedMotion && heroBgRef.current) {
  const isMobile = window.matchMedia('(max-width: 768px)').matches
  const maxY = isMobile ? 6 : 12
  
  gsap.to(heroBgRef.current, {
    y: -maxY,
    ease: 'none',
    scrollTrigger: {
      trigger: heroRef.current,
      start: 'top top',
      end: 'bottom top',
      scrub: 0.4,
      invalidateOnRefresh: true
    }
  })
}
```

---

## What Was NOT Changed

✅ **Layout:** All spacing, structure, and element order remain identical  
✅ **Typography:** No font, size, weight, or line-height changes  
✅ **Colors:** All color values unchanged  
✅ **Content:** No text, copy, or imagery modifications  
✅ **Other Sections:** Philosophy, Services, Protocol, CTA sections untouched  
✅ **Foreground Animations:** Existing title/subtitle/CTA entrance animations preserved  
✅ **Navigation:** Navbar behavior unchanged  

---

## Verification Checklist

- [x] Parallax only affects Hero background layer
- [x] Max movement: 12px desktop / 6px mobile
- [x] Smooth interpolation (no jitter)
- [x] Accessibility: respects `prefers-reduced-motion`
- [x] Performance: GPU transform only
- [x] No layout/design changes
- [x] No impact on readability
- [x] All existing animations preserved
- [x] Clean GSAP context cleanup on unmount
- [x] Built and deployed successfully
- [x] Pushed to GitHub: https://github.com/quadriconsulting/jq

---

## Testing the Effect

**Desktop:**
1. Load https://3000-iccoaya2dgqlvsnt6qh5f-de59bda9.sandbox.novita.ai
2. Scroll slowly through the Hero section
3. Observe: Background image moves up **very slightly** (12px max)
4. Foreground text remains stationary (correct)

**Mobile:**
1. Set viewport to ≤768px width
2. Scroll through Hero
3. Observe: Even subtler movement (6px max)

**Accessibility Test:**
1. Enable "Reduce Motion" in OS settings:
   - macOS: System Preferences → Accessibility → Display → Reduce motion
   - Windows: Settings → Ease of Access → Display → Show animations
   - Chrome DevTools: Rendering → Emulate CSS media feature `prefers-reduced-motion: reduce`
2. Reload page
3. Parallax should be **completely disabled**

---

## Performance Impact

**Minimal:** 
- Single GPU transform on one element
- GSAP uses `requestAnimationFrame` for optimal timing
- ScrollTrigger invalidates on window resize (no stale calculations)
- No impact on Lighthouse score

---

## Future Notes

If parallax needs adjustment:
- **Increase movement:** Change `maxY` values (line ~73 in App.tsx)
- **Speed adjustment:** Modify `scrub` value (0.3 = faster, 0.6 = slower)
- **Disable completely:** Remove lines 70-88 in Hero component

---

## Repository Status

- **GitHub:** https://github.com/quadriconsulting/jq
- **Live Preview:** https://3000-iccoaya2dgqlvsnt6qh5f-de59bda9.sandbox.novita.ai
- **Commit:** 28c13ef
- **Branch:** main
- **Tag:** (will create v1.2 if needed)

---

**Implementation:** Complete ✅  
**Quality:** Premium, subtle, accessible  
**Impact:** Zero layout changes, minimal code addition
