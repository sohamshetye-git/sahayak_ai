# 🧪 Platform Testing Guide

## Quick Start

### 1. Start the Application
```bash
# Terminal 1: Start backend
cd backend
npm run dev

# Terminal 2: Start frontend
cd frontend
npm run dev
```

### 2. Open the Application
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

---

## Complete User Journey Tests

### Test 1: Discover Schemes (5 minutes)

**Steps:**
1. Open http://localhost:3000
2. Click "Explore Schemes" or navigate to http://localhost:3000/schemes
3. **Verify**: See 12 schemes on page 1
4. **Verify**: See pagination controls (Page 1 of 2)
5. Click "Next" or "2"
6. **Verify**: See remaining 3 schemes on page 2
7. Click "Previous" or "1"
8. **Verify**: Back to page 1

**Search Test:**
1. Type "Kisan" in search box
2. **Verify**: See PM-KISAN scheme
3. Clear search
4. **Verify**: All schemes return

**Filter Test:**
1. Select "Agriculture" category
2. **Verify**: Only agriculture schemes shown
3. Select "All India" state
4. **Verify**: Schemes filtered by location
5. Click "Clear Filters"
6. **Verify**: All schemes return

---

### Test 2: View Scheme Details (5 minutes)

**Steps:**
1. From Explore Schemes, click "View Details" on PM-KISAN
2. **Verify**: Navigate to `/schemes/SCH_001`
3. **Verify**: See scheme name, category, description

**Overview Tab:**
1. **Verify**: See "About Scheme" section
2. **Verify**: See "Eligibility Criteria" section
3. **Verify**: See age, income, gender, category criteria

**Documents Tab:**
1. Click "Documents" tab
2. **Verify**: See required documents list
3. **Verify**: Each document shows name, required/optional, description
4. Check some documents
5. **Verify**: Progress bar updates
6. **Verify**: "Proceed to Apply" button appears

**Apply Tab:**
1. Click "Apply" tab
2. **Verify**: See application method cards
3. **Verify**: See "Apply Online" or "Apply Offline" options
4. **Verify**: See application steps

---

### Test 3: Apply for Scheme (3 minutes)

**Online Application:**
1. On Apply tab, click "Apply Online"
2. **Verify**: Opens official website in new tab
3. Return to app
4. Click "I Have Applied"
5. **Verify**: Redirects to My Applications
6. **Verify**: New application appears

**Offline Application:**
1. Navigate to a scheme with offline mode
2. Click "Apply Offline"
3. **Verify**: See submission locations
4. Click "I Have Submitted"
5. **Verify**: Application created

---

### Test 4: My Applications Dashboard (5 minutes)

**Steps:**
1. Navigate to http://localhost:3000/applications
2. **Verify**: See 4 summary stat cards
   - Total Applied
   - In Progress
   - Completed
   - Pending Docs
3. **Verify**: See application cards

**Application Card:**
1. **Verify**: See scheme icon
2. **Verify**: See scheme name (from JSON)
3. **Verify**: See scheme category badge
4. **Verify**: See application ID
5. **Verify**: See applied date
6. **Verify**: See status badge
7. **Verify**: See progress bar with percentage
8. **Verify**: See stage timeline (4 stages)
9. **Verify**: See mode tag

**Expandable Details:**
1. Click "Show Details"
2. **Verify**: Details expand
3. **Verify**: See application ID, last updated, current step, status
4. **Verify**: See "Continue Application" button
5. **Verify**: See "View Scheme" button

**Sidebar:**
1. **Verify**: See "Notifications" section
2. **Verify**: See approved applications (if any)
3. **Verify**: See "Need Help?" section
4. **Verify**: See "Ask Sahayak AI" button

---

### Test 5: View Scheme from Application (3 minutes)

**Steps:**
1. In My Applications, click "Show Details" on any application
2. Click "View Scheme" button
3. **Verify**: Navigate to `/schemes/[schemeId]`
4. **Verify**: See correct scheme details
5. **Verify**: All data loads from JSON
6. **Verify**: Same page as Explore Schemes details

**Test Linkage:**
1. Note the scheme name in My Applications
2. Click "View Scheme"
3. **Verify**: Scheme name matches
4. **Verify**: Category matches
5. **Verify**: All details are consistent

---

### Test 6: Resume Application (3 minutes)

**Steps:**
1. In My Applications, find an in-progress application
2. Click "Continue Application"
3. **Verify**: Navigate to `/applications/[applicationId]`
4. **Verify**: Form loads with saved data
5. **Verify**: Current step is restored
6. **Verify**: Progress is shown
7. Make changes
8. **Verify**: Changes save
9. **Verify**: Progress updates

---

### Test 7: AI Chat Integration (5 minutes)

**Steps:**
1. Navigate to http://localhost:3000/chat
2. Type: "Show me schemes for farmers"
3. **Verify**: AI responds with recommendations
4. **Verify**: Scheme cards appear in chat
5. **Verify**: Cards show scheme name, category, benefits

**Scheme Card in Chat:**
1. **Verify**: See "View Details" button
2. **Verify**: See "Documents" button
3. Click "View Details"
4. **Verify**: Navigate to scheme details page
5. **Verify**: Data loads from JSON

**Back to Chat:**
1. Go back to chat
2. Try another query: "I need housing assistance"
3. **Verify**: Relevant schemes recommended
4. **Verify**: Scheme cards render correctly

---

### Test 8: Navigation Flow (3 minutes)

