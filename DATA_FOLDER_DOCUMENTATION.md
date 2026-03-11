# Data Folder Documentation

## Overview
The `data/` folder contains all the static and reference data used by the Sahayak AI Voice Assistant application. **schemes.json is the SINGLE SOURCE OF TRUTH** for all scheme data.

---

## File Structure

```
data/
├── schemes.json              # ✅ SINGLE SOURCE OF TRUTH - Comprehensive schemes database
├── service_centers.json      # Service center locations and details
├── application-workflows.sql # SQL schema for application workflows
├── service-centers.sql       # SQL schema for service centers
├── service_centers.json      # Service centers data
└── schemes/
    └── schemes.csv           # ⚠️ DEPRECATED - DO NOT USE
```

---

## Detailed File Documentation

### 1. **schemes.json** ✅ (SINGLE SOURCE OF TRUTH)
**Location:** `data/schemes.json`, `backend/data/schemes.json`, `frontend/public/data/schemes.json`  
**Current Count:** 15 schemes  
**Format:** JSON (Array of scheme objects)

#### Purpose
- **PRIMARY AND ONLY source** for all government schemes information
- Contains comprehensive details about each scheme including eligibility, benefits, documents, and application procedures
- Used by both backend and frontend for all scheme operations

#### Scheme IDs in System
- SCH_001: PM-KISAN
- SCH_002: Ayushman Bharat (AB-PMJAY)
- SCH_003: Sukanya Samriddhi Yojana (SSY)
- SCH_004: Pradhan Mantri Mudra Yojana (PMMY)
- SCH_005: Atal Pension Yojana (APY)
- SCH_006: PM SVANidhi
- SCH_007: PM Ujjwala Yojana (PMUY)
- SCH_008: MGNREGA
- SCH_009: PM Vishwakarma Yojana
- SCH_010: PM Matru Vandana Yojana (PMMVY)
- SCH_011: PMAY-Urban
- SCH_012: PMAY-Gramin
- SCH_019: Majhi Ladki Bahin Yojana
- SCH_020: Education Fees Reimbursement
- SCH_050: Namo Shetkari Mahasanman Nidhi

#### Structure
Each scheme object contains:
```json
{
  "scheme_id": "SCH_001",
  "scheme_name": "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
  "scheme_name_hi": "प्रधानमंत्री किसान सम्मान निधि",
  "category": "Agriculture",
  "central_or_state": "Central",
  "ministry_department": "Ministry of Agriculture and Farmers Welfare",
  "short_description": "Direct income support for farmers...",
  "detailed_description": "A central sector scheme...",
  "key_benefits": ["Benefit 1", "Benefit 2"],
  "financial_assistance": "₹6,000 per year",
  "benefit_type": "Cash",
  "age_criteria": "18 years and above",
  "income_criteria": "Excludes Higher Income Groups...",
  "gender_criteria": "All",
  "category_criteria": "All",
  "occupation_criteria": "Landholding Farmers",
  "geographic_criteria": "All India",
  "other_conditions": [],
  "required_documents": [],
  "application_mode": "Both",
  "online_apply_link": "https://pmkisan.gov.in/",
  "official_website": "https://pmkisan.gov.in/",
  "application_steps_online": [],
  "application_steps_offline": [],
  "submission_locations": [],
  "start_date": "2018-12-01",
  "last_date": "Open throughout the year",
  "status": "Active",
  "validity": "As long as landholding status remains valid",
  "renewal_required": "No",
  "processing_time": "30 to 60 days",
  "helpline_number": "011-24300606",
  "email_support": "pmkisan-ict@gov.in",
  "faq": [],
  "common_rejection_reasons": [],
  "tips_for_successful_application": [],
  "target_beneficiaries": ["Farmers"],
  "tags": ["Agriculture", "Farmer Income", "DBT"],
  "priority_level": "High",
  "popularity_score": 98,
  "difficulty_level_to_apply": "Easy",
  "icon_keyword": "tractor",
  "banner_image_keyword": "farming_field",
  "theme_color": "#4CAF50",
  "featured_flag": true
}
```

#### Usage
- **Backend:** Loaded via `loadSchemesData()` in `backend/src/utils/data-loader.ts`
- **Frontend:** Loaded via `schemesDataService` in `frontend/src/lib/services/schemes-data.service.ts`
- **AI Chat:** Used by conversation orchestrator for scheme recommendations
- **Eligibility:** Used by eligibility engine to match user profiles

---

### 2. **schemes.csv** ⚠️ DEPRECATED
**Location:** `data/schemes/schemes.csv`  
**Status:** DEPRECATED - DO NOT USE

This file is kept for reference only. All scheme data should be managed through schemes.json.

---

### 3. **service_centers.json**
**Location:** `data/service_centers.json`  
**Format:** JSON

Contains information about government service centers where users can apply for schemes offline.

---

### 4. **application-workflows.sql**
**Location:** `data/application-workflows.sql`  
**Format:** SQL

SQL schema and data for application workflow steps for each scheme.

---

### 5. **service-centers.sql**
**Location:** `data/service-centers.sql`  
**Format:** SQL

SQL schema for service centers table.

---

## Data Management Guidelines

### Adding New Schemes
1. Edit `data/schemes.json` directly
2. Copy to `backend/data/schemes.json`
3. Copy to `frontend/public/data/schemes.json`
4. Ensure all three files are synchronized

### Updating Existing Schemes
1. Update in `data/schemes.json`
2. Sync to backend and frontend copies
3. No database migration needed - JSON is loaded dynamically

### Data Validation
- Scheme IDs must be unique
- All required fields must be present
- Use proper data types (strings, arrays, objects)
- Maintain bilingual support (English + Hindi)

---

## Important Notes

⚠️ **DO NOT USE CSV FILE** - The schemes.csv file is deprecated. Only schemes.json should be used as the source of truth.

✅ **JSON is the Source** - All scheme operations read from schemes.json files.

🔄 **Keep Files Synced** - Ensure data/, backend/data/, and frontend/public/data/ schemes.json files are identical.
