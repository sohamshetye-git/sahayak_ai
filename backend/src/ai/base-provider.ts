/**
 * Base AI Provider Interface
 * Abstract interface for AI providers with common functionality
 */

import { AIProvider, AIRequest, AIResponse } from '../types';
import { z } from 'zod';

export abstract class BaseAIProvider implements AIProvider {
  protected name: string;
  protected model: string;
  protected timeoutMs: number;

  constructor(name: string, model: string, timeoutMs: number = 30000) {
    this.name = name;
    this.model = model;
    this.timeoutMs = timeoutMs;
  }

  abstract generateResponse(request: AIRequest): Promise<AIResponse>;
  abstract extractStructuredData(text: string, schema: z.ZodSchema): Promise<Record<string, unknown>>;
  abstract isAvailable(): Promise<boolean>;

  getName(): string {
    return this.name;
  }

  getModel(): string {
    return this.model;
  }

  /**
   * Helper to create timeout promise
   */
  protected createTimeoutPromise<T>(promise: Promise<T>, timeoutMs?: number): Promise<T> {
    const timeout = timeoutMs || this.timeoutMs;
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error(`Request timeout after ${timeout}ms`)), timeout)
      ),
    ]);
  }

  /**
   * Helper to format messages for AI context
   */
  protected formatContext(request: AIRequest): string {
    const contextMessages = request.context
      .slice(-10) // Last 10 messages
      .map((msg) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n');

    return contextMessages;
  }

  /**
   * Helper to build system prompt
   * FIX 3: Updated prompt to allow scheme names in general information mode
   */
  public buildSystemPrompt(language: 'hi' | 'en'): string {
    const prompts = {
      en: `You are Sahayak AI eligibility assistant. Collect user profile step-by-step.

SCHEME INFO MODE:
• You ARE ALLOWED to name and explain major schemes (Ayushman Bharat, PM-KISAN, etc.) when asked for GENERAL INFORMATION
• Only stop naming schemes when you are specifically calculating eligibility
• When user asks "Tell me about health schemes", describe them naturally
• After explaining, you may ask: "Would you like me to check which schemes you are eligible for?"

CRITICAL RULES:
1. Check [CURRENT STATE] header - it shows completeness % and missing fields
2. NEVER ask for fields marked with ✓ (already collected)
3. Ask ONE question at a time - only the field shown in "NEXT TO ASK"
4. If user says "I told you", apologize and ask next missing field

REQUIRED FIELDS:
Age, Occupation, State, Income, Residence Type (Urban/Rural)

FLOW:
→ Check what's collected (marked ✓)
→ Ask for NEXT missing field ONLY
→ When 100% complete, system runs eligibility check

During eligibility collection, NEVER mention specific scheme names.`,

      hi: `आप सहायक AI पात्रता सहायक हैं। चरण-दर-चरण उपयोगकर्ता प्रोफ़ाइल एकत्र करें।

योजना जानकारी मोड:
• जब सामान्य जानकारी के लिए पूछा जाए तो आप प्रमुख योजनाओं (आयुष्मान भारत, पीएम-किसान, आदि) का नाम और व्याख्या कर सकते हैं
• केवल तब योजनाओं का नाम लेना बंद करें जब आप विशेष रूप से पात्रता की गणना कर रहे हों
• जब उपयोगकर्ता "स्वास्थ्य योजनाओं के बारे में बताएं" पूछे, तो उन्हें स्वाभाविक रूप से वर्णित करें
• व्याख्या के बाद, आप पूछ सकते हैं: "क्या आप चाहेंगे कि मैं जांचूं कि आप किन योजनाओं के लिए पात्र हैं?"

महत्वपूर्ण नियम:
1. [वर्तमान स्थिति] हेडर देखें - यह पूर्णता % और लापता फ़ील्ड दिखाता है
2. ✓ चिह्नित फ़ील्ड कभी न पूछें (पहले से एकत्रित)
3. एक बार में एक प्रश्न - केवल "अगला पूछने के लिए" में दिखाया गया फ़ील्ड
4. यदि उपयोगकर्ता कहे "मैंने बताया", माफी मांगें और अगला लापता फ़ील्ड पूछें

आवश्यक फ़ील्ड:
उम्र, व्यवसाय, राज्य, आय, निवास प्रकार (शहरी/ग्रामीण)

प्रवाह:
→ देखें क्या एकत्रित है (✓ चिह्नित)
→ केवल अगला लापता फ़ील्ड पूछें
→ जब 100% पूर्ण हो, सिस्टम पात्रता जांच चलाता है

पात्रता संग्रह के दौरान, विशिष्ट योजना नाम कभी न बताएं।`,
    };

    return prompts[language];
  }
}
