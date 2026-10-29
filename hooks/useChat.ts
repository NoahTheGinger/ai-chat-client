'use client';

import { useState, useCallback, useRef } from 'react';
import { Message, ChatSettings, ChatModel } from '@/types';
import { ApiClient, DEFAULT_PROVIDERS } from '@/utils/api';

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [models, setModels] = useState<ChatModel[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [settings, setSettings] = useState<ChatSettings>({
    systemPrompt: 'You are a helpful AI assistant.',
    developerPrompt: '',
    selectedModel: null,
    apiProvider: { ...DEFAULT_PROVIDERS.openrouter, apiKey: '' },
    temperature: 0.7,
    maxTokens: 1000,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchModels = useCallback(async () => {
    if (!settings.apiProvider.apiKey) {
      setModels([]);
      return;
    }

    setIsLoadingModels(true);
    try {
      const apiClient = new ApiClient(settings.apiProvider);
      const fetchedModels = await apiClient.fetchModels();
      setModels(fetchedModels);
      
      // Auto-select first model if none selected
      if (!settings.selectedModel && fetchedModels.length > 0) {
        setSettings(prev => ({ ...prev, selectedModel: fetchedModels[0] }));
      }
    } catch (error) {
      console.error('Failed to fetch models:', error);
      setModels([]);
    } finally {
      setIsLoadingModels(false);
    }
  }, [settings.apiProvider, settings.selectedModel]);

  const sendMessage = useCallback(async (content: string) => {
    if (!settings.selectedModel || !settings.apiProvider.apiKey) {
      alert('Please select a model and provide an API key first.');
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString() + '-user',
      role: 'user',
      content,
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setIsLoading(true);

    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      const apiClient = new ApiClient(settings.apiProvider);
      const combinedPrompt = [settings.systemPrompt, settings.developerPrompt]
        .filter(Boolean)
        .join('\n\n');

      const responseContent = await apiClient.sendMessage(
        newMessages,
        settings.selectedModel.id,
        combinedPrompt,
        settings.temperature,
        settings.maxTokens
      );

      const assistantMessage: Message = {
        id: Date.now().toString() + '-assistant',
        role: 'assistant',
        content: responseContent,
        timestamp: new Date(),
      };

      setMessages([...newMessages, assistantMessage]);
      setIsLoading(false);
    } catch (error) {
      console.error('Error sending message:', error);
      setIsLoading(false);
      
      const errorMessage: Message = {
        id: Date.now().toString() + '-error',
        role: 'assistant',
        content: 'Sorry, there was an error processing your request. Please check your API key and try again.',
        timestamp: new Date(),
      };
      
      setMessages([...newMessages, errorMessage]);
    }
  }, [messages, settings]);

  const clearChat = useCallback(() => {
    setMessages([]);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsLoading(false);
  }, []);

  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsLoading(false);
  }, []);

  return {
    messages,
    isLoading,
    models,
    isLoadingModels,
    settings,
    setSettings,
    sendMessage,
    clearChat,
    stopGeneration,
    fetchModels,
  };
}
