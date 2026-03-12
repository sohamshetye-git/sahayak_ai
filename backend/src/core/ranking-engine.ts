/**
 * Ranking Engine
 * Multi-factor ranking system that prioritizes schemes by relevance
 */

import { UserProfile, Scheme, RankedScheme, RankingFactor } from '../types';

export class RankingEngine {
  // Ranking weights (total = 100)
  // Prioritize user's explicit intent (what they asked for) over occupation
  private readonly WEIGHT_CATEGORY_INTENT = 50; // NEW: Highest priority - does this match what user asked for?
  private readonly WEIGHT_OCCUPATION = 20;      // Reduced from 30
  private readonly WEIGHT_STATE = 20;           // Unchanged
  private readonly WEIGHT_BENEFIT = 10;         // Reduced from 20
  private readonly WEIGHT_RECENCY = 0;          // Removed for now

  /**
   * Rank eligible schemes by relevance to user profile
   * Considers user's explicit intent (target category)
   */
  rankSchemes(schemes: Scheme[], userProfile: UserProfile): RankedScheme[] {
    const rankedSchemes = schemes.map((scheme) => {
      const { score, factors } = this.calculateRelevanceScore(scheme, userProfile);
      return {
        scheme,
        relevanceScore: score,
        rankingFactors: factors,
      };
    });

    // Sort by relevance score (descending)
    return rankedSchemes.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  /**
   * Calculate relevance score for a single scheme
   */
  private calculateRelevanceScore(
    scheme: Scheme,
    userProfile: UserProfile
  ): { score: number; factors: RankingFactor[] } {
    const factors: RankingFactor[] = [];

    // Factor 1: Category Intent Match (50 points) - NEW HIGHEST PRIORITY
    const intentScore = this.calculateIntentScore(scheme, userProfile);
    factors.push({
      factor: 'category_intent_match',
      weight: this.WEIGHT_CATEGORY_INTENT,
      score: intentScore,
    });

    // Factor 2: Occupation Match (20 points)
    const occupationScore = this.calculateOccupationScore(scheme, userProfile);
    factors.push({
      factor: 'occupation_match',
      weight: this.WEIGHT_OCCUPATION,
      score: occupationScore,
    });

    // Factor 3: State Match (20 points)
    const stateScore = this.calculateStateScore(scheme, userProfile);
    factors.push({
      factor: 'state_match',
      weight: this.WEIGHT_STATE,
      score: stateScore,
    });

    // Factor 4: Benefit Value (10 points)
    const benefitScore = this.calculateBenefitScore(scheme);
    factors.push({
      factor: 'benefit_value',
      weight: this.WEIGHT_BENEFIT,
      score: benefitScore,
    });

    // Calculate total score
    const totalScore = factors.reduce((sum, factor) => sum + factor.score, 0);

    return { score: totalScore, factors };
  }

  /**
   * Calculate intent match score (0-50 points)
   * Does this scheme match what the user explicitly asked for?
   */
  private calculateIntentScore(scheme: Scheme, userProfile: UserProfile): number {
    // If user specified a target category (intent), check if scheme matches
    if (userProfile.targetCategory) {
      const schemeCategory = scheme.category.toLowerCase();
      const targetCategory = userProfile.targetCategory.toLowerCase();
      
      if (schemeCategory === targetCategory || schemeCategory.includes(targetCategory)) {
        return this.WEIGHT_CATEGORY_INTENT; // Full score for exact match
      }
      
      return 0; // No score if doesn't match intent
    }

    // If no explicit intent, give neutral score
    return this.WEIGHT_CATEGORY_INTENT * 0.5;
  }

  /**
   * Calculate occupation match score (0-20 points)
   */
  private calculateOccupationScore(scheme: Scheme, userProfile: UserProfile): number {
    if (!userProfile.occupation) {
      return 0;
    }

    const occupation = scheme.eligibility.occupation;
    if (!occupation) {
      return this.WEIGHT_OCCUPATION * 0.5; // Neutral score for schemes without occupation criteria
    }

    // Check if user's occupation matches
    const occupations = Array.isArray(occupation) ? occupation : [occupation];
    if (occupations.includes(userProfile.occupation) || occupations.includes('ANY')) {
      return this.WEIGHT_OCCUPATION; // Full score for direct match
    }

    return 0;
  }

  /**
   * Calculate state match score (0-20 points)
   */
  private calculateStateScore(scheme: Scheme, userProfile: UserProfile): number {
    if (!userProfile.state) {
      return 0;
    }

    if (!scheme.state || scheme.state === 'All India') {
      return this.WEIGHT_STATE * 0.7; // Good score for national schemes
    }

    if (scheme.state.toLowerCase() === userProfile.state.toLowerCase()) {
      return this.WEIGHT_STATE; // Full score for state match
    }

    return 0;
  }

  /**
   * Calculate benefit value score (0-10 points)
   * Normalized based on benefit amount
   */
  private calculateBenefitScore(scheme: Scheme): number {
    const benefitAmount = scheme.benefit.amount;
    if (!benefitAmount) {
      return this.WEIGHT_BENEFIT * 0.5; // Neutral score for non-monetary benefits
    }

    // Normalize benefit amount (assuming max benefit is 100,000 INR)
    const maxBenefit = 100000;
    const normalized = Math.min(benefitAmount / maxBenefit, 1);

    return this.WEIGHT_BENEFIT * normalized;
  }

  /**
   * Get top N ranked schemes
   */
  getTopSchemes(schemes: Scheme[], userProfile: UserProfile, topN: number = 3): RankedScheme[] {
    const ranked = this.rankSchemes(schemes, userProfile);
    return ranked.slice(0, topN);
  }
}
