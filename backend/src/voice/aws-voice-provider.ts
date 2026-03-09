/**
 * AWS Voice Provider
 * Implements voice provider using Amazon Transcribe and Amazon Polly
 */

import {
  TranscribeClient,
  StartTranscriptionJobCommand,
  GetTranscriptionJobCommand,
} from '@aws-sdk/client-transcribe';
import {
  PollyClient,
  SynthesizeSpeechCommand,
  VoiceId,
  Engine,
  OutputFormat,
} from '@aws-sdk/client-polly';
import { BaseVoiceProvider } from './base-provider';
import { VoiceProviderError } from '../types';

export class AWSVoiceProvider extends BaseVoiceProvider {
  private transcribeClient: TranscribeClient;
  private pollyClient: PollyClient;
  private voiceMap: Record<string, VoiceId>;

  constructor(region: string = 'us-east-1') {
    super('aws-voice', ['en', 'hi']);

    this.transcribeClient = new TranscribeClient({ region });
    this.pollyClient = new PollyClient({ region });

    // Voice ID mapping for different languages
    this.voiceMap = {
      'hi': process.env.AWS_POLLY_VOICE_ID_HI as VoiceId || 'Aditi',
      'en': process.env.AWS_POLLY_VOICE_ID_EN as VoiceId || 'Joanna',
    };
  }

  /**
   * Convert speech to text using Amazon Transcribe
   */
  async speechToText(audio: Buffer | Blob, language: 'hi' | 'en'): Promise<string> {
    this.validateLanguage(language);

    try {
      // Note: Amazon Transcribe requires audio to be uploaded to S3 first
      // For a complete implementation, you would:
      // 1. Upload audio to S3
      // 2. Start transcription job
      // 3. Poll for completion
      // 4. Retrieve transcript
      
      // This is a simplified implementation
      throw new VoiceProviderError(
        'Amazon Transcribe requires S3 integration. Use Web Speech API for browser-based transcription.',
        undefined
      );
    } catch (error: any) {
      throw new VoiceProviderError(`Transcribe error: ${error.message}`, error);
    }
  }

  /**
   * Convert text to speech using Amazon Polly
   */
  async textToSpeech(text: string, language: 'hi' | 'en', voiceId?: string): Promise<Buffer | Blob> {
    this.validateLanguage(language);

    try {
      const voice = voiceId || this.voiceMap[language];
      const languageCode = language === 'hi' ? 'hi-IN' : 'en-US';

      const command = new SynthesizeSpeechCommand({
        Text: text,
        OutputFormat: OutputFormat.MP3,
        VoiceId: voice as VoiceId,
        Engine: Engine.NEURAL,
        LanguageCode: languageCode,
      });

      const response = await this.pollyClient.send(command);

      if (!response.AudioStream) {
        throw new Error('No audio stream returned from Polly');
      }

      // Convert stream to buffer
      const chunks: Uint8Array[] = [];
      for await (const chunk of response.AudioStream as any) {
        chunks.push(chunk);
      }

      return Buffer.concat(chunks);
    } catch (error: any) {
      throw new VoiceProviderError(`Polly error: ${error.message}`, error);
    }
  }

  /**
   * Check if AWS services are available
   */
  async isAvailable(): Promise<boolean> {
    try {
      // Try a simple Polly call to check availability
      const command = new SynthesizeSpeechCommand({
        Text: 'test',
        OutputFormat: OutputFormat.MP3,
        VoiceId: this.voiceMap['en'],
      });

      await this.pollyClient.send(command);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get available voices for a language
   */
  getVoiceForLanguage(language: 'hi' | 'en'): VoiceId {
    return this.voiceMap[language];
  }
}
