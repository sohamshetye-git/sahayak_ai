/**
 * Model Router
 * Routes requests to the appropriate AI model based on task classification
 */

import { AIProvider, AIRequest, AIResponse } from '../types';
import { TaskClassifier, TaskType, ModelType } from './task-classifier';
import { GeminiProvider } from './gemini-provider';
import { OpenAIProvider } from './openai-provider';
import { SarvamProvider } from './sarvam-provider';
import { GroqProvider } from './groq-provider';

export interface ModelRouterConfig {
  geminiApiKey?: string;
  openaiApiKey?: string;
  sarvamApiKey?: string;
  groqApiKey?: string;
  defaultModel?: ModelType;
  enableRouting?: boolean;
  timeoutMs?: number;
}

export class ModelRouter implements AIProvider {
  private providers: Map<ModelType, AIProvider>;
  private config: ModelRouterConfig;
  private routingEnabled: boolean;

  constructor(config: ModelRouterConfig) {
    this.config = config;
    this.routingEnabled = config.enableRouting !== false;
    this.providers = new Map();

    // Initialize available providers
    if (config.geminiApiKey) {
      this.providers.set(
        ModelType.GEMINI,
        new GeminiProvider(config.geminiApiKey, 'gemini-1.5-flash-latest', config.timeoutMs)
      );
    }

    if (config.openaiApiKey) {
      this.providers.set(
        ModelType.OPENAI,
        new OpenAIProvider(config.openaiApiKey, 'gpt-4o-mini', config.timeoutMs)
      );
    }

    if (config.sarvamApiKey) {
      this.providers.set(
        ModelType.SARVAM,
        new SarvamProvider(config.sarvamApiKey, 'sarvam-m', config.timeoutMs)
      );
    }

    if (config.groqApiKey) {
      this.providers.set(
        ModelType.GROQ,
        new GroqProvider(config.groqApiKey, 'llama-3.1-8b-instant', config.timeoutMs)
      );
    }

    if (this.providers.size === 0) {
      throw new Error('At least one AI provider must be configured');
    }
  }

  async generateResponse(request: AIRequest): Promise<AIResponse> {
    // Classify task to determine best model
    const classification = TaskClassifier.classify(
      request.prompt,
      request.language,
      {
        messageCount: request.context.length,
      }
    );

    console.log(`[MODEL ROUTER] Task: ${classification.taskType}, Recommended: ${classification.recommendedModel}, Reason: ${classification.reasoning}`);

    // Get model priority list
    const modelPriority = this.routingEnabled
      ? TaskClassifier.getModelPriority(classification.taskType)
      : [this.config.defaultModel || ModelType.SARVAM];

    // Try models in priority order
    let lastError: Error | undefined;

    for (const modelType of modelPriority) {
      const provider = this.providers.get(modelType);
      
      if (!provider) {
        console.log(`[MODEL ROUTER] ${modelType} not available, skipping`);
        continue;
      }

      try {
        console.log(`[MODEL ROUTER] Attempting ${modelType}...`);
        const response = await provider.generateResponse(request);
        console.log(`[MODEL ROUTER] ✓ ${modelType} succeeded`);
        return response;
      } catch (error) {
        lastError = error as Error;
        console.warn(`[MODEL ROUTER] ✗ ${modelType} failed: ${lastError.message}`);
        continue;
      }
    }

    throw new Error(
      `All models failed. Last error: ${lastError?.message || 'Unknown error'}`
    );
  }

  async extractStructuredData(
    text: string,
    schema: any
  ): Promise<Record<string, unknown>> {
    // For extraction, prefer Sarvam → Gemini → OpenAI → Groq
    const modelPriority = [ModelType.SARVAM, ModelType.GEMINI, ModelType.OPENAI, ModelType.GROQ];

    let lastError: Error | undefined;

    for (const modelType of modelPriority) {
      const provider = this.providers.get(modelType);
      
      if (!provider) continue;

      try {
        return await provider.extractStructuredData(text, schema);
      } catch (error) {
        lastError = error as Error;
        continue;
      }
    }

    throw new Error(
      `Extraction failed on all models. Last error: ${lastError?.message || 'Unknown error'}`
    );
  }

  async isAvailable(): Promise<boolean> {
    // Check if at least one provider is available
    for (const provider of this.providers.values()) {
      try {
        if (await provider.isAvailable()) {
          return true;
        }
      } catch {
        continue;
      }
    }
    return false;
  }

  getName(): string {
    const availableModels = Array.from(this.providers.keys()).join(' → ');
    return `ModelRouter(${availableModels})`;
  }

  buildSystemPrompt(language: 'hi' | 'en'): string {
    // Use first available provider's system prompt
    const firstProvider = this.providers.values().next().value;
    return firstProvider?.buildSystemPrompt(language) || '';
  }

  /**
   * Get provider statistics
   */
  getStats(): {
    availableModels: ModelType[];
    routingEnabled: boolean;
    defaultModel?: ModelType;
  } {
    return {
      availableModels: Array.from(this.providers.keys()),
      routingEnabled: this.routingEnabled,
      defaultModel: this.config.defaultModel,
    };
  }

  /**
   * Route specific request to specific model (for testing)
   */
  async routeToModel(
    modelType: ModelType,
    request: AIRequest
  ): Promise<AIResponse> {
    const provider = this.providers.get(modelType);
    if (!provider) {
      throw new Error(`Model ${modelType} not available`);
    }
    return provider.generateResponse(request);
  }
}
