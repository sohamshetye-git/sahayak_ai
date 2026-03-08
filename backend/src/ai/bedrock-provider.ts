/**
 * Amazon Bedrock AI Provider
 * Implements AI provider using Amazon Bedrock (Nova Lite or Claude 3 Haiku)
 */

import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime';
import { BaseAIProvider } from './base-provider';
import { AIRequest, AIResponse, AIProviderError } from '../types';
import { z } from 'zod';

export class BedrockProvider extends BaseAIProvider {
  private client: BedrockRuntimeClient;
  private modelId: string;

  constructor(
    modelId: string = 'amazon.nova-lite-v1:0',
    region: string = 'us-east-1',
    timeoutMs: number = 30000
  ) {
    super('bedrock', modelId, timeoutMs);
    this.modelId = modelId;
    this.client = new BedrockRuntimeClient({ region });
  }

  async generateResponse(request: AIRequest): Promise<AIResponse> {
    try {
      const systemPrompt = request.systemPrompt || this.buildSystemPrompt(request.language);
      const context = this.formatContext(request);
      const fullPrompt = `${systemPrompt}\n\nPrevious conversation:\n${context}\n\nUser: ${request.prompt}\n\nAssistant:`;

      const payload = this.buildPayload(fullPrompt);
      const command = new InvokeModelCommand({
        modelId: this.modelId,
        body: JSON.stringify(payload),
        contentType: 'application/json',
        accept: 'application/json',
      });

      const response = await this.createTimeoutPromise(this.client.send(command));
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));

      return this.parseResponse(responseBody);
    } catch (error: unknown) {
      const err = error as Error;
      throw new AIProviderError(`Bedrock API error: ${err.message}`, err);
    }
  }

  async extractStructuredData(text: string, schema: z.ZodSchema): Promise<Record<string, unknown>> {
    try {
      const prompt = `Extract structured data from the following text. Return ONLY valid JSON matching the schema.

Text: ${text}

Return the extracted data as JSON:`;

      const payload = this.buildPayload(prompt);
      const command = new InvokeModelCommand({
        modelId: this.modelId,
        body: JSON.stringify(payload),
        contentType: 'application/json',
        accept: 'application/json',
      });

      const response = await this.createTimeoutPromise(this.client.send(command));
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      const extracted = this.parseResponse(responseBody);

      const jsonMatch = extracted.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      return schema.parse(parsed);
    } catch (error: unknown) {
      const err = error as Error;
      throw new AIProviderError(`Failed to extract structured data: ${err.message}`, err);
    }
  }

  async isAvailable(): Promise<boolean> {
    try {
      const testPayload = this.buildPayload('test');
      const command = new InvokeModelCommand({
        modelId: this.modelId,
        body: JSON.stringify(testPayload),
        contentType: 'application/json',
        accept: 'application/json',
      });
      await this.createTimeoutPromise(this.client.send(command), 5000);
      return true;
    } catch {
      return false;
    }
  }

  private buildPayload(prompt: string): any {
    if (this.modelId.startsWith('amazon.nova')) {
      return {
        messages: [{ role: 'user', content: [{ text: prompt }] }],
        inferenceConfig: { maxTokens: 2048, temperature: 0.7, topP: 0.9 },
      };
    } else if (this.modelId.startsWith('anthropic.claude')) {
      return {
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 2048,
        temperature: 0.7,
        messages: [{ role: 'user', content: prompt }],
      };
    }
    throw new Error(`Unsupported model: ${this.modelId}`);
  }

  private parseResponse(responseBody: any): AIResponse {
    let text = '';
    let tokensUsed = 0;

    if (responseBody.output?.message?.content) {
      text = responseBody.output.message.content[0].text;
      tokensUsed = responseBody.usage?.totalTokens || 0;
    } else if (responseBody.content) {
      text = responseBody.content[0].text;
      tokensUsed = responseBody.usage?.output_tokens || 0;
    }

    return { text, confidence: 0.9, tokensUsed };
  }
}
