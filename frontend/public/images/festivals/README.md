# Festival Banner Images

This folder contains festival-specific banner images for the hero section.

## Required Images

Add the following banner images here:

1. **diwali-banner.jpg** - Diwali festival banner
2. **holi-banner.jpg** - Holi festival banner  
3. **chhath-banner.jpg** - Chhath Puja festival banner
4. **christmas-banner.jpg** - Christmas festival banner
5. **newyear-banner.jpg** - New Year celebration banner
6. **independence-banner.jpg** - Independence Day banner

## Image Specifications

- **Dimensions**: 1920x600 pixels (recommended)
- **Format**: JPG or PNG
- **File Size**: Keep under 200KB for optimal performance
- **Aspect Ratio**: 16:9 or wider for responsive design

## How It Works

The festival hero component will automatically:
1. ✅ Check calendar date for active festival
2. ✅ Load appropriate banner image if available
3. ✅ Fall back to animated gradient background if no image exists
4. ✅ Apply overlay for text readability

## Testing Different Festivals

To test a specific festival banner without changing dates:
```bash
# Set in .env.local
NEXT_PUBLIC_FORCE_FESTIVAL=Diwali
# Options: Diwali, Holi, Chhath Puja, Christmas, New Year, Independence Day
```

## Current Setup

All banners are configured in `/lib/festivalThemes.ts`:
- Each festival has optional `bgImage` property
- If bgImage exists, it replaces the gradient background
- If bgImage is missing, animated gradient shows instead
