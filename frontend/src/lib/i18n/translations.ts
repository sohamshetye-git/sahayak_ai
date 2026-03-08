/**
 * Translation Files
 * English and Hindi translations for UI
 */

export const translations = {
  en: {
    // Navigation
    home: 'Home',
    chat: 'Chat Assistant',
    schemes: 'Browse Schemes',
    serviceCenters: 'Service Centers',
    myApplications: 'My Applications',
    
    // Language Selection
    selectLanguage: 'Select Your Language',
    chooseLanguage: 'Choose your preferred language to continue',
    english: 'English',
    hindi: 'हिंदी',
    
    // Home Page
    welcome: 'Welcome to Sahayak AI',
    welcomeMessage: 'Your AI-powered assistant for government schemes',
    askAssistant: 'Ask Assistant',
    browseSchemes: 'Browse Schemes',
    findServiceCenters: 'Find Service Centers',
    
    // Chat
    typeMessage: 'Type your message...',
    send: 'Send',
    listening: 'Listening...',
    speaking: 'Speaking...',
    startVoice: 'Start Voice Input',
    stopVoice: 'Stop Voice Input',
    
    // Schemes
    allSchemes: 'All Schemes',
    searchSchemes: 'Search schemes...',
    filterByCategory: 'Filter by Category',
    filterByState: 'Filter by State',
    viewDetails: 'View Details',
    applyNow: 'Apply Now',
    eligibility: 'Eligibility',
    benefits: 'Benefits',
    howToApply: 'How to Apply',
    
    // Categories
    education: 'Education',
    health: 'Health',
    agriculture: 'Agriculture',
    housing: 'Housing',
    employment: 'Employment',
    socialWelfare: 'Social Welfare',
    financialAssistance: 'Financial Assistance',
    other: 'Other',
    
    // Service Centers
    nearbyServiceCenters: 'Nearby Service Centers',
    searchLocation: 'Search location...',
    distance: 'Distance',
    contactInfo: 'Contact Information',
    operatingHours: 'Operating Hours',
    servicesOffered: 'Services Offered',
    
    // Applications
    applicationStatus: 'Application Status',
    inProgress: 'In Progress',
    submitted: 'Submitted',
    approved: 'Approved',
    rejected: 'Rejected',
    draft: 'Draft',
    resumeApplication: 'Resume Application',
    progress: 'Progress',
    
    // Common
    loading: 'Loading...',
    error: 'Error',
    retry: 'Retry',
    cancel: 'Cancel',
    save: 'Save',
    next: 'Next',
    previous: 'Previous',
    submit: 'Submit',
    close: 'Close',
    stop: 'Stop',
    noResults: 'No results found',
    tryAgain: 'Try again',
  },
  
  hi: {
    // Navigation
    home: 'होम',
    chat: 'चैट सहायक',
    schemes: 'योजनाएं देखें',
    serviceCenters: 'सेवा केंद्र',
    myApplications: 'मेरे आवेदन',
    
    // Language Selection
    selectLanguage: 'अपनी भाषा चुनें',
    chooseLanguage: 'जारी रखने के लिए अपनी पसंदीदा भाषा चुनें',
    english: 'English',
    hindi: 'हिंदी',
    
    // Home Page
    welcome: 'सहायक एआई में आपका स्वागत है',
    welcomeMessage: 'सरकारी योजनाओं के लिए आपका एआई-संचालित सहायक',
    askAssistant: 'सहायक से पूछें',
    browseSchemes: 'योजनाएं देखें',
    findServiceCenters: 'सेवा केंद्र खोजें',
    
    // Chat
    typeMessage: 'अपना संदेश टाइप करें...',
    send: 'भेजें',
    listening: 'सुन रहा है...',
    speaking: 'बोल रहा है...',
    startVoice: 'वॉयस इनपुट शुरू करें',
    stopVoice: 'वॉयस इनपुट बंद करें',
    
    // Schemes
    allSchemes: 'सभी योजनाएं',
    searchSchemes: 'योजनाएं खोजें...',
    filterByCategory: 'श्रेणी के अनुसार फ़िल्टर करें',
    filterByState: 'राज्य के अनुसार फ़िल्टर करें',
    viewDetails: 'विवरण देखें',
    applyNow: 'अभी आवेदन करें',
    eligibility: 'पात्रता',
    benefits: 'लाभ',
    howToApply: 'आवेदन कैसे करें',
    
    // Categories
    education: 'शिक्षा',
    health: 'स्वास्थ्य',
    agriculture: 'कृषि',
    housing: 'आवास',
    employment: 'रोजगार',
    socialWelfare: 'सामाजिक कल्याण',
    financialAssistance: 'वित्तीय सहायता',
    other: 'अन्य',
    
    // Service Centers
    nearbyServiceCenters: 'नजदीकी सेवा केंद्र',
    searchLocation: 'स्थान खोजें...',
    distance: 'दूरी',
    contactInfo: 'संपर्क जानकारी',
    operatingHours: 'कार्य समय',
    servicesOffered: 'प्रदान की जाने वाली सेवाएं',
    
    // Applications
    applicationStatus: 'आवेदन स्थिति',
    inProgress: 'प्रगति में',
    submitted: 'जमा किया गया',
    approved: 'स्वीकृत',
    rejected: 'अस्वीकृत',
    draft: 'ड्राफ्ट',
    resumeApplication: 'आवेदन जारी रखें',
    progress: 'प्रगति',
    
    // Common
    loading: 'लोड हो रहा है...',
    error: 'त्रुटि',
    retry: 'पुनः प्रयास करें',
    cancel: 'रद्द करें',
    save: 'सहेजें',
    next: 'अगला',
    previous: 'पिछला',
    submit: 'जमा करें',
    close: 'बंद करें',
    stop: 'रोकें',
    noResults: 'कोई परिणाम नहीं मिला',
    tryAgain: 'फिर से कोशिश करें',
  },
};

export type Language = 'en' | 'hi';
export type TranslationKey = keyof typeof translations.en;
