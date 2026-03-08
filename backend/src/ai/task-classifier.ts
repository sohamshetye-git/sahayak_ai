/**
 * Task Classifier
 * Determines which AI model is best suited for a given task
 * 
 * ROUTING RULES:
 * 1. Eligibility Conversation → Gemini (best instruction-following)
 * 2. Scheme Recommendation → Gemini (strong reasoning)
 * 3. Profile Data Extraction → Sarvam (fast, cost-effective)
 * 4. Fallback → Groq (when Gemini fails)
 */

export enum TaskType {
  CONVERSATION = 'conversation',     // Eligibility conversation, guided questioning
  RECOMMENDATION = 'recommendation', // Scheme recommendations based on profile
  EXTRACTION = 'extraction',         // Profile data extraction (JSON output)
  GENERAL = 'general',               // General conversation
}

export enum ModelType {
  GEMINI = 'gemini',                 // Best for conversation & recommendations
  OPENAI = 'openai',                 // Secondary fallback (before Groq)
  SARVAM = 'sarvam',                 // Best for extraction & Indian languages
  GROQ = 'groq',                     // Tertiary fallback
}

export interface TaskClassification {
  taskType: TaskType;
  recommendedModel: ModelType;
  confidence: number;
  reasoning: string;
}

export class TaskClassifier {
  /**
   * Classify task based on message content and context
   */
  static classify(
    message: string,
    language: 'hi' | 'en',
    context: {
      hasProfile?: boolean;
      profileCompleteness?: number;
      messageCount?: number;
    } = {}
  ): TaskClassification {
    const lowerMessage = message.toLowerCase();
    const completeness = context.profileCompleteness || 0;
    
    // RULE 1: Scheme Recommendation (when profile is complete enough)
    if (this.isRecommendationTask(lowerMessage, completeness)) {
      return {
        taskType: TaskType.RECOMMENDATION,
        recommendedModel: ModelType.GEMINI,
        confidence: 0.95,
        reasoning: 'Scheme recommendation requires strong reasoning and contextual understanding',
      };
    }

    // RULE 2: Profile Data Extraction (early conversation, collecting data)
    if (this.isExtractionTask(lowerMessage, context)) {
      return {
        taskType: TaskType.EXTRACTION,
        recommendedModel: ModelType.SARVAM,
        confidence: 0.9,
        reasoning: 'Profile extraction - fast and cost-effective with Sarvam',
      };
    }

    // RULE 3: Eligibility Conversation (guided questioning)
    if (this.isConversationTask(lowerMessage, completeness)) {
      return {
        taskType: TaskType.CONVERSATION,
        recommendedModel: ModelType.GEMINI,
        confidence: 0.9,
        reasoning: 'Eligibility conversation requires instruction-following and guided questioning',
      };
    }

    // Default: General conversation
    return {
      taskType: TaskType.GENERAL,
      recommendedModel: ModelType.GEMINI,
      confidence: 0.7,
      reasoning: 'General conversation - Gemini for quality responses',
    };
  }

  /**
   * Check if task is scheme recommendation
   * Triggered when profile is sufficiently complete
   */
  private static isRecommendationTask(message: string, completeness: number): boolean {
    // Keywords indicating user wants recommendations
    const recommendationKeywords = [
      'eligible', 'eligibility', 'qualify', 'recommend', 'suggest',
      'which scheme', 'what scheme', 'best scheme', 'suitable scheme',
      'show me', 'find scheme', 'schemes for me',
      'पात्र', 'योजना', 'सिफारिश', 'उपयुक्त', 'कौन सी योजना',
    ];

    const hasRecommendationKeyword = recommendationKeywords.some(keyword => 
      message.includes(keyword)
    );

    // Profile must be at least 60% complete for recommendations
    const profileSufficient = completeness >= 60;

    return hasRecommendationKeyword && profileSufficient;
  }

