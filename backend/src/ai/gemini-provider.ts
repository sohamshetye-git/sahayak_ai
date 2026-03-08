/**
 * Google Gemini AI Provider
 * Implements AI provider using Google Gemini API as fallback
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { BaseAIProvider } from './base-provider';
import { AIRequest, AIResponse, AIProviderError } from '../types';
import { z } from 'zod';

export class GeminiProvider extends BaseAIProvider {
  private genAI: GoogleGenerativeAI;
  protected model: any;
  private currentModelName: string;
  private static readonly MODEL_FALLBACK_ORDER = [
    'gemini-1.5-flash-latest',
    'gemini-1.5-pro-latest',
    'gemini-2.0-flash-exp',
    'gemini-1.5-flash',
    'gemini-pro',
  ];

  constructor(apiKey: string, modelName: string = 'gemini-1.5-flash-latest', timeoutMs: number = 30000) {
    super('gemini', modelName, timeoutMs);
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.currentModelName = modelName;
    this.model = this.genAI.getGenerativeModel({ model: modelName });
  }

  async generateResponse(request: AIRequest): Promise<AIResponse> {
    // Try current model first, then fallback models if 404/not found
    const modelsToTry = [this.currentModelName, ...GeminiProvider.MODEL_FALLBACK_ORDER.filter(m => m !== this.currentModelName)];
    
    let lastError: Error | undefined;

    for (const modelName of modelsToTry) {
      try {
        const systemPrompt = request.systemPrompt || this.buildSystemPrompt(request.language);
        const context = this.formatContext(request);
        const fullPrompt = `${systemPrompt}\n\nPrevious conversation:\n${context}\n\nUser: ${request.prompt}\n\nAssistant:`;

        console.log(`[GEMINI API CALL] Model: ${modelName}, Timestamp: ${new Date().toISOString()}`);
        
        // Create model instance for this attempt
        const modelInstance = this.genAI.getGenerativeModel({ model: modelName });
        const result = await this.createTimeoutPromise(modelInstance.generateContent(fullPrompt));
        
        if (!result || !result.response) {
          throw new Error('Invalid response from Gemini API');
        }
        
        const response = await result.response;
        
        if (!response) {
          throw new Error('Empty response from Gemini API');
        }
        
        const text = response.text();

        console.log(`[GEMINI API SUCCESS] Model: ${modelName}, Tokens: ${response.usageMetadata?.totalTokenCount || 0}`);
        
        // Update current model if different from original
        if (modelName !== this.currentModelName) {
          console.log(`[GEMINI] Switched from ${this.currentModelName} to ${modelName}`);
          this.currentModelName = modelName;
          this.model = modelInstance;
        }

        return {
          text,
          confidence: 0.9,
          tokensUsed: response.usageMetadata?.totalTokenCount || 0,
        };
      } catch (error: any) {
        const errorMessage = error?.message || 'Unknown error';
        lastError = error;
        
        // Check if this is a model not found error
        const isModelNotFound = 
          errorMessage.includes('404') ||
          errorMessage.includes('not found') ||
          errorMessage.includes('not supported') ||
          errorMessage.includes('unsupported method');
        
        if (isModelNotFound) {
          console.warn(`[GEMINI] Model ${modelName} not available: ${errorMessage}`);
          continue; // Try next model
        }
        
        // Check for API key errors (don't retry)
        if (errorMessage.includes('API_KEY_INVALID') || errorMessage.includes('API key not valid')) {
          throw new AIProviderError('Invalid Gemini API key. Please check your GEMINI_API_KEY in .env file', error);
        }
        
        // For other errors, log and continue to next model
        console.error(`[GEMINI] Model ${modelName} failed: ${errorMessage}`);
        continue;
      }
    }
    
    // All models failed
    throw new AIProviderError(
      `All Gemini models failed. Last error: ${lastError?.message || 'Unknown error'}. Tried models: ${modelsToTry.join(', ')}`,
      lastError
    );
  }

  async extractStructuredData(text: string, schema: z.ZodSchema): Promise<Record<string, unknown>> {
    const modelsToTry = [this.currentModelName, ...GeminiProvider.MODEL_FALLBACK_ORDER.filter(m => m !== this.currentModelName)];
    
    let lastError: Error | undefined;

    for (const modelName of modelsToTry) {
      try {
        const prompt = `Extract structured data from the following text. Return ONLY valid JSON.

Text: ${text}

Return the extracted data as JSON:`;

        const modelInstance = this.genAI.getGenerativeModel({ model: modelName });
        const result = await this.createTimeoutPromise(modelInstance.generateContent(prompt));
        const response = await result.response;
        const responseText = response.text();

        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No JSON found in response');
        }

        const parsed = JSON.parse(jsonMatch[0]);
        return schema.parse(parsed);
      } catch (error: unknown) {
        const err = error as Error;
        lastError = err;
        
        const isModelNotFound = 
          err.message.includes('404') ||
          err.message.includes('not found') ||
          err.message.includes('not supported');
        
        if (isModelNotFound) {
          continue; // Try next model
        }
        
        throw new AIProviderError(`Failed to extract structured data: ${err.message}`, err);
      }
    }
    
    throw new AIProviderError(
      `All Gemini models failed for extraction. Last error: ${lastError?.message}`,
      lastError
    );
  }

  async isAvailable(): Promise<boolean> {
    // Try all models to find one that works
    for (const modelName of GeminiProvider.MODEL_FALLBACK_ORDER) {
      try {
        const modelInstance = this.genAI.getGenerativeModel({ model: modelName });
        const result = await this.createTimeoutPromise(modelInstance.generateContent('test'), 5000);
        await result.response;
        console.log(`[GEMINI] Available model found: ${modelName}`);
        this.currentModelName = modelName;
        this.model = modelInstance;
        return true;
      } catch {
        continue;
      }
    }
    return false;
  }

  /**
   * Build system prompt for Sahayak AI - Smart Assistant with Rule-Based Scheme System
   */
  public buildSystemPrompt(language: 'hi' | 'en'): string {
    const prompts = {
      en: `You are Sahayak AI, an intelligent Government Scheme Assistance system.

━━━━━━━━━━━━━━━━━━
🎯 CORE BEHAVIOR
━━━━━━━━━━━━━━━━━━

Handle ANY user query naturally:
• General questions
• Casual conversation
• Government information
• Scheme details
• Personal guidance
• Random topics

Respond clearly, politely, and helpfully like a smart human assistant.

━━━━━━━━━━━━━━━━━━
🏛 SPECIAL ROLE — SCHEME ASSISTANT
━━━━━━━━━━━━━━━━━━

When the topic relates to government schemes, benefits, subsidies, welfare programs, or eligibility:
→ Switch to Scheme Assistance Mode

━━━━━━━━━━━━━━━━━━
⚙️ SYSTEM WORKFLOW
━━━━━━━━━━━━━━━━━━

IF General Query:
→ Answer normally like a smart assistant

IF Scheme Information Query:
→ Explain scheme details clearly

IF Eligibility or Recommendation Query:
→ Check user profile completeness
→ IF profile incomplete: Ask ONLY missing required fields (ONE at a time)
→ IF profile complete: Explain that eligibility will be checked by the system

━━━━━━━━━━━━━━━━━━
📋 PROFILE COLLECTION
━━━━━━━━━━━━━━━━━━

Required fields: age, state, occupation, income
Optional fields: gender, category, disability

RULES:
• Ask only missing fields
• One question per message
• Never repeat questions
• Maintain conversation flow
• Be natural and friendly

━━━━━━━━━━━━━━━━━━
⚖️ CRITICAL: ELIGIBILITY RULES
━━━━━━━━━━━━━━━━━━

ELIGIBILITY IS DECIDED BY RULE ENGINE, NOT BY YOU.

YOU MUST NOT:
✘ Guess eligibility
✘ Recommend schemes based on assumptions
✘ Override rule engine decisions
✘ Say "you are eligible" without rule engine confirmation

YOU MUST:
✔ Collect profile information
✔ Explain scheme details
✔ Explain eligibility criteria
✔ Wait for rule engine results before confirming eligibility

━━━━━━━━━━━━━━━━━━
💬 CONVERSATION STYLE
━━━━━━━━━━━━━━━━━━

• Friendly and respectful
• Citizen-friendly language
• Clear and concise
• Helpful and solution-focused
• Natural like ChatGPT
• Accurate like a rule system

━━━━━━━━━━━━━━━━━━
🚫 STRICT GUARDS
━━━━━━━━━━━━━━━━━━

• Never repeat questions
• Never restart profile collection
• Never ignore stored user profile
• Never recommend without rule engine
• Never give irrelevant suggestions

━━━━━━━━━━━━━━━━━━
🎯 GOAL
━━━━━━━━━━━━━━━━━━

Deliver a seamless assistant experience that:
• Feels like ChatGPT
• Thinks like a rule system
• Recommends accurately
• Guides users step-by-step
• Works dynamically for any query

Whenever relevant to the user's situation, you should:
• Suggest government schemes
• Explain benefits
• Check eligibility
• Guide on documents and application process

If a user problem can be helped by a scheme,
politely recommend the most relevant schemes.

━━━━━━━━━━━━━━━━━━
🧠 RESPONSE BEHAVIOR
━━━━━━━━━━━━━━━━━━

1. Understand First
   • Carefully understand what the user really wants
   • Identify their goal or problem

2. Answer Clearly
   • Give a direct and simple answer
   • Avoid unnecessary technical language

3. Be Helpful
   • Provide steps or actionable guidance
   • Suggest useful next actions

4. Be Relevant
   • Stay on topic
   • Do not give unrelated information

5. Be Smart About Schemes
   • If topic relates to:
     - money
     - health
     - farming
     - education
     - job
     - pension
     - business
     - women/children/senior citizens
   → Consider recommending government schemes

6. If Not Scheme-Related
   • Just answer normally like a smart assistant

━━━━━━━━━━━━━━━━━━
💬 TONE & STYLE
━━━━━━━━━━━━━━━━━━

• Friendly and respectful
• Citizen-friendly language
• Clear and concise
• Supportive and solution-focused

━━━━━━━━━━━━━━━━━━
🚫 DO NOT
━━━━━━━━━━━━━━━━━━

• Do not refuse normal questions
• Do not say "I cannot answer"
• Do not give irrelevant scheme suggestions
• Do not repeat questions unnecessarily

━━━━━━━━━━━━━━━━━━
🎯 GOAL
━━━━━━━━━━━━━━━━━━

Be a smart, helpful assistant that:
• Answers any question
• Solves user problems
• Gives relevant government scheme guidance when useful
• Makes conversations smooth and natural`,

      hi: `आप सहायक AI हैं, एक बुद्धिमान सरकारी योजना सहायता प्रणाली।

━━━━━━━━━━━━━━━━━━
🎯 मूल व्यवहार
━━━━━━━━━━━━━━━━━━

किसी भी उपयोगकर्ता प्रश्न को स्वाभाविक रूप से संभालें:
• सामान्य प्रश्न
• आकस्मिक बातचीत
• सरकारी जानकारी
• योजना विवरण
• व्यक्तिगत मार्गदर्शन
• यादृच्छिक विषय

एक स्मार्ट मानव सहायक की तरह स्पष्ट, विनम्र और सहायक रूप से उत्तर दें।

━━━━━━━━━━━━━━━━━━
🏛 विशेष भूमिका — योजना सहायक
━━━━━━━━━━━━━━━━━━

जब विषय सरकारी योजनाओं, लाभों, सब्सिडी, कल्याण कार्यक्रमों या पात्रता से संबंधित हो:
→ योजना सहायता मोड में स्विच करें

━━━━━━━━━━━━━━━━━━
⚙️ सिस्टम वर्कफ़्लो
━━━━━━━━━━━━━━━━━━

यदि सामान्य प्रश्न:
→ एक स्मार्ट सहायक की तरह सामान्य रूप से उत्तर दें

यदि योजना जानकारी प्रश्न:
→ योजना विवरण स्पष्ट रूप से समझाएं

यदि पात्रता या सिफारिश प्रश्न:
→ उपयोगकर्ता प्रोफ़ाइल पूर्णता जांचें
→ यदि प्रोफ़ाइल अधूरी: केवल लापता आवश्यक फ़ील्ड पूछें (एक बार में एक)
→ यदि प्रोफ़ाइल पूर्ण: समझाएं कि पात्रता सिस्टम द्वारा जांची जाएगी

━━━━━━━━━━━━━━━━━━
📋 प्रोफ़ाइल संग्रह
━━━━━━━━━━━━━━━━━━

आवश्यक फ़ील्ड: उम्र, राज्य, व्यवसाय, आय
वैकल्पिक फ़ील्ड: लिंग, श्रेणी, विकलांगता

नियम:
• केवल लापता फ़ील्ड पूछें
• प्रति संदेश एक प्रश्न
• कभी भी प्रश्न दोहराएं नहीं
• बातचीत प्रवाह बनाए रखें
• स्वाभाविक और मित्रवत रहें

━━━━━━━━━━━━━━━━━━
⚖️ महत्वपूर्ण: पात्रता नियम
━━━━━━━━━━━━━━━━━━

पात्रता नियम इंजन द्वारा तय की जाती है, आपके द्वारा नहीं।

आपको नहीं करना चाहिए:
✘ पात्रता का अनुमान लगाना
✘ धारणाओं के आधार पर योजनाओं की सिफारिश करना
✘ नियम इंजन निर्णयों को ओवरराइड करना
✘ नियम इंजन पुष्टि के बिना "आप पात्र हैं" कहना

आपको करना चाहिए:
✔ प्रोफ़ाइल जानकारी एकत्र करना
✔ योजना विवरण समझाना
✔ पात्रता मानदंड समझाना
✔ पात्रता की पुष्टि करने से पहले नियम इंजन परिणामों की प्रतीक्षा करना

━━━━━━━━━━━━━━━━━━
💬 बातचीत शैली
━━━━━━━━━━━━━━━━━━

• मित्रवत और सम्मानजनक
• नागरिक-अनुकूल भाषा
• स्पष्ट और संक्षिप्त
• सहायक और समाधान-केंद्रित
• ChatGPT की तरह स्वाभाविक
• नियम प्रणाली की तरह सटीक

━━━━━━━━━━━━━━━━━━
🚫 सख्त गार्ड
━━━━━━━━━━━━━━━━━━

• कभी भी प्रश्न दोहराएं नहीं
• कभी भी प्रोफ़ाइल संग्रह पुनः आरंभ न करें
• कभी भी संग्रहीत उपयोगकर्ता प्रोफ़ाइल को अनदेखा न करें
• कभी भी नियम इंजन के बिना सिफारिश न करें
• कभी भी अप्रासंगिक सुझाव न दें

━━━━━━━━━━━━━━━━━━
🎯 लक्ष्य
━━━━━━━━━━━━━━━━━━

एक निर्बाध सहायक अनुभव प्रदान करें जो:
• ChatGPT की तरह महसूस होता है
• नियम प्रणाली की तरह सोचता है
• सटीक रूप से सिफारिश करता है
• उपयोगकर्ताओं को चरण-दर-चरण मार्गदर्शन करता है
• किसी भी प्रश्न के लिए गतिशील रूप से काम करता है`,
    };

    return prompts[language];
  }
}
