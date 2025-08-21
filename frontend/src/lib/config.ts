// API Configuration
export const apiConfig = {
  // Base API URL - change this to your backend URL
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  
  // Request timeout in milliseconds
  timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '10000', 10),
  
  // Enable debug logging
  debug: process.env.NEXT_PUBLIC_API_DEBUG === 'true',
  
  // Default headers
  defaultHeaders: {
    'Content-Type': 'application/json',
  },
  
  // Cookie settings for authentication
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
};

// API endpoints configuration
export const endpoints = {
  // User endpoints
  users: {
    base: '/api/users',
    register: '/api/users/register',
    login: '/api/users/login',
    logout: '/api/users/logout',
    profile: '/api/users/profile',
    me: '/api/users/me',
    updateDetails: '/api/users/update-details',
    changePassword: '/api/users/change-password',
    forgotPassword: '/api/users/forgot-password',
    resetPassword: '/api/users/reset-password',
    totalRevenue: '/api/users/total-revenue',
    filterByPincode: (pincode: string) => `/api/users/pincode/${pincode}`,
  },
  
  // Blog endpoints
  blogs: {
    base: '/api/blogs',
    byId: (id: string) => `/api/blogs/${id}`,
    addPost: (id: string) => `/api/blogs/${id}/posts`,
  },
  
  // Gallery endpoints
  galleries: {
    base: '/api/galleries',
    upload: '/api/galleries/upload',
    byId: (id: string) => `/api/galleries/${id}`,
  },
  
  // Payment endpoints
  payments: {
    base: '/api/payments',
    byId: (id: string) => `/api/payments/${id}`,
  },
  
  // Payment list endpoints
  paymentLists: {
    base: '/api/payment-lists',
    byId: (id: string) => `/api/payment-lists/${id}`,
  },
};

export default apiConfig;
