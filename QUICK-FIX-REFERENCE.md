# Quick Fix Reference - Schemes Issues

## ✅ FIXED: Documents Not Showing

**What was wrong:** Field name mismatch (`required_documents` vs `REQUIRED_DOCUMENTS`)

**What was fixed:** 
- Renamed field in all 3 JSON files
- 30 schemes updated successfully

**Verify it works:**
```bash
# Check the field exists
node -e "const d=require('./data/schemes.json'); console.log('Has REQUIRED_DOCUMENTS:', !!d.schemes[0].REQUIRED_DOCUMENTS)"
```

## ✅ FIXED: Apply Online Button Issues

**What was wrong:** Button tried to navigate to "Not Applicable" URLs

**What was fixed:**
- Added proper validation for online_apply_link
- Disabled button shows "Not Available Online" for offline schemes

**Verify it works:**
- Visit any scheme detail page
- Click "Apply" tab
- Online schemes: Button is clickable and opens portal
- Offline schemes: Button is disabled with clear message

## Quick Test Commands

```bash
# Run the fix script (if needed again)
node fix-schemes-json-fields.js

# Check for issues
node check-online-links.js

# Open test page
start test-scheme-fixes.html
```

## File Locations

- Main data: `data/schemes.json`
- Backend copy: `backend/data/schemes.json`
- Frontend copy: `frontend/public/data/schemes.json`
- Component: `frontend/src/app/schemes/[schemeId]/page.tsx`

## Common Issues & Solutions

### Documents still not showing?
1. Clear browser cache
2. Restart Next.js dev server
3. Check browser console for errors

### Apply button still broken?
1. Check scheme has valid URL (starts with http)
2. Verify the component code has the updated validation
3. Check TypeScript compilation succeeded

---

**All fixes applied and verified ✅**
