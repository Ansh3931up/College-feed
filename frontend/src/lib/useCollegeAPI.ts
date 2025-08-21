import { useState, useCallback, useMemo } from 'react';
import { useAPI, useFetch, useMutation } from './useAPI';
import { collegeUserAPI, feedAPI, adminAPI } from './collegeAPI';
import type { 
  CollegeUser, 
  FeedPost, 
  SmartPostPreview,
  StudentRegistrationData,
  TeacherRegistrationData,
  LoginData
} from './collegeAPI';

// =============================================================================
// AUTHENTICATION HOOKS
// =============================================================================

export function useAuth() {
  const [user, setUser] = useState<CollegeUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const { execute: loginUser, loading: loginLoading, error: loginError } = useMutation(
    collegeUserAPI.login,
    {
      onSuccess: (response) => {
        const { user, accessToken } = response.data;
        setUser(user);
        setIsAuthenticated(true);
        localStorage.setItem('accessToken', accessToken);
      },
      onError: (error) => {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('accessToken');
      }
    }
  );

  const { execute: logoutUser, loading: logoutLoading } = useMutation(
    collegeUserAPI.logout,
    {
      onSuccess: () => {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('accessToken');
      }
    }
  );

  const { execute: registerStudent, loading: registerLoading, error: registerError } = useMutation(
    collegeUserAPI.registerStudent
  );

  const { execute: registerTeacher, loading: teacherRegisterLoading, error: teacherRegisterError } = useMutation(
    collegeUserAPI.registerTeacher
  );

  const login = useCallback((loginData: LoginData) => {
    return loginUser(loginData);
  }, [loginUser]);

  const logout = useCallback(() => {
    return logoutUser();
  }, [logoutUser]);

  const registerAsStudent = useCallback((userData: StudentRegistrationData) => {
    return registerStudent(userData);
  }, [registerStudent]);

  const registerAsTeacher = useCallback((userData: TeacherRegistrationData) => {
    return registerTeacher(userData);
  }, [registerTeacher]);

  return {
    user,
    isAuthenticated,
    login,
    logout,
    registerAsStudent,
    registerAsTeacher,
    loginLoading,
    logoutLoading,
    registerLoading,
    teacherRegisterLoading,
    loginError,
    registerError,
    teacherRegisterError
  };
}

// =============================================================================
// SMART POST CREATION HOOKS
// =============================================================================

export function useSmartPostCreation() {
  const [postPreview, setPostPreview] = useState<SmartPostPreview | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const { execute: createSmartPost, loading: previewLoading, error: previewError } = useMutation(
    feedAPI.createSmartPost,
    {
      onSuccess: (response) => {
        setPostPreview(response.data);
        setIsEditing(true);
      }
    }
  );

  const { execute: publishPost, loading: publishLoading, error: publishError } = useMutation(
    feedAPI.publishPost,
    {
      onSuccess: () => {
        setPostPreview(null);
        setIsEditing(false);
      }
    }
  );

  const generatePreview = useCallback((content: string, attachments?: File[]) => {
    return createSmartPost(content, attachments);
  }, [createSmartPost]);

  const publishFinalPost = useCallback((postData: unknown) => {
    return publishPost(postData);
  }, [publishPost]);

  const editPreview = useCallback((updatedPreview: SmartPostPreview) => {
    setPostPreview(updatedPreview);
  }, []);

  const cancelEdit = useCallback(() => {
    setPostPreview(null);
    setIsEditing(false);
  }, []);

  return {
    postPreview,
    isEditing,
    generatePreview,
    publishFinalPost,
    editPreview,
    cancelEdit,
    previewLoading,
    publishLoading,
    previewError,
    publishError
  };
}

export function usePostClassification() {
  const { 
    execute: classifyPost, 
    loading: classifying, 
    error 
  } = useMutation(feedAPI.classifyPost);

  const classifyUserInput = useCallback(async (content: string) => {
    if (!content.trim()) {
      return { success: false, error: 'Content cannot be empty' };
    }

    try {
      const result = await classifyPost(content);
      return { 
        success: true, 
        data: result.data?.data // API response structure
      };
    } catch (err: any) {
      console.error('Classification error:', err);
      return { 
        success: false, 
        error: err.message || 'Failed to classify post' 
      };
    }
  }, [classifyPost]);

  return {
    classifyUserInput,
    classifying,
    error
  };
}

// =============================================================================
// FEED HOOKS
// =============================================================================

export function useFeed(options?: {
  postType?: string;
  department?: string;
  sortBy?: string;
  autoRefresh?: boolean;
}) {
  // Memoize options to prevent infinite loops
  const memoizedOptions = useMemo(() => options, [
    options?.postType,
    options?.department, 
    options?.sortBy,
    options?.autoRefresh
  ]);

  const { 
    data: feedData, 
    loading, 
    error, 
    refetch 
  } = useFetch(() => feedAPI.getFeed(memoizedOptions), [memoizedOptions]);

  const posts = feedData?.data?.posts || [];
  const pagination = feedData?.data?.pagination;

  return {
    posts,
    pagination,
    loading,
    error,
    refetch
  };
}

