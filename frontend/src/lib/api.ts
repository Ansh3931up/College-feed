import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { clearAuthToken, getAuthToken } from './auth';

// Base configuration
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Create axios instance with default configuration
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // Increased timeout to 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies for authentication
});

// Request interceptor to add auth token if available
apiClient.interceptors.request.use(
  (config) => {
    // Add any common headers or authentication tokens here
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    // Handle common error scenarios
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Unauthorized - clear authentication tokens
          clearAuthToken();
          window.location.reload();
          break;
        case 403:
          // Forbidden
          console.error('Access forbidden:', data.message);
          break;
        case 404:
          // Not found
          console.error('Resource not found:', data.message);
          break;
        case 500:
          // Server error
          console.error('Server error:', data.message);
          break;
        default:
          console.error('API Error:', data.message || 'Unknown error');
      }
    } else if (error.request) {
      // Network error - check for specific error types
      if (error.code === 'ECONNABORTED') {
        console.error('Request timeout - server may be down');
      } else if (error.code === 'ERR_NETWORK') {
        console.error('Network error - please check your connection');
      } else {
        console.error('Network error:', error.message);
      }
    }
    
    return Promise.reject(error);
  }
);

// Generic API methods
export class API {
  // GET method
  static async get<T = unknown>(
    url: string, 
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return apiClient.get<T>(url, config);
  }

  // POST method
  static async post<T = unknown>(
    url: string, 
    data?: unknown, 
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return apiClient.post<T>(url, data, config);
  }

  // PUT method
  static async put<T = unknown>(
    url: string, 
    data?: unknown, 
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return apiClient.put<T>(url, data, config);
  }

  // PATCH method
  static async patch<T = unknown>(
    url: string, 
    data?: unknown, 
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return apiClient.patch<T>(url, data, config);
  }

  // DELETE method
  static async delete<T = unknown>(
    url: string, 
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return apiClient.delete<T>(url, config);
  }

  // Upload file method (for multipart/form-data)
  static async upload<T = unknown>(
    url: string, 
    formData: FormData, 
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return apiClient.post<T>(url, formData, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config?.headers,
      },
    });
  }

  // Download file method
  static async download(
    url: string, 
    filename?: string, 
    config?: AxiosRequestConfig
  ): Promise<void> {
    const response = await apiClient.get(url, {
      ...config,
      responseType: 'blob',
    });

    // Create blob link to download
    const href = URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = href;
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
  }
}

// Export the axios instance for direct use if needed
export { apiClient };
export default API;
