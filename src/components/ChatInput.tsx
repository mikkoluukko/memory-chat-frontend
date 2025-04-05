import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import dynamic from 'next/dynamic';

// Import VoiceButton with no SSR to avoid hydration issues
const DynamicVoiceButton = dynamic(() => import('./VoiceButton').then(mod => ({ default: mod.VoiceButton })), {
  ssr: false
});

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSendMessage, disabled = false }: ChatInputProps) {
  // Use uncontrolled input with ref instead
  const inputRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);
  const [hasText, setHasText] = useState(false);

  // Set mounted state for client-side only features
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Track input value changes for submit button state
  const handleInputChange = () => {
    setHasText(!!inputRef.current?.value.trim());
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Get value from ref instead of state
    const message = inputRef.current?.value || '';
    
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      
      // Clear input field directly
      if (inputRef.current) {
        inputRef.current.value = '';
        inputRef.current.focus();
        setHasText(false);
      }
    }
  };

  // Handle speech recognition result
  const handleSpeechResult = (text: string) => {
    // Set value directly on input element
    if (inputRef.current) {
      inputRef.current.value = text;
      setHasText(!!text.trim());
      
      try {
        // Force focus and activate the input
        inputRef.current.focus();
        
        // Trigger input event to notify other handlers
        const event = new Event('input', { bubbles: true });
        inputRef.current.dispatchEvent(event);
        
        // Also trigger a change event for good measure
        const changeEvent = new Event('change', { bubbles: true });
        inputRef.current.dispatchEvent(changeEvent);
        
        // Position cursor at the end
        const length = text.length;
        inputRef.current.setSelectionRange(length, length);
        
        // Make sure the content is visible (scroll to end if needed)
        if (length > 0) {
          inputRef.current.scrollLeft = inputRef.current.scrollWidth;
        }
      } catch (e) {
        console.error("Error after voice input:", e);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 p-4">
      {mounted && (
        <DynamicVoiceButton onSpeechResult={handleSpeechResult} disabled={disabled} />
      )}
      <input
        ref={inputRef}
        type="text"
        defaultValue=""
        onChange={handleInputChange}
        onInput={handleInputChange}
        placeholder="Type your message..."
        className="flex-1 p-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500"
        disabled={disabled}
        autoComplete="off"
        spellCheck="true"
      />
      <button
        type="submit"
        disabled={disabled || !hasText}
        className="p-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
      >
        <Send className="w-5 h-5" />
      </button>
    </form>
  );
} 