export function usePost(postId: string) {
  const { 
    data: postData, 
    loading, 
    error, 
    refetch 
  } = useFetch(() => feedAPI.getPostById(postId), [postId]);

  const post = postData?.data;

  const { execute: toggleLike, loading: likeLoading } = useMutation(
    () => feedAPI.toggleLike(postId),
    { onSuccess: refetch }
  );

  const { execute: addComment, loading: commentLoading } = useMutation(
    (content: string) => feedAPI.addComment(postId, content),
    { onSuccess: refetch }
  );

  const { execute: addReply, loading: replyLoading } = useMutation(
    ({ commentId, content }: { commentId: string; content: string }) => 
      feedAPI.addReply(postId, commentId, content),
    { onSuccess: refetch }
  );

  const { execute: respondToEvent, loading: responseLoading } = useMutation(
    (response: 'going' | 'interested' | 'notGoing' | 'none') => 
      feedAPI.respondToEvent(postId, response),
    { onSuccess: refetch }
  );

  const { execute: claimItem, loading: claimLoading } = useMutation(
    (message: string) => feedAPI.claimItem(postId, message),
    { onSuccess: refetch }
  );

  return {
    post,
    loading,
    error,
    refetch,
    toggleLike,
    addComment,
    addReply,
    respondToEvent,
    claimItem,
    likeLoading,
    commentLoading,
    replyLoading,
    responseLoading,
    claimLoading
  };
}

// =============================================================================
// ADMIN HOOKS
// =============================================================================

export function useCollegeUsers(filters?: {
  role?: string;
  department?: string;
  page?: number;
  limit?: number;
}) {
  const { 
    data: usersData, 
    loading, 
    error, 
    refetch 
  } = useFetch(() => adminAPI.getCollegeUsers(filters), [filters]);

  const users = usersData?.data?.users || [];
  const pagination = usersData?.data?.pagination;

  const { execute: createAdmin, loading: createAdminLoading } = useMutation(
    adminAPI.createCollegeAdmin,
    { onSuccess: refetch }
  );

  return {
    users,
    pagination,
    loading,
    error,
    refetch,
    createAdmin,
    createAdminLoading
  };
}

// =============================================================================
// USER PROFILE HOOKS
// =============================================================================

export function useProfile() {
  const { 
    data: profileData, 
    loading, 
    error, 
    refetch 
  } = useFetch(collegeUserAPI.getCurrentUser);

  const profile = profileData?.data;

  const { execute: updateProfile, loading: updateLoading, error: updateError } = useMutation(
    collegeUserAPI.updateProfile,
    { onSuccess: refetch }
  );

  const { execute: changePassword, loading: passwordLoading, error: passwordError } = useMutation(
    collegeUserAPI.changePassword
  );

  return {
    profile,
    loading,
    error,
    refetch,
    updateProfile,
    changePassword,
    updateLoading,
    passwordLoading,
    updateError,
    passwordError
  };
}

// =============================================================================
// UTILITY HOOKS
// =============================================================================

export function useSearch() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FeedPost[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // This would need to be implemented in the backend
      // const response = await feedAPI.searchPosts(query);
      // setSearchResults(response.data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearching,
    search
  };
}

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // This would integrate with a real-time notification system
  const markAsRead = useCallback((notificationId: string) => {
    // Implementation for marking notification as read
  }, []);

  const markAllAsRead = useCallback(() => {
    // Implementation for marking all notifications as read
  }, []);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead
  };
}

// =============================================================================
// FORM VALIDATION HOOKS
// =============================================================================

export function useFormValidation() {
  const validateCollegeEmail = useCallback((email: string) => {
    const regex = /^\d{5}@iiitu\.ac\.in$/;
    return regex.test(email);
  }, []);

  const validateStudentId = useCallback((studentId: string) => {
    const regex = /^\d{5}$/;
    return regex.test(studentId);
  }, []);

  const validateBatch = useCallback((batch: string) => {
    const regex = /^\d{4}$/;
    const year = parseInt(batch);
    const currentYear = new Date().getFullYear();
    return regex.test(batch) && year >= 2000 && year <= currentYear + 4;
  }, []);

  const validatePassword = useCallback((password: string) => {
    return password.length >= 8;
  }, []);

  const validatePhone = useCallback((phone: string) => {
    const regex = /^[6-9]\d{9}$/;
    return regex.test(phone);
  }, []);

  return {
    validateCollegeEmail,
    validateStudentId,
    validateBatch,
    validatePassword,
    validatePhone
  };
}

export default {
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
};
