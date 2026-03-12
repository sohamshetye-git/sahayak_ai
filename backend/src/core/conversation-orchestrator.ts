/**
 * Conversation Orchestrator
 * Manages chat context, coordinates AI interactions, and extracts user profile data
 */

import { AIProvider, ChatResponse, Message, UserProfile, UserProfileSchema, ConversationStage } from '../types';
import { normalizeOccupation, normalizeState, normalizeGender, normalizeIncome, normalizeCasteCategory } from '../utils/normalize';

export class ConversationOrchestrator {
  constructor(private aiProvider: AIProvider) {}

  /**
   * Process user message and generate response
   */
  async processMessage(
    sessionId: string,
    userMessage: string,
    language: 'hi' | 'en',
    context: Message[] = [],
    userProfile: Partial<UserProfile> = {},
    currentStage: ConversationStage = 'greeting'
  ): Promise<ChatResponse & { stage: ConversationStage }> {
    // Add user message to context
    const newMessage: Message = {
      role: 'user',
      content: userMessage,
      timestamp: Date.now(),
    };

    const updatedContext = [...context.slice(-10), newMessage]; // Keep last 10 messages

    // Extract user profile data from conversation FIRST
    const extractedProfile = await this.extractUserProfile(userMessage, userProfile);

    // Extract intent (target category) from user message
    const targetCategory = this.extractIntentCategory(userMessage, extractedProfile);
    if (targetCategory) {
      extractedProfile.targetCategory = targetCategory;
      console.log('[INTENT] Extracted target category:', targetCategory);
    }

    // Determine conversation stage based on profile completeness
    const nextStage = this.determineConversationStage(extractedProfile, currentStage, userMessage);
    
    // Identify missing information
    const missingFields = this.identifyMissingInfo(extractedProfile);

    console.log('[STAGE TRANSITION]', {
      currentStage,
      nextStage,
      completeness: extractedProfile.completeness,
      missingFields,
    });

    // Build profile summary for AI context
    const profileSummary = this.buildProfileSummary(extractedProfile, language, missingFields);
    console.log('[PROFILE] Current profile summary for AI:', profileSummary);

    // Build stage-aware system prompt
    const stageContext = this.buildStageContext(nextStage, missingFields, language);
    
    // Build enhanced system prompt with profile context - safe fallback
    let enhancedSystemPrompt: string;
    if (typeof this.aiProvider.buildSystemPrompt === 'function') {
      const baseSystemPrompt = this.aiProvider.buildSystemPrompt(language);
      enhancedSystemPrompt = baseSystemPrompt + profileSummary + stageContext;
    } else {
      // Fallback system prompt if method doesn't exist
      enhancedSystemPrompt = this.getDefaultSystemPrompt(language) + profileSummary + stageContext;
      console.warn('[ORCHESTRATOR] AI provider missing buildSystemPrompt, using default');
    }

    // Generate AI response with profile context
    console.log('Calling AI provider...');
    const aiResponse = await this.aiProvider.generateResponse({
      prompt: userMessage,
      context: updatedContext,
      language,
      systemPrompt: enhancedSystemPrompt,
    });
    
    console.log('AI Response received:', aiResponse);
    
    if (!aiResponse || !aiResponse.text) {
      throw new Error('Invalid AI response: response or text is undefined');
    }

    // Determine suggested actions
    const suggestedActions = this.determineSuggestedActions(extractedProfile, missingFields, nextStage);

    return {
      sessionId,
      response: aiResponse.text,
      userProfile: extractedProfile,
      suggestedActions,
      timestamp: Date.now(),
      stage: nextStage,
    };
  }

