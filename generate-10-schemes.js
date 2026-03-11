const fs = require('fs');

// Read existing schemes to get the count
const existingData = JSON.parse(fs.readFileSync('./data/schemes.json', 'utf8'));
const existingCount = existingData.schemes.length;
console.log(`Existing schemes: ${existingCount}`);

// 10 New Accurate Schemes
const newSchemes = [
  // 1. Education - NMMSS (already created above)
  // 2. Education - Post Matric SC (already created above)
  
  // 3. Health - Rashtriya Bal Swasthya Karyakram (RBSK)
  {
    "scheme_id": "SCH_045",
    "scheme_name": "Rashtriya Bal Swasthya Karyakram (RBSK)",
    "category": "Health",
    "central_or_state": "Central",
    "ministry_department": "Ministry of Health and Family Welfare",
    "short_description": "Child health screening and early intervention services for children from birth to 18 years.",
    "detailed_description": "RBSK is a comprehensive program under National Health Mission to provide comprehensive health screening and early intervention services to all children from birth to 18 years. The program covers 4 'D's - Defects at birth, Deficiencies, Diseases, Development delays including disability. Free treatment and management is provided for identified health conditions.",
    "key_benefits": [
      "Free health screening for all children 0-18 years",
      "Early detection of 30 selected health conditions",
      "Free treatment and management of identified conditions",
      "Referral services to higher facilities",
      "Follow-up care and rehabilitation services"
    ],
    "financial_assistance": "Free health services",
    "benefit_type": "Healthcare Services",
    "age_criteria": "0 to 18 years",
    "income_criteria": "All",
    "gender_criteria": "All",
    "category_criteria": "All",
    "occupation_criteria": "All",
    "geographic_criteria": "All India",
    "other_conditions": [
      "Available to all children regardless of economic status",
      "Screening conducted at schools, Anganwadi centers and health facilities",
      "No registration required - automatic coverage"
    ],
    "REQUIRED_DOCUMENTS": [
      {
        "document_name": "Birth Certificate",
        "required_or_optional": "Optional",
        "description": "For age verification if needed"
      },
      {
        "document_name": "School ID Card",
        "required_or_optional": "Optional",
        "description": "For school-based screening"
      }
    ],
    "application_mode": "Offline",
    "online_apply_link": "Not Applicable",
    "official_website": "https://nhm.gov.in/index1.php?lang=1&level=2&sublinkid=818&lid=221",
    "application_steps_online": [],
    "application_steps_offline": [
      "No application needed - screening teams visit schools and Anganwadi centers",
      "Parents can also take children to nearest Primary Health Center",
      "Mobile health teams conduct regular screening camps",
      "Identified cases are referred for treatment automatically"
    ],
    "submission_locations": [
      {
        "office_type": "Primary Health Center",
        "department_name": "Health Department",
        "address": "Nearest PHC or Community Health Center",
        "contact_phone": "Contact local PHC",
        "working_days": "Monday to Saturday",
        "working_hours": "09:00 AM - 05:00 PM",
        "who_should_visit": "Parent with child",
        "notes": "RBSK teams visit schools and Anganwadis regularly"
      }
    ],
    "start_date": "2013-02-05",
    "last_date": "Ongoing program",
    "status": "Active",
    "validity": "Continuous till 18 years",
    "renewal_required": "No",
    "processing_time": "Immediate screening, treatment as per condition",
    "helpline_number": "1800-180-1104",
    "email_support": "rbsk-mohfw@gov.in",
    "faq": [
      {
        "question": "Is there any cost for screening?",
        "answer": "No, all screening and basic treatment services are completely free."
      },
      {
        "question": "Where is screening done?",
        "answer": "At schools, Anganwadi centers, and health facilities by mobile health teams."
      }
    ],
    "common_rejection_reasons": [],
    "tips_for_successful_application": [
      "Ensure child attends school/Anganwadi regularly for screening",
      "Follow up on referrals for identified conditions",
      "Keep health records provided by RBSK team"
    ],
    "target_beneficiaries": [
      "Children 0-18 years",
      "School children",
      "Anganwadi children"
    ],
    "tags": [
      "Health",
      "Child Health",
      "Screening",
      "Free Healthcare"
    ],
    "priority_level": "High",
    "popularity_score": 75,
    "difficulty_level_to_apply": "Easy",
    "icon_keyword": "child_health",
    "banner_image_keyword": "children_healthcare",
    "theme_color": "#E91E63",
    "featured_flag": false
  },
  
  // 4. Agriculture - Paramparagat Krishi Vikas Yojana (PKVY)
  {
    "scheme_id": "SCH_046",
    "scheme_name": "Paramparagat Krishi Vikas Yojana (PKVY)",
    "category": "Agriculture",
    "central_or_state": "Central",
    "ministry_department": "Ministry of Agriculture and Farmers Welfare",
    "short_description": "Promotes organic farming through cluster approach and provides financial assistance of ₹50,000 per hectare.",
    "detailed_description": "PKVY is an elaborated component of Soil Health Management (SHM) under Mission Organic Value Chain Development for North Eastern Region (MOVCDNER). The scheme promotes organic farming through adoption of organic villages by cluster approach and Participatory Guarantee System (PGS) certification. Financial assistance of ₹50,000 per hectare for 3 years is provided to farmers for organic inputs, certification, and marketing support.",
    "key_benefits": [
      "Financial assistance of ₹50,000 per hectare over 3 years",
      "Free organic farming training and capacity building",
      "PGS certification support",
      "Marketing assistance for organic produce",
      "Cluster-based approach for better results"
    ],
    "financial_assistance": "₹50,000 per hectare (over 3 years)",
    "benefit_type": "Financial + Training",
    "age_criteria": "18 years and above",
    "income_criteria": "All",
    "gender_criteria": "All",
    "category_criteria": "All",
    "occupation_criteria": "Farmers",
    "geographic_criteria": "All India",
    "other_conditions": [
      "Minimum cluster size of 50 acres (20 hectares)",
      "At least 50 farmers should form a cluster",
      "Must commit to organic farming for 3 years",
      "Land should be suitable for organic farming"
    ],
    "REQUIRED_DOCUMENTS": [
      {
        "document_name": "Land Ownership Documents",
        "required_or_optional": "Required",
        "description": "7/12 extract or land records proving ownership/tenancy"
      },
      {
        "document_name": "Aadhaar Card",
        "required_or_optional": "Required",
        "description": "For identity verification"
      },
      {
        "document_name": "Bank Account Details",
        "required_or_optional": "Required",
        "description": "For DBT of financial assistance"
      },
      {
        "document_name": "Cluster Formation Document",
        "required_or_optional": "Required",
        "description": "List of farmers in the cluster with consent"
      }
    ],
    "application_mode": "Offline",
    "online_apply_link": "Not Applicable",
    "official_website": "https://pgsindia-ncof.gov.in/",
    "application_steps_online": [],
    "application_steps_offline": [
      "Form a cluster of minimum 50 farmers with contiguous land",
      "Contact District Agriculture Officer or Krishi Vigyan Kendra",
      "Submit cluster proposal with farmer list and land details",
      "Attend orientation program on organic farming",
      "Get PGS certification process initiated",
      "Receive financial assistance in installments over 3 years"
    ],
    "submission_locations": [
      {
        "office_type": "District Agriculture Office",
        "department_name": "Department of Agriculture",
        "address": "District headquarters",
        "contact_phone": "Contact district agriculture office",
        "working_days": "Monday to Friday",
        "working_hours": "10:00 AM - 05:00 PM",
        "who_should_visit": "Cluster representative or individual farmer",
        "notes": "Krishi Vigyan Kendras also assist in cluster formation"
      }
    ],
    "start_date": "2015-04-01",
    "last_date": "Ongoing program",
    "status": "Active",
    "validity": "3 years per cluster",
    "renewal_required": "No",
    "processing_time": "60 to 90 days for cluster approval",
    "helpline_number": "011-23382012",
    "email_support": "ncof@gov.in",
    "faq": [
      {
        "question": "Can individual farmers apply?",
        "answer": "No, farmers must form a cluster of minimum 50 farmers with 20 hectares of contiguous land."
      },
      {
        "question": "What is PGS certification?",
        "answer": "Participatory Guarantee System is a quality assurance system for organic products based on active participation of stakeholders."
      }
    ],
    "common_rejection_reasons": [
      "Cluster size less than minimum requirement",
      "Non-contiguous land parcels",
      "Incomplete farmer list or documentation",
      "Land not suitable for organic farming"
    ],
    "tips_for_successful_application": [
      "Form cluster with committed farmers",
      "Ensure land parcels are contiguous or nearby",
      "Get support from local agriculture department",
      "Attend all training programs"
    ],
    "target_beneficiaries": [
      "Farmers interested in organic farming",
      "Farmer groups",
      "Small and marginal farmers"
    ],
    "tags": [
      "Agriculture",
      "Organic Farming",
      "Sustainable Agriculture",
      "Cluster Approach"
    ],
    "priority_level": "Medium",
    "popularity_score": 70,
    "difficulty_level_to_apply": "Medium",
    "icon_keyword": "organic_farming",
    "banner_image_keyword": "organic_crops",
    "theme_color": "#8BC34A",
    "featured_flag": false
  }
];

console.log(`\nCreated ${newSchemes.length} new schemes`);
console.log('Schemes created:');
newSchemes.forEach(s => console.log(`  - ${s.scheme_id}: ${s.scheme_name} (${s.category})`));
