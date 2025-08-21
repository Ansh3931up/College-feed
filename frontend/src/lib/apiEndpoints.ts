import API from './api';

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message: string;
  statusCode: number;
}

// User related types
export interface User {
  _id: string;
  fullname: string;
  email: string;
  avatar: string;
  State: string;
  Pincode: string;
  address: string;
  role: string;
  isSubscribed: string[];
}

export interface LoginData {
  fullname?: string;
  email?: string;
  password: string;
}

export interface RegisterData {
  fullname: string;
  email: string;
  password: string;
  State: string;
  Pincode: string;
  address: string;
  role?: string;
  avatar: File;
}

// Blog related types
export interface Blog {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  posts: BlogPost[];
  numberofposts: number;
}

export interface BlogPost {
  title: string;
  description: string;
  thumbnail: string;
}

// Gallery related types
export interface Gallery {
  _id: string;
  photo: string;
}

// =============================================================================
// USER API ENDPOINTS
// =============================================================================

export const userAPI = {
  // Get all users
  getAllUsers: () => API.get<ApiResponse<User[]>>('/api/users'),

  // Filter users by pincode
  filterByPincode: (pincode: string) => 
    API.get<ApiResponse<User[]>>(`/api/users/pincode/${pincode}`),

  // User registration
  register: (userData: RegisterData) => {
    const formData = new FormData();
    formData.append('fullname', userData.fullname);
    formData.append('email', userData.email);
    formData.append('password', userData.password);
    formData.append('State', userData.State);
    formData.append('Pincode', userData.Pincode);
    formData.append('address', userData.address);
    if (userData.role) formData.append('role', userData.role);
    formData.append('avatar', userData.avatar);

    return API.upload<ApiResponse<User>>('/api/users/register', formData);
  },

  // User login
  login: (loginData: LoginData) => 
    API.post<ApiResponse<User>>('/api/users/login', loginData),

  // User logout
  logout: () => API.post<ApiResponse<{}>>('/api/users/logout'),

  // Get user profile
  getProfile: () => API.get<ApiResponse<User>>('/api/users/profile'),

  // Get current user
  getCurrentUser: () => API.get<ApiResponse<User>>('/api/users/me'),

  // Update account details
  updateAccountDetails: (updateData: Partial<User>) => 
    API.patch<ApiResponse<User>>('/api/users/update-details', updateData),

  // Change password
  changePassword: (passwordData: { oldPassword: string; newPassword: string }) =>
    API.patch<ApiResponse<string>>('/api/users/change-password', passwordData),

  // Forgot password
  forgotPassword: (email: string) => 
    API.post<ApiResponse<string>>('/api/users/forgot-password', { email }),

  // Reset password
  resetPassword: (resetToken: string, password: string) => 
    API.post<ApiResponse<string>>(`/api/users/reset-password/${resetToken}`, { password }),

  // Calculate total revenue
  calculateTotalRevenue: () => 
    API.get<ApiResponse<number>>('/api/users/total-revenue'),
};

// =============================================================================
// BLOG API ENDPOINTS
// =============================================================================

export const blogAPI = {
  // Get all blogs
  getAllBlogs: () => API.get<ApiResponse<Blog[]>>('/api/blogs'),

  // Get blog by ID
  getBlogById: (id: string) => 
    API.get<ApiResponse<Blog>>(`/api/blogs/${id}`),

  // Create new blog
  createBlog: (blogData: { title: string; description: string; thumbnail: string }) =>
    API.post<ApiResponse<Blog>>('/api/blogs', blogData),

  // Update blog
  updateBlog: (id: string, updateData: Partial<Blog>) =>
    API.put<ApiResponse<Blog>>(`/api/blogs/${id}`, updateData),

  // Delete blog
  deleteBlog: (id: string) => 
    API.delete<ApiResponse<string>>(`/api/blogs/${id}`),

  // Add post to blog
  addPostToBlog: (id: string, postData: { title: string; description: string; thumbnail: File }) => {
    const formData = new FormData();
    formData.append('title', postData.title);
    formData.append('description', postData.description);
    formData.append('thumbnail', postData.thumbnail);

    return API.upload<ApiResponse<Blog>>(`/api/blogs/${id}/posts`, formData);
  },
};

// =============================================================================
// GALLERY API ENDPOINTS
// =============================================================================

export const galleryAPI = {
  // Get all galleries
  getGalleries: () => API.get<ApiResponse<Gallery[]>>('/api/galleries'),

  // Upload image
  uploadImage: (photo: string) => 
    API.post<ApiResponse<Gallery>>('/api/galleries/upload', { photo }),

  // Delete gallery
  deleteGallery: (id: string) => 
    API.delete<ApiResponse<string>>(`/api/galleries/${id}`),
};

// =============================================================================
// PAYMENT API ENDPOINTS (Based on controller files mentioned)
// =============================================================================

export const paymentAPI = {
  // Get all payments
  getPayments: () => API.get<ApiResponse<unknown[]>>('/api/payments'),

  // Create payment
  createPayment: (paymentData: unknown) => 
    API.post<ApiResponse<unknown>>('/api/payments', paymentData),

  // Get payment by ID
  getPaymentById: (id: string) => 
    API.get<ApiResponse<unknown>>(`/api/payments/${id}`),

  // Update payment
  updatePayment: (id: string, updateData: unknown) =>
    API.put<ApiResponse<unknown>>(`/api/payments/${id}`, updateData),

  // Delete payment
  deletePayment: (id: string) => 
    API.delete<ApiResponse<string>>(`/api/payments/${id}`),
};

// =============================================================================
// PAYMENT LIST API ENDPOINTS
// =============================================================================

export const paymentListAPI = {
  // Get all payment lists
  getPaymentLists: () => API.get<ApiResponse<unknown[]>>('/api/payment-lists'),

  // Create payment list
  createPaymentList: (listData: unknown) => 
    API.post<ApiResponse<unknown>>('/api/payment-lists', listData),

  // Get payment list by ID
  getPaymentListById: (id: string) => 
    API.get<ApiResponse<unknown>>(`/api/payment-lists/${id}`),

  // Update payment list
  updatePaymentList: (id: string, updateData: unknown) =>
    API.put<ApiResponse<unknown>>(`/api/payment-lists/${id}`, updateData),

  // Delete payment list
  deletePaymentList: (id: string) => 
    API.delete<ApiResponse<string>>(`/api/payment-lists/${id}`),
};

// =============================================================================
// EXPORT ALL APIs
// =============================================================================

export const apis = {
  user: userAPI,
  blog: blogAPI,
  gallery: galleryAPI,
  payment: paymentAPI,
  paymentList: paymentListAPI,
};

export default apis;
