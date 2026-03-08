# Debug View Details Issue

## Current Status

I've added debug logging to help identify the issue. Here's how to debug:

## Step 1: Open Browser Console

1. Open http://localhost:3000/schemes
2. Press F12 to open Developer Tools
3. Go to the "Console" tab

## Step 2: Check for Errors

Look for any error messages in red. Common issues:

### If you see "Failed to load schemes data"
- The JSON file is not accessible
- Check: http://localhost:3000/data/schemes.json should load

### If you see "Scheme not found"
- The scheme ID doesn't match
- Check the console logs for the scheme ID being searched

## Step 3: Test JSON Loading

Open `test-scheme-load.html` in your browser to test if the JSON loads correctly.

## Step 4: Check Console Logs

When you click "View Details", you should see these logs:

```
[SchemesDataService] Loading schemes from /data/schemes.json
[SchemesDataService] Loaded 50 schemes successfully
[SchemesDataService] Looking for scheme: SCH_001
[SchemesDataService] Scheme found: Yes
```

## Step 5: Test Direct URL

Try navigating directly to a scheme:
```
http://localhost:3000/schemes/SCH_001
```

This should show the PM-KISAN scheme details.

## Step 6: Check Network Tab

1. Open Developer Tools (F12)
2. Go to "Network" tab
3. Click "View Details" button
4. Look for:
   - `/data/schemes.json` request - should be 200 OK
   - `/schemes/SCH_001` navigation - should load

## Common Issues & Solutions

### Issue 1: Button doesn't navigate
**Symptom**: Clicking button does nothing
**Solution**: Check browser console for JavaScript errors

### Issue 2: Page loads but shows "Scheme not found"
**Symptom**: Details page loads but shows error
**Solution**: 
- Check if JSON file has the scheme
- Verify scheme_id matches (case-sensitive)

### Issue 3: JSON fails to load
**Symptom**: Console shows "Failed to load schemes data"
**Solution**:
- Verify file exists at `frontend/public/data/schemes.json`
- Check file is valid JSON
- Restart frontend server

### Issue 4: Page is blank
**Symptom**: Nothing shows after clicking
**Solution**:
- Check browser console for errors
- Verify frontend is running on port 3000
- Clear browser cache (Ctrl+Shift+R)

## Manual Test Steps

1. **Test JSON Endpoint**
   ```
   Open: http://localhost:3000/data/schemes.json
   Expected: JSON file downloads or displays
   ```

2. **Test Schemes List**
   ```
   Open: http://localhost:3000/schemes
   Expected: See 30 schemes
   ```

3. **Test Direct Navigation**
   ```
   Open: http://localhost:3000/schemes/SCH_001
   Expected: See PM-KISAN details
   ```

4. **Test Button Click**
   ```
   1. Go to http://localhost:3000/schemes
   2. Click "View Details" on first scheme
   3. Should navigate to /schemes/SCH_001
   ```

## What to Report

If it still doesn't work, please provide:

1. **Browser Console Errors** (F12 → Console tab)
2. **Network Requests** (F12 → Network tab)
3. **What happens when you click** (nothing, error, blank page, etc.)
4. **Direct URL test result** (does http://localhost:3000/schemes/SCH_001 work?)

## Quick Fixes

### Fix 1: Clear Cache
```
Press: Ctrl + Shift + R (Windows)
Or: Cmd + Shift + R (Mac)
```

### Fix 2: Restart Frontend
```bash
# Stop current server (Ctrl+C)
cd frontend
npm run dev
```

### Fix 3: Clear Next.js Cache
```bash
cd frontend
rm -rf .next
npm run dev
```

## Expected Behavior

When working correctly:

1. Click "View Details" button
2. URL changes to `/schemes/SCH_001`
3. Page shows scheme details with:
   - Scheme name
   - Category badge
   - Overview, Documents, Apply tabs
   - Full scheme information

## Debug Logs Added

The code now includes console.log statements:
- When loading JSON
- When searching for scheme by ID
- When scheme is found/not found

Check your browser console to see these logs!
