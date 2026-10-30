'use client';

import { useEffect, useState } from 'react';
import { useChat } from '@/hooks/useChat';
import ChatHistory from '@/components/ChatHistory';
import ChatInput from '@/components/ChatInput';
import SettingsPanel from '@/components/SettingsPanel';
import { 
  Cog6ToothIcon, 
  XMarkIcon,
  TrashIcon,
  StopIcon,
} from '@heroicons/react/24/outline';
import clsx from 'clsx';

export default function ChatPage() {
  const {
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
  } = useChat();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Reload models when the provider or key changes, waiting for typing to settle
  useEffect(() => {
    const timeout = setTimeout(fetchModels, 400);
    return () => clearTimeout(timeout);
  }, [fetchModels]);

  return (
    <div className="h-full flex">
      {/* Settings Sidebar */}
      <div className={clsx(
        'transition-all duration-300 ease-in-out',
        isSettingsOpen ? 'w-80' : 'w-0',
        'overflow-hidden'
      )}>
        <SettingsPanel
          settings={settings}
          onSettingsChange={setSettings}
          models={models}
          isLoadingModels={isLoadingModels}
          onRefreshModels={fetchModels}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 bg-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isSettingsOpen ? (
                <XMarkIcon className="w-5 h-5" />
              ) : (
                <Cog6ToothIcon className="w-5 h-5" />
              )}
            </button>
            
            <div className="flex flex-col">
              <h1 className="text-lg font-semibold text-gray-900">AI Chat Client</h1>
              {settings.selectedModel && (
                <p className="text-sm text-gray-500">{settings.selectedModel.name}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isLoading && (
              <button
                onClick={stopGeneration}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                <StopIcon className="w-4 h-4" />
                Stop
              </button>
            )}
            
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                disabled={isLoading}
                className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <TrashIcon className="w-4 h-4" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* API Key Warning */}
        {!settings.apiProvider.apiKey && (
          <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-3">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  Please configure your API key and select a model in the settings to start chatting.
                </p>
              </div>
              <div className="ml-auto">
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="text-sm font-medium text-yellow-700 hover:text-yellow-600"
                >
                  Open Settings
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Chat Messages */}
        <ChatHistory
          messages={messages}
          isLoading={isLoading && messages[messages.length - 1]?.role === 'user'}
        />

        {/* Chat Input */}
        <ChatInput
          onSendMessage={sendMessage}
          disabled={isLoading || !settings.selectedModel || !settings.apiProvider.apiKey}
          placeholder={
            !settings.apiProvider.apiKey
              ? "Please configure your API key first..."
              : !settings.selectedModel
              ? "Please select a model first..."
              : "Type your message..."
          }
        />
      </div>
    </div>
  );
}
