'use client';

import React from 'react';
import UnifiedSmartInput from '@/components/UnifiedSmartInput';

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🤖 AI-Powered Smart Post Demo
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            Just type naturally - AI will understand and post for you!
          </p>
          <p className="text-sm text-gray-500">
            No forms, no categories, no hassle. Just like ChatGPT! 
          </p>
        </div>

        {/* Demo Input */}
        <div className="mb-8">
          <UnifiedSmartInput
            onPostCreated={() => {
              console.log('Demo post created!');
              alert('Post created successfully! 🎉');
            }}
            placeholder="Try typing: 'Lost my wallet near library' or 'Workshop on AI tomorrow 5pm' or 'Important exam schedule update'"
          />
        </div>

        {/* Examples */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">✨ Try These Examples:</h2>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">🎓 Events</h3>
              <div className="text-sm text-blue-600 space-y-1">
                <p>"Workshop on React tomorrow at 5pm in CSE Lab"</p>
                <p>"Hackathon next week, registration open"</p>
                <p>"Guest lecture by Google engineer Friday"</p>
                <p className="text-green-600">✅ Now works with proper validation!</p>
              </div>
            </div>
            
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h3 className="font-medium text-yellow-800 mb-2">🔍 Lost & Found</h3>
              <div className="text-sm text-yellow-600 space-y-1">
                <p>"Lost my black wallet near the library"</p>
                <p>"Found iPhone in canteen, contact me"</p>
                <p>"Missing blue notebook from ME Lab"</p>
              </div>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg">
              <h3 className="font-medium text-purple-800 mb-2">📢 Announcements</h3>
              <div className="text-sm text-purple-600 space-y-1">
                <p>"Important: Exam schedule released"</p>
                <p>"Library closed for maintenance"</p>
                <p>"New cafeteria timings effective Monday"</p>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">🚀 Smart Features:</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-800 mb-2">🤖 AI-Powered Understanding</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Automatically detects post type</li>
                <li>• Extracts dates, times, locations</li>
                <li>• Structures data intelligently</li>
                <li>• No manual form filling required</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-800 mb-2">⚡ Instant Publishing</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Type → AI classifies → Auto-posts</li>
                <li>• 2-second preview before publishing</li>
                <li>• File upload support</li>
                <li>• Real-time feedback</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
