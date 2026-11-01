# Festival Hero Section Review

## Summary
The dynamic festival-based hero section implementation has **3 blocker issues** that must be addressed before approval.

---

## BLOCKERS

### BLOCKER-1: Date Range Overlap - Diwali and Chhath Puja
**File:** `frontend/lib/festivalThemes.ts` lines 16-32

**Issue:**
Diwali (Oct 20 - Nov 5) and Chhath Puja (Oct 25 - Nov 10) have overlapping date ranges. The `getCurrentFestival()` function uses `festivals.find()` which returns the **first match**, meaning Diwali will always be displayed during the overlap period (Oct 25 - Nov 5) and Chhath Puja will never show.

**Evidence:**
```typescript
// Diwali: Oct 20 - Nov 5
{
  name: 'Diwali',
  startDate: '10-20',
  endDate: '11-05',
  ...
},
// Chhath Puja: Oct 25 - Nov 10 (overlaps with Diwali)
{
  name: 'Chhath Puja',
  startDate: '10-25',
  endDate: '11-10',
  ...
},
```

**User Impact:**
Chhath Puja, which is extremely important in Bihar culture, will never be displayed to users during its actual celebration dates.

**Correction:**
Either:
1. Adjust date ranges to eliminate overlap (e.g., Diwali ends Oct 24, Chhath Puja Oct 25-Nov 10), OR
2. Define priority/precedence logic and document which festival takes priority during overlaps, OR
3. Split the overlapping period appropriately based on actual festival calendar dates

---

### BLOCKER-2: Tailwind Dynamic Class Interpolation
**File:** `frontend/app/page.tsx` line 176

**Issue:**
The gradient classes are dynamically interpolated using template literals: 
```tsx
<div className={`absolute inset-0 bg-gradient-to-r ${festival.hero.gradient} opacity-75`}></div>
```

This violates Tailwind's requirement that class names must be statically analyzable. Classes like `from-orange-500`, `via-amber-500`, etc. will be purged from the production build if they don't appear elsewhere in the codebase as complete strings.

**Evidence:**
The review criteria explicitly states: "Tailwind classes are not dynamically interpolated (full class names used)"

**User Impact:**
In production builds, the festival gradients may not render correctly or at all, showing default/broken styling.

**Correction:**
Use one of these approaches:
1. **Safelist approach**: Add all festival gradient classes to `tailwind.config.js` safelist
2. **Mapping approach**: Create a mapping object with complete className strings and select by key
3. **Inline styles**: Use inline CSS styles for gradients instead of Tailwind classes

Example mapping approach:
```tsx
const gradientClasses: Record<string, string> = {
  'diwali': 'absolute inset-0 bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 opacity-75',
  'holi': 'absolute inset-0 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 opacity-75',
  // ... etc
};

<div className={gradientClasses[festival.name.toLowerCase()]} />
```

---

### BLOCKER-3: Unused Festival CTA Text
**File:** `frontend/lib/festivalThemes.ts` - all festival configurations include `ctaText`  
**File:** `frontend/app/page.tsx` - CTA text is never used

**Issue:**
Each festival theme defines a `ctaText` property (e.g., "Explore Diwali Offers", "Explore Holi Specials") but this text is never displayed on the page. The hero section has no CTA button that uses `festival.hero.ctaText`.

**Evidence:**
- `festivalThemes.ts` defines `ctaText` for all 6 festivals + default theme
- Search for `festival.hero.ctaText` returns no results in `page.tsx`
- The requirements state "CTA text all pull from festival configuration"

**User Impact:**
Festival-specific CTAs that would drive user engagement during festivals are not displayed. Users don't get contextually relevant action prompts.

**Correction:**
Add a CTA button in the hero section that uses the festival's CTA text, or remove the unused `ctaText` property from the interface and configurations if it's not part of the approved design.

---

## VERIFIED REQUIREMENTS ✓

### Date Logic
- ✓ `isDateInRange()` correctly handles year-crossing festivals (Dec 27 - Jan 5)
- ✓ Month/day comparison logic converts to MMDD format correctly
- ✓ Supports `NEXT_PUBLIC_FORCE_FESTIVAL` env var for testing

### Festival Configuration
- ✓ 6 festivals + default theme configured
- ✓ TypeScript interfaces properly defined
- ✓ All festival data complete (gradient, title, emoji, subtitle, bgPattern)

### Background Patterns
- ✓ BackgroundPattern component renders festival-specific patterns
- ✓ Patterns use low opacity (0.1) to not obstruct content
- ✓ All 6 pattern types implemented (diyas, colors, snowflakes, fireworks, tricolor, default)

### Home Page Integration
- ✓ Hero section uses `getCurrentFestival()`
- ✓ Title and subtitle pull from festival configuration
- ✓ Emoji displayed with title
- ✓ BackgroundPattern component integrated
- ✓ Monument image preserved (`/images/patna-monument1.png`)
- ✓ Overlay gradients preserved for text readability
- ✓ Stats section unchanged (5000+ Businesses, 50+ Categories, etc.)

### Code Quality
- ✓ TypeScript types are correct
- ✓ Build successful per commit message
- ✓ No breaking changes to existing sections below hero

---

## VERDICT
**CHANGES_REQUESTED** - 3 blocker issues must be resolved.
