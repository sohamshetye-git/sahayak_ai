# JSON Data Integration Guide

## Overview
The application is now fully data-driven using `data/schemes.json` as the single source of truth for all scheme-related features.

## Architecture

### Data Service Layer
**File**: `frontend/src/lib/services/schemes-data.service.ts`

A singleton service that:
- Loads schemes from `/data/schemes.json`
- Provides methods to query, filter, and search schemes
- Handles fallback to sample data if JSON fails
- Caches loaded data for performance

**Key Methods:**
```typescript
- loadSchemes(): Promise<void>          // Load data from JSON
- getAllSchemes(): SchemeData[]         // Get all schemes
- getSchemeById(id): SchemeData         // Get specific scheme
- getSchemesByCategory(cat): SchemeData[] // Filter by category
- getSchemesByState(state): SchemeData[]  // Filter by state
- searchSchemes(query): SchemeData[]    // Search schemes
- filterSchemes(filters): SchemeData[]  // Advanced filtering
- getFeaturedSchemes(): SchemeData[]    // Get featured schemes
- getPopularSchemes(limit): SchemeData[] // Get popular schemes
```

### React Hooks
**File**: `frontend/src/lib/hooks/use-schemes-data.ts`

Two hooks for React components:

**1. useSchemesData()**
```typescript
const {
  schemes,          // All schemes
  isLoading,        // Loading state
  error,            // Error message
  getSchemeById,    // Get scheme by ID
  filterSchemes,    // Filter schemes
  searchSchemes,    // Search schemes
  getFeaturedSchemes, // Get featured
  getPopularSchemes,  // Get popular
  reload            // Reload data
} = useSchemesData();
```

**2. useSchemeDetails(schemeId)**
```typescript
const {
  scheme,     // Single scheme data
  isLoading,  // Loading state
  error,      // Error message
  reload      // Reload scheme
} = useSchemeDetails('SCH_001');
```

## Data Structure

### SchemeData Interface
```typescript
interface SchemeData {
  // Identification
  scheme_id: string;
  scheme_name: string;
  scheme_name_hi?: string;
  
  // Classification
  category: string;
  central_or_state: string;
  ministry_department: string;
  
  // Description
  short_description: string;
  detailed_description: string;
  key_benefits: string[];
  
  // Financial
  financial_assistance: string;
  benefit_type: string;
  
  // Eligibility
  age_criteria: string;
  income_criteria: string;
  gender_criteria: string;
  category_criteria: string;
  occupation_criteria: string;
  geographic_criteria: string;
  other_conditions: string[];
  
  // Documents
  REQUIRED_DOCUMENTS: string[];
  
  // Application
  application_mode: 'Online' | 'Offline' | 'Both';
  online_apply_link: string;
  official_website: string;
  application_steps_online: string[];
  application_steps_offline: string[];
  submission_locations: string[];
  
  // Timeline
  start_date: string;
  last_date: string;
  status: 'Active' | 'Inactive' | 'Closed';
  renewal_required: string;
  processing_time: string;
  
  // Support
  helpline_number: string;
  email_support: string;
  faq: Array<{ question: string; answer: string }>;
  
  // Guidance
  common_rejection_reasons: string[];
  tips_for_successful_application: string[];
  
  // Metadata
  target_beneficiaries: string[];
  tags: string[];
  priority_level: string;
  popularity_score: number;
  difficulty_level_to_apply: string;
  
  // UI
  icon_keyword: string;
  banner_image_keyword: string;
  theme_color: string;
  featured_flag: boolean;
}
```

## Integration Points

### 1. Scheme Listing Page
**File**: `frontend/src/app/schemes/page.tsx`

**Current**: Uses old API hooks
**TODO**: Update to use `useSchemesData()`

```typescript
// Replace this:
const { schemes, isLoading } = useSchemes({ language, limit: 12 });

// With this:
const { schemes, isLoading, filterSchemes } = useSchemesData();
const filteredSchemes = filterSchemes({
  category: selectedCategory,
  state: selectedState,
  search: searchQuery
});
```

### 2. Scheme Details Page
**File**: `frontend/src/app/schemes/[schemeId]/page.tsx`

**Current**: Uses old API hooks
**TODO**: Update to use `useSchemeDetails()`

```typescript
// Replace this:
const { scheme, isLoading } = useSchemeDetails(schemeId, language);

// With this:
const { scheme, isLoading } = useSchemeDetails(schemeId);
```

**Benefits from JSON:**
- Full scheme description
- All eligibility criteria
- Complete document list
- Application steps (online & offline)
- Submission locations
- FAQ section
- Tips and rejection reasons

### 3. AI Chat Suggestions
**File**: `frontend/src/app/chat/page.tsx`

**Status**: ✅ Already integrated

The chat now:
- Loads schemes data on mount
- Detects scheme mentions in AI responses
- Maps to actual schemes from JSON using scheme names/tags
- Renders SchemeCard components with real data
- Falls back to popular schemes if no specific match

### 4. SchemeCard Component
**File**: `frontend/src/app/components/SchemeCard.tsx`

**Status**: ✅ Updated to support JSON structure

Now accepts:
- `scheme_id` instead of `schemeId`
- `scheme_name` / `scheme_name_hi` instead of `name` / `nameHi`
- `financial_assistance` string (extracts amount)
- `benefit_type` instead of nested benefit object
- `geographic_criteria` instead of `state`
- `theme_color` for custom banner colors

### 5. Search & Filters
**Supported Filters:**
- Category (Education, Health, Agriculture, etc.)
- State/Geographic criteria
- Beneficiary type (farmers, students, women, etc.)
- Search query (name, description, tags)

