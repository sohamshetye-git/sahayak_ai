/**
 * Core Data Models and TypeScript Interfaces
 * Defines all data structures used across the application
 */

import { z } from 'zod';

// ============================================================================
// User Profile
// ============================================================================

export const UserProfileSchema = z.object({
  age: z.number().min(0).max(120).optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  occupation: z.string().optional(),
  state: z.string().optional(),
  district: z.string().optional(),
  income: z.number().min(0).optional(),
  casteCategory: z.enum(['general', 'obc', 'sc', 'st']).optional(),
  hasDisability: z.boolean().optional(),
  residenceType: z.enum(['Urban', 'Rural']).optional(),
  targetCategory: z.string().optional(), // Intent: what category user is asking for
  completeness: z.number().min(0).max(100).default(0),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;

// ============================================================================
// Scheme and Eligibility
// ============================================================================

export const EligibilityCriteriaSchema = z.object({
  ageMin: z.number().min(0).optional(),
  ageMax: z.number().max(120).optional(),
  gender: z.union([z.string(), z.array(z.string())]).optional(),
  incomeMax: z.number().min(0).optional(),
  caste: z.union([z.string(), z.array(z.string())]).optional(),
  occupation: z.union([z.string(), z.array(z.string())]).optional(),
  disability: z.boolean().optional(),
});

export type EligibilityCriteria = z.infer<typeof EligibilityCriteriaSchema>;

export const SchemeSchema = z.object({
  schemeId: z.string(),
  name: z.string(),
  nameHi: z.string().optional(),
  description: z.string(),
  descriptionHi: z.string().optional(),
  category: z.string(),
  state: z.string().optional(),
  eligibility: EligibilityCriteriaSchema,
  benefit: z.object({
    amount: z.number().optional(),
    type: z.string(),
  }),
  applicationUrl: z.string().optional(),
});

export type Scheme = z.infer<typeof SchemeSchema>;

export interface EligibilityResult {
  scheme: Scheme;
  isEligible: boolean;
  matchedCriteria: string[];
  missingCriteria: string[];
  confidenceScore: number;
}

export interface RankedScheme {
  scheme: Scheme;
  relevanceScore: number;
  rankingFactors: RankingFactor[];
}

export interface RankingFactor {
  factor: string;
  weight: number;
  score: number;
}

// ============================================================================
// Chat Session and Messages
// ============================================================================

export const MessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
  timestamp: z.number(),
  metadata: z
    .object({
      voiceInput: z.boolean().optional(),
      confidence: z.number().optional(),
    })
    .optional(),
});

export type Message = z.infer<typeof MessageSchema>;

export const ChatSessionSchema = z.object({
  sessionId: z.string().uuid(),
  userId: z.string(),
  createdAt: z.number(),
  updatedAt: z.number(),
  language: z.enum(['hi', 'en']),
  messages: z.array(MessageSchema),
  userProfile: UserProfileSchema.partial(),
  stage: z.enum(['greeting', 'providing_info', 'collecting_profile', 'profile_complete', 'recommendation_ready', 'post_recommendation']),
  metadata: z.object({
    primaryIntent: z.string().optional(), // FIX 2: Lock the first intent (e.g., 'Health')
  }).optional(),
  ttl: z.number(),
});

export type ChatSession = z.infer<typeof ChatSessionSchema>;

export type ConversationStage = 'greeting' | 'providing_info' | 'collecting_profile' | 'profile_complete' | 'recommendation_ready' | 'post_recommendation';

export interface ChatResponse {
  sessionId: string;
  response: string;
  userProfile?: Partial<UserProfile>;
  suggestedActions?: SuggestedAction[];
  timestamp: number;
}

export interface SuggestedAction {
  type: 'check_eligibility' | 'view_scheme' | 'find_center';
  label: string;
  data?: any;
}

// ============================================================================
// Application and Workflow
// ============================================================================

export const ApplicationSchema = z.object({
  applicationId: z.string().uuid(),
  userId: z.string(),
  schemeId: z.string(),
  schemeName: z.string(),
  status: z.enum(['draft', 'in_progress', 'submitted', 'approved', 'rejected']),
  progress: z.number().min(0).max(100),
  currentStep: z.number().min(1),
  totalSteps: z.number().min(1),
  completedSteps: z.array(z.string()),
  submittedAt: z.number().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
  ttl: z.number(),
});

export type Application = z.infer<typeof ApplicationSchema>;

export interface ApplicationWorkflowStep {
  stepNumber: number;
  title: string;
  titleHi?: string;
  description: string;
  descriptionHi?: string;
  requiredDocuments: string[];
  estimatedTimeMinutes: number;
}

export interface ApplicationWorkflow {
  schemeId: string;
  steps: ApplicationWorkflowStep[];
}

// ============================================================================
// Service Center
// ============================================================================

