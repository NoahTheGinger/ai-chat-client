export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface ChatModel {
  id: string;
  name: string;
  description?: string;
  context_length?: number;
  pricing?: {
    prompt: string;
    completion: string;
  };
}

export interface ApiProvider {
  name: string;
  baseUrl: string;
  apiKey: string;
  modelsEndpoint?: string;
}

export interface ChatSettings {
  systemPrompt: string;
  developerPrompt: string;
  selectedModel: ChatModel | null;
  apiProvider: ApiProvider;
  temperature: number;
  maxTokens: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  settings: ChatSettings;
}
