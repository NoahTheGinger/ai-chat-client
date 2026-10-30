import { ApiProvider, ChatModel, Message } from '@/types';
import { readStream } from '@/utils/streaming';

interface RawModel {
  id: string;
  name?: string;
  description?: string;
  context_length?: number;
  max_context_length?: number;
  pricing?: ChatModel['pricing'];
}

export class ApiClient {
  private provider: ApiProvider;

  constructor(provider: ApiProvider) {
    this.provider = provider;
  }

  async fetchModels(): Promise<ChatModel[]> {
    try {
      const modelsEndpoint = this.provider.modelsEndpoint || '/models';
      const response = await fetch(`${this.provider.baseUrl}${modelsEndpoint}`, {
        headers: {
          'Authorization': `Bearer ${this.provider.apiKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Handle different API response formats
      const models = data.data || data.models || data;
      
      return models.map((model: RawModel) => ({
        id: model.id,
        name: model.name || model.id,
        description: model.description,
        context_length: model.context_length || model.max_context_length,
        pricing: model.pricing,
      }));
    } catch (error) {
      console.error('Error fetching models:', error);
      throw error;
    }
  }

  async *streamMessage(
    messages: Message[],
    model: string,
    systemPrompt?: string,
    temperature: number = 0.7,
    maxTokens: number = 1000,
    signal?: AbortSignal
  ): AsyncGenerator<string> {
    const chatMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));

    // Add system prompt if provided
    if (systemPrompt && systemPrompt.trim()) {
      chatMessages.unshift({
        role: 'system',
        content: systemPrompt,
      });
    }

    const response = await fetch(`${this.provider.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.provider.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: chatMessages,
        temperature,
        ...(Number.isFinite(maxTokens) && maxTokens > 0 ? { max_tokens: maxTokens } : {}),
        stream: true,
      }),
      signal,
    });

    if (!response.ok) {
      const details = await response.json().then(body => body?.error?.message, () => undefined);
      throw new Error(details || `API request failed: ${response.statusText || response.status}`);
    }

    // Some providers ignore stream: true and reply with plain JSON
    if (response.headers.get('content-type')?.includes('application/json')) {
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('No content received from API');
      }
      yield content;
      return;
    }

    yield* readStream(response);
  }
}

export const DEFAULT_PROVIDERS = {
  openrouter: {
    name: 'OpenRouter',
    baseUrl: 'https://openrouter.ai/api/v1',
    apiKey: '',
    modelsEndpoint: '/models',
  },
  openai: {
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    apiKey: '',
    modelsEndpoint: '/models',
  },
};