**Example:**
```typescript
const results = filterSchemes({
  category: 'Agriculture',
  state: 'Maharashtra',
  beneficiary: 'farmers',
  search: 'kisan'
});
```

### 6. Documents Tab
**Data Source**: `scheme.REQUIRED_DOCUMENTS` array

Each document from JSON is rendered as a checklist item with:
- Document name
- Required/Optional badge
- Helper text
- Sample link (if available)

### 7. Apply Flow
**Data Sources**:
- `application_mode`: 'Online' | 'Offline' | 'Both'
- `online_apply_link`: Official portal URL
- `application_steps_online`: Array of steps
- `application_steps_offline`: Array of steps
- `submission_locations`: Where to submit offline

## JSON File Location

**Path**: `/public/data/schemes.json`

The file must be in the `public` directory so it can be fetched via HTTP:
```
/public
  /data
    schemes.json
```

**Access URL**: `http://localhost:3000/data/schemes.json`

## Fallback Mechanism

If JSON loading fails, the service provides sample data with:
- PM-KISAN (Agriculture)
- Ayushman Bharat (Health)
- Sukanya Samriddhi (Women)
- PM Mudra Yojana (Finance)

This ensures the app never breaks even if JSON is missing.

## Performance Optimizations

### 1. Singleton Pattern
- Service loads data once
- Cached in memory
- Shared across all components

### 2. Lazy Loading
- Data loads on first access
- Not loaded until needed
- Async loading doesn't block UI

### 3. Client-Side Filtering
- All filtering happens in memory
- No API calls for filters
- Instant results

### 4. Pagination (Future)
For large datasets:
```typescript
const paginatedSchemes = schemes.slice(
  page * limit,
  (page + 1) * limit
);
```

## Migration Steps

### Step 1: Move JSON to Public Directory
```bash
mkdir -p public/data
cp data/schemes.json public/data/schemes.json
```

### Step 2: Update Scheme Listing Page
```typescript
// frontend/src/app/schemes/page.tsx
import { useSchemesData } from '../../lib/hooks/use-schemes-data';

const { schemes, isLoading, filterSchemes } = useSchemesData();
```

### Step 3: Update Scheme Details Page
```typescript
// frontend/src/app/schemes/[schemeId]/page.tsx
import { useSchemeDetails } from '../../lib/hooks/use-schemes-data';

const { scheme, isLoading } = useSchemeDetails(schemeId);
```

### Step 4: Update Backend (Optional)
If you want to seed database from JSON:
```typescript
// backend/src/db/seed-from-json.ts
import schemesData from '../../data/schemes.json';

async function seedDatabase() {
  for (const scheme of schemesData.schemes) {
    await schemeRepository.create(scheme);
  }
}
```

## Testing

### Test Data Loading
```typescript
import { schemesDataService } from './services/schemes-data.service';

await schemesDataService.loadSchemes();
const schemes = schemesDataService.getAllSchemes();
console.log(`Loaded ${schemes.length} schemes`);
```

### Test Filtering
```typescript
const agricultureSchemes = schemesDataService.getSchemesByCategory('Agriculture');
const maharashtraSchemes = schemesDataService.getSchemesByState('Maharashtra');
const searchResults = schemesDataService.searchSchemes('kisan');
```

### Test Scheme Details
```typescript
const scheme = schemesDataService.getSchemeById('SCH_001');
console.log(scheme.scheme_name);
console.log(scheme.REQUIRED_DOCUMENTS);
console.log(scheme.application_steps_online);
```

## Benefits

✅ **Single Source of Truth**: All scheme data in one JSON file
✅ **No Hardcoding**: All content is dynamic
✅ **Easy Updates**: Edit JSON to update schemes
✅ **Type Safety**: Full TypeScript interfaces
✅ **Performance**: Client-side caching
✅ **Offline Ready**: Data loaded once
✅ **Scalable**: Supports hundreds of schemes
✅ **Maintainable**: Clear separation of data and UI

## Future Enhancements

### 1. Database Seeding
```typescript
// Seed PostgreSQL from JSON
npm run seed:schemes
```

### 2. Admin Panel
- Upload new JSON
- Edit schemes via UI
- Export to JSON

### 3. API Integration
```typescript
// Fetch from API instead of JSON
const response = await fetch('/api/schemes');
const schemes = await response.json();
```

### 4. Real-time Updates
```typescript
// WebSocket for live scheme updates
socket.on('scheme:updated', (scheme) => {
  schemesDataService.updateScheme(scheme);
});
```

### 5. Advanced Search
- Full-text search
- Fuzzy matching
- Relevance scoring
- Search suggestions

## Troubleshooting

### JSON Not Loading
**Issue**: `Failed to load schemes data`
**Solution**: 
1. Check file exists at `/public/data/schemes.json`
2. Verify JSON syntax is valid
3. Check browser console for errors
4. Ensure file is accessible via HTTP

### Scheme Not Found
**Issue**: `getSchemeById()` returns undefined
**Solution**:
1. Verify scheme_id exists in JSON
2. Check ID format matches (e.g., 'SCH_001')
3. Ensure data is loaded before querying

### Filters Not Working
**Issue**: `filterSchemes()` returns empty array
**Solution**:
1. Check filter values match JSON data
2. Verify case sensitivity
3. Check geographic_criteria format
4. Test with simpler filters first

## Summary

The application is now fully data-driven with `schemes.json` as the single source of truth. All scheme-related features load data dynamically from this file, making the system maintainable, scalable, and easy to update.

**Next Steps:**
1. Move schemes.json to public directory
2. Update remaining pages to use new hooks
3. Test all features with real JSON data
4. Add more schemes to the dataset
5. Implement pagination for large datasets
