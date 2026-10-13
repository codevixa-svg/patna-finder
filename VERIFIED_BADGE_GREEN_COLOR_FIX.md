# Verified Badge Green Color Fix

## Task: Change all verified business badges from BLUE to GREEN

### Files to Update:

---

## 1. **frontend/app/reviews/page.tsx** - Line 78
**Current:**
```tsx
<svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20" title="Verified Business">
```

**Change to:**
```tsx
<svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20" title="Verified Business">
```

---

## 2. **frontend/app/admin/businesses/[id]/page.tsx** - Line 455
**Current:**
```tsx
{business.is_verified && <span className="px-2 py-0.5 bg-blue-500 text-white rounded text-xs font-semibold">{verificationMethodLabel(business.verification_method)}</span>}
```

**Change to:**
```tsx
{business.is_verified && <span className="px-2 py-0.5 bg-green-500 text-white rounded text-xs font-semibold">{verificationMethodLabel(business.verification_method)}</span>}
```

---

## 3. **frontend/app/admin/businesses/[id]/page.tsx** - Line 515
**Current:**
```tsx
className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border transition ${business.is_verified ? 'bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
```

**Change to:**
```tsx
className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border transition ${business.is_verified ? 'bg-green-50 border-green-300 text-green-700 hover:bg-green-100' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
```

---

## 4. **frontend/app/admin/businesses/[id]/page.tsx** - Line 906
**Current:**
```tsx
<span className={`mt-1 h-2.5 w-2.5 rounded-full flex-shrink-0 ${log.action === 'verified' ? 'bg-blue-500' : 'bg-red-500'}`} />
```

**Change to:**
```tsx
<span className={`mt-1 h-2.5 w-2.5 rounded-full flex-shrink-0 ${log.action === 'verified' ? 'bg-green-500' : 'bg-red-500'}`} />
```

---

## 5. **frontend/app/admin/businesses/[id]/page.tsx** - Line 909
**Current:**
```tsx
<span className={`font-semibold ${log.action === 'verified' ? 'text-blue-700' : 'text-red-700'}`}>
```

**Change to:**
```tsx
<span className={`font-semibold ${log.action === 'verified' ? 'text-green-700' : 'text-red-700'}`}>
```

---

## 6. **frontend/app/admin/businesses/[id]/page.tsx** - Line 863
**Background color for verified status:**
**Current:**
```tsx
<div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-100 rounded-lg">
```

**Change to:**
```tsx
<div className="flex items-center gap-2 p-3 bg-green-50 border border-green-100 rounded-lg">
```

---

## 7. **frontend/app/admin/businesses/[id]/page.tsx** - Line 998
**Verify button:**
**Current:**
```tsx
className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
```

**Change to:**
```tsx
className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-50 transition"
```

---

## 8. **frontend/app/admin/businesses/[id]/edit/page.tsx** - Line 612
**Checkbox color:**
**Current:**
```tsx
{ name: 'is_verified', label: 'Verified', color: 'blue' },
```

**Change to:**
```tsx
{ name: 'is_verified', label: 'Verified', color: 'green' },
```

---

## Search & Replace Commands:

### For all frontend files, search for these patterns and replace:

**Pattern 1:** `text-blue-500` with verified context → `text-green-500`
**Pattern 2:** `bg-blue-500` with verified context → `bg-green-500`  
**Pattern 3:** `text-blue-700` with verified context → `text-green-700`
**Pattern 4:** `bg-blue-50 border-blue-` with verified context → `bg-green-50 border-green-`
**Pattern 5:** `bg-blue-600` with verify button → `bg-green-600`
**Pattern 6:** `hover:bg-blue-700` with verify button → `hover:bg-green-700`
**Pattern 7:** `color: 'blue'` for is_verified → `color: 'green'`

---

## Additional Files to Check:

Search in these files for any `is_verified` with blue colors:

- `frontend/app/businesses/page.tsx`
- `frontend/app/businesses/[slug]/page.tsx`
- `frontend/app/page.tsx` (homepage)
- `frontend/app/explore/[filter]/page.tsx`
- `frontend/app/dashboard/businesses/page.tsx`
- `frontend/app/dashboard/preview/[id]/page.tsx`
- `frontend/components/TrendingBusinessCard.tsx`
- `frontend/components/BusinessCard.tsx`

---

## How to Apply All Changes:

### Option 1: VS Code Find & Replace
1. Open VS Code
2. Press `Ctrl+Shift+H` (Find in Files)
3. Search: `text-blue-500.*verified|is_verified.*blue`
4. Enable regex mode
5. Manually review and replace blue → green

### Option 2: Let Kiro Fix All
Just say: "Apply all verified badge green color changes"

---

## Testing After Changes:
1. Check homepage - verified badges should be green
2. Check business listing page - verified badges should be green
3. Check business detail page - verified badge should be green
4. Check admin panel - all verified badges/buttons should be green
5. Check dashboard - verified status should be green

---

**Status:** Ready to apply ✅
