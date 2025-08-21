'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { setAuthToken } from '@/lib/auth';

interface AuthPopupProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
  onSuccess?: () => void;
}

const AuthPopup: React.FC<AuthPopupProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin',
  onSuccess
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullname: '',
    department: '',
    role: 'STUDENT' as 'STUDENT' | 'TEACHER' | 'COLLEGE_ADMIN',
    collegeCode: '',
    studentId: '',
    batch: '',
    bio: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent multiple simultaneous requests
    if (isLoading) return;
    
    setIsLoading(true);
    setError('');

    try {
      const endpoint = mode === 'signin' ? '/api/v1/user/login' : '/api/v1/user/register';
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      
      // Create abort controller for request timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Network error occurred' }));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Store access token using utility function
      if (data.data?.accessToken) {
        setAuthToken(data.data.accessToken);
      }

      // On success, close popup and call success callback
      onClose();
      if (onSuccess) {
        onSuccess();
      } else {
        // Fallback: reload page to update auth state
        window.location.reload();
      }
    } catch (err: any) {
      console.error('Authentication error:', err);
      
      if (err.name === 'AbortError') {
        setError('Request timed out. Please check your connection and try again.');
      } else if (err.message.includes('NetworkError') || err.message.includes('fetch')) {
        setError('Unable to connect to server. Please check your internet connection.');
      } else {
        setError(err.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">
            {mode === 'signin' ? 'Welcome Back' : 'Join Your College'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Sign Up Fields */}
          {mode === 'signup' && (
            <>
              <div>
                <label htmlFor="fullname" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullname"
                  name="fullname"
                  value={formData.fullname}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <select
                  id="department"
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                >
                  <option value="">Select Department</option>
                  <option value="CSE">Computer Science & Engineering</option>
                  <option value="ECE">Electronics & Communication</option>
                  <option value="ME">Mechanical Engineering</option>
                  <option value="CE">Civil Engineering</option>
                  <option value="EE">Electrical Engineering</option>
                  <option value="IT">Information Technology</option>
                  <option value="MBA">MBA</option>
                  <option value="ADMIN">Administration</option>
                </select>
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                >
                  <option value="STUDENT">Student</option>
                  <option value="TEACHER">Teacher</option>
                  <option value="COLLEGE_ADMIN">College Admin</option>
                </select>
              </div>

              <div>
                <label htmlFor="collegeCode" className="block text-sm font-medium text-gray-700 mb-1">
                  College Code
                </label>
                <select
                  id="collegeCode"
                  name="collegeCode"
                  value={formData.collegeCode}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                >
                  <option value="">Select College</option>
                  <option value="IIITU">IIIT Una (IIITU)</option>
                  <option value="IIITA">IIIT Allahabad (IIITA)</option>
                  <option value="IITD">IIT Delhi (IITD)</option>
                  <option value="IITB">IIT Bombay (IITB)</option>
                  <option value="IITK">IIT Kanpur (IITK)</option>
                  <option value="IITM">IIT Madras (IITM)</option>
                  <option value="IITKGP">IIT Kharagpur (IITKGP)</option>
                  <option value="IITR">IIT Roorkee (IITR)</option>
                  <option value="DTU">Delhi Technological University (DTU)</option>
                  <option value="NSUT">Netaji Subhas University of Technology (NSUT)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Select your college from the list
                </p>
              </div>

              {/* Student ID - only for students */}
              {formData.role === 'STUDENT' && (
                <div>
                  <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 mb-1">
                    Student ID
                  </label>
                  <input
                    type="text"
                    id="studentId"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleInputChange}
                    required={formData.role === 'STUDENT'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                    placeholder="e.g., 22206"
                  />
                </div>
              )}

              {/* Batch Year - only for students */}
              {formData.role === 'STUDENT' && (
                <div>
                  <label htmlFor="batch" className="block text-sm font-medium text-gray-700 mb-1">
                    Batch Year
                  </label>
                  <input
                    type="text"
                    id="batch"
                    name="batch"
                    value={formData.batch}
                    onChange={handleInputChange}
                    required={formData.role === 'STUDENT'}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                    placeholder="e.g., 2022"
                  />
                </div>
              )}

              {/* Bio - optional */}
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                  Bio (Optional)
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  placeholder="Tell us a bit about yourself..."
                />
              </div>

              {/* Profile Picture - optional */}
              <div>
                <label htmlFor="avatar" className="block text-sm font-medium text-gray-700 mb-1">
                  Profile Picture (Optional)
                </label>
                <input
                  type="file"
                  id="avatar"
                  name="avatar"
                  accept="image/*"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            </>
          )}

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              College Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              placeholder="your.email@college.edu"
            />
            <p className="text-xs text-gray-500 mt-1">
              Use your official college email address
            </p>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              placeholder="Enter your password"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`
              w-full py-3 px-4 rounded-lg font-medium transition-all duration-200
              ${isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
              }
              text-white
            `}
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Please wait...</span>
              </div>
            ) : (
              mode === 'signin' ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="px-6 pb-6">
          <div className="text-center text-sm text-gray-600">
            {mode === 'signin' ? (
              <>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPopup;
