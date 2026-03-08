/**
 * Structured Output Schemas
 * JSON schemas for enforcing structured responses from AI models
 */

import { z } from 'zod';

/**
 * Eligibility Result Schema
 */
export const EligibilityResultSchema = z.object({
  isEligible: z.boolean(),
  confidence: z.number().min(0).max(1),
  matchedCriteria: z.array(z.string()),
  missingCriteria: z.array(z.string()),
  reasoning: z.string(),
});

export type EligibilityResult = z.infer<typeof EligibilityResultSchema>;

/**
 * Scheme Recommendation Schema
 */
export const SchemeRecommendationSchema = z.object({
  schemeId: z.string(),
  schemeName: z.string(),
  matchPercentage: z.number().min(0).max(100),
  eligibilityReason: z.string(),
  benefits: z.array(z.string()),
  requiredDocuments: z.array(z.string()).optional(),
});

export type SchemeRecommendation = z.infer<typeof SchemeRecommendationSchema>;

/**
 * Scheme Recommendation List Schema
 */
export const SchemeRecommendationListSchema = z.object({
  recommendations: z.array(SchemeRecommendationSchema),
  totalEvaluated: z.number(),
  evaluationTime: z.number(),
  userProfileSummary: z.string().optional(),
});

export type SchemeRecommendationList = z.infer<typeof SchemeRecommendationListSchema>;

/**
 * Missing Criteria Question Schema
 */
export const MissingCriteriaQuestionSchema = z.object({
  field: z.enum(['age', 'gender', 'state', 'district', 'income', 'occupation', 'casteCategory', 'hasDisability']),
  question: z.string(),
  questionHi: z.string().optional(),
  importance: z.enum(['required', 'recommended', 'optional']),
  reasoning: z.string(),
});

export type MissingCriteriaQuestion = z.infer<typeof MissingCriteriaQuestionSchema>;

/**
 * Conversation Response Schema
 */
export const ConversationResponseSchema = z.object({
  message: z.string(),
  intent: z.enum(['greeting', 'data_collection', 'eligibility_check', 'scheme_recommendation', 'clarification', 'general']),
  nextAction: z.enum(['ask_question', 'check_eligibility', 'recommend_schemes', 'provide_info', 'end_conversation']).optional(),
  extractedData: z.record(z.unknown()).optional(),
});

export type ConversationResponse = z.infer<typeof ConversationResponseSchema>;

/**
 * Helper to enforce structured output from AI
 */
export class StructuredOutputEnforcer {
  /**
   * Generate prompt for structured output
   */
  static generatePrompt<T>(
    basePrompt: string,
    schema: z.ZodSchema<T>,
    schemaDescription: string
  ): string {
    return `${basePrompt}

IMPORTANT: You must respond with valid JSON matching this schema:
${schemaDescription}

Return ONLY the JSON object, no markdown formatting, no code blocks, no additional text.`;
  }

  /**
   * Parse and validate AI response against schema
   */
  static parse<T>(
    response: string,
    schema: z.ZodSchema<T>
  ): T {
    // Remove markdown code blocks if present
    let cleanedResponse = response
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    // Extract JSON object
    const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON object found in response');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return schema.parse(parsed);
  }

  /**
   * Retry with fallback if parsing fails
   */
  static async parseWithRetry<T>(
    response: string,
    schema: z.ZodSchema<T>,
    retryFn?: () => Promise<string>,
    maxRetries: number = 2
  ): Promise<T> {
    let attempt = 0;
    let lastError: Error | undefined;

    while (attempt < maxRetries) {
      try {
        return this.parse(response, schema);
      } catch (error) {
        lastError = error as Error;
        attempt++;

        if (attempt < maxRetries && retryFn) {
          console.warn(`[STRUCTURED OUTPUT] Parse failed (attempt ${attempt}), retrying...`);
          response = await retryFn();
        }
      }
    }

    throw new Error(
      `Failed to parse structured output after ${maxRetries} attempts. Last error: ${lastError?.message}`
    );
  }
}

/**
 * Schema descriptions for AI prompts
 */
export const SchemaDescriptions = {
  eligibilityResult: `{
  "isEligible": boolean,
  "confidence": number (0-1),
  "matchedCriteria": string[],
  "missingCriteria": string[],
  "reasoning": string
}`,

  schemeRecommendation: `{
  "schemeId": string,
  "schemeName": string,
  "matchPercentage": number (0-100),
  "eligibilityReason": string,
  "benefits": string[],
  "requiredDocuments": string[] (optional)
}`,

  schemeRecommendationList: `{
  "recommendations": SchemeRecommendation[],
  "totalEvaluated": number,
  "evaluationTime": number,
  "userProfileSummary": string (optional)
}`,

  missingCriteriaQuestion: `{
  "field": "age" | "gender" | "state" | "district" | "income" | "occupation" | "casteCategory" | "hasDisability",
  "question": string,
  "questionHi": string (optional),
  "importance": "required" | "recommended" | "optional",
  "reasoning": string
}`,

  conversationResponse: `{
  "message": string,
  "intent": "greeting" | "data_collection" | "eligibility_check" | "scheme_recommendation" | "clarification" | "general",
  "nextAction": "ask_question" | "check_eligibility" | "recommend_schemes" | "provide_info" | "end_conversation" (optional),
  "extractedData": object (optional)
}`,
};
