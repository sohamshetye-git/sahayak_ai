/**
 * Chat Hook
 * React hook for chat functionality
 */

'use client';

import { useState, useCallback } from 'react';
import { apiClient } from '../api-client';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatResponse {
  sessionId: string;
  response: string;
  userProfile?: any;
  suggestedActions?: string[];
}

export function useChat(initialSessionId?: string) {
  const [sessionId, setSessionId] = useState<string | undefined>(initialSessionId);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Namaste! I'm Sahayak AI, your smart assistant for government schemes. Tell me about yourself, and I'll help you find the best schemes you're eligible for.",
      timestamp: new Date(),
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (
    message: string,
    language: string = 'en',
    voiceInput: boolean = false
  ) => {
    setIsLoading(true);
    setError(null);

    // Add user message
    const userMessage: Message = {
      role: 'user',
      content: message,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await apiClient.post<ChatResponse>('/api/chat', {
        sessionId,
        message,
        language,
        voiceInput,
      });

      // Update session ID
      if (response.sessionId) {
        setSessionId(response.sessionId);
      }

      // Add assistant message
      const assistantMessage: Message = {
        role: 'assistant',
        content: response.response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);

      return response;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to send message';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setSessionId(undefined);
    setError(null);
  }, []);

  return {
    sessionId,
    messages,
    isLoading,
    error,
    sendMessage,
    clearChat,
  };
}
