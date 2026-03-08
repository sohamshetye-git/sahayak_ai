/**
 * Schemes Data Service
 * Single source of truth for all scheme data
 * Loads and manages data from schemes.json
 */

export interface SchemeData {
  scheme_id: string;
  scheme_name: string;
  scheme_name_hi?: string;
  category: string;
  central_or_state: string;
  ministry_department: string;
  short_description: string;
  detailed_description: string;
  key_benefits: string[];
  financial_assistance: string;
  benefit_type: string;
  age_criteria: string;
  income_criteria: string;
  gender_criteria: string;
  category_criteria: string;
  occupation_criteria: string;
  geographic_criteria: string;
  other_conditions: string[];
  REQUIRED_DOCUMENTS: Array<string | {
    document_name: string;
    required_or_optional: string;
    description: string;
  }>;
  application_mode: 'Online' | 'Offline' | 'Both';
  online_apply_link: string;
  official_website: string;
  application_steps_online: string[];
  application_steps_offline: string[];
  submission_locations: Array<{
    office_type: string;
    department_name: string;
    who_should_visit: string;
    notes: string;
  }>;
  start_date: string;
  last_date: string;
  status: 'Active' | 'Inactive' | 'Closed';
  renewal_required: string;
  processing_time: string;
  helpline_number: string;
  email_support: string;
  faq: Array<{ question: string; answer: string }>;
  common_rejection_reasons: string[];
  tips_for_successful_application: string[];
  target_beneficiaries: string[];
  tags: string[];
  priority_level: string;
  popularity_score: number;
  difficulty_level_to_apply: string;
  icon_keyword: string;
  banner_image_keyword: string;
  theme_color: string;
  featured_flag: boolean;
}

export interface SchemesDataset {
  schemes: SchemeData[];
}

class SchemesDataService {
  private schemes: SchemeData[] = [];
  private loaded: boolean = false;

  async loadSchemes(): Promise<void> {
    if (this.loaded) return;

    try {
      console.log('[SchemesDataService] Loading schemes from /data/schemes.json');
      const response = await fetch('/data/schemes.json');
      if (!response.ok) {
        throw new Error(`Failed to load schemes data: ${response.status}`);
      }
      
      const data: SchemesDataset = await response.json();
      this.schemes = data.schemes || [];
      this.loaded = true;
      console.log(`[SchemesDataService] Loaded ${this.schemes.length} schemes successfully`);
    } catch (error) {
      console.error('[SchemesDataService] Error loading schemes:', error);
      // Fallback to sample data if JSON fails
      this.schemes = this.getSampleSchemes();
      this.loaded = true;
      console.log('[SchemesDataService] Using fallback sample data');
    }
  }

  getAllSchemes(): SchemeData[] {
    return this.schemes;
  }

  getSchemeById(schemeId: string): SchemeData | undefined {
    console.log(`[SchemesDataService] Looking for scheme: ${schemeId}`);
    const scheme = this.schemes.find(s => s.scheme_id === schemeId);
    console.log(`[SchemesDataService] Scheme found:`, scheme ? 'Yes' : 'No');
    return scheme;
  }

  getSchemesByCategory(category: string): SchemeData[] {
    return this.schemes.filter(s => 
      s.category.toLowerCase() === category.toLowerCase()
    );
  }

  getSchemesByState(state: string): SchemeData[] {
    return this.schemes.filter(s => 
      s.geographic_criteria.toLowerCase().includes(state.toLowerCase()) ||
      s.geographic_criteria.toLowerCase() === 'all india'
    );
  }

