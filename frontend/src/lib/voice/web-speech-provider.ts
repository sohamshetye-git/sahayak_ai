/**
 * Web Speech Provider
 * Browser-based voice provider using Web Speech API
 */

export class WebSpeechProvider {
  private recognition: any = null;
  private synthesis: SpeechSynthesis | null = null;
  private isRecording: boolean = false;
  private recognitionTimeout: NodeJS.Timeout | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      // Initialize Speech Recognition
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = true; // Enable interim results for better UX
        this.recognition.maxAlternatives = 1;
      }

      // Initialize Speech Synthesis
      if ('speechSynthesis' in window) {
        this.synthesis = window.speechSynthesis;
      }
    }
  }

  /**
   * Check if Web Speech API is available
   */
  isAvailable(): boolean {
    return this.recognition !== null && this.synthesis !== null;
  }

  /**
   * Convert speech to text with improved error handling
   */
  async speechToText(language: 'hi' | 'en' = 'en'): Promise<{ text: string; confidence?: number }> {
    if (!this.recognition) {
      throw new Error('Speech recognition not available in this browser');
    }

    if (this.isRecording) {
      throw new Error('Already recording');
    }

    return new Promise((resolve, reject) => {
      let finalTranscript = '';
      let interimTranscript = '';

      // Set language
      this.recognition.lang = language === 'hi' ? 'hi-IN' : 'en-US';

      // Clear any previous timeout
      if (this.recognitionTimeout) {
        clearTimeout(this.recognitionTimeout);
        this.recognitionTimeout = null;
      }

      this.recognition.onstart = () => {
        console.log('Voice recognition started');
        this.isRecording = true;
        
        // Set a timeout to auto-stop after 30 seconds
        this.recognitionTimeout = setTimeout(() => {
          if (this.isRecording) {
            console.log('Voice recognition timeout - stopping');
            this.recognition.stop();
          }
        }, 30000);
      };

      this.recognition.onresult = (event: any) => {
        console.log('Voice recognition result received');
        interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          const confidence = event.results[i][0].confidence;
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
            console.log('Final transcript:', transcript, 'Confidence:', confidence);
          } else {
            interimTranscript += transcript;
            console.log('Interim transcript:', transcript);
          }
        }
      };

      this.recognition.onspeechend = () => {
        console.log('Speech ended');
        this.recognition.stop();
      };

      this.recognition.onend = () => {
        console.log('Voice recognition ended');
        this.isRecording = false;
        
        if (this.recognitionTimeout) {
          clearTimeout(this.recognitionTimeout);
          this.recognitionTimeout = null;
        }

        const result = finalTranscript || interimTranscript;
        
        if (result.trim()) {
          resolve({ text: result.trim() });
        } else {
          reject(new Error('No speech detected. Please try again.'));
        }
      };

      this.recognition.onerror = (event: any) => {
        console.error('Voice recognition error:', event.error);
        this.isRecording = false;
        
        if (this.recognitionTimeout) {
          clearTimeout(this.recognitionTimeout);
          this.recognitionTimeout = null;
        }

        let errorMessage = 'Speech recognition error';
        
        switch (event.error) {
          case 'no-speech':
            errorMessage = 'No speech detected. Please try speaking again.';
            break;
          case 'audio-capture':
            errorMessage = 'Microphone not found. Please check your microphone.';
            break;
          case 'not-allowed':
            errorMessage = 'Microphone permission denied. Please allow microphone access.';
            break;
          case 'network':
            errorMessage = 'Network error. Please check your internet connection.';
            break;
          case 'aborted':
            errorMessage = 'Speech recognition was aborted.';
            break;
          default:
            errorMessage = `Speech recognition error: ${event.error}`;
        }
        
        reject(new Error(errorMessage));
      };

      // Start recognition
      try {
        this.recognition.start();
        console.log('Starting voice recognition...');
      } catch (error: any) {
        this.isRecording = false;
        reject(new Error(`Failed to start voice recognition: ${error.message}`));
      }
    });
  }

  /**
   * Stop recording
   */
  stopListening(): void {
    if (this.recognition && this.isRecording) {
      console.log('Manually stopping voice recognition');
      this.recognition.stop();
      this.isRecording = false;
      
      if (this.recognitionTimeout) {
        clearTimeout(this.recognitionTimeout);
        this.recognitionTimeout = null;
      }
    }
  }

  /**
   * Check if currently listening
   */
  isListening(): boolean {
    return this.isRecording;
  }

  /**
   * Convert text to speech with improved voice selection
   */
  async textToSpeech(text: string, language: 'hi' | 'en' = 'en'): Promise<void> {
    if (!this.synthesis) {
      throw new Error('Speech synthesis not available in this browser');
    }

    return new Promise((resolve, reject) => {
      // Cancel any ongoing speech
      this.synthesis!.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
      utterance.rate = 0.9; // Slightly slower for better comprehension
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Wait for voices to load
      const setVoice = () => {
        const voices = this.synthesis!.getVoices();
        
        // Try to find a voice for the specified language
        const voice = voices.find((v) => {
          if (language === 'hi') {
            return v.lang.startsWith('hi') || v.lang.includes('Hindi');
          } else {
            return v.lang.startsWith('en-IN') || v.lang.startsWith('en-US') || v.lang.startsWith('en');
          }
        });

        if (voice) {
          utterance.voice = voice;
          console.log('Using voice:', voice.name, voice.lang);
        } else {
          console.warn('No suitable voice found for language:', language);
        }
      };

      // Set voice immediately if available
      if (this.synthesis!.getVoices().length > 0) {
        setVoice();
      } else {
        // Wait for voices to load
        this.synthesis!.addEventListener('voiceschanged', setVoice, { once: true });
      }

      utterance.onstart = () => {
        console.log('Speech synthesis started');
      };

      utterance.onend = () => {
        console.log('Speech synthesis ended');
        resolve();
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        reject(new Error(`Speech synthesis error: ${event.error}`));
      };

      this.synthesis!.speak(utterance);
    });
  }

  /**
   * Stop speech synthesis
   */
  stopSpeaking(): void {
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }

  /**
   * Pause speech synthesis
   */
  pauseSpeaking(): void {
    if (this.synthesis && this.synthesis.speaking) {
      this.synthesis.pause();
    }
  }

  /**
   * Resume speech synthesis
   */
  resumeSpeaking(): void {
    if (this.synthesis && this.synthesis.paused) {
      this.synthesis.resume();
    }
  }

  /**
   * Check if currently speaking
   */
  isSpeaking(): boolean {
    return this.synthesis ? this.synthesis.speaking : false;
  }

  /**
   * Get available voices
   */
  getVoices(): SpeechSynthesisVoice[] {
    return this.synthesis ? this.synthesis.getVoices() : [];
  }

  /**
   * Get supported languages
   */
  getSupportedLanguages(): string[] {
    return ['en', 'hi'];
  }
}

// Singleton instance
let webSpeechProviderInstance: WebSpeechProvider | null = null;

export function getWebSpeechProvider(): WebSpeechProvider {
  if (!webSpeechProviderInstance) {
    webSpeechProviderInstance = new WebSpeechProvider();
  }
  return webSpeechProviderInstance;
}
