/**
 * Chat Handler
 * Lambda function for processing chat messages with intelligent eligibility matching
 */

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ConversationOrchestrator } from '../core/conversation-orchestrator';
import { EligibilityEngine } from '../core/eligibility-engine';
import { RankingEngine } from '../core/ranking-engine';
import { createAIProviderFromEnv } from '../ai/provider-factory';
import { ChatRequest, ChatResponse, Scheme, UserProfile } from '../types';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

// Lazy initialization of AI provider, orchestrator, and engines
let aiProvider: any = null;
let orchestrator: any = null;
let eligibilityEngine: EligibilityEngine | null = null;
let rankingEngine: RankingEngine | null = null;
let schemesData: Scheme[] | null = null;

/**
 * Clean AI response by removing thinking tags and markdown formatting ONLY
 * DO NOT remove content, lists, or scheme names - eligibility engine handles that
 */
function cleanAIResponse(text: string): string {
  if (!text) return text;
  
  let cleaned = text;
  
  // Remove <think> tags and their content
  cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/gi, '');
  cleaned = cleaned.replace(/<think>/gi, '');
  cleaned = cleaned.replace(/<\/think>/gi, '');
  
  // Remove markdown bold/italic (but keep the text)
  cleaned = cleaned.replace(/\*\*\*/g, '');
  cleaned = cleaned.replace(/\*\*/g, '');
  cleaned = cleaned.replace(/\*/g, '');
  
  // Remove markdown headers (but keep the text)
  cleaned = cleaned.replace(/^#{1,6}\s+/gm, '');
  
  // Remove markdown code blocks
  cleaned = cleaned.replace(/```[\s\S]*?```/g, '');
  cleaned = cleaned.replace(/`/g, '');
  
  // Remove excessive newlines (keep content readable)
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  
  // Trim whitespace
  cleaned = cleaned.trim();
  
  // Return cleaned response as-is
  // DO NOT truncate, DO NOT filter content
  // Eligibility engine will inject schemes when needed
  return cleaned;
}

/**
 * Remove scheme names from AI response to enforce architecture
 * AI must NEVER recommend schemes - only rule engine can
 */
function removeSchemeNamesFromResponse(text: string): string {
  if (!text) return text;
  
  // FIX 4: Only block if AI is actually listing scheme names, not asking questions
  const lowerText = text.toLowerCase();
  
  // Check if this is a question (contains ? or question words)
  const isQuestion = text.includes('?') || 
                    /\b(what|how|which|when|where|who|क्या|कैसे|कौन|कब|कहां)\b/i.test(text);
  
  // If it's a question, don't block it
  if (isQuestion) {
    console.log('[ARCHITECTURE_GUARD] Detected question - allowing through');
    return text;
  }
  
  const schemeNames = [
    'PM-KISAN', 'PM KISAN', 'Pradhan Mantri Kisan', 'PMKISAN',
    'Ayushman Bharat', 'PMJAY', 'PM-JAY', 'AB-PMJAY',
    'Atal Pension', 'APY',
    'Ujjwala', 'PMUY',
    'PM Awas', 'PMAY',
    'MGNREGA', 'NREGA',
    'Beti Bachao Beti Padhao', 'BBBP',
    'Skill India',
    'Jan Dhan', 'PMJDY',
    'Fasal Bima', 'PMFBY',
    'Kisan Maandhan',
    'Street Vendor', 'SVANidhi',
    'Matru Vandana', 'PMMVY',
    'Kanyashree', 'Mukhyamantri',
  ];
  
  // Check if response contains scheme recommendations with actual scheme names
  const hasSchemeNames = schemeNames.some(name => 
    lowerText.includes(name.toLowerCase())
  );
  
  if (hasSchemeNames) {
    console.log('[ARCHITECTURE_VIOLATION] AI attempted to recommend specific schemes - blocking');
    // Replace entire response with waiting message
    return 'Let me check your eligibility first...';
  }
  
  // Check for recommendation phrases ONLY if they appear with scheme context
  const recommendationPhrases = [
    'here are the schemes',
    'eligible for the following',
    'you can apply for these',
    'recommended schemes are',
    'following schemes match',
  ];
  
  const hasRecommendation = recommendationPhrases.some(phrase =>
    lowerText.includes(phrase)
  );
  
  if (hasRecommendation) {
    console.log('[ARCHITECTURE_VIOLATION] AI attempted to make scheme recommendations - blocking');
    return 'Let me check your eligibility first...';
  }
  
  return text;
}


function getOrchestrator() {
  if (!orchestrator) {
    aiProvider = createAIProviderFromEnv();
    orchestrator = new ConversationOrchestrator(aiProvider);
  }
  return orchestrator;
}

function getEligibilityEngine() {
  if (!eligibilityEngine) {
    eligibilityEngine = new EligibilityEngine();
  }
  return eligibilityEngine;
}

function getRankingEngine() {
  if (!rankingEngine) {
    rankingEngine = new RankingEngine();
  }
  return rankingEngine;
}

/**
 * Load schemes data from JSON file
 */
function loadSchemesData(): Scheme[] {
  if (schemesData) {
    return schemesData;
  }

  try {
    const dataPath = path.join(process.cwd(), 'data', 'schemes.json');
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const jsonData = JSON.parse(rawData);
    
    // Transform JSON data to Scheme format
    const transformedSchemes: Scheme[] = jsonData.schemes.map((s: any) => ({
      schemeId: s.scheme_id,
      name: s.scheme_name,
      nameHi: s.scheme_name_hi || s.scheme_name,
      description: s.short_description || s.detailed_description,
      descriptionHi: s.short_description_hi || s.short_description,
      category: s.category,
      state: normalizeState(s.geographic_criteria),
      eligibility: {
        ageMin: parseAgeMin(s.age_criteria),
        ageMax: parseAgeMax(s.age_criteria),
        gender: parseGender(s.gender_criteria),
        incomeMax: parseIncomeFromCriteria(s.income_criteria),
        caste: parseCaste(s.category_criteria),
        occupation: parseOccupation(s.occupation_criteria),
        disability: undefined,
      },
      benefit: {
        amount: parseFinancialAssistance(s.financial_assistance),
        type: s.benefit_type || 'Cash',
      },
      applicationUrl: s.online_apply_link || s.official_website,
    }));

    schemesData = transformedSchemes;
    console.log(`[SCHEMES] Loaded ${schemesData.length} schemes from data/schemes.json`);
    return schemesData;
  } catch (error: any) {
    console.error('[SCHEMES] Failed to load schemes data:', error);
    return [];
  }
}

/**
 * Normalize state name for consistent matching
 */
function normalizeState(geographicCriteria: string): string | undefined {
  if (!geographicCriteria || geographicCriteria === 'All India') {
    return undefined; // All India schemes
  }
  
  // Normalize state names
  const stateMap: { [key: string]: string } = {
    'maharashtra': 'Maharashtra',
    'karnataka': 'Karnataka',
    'tamil nadu': 'Tamil Nadu',
    'tamilnadu': 'Tamil Nadu',
    'delhi': 'Delhi',
    'uttar pradesh': 'Uttar Pradesh',
    'up': 'Uttar Pradesh',
    'gujarat': 'Gujarat',
    'rajasthan': 'Rajasthan',
    'west bengal': 'West Bengal',
    'madhya pradesh': 'Madhya Pradesh',
    'mp': 'Madhya Pradesh',
    'bihar': 'Bihar',
    'punjab': 'Punjab',
    'haryana': 'Haryana',
    'andhra pradesh': 'Andhra Pradesh',
    'telangana': 'Telangana',
    'kerala': 'Kerala',
    'odisha': 'Odisha',
    'orissa': 'Odisha',
    'assam': 'Assam',
    'jharkhand': 'Jharkhand',
    'chhattisgarh': 'Chhattisgarh',
    'uttarakhand': 'Uttarakhand',
    'himachal pradesh': 'Himachal Pradesh',
    'goa': 'Goa',
  };
  
  const normalized = geographicCriteria.toLowerCase().trim();
  return stateMap[normalized] || geographicCriteria;
}

/**
 * Parse minimum age from criteria string
 */
function parseAgeMin(criteria: string): number | undefined {
  if (!criteria || criteria.includes('All') || criteria.includes('No')) {
    return undefined;
  }
  
  // Extract minimum age
  const patterns = [
    /(\d+)\s*years?\s+and\s+above/i,
    /above\s+(\d+)/i,
    /minimum\s+(\d+)/i,
    /(\d+)\s*\+/,
    /(\d+)\s*to\s+\d+/i,
  ];
  
  for (const pattern of patterns) {
    const match = criteria.match(pattern);
    if (match) {
      return parseInt(match[1]);
    }
  }
  
  return undefined;
}

/**
 * Parse maximum age from criteria string
 */
function parseAgeMax(criteria: string): number | undefined {
  if (!criteria || criteria.includes('All') || criteria.includes('No')) {
    return undefined;
  }
  
  // Extract maximum age
  const patterns = [
    /to\s+(\d+)\s*years?/i,
    /below\s+(\d+)/i,
    /maximum\s+(\d+)/i,
    /up\s+to\s+(\d+)/i,
    /\d+\s+to\s+(\d+)/i,
  ];
  
  for (const pattern of patterns) {
    const match = criteria.match(pattern);
    if (match) {
      return parseInt(match[1]);
    }
  }
  
  return undefined;
}

/**
 * Parse gender from criteria
 */
function parseGender(criteria: string): string | undefined {
  if (!criteria || criteria === 'All') {
    return undefined;
  }
  
  const lower = criteria.toLowerCase();
  if (lower.includes('female') || lower.includes('women') || lower.includes('girl')) {
    return 'female';
  }
  if (lower.includes('male') && !lower.includes('female')) {
    return 'male';
  }
  
  return undefined;
}

/**
 * Parse caste category from criteria
 */
function parseCaste(criteria: string): string | string[] | undefined {
  if (!criteria || criteria === 'All') {
    return undefined;
  }
  
  const categories: string[] = [];
  const lower = criteria.toLowerCase();
  
  if (lower.includes('sc')) categories.push('sc');
  if (lower.includes('st')) categories.push('st');
  if (lower.includes('obc')) categories.push('obc');
  if (lower.includes('general')) categories.push('general');
  
  return categories.length > 0 ? categories : undefined;
}

/**
 * Parse occupation from criteria
 */
function parseOccupation(criteria: string): string[] | undefined {
  if (!criteria || criteria === 'All') {
    return undefined;
  }
  
  const occupations: string[] = [];
  const lower = criteria.toLowerCase();
  
  // Map common occupation terms
  if (lower.includes('farmer') || lower.includes('agriculture') || lower.includes('landholding')) {
    occupations.push('farmer');
  }
  if (lower.includes('student')) {
    occupations.push('student');
  }
  if (lower.includes('unemployed') || lower.includes('jobless')) {
    occupations.push('unemployed');
  }
  if (lower.includes('self-employed') || lower.includes('business')) {
    occupations.push('self-employed');
  }
  if (lower.includes('labor') || lower.includes('labour') || lower.includes('worker')) {
    occupations.push('daily wage');
  }
  
  return occupations.length > 0 ? occupations : undefined;
}

/**
 * Parse income from criteria string
 */
function parseIncomeFromCriteria(criteria: string): number | undefined {
  if (!criteria || criteria.includes('All') || criteria.includes('No')) {
    return undefined;
  }
  
  // Extract numbers from criteria
  const patterns = [
    /₹\s*(\d+(?:,\d+)*)\s*(lakh|lakhs)?/i,
    /(\d+(?:,\d+)*)\s*(lakh|lakhs)/i,
    /(\d+(?:,\d+)*)\s*rupees?/i,
  ];
  
  for (const pattern of patterns) {
    const match = criteria.match(pattern);
    if (match) {
      const amount = parseInt(match[1].replace(/,/g, ''));
      const unit = match[2]?.toLowerCase();
      
      if (unit?.includes('lakh')) {
        return amount * 100000;
      }
      return amount;
    }
  }
  
  return undefined;
}

/**
 * Parse financial assistance amount
 */
function parseFinancialAssistance(assistance: string): number | undefined {
  if (!assistance) return undefined;
  
  const match = assistance.match(/₹?\s*(\d+(?:,\d+)*)/);
  if (match) {
    return parseInt(match[1].replace(/,/g, ''));
  }
  
  return undefined;
}

/**
 * Check if user profile is complete with all required fields
 */
function isProfileComplete(profile: Partial<UserProfile>): boolean {
  return !!(
    profile.age &&
    profile.state &&
    profile.occupation &&
    profile.income !== undefined
  );
}

// In-memory session storage (for MVP - use DynamoDB in production)
const sessions = new Map<string, any>();

// Rate limiting: Track requests per IP
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 10; // 10 requests per minute

/**
 * Check rate limit for IP address
 */
function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    // New window
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1 };
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX - record.count };
}

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    // Get client IP for rate limiting
    const clientIp = event.requestContext?.identity?.sourceIp || 
                     event.headers['x-forwarded-for'] || 
                     'unknown';

    // Check rate limit
    const rateLimit = checkRateLimit(clientIp);
    if (!rateLimit.allowed) {
      console.warn(`[RATE LIMIT] IP: ${clientIp} exceeded limit`);
      return {
        statusCode: 429,
        headers: { 
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': String(RATE_LIMIT_MAX),
          'X-RateLimit-Remaining': '0',
          'Retry-After': '60',
        },
        body: JSON.stringify({
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Too many requests. Please wait a minute and try again.',
            timestamp: Date.now(),
          },
        }),
      };
    }

    // Get orchestrator and engines
    const orch = getOrchestrator();
    const eligEngine = getEligibilityEngine();
    const rankEngine = getRankingEngine();
    
    // Parse request body
    const body: ChatRequest = JSON.parse(event.body || '{}');
    const { sessionId: requestSessionId, message, language, voiceInput } = body;

    // Validate required fields
    if (!message || !language) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Missing required fields: message, language',
            timestamp: Date.now(),
          },
        }),
      };
    }

    // Get or create session
    const sessionId = requestSessionId || uuidv4();
    let session = sessions.get(sessionId);

    if (!session) {
      session = {
        sessionId,
        userId: 'user-' + uuidv4(),
        language,
        messages: [],
        userProfile: { completeness: 0 },
        stage: 'greeting',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      sessions.set(sessionId, session);
    }

    // Process message with orchestrator
    console.log(`[CHAT] Processing message | Session: ${sessionId} | Stage: ${session.stage} | IP: ${clientIp}`);
    const response = await orch.processMessage(
      sessionId,
      message,
      language,
      session.messages,
      session.userProfile,
      session.stage
    );

    // Check profile and force stage transition if complete
    const profile = response.userProfile || session.userProfile;
    const missingFields = orch.identifyMissingInfo(profile);
    const hasRequiredFields = missingFields.length === 0;

    // FORCE stage to recommendation_ready if profile is 100% complete
    if (profile.completeness === 100 && hasRequiredFields) {
      response.stage = 'recommendation_ready';
      console.log('[STAGE] FORCED transition to recommendation_ready - profile 100% complete');
    }

    // Update session stage
    const previousStage = session.stage;
    session.stage = response.stage;

    console.log('[STAGE]', {
      previous: previousStage,
      current: response.stage,
      completeness: profile.completeness,
      hasRequiredFields,
      missingFields,
    });

    console.log('[PROFILE]', {
      age: profile.age,
      occupation: profile.occupation,
      state: profile.state,
      income: profile.income,
      completeness: profile.completeness,
    });

    // FIX 3: Intercept AI response BEFORE cleanAIResponse if stage is recommendation_ready
    // This prevents AI from "hallucinating" scheme names
    let cleanedResponse: string;
    
    // FIX 1: STRICT REQUIREMENT GATE - Never show "checking eligibility" unless profile is 100% complete
    if (response.stage === 'recommendation_ready' && hasRequiredFields && profile.completeness === 100) {
      console.log('[FIX 1] Profile 100% complete - forcing localized processing message');
      // Replace AI text IMMEDIATELY with localized message
      cleanedResponse = language === 'hi'
        ? 'धन्यवाद! मैं आपकी पात्रता की जांच कर रहा हूं...'
        : 'Thank you! I am checking your eligibility...';
    } else if (response.stage === 'recommendation_ready' && !hasRequiredFields) {
      // FIX 1: Profile incomplete but stage says ready - FORCE fallback to follow-up question
      console.log('[FIX 1] DEADLOCK DETECTED - stage is recommendation_ready but profile incomplete');
      console.log('[FIX 1] Missing fields:', missingFields);
      console.log('[FIX 1] Forcing fallback to generateFollowUpQuestion');
      
      // Generate contextual follow-up question for the missing field
      cleanedResponse = await orch.generateFollowUpQuestion(missingFields, language, profile);
      
      // If we have a name, personalize the question
      if (profile.name && cleanedResponse) {
        const greeting = language === 'hi' 
          ? `बढ़िया, ${profile.name}! `
          : `Great, ${profile.name}! `;
        
        // Add context based on what we know
        if (profile.occupation && missingFields.includes('income')) {
          const occupationContext = language === 'hi'
            ? `मैं देख रहा हूं कि आप ${profile.occupation} हैं। `
            : `I see you are a ${profile.occupation}. `;
          cleanedResponse = greeting + occupationContext + cleanedResponse;
        } else {
          cleanedResponse = greeting + cleanedResponse;
        }
      }
      
      // Force stage back to collecting_profile
      response.stage = 'collecting_profile';
      session.stage = 'collecting_profile';
      console.log('[FIX 1] Stage forced back to collecting_profile');
    } else {
      // Clean AI response - remove thinking tags and markdown
      cleanedResponse = cleanAIResponse(response.response);
      
      // Additional guard: Remove any scheme names AI might have generated
      cleanedResponse = removeSchemeNamesFromResponse(cleanedResponse);
    }

    // Prevent duplicate questions - check if AI is asking for already collected field
    if (cleanedResponse && response.stage !== 'recommendation_ready') {
      const lowerResponse = cleanedResponse.toLowerCase();
      const alreadyCollected: string[] = [];
      
      if (profile.age !== undefined && (lowerResponse.includes('age') || lowerResponse.includes('उम्र'))) {
        alreadyCollected.push('age');
      }
      if (profile.occupation && (lowerResponse.includes('occupation') || lowerResponse.includes('व्यवसाय'))) {
        alreadyCollected.push('occupation');
      }
      if (profile.state && (lowerResponse.includes('state') || lowerResponse.includes('राज्य'))) {
        alreadyCollected.push('state');
      }
      if (profile.income !== undefined && (lowerResponse.includes('income') || lowerResponse.includes('आय'))) {
        alreadyCollected.push('income');
      }
      
      // If AI is asking for already collected field, generate proper next question
      if (alreadyCollected.length > 0 && missingFields.length > 0) {
        console.log('[DUPLICATE PREVENTION] AI asked for collected field:', alreadyCollected, '- generating next question');
        cleanedResponse = await orch.generateFollowUpQuestion(missingFields, language, profile);
      }
    }

    let enhancedResponse = cleanedResponse;
    let matchedSchemes: any[] = [];

    // AUTOMATIC RECOMMENDATION - Check by actual field values using helper function
    // ALWAYS run eligibility engine when ALL required fields exist
    const profileComplete = isProfileComplete(profile);

    console.log('[ELIGIBILITY_CHECK]', {
      profileComplete,
      stage: response.stage,
      age: profile.age,
      occupation: profile.occupation,
      state: profile.state,
      income: profile.income,
      completeness: profile.completeness,
    });

    if (profileComplete) {
      console.log('[ELIGIBILITY_TRIGGERED] Profile complete - running rule engine');
      console.log('[PROFILE] Complete profile:', {
        age: profile.age,
        occupation: profile.occupation,
        state: profile.state,
        income: profile.income,
      });
      
      // Load schemes data
      const allSchemes = loadSchemesData();
      console.log(`[SCHEMES_LOADED] Loaded ${allSchemes.length} total schemes from data file`);
      
      if (allSchemes.length > 0) {
        // ALWAYS run eligibility engine
        console.log('[ELIGIBILITY_ENGINE] Running eligibility evaluation...');
        const eligibilityResults = await eligEngine.evaluateEligibility(profile as UserProfile, allSchemes);
        
        // Filter eligible schemes
        const eligibleSchemes = eligibilityResults
          .filter(r => r.isEligible)
          .map(r => r.scheme);
        
        console.log(`[ELIGIBLE_SCHEMES] Found ${eligibleSchemes.length} eligible schemes out of ${allSchemes.length} total`);
        
        if (eligibleSchemes.length > 0) {
          // ALWAYS run ranking engine
          console.log('[RANKING_ENGINE] Ranking eligible schemes...');
          const rankedSchemes = rankEngine.rankSchemes(eligibleSchemes, profile as UserProfile);
          console.log(`[RANKED_SCHEMES] Ranked ${rankedSchemes.length} schemes`);
          
          // Take top 3 schemes
          const topSchemes = rankedSchemes.slice(0, 3);
          console.log(`[TOP_SCHEMES] Selected top 3 schemes for recommendation`);
          
          // Format schemes for response
          matchedSchemes = topSchemes.map(rs => ({
            scheme_id: rs.scheme.schemeId,
            scheme_name: language === 'hi' ? rs.scheme.nameHi : rs.scheme.name,
            category: rs.scheme.category,
            financial_assistance: rs.scheme.benefit.amount ? `₹${rs.scheme.benefit.amount.toLocaleString('en-IN')}` : 'Variable',
            benefit_type: rs.scheme.benefit.type,
            short_description: language === 'hi' ? rs.scheme.descriptionHi : rs.scheme.description,
            matchPercentage: Math.round(rs.relevanceScore),
            eligibilityReason: formatEligibilityReason(rs, profile as UserProfile, language),
            geographic_criteria: rs.scheme.state || 'All India',
          }));
          
          console.log('[SCHEMES_FORMATTED] Formatted', matchedSchemes.length, 'schemes for response');
          
          // ALWAYS inject schemes into response with [SCHEME_DATA] block
          enhancedResponse = formatSchemeRecommendation(
            cleanedResponse,
            matchedSchemes,
            profile as UserProfile,
            language
          );
          
          console.log('[SCHEMES_INJECTED] Schemes injected with [SCHEME_DATA] block');
          console.log('[RESPONSE_LENGTH] Enhanced response length:', enhancedResponse.length);
        } else {
          // No eligible schemes found
          console.log('[NO_SCHEMES] 0 eligible schemes - showing no match message');
          enhancedResponse = language === 'hi'
            ? `माफ़ करें, आपकी वर्तमान प्रोफ़ाइल के आधार पर कोई योजना नहीं मिली।\n\nआपकी प्रोफ़ाइल:\n• उम्र: ${profile.age}\n• व्यवसाय: ${profile.occupation}\n• राज्य: ${profile.state}\n• आय: ₹${profile.income?.toLocaleString('en-IN')}\n\nकृपया अपनी जानकारी की जांच करें या अधिक विवरण प्रदान करें।`
            : `I'm sorry, no schemes matched your profile.\n\nYour Profile:\n• Age: ${profile.age}\n• Occupation: ${profile.occupation}\n• State: ${profile.state}\n• Income: ₹${profile.income?.toLocaleString('en-IN')}\n\nPlease check your information or provide more details.`;
        }
      } else {
        console.log('[ERROR] 0 schemes loaded from data file - check data/schemes.json exists and is valid');
        enhancedResponse = language === 'hi'
          ? 'माफ़ करें, योजना डेटा लोड करने में समस्या है। कृपया बाद में पुनः प्रयास करें।'
          : 'Sorry, there was an issue loading scheme data. Please try again later.';
      }
    } else {
      console.log('[ELIGIBILITY_SKIPPED] Profile incomplete - missing required fields');
    }

    // Update session
    session.messages.push(
      { role: 'user', content: message, timestamp: Date.now(), metadata: { voiceInput } },
      { role: 'assistant', content: enhancedResponse, timestamp: Date.now() }
    );
    session.userProfile = profile;
    session.updatedAt = Date.now();

    // Return enhanced response
    const finalResponse: ChatResponse = {
      sessionId,
      response: enhancedResponse,
      userProfile: profile,
      suggestedActions: response.suggestedActions,
      timestamp: Date.now(),
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'X-RateLimit-Limit': String(RATE_LIMIT_MAX),
        'X-RateLimit-Remaining': String(rateLimit.remaining),
        'X-Matched-Schemes': String(matchedSchemes.length),
      },
      body: JSON.stringify(finalResponse),
    };
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Chat handler error:', err);

    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to process chat message',
          details: err.message,
          timestamp: Date.now(),
        },
      }),
    };
  }
}

