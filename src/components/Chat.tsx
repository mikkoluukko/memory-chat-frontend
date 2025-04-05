'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChatInput } from './ChatInput';
import { ChatMessage } from './ChatMessage';
import dynamic from 'next/dynamic';

// Import VoiceButton with no SSR to avoid hydration issues
const DynamicVoiceButton = dynamic(() => import('./VoiceButton').then(mod => ({ default: mod.VoiceButton })), {
  ssr: false
});

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // For now, using a hardcoded userId. In production, this would come from authentication
  const userId = 'test-user-123';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  // Set mounted state for client-side only features
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const scrollToBottom = () => {
    if (messagesEndRef.current?.scrollIntoView) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (message: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch(`${apiUrl}/api/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      // Clean up the AI response by removing the instruction format
      const cleanResponse = data.response.replace(/<s>\[INST\].*?\[\/INST\]\s*/s, '');
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: cleanResponse,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, there was an error processing your message.',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-2xl mx-auto bg-gray-50 rounded-lg shadow-lg">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message) => (
          <div key={message.id} className="mb-4">
            <ChatMessage
              message={message.content}
              isUser={message.isUser}
              timestamp={message.timestamp}
            />
            {!message.isUser && isMounted && (
              <div className="flex justify-end mt-1">
                <DynamicVoiceButton 
                  text={message.content} 
                  onSpeechResult={() => {}} 
                  disabled={isLoading} 
                />
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="sticky bottom-0 bg-white border-t border-gray-200">
        <ChatInput onSendMessage={handleSendMessage} disabled={isLoading} />
      </div>
    </div>
  );
} 