# Mobile Card Overlap Fix - Engagement Protocol

## ✅ Issue Resolved: Mobile Card Overlap

**Date:** 2026-02-24  
**Commit:** 98b5003  
**Status:** Fixed and deployed

---

## Problem Description

**Issue:** On mobile devices (viewport ≤768px), the 4 "Engagement Protocol" cards overlapped each other while scrolling, causing content to be cut off and unreadable.

**Root Cause:** 
```tsx
// OLD CODE - Applied to all screen sizes
ScrollTrigger.create({
  trigger: `.protocol-card-${idx}`,
  start: 'top 20%',
  end: 'bottom 20%',
  pin: true,           // ← Cards pinned in place
  pinSpacing: false    // ← No spacing added to document flow
})
```

With `pinSpacing: false`, cards were removed from document flow and stacked on top of each other. This works visually on desktop with tall viewports, but on mobile with short viewports, it caused severe overlap and clipping.

---

## Solution Implemented

### 1. Responsive ScrollTrigger with matchMedia()

**NEW CODE:**
```tsx
useGSAP(() => {
  const ctx = gsap.context(() => {
    // Responsive animation: pin stacking on desktop, simple reveal on mobile
    ScrollTrigger.matchMedia({
      // Desktop: keep stacking pin behavior
      "(min-width: 769px)": () => {
        steps.forEach((_, idx) => {
          ScrollTrigger.create({
            trigger: `.protocol-card-${idx}`,
            start: 'top 20%',
            end: 'bottom 20%',
            pin: true,
            pinSpacing: false
          })
        })
      },
      
      // Mobile: disable pinning, use simple reveal
      "(max-width: 768px)": () => {
        steps.forEach((_, idx) => {
          const card = `.protocol-card-${idx}`
          gsap.fromTo(
            card,
            { opacity: 0, y: 12 },
            {
              opacity: 1,
              y: 0,
              duration: 0.35,
              ease: "power1.out",
              clearProps: "transform",
              scrollTrigger: {
                trigger: card,
                start: "top 85%",
                toggleActions: "play none none none"
              }
            }
          )
        })
      }
    })
  }, protocolRef)
  
  return () => ctx.revert()
}, [])
```

---

### 2. Responsive Spacing Adjustment

**Changed:**
```tsx
// OLD
<div className="space-y-32">

// NEW
<div className="space-y-10 md:space-y-32">
```

**Benefit:** Reduces spacing on mobile (40px) while keeping desktop spacing (128px) unchanged.

---

## Behavior Changes

### Desktop (>768px)
✅ **No changes** - Pin stacking effect preserved exactly as before  
✅ Cards pin at 20% from top  
✅ Stacking visual effect remains  
✅ Vertical spacing: 128px (8rem)

### Mobile (≤768px)
✅ **Pinning disabled** - Cards flow normally in document  
✅ Simple fade-in reveal animation (opacity + 12px translateY)  
✅ No overlap or clipping  
✅ All content readable  
✅ Vertical spacing: 40px (2.5rem)

---

## Technical Details

**ScrollTrigger.matchMedia() Benefits:**
- Responsive breakpoints managed by GSAP
- Automatic cleanup on breakpoint changes
- Separate animation logic per viewport size
- No manual window resize listeners needed

**Mobile Animation Specs:**
```
Initial State:  opacity: 0, y: 12px
Final State:    opacity: 1, y: 0
Duration:       350ms
Easing:         power1.out (subtle acceleration)
Trigger:        85% from top of viewport
Clear Props:    Transform removed after animation
```

**Cleanup:**
- All ScrollTriggers properly reverted via `ctx.revert()`
- No memory leaks
- Smooth transitions between breakpoints

---

## Files Modified

### `/home/user/webapp/src/App.tsx`

**Protocol Component:**
- Lines 329-343: Replaced simple ScrollTrigger.create loop with matchMedia implementation
- Line 352: Changed `space-y-32` to `space-y-10 md:space-y-32`

**Total Changes:**
- 38 insertions
- 9 deletions
- 1 file modified

---

## Testing Checklist

### Desktop Testing (>768px)
- [x] Cards pin correctly at 20% from top
- [x] Stacking animation works as before
- [x] Vertical spacing preserved (128px)
- [x] No regression in visual design
- [x] Smooth scrolling behavior

### Mobile Testing (≤768px)
- [x] Cards no longer overlap
- [x] All content readable
- [x] Fade-in animation smooth
- [x] Reduced spacing appropriate (40px)
- [x] No clipping or cutoff
- [x] Touch scrolling responsive

### Cross-Device
- [x] Breakpoint transition at 769px/768px works cleanly
- [x] No flash or jump when resizing window
- [x] Animations clean up properly
- [x] Performance: no jank or lag

---

## Verification Steps

**Desktop Test:**
1. Load site at >769px width
2. Scroll to "Engagement Protocol" section
3. Observe cards pin and stack (unchanged behavior)

**Mobile Test:**
1. Set viewport to ≤768px (or use real mobile device)
2. Scroll to "Engagement Protocol" section
3. Observe cards flow normally with fade-in
4. Verify no overlap
5. Verify all 4 cards fully readable

**Responsive Test:**
1. Open DevTools responsive mode
2. Resize viewport across 768px/769px breakpoint
3. Scroll through section at different sizes
4. Verify clean transition between animation modes

---

## Performance Impact

**Minimal:**
- ScrollTrigger.matchMedia() uses native matchMedia API (efficient)
- Mobile animation is simpler than desktop (lighter GPU load)
- clearProps removes transform after animation (no persistent styles)
- Proper cleanup prevents memory leaks

---

## Future Notes

**Adjusting Breakpoint:**
Current: 768px/769px (standard tablet breakpoint)

To change:
```tsx
"(min-width: XXXpx)": () => { /* desktop */ },
"(max-width: YYYpx)": () => { /* mobile */ }
```

**Adjusting Mobile Animation:**
```tsx
// Intensity
{ opacity: 0, y: 12 }  // Current: subtle
{ opacity: 0, y: 30 }  // More dramatic

// Speed
duration: 0.35  // Current: quick
duration: 0.6   // Slower reveal
```

---

## Repository Status

- **GitHub:** https://github.com/quadriconsulting/jq
- **Live Preview:** https://3000-iccoaya2dgqlvsnt6qh5f-de59bda9.sandbox.novita.ai
- **Commit:** 98b5003
- **Branch:** main

---

**Fix Status:** Complete ✅  
**Desktop Behavior:** Unchanged ✅  
**Mobile Behavior:** Fixed (no overlap) ✅  
**Performance:** Optimized ✅
