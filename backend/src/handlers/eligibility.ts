/**
 * Eligibility Handler
 * Lambda function for checking scheme eligibility
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { EligibilityEngine } from '../core/eligibility-engine';
import { RankingEngine } from '../core/ranking-engine';
import { EligibilityCheckRequest, EligibilityCheckResponse, Scheme } from '../types';

// Initialize engines
const eligibilityEngine = new EligibilityEngine();
const rankingEngine = new RankingEngine();

// Mock schemes data (in production, load from database)
const mockSchemes: Scheme[] = [
  {
    schemeId: 'PM-KISAN',
    name: 'PM-Kisan Samman Nidhi',
    nameHi: 'पीएम-किसान सम्मान निधि',
    description: 'Income support for farmers',
    descriptionHi: 'किसानों के लिए आय सहायता',
    category: 'Agriculture',
    state: 'All India',
    eligibility: {
      ageMin: 18,
      ageMax: 120,
      incomeMax: 200000,
      occupation: 'farmer',
    },
    benefit: { amount: 6000, type: 'Annual Cash Transfer' },
    applicationUrl: 'https://pmkisan.gov.in',
  },
  {
    schemeId: 'NSP',
    name: 'National Scholarship Portal',
    nameHi: 'राष्ट्रीय छात्रवृत्ति पोर्टल',
    description: 'Scholarships for students',
    descriptionHi: 'छात्रों के लिए छात्रवृत्ति',
    category: 'Education',
    state: 'All India',
    eligibility: {
      ageMin: 16,
      ageMax: 25,
      incomeMax: 250000,
      occupation: 'student',
      caste: ['sc', 'st', 'obc'],
    },
    benefit: { amount: 50000, type: 'Annual Scholarship' },
    applicationUrl: 'https://scholarships.gov.in',
  },
  {
    schemeId: 'PMAY-G',
    name: 'Pradhan Mantri Awas Yojana - Gramin',
    nameHi: 'प्रधानमंत्री आवास योजना - ग्रामीण',
    description: 'Housing for rural poor',
    descriptionHi: 'ग्रामीण गरीबों के लिए आवास',
    category: 'Housing',
    state: 'All India',
    eligibility: {
      ageMin: 18,
      ageMax: 120,
      incomeMax: 300000,
    },
    benefit: { amount: 120000, type: 'Housing Grant' },
    applicationUrl: 'https://pmayg.nic.in',
  },
];

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const startTime = Date.now();

    // Parse request body
    const body: EligibilityCheckRequest = JSON.parse(event.body || '{}');
    const { userProfile, language } = body;

    // Validate user profile
    if (!userProfile) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Missing required field: userProfile',
            timestamp: Date.now(),
          },
        }),
      };
    }

    // Evaluate eligibility
    const eligibilityResults = await eligibilityEngine.evaluateEligibility(
      userProfile,
      mockSchemes
    );

    // Filter eligible schemes
    const eligibleSchemes = eligibilityResults
      .filter((r) => r.isEligible)
      .map((r) => r.scheme);

    // Rank eligible schemes
    const rankedSchemes = rankingEngine.rankSchemes(eligibleSchemes, userProfile);

    const evaluationTime = Date.now() - startTime;

    const response: EligibilityCheckResponse = {
      eligibleSchemes: rankedSchemes,
      totalSchemes: eligibleSchemes.length,
      evaluationTime,
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error('Eligibility handler error:', error);

    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to check eligibility',
          details: error.message,
          timestamp: Date.now(),
        },
      }),
    };
  }
}