**Test All Routes:**
1. Home → Explore Schemes → Scheme Details → Apply → My Applications
2. My Applications → View Scheme → Scheme Details
3. Chat → Scheme Card → Scheme Details
4. Scheme Details → Documents Tab → Apply Tab → Overview Tab

**Test Back Navigation:**
1. Use browser back button
2. **Verify**: Returns to previous page
3. **Verify**: State is preserved
4. **Verify**: No errors

---

### Test 9: Responsive Design (3 minutes)

**Desktop (1920x1080):**
1. **Verify**: 3 scheme cards per row
2. **Verify**: 4 stat cards in a row
3. **Verify**: Sidebar visible
4. **Verify**: All content fits well

**Tablet (768x1024):**
1. Resize browser to tablet size
2. **Verify**: 2 scheme cards per row
3. **Verify**: 2 stat cards per row
4. **Verify**: Sidebar below main content
5. **Verify**: Navigation works

**Mobile (375x667):**
1. Resize to mobile size
2. **Verify**: 1 scheme card per row
3. **Verify**: 1 stat card per row
4. **Verify**: Vertical layout
5. **Verify**: Touch-friendly buttons

---

### Test 10: Data Consistency (5 minutes)

**Scheme Data:**
1. Note scheme name in Explore Schemes
2. Click View Details
3. **Verify**: Same name in details page
4. Apply for scheme
5. Go to My Applications
6. **Verify**: Same name in application card
7. Click View Scheme
8. **Verify**: Same name in scheme details

**Category Data:**
1. Note category in Explore Schemes
2. **Verify**: Same category in scheme details
3. **Verify**: Same category in My Applications
4. **Verify**: Same category in AI Chat

**Documents Data:**
1. View documents in scheme details
2. Note document names
3. Apply for scheme
4. Resume application
5. **Verify**: Same documents in application form

---

## Error Testing

### Test 11: Error Handling (3 minutes)

**Invalid Scheme ID:**
1. Navigate to http://localhost:3000/schemes/INVALID_ID
2. **Verify**: See error message
3. **Verify**: "Back to Schemes" button works

**Network Error:**
1. Stop backend server
2. Try to load schemes
3. **Verify**: See error message
4. **Verify**: "Retry" button appears
5. Start backend
6. Click "Retry"
7. **Verify**: Data loads

**Empty State:**
1. Navigate to My Applications with no applications
2. **Verify**: See "No applications yet" message
3. **Verify**: See "Browse Schemes" button
4. Click button
5. **Verify**: Navigate to Explore Schemes

---

## Performance Testing

### Test 12: Load Times (3 minutes)

**Measure:**
1. Open DevTools → Network tab
2. Clear cache
3. Load Explore Schemes
4. **Verify**: Page loads in < 2 seconds
5. **Verify**: JSON loads in < 500ms
6. **Verify**: Images load progressively

**Pagination:**
1. Click through all pages
2. **Verify**: Instant page changes
3. **Verify**: No loading delays

**Search:**
1. Type in search box
2. **Verify**: Results update instantly
3. **Verify**: No lag

---

## Integration Testing

### Test 13: Complete Flow (10 minutes)

**Full Journey:**
1. Start at home page
2. Browse schemes
3. Filter by category
4. Search for specific scheme
5. View scheme details
6. Check eligibility
7. Review documents
8. Apply for scheme
9. View in My Applications
10. Check progress
11. Click View Scheme
12. Verify data consistency
13. Resume application
14. Update progress
15. Complete application
16. Verify status update
17. Check notifications
18. Ask AI for help
19. Get scheme recommendations
20. Navigate back to schemes

**Verify at Each Step:**
- No errors in console
- Data loads correctly
- Navigation works
- State persists
- UI updates properly

---

## Checklist Summary

### Core Features
- [ ] Explore Schemes loads 15 schemes
- [ ] Pagination works (12 per page)
- [ ] Search works
- [ ] Filters work
- [ ] Scheme details load from JSON
- [ ] All tabs work (Overview, Documents, Apply)
- [ ] Apply flow works
- [ ] Applications created correctly
- [ ] My Applications displays correctly
- [ ] View Scheme button works
- [ ] Resume application works
- [ ] AI Chat integrates schemes

### Data Consistency
- [ ] Scheme names consistent everywhere
- [ ] Categories consistent
- [ ] Documents load from JSON
- [ ] No hardcoded data
- [ ] Single source of truth maintained

### Navigation
- [ ] All routes work
- [ ] Back button works
- [ ] Links work
- [ ] Redirects work
- [ ] No broken links

### UI/UX
- [ ] Responsive design works
- [ ] Loading states show
- [ ] Error states show
- [ ] Empty states show
- [ ] Animations smooth
- [ ] Touch-friendly on mobile

### Performance
- [ ] Fast load times
- [ ] No lag
- [ ] Smooth transitions
- [ ] Efficient rendering

---

## Status: ✅ READY FOR TESTING

All features are integrated and ready for comprehensive testing. Follow this guide to verify the complete platform works as expected.

**Estimated Total Testing Time: 60 minutes**

**Priority Tests:**
1. Test 1: Discover Schemes (MUST DO)
2. Test 2: View Scheme Details (MUST DO)
3. Test 5: View Scheme from Application (MUST DO)
4. Test 10: Data Consistency (MUST DO)

**Quick Smoke Test (10 minutes):**
1. Browse schemes
2. View details
3. Apply
4. Check My Applications
5. Click View Scheme
6. Verify data matches

If all priority tests pass, the platform is working correctly!
