/**
 * Eligibility Engine
 * Rule-based system that evaluates user profiles against scheme eligibility criteria
 */

import { UserProfile, Scheme, EligibilityResult, EligibilityCriteria } from '../types';

export class EligibilityEngine {
  /**
   * Evaluate user eligibility against all schemes
   * Optionally filter by target category (intent)
   */
  async evaluateEligibility(
    userProfile: UserProfile,
    schemes: Scheme[],
    categoryFilter?: string
  ): Promise<EligibilityResult[]> {
    // If category filter is provided, prioritize schemes in that category
    let schemesToEvaluate = schemes;
    
    if (categoryFilter) {
      const categorySchemes = schemes.filter(s => 
        s.category.toLowerCase() === categoryFilter.toLowerCase()
      );
      
      // If we found schemes in the target category, use only those
      // Otherwise, fall back to all schemes
      if (categorySchemes.length > 0) {
        schemesToEvaluate = categorySchemes;
        console.log(`[ELIGIBILITY] Filtering by category: ${categoryFilter}, found ${categorySchemes.length} schemes`);
      } else {
        console.log(`[ELIGIBILITY] No schemes found in category: ${categoryFilter}, using all schemes`);
      }
    }

    const results: EligibilityResult[] = [];

    for (const scheme of schemesToEvaluate) {
      const result = await this.checkSchemeEligibility(userProfile, scheme);
      results.push(result);
    }

    return results;
  }

  /**
   * Check if user is eligible for a specific scheme
   */
  async checkSchemeEligibility(userProfile: UserProfile, scheme: Scheme): Promise<EligibilityResult> {
    const matchedCriteria: string[] = [];
    const missingCriteria: string[] = [];
    const criteria = scheme.eligibility;

    // Check age criteria
    if (criteria.ageMin !== undefined || criteria.ageMax !== undefined) {
      if (userProfile.age === undefined) {
        missingCriteria.push('age');
      } else if (this.matchNumeric(userProfile.age, { min: criteria.ageMin, max: criteria.ageMax })) {
        matchedCriteria.push('age');
      } else {
        missingCriteria.push('age');
      }
    }

    // Check gender criteria
    if (criteria.gender) {
      if (userProfile.gender === undefined) {
        missingCriteria.push('gender');
      } else if (this.matchCategorical(userProfile.gender, criteria.gender)) {
        matchedCriteria.push('gender');
      } else {
        missingCriteria.push('gender');
      }
    }

    // Check income criteria
    if (criteria.incomeMax !== undefined) {
      if (userProfile.income === undefined) {
        missingCriteria.push('income');
      } else if (userProfile.income <= criteria.incomeMax) {
        matchedCriteria.push('income');
      } else {
        missingCriteria.push('income');
      }
    }

    // Check caste criteria
    if (criteria.caste) {
      if (userProfile.casteCategory === undefined) {
        missingCriteria.push('caste');
      } else if (this.matchCategorical(userProfile.casteCategory, criteria.caste)) {
        matchedCriteria.push('caste');
      } else {
        missingCriteria.push('caste');
      }
    }

    // Check occupation criteria
    if (criteria.occupation) {
      if (userProfile.occupation === undefined) {
        missingCriteria.push('occupation');
      } else if (this.matchCategorical(userProfile.occupation, criteria.occupation)) {
        matchedCriteria.push('occupation');
      } else {
        missingCriteria.push('occupation');
      }
    }

    // Check state criteria (scheme.state vs userProfile.state)
    if (scheme.state) {
      if (userProfile.state === undefined) {
        missingCriteria.push('state');
      } else if (this.matchState(userProfile.state, scheme.state)) {
        matchedCriteria.push('state');
      } else {
        missingCriteria.push('state');
      }
    } else {
      // All India scheme - always matches if user has state
      if (userProfile.state) {
        matchedCriteria.push('state');
      }
    }

    // Check disability criteria
    if (criteria.disability !== undefined) {
      if (userProfile.hasDisability === undefined) {
        missingCriteria.push('disability');
      } else if (userProfile.hasDisability === criteria.disability) {
        matchedCriteria.push('disability');
      } else {
        missingCriteria.push('disability');
      }
    }

    // Calculate eligibility
    const isEligible = missingCriteria.length === 0;
    const totalCriteria = matchedCriteria.length + missingCriteria.length;
    const confidenceScore = totalCriteria > 0 ? matchedCriteria.length / totalCriteria : 0;

    return {
      scheme,
      isEligible,
      matchedCriteria,
      missingCriteria,
      confidenceScore,
    };
  }

  /**
   * Match state with normalization
   */
  private matchState(userState: string, schemeState: string): boolean {
    const normalize = (state: string) => state.toLowerCase().trim();
    return normalize(userState) === normalize(schemeState);
  }

  /**
   * Match categorical attributes (exact match or "ANY")
   */
  private matchCategorical(userValue: string, criteriaValue: string | string[]): boolean {
    // Handle "ANY" or null criteria (no restriction)
    if (!criteriaValue || criteriaValue === 'ANY') {
      return true;
    }

    // Handle array of allowed values
    if (Array.isArray(criteriaValue)) {
      return criteriaValue.includes(userValue) || criteriaValue.includes('ANY');
    }

    // Handle single value
    return userValue === criteriaValue;
  }

  /**
   * Match numeric attributes (range-based)
   */
  private matchNumeric(
    userValue: number,
    range: { min?: number; max?: number }
  ): boolean {
    if (range.min !== undefined && userValue < range.min) {
      return false;
    }
    if (range.max !== undefined && userValue > range.max) {
      return false;
    }
    return true;
  }

  /**
   * Get only eligible schemes
   * Optionally filter by target category (intent)
   */
  async getEligibleSchemes(
    userProfile: UserProfile,
    schemes: Scheme[],
    categoryFilter?: string
  ): Promise<Scheme[]> {
    const results = await this.evaluateEligibility(userProfile, schemes, categoryFilter);
    return results.filter((r) => r.isEligible).map((r) => r.scheme);
  }
}
