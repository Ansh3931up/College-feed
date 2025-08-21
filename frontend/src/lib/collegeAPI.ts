import API from './api';

// API Response types for college system
export interface CollegeApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message: string;
  statusCode: number;
}

// User types for college system
export interface CollegeUser {
  _id: string;
  fullname: string;
  email: string;
  department: string;
  role: 'STUDENT' | 'TEACHER' | 'SUPERADMIN';
  studentId?: string;
  batch?: string;
  avatar: string;
  bio?: string;
  isApproved: boolean;
  isActive: boolean;
  lastLogin: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudentRegistrationData {
  fullname: string;
  email: string;
  password: string;
  department: string;
  batch: string;
  studentId: string;
  bio?: string;
  avatar?: File;
}

export interface TeacherRegistrationData {
  fullname: string;
  email: string;
  password: string;
  department: string;
  employeeId: string;
  bio?: string;
  avatar?: File;
}

export interface LoginData {
  email: string;
  password: string;
}

// Feed types
export interface FeedPost {
  _id: string;
  postType: 'EVENT' | 'LOST_FOUND' | 'ANNOUNCEMENT';
  postId: string;
  author: CollegeUser;
  title: string;
  summary: string;
  department: string;
  collegeInfo: {
    collegeName: string;
    collegeDomain: string;
    collegeCode: string;
  };
  interactions: {
    views: number;
    likes: Array<{ user: string; likedAt: Date }>;
    comments: Array<{
      _id: string;
      user: CollegeUser;
      content: string;
      replies: Array<{
        user: CollegeUser;
        content: string;
        createdAt: Date;
      }>;
      createdAt: Date;
    }>;
    shares: Array<{ user: string; sharedAt: Date; platform: string }>;
  };
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED' | 'DELETED';
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Event {
  _id: string;
  title: string;
  description: string;
  location: string;
  eventDate: Date;
  eventTime: string;
  organizer: string;
  organizerDepartment: string;
  eventType: 'WORKSHOP' | 'FEST' | 'CLUB_ACTIVITY' | 'SEMINAR' | 'COMPETITION' | 'OTHER';
  maxParticipants?: number;
  responses: {
    going: Array<{ user: string; respondedAt: Date }>;
    interested: Array<{ user: string; respondedAt: Date }>;
    notGoing: Array<{ user: string; respondedAt: Date }>;
  };
  tags: string[];
  attachments: string[];
  isActive: boolean;
  createdAt: Date;
}

export interface LostFoundItem {
  _id: string;
  title: string;
  description: string;
  itemType: 'LOST' | 'FOUND';
  category: string;
  itemName: string;
  location: string;
  dateTime: Date;
  reporter: string;
  contactInfo: {
    phone?: string;
    email?: string;
    alternateContact?: string;
  };
  images: string[];
  tags: string[];
  status: 'ACTIVE' | 'RESOLVED' | 'CLOSED';
  claims: Array<{
    claimant: string;
    claimMessage: string;
    claimDate: Date;
    isVerified: boolean;
  }>;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  createdAt: Date;
}

export interface Announcement {
  _id: string;
  title: string;
  content: string;
  department: string;
  issuedBy: string;
  announcementType: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  targetAudience: {
    students: {
      all: boolean;
      departments: string[];
      batches: string[];
    };
    teachers: {
      all: boolean;
      departments: string[];
    };
  };
  attachments: Array<{
    filename: string;
    url: string;
    fileType: string;
    fileSize: number;
  }>;
  validFrom: Date;
  validUntil?: Date;
  isPinned: boolean;
  isUrgent: boolean;
  tags: string[];
  acknowledgedBy: Array<{ user: string; acknowledgedAt: Date }>;
  createdAt: Date;
}

export interface SmartPostPreview {
  title: string;
  description: string;
  postType: 'EVENT' | 'LOST_FOUND' | 'ANNOUNCEMENT';
  classification: {
    postType: string;
    confidence: number;
    extractedEntities: {
      dates: string[];
      times: string[];
      locations: string[];
    };
  };
  // Additional fields based on post type
  location?: string;
  eventDate?: Date;
  eventTime?: string;
  eventType?: string;
  itemType?: 'LOST' | 'FOUND';
  category?: string;
  itemName?: string;
  announcementType?: string;
  targetAudience?: unknown;
  priority?: string;
}



// =============================================================================
// USER API ENDPOINTS
// =============================================================================

export const collegeUserAPI = {
  // Student registration
  registerStudent: (userData: StudentRegistrationData) => {
    const formData = new FormData();
    formData.append('fullname', userData.fullname);
    formData.append('email', userData.email);
    formData.append('password', userData.password);
    formData.append('department', userData.department);
    formData.append('batch', userData.batch);
    formData.append('studentId', userData.studentId);
    formData.append('role', 'STUDENT');
    if (userData.bio) formData.append('bio', userData.bio);
    if (userData.avatar) formData.append('avatar', userData.avatar);

    return API.upload<CollegeApiResponse<CollegeUser>>('/api/v1/user/register', formData);
  },

  // Teacher registration
  registerTeacher: (userData: TeacherRegistrationData) => {
    const formData = new FormData();
    formData.append('fullname', userData.fullname);
    formData.append('email', userData.email);
    formData.append('password', userData.password);
    formData.append('department', userData.department);
    formData.append('employeeId', userData.employeeId);
    formData.append('role', 'TEACHER');
    if (userData.bio) formData.append('bio', userData.bio);
    if (userData.avatar) formData.append('avatar', userData.avatar);

    return API.upload<CollegeApiResponse<CollegeUser>>('/api/v1/user/register', formData);
  },

  // Login
  login: (loginData: LoginData) => 
    API.post<CollegeApiResponse<{ user: CollegeUser; accessToken: string; refreshToken: string }>>('/api/v1/user/login', loginData),

  // Logout
  logout: () => API.post<CollegeApiResponse<{}>>('/api/v1/user/logout'),

  // Get current user
  getCurrentUser: () => API.get<CollegeApiResponse<CollegeUser>>('/api/v1/user/me'),

  // Get user profile
  getProfile: () => API.get<CollegeApiResponse<CollegeUser>>('/api/v1/user/profile'),

  // Update profile
  updateProfile: (updateData: Partial<CollegeUser>) => 
    API.patch<CollegeApiResponse<CollegeUser>>('/api/v1/user/update-details', updateData),

  // Change password
  changePassword: (passwordData: { oldPassword: string; newPassword: string }) =>
    API.patch<CollegeApiResponse<string>>('/api/v1/user/change-password', passwordData),

  // Forgot password
  forgotPassword: (email: string) => 
    API.post<CollegeApiResponse<string>>('/api/v1/user/forgot-password', { email }),

  // Reset password
  resetPassword: (resetToken: string, password: string) => 
    API.post<CollegeApiResponse<string>>(`/api/v1/user/reset-password/${resetToken}`, { password }),


};

// =============================================================================
// ADMIN API ENDPOINTS (COLLEGE_ADMIN only)
// =============================================================================

export const adminAPI = {
  // Get users by college
  getCollegeUsers: (params?: { role?: string; department?: string; page?: number; limit?: number }) =>
    API.get<CollegeApiResponse<{ users: CollegeUser[]; pagination: unknown }>>('/api/v1/user/college-users', { params }),

  // Create college admin
  createCollegeAdmin: (adminData: { fullname: string; email: string; password: string; department: string }) =>
    API.post<CollegeApiResponse<CollegeUser>>('/api/v1/user/create-admin', adminData),
};

// =============================================================================
// FEED API ENDPOINTS
// =============================================================================

export const feedAPI = {
  // AI-powered post classification
  classifyPost: (content: string) => 
    API.post<CollegeApiResponse<{ 
      classification: SmartPostPreview; 
      confidence: string; 
      fallback: boolean; 
      originalContent: string; 
    }>>('/api/v1/feed/classify', { content }),

  // Create and publish post in one step (simplified)
  createAndPublishPost: (content: string, attachments?: File[]) => {
    const formData = new FormData();
    formData.append('content', content);
    if (attachments) {
      attachments.forEach((file, index) => {
        formData.append(`attachments`, file);
      });
    }
    return API.upload<CollegeApiResponse<{ 
      feedPost: FeedPost;
      classification: SmartPostPreview;
      confidence: string;
      fallback: boolean;
    }>>('/api/v1/feed/create-and-publish', formData);
  },

  // Create smart post from natural language (legacy)
  createSmartPost: (content: string, attachments?: File[]) => {
    const formData = new FormData();
    formData.append('content', content);
    if (attachments) {
      attachments.forEach((file, index) => {
        formData.append(`attachments`, file);
      });
    }
    return API.upload<CollegeApiResponse<SmartPostPreview>>('/api/v1/feed/smart-create', formData);
  },

  // Publish the final post
  publishPost: (postData: unknown) =>
    API.post<CollegeApiResponse<{ feedPost: FeedPost; originalPost: unknown }>>('/api/v1/feed/publish', postData),

  // Get personalized feed
  getFeed: (params?: { page?: number; limit?: number; postType?: string; department?: string; sortBy?: string }) =>
    API.get<CollegeApiResponse<{ posts: FeedPost[]; pagination: unknown }>>('/api/v1/feed', { params }),

  // Get single post details
  getPostById: (id: string) =>
    API.get<CollegeApiResponse<FeedPost>>(`/api/v1/feed/${id}`),

  // Like/unlike post
  toggleLike: (id: string) =>
    API.post<CollegeApiResponse<{ action: string; newCount: number }>>(`/api/v1/feed/${id}/like`),

  // Add comment
  addComment: (id: string, content: string) =>
    API.post<CollegeApiResponse<unknown>>(`/api/v1/feed/${id}/comment`, { content }),

  // Add reply to comment
  addReply: (id: string, commentId: string, content: string) =>
    API.post<CollegeApiResponse<unknown>>(`/api/v1/feed/${id}/comment/${commentId}/reply`, { content }),

  // Respond to event (going/interested/notGoing)
  respondToEvent: (id: string, response: 'going' | 'interested' | 'notGoing' | 'none') =>
    API.post<CollegeApiResponse<{ response: string; participantCounts: unknown }>>(`/api/v1/feed/${id}/event/respond`, { response }),

  // Claim lost/found item
  claimItem: (id: string, message: string) =>
    API.post<CollegeApiResponse<LostFoundItem>>(`/api/v1/feed/${id}/lostfound/claim`, { message }),
};

// =============================================================================
// EXPORT ALL APIs
// =============================================================================

export const collegeAPIs = {
  user: collegeUserAPI,
  admin: adminAPI,
  feed: feedAPI,
};

export default collegeAPIs;
