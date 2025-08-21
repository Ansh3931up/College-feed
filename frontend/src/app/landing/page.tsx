'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthPopup from '@/components/AuthPopup';

const LandingPage = () => {
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const router = useRouter();

  const handleGetStarted = () => {
    setAuthMode('signup');
    setShowAuthPopup(true);
  };

  const handleSignIn = () => {
    setAuthMode('signin');
    setShowAuthPopup(true);
  };

  const handleAuthSuccess = () => {
    setShowAuthPopup(false);
    router.push('/feed');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900">College Feed</span>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={handleSignIn}
                className="text-gray-700 hover:text-indigo-600 font-medium transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={handleGetStarted}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 right-0 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Connect with Your
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
                {" "}College Community
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Share events, find lost items, stay updated with announcements, and connect with 
              students and faculty from your college. All in one unified platform.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <button
                onClick={handleGetStarted}
                className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Join Your College Feed
              </button>
              <button
                onClick={handleSignIn}
                className="bg-white text-indigo-600 px-8 py-4 rounded-xl font-semibold text-lg border-2 border-indigo-600 hover:bg-indigo-50 transition-colors"
              >
                Already have an account?
              </button>
            </div>

            {/* Preview Box */}
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-6">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">What would you like to share?</h3>
                </div>
                <div className="bg-gray-50 rounded-xl p-4 border-2 border-dashed border-gray-300">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <svg className="h-5 w-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <span className="text-gray-500 flex-1">Share an event, lost item, announcement...</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 text-center mt-3">
                  Sign up to start sharing with your college community
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything your college needs</h2>
            <p className="text-xl text-gray-600">Three powerful features in one unified platform</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Events */}
            <div className="text-center p-6 rounded-2xl hover:shadow-lg transition-shadow">
              <div className="h-16 w-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">College Events</h3>
              <p className="text-gray-600">Share workshops, fests, club activities. Let students mark their attendance and stay updated.</p>
            </div>

            {/* Lost & Found */}
            <div className="text-center p-6 rounded-2xl hover:shadow-lg transition-shadow">
              <div className="h-16 w-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Lost & Found</h3>
              <p className="text-gray-600">Report lost items or announce found items. Help your college community reunite with their belongings.</p>
            </div>

            {/* Announcements */}
            <div className="text-center p-6 rounded-2xl hover:shadow-lg transition-shadow">
              <div className="h-16 w-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Official Announcements</h3>
              <p className="text-gray-600">Important notices, timetables, exam schedules. Never miss official college updates.</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to connect with your college?</h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join thousands of students and faculty already using College Feed
          </p>
          <button
            onClick={handleGetStarted}
            className="bg-white text-indigo-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-50 transform hover:scale-105 transition-all duration-200 shadow-lg"
          >
            Get Started Today
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <span className="text-xl font-bold">College Feed</span>
              </div>
              <p className="text-gray-400 max-w-md">
                Connecting college communities through events, lost & found, and official announcements.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Features</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Events</li>
                <li>Lost & Found</li>
                <li>Announcements</li>
                <li>Smart Classification</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 College Feed. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Auth Popup */}
      <AuthPopup
        isOpen={showAuthPopup}
        onClose={() => setShowAuthPopup(false)}
        initialMode={authMode}
        onSuccess={handleAuthSuccess}
      />

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
