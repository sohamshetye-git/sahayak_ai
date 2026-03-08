/**
 * Normalization utilities for user input
 * Fixes typos and standardizes values
 */

/**
 * Normalize occupation values
 */
export function normalizeOccupation(occupation: string): string {
  const normalized = occupation.toLowerCase().trim();
  
  const occupationMap: Record<string, string> = {
    'framer': 'farmer',
    'famer': 'farmer',
    'farmar': 'farmer',
    'kisaan': 'farmer',
    'kheti': 'farmer',
    'agriculture': 'farmer',
    'farming': 'farmer',
    
    'studant': 'student',
    'studet': 'student',
    'studying': 'student',
    
    'bussiness': 'business',
    'busines': 'business',
    'self employed': 'self-employed',
    'selfemployed': 'self-employed',
    
    'govt': 'government employee',
    'government': 'government employee',
    'sarkari': 'government employee',
    
    'pvt': 'private employee',
    'private': 'private employee',
    'company': 'private employee',
    
    'labour': 'daily wage',
    'labor': 'daily wage',
    'majdoor': 'daily wage',
    'mazdoor': 'daily wage',
    'daily': 'daily wage',
  };
  
  return occupationMap[normalized] || occupation;
}

/**
 * Normalize state names
 */
export function normalizeState(state: string): string {
  const normalized = state.toLowerCase().trim();
  
  const stateMap: Record<string, string> = {
    'maharastra': 'Maharashtra',
    'maharashtra': 'Maharashtra',
    'mh': 'Maharashtra',
    'mumbai': 'Maharashtra',
    'pune': 'Maharashtra',
    
    'karnataka': 'Karnataka',
    'ka': 'Karnataka',
    'bangalore': 'Karnataka',
    'bengaluru': 'Karnataka',
    
    'tamil nadu': 'Tamil Nadu',
    'tamilnadu': 'Tamil Nadu',
    'tn': 'Tamil Nadu',
    'chennai': 'Tamil Nadu',
    
    'delhi': 'Delhi',
    'new delhi': 'Delhi',
    'dl': 'Delhi',
    
    'up': 'Uttar Pradesh',
    'uttar pradesh': 'Uttar Pradesh',
    'uttarpradesh': 'Uttar Pradesh',
    'lucknow': 'Uttar Pradesh',
    
    'gujarat': 'Gujarat',
    'gj': 'Gujarat',
    'ahmedabad': 'Gujarat',
    
    'rajasthan': 'Rajasthan',
    'rj': 'Rajasthan',
    'jaipur': 'Rajasthan',
    
    'west bengal': 'West Bengal',
    'westbengal': 'West Bengal',
    'wb': 'West Bengal',
    'kolkata': 'West Bengal',
    
    'mp': 'Madhya Pradesh',
    'madhya pradesh': 'Madhya Pradesh',
    'madhyapradesh': 'Madhya Pradesh',
    'bhopal': 'Madhya Pradesh',
    
    'bihar': 'Bihar',
    'br': 'Bihar',
    'patna': 'Bihar',
    
    'punjab': 'Punjab',
    'pb': 'Punjab',
    'chandigarh': 'Punjab',
    
    'haryana': 'Haryana',
    'hr': 'Haryana',
    'gurgaon': 'Haryana',
    
    'andhra pradesh': 'Andhra Pradesh',
    'andhrapradesh': 'Andhra Pradesh',
    'ap': 'Andhra Pradesh',
    
    'telangana': 'Telangana',
    'tg': 'Telangana',
    'hyderabad': 'Telangana',
    
    'kerala': 'Kerala',
    'kl': 'Kerala',
    'kochi': 'Kerala',
    
    'odisha': 'Odisha',
    'orissa': 'Odisha',
    'or': 'Odisha',
    'bhubaneswar': 'Odisha',
    
    'assam': 'Assam',
    'as': 'Assam',
    'guwahati': 'Assam',
    
    'jharkhand': 'Jharkhand',
    'jh': 'Jharkhand',
    'ranchi': 'Jharkhand',
    
    'chhattisgarh': 'Chhattisgarh',
    'chattisgarh': 'Chhattisgarh',
    'cg': 'Chhattisgarh',
    'raipur': 'Chhattisgarh',
    
    'uttarakhand': 'Uttarakhand',
    'uk': 'Uttarakhand',
    'dehradun': 'Uttarakhand',
    
    'himachal pradesh': 'Himachal Pradesh',
    'himachalpradesh': 'Himachal Pradesh',
    'hp': 'Himachal Pradesh',
    'shimla': 'Himachal Pradesh',
    
    'goa': 'Goa',
    'ga': 'Goa',
  };
  
  return stateMap[normalized] || state;
}

/**
 * Normalize gender values
 */
export function normalizeGender(gender: string): string {
  const normalized = gender.toLowerCase().trim();
  
  const genderMap: Record<string, string> = {
    'm': 'male',
    'male': 'male',
    'man': 'male',
    'boy': 'male',
    'purush': 'male',
    
    'f': 'female',
    'female': 'female',
    'woman': 'female',
    'girl': 'female',
    'mahila': 'female',
    
    'o': 'other',
    'other': 'other',
    'transgender': 'other',
    'trans': 'other',
  };
  
  return genderMap[normalized] || gender;
}

/**
 * Normalize income values
 */
export function normalizeIncome(income: string): number | undefined {
  const normalized = income.toLowerCase().trim();
  
  // Remove currency symbols and commas
  const cleanedIncome = normalized.replace(/[₹,]/g, '').trim();
  
  // Handle "lakh" or "lac"
  if (cleanedIncome.includes('lakh') || cleanedIncome.includes('lac')) {
    const match = cleanedIncome.match(/(\d+(?:\.\d+)?)/);
    if (match) {
      return parseFloat(match[1]) * 100000;
    }
  }
  
  // Handle "thousand" or "k"
  if (cleanedIncome.includes('thousand') || cleanedIncome.includes('k')) {
    const match = cleanedIncome.match(/(\d+(?:\.\d+)?)/);
    if (match) {
      return parseFloat(match[1]) * 1000;
    }
  }
  
  // Handle "crore" or "cr"
  if (cleanedIncome.includes('crore') || cleanedIncome.includes('cr')) {
    const match = cleanedIncome.match(/(\d+(?:\.\d+)?)/);
    if (match) {
      return parseFloat(match[1]) * 10000000;
    }
  }
  
  // Try to parse as plain number
  const match = cleanedIncome.match(/(\d+(?:\.\d+)?)/);
  if (match) {
    return parseFloat(match[1]);
  }
  
  return undefined;
}

/**
 * Normalize caste category
 */
export function normalizeCasteCategory(category: string): string {
  const normalized = category.toLowerCase().trim();
  
  const categoryMap: Record<string, string> = {
    'sc': 'sc',
    'scheduled caste': 'sc',
    'scheduledcaste': 'sc',
    
    'st': 'st',
    'scheduled tribe': 'st',
    'scheduledtribe': 'st',
    
    'obc': 'obc',
    'other backward': 'obc',
    'backward': 'obc',
    
    'general': 'general',
    'gen': 'general',
    'unreserved': 'general',
  };
  
  return categoryMap[normalized] || category;
}
