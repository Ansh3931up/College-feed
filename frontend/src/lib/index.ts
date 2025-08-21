// Main exports for the API service layer
export { default as API, apiClient } from './api';

// Legacy API exports (to be deprecated)
export * from './apiEndpoints';
export * from './useAPI';
export { apiConfig, endpoints } from './config';

// New College Feed System APIs
export * from './collegeAPI';
export * from './useCollegeAPI';
export * from './auth';

// Re-export commonly used items for convenience
export {
  userAPI,
  blogAPI,
  galleryAPI,
  paymentAPI,
  paymentListAPI,
  apis
} from './apiEndpoints';

export {
  useAPI,
  useFetch,
  useMutation,
  useUpload,
  usePagination
} from './useAPI';

// New College System APIs
export {
  collegeUserAPI,
  feedAPI,
  adminAPI,
  collegeAPIs
} from './collegeAPI';

export {
  useAuth,
  useSmartPostCreation,
  usePostClassification,
  useFeed,
  usePost,
  useCollegeUsers,
  useProfile,
  useSearch,
  useNotifications,
  useFormValidation
} from './useCollegeAPI';

// Legacy Types
export type {
  ApiResponse,
  User,
  LoginData,
  RegisterData,
  Blog,
  BlogPost,
  Gallery
} from './apiEndpoints';

export type {
  APIState,
  UseAPIOptions
} from './useAPI';

// New College System Types
export type {
  CollegeApiResponse,
  CollegeUser,
  StudentRegistrationData,
  TeacherRegistrationData,
  FeedPost,
  Event,
  LostFoundItem,
  Announcement,
  SmartPostPreview
} from './collegeAPI';
