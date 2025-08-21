'use client';

import { useState, useEffect } from 'react';
import { useFeed } from '@/lib';
import { PostCard } from '@/components/PostCard';
import { Navbar } from '@/components/Navbar';
import UnifiedSmartInput from '@/components/UnifiedSmartInput';
import AuthPopup from '@/components/AuthPopup';
import { isAuthenticated } from '@/lib/auth';

export default function FeedPage() {
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [filters, setFilters] = useState({
    postType: '',
    department: '',
    sortBy: 'recent'
  });

  const { posts, loading, error, refetch } = useFeed(filters);

  // Check authentication status
  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
  }, []);

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">College Feed</h1>
          <p className="text-gray-600">Stay connected with your college community</p>
        </div>

        {/* AI-Powered Smart Input */}
        {isLoggedIn ? (
          <UnifiedSmartInput
            onPostCreated={() => {
              console.log('Post created, refreshing feed...');
              refetch();
            }}
            placeholder="What&apos;s happening? Just type naturally - I&apos;ll understand and post it for you! 🤖"
          />
        ) : (
          <div 
            onClick={() => setShowAuthPopup(true)}
            className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center space-x-3 text-gray-500">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <span>What's happening? Sign in to share with your college community...</span>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="post-type-filter" className="block text-sm font-medium text-gray-700 mb-2">Post Type</label>
              <select
                id="post-type-filter"
                value={filters.postType}
                onChange={(e) => handleFilterChange({ ...filters, postType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                aria-label="Filter posts by type"
              >
                <option value="">All Posts</option>
                <option value="EVENT">Events</option>
                <option value="LOST_FOUND">Lost & Found</option>
                <option value="ANNOUNCEMENT">Announcements</option>
              </select>
            </div>

            <div>
              <label htmlFor="department-filter" className="block text-sm font-medium text-gray-700 mb-2">Department</label>
              <select
                id="department-filter"
                value={filters.department}
                onChange={(e) => handleFilterChange({ ...filters, department: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                aria-label="Filter posts by department"
              >
                <option value="">All Departments</option>
                <option value="Computer Science Engineering">CSE</option>
                <option value="Electronics and Communication Engineering">ECE</option>
                <option value="Mechanical Engineering">ME</option>
                <option value="Civil Engineering">CE</option>
                <option value="Electrical Engineering">EE</option>
                <option value="Information Technology">IT</option>
                <option value="MBA">MBA</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange({ ...filters, sortBy: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="recent">Most Recent</option>
                <option value="popular">Most Popular</option>
                <option value="trending">Trending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Feed Content */}
        <div className="space-y-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <svg className="mx-auto h-12 w-12 text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Feed</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={refetch}
                className="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
              <p className="text-gray-500 mb-4">Be the first to share something with your college community!</p>
              <p className="text-sm text-indigo-600">
                Use the smart input above to create your first post! Just type naturally. 🤖
              </p>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard key={post._id} post={post} onUpdate={refetch} />
            ))
          )}
        </div>

        {/* Load More Button */}
        {posts.length > 0 && !loading && (
          <div className="text-center mt-8">
            <button
              onClick={() => {/* Implement load more */}}
              className="bg-white text-gray-700 border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Load More Posts
            </button>
          </div>
        )}
      </div>

      {/* Auth Popup */}
      <AuthPopup
        isOpen={showAuthPopup}
        onClose={() => setShowAuthPopup(false)}
        initialMode="signin"
      />


    </div>
  );
}
