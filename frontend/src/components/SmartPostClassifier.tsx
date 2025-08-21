'use client';

import React, { useState } from 'react';
import { usePostClassification } from '@/lib';

interface SmartPostClassifierProps {
  onClassificationComplete?: (classification: any) => void;
}

export default function SmartPostClassifier({ onClassificationComplete }: SmartPostClassifierProps) {
  const [input, setInput] = useState('');
  const [classification, setClassification] = useState<any>(null);
  
  const { classifyUserInput, classifying, error } = usePostClassification();

  const handleClassify = async () => {
    if (!input.trim()) return;
    
    const result = await classifyUserInput(input);
    
    if (result.success) {
      setClassification(result.data);
      if (onClassificationComplete) {
        onClassificationComplete(result.data);
      }
    }
  };

  const resetClassification = () => {
    setClassification(null);
    setInput('');
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        🤖 AI Post Classifier
      </h2>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="input" className="block text-sm font-medium text-gray-700 mb-2">
            Enter your post content:
          </label>
          <textarea
            id="input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Try: 'Lost my black wallet near the library yesterday evening' or 'Workshop on Docker tomorrow at 5pm in CSE Lab' or 'Important: Exam schedule released'"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            rows={4}
            disabled={classifying}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleClassify}
            disabled={!input.trim() || classifying}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {classifying ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Classifying...
              </span>
            ) : (
              '🔍 Classify with AI'
            )}
          </button>
          
          {classification && (
            <button
              onClick={resetClassification}
              className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors"
            >
              Reset
            </button>
          )}
        </div>

        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
            <strong>Error:</strong> {error}
          </div>
        )}

        {classification && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
            <h3 className="text-lg font-semibold text-green-800 mb-3">
              🎯 Classification Result
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="font-medium">Post Type:</span>
                <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                  classification.classification?.postType === 'EVENT' ? 'bg-blue-100 text-blue-800' :
                  classification.classification?.postType === 'LOST_FOUND' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-purple-100 text-purple-800'
                }`}>
                  {classification.classification?.postType || 'Unknown'}
                </span>
              </div>
              
              <div>
                <span className="font-medium">Title:</span>
                <p className="text-gray-700 mt-1">{classification.classification?.title}</p>
              </div>
              
              <div>
                <span className="font-medium">Description:</span>
                <p className="text-gray-700 mt-1">{classification.classification?.description}</p>
              </div>
              
              {classification.classification?.location && (
                <div>
                  <span className="font-medium">Location:</span>
                  <p className="text-gray-700 mt-1">{classification.classification.location}</p>
                </div>
              )}
              
              <div className="pt-2 border-t">
                <span className="text-sm text-gray-500">
                  Confidence: <span className="font-medium">{classification.confidence}</span>
                  {classification.fallback && <span className="text-orange-600"> (Fallback used)</span>}
                </span>
              </div>
              
              <details className="pt-2">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  View Raw Classification Data
                </summary>
                <pre className="mt-2 p-2 bg-gray-100 text-xs overflow-auto rounded">
                  {JSON.stringify(classification, null, 2)}
                </pre>
              </details>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