/**
 * Format eligibility reason in simple language
 */
function formatEligibilityReason(rankedScheme: any, profile: UserProfile, language: 'hi' | 'en'): string {
  const reasons: string[] = [];
  
  if (profile.occupation && rankedScheme.scheme.eligibility.occupation) {
    reasons.push(language === 'hi' ? `आपका व्यवसाय (${profile.occupation}) मेल खाता है` : `Your occupation (${profile.occupation}) matches`);
  }
  
  if (profile.state && rankedScheme.scheme.state) {
    reasons.push(language === 'hi' ? `आपका राज्य (${profile.state}) मेल खाता है` : `Your state (${profile.state}) matches`);
  }
  
  if (profile.age && rankedScheme.scheme.eligibility.ageMin && rankedScheme.scheme.eligibility.ageMax) {
    reasons.push(language === 'hi' ? `आपकी उम्र सीमा में है` : `Your age is within range`);
  }
  
  if (profile.income && rankedScheme.scheme.eligibility.incomeMax) {
    reasons.push(language === 'hi' ? `आपकी आय सीमा में है` : `Your income is within limit`);
  }
  
  if (reasons.length === 0) {
    return language === 'hi' ? 'आप इस योजना के लिए पात्र हैं' : 'You are eligible for this scheme';
  }
  
  return reasons.join(language === 'hi' ? ', ' : ', ');
}

/**
 * Format scheme recommendation in simple, structured language for rural users
 */
function formatSchemeRecommendation(
  aiResponse: string,
  schemes: any[],
  _profile: UserProfile,
  _language: 'hi' | 'en'
): string {
  if (schemes.length === 0) {
    return aiResponse;
  }
  
  // Create structured scheme data for frontend parsing
  const schemeData = JSON.stringify(schemes, null, 2);
  
  // Add scheme data in parseable format that frontend can detect
  const response = `${aiResponse}

[SCHEME_DATA]
${schemeData}
[/SCHEME_DATA]`;
  
  return response;
}
