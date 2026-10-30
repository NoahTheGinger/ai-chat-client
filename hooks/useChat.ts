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
  const modelsRequestRef = useRef(0);

  const fetchModels = useCallback(async () => {
    // Only the most recent request may update state, so a slow response can't overwrite a newer one
    const requestId = ++modelsRequestRef.current;

    if (!settings.apiProvider.apiKey) {
      setModels([]);
      setIsLoadingModels(false);
      return;
    }

    setIsLoadingModels(true);
    try {
      const apiClient = new ApiClient(settings.apiProvider);
      const fetchedModels = await apiClient.fetchModels();
      if (requestId !== modelsRequestRef.current) return;
      setModels(fetchedModels);

      // Auto-select first model if none selected
      setSettings(prev =>
        prev.selectedModel || fetchedModels.length === 0
          ? prev
          : { ...prev, selectedModel: fetchedModels[0] }
      );
    } catch (error) {
      if (requestId !== modelsRequestRef.current) return;
      console.error('Failed to fetch models:', error);
      setModels([]);
    } finally {
      if (requestId === modelsRequestRef.current) {
        setIsLoadingModels(false);
      }
    }
  }, [settings.apiProvider]);

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

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const assistantId = Date.now().toString() + '-assistant';
    let assistantContent = '';

    try {
      const apiClient = new ApiClient(settings.apiProvider);
      const combinedPrompt = [settings.systemPrompt, settings.developerPrompt]
        .filter(Boolean)
        .join('\n\n');

      const stream = apiClient.streamMessage(
        newMessages,
        settings.selectedModel.id,
        combinedPrompt,
        settings.temperature,
        settings.maxTokens,
        controller.signal
      );

      for await (const token of stream) {
        assistantContent += token;
        const text = assistantContent;

        // The assistant message is created on the first token, then grows in place
        setMessages(prev =>
          prev.some(m => m.id === assistantId)
            ? prev.map(m => (m.id === assistantId ? { ...m, content: text } : m))
            : [...prev, { id: assistantId, role: 'assistant', content: text, timestamp: new Date() }]
        );
      }

      if (!assistantContent) {
        throw new Error('No content received from API');
      }
    } catch (error) {
      // Stopping or clearing aborts the request; keep whatever has streamed so far
      if (!controller.signal.aborted) {
        console.error('Error sending message:', error);

        const detail = error instanceof Error && error.message ? ` (${error.message})` : '';
        const errorMessage: Message = {
          id: Date.now().toString() + '-error',
          role: 'assistant',
          content: `Sorry, there was an error processing your request${detail}. Please check your API key and try again.`,
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, errorMessage]);
      }
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
        setIsLoading(false);
      }
    }
  }, [messages, settings]);

  const clearChat = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setMessages([]);
    setIsLoading(false);
  }, []);

  const stopGeneration = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
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
