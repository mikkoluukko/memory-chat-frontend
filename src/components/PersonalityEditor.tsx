'use client';

import React, { useState, useEffect } from 'react';

interface PersonalityEditorProps {
  userId: string;
}

export function PersonalityEditor({ userId }: PersonalityEditorProps) {
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  // Load existing personality on component mount
  useEffect(() => {
    const fetchPersonality = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${apiUrl}/api/personality?userId=${userId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch personality');
        }
        
        const data = await response.json();
        if (data.personality) {
          setDescription(data.personality.description);
        }
      } catch (error) {
        console.error('Error fetching personality:', error);
        setFeedback({
          message: 'Failed to load personality. Please try again later.',
          type: 'error'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPersonality();
  }, [userId, apiUrl]);
  
  // Handle saving personality
  const handleSave = async () => {
    try {
      setIsSaving(true);
      setFeedback(null);
      
      const response = await fetch(`${apiUrl}/api/personality`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId, description })
      });
      
      if (!response.ok) {
        throw new Error('Failed to save personality');
      }
      
      setFeedback({
        message: 'Personality saved successfully!',
        type: 'success'
      });
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setFeedback(null);
      }, 3000);
    } catch (error) {
      console.error('Error saving personality:', error);
      setFeedback({
        message: 'Failed to save personality. Please try again.',
        type: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 w-full">
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-2 text-gray-800">Customize Your AI Character</h2>
        <p className="text-gray-700 text-base">
          Define your AI assistant's personality and behavior. This will be used as a system prompt for all conversations.
        </p>
      </div>
      <div className="mb-4">
        <textarea 
          placeholder="Enter a description of your AI character's personality..."
          className="w-full p-3 border border-gray-300 rounded-md min-h-[180px] resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700 placeholder:text-gray-500 placeholder:text-base"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isLoading || isSaving}
        />
        {feedback && (
          <div className={`p-3 mt-2 rounded-md ${feedback.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {feedback.message}
          </div>
        )}
      </div>
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          {isLoading ? 'Loading...' : 'Changes are applied to new conversations immediately.'}
        </div>
        <button 
          onClick={handleSave} 
          disabled={isLoading || isSaving}
          className="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {isSaving ? 'Saving...' : 'Save Personality'}
        </button>
      </div>
    </div>
  );
} 