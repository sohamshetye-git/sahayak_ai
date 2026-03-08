/**
 * Sarvam AI Provider
 * Implements AI provider using Sarvam AI API
 * Used as final fallback when Gemini, Bedrock, and Groq fail
 * 
 * Sarvam AI is an Indian AI company focused on multilingual AI
 * Excellent for Hindi and other Indian languages
 */

import { BaseAIProvider } from './base-provider';
import { AIRequest, AIResponse, AIProviderError } from '../types';
import { z } from 'zod';

export class SarvamProvider extends BaseAIProvider {
  private apiKey: string;
  private baseUrl: string = 'https://api.sarvam.ai/v1';

  constructor(apiKey: string, modelName: string = 'sarvam-2b', timeoutMs: number = 30000) {
    super('sarvam', modelName, timeoutMs);
    if (!apiKey) {
      throw new Error('Sarvam AI API key is required');
    }
    this.apiKey = apiKey;
  }

  async generateResponse(request: AIRequest): Promise<AIResponse> {
    try {
      const systemPrompt = request.systemPrompt || this.buildSystemPrompt(request.language);
      
      // Build messages array for chat completion
      // Sarvam AI doesn't support system role, so we prepend system prompt to first user message
      const contextMessages = request.context.slice(-5).map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
      }));

      // Prepend system prompt to the current user message
      const userMessageWithContext = `${systemPrompt}\n\n${request.prompt}`;

      const rawMessages = [
        ...contextMessages,
        {
          role: 'user',
          content: userMessageWithContext,
        },
      ];

      // Normalize messages for Sarvam AI requirements
      const messages = this.normalizeSarvamMessages(rawMessages);

      console.log(`[SARVAM API CALL] Timestamp: ${new Date().toISOString()}, Model: ${this.model}, Language: ${request.language}`);

      const response = await this.createTimeoutPromise(
        this.callSarvamAPI(messages, request.language)
      );

      console.log(`[SARVAM API SUCCESS] Tokens used: ${response.usage?.total_tokens || 0}`);

      return {
        text: response.choices[0].message.content,
        confidence: 0.85,
        tokensUsed: response.usage?.total_tokens || 0,
      };
    } catch (error: any) {
      const errorMessage = error?.message || 'Unknown error';
      console.error(`[SARVAM API ERROR] ${errorMessage}`);

      if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
        throw new AIProviderError('Invalid Sarvam AI API key. Please check your SARVAM_API_KEY in .env file', error);
      }

      if (errorMessage.includes('429') || errorMessage.includes('rate limit')) {
        throw new AIProviderError('Sarvam AI API rate limit exceeded', error);
      }

      if (errorMessage.includes('503') || errorMessage.includes('Service Unavailable')) {
        throw new AIProviderError('Sarvam AI service temporarily unavailable', error);
      }

      throw new AIProviderError(`Sarvam AI API error: ${errorMessage}`, error);
    }
  }

  async extractStructuredData(text: string, schema: z.ZodSchema): Promise<Record<string, unknown>> {
    try {
      const prompt = `Extract structured data from the following text. Return ONLY valid JSON without any markdown formatting or code blocks.

Text: ${text}

Return the extracted data as a JSON object:`;

      const rawMessages = [
        {
          role: 'system',
          content: 'You are a data extraction assistant. Always return valid JSON without markdown formatting.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ];

      // Normalize messages for Sarvam AI requirements
      const messages = this.normalizeSarvamMessages(rawMessages);

      const response = await this.createTimeoutPromise(
        this.callSarvamAPI(messages, 'en')
      );

      const responseText = response.choices[0].message.content;
      
      // Remove markdown code blocks if present
      const cleanedText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      // Extract JSON object
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      return schema.parse(parsed);
    } catch (error: any) {
      throw new AIProviderError(`Failed to extract structured data: ${error.message}`, error);
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      const testMessages = [
        {
          role: 'user',
          content: 'test',
        },
      ];
      
      await this.createTimeoutPromise(
        this.callSarvamAPI(testMessages, 'en'),
        5000
      );
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Normalize messages for Sarvam AI requirements:
   * - First message must be "user"
   * - Roles must strictly alternate: user → assistant → user → assistant
   * - No duplicate roles in sequence
   * - Ignore "system" messages
   */
  private normalizeSarvamMessages(messages: any[]): any[] {
    // Step 1: Filter out invalid messages and system messages
    const validMessages = messages.filter(msg => 
      msg && msg.role && msg.content && msg.role !== 'system'
    );

    if (validMessages.length === 0) {
      return [{ role: 'user', content: 'Hello' }];
    }

    // Step 2: Ensure first message is "user"
    if (validMessages[0].role !== 'user') {
      validMessages.unshift({ role: 'user', content: 'Hello' });
    }

    // Step 3: Remove consecutive duplicate roles (keep first occurrence)
    const normalized: any[] = [];
    let lastRole: string | null = null;

    for (const msg of validMessages) {
      if (msg.role !== lastRole) {
        normalized.push(msg);
        lastRole = msg.role;
      }
    }

    // Step 4: Ensure alternating pattern ends with user message
    if (normalized.length > 0 && normalized[normalized.length - 1].role !== 'user') {
      // If last message is assistant, we're good (user will be added by caller)
      // But if somehow we have an odd pattern, fix it
    }

    return normalized;
  }

  private async callSarvamAPI(messages: any[], language: 'hi' | 'en'): Promise<any> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        messages: messages,
        temperature: 0.7,
        max_tokens: 2048,
        top_p: 0.9,
        // Sarvam AI specific parameters for better Indian language support
        language: language === 'hi' ? 'hindi' : 'english',
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorData: any = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || errorData.message || `HTTP ${response.status}`;
      throw new Error(`Sarvam AI API error: ${errorMessage}`);
    }

    return response.json();
  }

  /**
   * Override system prompt to leverage Sarvam AI's strength in Indian languages and profile extraction
   */
  public buildSystemPrompt(language: 'hi' | 'en'): string {
    const prompts = {
      en: `You are Sahayak AI's Profile Data Extraction specialist.

Your ONLY job is to:
• Extract structured user data from messages
• Output clean JSON fields only

Extract these fields:
• age (number)
• state (string)
• occupation (string)
• income (number)
• gender (optional: male/female/other)
• category (optional: general/obc/sc/st)

Provider: Sarvam AI
Reason: Fast and cost-efficient structured extraction

Rules:
• Extract data accurately from user messages
• Return ONLY JSON format
• Do NOT ask questions
• Do NOT provide explanations
• Focus on speed and accuracy

Example Input: "I am 43 years old, farmer from Maharashtra"
Example Output: {"age": 43, "occupation": "farmer", "state": "Maharashtra"}`,

      hi: `आप सहायक AI के प्रोफ़ाइल डेटा निष्कर्षण विशेषज्ञ हैं।

आपका केवल काम है:
• संदेशों से संरचित उपयोगकर्ता डेटा निकालना
• केवल स्वच्छ JSON फ़ील्ड आउटपुट करना

इन फ़ील्ड को निकालें:
• उम्र (संख्या)
• राज्य (स्ट्रिंग)
• व्यवसाय (स्ट्रिंग)
• आय (संख्या)
• लिंग (वैकल्पिक: पुरुष/महिला/अन्य)
• श्रेणी (वैकल्पिक: सामान्य/ओबीसी/एससी/एसटी)

प्रदाता: Sarvam AI
कारण: तेज़ और लागत-कुशल संरचित निष्कर्षण

नियम:
• उपयोगकर्ता संदेशों से डेटा सटीक रूप से निकालें
• केवल JSON प्रारूप लौटाएं
• प्रश्न न पूछें
• स्पष्टीकरण प्रदान न करें
• गति और सटीकता पर ध्यान दें

उदाहरण इनपुट: "मैं 43 साल का हूं, महाराष्ट्र से किसान"
उदाहरण आउटपुट: {"age": 43, "occupation": "farmer", "state": "Maharashtra"}`,
    };

    return prompts[language];
  }
}
