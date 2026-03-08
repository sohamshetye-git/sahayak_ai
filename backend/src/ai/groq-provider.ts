/**
 * Groq AI Provider
 * Implements AI provider using Groq API (OpenAI-compatible)
 * Used as final fallback when Gemini and Bedrock fail
 */

import { BaseAIProvider } from './base-provider';
import { AIRequest, AIResponse, AIProviderError } from '../types';
import { z } from 'zod';

export class GroqProvider extends BaseAIProvider {
  private apiKey: string;
  private baseUrl: string = 'https://api.groq.com/openai/v1';

  constructor(apiKey: string, modelName: string = 'llama-3.1-8b-instant', timeoutMs: number = 30000) {
    super('groq', modelName, timeoutMs);
    if (!apiKey) {
      throw new Error('Groq API key is required');
    }
    this.apiKey = apiKey;
  }

  async generateResponse(request: AIRequest): Promise<AIResponse> {
    try {
      const systemPrompt = request.systemPrompt || this.buildSystemPrompt(request.language);
      const context = this.formatContext(request);
      const fullPrompt = `${systemPrompt}\n\nPrevious conversation:\n${context}\n\nUser: ${request.prompt}\n\nAssistant:`;

      console.log(`[GROQ API CALL] Timestamp: ${new Date().toISOString()}, Model: ${this.model}`);

      const response = await this.createTimeoutPromise(
        this.callGroqAPI(fullPrompt)
      );

      console.log(`[GROQ API SUCCESS] Tokens used: ${(response.usage as Record<string, any>)?.total_tokens || 0}`);

      return {
        text: (response.choices[0].message as Record<string, any>).content as string,
        confidence: 0.85,
        tokensUsed: (response.usage as Record<string, any>)?.total_tokens || 0,
      };
    } catch (error: any) {
      const errorMessage = error?.message || 'Unknown error';
      console.error(`[GROQ API ERROR] ${errorMessage}`);

      if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
        throw new AIProviderError('Invalid Groq API key. Please check your GROQ_API_KEY in .env file', error);
      }

      if (errorMessage.includes('429') || errorMessage.includes('rate limit')) {
        throw new AIProviderError('Groq API rate limit exceeded', error);
      }

      throw new AIProviderError(`Groq API error: ${errorMessage}`, error);
    }
  }

  async extractStructuredData(text: string, schema: z.ZodSchema): Promise<Record<string, unknown>> {
    try {
      const prompt = `Extract structured data from the following text. Return ONLY valid JSON.

Text: ${text}

Return the extracted data as JSON:`;

      const response = await this.createTimeoutPromise(
        this.callGroqAPI(prompt)
      );

      const responseText = (response.choices[0].message as Record<string, any>).content as string;
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
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
      await this.createTimeoutPromise(
        this.callGroqAPI('test'),
        5000
      );
      return true;
    } catch {
      return false;
    }
  }

  private async callGroqAPI(prompt: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2048,
        top_p: 0.9,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({})) as Record<string, any>;
      const errorMessage = (errorData.error as Record<string, any>)?.message || `HTTP ${response.status}`;
      throw new Error(`Groq API error: ${errorMessage}`);
    }

    return response.json();
  }

  /**
   * Build system prompt for Groq as fallback provider
   */
  public buildSystemPrompt(language: 'hi' | 'en'): string {
    const prompts = {
      en: `You are Sahayak AI's Fallback Conversation Assistant.

You are activated when the primary AI provider (Gemini) fails.

Your job is to:
• Guide users through eligibility questions
• Build their profile step-by-step
• Maintain conversation quality
• Ensure smooth experience

Required fields to collect:
• age
• state
• occupation
• income

Optional fields:
• gender
• category

Rules:
• Ask ONE simple question at a time
• Never repeat questions
• Be polite and conversational
• Keep responses clear and concise
• Maintain conversation continuity

Provider: Groq (Fallback)
Reason: Reliable backup when Gemini fails`,

      hi: `आप सहायक AI के फ़ॉलबैक वार्तालाप सहायक हैं।

आप तब सक्रिय होते हैं जब प्राथमिक AI प्रदाता (Gemini) विफल हो जाता है।

आपका काम है:
• उपयोगकर्ताओं को पात्रता प्रश्नों के माध्यम से मार्गदर्शन करना
• उनकी प्रोफ़ाइल चरण-दर-चरण बनाना
• वार्तालाप गुणवत्ता बनाए रखना
• सुचारू अनुभव सुनिश्चित करना

एकत्र करने के लिए आवश्यक फ़ील्ड:
• उम्र
• राज्य
• व्यवसाय
• आय

वैकल्पिक फ़ील्ड:
• लिंग
• श्रेणी

नियम:
• एक समय में एक सरल प्रश्न पूछें
• प्रश्न कभी दोहराएं नहीं
• विनम्र और संवादात्मक बनें
• प्रतिक्रियाएं स्पष्ट और संक्षिप्त रखें
• वार्तालाप निरंतरता बनाए रखें

प्रदाता: Groq (फ़ॉलबैक)
कारण: Gemini विफल होने पर विश्वसनीय बैकअप`,
    };

    return prompts[language];
  }
}
