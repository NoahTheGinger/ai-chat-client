'use client';

import { useState } from 'react';
import { ChatSettings, ApiProvider, ChatModel } from '@/types';
import { DEFAULT_PROVIDERS } from '@/utils/api';
import ModelSelector from './ModelSelector';
import { 
  CogIcon, 
  KeyIcon, 
  ServerIcon,
  DocumentTextIcon 
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

interface SettingsPanelProps {
  settings: ChatSettings;
  onSettingsChange: (settings: ChatSettings) => void;
  models: ChatModel[];
  isLoadingModels: boolean;
  onRefreshModels: () => void;
}

type SettingsTab = 'model' | 'prompts' | 'api' | 'advanced';

export default function SettingsPanel({ 
  settings, 
  onSettingsChange, 
  models,
  isLoadingModels,
  onRefreshModels
}: SettingsPanelProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('model');
  const [customProvider, setCustomProvider] = useState<ApiProvider>({
    name: '',
    baseUrl: '',
    apiKey: '',
    modelsEndpoint: '/models'
  });
  const [customSelected, setCustomSelected] = useState(false);

  const tabs = [
    { id: 'model' as const, name: 'Model', icon: CogIcon },
    { id: 'prompts' as const, name: 'Prompts', icon: DocumentTextIcon },
    { id: 'api' as const, name: 'API', icon: KeyIcon },
    { id: 'advanced' as const, name: 'Advanced', icon: ServerIcon },
  ];

  const predefinedProviders = Object.values(DEFAULT_PROVIDERS);
  const isCustom = customSelected || !predefinedProviders.some(p => p.baseUrl === settings.apiProvider.baseUrl);

  const handleProviderChange = (provider: ApiProvider) => {
    onSettingsChange({
      ...settings,
      apiProvider: provider,
      selectedModel: null, // Reset model when provider changes
    });
  };

  // The custom provider uses the API key from the field above the form
  const canSaveCustomProvider = Boolean(
    customProvider.name && customProvider.baseUrl && settings.apiProvider.apiKey
  );

  const handleCustomProviderSave = () => {
    if (canSaveCustomProvider) {
      const provider = {
        ...customProvider,
        baseUrl: customProvider.baseUrl.trim().replace(/\/+$/, ''),
        apiKey: settings.apiProvider.apiKey,
      };
      setCustomProvider(provider);
      handleProviderChange(provider);
      setCustomSelected(false);
    }
  };

  return (
    <div className="w-80 sidebar-panel">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="grid grid-cols-2 gap-1 p-2" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'flex items-center justify-center px-2 py-2 text-xs font-medium rounded-md transition-colors min-w-0',
                activeTab === tab.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              )}
            >
              <tab.icon className="w-4 h-4 mr-1 flex-shrink-0" />
              <span className="truncate">{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-4 space-y-6">
        {activeTab === 'model' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Model Selection</h3>
              <button
                onClick={onRefreshModels}
                disabled={isLoadingModels}
                className="btn-secondary text-xs py-1 px-2"
              >
                Refresh
              </button>
            </div>
            
            <ModelSelector
              models={models}
              selectedModel={settings.selectedModel}
              onModelChange={(model) => onSettingsChange({ ...settings, selectedModel: model })}
              isLoading={isLoadingModels}
            />
          </div>
        )}

        {activeTab === 'prompts' && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Prompt Configuration</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                System Prompt
              </label>
              <textarea
                value={settings.systemPrompt}
                onChange={(e) => onSettingsChange({ ...settings, systemPrompt: e.target.value })}
                placeholder="You are a helpful assistant..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500">
                Sets the behavior and personality of the AI assistant
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Developer Prompt
              </label>
              <textarea
                value={settings.developerPrompt}
                onChange={(e) => onSettingsChange({ ...settings, developerPrompt: e.target.value })}
                placeholder="Additional instructions for the AI..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500">
                Additional context or instructions for the conversation
              </p>
            </div>
          </div>
        )}

        {activeTab === 'api' && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">API Configuration</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Provider
              </label>
              <div className="space-y-2">
                {predefinedProviders.map((provider) => (
                  <label key={provider.name} className="flex items-center">
                    <input
                      type="radio"
                      name="provider"
                      checked={!isCustom && settings.apiProvider.baseUrl === provider.baseUrl}
                      onChange={() => {
                        setCustomSelected(false);
                        handleProviderChange({ ...provider, apiKey: settings.apiProvider.apiKey });
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm">{provider.name}</span>
                  </label>
                ))}
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="provider"
                    checked={isCustom}
                    onChange={() => setCustomSelected(true)}
                    className="mr-2"
                  />
                  <span className="text-sm">Custom</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Key
              </label>
              <input
                type="password"
                value={settings.apiProvider.apiKey}
                onChange={(e) => onSettingsChange({
                  ...settings,
                  apiProvider: { ...settings.apiProvider, apiKey: e.target.value }
                })}
                placeholder="Enter your API key..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {isCustom && (
              <div className="space-y-3 border-t pt-4">
                <h4 className="text-sm font-medium text-gray-900">Custom Provider</h4>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={customProvider.name}
                    onChange={(e) => setCustomProvider({ ...customProvider, name: e.target.value })}
                    placeholder="Provider name"
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Base URL</label>
                  <input
                    type="url"
                    value={customProvider.baseUrl}
                    onChange={(e) => setCustomProvider({ ...customProvider, baseUrl: e.target.value })}
                    placeholder="https://api.example.com/v1"
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Models Endpoint</label>
                  <input
                    type="text"
                    value={customProvider.modelsEndpoint}
                    onChange={(e) => setCustomProvider({ ...customProvider, modelsEndpoint: e.target.value })}
                    placeholder="/models"
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                  />
                </div>
                
                <button
                  onClick={handleCustomProviderSave}
                  disabled={!canSaveCustomProvider}
                  className="btn-primary text-sm py-1 px-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Custom Provider
                </button>
                {!settings.apiProvider.apiKey && (
                  <p className="text-xs text-gray-500">Enter your API key above to save.</p>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'advanced' && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Advanced Settings</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Temperature: {settings.temperature}
              </label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={settings.temperature}
                onChange={(e) => onSettingsChange({ ...settings, temperature: parseFloat(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Focused</span>
                <span>Balanced</span>
                <span>Creative</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Tokens
              </label>
              <input
                type="number"
                min="1"
                max="4000"
                value={Number.isNaN(settings.maxTokens) ? '' : settings.maxTokens}
                onChange={(e) => onSettingsChange({ ...settings, maxTokens: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500">
                Maximum number of tokens in the response
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