export const ServiceCenterSchema = z.object({
  centerId: z.number(),
  name: z.string(),
  nameHi: z.string().optional(),
  address: z.string(),
  addressHi: z.string().optional(),
  district: z.string(),
  state: z.string(),
  pincode: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  location: z
    .object({
      latitude: z.number(),
      longitude: z.number(),
    })
    .optional(),
  operatingHours: z.record(z.string(), z.object({ open: z.string(), close: z.string() })).optional(),
  servicesOffered: z.array(z.string()).optional(),
  distance: z.number().optional(), // Calculated field
});

export type ServiceCenter = z.infer<typeof ServiceCenterSchema>;

// ============================================================================
// AI Provider Interfaces
// ============================================================================

export interface AIRequest {
  prompt: string;
  context: Message[];
  language: 'hi' | 'en';
  systemPrompt?: string;
}

export interface AIResponse {
  text: string;
  confidence: number;
  tokensUsed: number;
}

export interface AIProvider {
  generateResponse(request: AIRequest): Promise<AIResponse>;
  extractStructuredData(text: string, schema: z.ZodSchema): Promise<Record<string, unknown>>;
  isAvailable(): Promise<boolean>;
  getName(): string;
  buildSystemPrompt(language: 'hi' | 'en'): string;
}

export interface AIProviderConfig {
  primary: {
    type: 'bedrock' | 'gemini' | 'openai' | 'groq' | 'sarvam' | 'router';
    model: string;
    region?: string;
    apiKey?: string;
  };
  fallback?: {
    type: 'bedrock' | 'gemini' | 'openai' | 'groq' | 'sarvam';
    model: string;
    region?: string;
    apiKey?: string;
  };
  tertiary?: {
    type: 'bedrock' | 'gemini' | 'openai' | 'groq' | 'sarvam';
    model: string;
    region?: string;
    apiKey?: string;
  };
  quaternary?: {
    type: 'bedrock' | 'gemini' | 'openai' | 'groq' | 'sarvam';
    model: string;
    region?: string;
    apiKey?: string;
  };
  retryAttempts: number;
  timeoutMs: number;
}

// ============================================================================
// Voice Provider Interfaces
// ============================================================================

export interface VoiceProviderConfig {
  type: 'web-speech' | 'aws';
  transcribeLanguageCode?: string;
  pollyVoiceId?: string;
}

// ============================================================================
// API Request/Response Types
// ============================================================================

export interface ChatRequest {
  sessionId?: string;
  message: string;
  language: 'hi' | 'en';
  voiceInput?: boolean;
}

export interface EligibilityCheckRequest {
  userProfile: UserProfile;
  language?: 'hi' | 'en';
}

export interface EligibilityCheckResponse {
  eligibleSchemes: RankedScheme[];
  totalSchemes: number;
  evaluationTime: number;
}

export interface SchemesQueryParams {
  category?: string;
  state?: string;
  beneficiary?: string;
  search?: string;
  page?: number;
  limit?: number;
  language?: 'hi' | 'en';
}

export interface SchemesResponse {
  schemes: Scheme[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ServiceCentersQueryParams {
  district: string;
  state: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  language?: 'hi' | 'en';
}

export interface ServiceCentersResponse {
  serviceCenters: ServiceCenter[];
  total: number;
}

export interface ApplicationRequest {
  applicationId?: string;
  userId: string;
  schemeId: string;
  status?: 'draft' | 'in_progress' | 'submitted';
  currentStep?: number;
  completedSteps?: string[];
}

export interface ApplicationResponse {
  applicationId: string;
  status: string;
  progress: number;
  createdAt: number;
  updatedAt: number;
}

// ============================================================================
// Error Types
// ============================================================================

export class AIProviderError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = 'AIProviderError';
  }
}

export class VoiceProviderError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = 'VoiceProviderError';
  }
}

export class DatabaseError extends Error {
  constructor(message: string, public cause?: Error) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class ValidationError extends Error {
  constructor(message: string, public errors?: any[]) {
    super(message);
    this.name = 'ValidationError';
  }
}

export interface ErrorResponse {
  error: {
    code: string;
    message: string;
    userMessage?: string;
    details?: string;
    timestamp: number;
    requestId?: string;
  };
}

// ============================================================================
// Voice Provider
// ============================================================================

export interface VoiceRequest {
  text?: string; // For text-to-speech
  audio?: Buffer | Blob; // For speech-to-text
  language: 'hi' | 'en';
  voiceId?: string;
}

export interface VoiceResponse {
  text?: string; // Transcribed text from speech-to-text
  audio?: Buffer | Blob; // Generated audio from text-to-speech
  confidence?: number;
  duration?: number;
}

export interface VoiceProvider {
  /**
   * Convert speech to text
   */
  speechToText(audio: Buffer | Blob, language: 'hi' | 'en'): Promise<string>;

  /**
   * Convert text to speech
   */
  textToSpeech(text: string, language: 'hi' | 'en', voiceId?: string): Promise<Buffer | Blob>;

  /**
   * Get supported languages
   */
  getSupportedLanguages(): string[];

  /**
   * Check if provider is available
   */
  isAvailable(): Promise<boolean>;

  /**
   * Get provider name
   */
  getName(): string;
}
