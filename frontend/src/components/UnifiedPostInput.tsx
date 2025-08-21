'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface UnifiedPostInputProps {
  isLoggedIn: boolean;
  onAuthRequired: () => void;
  onCreatePost: (content: string) => void;
}

const UnifiedPostInput: React.FC<UnifiedPostInputProps> = ({
  isLoggedIn,
  onAuthRequired,
  onCreatePost
}) => {
  const [content, setContent] = useState('');
  const [isFocused, setIsFocused] = useState(false);


  const handleInputClick = () => {
    if (!isLoggedIn) {
      onAuthRequired();
      return;
    }
    setIsFocused(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      onAuthRequired();
      return;
    }
    
    if (content.trim()) {
      onCreatePost(content.trim());
      setContent('');
      setIsFocused(false);
    }
  };

  const handleCancel = () => {
    setContent('');
    setIsFocused(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-6">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4 text-center">
            What would you like to share?
          </h3>
          
          <form onSubmit={handleSubmit}>
            <div className="relative">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onClick={handleInputClick}
                onFocus={() => setIsFocused(true)}
                placeholder={
                  isLoggedIn 
                    ? "Share an event, lost item, announcement, or anything else..."
                    : "Click to sign in and share with your college community"
                }
                className={`
                  w-full px-4 py-3 border rounded-xl resize-none transition-all duration-200
                  ${isFocused 
                    ? 'border-blue-500 ring-2 ring-blue-500/20 outline-none' 
                    : 'border-gray-300 hover:border-gray-400'
                  }
                  ${!isLoggedIn ? 'cursor-pointer bg-gray-50' : 'bg-white'}
                  placeholder-gray-500 text-gray-900
                `}
                rows={isFocused ? 4 : 2}
                disabled={!isLoggedIn}
              />
              
              {/* Attachment icon */}
              <button
                type="button"
                onClick={handleInputClick}
                className="absolute right-3 top-3 p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
              </button>
            </div>

            {/* Action buttons - only show when focused and logged in */}
            {isFocused && isLoggedIn && (
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-4">
                  <button
                    type="button"
                    className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Photo</span>
                  </button>
                  
                  <button
                    type="button"
                    className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Event</span>
                  </button>
                  
                  <button
                    type="button"
                    className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Lost & Found</span>
                  </button>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  
                  <button
                    type="submit"
                    disabled={!content.trim()}
                    className={`
                      px-6 py-2 text-sm font-medium rounded-lg transition-all duration-200
                      ${content.trim()
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }
                    `}
                  >
                    Share
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
        
        {/* Bottom hint */}
        <div className="px-6 pb-4">
          <p className="text-xs text-gray-500 text-center">
            {isLoggedIn 
              ? "Our AI will automatically categorize your post and suggest improvements"
              : "Join your college community to share events, announcements, and more"
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default UnifiedPostInput;
