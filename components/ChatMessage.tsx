'use client';

import { Message } from '@/types';
import { UserIcon, CpuChipIcon } from '@heroicons/react/24/outline';
import ReactMarkdown from 'react-markdown';

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  if (isSystem) {
    return (
      <div className="flex justify-center my-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2 text-sm text-yellow-800">
          <strong>System:</strong> {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className={`chat-message flex gap-4 p-6 ${isUser ? 'bg-white' : 'bg-gray-50'}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'
      }`}>
        {isUser ? (
          <UserIcon className="w-5 h-5" />
        ) : (
          <CpuChipIcon className="w-5 h-5" />
        )}
      </div>
      
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-gray-900">
            {isUser ? 'You' : 'Assistant'}
          </span>
          <span className="text-xs text-gray-500">
            {message.timestamp.toLocaleTimeString()}
          </span>
        </div>
        
        <div className="prose prose-sm max-w-none text-gray-800">
          <ReactMarkdown className="whitespace-pre-wrap">
            {message.content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