  searchSchemes(query: string): SchemeData[] {
    const lowerQuery = query.toLowerCase();
    return this.schemes.filter(s =>
      s.scheme_name.toLowerCase().includes(lowerQuery) ||
      s.short_description.toLowerCase().includes(lowerQuery) ||
      s.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  filterSchemes(filters: {
    category?: string;
    state?: string;
    beneficiary?: string;
    search?: string;
  }): SchemeData[] {
    let filtered = this.schemes;

    if (filters.category) {
      filtered = filtered.filter(s => 
        s.category.toLowerCase() === filters.category!.toLowerCase()
      );
    }

    if (filters.state) {
      filtered = filtered.filter(s =>
        s.geographic_criteria.toLowerCase().includes(filters.state!.toLowerCase()) ||
        s.geographic_criteria.toLowerCase() === 'all india'
      );
    }

    if (filters.beneficiary) {
      filtered = filtered.filter(s =>
        s.target_beneficiaries.some(b => 
          b.toLowerCase().includes(filters.beneficiary!.toLowerCase())
        )
      );
    }

    if (filters.search) {
      const lowerSearch = filters.search.toLowerCase();
      filtered = filtered.filter(s =>
        s.scheme_name.toLowerCase().includes(lowerSearch) ||
        s.short_description.toLowerCase().includes(lowerSearch) ||
        s.tags.some(tag => tag.toLowerCase().includes(lowerSearch))
      );
    }

    return filtered;
  }

  getFeaturedSchemes(): SchemeData[] {
    return this.schemes
      .filter(s => s.featured_flag)
      .sort((a, b) => b.popularity_score - a.popularity_score);
  }

  getPopularSchemes(limit: number = 10): SchemeData[] {
    return [...this.schemes]
      .sort((a, b) => b.popularity_score - a.popularity_score)
      .slice(0, limit);
  }

  // Fallback sample data
  private getSampleSchemes(): SchemeData[] {
    return [
      {
        scheme_id: 'SCH_001',
        scheme_name: 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)',
        scheme_name_hi: 'प्रधानमंत्री किसान सम्मान निधि',
        category: 'Agriculture',
        central_or_state: 'Central',
        ministry_department: 'Ministry of Agriculture & Farmers Welfare',
        short_description: 'Direct income support of ₹6,000 per year to all landholding farmers.',
        detailed_description: 'PM-KISAN provides income support to all landholding farmers\' families across the country, with an aim to supplement their financial needs for procuring various inputs related to agriculture and allied activities as well as domestic needs.',
        key_benefits: ['₹6,000 per year in three equal installments', 'Direct Benefit Transfer to bank account'],
        financial_assistance: '₹6,000 per year',
        benefit_type: 'Cash',
        age_criteria: 'Not Specified',
        income_criteria: 'Not Specified',
        gender_criteria: 'All',
        category_criteria: 'All',
        occupation_criteria: 'Cultivable Landholding Farmers',
        geographic_criteria: 'All India',
        other_conditions: ['Must have cultivable landholding'],
        REQUIRED_DOCUMENTS: [
          { document_name: 'Aadhaar Card', required_or_optional: 'Required', description: 'Identity proof' },
          { document_name: 'Bank Account Details', required_or_optional: 'Required', description: 'For DBT' },
          { document_name: 'Land Ownership Documents', required_or_optional: 'Required', description: 'Proof of land ownership' }
        ],
        application_mode: 'Both',
        online_apply_link: 'https://pmkisan.gov.in/',
        official_website: 'https://pmkisan.gov.in/',
        application_steps_online: ['Visit official website', 'Register with Aadhaar', 'Fill application form', 'Submit documents'],
        application_steps_offline: ['Visit nearest CSC', 'Fill application form', 'Submit documents', 'Get acknowledgment'],
        submission_locations: [
          { office_type: 'CSC', department_name: 'Common Service Centers', who_should_visit: 'Farmer', notes: 'For online registration' },
          { office_type: 'Agriculture Office', department_name: 'Agriculture Department', who_should_visit: 'Farmer', notes: 'For offline application' }
        ],
        start_date: '2018-12-01',
        last_date: 'Not Specified',
        status: 'Active',
        renewal_required: 'No',
        processing_time: 'Varies',
        helpline_number: '155261',
        email_support: 'pmkisan-ict@gov.in',
        faq: [],
        common_rejection_reasons: [],
        tips_for_successful_application: [],
        target_beneficiaries: ['farmers'],
        tags: ['Agriculture', 'Income Support', 'Direct Benefit Transfer'],
        priority_level: 'High',
        popularity_score: 98,
        difficulty_level_to_apply: 'Easy',
        icon_keyword: 'tractor',
        banner_image_keyword: 'farming_field',
        theme_color: '#4CAF50',
        featured_flag: true,
      },
      // Add more sample schemes as needed
    ];
  }
}

// Singleton instance
export const schemesDataService = new SchemesDataService();