  /**
   * Check if task is profile data extraction
   * Triggered when user provides personal information
   */
  private static isExtractionTask(message: string, context: any): boolean {
    // Patterns indicating user is providing personal data
    const extractionPatterns = [
      /\b(i am|i'm|my|मैं|मेरा)\b/i,
      /\b(age|years old|साल|उम्र)\b/i,
      /\b(male|female|gender|पुरुष|महिला|लिंग)\b/i,
      /\b(from|live in|रहता|रहती|से)\b/i,
      /\b(work as|occupation|job|व्यवसाय|काम)\b/i,
      /\b(income|earn|salary|आय|कमाई)\b/i,
      /\b(category|caste|श्रेणी|जाति)\b/i,
    ];

    const hasExtractionPattern = extractionPatterns.some(pattern => 
      pattern.test(message)
    );

    // Early in conversation (< 10 messages) and profile incomplete
    const isEarlyConversation = (context.messageCount || 0) < 10;
    const profileIncomplete = (context.profileCompleteness || 0) < 80;

    return hasExtractionPattern && isEarlyConversation && profileIncomplete;
  }

  /**
   * Check if task is eligibility conversation
   * Multi-step guided questioning
   */
  private static isConversationTask(message: string, completeness: number): boolean {
    // Greetings and conversation starters
    const conversationPatterns = [
      /^(hi|hello|hey|namaste|नमस्ते)/i,
      /\b(help|assist|guide|मदद|सहायता)\b/i,
      /\b(tell me|explain|बताओ|समझाओ)\b/i,
      /\b(how|what|why|कैसे|क्या|क्यों)\b/i,
    ];

    const isConversational = conversationPatterns.some(pattern => 
      pattern.test(message)
    );

    // Profile is incomplete, need to collect more data
    const needsMoreData = completeness < 60;

    return isConversational || needsMoreData;
  }

  /**
   * Get model priority list based on task type
   * FALLBACK POLICY: Gemini → OpenAI → Groq → Sarvam
   */
  static getModelPriority(taskType: TaskType): ModelType[] {
    switch (taskType) {
      case TaskType.RECOMMENDATION:
        // Scheme recommendation: Gemini (reasoning) → OpenAI (secondary) → Groq (fallback)
        return [ModelType.GEMINI, ModelType.OPENAI, ModelType.GROQ, ModelType.SARVAM];
      
      case TaskType.EXTRACTION:
        // Profile extraction: Sarvam (fast) → Gemini (accurate) → OpenAI → Groq (fallback)
        return [ModelType.SARVAM, ModelType.GEMINI, ModelType.OPENAI, ModelType.GROQ];
      
      case TaskType.CONVERSATION:
        // Eligibility conversation: Gemini (instruction-following) → OpenAI (secondary) → Groq (fallback)
        return [ModelType.GEMINI, ModelType.OPENAI, ModelType.GROQ, ModelType.SARVAM];
      
      case TaskType.GENERAL:
      default:
        // General: Gemini (quality) → OpenAI (secondary) → Groq (fallback) → Sarvam
        return [ModelType.GEMINI, ModelType.OPENAI, ModelType.GROQ, ModelType.SARVAM];
    }
  }

  /**
   * Check if profile is complete enough for recommendations
   */
  static isProfileComplete(profile: any): boolean {
    const requiredFields = ['age', 'gender', 'state', 'income', 'occupation'];
    const filledFields = requiredFields.filter(field => 
      profile[field] !== undefined && profile[field] !== null
    );
    
    // At least 60% of required fields must be filled
    return (filledFields.length / requiredFields.length) >= 0.6;
  }

  /**
   * Get missing required fields
   */
  static getMissingFields(profile: any): string[] {
    const requiredFields = ['age', 'gender', 'state', 'income', 'occupation'];
    return requiredFields.filter(field => 
      profile[field] === undefined || profile[field] === null
    );
  }
}
