'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, useProfile } from '@/lib';
import { clearAuthToken, isAuthenticated } from '@/lib/auth';

export function Navbar() {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();
  
  const { logout } = useAuth();
  const { profile } = useProfile();

  // Check auth status
  useEffect(() => {
    setIsLoggedIn(isAuthenticated());
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      // Clear authentication tokens
      clearAuthToken();
      window.location.reload();
    } catch (error) {
      console.error('Logout failed:', error);
      // Clear tokens even if logout API fails
      clearAuthToken();
      window.location.reload();
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'STUDENT':
        return 'bg-blue-100 text-blue-800';
      case 'TEACHER':
        return 'bg-green-100 text-green-800';
      case 'COLLEGE_ADMIN':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and main nav */}
          <div className="flex items-center">
            <Link href="/feed" className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900">College Feed</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex ml-10 space-x-8">
              <Link
                href="/feed"
                className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                Feed
              </Link>
              <Link
                href="/events"
                className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                Events
              </Link>
              <Link
                href="/lost-found"
                className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                Lost & Found
              </Link>
              <Link
                href="/announcements"
                className="text-gray-700 hover:text-indigo-600 px-3 py-2 text-sm font-medium transition-colors"
              >
                Announcements
              </Link>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* College Info */}
            {profile?.collegeInfo && (
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600">
                <span className="px-2 py-1 bg-gray-100 rounded-full text-xs font-medium">
                  {profile.collegeInfo.collegeCode}
                </span>
              </div>
            )}

            {/* Notifications */}
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM3 14h5l-5 5v-5zM12 9v2l-2-2 2-2zM19 9v2l-2-2 2-2z" />
              </svg>
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <img
                  src={profile?.avatar || 'https://via.placeholder.com/32x32?text=U'}
                  alt="Profile"
                  className="h-8 w-8 rounded-full object-cover"
                />
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-gray-900">{profile?.fullname}</p>
                  <p className="text-xs text-gray-500">{profile?.department}</p>
                </div>
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900">{profile?.fullname}</p>
                    <p className="text-sm text-gray-500">{profile?.email}</p>
                    <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(profile?.role || '')}`}>
                      {profile?.role}
                    </span>
                  </div>

                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <div className="flex items-center space-x-2">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>Profile</span>
                    </div>
                  </Link>

                  <Link
                    href="/settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setShowProfileMenu(false)}
                  >
                    <div className="flex items-center space-x-2">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>Settings</span>
                    </div>
                  </Link>

                  {(profile?.role === 'COLLEGE_ADMIN') && (
                    <Link
                      href="/admin"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setShowProfileMenu(false)}
                    >
                      <div className="flex items-center space-x-2">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <span>Admin Panel</span>
                      </div>
                    </Link>
                  )}

                  <div className="border-t border-gray-200 mt-1">
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span>Sign out</span>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {showMobileMenu ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-gray-200 py-3">
            <div className="space-y-1">
              <Link
                href="/feed"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setShowMobileMenu(false)}
              >
                Feed
              </Link>
              <Link
                href="/events"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setShowMobileMenu(false)}
              >
                Events
              </Link>
              <Link
                href="/lost-found"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setShowMobileMenu(false)}
              >
                Lost & Found
              </Link>
              <Link
                href="/announcements"
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50 rounded-md transition-colors"
                onClick={() => setShowMobileMenu(false)}
              >
                Announcements
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close */}
      {(showProfileMenu || showMobileMenu) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowProfileMenu(false);
            setShowMobileMenu(false);
          }}
        />
      )}
    </nav>
  );
}
