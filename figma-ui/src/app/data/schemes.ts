export interface SchemeDocument {
  name: string;
  info: string;
  sampleUrl?: string;
  optional?: boolean;
}

export interface Scheme {
  id: string;
  name: string;
  category: string;
  benefit: string;
  description: string;
  deadline: string;
  eligibility: string[];
  documents: SchemeDocument[];
  applicationSteps: { title: string; description: string }[];
  onlineSteps?: { title: string; description: string; link?: string }[];
  officialUrl?: string;
  icon: string;
  color: string;
}

export const schemes: Scheme[] = [
  {
    id: 'pm-kisan',
    name: 'PM-KISAN Scheme',
    category: 'Agriculture',
    benefit: '₹6,000 per year (paid in 3 installments)',
    description: 'Income support for all landholding farmer families in the country to supplement their financial needs for procuring various inputs related to agriculture.',
    deadline: 'Open throughout the year',
    officialUrl: 'https://pmkisan.gov.in',
    eligibility: [
      'Age matches criteria (18–59 years)',
      'Income below ₹2 lakh per annum',
      'Occupation: Farmer',
      'Land ownership within limit (up to 2 hectares)',
    ],
    documents: [
      {
        name: 'Aadhaar Card',
        info: 'Your 12-digit unique identification number issued by UIDAI. Must be linked to your mobile number. Required for identity verification and DBT (Direct Benefit Transfer).',
      },
      {
        name: 'Bank Passbook Copy',
        info: 'Front page of your savings bank passbook showing account number, IFSC code, and branch details. The account must be linked with Aadhaar for direct transfer of ₹2,000 installments.',
      },
      {
        name: 'Land Ownership Proof (RoR)',
        info: 'Record of Rights (7/12 extract or Khasra-Khatauni) from the Revenue Department proving that you own agricultural land up to 2 hectares. Obtainable from your local Tehsil office.',
        optional: true,
      },
      {
        name: 'Income Certificate',
        info: 'Certificate issued by Tahsildar or Revenue Officer confirming annual household income is below ₹2 lakh. Required only if annual income is close to the limit.',
        optional: true,
      },
    ],
    applicationSteps: [
      { title: 'Collect required documents', description: 'Gather Aadhaar card, land records, and bank passbook before visiting.' },
      { title: 'Visit nearest CSC center', description: 'Visit nearest Common Service Centre (CSC) with all your documents.' },
      { title: 'Submit application form', description: 'Fill and submit the PM-KISAN application form at the CSC.' },
      { title: 'Receive acknowledgment receipt', description: 'Collect the acknowledgment receipt for tracking your application.' },
      { title: 'Track application status', description: 'Track application status via pmkisan.gov.in or the Sahayak AI app.' },
    ],
    onlineSteps: [
      { title: 'Visit the official PM-KISAN portal', description: 'Go to pmkisan.gov.in and click on "New Farmer Registration".', link: 'https://pmkisan.gov.in' },
      { title: 'Enter Aadhaar number', description: 'Enter your 12-digit Aadhaar number and select your state.' },
      { title: 'Fill personal & land details', description: 'Enter your name, address, bank account, and land ownership details.' },
      { title: 'Submit and note reference ID', description: 'After submission, note down your Application Reference Number.' },
      { title: 'Verification by state officials', description: 'Your details will be verified by state officials within 2–4 weeks.' },
    ],
    icon: '🌾',
    color: '#22c55e',
  },
  {
    id: 'fasal-bima',
    name: 'Pradhan Mantri Fasal Bima Yojana',
    category: 'Agriculture',
    benefit: 'Up to 90% Premium Subsidy',
    description: 'Comprehensive crop insurance coverage against losses due to natural calamities, pests and diseases. Farmers pay only 1.5–2% premium; rest is subsidized by government.',
    deadline: 'Kharif: 31 Jul | Rabi: 31 Dec',
    officialUrl: 'https://pmfby.gov.in',
    eligibility: [
      'All farmers growing notified crops',
      'Loanee farmers mandatorily covered',
      'Non-loanee farmers on voluntary basis',
      'Aadhaar card required',
    ],
    documents: [
      {
        name: 'Aadhaar Card',
        info: 'Your 12-digit Aadhaar number for identity verification. Mandatory for all applicants.',
      },
      {
        name: 'Land Records (7/12)',
        info: 'Extract from the land records office showing your agricultural landholding. Available from your Tahsil or e-Dhara kiosk.',
      },
      {
        name: 'Bank Account Details',
        info: 'Cancelled cheque or passbook copy with account number and IFSC code for receiving claim amounts directly.',
      },
      {
        name: 'Sowing Certificate',
        info: 'Certificate from the Village Level Worker (VLW) or Gram Panchayat confirming that you have sown the notified crop in the current season.',
      },
    ],
    applicationSteps: [
      { title: 'Contact nearest bank or CSC', description: 'Visit your nearest bank branch or Common Service Centre.' },
      { title: 'Fill application form', description: 'Fill the PMFBY application form with crop and land details.' },
      { title: 'Pay premium amount', description: 'Pay your share of premium — farmers pay only 1.5–2%.' },
      { title: 'Receive policy document', description: 'Collect your insurance policy document as proof of enrollment.' },
      { title: 'Claim if loss occurs', description: 'Inform your bank or CSC within 72 hours of any crop loss.' },
    ],
    onlineSteps: [
      { title: 'Visit PMFBY portal', description: 'Go to pmfby.gov.in and register as a farmer.', link: 'https://pmfby.gov.in' },
      { title: 'Login and fill crop details', description: 'Enter your crop name, land area, and season details.' },
      { title: 'Upload documents', description: 'Upload Aadhaar, land records, and sowing certificate.' },
      { title: 'Pay premium online', description: 'Pay your 1.5–2% premium share via UPI/Net Banking.' },
      { title: 'Download policy', description: 'Download and save your insurance policy document.' },
    ],
    icon: '🌱',
    color: '#16a34a',
  },
  {
    id: 'kisan-credit',
    name: 'Kisan Credit Card (KCC) Scheme',
    category: 'Agriculture',
    benefit: 'Loans up to ₹3 lakh at 4% interest',
    description: 'Easy access to affordable credit for farmers to meet their agricultural and non-agricultural needs at very low interest rates.',
    deadline: 'Open throughout the year',
    officialUrl: 'https://www.nabard.org',
    eligibility: [
      'All farmers, tenant farmers',
      'Self Help Groups of farmers',
      'Joint Liability Groups',
      'Active agricultural occupation',
    ],
    documents: [
      {
        name: 'Aadhaar Card',
        info: 'Your 12-digit Aadhaar for KYC verification at the bank. Mandatory for all applicants.',
      },
      {
        name: 'Land Records',
        info: 'Proof of agricultural landholding — 7/12 extract or patta. For tenant farmers, a tenancy agreement with the landowner is required.',
      },
      {
        name: 'Recent Passport Photo',
        info: '2 recent colour passport-size photographs (3.5 cm × 4.5 cm) with white background.',
      },
      {
        name: 'Income Proof',
        info: 'Income certificate from Tahsildar or last 2 years\' crop sale receipts to assess credit limit.',
        optional: true,
      },
    ],
    applicationSteps: [
      { title: 'Visit nearest bank', description: 'Visit your nearest bank branch or cooperative credit society.' },
      { title: 'Fill KCC application', description: 'Fill the Kisan Credit Card application form with required details.' },
      { title: 'Submit documents', description: 'Submit Aadhaar, land records, and photo for verification.' },
      { title: 'Bank verification', description: 'Bank officials will verify your land records and eligibility.' },
      { title: 'Receive KCC card', description: 'Collect your Kisan Credit Card and PIN from the bank.' },
    ],
    onlineSteps: [
      { title: 'Visit your bank\'s website', description: 'Login to internet banking or visit the PM Kisan KCC portal.', link: 'https://pmkisan.gov.in' },
      { title: 'Fill KCC application online', description: 'Complete the Kisan Credit Card application form.' },
      { title: 'Upload documents', description: 'Upload scanned copies of Aadhaar, land records, and photo.' },
      { title: 'Bank processes application', description: 'Bank reviews and approves within 14 working days.' },
      { title: 'Receive card by post', description: 'KCC is mailed to your registered address.' },
    ],
    icon: '💳',
    color: '#2563eb',
  },
  {
    id: 'ayushman-bharat',
    name: 'Ayushman Bharat',
    category: 'Health',
    benefit: '₹5 lakh health coverage per family per year',
    description: 'World\'s largest government-sponsored health insurance providing cashless treatment up to ₹5 lakh per family per year at empanelled hospitals across India.',
    deadline: 'Open throughout the year',
    officialUrl: 'https://pmjay.gov.in',
    eligibility: [
      'Listed in SECC 2011 database',
      'Below poverty line families',
      'SC/ST households',
      'No age limit for coverage',
    ],
    documents: [
      {
        name: 'Aadhaar Card',
        info: 'Your Aadhaar number for biometric identity verification at the hospital/CSC. All family members should be listed.',
      },
      {
        name: 'Ration Card',
        info: 'Your BPL or state ration card that establishes your household\'s inclusion in the SECC 2011 database.',
      },
      {
        name: 'Income Certificate',
        info: 'Certificate from Tahsildar confirming household is below poverty line. Required if BPL ration card is not available.',
      },
      {
        name: 'Caste Certificate',
        info: 'For SC/ST households, a caste certificate helps establish priority eligibility. Issued by the Revenue Department.',
        optional: true,
      },
    ],
    applicationSteps: [
      { title: 'Check eligibility online', description: 'Visit pmjay.gov.in or call 14555 to verify your eligibility.' },
      { title: 'Visit empanelled hospital or CSC', description: 'Go to any Ayushman Bharat empanelled hospital.' },
      { title: 'Get e-card generated', description: 'Staff will generate your Ayushman Bharat golden e-card.' },
      { title: 'Use card for treatment', description: 'Use the card for cashless treatment at any empanelled hospital.' },
    ],
    onlineSteps: [
      { title: 'Check eligibility on AM I Eligible', description: 'Visit pmjay.gov.in > "Am I Eligible" to check.', link: 'https://pmjay.gov.in' },
      { title: 'Register on the portal', description: 'Register with your mobile number linked to Aadhaar.' },
      { title: 'Complete eKYC', description: 'Complete Aadhaar-based OTP or biometric verification.' },
      { title: 'Download e-card', description: 'Download your Ayushman Bharat e-card as PDF.' },
      { title: 'Show at hospital', description: 'Show the e-card at any empanelled hospital for cashless treatment.' },
    ],
    icon: '🏥',
    color: '#dc2626',
  },
  {
    id: 'national-family',
    name: 'National Family Benefit Scheme',
    category: 'Social Welfare',
    benefit: '₹30,000 (One-time)',
    description: 'One-time financial assistance of ₹30,000 to below poverty line households upon death of the primary breadwinner aged between 18 to 64 years.',
    deadline: 'Apply within 90 days of death',
    officialUrl: 'https://nsap.nic.in',
    eligibility: [
      'Below poverty line household',
      'Death of primary breadwinner',
      'Age of deceased: 18–64 years',
      'Natural or accidental death',
    ],
    documents: [
      {
        name: 'Death Certificate',
        info: 'Official death certificate of the deceased breadwinner issued by the local Municipal Corporation or Gram Panchayat. Must be submitted within 90 days of death.',
      },
      {
        name: 'BPL Certificate',
        info: 'Below Poverty Line certificate or BPL ration card proving the household\'s BPL status under the SECC/state BPL list.',
      },
      {
        name: 'Aadhaar Card',
        info: 'Aadhaar card of both the deceased and the applicant (surviving family member applying for the benefit).',
      },
      {
        name: 'Bank Account Details',
        info: 'Bank passbook copy or cancelled cheque of the applicant\'s account. The ₹30,000 is directly transferred to this account.',
      },
    ],
    applicationSteps: [
      { title: 'Get death certificate', description: 'Obtain a death certificate from local municipal authority.' },
      { title: 'Fill application form', description: 'Fill the NFBS application at the Block Development Office.' },
      { title: 'Submit documents', description: 'Submit BPL certificate, Aadhaar, and bank details to District Social Welfare Officer.' },
      { title: 'Verification process', description: 'Officials will verify eligibility and all submitted documents.' },
      { title: 'Receive benefit', description: 'Approved amount of ₹30,000 transferred directly to bank account.' },
    ],
    onlineSteps: [
      { title: 'Visit NSAP portal', description: 'Go to nsap.nic.in and select National Family Benefit Scheme.', link: 'https://nsap.nic.in' },
      { title: 'Fill online application', description: 'Enter deceased\'s details, household info and bank account.' },
      { title: 'Upload documents', description: 'Upload death certificate, BPL card, and Aadhaar copies.' },
      { title: 'Submit and note reference number', description: 'Note the reference number for tracking your application.' },
      { title: 'Verification and disbursement', description: 'Social Welfare Officer verifies and disburses within 60 days.' },
    ],
    icon: '🤝',
    color: '#9333ea',
  },
  {
    id: 'old-age-pension',
    name: 'Indira Gandhi National Old Age Pension',
    category: 'Social Welfare',
    benefit: '₹500 – ₹800 (Monthly)',
    description: 'Monthly pension of ₹500–₹800 for senior citizens (60+) belonging to below poverty line households to provide income security in old age.',
    deadline: 'Open throughout the year',
    officialUrl: 'https://nsap.nic.in',
    eligibility: [
      'Age above 60 years',
      'Below poverty line household',
      'Indian citizen',
      'No other pension received',
    ],
    documents: [
      {
        name: 'Aadhaar Card',
        info: 'Your 12-digit Aadhaar number for identity verification. Must be linked to your bank account for receiving the monthly pension via DBT.',
      },
      {
        name: 'Age Proof',
        info: 'Birth certificate, school leaving certificate, or any government document confirming your age is 60 years or above. Voter ID or PAN card with DOB also accepted.',
      },
      {
        name: 'BPL Card',
        info: 'Below Poverty Line ration card or certificate proving household BPL status under the state government\'s BPL list.',
      },
      {
        name: 'Bank Passbook',
        info: 'Passbook copy showing account number and IFSC code. The monthly pension of ₹500–₹800 is directly credited to this account.',
      },
    ],
    applicationSteps: [
      { title: 'Visit Gram Panchayat or Ward Office', description: 'Collect the IGNOAPS application form from your local authority.' },
      { title: 'Fill application form', description: 'Fill the application form with accurate age and BPL details.' },
      { title: 'Submit with documents', description: 'Submit form along with Aadhaar, age proof, and BPL card.' },
      { title: 'Approval process', description: 'Block Development Officer will review and approve the application.' },
      { title: 'Start receiving pension', description: 'Monthly pension of ₹500–₹800 will be credited to your bank account.' },
    ],
    onlineSteps: [
      { title: 'Visit NSAP Pension portal', description: 'Go to nsap.nic.in and choose IGNOAPS scheme.', link: 'https://nsap.nic.in' },
      { title: 'Register with Aadhaar', description: 'Register using your Aadhaar number and mobile OTP.' },
      { title: 'Fill application', description: 'Enter your age, BPL details, and bank account number.' },
      { title: 'Upload documents', description: 'Upload age proof, BPL card, Aadhaar, and bank passbook.' },
      { title: 'Track & receive pension', description: 'After approval, monthly pension starts within 2 months.' },
    ],
    icon: '👴',
    color: '#f59e0b',
  },
];

export const categories = ['All', 'Agriculture', 'Health', 'Social Welfare', 'Education', 'Housing'];