  /**
   * Extract user profile attributes from conversation using AI
   */
  async extractUserProfile(
    userMessage: string,
    currentProfile: Partial<UserProfile>
  ): Promise<Partial<UserProfile>> {
    const updatedProfile = { ...currentProfile };
    const message = userMessage.toLowerCase();

    // Try AI-based extraction first for better accuracy
    try {
      const extractionSchema = UserProfileSchema.partial();
      const extracted = await this.aiProvider.extractStructuredData(
        `Extract user profile information from this message: "${userMessage}"\n\nCurrent profile: ${JSON.stringify(currentProfile)}`,
        extractionSchema
      );
      
      // Merge extracted data with current profile
      if (extracted) {
        Object.assign(updatedProfile, extracted);
      }
    } catch (error: unknown) {
      const err = error as Error;
      console.log('[PROFILE] AI extraction failed, using pattern matching:', err.message);
    }

    // Fallback to pattern matching for reliability
    
    // Extract age - multiple patterns with aggressive Hinglish support
    if (!updatedProfile.age) {
      const agePatterns = [
        /(?:my\s+)?age\s+is\s+(\d+)/i,           // "my age is 43" or "age is 43"
        /(?:i\s+am|i'm)\s+(\d+)\s*(?:years?|yr|yrs)?/i,  // "I am 43" or "I'm 43 years"
        /(\d+)\s*(?:years?|साल|वर्ष|yr|yrs|saal|umr)\s*(?:old|ka|ki)?/i, // "43 years old", "25 saal ka"
        /\b(\d{1,2})\s*(?:saal|years|yr|umr|old)\b/i, // Aggressive: "Main 25 saal ka hoon"
        /^(\d+)$/,                                // Just "43"
      ];
      
      for (const pattern of agePatterns) {
        const match = message.match(pattern);
        if (match) {
          const age = parseInt(match[1]);
          if (age >= 0 && age <= 120) {
            updatedProfile.age = age;
            console.log(`[PROFILE] Extracted age: ${age}`);
            break;
          }
        }
      }
    }

    // Extract gender
    if (!updatedProfile.gender) {
      const genderMatch = message.match(/\b(male|man|boy|m|female|woman|girl|f|other|transgender|पुरुष|लड़का|महिला|लड़की|तीसरा|ट्रांसजेंडर)\b/i);
      if (genderMatch) {
        updatedProfile.gender = normalizeGender(genderMatch[1]) as any;
      }
    }

    // Extract occupation with comprehensive list
    // FIX 3: CLEAN OVERWRITE LOGIC - Last-In-Priority
    const occupationMap = {
      'farmer': /\b(farmer|farming|agriculture|framer|famer|kisaan|kheti|किसान|खेती)\b/i,
      'student': /\b(student|studying|studant|छात्र|पढ़ाई)\b/i,
      'teacher': /\b(teacher|teaching|professor|शिक्षक|अध्यापक)\b/i,
      'unemployed': /\b(unemployed|jobless|बेरोजगार)\b/i,
      'self-employed': /\b(self[- ]?employed|business|bussiness|व्यापार|स्वरोजगार)\b/i,
      'daily wage': /\b(daily wage|labor|labour|majdoor|mazdoor|मजदूर|दिहाड़ी)\b/i,
      'government employee': /\b(government|sarkari|govt|सरकारी)\b/i,
      'private employee': /\b(private|company|pvt|कंपनी|प्राइवेट)\b/i,
      'retired': /\b(retired|pension|रिटायर|पेंशन)\b/i,
    };
    
    for (const [occupation, pattern] of Object.entries(occupationMap)) {
      if (pattern.test(message)) {
        const newOccupation = normalizeOccupation(occupation);
        
        // FIX 3: Log if occupation is being changed (overwrite)
        if (updatedProfile.occupation && updatedProfile.occupation !== newOccupation) {
          console.log(`[PROFILE_UPDATE] Occupation changed from "${updatedProfile.occupation}" to "${newOccupation}"`);
        }
        
        // Always overwrite with latest value (Last-In-Priority)
        updatedProfile.occupation = newOccupation;
        break;
      }
    }

    // Extract state with comprehensive list
    // FIX 3: CLEAN OVERWRITE LOGIC - Last-In-Priority
    const stateMap = {
      'Maharashtra': /\b(maharashtra|mumbai|pune|nagpur|महाराष्ट्र|मुंबई)\b/i,
      'Karnataka': /\b(karnataka|bangalore|bengaluru|mysore|कर्नाटक|बेंगलुरु)\b/i,
      'Tamil Nadu': /\b(tamil nadu|chennai|madurai|तमिलनाडु|चेन्नई)\b/i,
      'Delhi': /\b(delhi|new delhi|दिल्ली)\b/i,
      'Uttar Pradesh': /\b(uttar pradesh|up|lucknow|kanpur|उत्तर प्रदेश|लखनऊ)\b/i,
      'Gujarat': /\b(gujarat|ahmedabad|surat|गुजरात|अहमदाबाद)\b/i,
      'Rajasthan': /\b(rajasthan|jaipur|jodhpur|राजस्थान|जयपुर)\b/i,
      'West Bengal': /\b(west bengal|kolkata|calcutta|पश्चिम बंगाल|कोलकाता)\b/i,
      'Madhya Pradesh': /\b(madhya pradesh|mp|bhopal|indore|मध्य प्रदेश|भोपाल)\b/i,
      'Bihar': /\b(bihar|patna|बिहार|पटना)\b/i,
      'Punjab': /\b(punjab|chandigarh|ludhiana|पंजाब|चंडीगढ़)\b/i,
      'Haryana': /\b(haryana|gurgaon|faridabad|हरियाणा|गुड़गांव)\b/i,
      'Andhra Pradesh': /\b(andhra pradesh|hyderabad|visakhapatnam|आंध्र प्रदेश)\b/i,
      'Telangana': /\b(telangana|hyderabad|तेलंगाना|हैदराबाद)\b/i,
      'Kerala': /\b(kerala|kochi|trivandrum|केरल|कोच्चि)\b/i,
      'Odisha': /\b(odisha|orissa|bhubaneswar|ओडिशा|भुवनेश्वर)\b/i,
      'Assam': /\b(assam|guwahati|असम|गुवाहाटी)\b/i,
      'Jharkhand': /\b(jharkhand|ranchi|झारखंड|रांची)\b/i,
      'Chhattisgarh': /\b(chhattisgarh|raipur|छत्तीसगढ़|रायपुर)\b/i,
      'Uttarakhand': /\b(uttarakhand|dehradun|उत्तराखंड|देहरादून)\b/i,
      'Himachal Pradesh': /\b(himachal pradesh|shimla|हिमाचल प्रदेश|शिमला)\b/i,
      'Goa': /\b(goa|panaji|गोवा)\b/i,
    };
    
    for (const [state, pattern] of Object.entries(stateMap)) {
      if (pattern.test(message)) {
        updatedProfile.state = normalizeState(state);
        break;
      }
    }
    
    // Also try direct state name extraction
    if (!updatedProfile.state) {
      const words = message.split(/\s+/);
      for (const word of words) {
        const normalized = normalizeState(word);
        if (normalized !== word) {
          updatedProfile.state = normalized;
          break;
        }
      }
    }

    // Extract district
    if (!updatedProfile.district) {
      const districtMatch = message.match(/\b(district|जिला)\s+([a-z\s]+)/i);
      if (districtMatch) {
        updatedProfile.district = districtMatch[2].trim();
      }
    }

    // Extract income with better parsing and normalization
    if (!updatedProfile.income) {
      const normalizedIncome = normalizeIncome(message);
      if (normalizedIncome !== undefined) {
        updatedProfile.income = normalizedIncome;
      }
    }

    // Extract caste category
    if (!updatedProfile.casteCategory) {
      const casteMatch = message.match(/\b(sc|st|obc|general|scheduled caste|scheduled tribe|other backward|अनुसूचित जाति|अनुसूचित जनजाति|अन्य पिछड़ा|सामान्य)\b/i);
      if (casteMatch) {
        updatedProfile.casteCategory = normalizeCasteCategory(casteMatch[1]) as any;
      }
    }

    // Extract disability status
    if (updatedProfile.hasDisability === undefined) {
      if (message.match(/\b(disabled|disability|handicapped|विकलांग|दिव्यांग)\b/i)) {
        updatedProfile.hasDisability = true;
      } else if (message.match(/\b(no disability|not disabled|नहीं विकलांग)\b/i)) {
        updatedProfile.hasDisability = false;
      }
    }

    // Extract residence type (Urban/Rural)
    if (!updatedProfile.residenceType) {
      const residencePatterns = {
        'Urban': /\b(urban|city|town|shahar|शहर|नगर)\b/i,
        'Rural': /\b(rural|village|gaon|गांव|ग्रामीण)\b/i,
      };
      
      if (residencePatterns.Urban.test(message)) {
        updatedProfile.residenceType = 'Urban';
        console.log('[PROFILE] Extracted residence type: Urban');
      } else if (residencePatterns.Rural.test(message)) {
        updatedProfile.residenceType = 'Rural';
        console.log('[PROFILE] Extracted residence type: Rural');
      }
    }

    // Calculate completeness - ONLY required fields
    const requiredFields: (keyof UserProfile)[] = ['age', 'occupation', 'state', 'income'];
    const filledFields = requiredFields.filter((field) => updatedProfile[field] !== undefined && updatedProfile[field] !== null);
    updatedProfile.completeness = Math.round((filledFields.length / requiredFields.length) * 100);

    console.log(`[PROFILE] Extracted profile (${updatedProfile.completeness}% complete):`, updatedProfile);

    return updatedProfile;
  }

  /**
   * Build profile summary for AI context with missing fields
   * CRITICAL: This format MUST be followed exactly for AI to understand
   * FIX 2: Dynamic Short-Circuit Prompting with Status Header
   */
  private buildProfileSummary(profile: Partial<UserProfile>, language: 'hi' | 'en', missingFields: string[]): string {
    const fields: string[] = [];
    const completeness = profile.completeness || 0;
    
    // Show collected fields
    if (profile.age !== undefined) {
      fields.push(language === 'hi' ? `• उम्र: ${profile.age} ✓` : `• Age: ${profile.age} ✓`);
    }
    if (profile.gender) {
      fields.push(language === 'hi' ? `• लिंग: ${profile.gender} ✓` : `• Gender: ${profile.gender} ✓`);
    }
    if (profile.occupation) {
      fields.push(language === 'hi' ? `• व्यवसाय: ${profile.occupation} ✓` : `• Occupation: ${profile.occupation} ✓`);
    }
    if (profile.state) {
      fields.push(language === 'hi' ? `• राज्य: ${profile.state} ✓` : `• State: ${profile.state} ✓`);
    }
    if (profile.district) {
      fields.push(language === 'hi' ? `• जिला: ${profile.district} ✓` : `• District: ${profile.district} ✓`);
    }
    if (profile.income !== undefined) {
      fields.push(language === 'hi' ? `• आय: ₹${profile.income} ✓` : `• Income: ₹${profile.income} ✓`);
    }
    if (profile.casteCategory) {
      fields.push(language === 'hi' ? `• श्रेणी: ${profile.casteCategory} ✓` : `• Category: ${profile.casteCategory} ✓`);
    }
    if (profile.hasDisability !== undefined) {
      const disability = profile.hasDisability ? 
        (language === 'hi' ? 'हाँ' : 'Yes') : 
        (language === 'hi' ? 'नहीं' : 'No');
      fields.push(language === 'hi' ? `• विकलांगता: ${disability} ✓` : `• Disability: ${disability} ✓`);
    }
    if (profile.residenceType) {
      fields.push(language === 'hi' ? `• निवास प्रकार: ${profile.residenceType} ✓` : `• Residence Type: ${profile.residenceType} ✓`);
    }
    
    // FIX 2: Status Header at the very top
    const statusHeader = language === 'hi'
      ? `\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 [वर्तमान स्थिति]: प्रोफ़ाइल ${completeness}% पूर्ण
${missingFields.length > 0 ? `⚠️ लापता: ${missingFields.join(', ')}` : '✅ सभी फ़ील्ड पूर्ण'}
${missingFields.length > 0 ? `🔒 [सख्त नियम]: आप वर्तमान में "${missingFields[0]}" पूछ रहे हैं। कुछ और न पूछें।` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
      : `\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 [CURRENT STATE]: Profile is ${completeness}% complete
${missingFields.length > 0 ? `⚠️ Missing: ${missingFields.join(', ')}` : '✅ All fields complete'}
${missingFields.length > 0 ? `🔒 [STRICT RULE]: You are currently asking for "${missingFields[0]}". Do NOT ask for anything else.` : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
    
    if (fields.length === 0) {
      return statusHeader + (language === 'hi' 
        ? '\n\n📌 उपयोगकर्ता प्रोफ़ाइल (कोई जानकारी एकत्रित नहीं)'
        : '\n\n📌 USER PROFILE (No information collected)');
    }
    
    const header = language === 'hi' 
      ? '\n\n📌 उपयोगकर्ता प्रोफ़ाइल (पहले से एकत्रित — कभी न पूछें)'
      : '\n\n📌 USER PROFILE (ALREADY COLLECTED — NEVER ASK AGAIN)';
    
    let summary = `${statusHeader}${header}\n${fields.join('\n')}`;
    
    // Add missing fields section
    if (missingFields.length > 0) {
      const missingHeader = language === 'hi' 
        ? '\n\n⚠️ अगला पूछने के लिए (केवल यह एक):\n'
        : '\n\n⚠️ NEXT TO ASK (ONLY THIS ONE):\n';
      const translations: Record<string, string> = {
        age: language === 'hi' ? 'उम्र' : 'Age',
        gender: language === 'hi' ? 'लिंग' : 'Gender',
        occupation: language === 'hi' ? 'व्यवसाय' : 'Occupation',
        state: language === 'hi' ? 'राज्य' : 'State',
        income: language === 'hi' ? 'आय' : 'Income',
        residenceType: language === 'hi' ? 'निवास प्रकार (शहरी/ग्रामीण)' : 'Residence Type (Urban/Rural)',
      };
      summary += `${missingHeader}  ➤ ${translations[missingFields[0]] || missingFields[0]}`;
    } else {
      const completeMsg = language === 'hi'
        ? '\n\n✅ प्रोफ़ाइल पूर्ण — अब योजनाएं सुझाएं'
        : '\n\n✅ PROFILE COMPLETE — Now recommend schemes';
      summary += completeMsg;
    }
    
    return summary;
  }

  /**
   * Get default system prompt as fallback
   */
  private getDefaultSystemPrompt(language: 'hi' | 'en'): string {
    const prompts = {
      en: `You are a helpful AI assistant for the Sahayak AI government schemes platform. Help users discover government schemes by asking relevant questions about their eligibility.`,
      hi: `आप सहायक AI सरकारी योजना मंच के लिए एक सहायक सहायक हैं। उपयोगकर्ताओं को उनकी पात्रता के बारे में प्रासंगिक प्रश्न पूछकर सरकारी योजनाओं की खोज में मदद करें।`,
    };
    return prompts[language];
  }

  /**
   * Identify missing eligibility information
   */
  identifyMissingInfo(profile: Partial<UserProfile>): string[] {
    const requiredFields: (keyof UserProfile)[] = [
      'age',
      'occupation',
      'state',
      'income',
    ];

    return requiredFields.filter((field) => profile[field] === undefined);
  }

  /**
   * Determine conversation stage based on profile and context
   */
  private determineConversationStage(
    profile: Partial<UserProfile>,
    currentStage: ConversationStage,
    userMessage: string
  ): ConversationStage {
    const missingFields = this.identifyMissingInfo(profile);
    const hasRequiredFields = missingFields.length === 0;

    // FIX 1: Intent-Based Stage Control - Detect information requests vs eligibility requests
    const lowerMessage = userMessage.toLowerCase();
    
    // Information request patterns
    const infoPatterns = [
      'tell me about', 'what is', 'what are', 'explain', 'describe',
      'बताओ', 'बताइए', 'क्या है', 'समझाओ', 'समझाइए',
      'information about', 'details about', 'know about', 'learn about'
    ];
    
    // Eligibility request patterns
    const eligibilityPatterns = [
      'am i eligible', 'can i get', 'do i qualify', 'suggest for me',
      'check my status', 'which schemes', 'recommend', 'find schemes',
      'मैं पात्र हूं', 'मुझे मिल सकता', 'सुझाव दें', 'योजना बताएं'
    ];
    
    const isInfoRequest = infoPatterns.some(pattern => lowerMessage.includes(pattern));
    const isEligibilityRequest = eligibilityPatterns.some(pattern => lowerMessage.includes(pattern));
    
    // If user is asking for general information, move to providing_info stage
    if (isInfoRequest && !isEligibilityRequest && currentStage !== 'recommendation_ready' && currentStage !== 'post_recommendation') {
      console.log('[STAGE] Information request detected - moving to providing_info');
      return 'providing_info';
    }
    
    // If user explicitly requests eligibility check, move to collecting_profile
    if (isEligibilityRequest && missingFields.length > 0) {
      console.log('[STAGE] Eligibility request detected - moving to collecting_profile');
      return 'collecting_profile';
    }

    // FIX 2: STRICT GATE - Never allow recommendation_ready if missing fields exist
    if (missingFields.length > 0 && currentStage !== 'providing_info') {
      console.log('[STAGE] Missing fields detected - staying in collecting_profile:', missingFields);
      return 'collecting_profile';
    }

    // Stage transition logic
    if (currentStage === 'greeting') {
      // Move to collecting_profile after greeting (unless info request)
      return isInfoRequest ? 'providing_info' : 'collecting_profile';
    }
    
    if (currentStage === 'providing_info') {
      // Stay in providing_info unless user explicitly asks for eligibility
      if (isEligibilityRequest) {
        return 'collecting_profile';
      }
      return 'providing_info';
    }
    
    if (currentStage === 'collecting_profile') {
      if (hasRequiredFields) {
        // Profile complete, FORCE move to recommendation_ready
        console.log('[STAGE] Profile complete - forcing transition to recommendation_ready');
        return 'recommendation_ready';
      }
      // Stay in collecting_profile
      return 'collecting_profile';
    }
    
    if (currentStage === 'profile_complete') {
      // Automatically move to recommendation_ready
      return 'recommendation_ready';
    }
    
    if (currentStage === 'recommendation_ready') {
      // Move to post_recommendation after showing schemes
      return 'post_recommendation';
    }
    
    if (currentStage === 'post_recommendation') {
      // Stay in post_recommendation for follow-up questions
      return 'post_recommendation';
    }
    
    return currentStage;
  }

  /**
   * Build stage-specific context for AI
   * CRITICAL: This format MUST be followed exactly for AI to understand
   */
  private buildStageContext(
      stage: ConversationStage,
      missingFields: string[],
      language: 'hi' | 'en'
    ): string {
      const contexts: Record<ConversationStage, { en: string; hi: string }> = {
        greeting: {
          en: '\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n🎯 STAGE: GREETING\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n• Welcome the user warmly\n• Ask for the FIRST missing required field ONLY\n• Do NOT repeat questions\n• Do NOT ask for already collected fields\n• Keep it natural and friendly',
          hi: '\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n🎯 चरण: अभिवादन\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n• उपयोगकर्ता का स्वागत करें\n• केवल पहली लापता आवश्यक फ़ील्ड पूछें\n• प्रश्न न दोहराएं\n• पहले से एकत्रित फ़ील्ड कभी न पूछें\n• स्वाभाविक और मित्रवत रहें',
        },
        providing_info: {
          en: '\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n🎯 STAGE: PROVIDING INFO\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n• User is asking for GENERAL INFORMATION about schemes\n• You ARE ALLOWED to name and explain major schemes (Ayushman Bharat, PM-KISAN, etc.)\n• Provide helpful descriptions of scheme categories and benefits\n• After explaining, you MAY ask: "Would you like me to check which schemes you are eligible for?"\n• DO NOT force profile collection unless user explicitly requests eligibility check\n• Keep explanations clear and informative',
          hi: '\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n🎯 चरण: जानकारी प्रदान करना\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n• उपयोगकर्ता योजनाओं के बारे में सामान्य जानकारी मांग रहा है\n• आप प्रमुख योजनाओं (आयुष्मान भारत, पीएम-किसान, आदि) का नाम और व्याख्या कर सकते हैं\n• योजना श्रेणियों और लाभों का सहायक विवरण प्रदान करें\n• व्याख्या के बाद, आप पूछ सकते हैं: "क्या आप चाहेंगे कि मैं जांचूं कि आप किन योजनाओं के लिए पात्र हैं?"\n• जब तक उपयोगकर्ता स्पष्ट रूप से पात्रता जांच का अनुरोध न करे, प्रोफ़ाइल संग्रह को बाध्य न करें\n• स्पष्टीकरण स्पष्ट और जानकारीपूर्ण रखें',
        },
        collecting_profile: {
          en: `\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n🎯 STAGE: COLLECTING PROFILE\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n• Ask for ONE missing field ONLY\n• NEVER ask for already collected fields\n• ONE question per message\n• Next field to ask: ${missingFields[0] || 'none'}\n• Keep conversation natural and friendly`,
          hi: `\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n🎯 चरण: प्रोफ़ाइल एकत्र करना\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n• केवल एक लापता फ़ील्ड पूछें\n• पहले से एकत्रित फ़ील्ड कभी न पूछें\n• प्रति संदेश एक प्रश्न\n• अगली फ़ील्ड: ${missingFields[0] || 'कोई नहीं'}\n• बातचीत स्वाभाविक और मित्रवत रहें`,
        },
        profile_complete: {
          en: '\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n🎯 STAGE: PROFILE COMPLETE\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n• Profile is complete\n• DO NOT ask any more questions\n• Inform user that eligibility will be checked automatically\n• Wait for backend to process',
          hi: '\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n🎯 चरण: प्रोफ़ाइल पूर्ण\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n• प्रोफ़ाइल पूर्ण है\n• कोई प्रश्न न पूछें\n• उपयोगकर्ता को बताएं कि पात्रता स्वचालित रूप से जांची जाएगी\n• बैकएंड को प्रोसेस करने के लिए प्रतीक्षा करें',
        },
        recommendation_ready: {
          en: '\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n🎯 STAGE: RECOMMENDATION READY\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n• Profile is complete\n• Backend will run eligibility and ranking\n• AI will explain the recommended schemes\n• DO NOT ask any questions\n• DO NOT recommend schemes yourself\n• DO NOT mention scheme names\n• ONLY say: "Checking eligibility based on your details..."\n• Wait for backend results',
          hi: '\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n🎯 चरण: सिफारिश तैयार\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n• प्रोफ़ाइल पूर्ण है\n• बैकएंड पात्रता और रैंकिंग चलाएगा\n• AI सिफारिश की गई योजनाओं की व्याख्या करेगा\n• कोई प्रश्न न पूछें\n• स्वयं योजनाओं की सिफारिश न करें\n• योजना के नाम न बताएं\n• केवल कहें: "आपके विवरण के आधार पर पात्रता की जांच कर रहा हूं..."\n• बैकएंड परिणामों की प्रतीक्षा करें',
        },
        post_recommendation: {
          en: '\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n🎯 STAGE: POST RECOMMENDATION\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n• Schemes have been shown\n• Answer questions about: documents, benefits, application process\n• DO NOT restart profile collection\n• DO NOT ask for profile information again\n• Help user with scheme-related questions only',
          hi: '\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n🎯 चरण: सिफारिश के बाद\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n• योजनाएं दिखाई गई हैं\n• दस्तावेज़ों, लाभों, आवेदन प्रक्रिया के बारे में प्रश्नों का उत्तर दें\n• प्रोफ़ाइल संग्रह पुनः आरंभ न करें\n• प्रोफ़ाइल जानकारी फिर से कभी न पूछें\n• केवल योजना-संबंधी प्रश्नों के उत्तर दें',
        },
      };

      return contexts[stage][language];
    }


  /**
   * Generate follow-up question for missing information
   */
  async generateFollowUpQuestion(
    missingFields: string[],
    language: 'hi' | 'en',
    currentProfile?: Partial<UserProfile>
  ): Promise<string> {
    if (missingFields.length === 0) {
      return '';
    }

    const field = missingFields[0];
    
    // FIX 3: Contextual income question for students/farmers
    if (field === 'income' && currentProfile?.occupation) {
      const occupation = currentProfile.occupation.toLowerCase();
      
      if (occupation.includes('student')) {
        return language === 'hi'
          ? 'अधिकांश छात्र योजनाओं के लिए पारिवारिक आय की जानकारी आवश्यक है। क्या आपकी वार्षिक पारिवारिक आय ₹2.5 लाख से कम है या अधिक?'
          : 'Most student schemes require family income details. Is your annual family income below ₹2.5 Lakhs or above?';
      }
      
      if (occupation.includes('farmer')) {
        return language === 'hi'
          ? 'कृषि योजनाओं के लिए आय की जानकारी महत्वपूर्ण है। आपकी वार्षिक कृषि आय कितनी है?'
          : 'Income information is important for agricultural schemes. What is your annual agricultural income?';
      }
    }
    
    const questions: Record<string, Record<string, string>> = {
      en: {
        age: 'How old are you?',
        gender: 'What is your gender?',
        occupation: 'What is your occupation?',
        state: 'Which state do you live in?',
        district: 'Which district do you live in?',
        income: 'What is your annual income?',
        casteCategory: 'What is your caste category?',
      },
      hi: {
        age: 'आपकी उम्र क्या है?',
        gender: 'आपका लिंग क्या है?',
        occupation: 'आपका व्यवसाय क्या है?',
        state: 'आप किस राज्य में रहते हैं?',
        district: 'आप किस जिले में रहते हैं?',
        income: 'आपकी वार्षिक आय क्या है?',
        casteCategory: 'आपकी जाति श्रेणी क्या है?',
      },
    };

    return questions[language][field] || '';
  }

  /**
   * Determine suggested actions based on profile completeness and stage
   */
  private determineSuggestedActions(
    profile: Partial<UserProfile>,
    missingFields: string[],
    stage: ConversationStage
  ): any[] {
    const actions = [];

    if (stage === 'recommendation_ready' || stage === 'post_recommendation') {
      actions.push({
        type: 'check_eligibility',
        label: 'Check Eligibility',
        data: { profile },
      });
    }

    if (profile.state) {
      actions.push({
        type: 'find_center',
        label: 'Find Service Centers',
        data: { state: profile.state },
      });
    }

    return actions;
  }

  /**
   * Extract intent category from user message
   * Detects if user is asking for specific scheme categories
   */
  private extractIntentCategory(userMessage: string, profile: Partial<UserProfile>): string | undefined {
    const message = userMessage.toLowerCase();
    
    // Category keywords mapping
    const categoryKeywords: Record<string, string[]> = {
      'Health': ['health', 'medical', 'doctor', 'hospital', 'healthcare', 'disease', 'treatment', 'medicine'],
      'Education': ['education', 'study', 'school', 'college', 'scholarship', 'student', 'learning', 'course'],
      'Agriculture': ['agriculture', 'farming', 'farmer', 'crop', 'land', 'irrigation', 'kisan'],
      'Housing': ['housing', 'house', 'home', 'rent', 'property', 'building', 'construction'],
      'Employment': ['employment', 'job', 'work', 'career', 'skill', 'training', 'business'],
      'Finance': ['finance', 'loan', 'credit', 'money', 'fund', 'financial', 'banking'],
      'Social Welfare': ['pension', 'welfare', 'social', 'elderly', 'widow', 'orphan', 'vulnerable'],
    };

    // Check each category for keyword matches
    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some(keyword => message.includes(keyword))) {
        return category;
      }
    }

    // If no explicit category found, return undefined
    return undefined;
  }
}

