'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, StopCircle, Volume2, VolumeX } from 'lucide-react';
import { useSpeechRecognition, useSpeechSynthesis } from './VoiceSupport';

interface VoiceButtonProps {
  onSpeechResult: (text: string) => void;
  disabled?: boolean;
  text?: string; // Text to speak for TTS
}

// Default export for dynamic import
function VoiceButton({ onSpeechResult, disabled = false, text }: VoiceButtonProps) {
  // All state hooks first
  const [mounted, setMounted] = useState(false);
  const textRef = useRef<string | undefined>(undefined);

  // All custom hooks after state hooks
  const { 
    transcript, 
    isListening, 
    error: recognitionError, 
    startListening, 
    stopListening, 
    isSupported: recognitionSupported,
    setTranscript
  } = useSpeechRecognition();

  const { 
    speak, 
    stop: stopSpeaking, 
    isSpeaking, 
    error: synthesisError, 
    isSupported: synthesisSupported 
  } = useSpeechSynthesis();
  
  // All useEffects after hooks
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);
  
  useEffect(() => {
    if (mounted) {
      textRef.current = text;
    }
  }, [text, mounted]);

  useEffect(() => {
    if (mounted && transcript) {
      onSpeechResult(transcript);
      // Reset transcript after sending it to parent
      // This prevents re-triggering if component re-renders
      setTimeout(() => {
        if (setTranscript) setTranscript('');
      }, 100);
    }
  }, [transcript, onSpeechResult, mounted, setTranscript]);

  useEffect(() => {
    if (mounted) {
      if (recognitionError) console.error("Speech Recognition Error:", recognitionError);
      if (synthesisError) console.error("Speech Synthesis Error:", synthesisError);
    }
  }, [recognitionError, synthesisError, mounted]);

  // All handler functions after effects
  const handleSpeakClick = () => {
    if (isSpeaking) {
      // First set the speaking state locally to prevent flickering UI
      stopSpeaking();
    } else if (text) {
      // Only try to speak if we have text
      speak(text);
    }
  };

  // Handle speech recognition specifically
  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      // Clear transcript before starting
      if (setTranscript) setTranscript('');
      startListening();
    }
  };

  // Don't show speak button while speaking is processing
  const showSpeakButton = synthesisSupported && text && mounted;

  // Conditional rendering based on mounted state
  if (!mounted) {
    return null;
  }

  // Support check - don't render if no voice support
  if (!recognitionSupported && !synthesisSupported) {
    return null;
  }

  // Component rendering
  return (
    <div className="flex items-center space-x-2">
      {recognitionSupported && (
        <button
          type="button"
          onClick={handleMicClick}
          disabled={disabled}
          className="p-2 text-white bg-blue-600 rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          title={isListening ? "Stop listening" : "Start voice input"}
        >
          {isListening ? 
            <StopCircle className="w-5 h-5" /> : 
            <Mic className="w-5 h-5" />
          }
        </button>
      )}
      
      {showSpeakButton && (
        <button
          type="button"
          onClick={handleSpeakClick}
          disabled={disabled || !text}
          className="p-2 text-white bg-green-600 rounded-full hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          title={isSpeaking ? "Stop speaking" : "Play text"}
        >
          {isSpeaking ? 
            <VolumeX className="w-5 h-5" /> : 
            <Volume2 className="w-5 h-5" />
          }
        </button>
      )}
    </div>
  );
}

// Export named for static import
export { VoiceButton };

// Default export for dynamic import
export default VoiceButton; 