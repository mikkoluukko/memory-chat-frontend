import React from 'react';

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  timestamp: Date;
}

export function ChatMessage({ message, isUser, timestamp }: ChatMessageProps) {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[70%] rounded-lg p-4 ${
          isUser
            ? 'bg-blue-600 text-white'
            : 'bg-white text-gray-900 shadow-sm border border-gray-200'
        }`}
      >
        <p className="text-sm leading-relaxed">{message}</p>
        <span className={`text-xs mt-2 block ${isUser ? 'text-blue-100' : 'text-gray-500'}`}>
          {timestamp.toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
} 