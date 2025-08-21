// Cookie and authentication utilities

export const AUTH_COOKIE_NAME = 'accessToken';
export const COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

/**
 * Set authentication token in both localStorage and cookies
 */
export const setAuthToken = (token: string) => {
  // Store in localStorage for client-side access
  localStorage.setItem('accessToken', token);
  
  // Store in cookies for server-side requests
  document.cookie = `${AUTH_COOKIE_NAME}=${token}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=None; Secure`;
};

/**
 * Clear authentication token from both localStorage and cookies
 */
export const clearAuthToken = () => {
  // Clear localStorage
  localStorage.removeItem('accessToken');
  
  // Clear cookie by setting it to expire in the past
  document.cookie = `${AUTH_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=None; Secure`;
};

/**
 * Get authentication token from localStorage
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem('accessToken');
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

/**
 * Get cookie value by name
 */
export const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
};
