/**
 * AI Provider Factory
 * Creates AI providers with automatic fallback support and smart routing
 */

import { AIProvider, AIProviderConfig, AIRequest, AIResponse, AIProviderError } from '../types';
import { BedrockProvider } from './bedrock-provider';
import { GeminiProvider } from './gemini-provider';
import { OpenAIProvider } from './openai-provider';
import { GroqProvider } from './groq-provider';
import { SarvamProvider } from './sarvam-provider';
import { ModelRouter, ModelRouterConfig } from './model-router';

export class AIProviderFactory {
  static create(config: AIProviderConfig): AIProvider {
    const { type, model, region, apiKey } = config.primary;

    if (type === 'bedrock') {
      return new BedrockProvider(model, region, config.timeoutMs);
    } else if (type === 'gemini') {
      if (!apiKey) throw new Error('Gemini API key required');
      return new GeminiProvider(apiKey, model, config.timeoutMs);
    } else if (type === 'openai') {
      if (!apiKey) throw new Error('OpenAI API key required');
      return new OpenAIProvider(apiKey, model, config.timeoutMs);
    } else if (type === 'groq') {
      if (!apiKey) throw new Error('Groq API key required');
      return new GroqProvider(apiKey, model, config.timeoutMs);
    } else if (type === 'sarvam') {
      if (!apiKey) throw new Error('Sarvam AI API key required');
      return new SarvamProvider(apiKey, model, config.timeoutMs);
    } else if (type === 'router') {
      // Smart routing mode
      return this.createRouter(config);
    }

    throw new Error(`Unsupported AI provider type: ${type}`);
  }

  static createRouter(config: AIProviderConfig): ModelRouter {
    const routerConfig: ModelRouterConfig = {
      geminiApiKey: process.env.GEMINI_API_KEY,
      openaiApiKey: process.env.OPENAI_API_KEY,
      sarvamApiKey: process.env.SARVAM_API_KEY,
      groqApiKey: process.env.GROQ_API_KEY,
      enableRouting: true,
      timeoutMs: config.timeoutMs,
    };

    return new ModelRouter(routerConfig);
  }

  static createWithFallback(config: AIProviderConfig): AIProviderWithFallback {
    const primary = this.create(config);
    const fallback = config.fallback ? this.create({ ...config, primary: config.fallback }) : undefined;
    const tertiary = config.tertiary ? this.create({ ...config, primary: config.tertiary }) : undefined;
    const quaternary = config.quaternary ? this.create({ ...config, primary: config.quaternary }) : undefined;

    return new AIProviderWithFallback(primary, fallback, tertiary, quaternary, config.retryAttempts);
  }
}

/**
 * AI Provider with automatic retry and 4-level fallback
 * Priority: Primary (Gemini) → Fallback (Bedrock) → Tertiary (Groq) → Quaternary (Sarvam)
 */
export class AIProviderWithFallback implements AIProvider {
  constructor(
    private primary: AIProvider,
    private fallback?: AIProvider,
    private tertiary?: AIProvider,
    private quaternary?: AIProvider,
    private retryAttempts: number = 3
  ) {}

  async generateResponse(request: AIRequest): Promise<AIResponse> {
    return this.executeWithRetryAndFallback(
      () => this.primary.generateResponse(request),
      this.fallback ? () => this.fallback!.generateResponse(request) : undefined,
      this.tertiary ? () => this.tertiary!.generateResponse(request) : undefined,
      this.quaternary ? () => this.quaternary!.generateResponse(request) : undefined,
      this.primary.getName()
    );
  }

  async extractStructuredData(text: string, schema: any): Promise<any> {
    return this.executeWithRetryAndFallback(
      () => this.primary.extractStructuredData(text, schema),
      this.fallback ? () => this.fallback!.extractStructuredData(text, schema) : undefined,
      this.tertiary ? () => this.tertiary!.extractStructuredData(text, schema) : undefined,
      this.quaternary ? () => this.quaternary!.extractStructuredData(text, schema) : undefined,
      this.primary.getName()
    );
  }

  async isAvailable(): Promise<boolean> {
    try {
      return await this.primary.isAvailable();
    } catch {
      if (this.fallback) {
        try {
          return await this.fallback.isAvailable();
        } catch {
          if (this.tertiary) {
            try {
              return await this.tertiary.isAvailable();
            } catch {
              if (this.quaternary) {
                return await this.quaternary.isAvailable();
              }
            }
          }
        }
      }
      return false;
    }
  }

  getName(): string {
    let name = this.primary.getName();
    if (this.fallback) name += ` → ${this.fallback.getName()}`;
    if (this.tertiary) name += ` → ${this.tertiary.getName()}`;
    if (this.quaternary) name += ` → ${this.quaternary.getName()}`;
    return name;
  }
  buildSystemPrompt(language: 'hi' | 'en'): string {
    return this.primary.buildSystemPrompt(language);
  }

