/**
 * Ranking Engine
 * Multi-factor ranking system that prioritizes schemes by relevance
 */

import { UserProfile, Scheme, RankedScheme, RankingFactor } from '../types';

export class RankingEngine {
  // Ranking weights (total = 100)
  private readonly WEIGHT_OCCUPATION = 30;
  private readonly WEIGHT_STATE = 25;
  private readonly WEIGHT_BENEFIT = 20;
  private readonly WEIGHT_CATEGORY = 15;
  private readonly WEIGHT_RECENCY = 10;

  /**
   * Rank eligible schemes by relevance to user profile
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

    // Factor 1: Occupation Match (30 points)
    const occupationScore = this.calculateOccupationScore(scheme, userProfile);
    factors.push({
      factor: 'occupation_match',
      weight: this.WEIGHT_OCCUPATION,
      score: occupationScore,
    });

    // Factor 2: State Match (25 points)
    const stateScore = this.calculateStateScore(scheme, userProfile);
    factors.push({
      factor: 'state_match',
      weight: this.WEIGHT_STATE,
      score: stateScore,
    });

    // Factor 3: Benefit Value (20 points)
    const benefitScore = this.calculateBenefitScore(scheme);
    factors.push({
      factor: 'benefit_value',
      weight: this.WEIGHT_BENEFIT,
      score: benefitScore,
    });

    // Factor 4: Category Priority (15 points)
    const categoryScore = this.calculateCategoryScore(scheme);
    factors.push({
      factor: 'category_priority',
      weight: this.WEIGHT_CATEGORY,
      score: categoryScore,
    });

    // Factor 5: Recency (10 points)
    const recencyScore = this.calculateRecencyScore(scheme);
    factors.push({
      factor: 'recency',
      weight: this.WEIGHT_RECENCY,
      score: recencyScore,
    });

    // Calculate total score
    const totalScore = factors.reduce((sum, factor) => sum + factor.score, 0);

    return { score: totalScore, factors };
  }

  /**
   * Calculate occupation match score (0-30 points)
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
   * Calculate state match score (0-25 points)
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
   * Calculate benefit value score (0-20 points)
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
   * Calculate category priority score (0-15 points)
   * Prioritize certain categories (health, education)
   */
  private calculateCategoryScore(scheme: Scheme): number {
    const highPriorityCategories = ['health', 'education', 'healthcare', 'scholarship'];
    const mediumPriorityCategories = ['agriculture', 'housing', 'employment'];

    const category = scheme.category.toLowerCase();

    if (highPriorityCategories.some((c) => category.includes(c))) {
      return this.WEIGHT_CATEGORY;
    }

    if (mediumPriorityCategories.some((c) => category.includes(c))) {
      return this.WEIGHT_CATEGORY * 0.7;
    }

    return this.WEIGHT_CATEGORY * 0.5;
  }

  /**
   * Calculate recency score (0-10 points)
   * Newer schemes get higher scores
   * Note: This is a placeholder - in production, you'd use actual creation dates
   */
  private calculateRecencyScore(scheme: Scheme): number {
    // For now, return a default score
    // In production, calculate based on scheme creation date
    return this.WEIGHT_RECENCY * 0.8;
  }

  /**
   * Get top N ranked schemes
   */
  getTopSchemes(schemes: Scheme[], userProfile: UserProfile, topN: number = 3): RankedScheme[] {
    const ranked = this.rankSchemes(schemes, userProfile);
    return ranked.slice(0, topN);
  }
}
