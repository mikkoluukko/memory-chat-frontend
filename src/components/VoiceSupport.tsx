'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// Add type declarations for the Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

// Add SpeechRecognitionEvent interface
interface SpeechRecognitionEvent {
  resultIndex: number;
  results: {
    [key: number]: {
      [key: number]: {
        transcript: string;
      };
    };
  };
}

// Speech-to-Text hook
export function useSpeechRecognition() {
  // Define all state hooks first, before any logic
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [speechRecognitionSupported, setSpeechRecognitionSupported] = useState(false);
  const recognitionRef = useRef<any>(null);
  
  // Setup on mount - check browser support
  useEffect(() => {
    setIsMounted(true);
    
    // Check if browser supports speech recognition
    if (typeof window !== 'undefined') {
      const isSupported = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
      setSpeechRecognitionSupported(isSupported);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore errors on cleanup
        }
      }
      setIsMounted(false);
    };
  }, []);

  // Define callbacks after all state hooks and useEffects
  const startListening = useCallback(() => {
    if (!isMounted || !speechRecognitionSupported) {
      setError('Speech recognition is not supported or component not mounted.');
      return;
    }

    setError(null);
    setTranscript('');
    setIsListening(true);

    // Initialize speech recognition
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const current = event.resultIndex;
        const result = event.results[current][0].transcript;
        setTranscript(result);
      };

      recognition.onerror = (event: { error: string }) => {
        setError(`Error occurred in recognition: ${event.error}`);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      // Start listening
      recognition.start();
    } catch (err) {
      console.error("Failed to start speech recognition:", err);
      setError(`Failed to start speech recognition: ${err}`);
      setIsListening(false);
    }
  }, [speechRecognitionSupported, isMounted]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore errors here
      }
    }
    setIsListening(false);
  }, []);

  return {
    transcript,
    isListening,
    error,
    startListening,
    stopListening,
    isSupported: speechRecognitionSupported,
    setTranscript
  };
}

// Text-to-Speech hook
export function useSpeechSynthesis() {
  // Define all state hooks first, before any logic
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [speechSynthesisSupported, setSpeechSynthesisSupported] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  
  // Setup on mount - check browser support
  useEffect(() => {
    setIsMounted(true);
    
    // Check if browser supports speech synthesis
    if (typeof window !== 'undefined') {
      const isSupported = 'speechSynthesis' in window;
      setSpeechSynthesisSupported(isSupported);
    }

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsMounted(false);
    };
  }, []);

  // Define callbacks after all state hooks and useEffects
  const speak = useCallback((text: string) => {
    if (!isMounted || !speechSynthesisSupported || typeof window === 'undefined') {
      setError('Speech synthesis is not supported or component not mounted.');
      return;
    }

    if (!text) return;

    setError(null);

    // Stop any current speech
    window.speechSynthesis.cancel();

    try {
      // Create a new utterance
      const utterance = new SpeechSynthesisUtterance(text);
      utteranceRef.current = utterance;
      
      utterance.lang = 'en-US';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;

      utterance.onstart = () => {
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
      };

      utterance.onerror = (event: { error: string }) => {
        // Don't log "interrupted" errors as they're expected when stopping
        if (event.error !== 'interrupted') {
          setError(`Error occurred in speech synthesis: ${event.error}`);
          console.error(`Speech Synthesis Error: ${event.error}`);
        }
        setIsSpeaking(false);
      };

      // Speak the text
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error("Failed to start speech synthesis:", err);
      setError(`Failed to start speech synthesis: ${err}`);
      setIsSpeaking(false);
    }
  }, [speechSynthesisSupported, isMounted]);

  const stop = useCallback(() => {
    if (isMounted && speechSynthesisSupported && typeof window !== 'undefined') {
      try {
        // Clear any error state that might exist
        setError(null);
        
        // Cancel speech synthesis
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      } catch (e) {
        console.error("Error stopping speech synthesis:", e);
      }
    }
  }, [speechSynthesisSupported, isMounted]);

  return {
    speak,
    stop,
    isSpeaking,
    error,
    isSupported: speechSynthesisSupported
  };
} 