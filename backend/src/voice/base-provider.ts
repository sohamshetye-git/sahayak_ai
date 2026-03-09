/**
 * Base Voice Provider
 * Abstract base class for voice provider implementations
 */

import { VoiceProvider } from '../types';

export abstract class BaseVoiceProvider implements VoiceProvider {
  constructor(
    protected providerName: string,
    protected supportedLanguages: string[] = ['en', 'hi']
  ) {}

  abstract speechToText(audio: Buffer | Blob, language: 'hi' | 'en'): Promise<string>;
  abstract textToSpeech(text: string, language: 'hi' | 'en', voiceId?: string): Promise<Buffer | Blob>;
  abstract isAvailable(): Promise<boolean>;
  abstract isAvailable(): Promise<boolean>;

  getSupportedLanguages(): string[] {
    return this.supportedLanguages;
  }

  getName(): string {
    return this.providerName;
  }

  /**
   * Validate language is supported
   */
  protected validateLanguage(language: string): void {
    if (!this.supportedLanguages.includes(language)) {
      throw new Error(`Language ${language} not supported by ${this.providerName}`);
    }
  }
}