  private async executeWithRetryAndFallback<T>(
    primaryFn: () => Promise<T>,
    fallbackFn?: () => Promise<T>,
    tertiaryFn?: () => Promise<T>,
    quaternaryFn?: () => Promise<T>,
    primaryName?: string
  ): Promise<T> {
    // Try primary provider with retries
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const result = await primaryFn();
        console.log(`[PROVIDER SUCCESS] ${primaryName || 'Primary'} succeeded on attempt ${attempt}`);
        return result;
      } catch (error: any) {
        console.warn(`[PROVIDER RETRY] ${primaryName || 'Primary'} attempt ${attempt}/${this.retryAttempts} failed: ${error.message}`);

        if (attempt < this.retryAttempts) {
          const backoffMs = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
          await this.sleep(backoffMs);
        }
      }
    }

    // Try fallback provider if available
    if (fallbackFn) {
      console.log(`[PROVIDER FALLBACK] Primary exhausted, switching to ${this.fallback?.getName()}`);
      try {
        const result = await fallbackFn();
        console.log(`[PROVIDER SUCCESS] ${this.fallback?.getName()} succeeded`);
        return result;
      } catch (error: any) {
        console.warn(`[PROVIDER FALLBACK ERROR] ${this.fallback?.getName()} failed: ${error.message}`);

        // Try tertiary provider if available
        if (tertiaryFn) {
          console.log(`[PROVIDER TERTIARY] Fallback exhausted, switching to ${this.tertiary?.getName()}`);
          try {
            const result = await tertiaryFn();
            console.log(`[PROVIDER SUCCESS] ${this.tertiary?.getName()} succeeded`);
            return result;
          } catch (tertiaryError: any) {
            console.error(`[PROVIDER TERTIARY ERROR] ${this.tertiary?.getName()} failed: ${tertiaryError.message}`);

            // Try quaternary provider (final fallback) if available
            if (quaternaryFn) {
              console.log(`[PROVIDER QUATERNARY] Tertiary exhausted, switching to ${this.quaternary?.getName()} (FINAL FALLBACK)`);
              try {
                const result = await quaternaryFn();
                console.log(`[PROVIDER SUCCESS] ${this.quaternary?.getName()} succeeded (FINAL FALLBACK)`);
                return result;
              } catch (quaternaryError: any) {
                console.error(`[PROVIDER QUATERNARY ERROR] ${this.quaternary?.getName()} failed: ${quaternaryError.message}`);
                throw new AIProviderError(
                  `All providers failed - Primary: ${error.message}, Tertiary: ${tertiaryError.message}, Quaternary: ${quaternaryError.message}`,
                  quaternaryError
                );
              }
            }

            throw new AIProviderError(
              `All providers failed - Primary: ${error.message}, Tertiary: ${tertiaryError.message}`,
              tertiaryError
            );
          }
        }

        throw new AIProviderError(`Primary and fallback providers failed: ${error.message}`, error);
      }
    }

    throw new AIProviderError('Primary provider failed and no fallback available');
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

/**
 * Helper to create AI provider from environment variables
 * Priority: Configurable via AI_PROVIDER env variable
 * Default: Gemini → Bedrock → Groq → Sarvam AI
 */
export function createAIProviderFromEnv(): AIProvider {
  // Always use retry attempts from env (default: 1 for free tier)
  const retryAttempts = parseInt(process.env.AI_RETRY_ATTEMPTS || '1');
  
  const primaryType = (process.env.AI_PROVIDER as 'bedrock' | 'gemini' | 'groq' | 'sarvam') || 'groq'; // Changed to groq for speed
  
  // Determine API key based on primary provider
  let primaryApiKey: string | undefined;
  if (primaryType === 'gemini') {
    primaryApiKey = process.env.GEMINI_API_KEY;
  } else if (primaryType === 'groq') {
    primaryApiKey = process.env.GROQ_API_KEY;
  } else if (primaryType === 'sarvam') {
    primaryApiKey = process.env.SARVAM_API_KEY;
  }
  
  const config: AIProviderConfig = {
    primary: {
      type: primaryType,
      model: process.env.AI_PROVIDER_PRIMARY_MODEL || (primaryType === 'groq' ? 'llama-3.1-8b-instant' : 'gemini-pro'), // Fast model for Groq
      region: process.env.AWS_REGION || 'us-east-1',
      apiKey: primaryApiKey,
    },
    // Fallback provider (configurable)
    fallback: process.env.AI_PROVIDER_FALLBACK_MODEL && process.env.GEMINI_API_KEY
      ? {
          type: 'gemini',
          model: process.env.AI_PROVIDER_FALLBACK_MODEL,
          region: process.env.AWS_REGION || 'us-east-1',
          apiKey: process.env.GEMINI_API_KEY,
        }
      : undefined,
    // Tertiary fallback (only if Groq key is available)
    tertiary: process.env.AI_PROVIDER_TERTIARY_MODEL && process.env.GROQ_API_KEY
      ? {
          type: 'groq',
          model: process.env.AI_PROVIDER_TERTIARY_MODEL,
          apiKey: process.env.GROQ_API_KEY,
        }
      : undefined,
    // Quaternary fallback (only if configured)
    quaternary: process.env.AI_PROVIDER_QUATERNARY_MODEL
      ? {
          type: 'bedrock',
          model: process.env.AI_PROVIDER_QUATERNARY_MODEL,
          region: process.env.AWS_REGION || 'us-east-1',
        }
      : undefined,
    retryAttempts,
    timeoutMs: parseInt(process.env.AI_TIMEOUT_MS || '15000'), // Reduced from 30s to 15s
  };

  console.log('AI Provider Config:', {
    primaryType: config.primary.type,
    primaryModel: config.primary.model,
    hasFallback: !!config.fallback,
    hasTertiary: !!config.tertiary,
    hasQuaternary: !!config.quaternary,
    retryAttempts,
    hasPrimaryKey: !!config.primary.apiKey,
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    hasOpenAIKey: !!process.env.OPENAI_API_KEY,
    hasGroqKey: !!process.env.GROQ_API_KEY,
    hasSarvamKey: !!process.env.SARVAM_API_KEY,
  });

  return AIProviderFactory.createWithFallback(config);
}
