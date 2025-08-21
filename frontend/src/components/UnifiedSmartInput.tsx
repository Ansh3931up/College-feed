'use client';

import React, { useState, useRef } from 'react';
import { usePostClassification, feedAPI, API } from '@/lib';

interface UnifiedSmartInputProps {
  onPostCreated?: () => void;
  placeholder?: string;
}

export default function UnifiedSmartInput({ 
  onPostCreated, 
  placeholder = "What's happening? Type naturally - I'll understand and post it for you..." 
}: UnifiedSmartInputProps) {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [preview, setPreview] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [validationErrors, setValidationErrors] = useState<any[]>([]);
  const [showErrors, setShowErrors] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { classifyUserInput, classifying } = usePostClassification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    setIsProcessing(true);
    
    try {
      console.log('🤖 Processing input:', input);
      
      // Step 1: Classify and structure the post using OpenAI
      const classification = await classifyUserInput(input);
      
      if (!classification.success) {
        throw new Error(classification.error || 'Failed to understand your post');
      }

      console.log('✅ Classification result:', classification.data);
      setPreview(classification.data);
      setShowPreview(true);
      
      // Step 2: Auto-publish after brief preview (or user can edit)
      setTimeout(() => {
        publishPost(classification.data);
      }, 1500); // 1.5 second preview before auto-publish
      
    } catch (error: any) {
      console.error('❌ Processing error:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const publishPost = async (classifiedData: any) => {
    try {
      console.log('📤 Creating and publishing post...');
      console.log('Input:', input);
      console.log('Files:', files);
      
      // Use the simplified one-step API
      const result = await feedAPI.createAndPublishPost(input, files);
      console.log('🎉 Post created and published successfully!', result);
      
      // Reset form
      setInput('');
      setFiles([]);
      setPreview(null);
      setShowPreview(false);
      
      // Notify parent component
      if (onPostCreated) {
        onPostCreated();
      }
      
    } catch (error: any) {
      console.error('❌ Publishing error:', error);
      
      // Display detailed validation errors
      if (error.response?.data?.data?.validationErrors) {
        setValidationErrors(error.response.data.data.validationErrors);
        setShowErrors(true);
        console.log('Validation Errors:', error.response.data.data.validationErrors);
        console.log('Classification:', error.response.data.data.classification);
      } else {
        alert(`Failed to publish: ${error.message}`);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(prev => [...prev, ...selectedFiles].slice(0, 5)); // Max 5 files
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const cancelPreview = () => {
    setShowPreview(false);
    setPreview(null);
  };

  const isLoading = isProcessing || classifying;

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Validation Errors Modal */}
      {showErrors && validationErrors.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-red-800">Validation Errors</h3>
              <button
                onClick={() => setShowErrors(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-3">
              {validationErrors.map((error, index) => (
                <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="font-medium text-red-800">Field: {error.field}</p>
                  <p className="text-red-600">{error.message}</p>
                  {error.value && (
                    <p className="text-sm text-red-500">Value: {JSON.stringify(error.value)}</p>
                  )}
                </div>
              ))}
              
              <div className="mt-4 p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-600">
                  💡 These errors help identify what fields need to be fixed in the classification or model validation.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && preview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold">Preview & Publishing...</h3>
              <button
                onClick={cancelPreview}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-md">
                <p className="font-medium text-blue-800">
                  {preview.classification?.postType || 'ANNOUNCEMENT'}
                </p>
                <p className="text-sm text-blue-600">
                  {preview.classification?.title || preview.title}
                </p>
              </div>
              
              <div className="text-sm text-gray-600">
                <p>✅ AI classified your post</p>
                <p>📤 Publishing automatically in 2 seconds...</p>
                {preview.fallback && (
                  <p className="text-orange-600">⚠️ Using fallback classification</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Input */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="space-y-3">
          {/* Text Input */}
          <div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={placeholder}
              className="w-full p-3 border-0 resize-none focus:outline-none text-gray-900 placeholder-gray-500"
              rows={3}
              disabled={isLoading}
            />
          </div>

          {/* File Attachments */}
          {files.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {files.map((file, index) => (
                <div key={index} className="flex items-center bg-gray-100 rounded-md px-2 py-1 text-sm">
                  <span className="truncate max-w-20">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="ml-2 text-gray-500 hover:text-red-500"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center space-x-3">
              {/* File Upload */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                title="Attach files"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </button>
              
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx"
                onChange={handleFileSelect}
                className="hidden"
              />

              {/* Character Count */}
              <span className="text-xs text-gray-400">
                {input.length}/1000
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>{classifying ? 'Understanding...' : 'Publishing...'}</span>
                </>
              ) : (
                <>
                  <span>Post</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
