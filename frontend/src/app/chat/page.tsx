'use client';

import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../lib/context/language-context';
import { useChat } from '../../lib/hooks/use-chat';
import { WebSpeechProvider } from '../../lib/voice/web-speech-provider';
import { Layout } from '../components/Layout';
import { SchemeCard } from '../components/SchemeCard';
import { Mic, MicOff, Send } from 'lucide-react';
import { schemesDataService } from '../../lib/services/schemes-data.service';

interface ParsedScheme {
  scheme_id: string;
  scheme_name: string;
  scheme_name_hi?: string;
  category: string;
  financial_assistance?: string;
  benefit_type?: string;
  short_description?: string;
  matchPercentage?: number;
  eligibilityReason?: string;
  geographic_criteria?: string;
  theme_color?: string;
}

export default function ChatPage() {
  const { language, t } = useLanguage();
  const { messages, isLoading, error, sendMessage } = useChat();
  
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceProvider, setVoiceProvider] = useState<WebSpeechProvider | null>(null);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [chatSessionId] = useState(() => `chat-${Date.now()}`); // Generate session ID
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const provider = new WebSpeechProvider();
    setVoiceProvider(provider);
    setVoiceSupported(provider.isAvailable());
    
    // Load schemes data
    schemesDataService.loadSchemes();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant' && voiceProvider && voiceSupported) {
        handleSpeak(lastMessage.content);
      }
    }
  }, [messages]);

  const handleSendMessage = async () => {
    // Prevent sending if already loading or input is empty
    if (!input.trim() || isLoading) return;

    const messageToSend = input.trim();
    
    try {
      // Clear input immediately to prevent double-send
      setInput('');
      
      await sendMessage(messageToSend, language, false);
      inputRef.current?.focus();
    } catch (err) {
      console.error('Failed to send message:', err);
      // Restore input on error
      setInput(messageToSend);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleVoiceInput = async () => {
    if (!voiceProvider || !voiceSupported) {
      alert(t('error') + ': Voice input not supported in this browser');
      return;
    }

    if (isListening) {
      voiceProvider.stopListening();
      setIsListening(false);
      return;
    }

    try {
      setIsListening(true);
      const result = await voiceProvider.speechToText(language);
      
      if (result.text) {
        setInput(result.text);
        await sendMessage(result.text, language, true);
        setInput('');
      }
    } catch (err: any) {
      console.error('Voice input error:', err);
      alert(t('error') + ': ' + (err.message || 'Voice input failed'));
    } finally {
      setIsListening(false);
    }
  };

  const handleSpeak = async (text: string) => {
    if (!voiceProvider || !voiceSupported || isSpeaking) return;

    try {
      setIsSpeaking(true);
      await voiceProvider.textToSpeech(text, language);
    } catch (err) {
      console.error('Text-to-speech error:', err);
    } finally {
      setIsSpeaking(false);
    }
  };

  const stopSpeaking = () => {
    if (voiceProvider) {
      voiceProvider.stopSpeaking();
      setIsSpeaking(false);
    }
  };

  // Parse schemes from AI response - ONLY from structured backend data
  const parseSchemes = (content: string): { schemes: ParsedScheme[]; textContent: string } => {
    const schemes: ParsedScheme[] = [];
    let textContent = content;

    // ONLY parse schemes if backend sends structured data with [SCHEME_DATA] tags
    const schemeDataPattern = /\[SCHEME_DATA\]([\s\S]*?)\[\/SCHEME_DATA\]/g;
    const matches = content.matchAll(schemeDataPattern);

    for (const match of matches) {
      try {
        const schemesData = JSON.parse(match[1]);
        if (Array.isArray(schemesData)) {
          schemes.push(...schemesData);
        }
        // Remove the scheme data tag from text content
        textContent = textContent.replace(match[0], '');
      } catch (e) {
        console.error('Failed to parse scheme data:', e);
      }
    }

    return { schemes, textContent: textContent.trim() };
  };

  return (
    <Layout>
      <div
        className="min-h-[calc(100vh-4rem)] flex flex-col"
        style={{ background: 'linear-gradient(160deg, #eef2ff 0%, #f8fafc 50%, #f0fdf4 100%)' }}
      >
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
            {/* Welcome Message */}
            {messages.length === 0 && (
              <div className="text-center text-gray-600 py-12">
                <div className="text-6xl mb-4">👋</div>
                <h2 className="text-2xl font-bold mb-2">{t('welcome')}</h2>
                <p className="text-lg mb-6">
                  {language === 'hi' ? 'मुझसे सरकारी योजनाओं के बारे में पूछें' : 'Ask me about government schemes'}
                </p>
                <div className="flex justify-center gap-4 flex-wrap">
                  <button
                    onClick={() => setInput(language === 'hi' ? 'मुझे शिक्षा योजनाओं के बारे में बताएं' : 'Tell me about education schemes')}
                    className="px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition-shadow text-sm"
                  >
                    {language === 'hi' ? '📚 शिक्षा योजनाएं' : '📚 Education Schemes'}
                  </button>
                  <button
                    onClick={() => setInput(language === 'hi' ? 'मुझे स्वास्थ्य योजनाओं के बारे में बताएं' : 'Tell me about health schemes')}
                    className="px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition-shadow text-sm"
                  >
                    {language === 'hi' ? '🏥 स्वास्थ्य योजनाएं' : '🏥 Health Schemes'}
                  </button>
                  <button
                    onClick={() => setInput(language === 'hi' ? 'मुझे कृषि योजनाओं के बारे में बताएं' : 'Tell me about agriculture schemes')}
                    className="px-4 py-2 bg-white rounded-lg shadow hover:shadow-md transition-shadow text-sm"
                  >
                    {language === 'hi' ? '🌾 कृषि योजनाएं' : '🌾 Agriculture Schemes'}
                  </button>
                </div>
              </div>
            )}

            {/* Messages */}
            {messages.map((msg, idx) => {
              if (msg.role === 'user') {
                return (
                  <div key={idx} className="flex justify-end">
                    <div className="max-w-[75%] rounded-2xl px-5 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white">
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    </div>
                  </div>
                );
              }

              // Parse assistant message for schemes
              const { schemes, textContent } = parseSchemes(msg.content);

              return (
                <div key={idx} className="flex justify-start">
                  <div className="max-w-[85%] w-full space-y-4">
                    {/* Text Content */}
                    {textContent && (
                      <div
                        className="rounded-2xl px-5 py-3 bg-white text-gray-900 shadow-md border border-blue-100"
                        style={{ borderLeft: '3px solid #15803d' }}
                      >
                        <p className="whitespace-pre-wrap leading-relaxed">{textContent}</p>
                        {voiceSupported && (
                          <button
                            onClick={() => handleSpeak(textContent)}
                            className="mt-2 text-xs text-gray-500 hover:text-blue-600 flex items-center gap-1"
                          >
                            🔊 {language === 'hi' ? 'सुनें' : 'Listen'}
                          </button>
                        )}
                      </div>
                    )}

                    {/* Scheme Cards */}
                    {schemes.length > 0 && (
                      <div className="space-y-4">
                        {schemes.length > 1 && (
                          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                            <p className="text-sm font-semibold text-blue-900">
                              {language === 'hi' 
                                ? `✨ ${schemes.length} योजनाएं मिलीं जो आपके लिए उपयुक्त हैं` 
                                : `✨ Found ${schemes.length} schemes that match your profile`}
                            </p>
                          </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {schemes.map((scheme, schemeIdx) => (
                            <SchemeCard
                              key={schemeIdx}
                              scheme={scheme}
                              language={language}
                              fromChat={true}
                              chatSessionId={chatSessionId}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl px-5 py-3 shadow-md border border-blue-100">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
                <p className="font-medium">{t('error')}</p>
                <p className="text-sm">{error}</p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Voice Status Indicator */}
        {(isListening || isSpeaking) && (
          <div className="bg-blue-600 text-white py-2 px-4 text-center">
            {isListening && (
              <div className="flex items-center justify-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <span>{t('listening')}</span>
              </div>
            )}
            {isSpeaking && (
              <div className="flex items-center justify-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span>{t('speaking')}</span>
                <button onClick={stopSpeaking} className="ml-4 px-3 py-1 bg-white text-blue-600 rounded text-sm">
                  {t('stop')}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 shadow-lg">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex gap-2">
              {/* Voice Input Button */}
              {voiceSupported && (
                <button
                  onClick={handleVoiceInput}
                  disabled={isLoading || isSpeaking}
                  className={`p-3 rounded-lg transition-all ${
                    isListening
                      ? 'bg-red-600 text-white animate-pulse'
                      : 'bg-gradient-to-r from-orange-400 to-orange-500 text-white hover:from-orange-500 hover:to-orange-600'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  title={isListening ? t('stopVoice') : t('startVoice')}
                >
                  {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                </button>
              )}

              {/* Text Input */}
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t('typeMessage')}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isLoading || isListening}
              />

              {/* Send Button */}
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !input.trim() || isListening}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
              >
                <Send size={18} />
                {t('send')}
              </button>
            </div>

            {/* Voice Support Info */}
            {!voiceSupported && (
              <p className="text-xs text-gray-500 mt-2 text-center">
                {language === 'hi' ? 'वॉयस इनपुट इस ब्राउज़र में समर्थित नहीं है' : 'Voice input not supported in this browser'}
              </p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
