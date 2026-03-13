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
      // Add timeout for chat requests
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout - please try again')), 25000); // 25 second timeout
      });

      const apiPromise = apiClient.post<ChatResponse>('/api/chat', {
        sessionId,
        message,
        language,
        voiceInput,
      });

      const response = await Promise.race([apiPromise, timeoutPromise]) as ChatResponse;

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
      let errorMessage = 'Failed to send message';
      
      if (err.message?.includes('timeout')) {
        errorMessage = 'Response is taking longer than expected. Please try again.';
      } else if (err.message?.includes('Both backends failed')) {
        errorMessage = 'Service temporarily unavailable. Please try again in a moment.';
      } else if (err.statusCode === 429) {
        errorMessage = 'Too many requests. Please wait a moment and try again.';
      } else {
        errorMessage = err.message || errorMessage;
      }
      
      setError(errorMessage);
      
      // Add error message to chat
      const errorAssistantMessage: Message = {
        role: 'assistant',
        content: `Sorry, ${errorMessage} Please try asking your question again.`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorAssistantMessage]);
      
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
