const fs = require('fs');

console.log('📦 Creating 10 more government schemes...\n');

// Scheme data - compact format
const schemes = [
  // Already created: SCH_053
  
  // SCH_054 - Education
  {
    id: "SCH_054",
    name: "PM SHRI Schools (PM Schools for Rising India)",
    category: "Education",
    ministry: "Ministry of Education",
    shortDesc: "Upgradation of 14,500 schools as exemplar schools with modern infrastructure and quality education.",
    financial: "Central funding for infrastructure",
    benefitType: "Infrastructure + Quality Education",
    age: "School-going children",
    income: "All",
    occupation: "Student",
    online: "Not Applicable",
    website: "https://www.education.gov.in/",
    docs: [
      {name: "School Enrollment Certificate", req: "Required", desc: "Proof of enrollment in PM SHRI school"}
    ]
  },
  
  // SCH_055 - Health
  {
    id: "SCH_055",
    name: "Ayushman Bharat Health and Wellness Centres (AB-HWC)",
    category: "Health",
    ministry: "Ministry of Health and Family Welfare",
    shortDesc: "Comprehensive primary healthcare services including screening, treatment, and wellness at 1.5 lakh centres.",
    financial: "Free health services",
    benefitType: "Healthcare Services",
    age: "All",
    income: "All",
    occupation: "All",
    online: "Not Applicable",
    website: "https://ab-hwc.nhp.gov.in/",
    docs: [
      {name: "Aadhaar Card", req: "Optional", desc: "For identification"}
    ]
  },
  
  // SCH_056 - Agriculture
  {
    id: "SCH_056",
    name: "PM Kisan Maandhan Yojana (PM-KMY)",
    category: "Agriculture",
    ministry: "Ministry of Agriculture and Farmers Welfare",
    shortDesc: "Pension scheme for small and marginal farmers providing ₹3,000 monthly pension after 60 years.",
    financial: "₹3,000 per month pension",
    benefitType: "Pension",
    age: "18 to 40 years (enrollment)",
    income: "All",
    occupation: "Small and Marginal Farmers",
    online: "https://maandhan.in/",
    website: "https://maandhan.in/",
    docs: [
      {name: "Aadhaar Card", req: "Required", desc: "For identity and DBT"},
      {name: "Land Records", req: "Required", desc: "Proof of being small/marginal farmer"},
      {name: "Bank Account", req: "Required", desc: "For pension transfer"}
    ]
  },
  
  // SCH_057 - Finance
  {
    id: "SCH_057",
    name: "Pradhan Mantri Mudra Yojana (PMMY) - Tarun",
    category: "Financial Assistance",
    ministry: "Ministry of Finance",
    shortDesc: "Business loans from ₹5 Lakh to ₹10 Lakh for micro-enterprises without collateral.",
    financial: "Loans ₹5 Lakh to ₹10 Lakh",
    benefitType: "Loan",
    age: "18 years and above",
    income: "All",
    occupation: "Entrepreneur/Business Owner",
    online: "https://www.mudra.org.in/",
    website: "https://www.mudra.org.in/",
    docs: [
      {name: "Business Plan", req: "Required", desc: "Detailed project report"},
      {name: "Aadhaar Card", req: "Required", desc: "Identity proof"},
      {name: "Bank Statements", req: "Required", desc: "Last 6 months"},
      {name: "Business Registration", req: "Required", desc: "Proof of business"}
    ]
  },
  
  // SCH_058 - Health
  {
    id: "SCH_058",
    name: "Pradhan Mantri Matru Vandana Yojana (PMMVY)",
    category: "Health",
    ministry: "Ministry of Women and Child Development",
    shortDesc: "Maternity benefit of ₹5,000 for pregnant and lactating mothers for first living child.",
    financial: "₹5,000 in 3 installments",
    benefitType: "Cash",
    age: "19 years and above",
    income: "All",
    occupation: "All",
    online: "Not Applicable",
    website: "https://wcd.nic.in/schemes/pradhan-mantri-matru-vandana-yojana",
    docs: [
      {name: "Aadhaar Card", req: "Required", desc: "Identity proof"},
      {name: "Bank Account", req: "Required", desc: "For DBT"},
      {name: "MCP Card", req: "Required", desc: "Mother and Child Protection card"},
      {name: "Pregnancy Certificate", req: "Required", desc: "From registered medical facility"}
    ]
  },
  
  // SCH_059 - Agriculture
  {
    id: "SCH_059",
    name: "Pradhan Mantri Krishi Sinchayee Yojana (PMKSY)",
    category: "Agriculture",
    ministry: "Ministry of Jal Shakti",
    shortDesc: "Irrigation support through micro-irrigation, watershed development with subsidy up to 90%.",
    financial: "Subsidy 55% to 90%",
    benefitType: "Subsidy",
    age: "18 years and above",
    income: "All",
    occupation: "Farmers",
    online: "Not Applicable",
    website: "https://pmksy.gov.in/",
    docs: [
      {name: "Land Records", req: "Required", desc: "Proof of land ownership"},
      {name: "Aadhaar Card", req: "Required", desc: "Identity proof"},
      {name: "Bank Account", req: "Required", desc: "For subsidy transfer"}
    ]
  },
  
  // SCH_060 - Education
  {
    id: "SCH_060",
    name: "Samagra Shiksha Abhiyan",
    category: "Education",
    ministry: "Ministry of Education",
    shortDesc: "Integrated scheme for school education from pre-school to class 12 with focus on quality and equity.",
    financial: "Free education + textbooks + uniforms",
    benefitType: "Educational Support",
    age: "3 to 18 years",
    income: "All",
    occupation: "Student",
    online: "Not Applicable",
    website: "https://samagra.education.gov.in/",
    docs: [
      {name: "School Enrollment Certificate", req: "Required", desc: "Proof of enrollment"