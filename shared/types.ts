// 用户相关类型
export interface User {
  id: number;
  username: string;
  email: string;
  phone: string;
  createdAt?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  phone: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

// 活动相关类型
export interface Activity {
  id: number;
  title: string;
  description: string;
  location: string;
  startTime: string;
  endTime: string;
  maxParticipants: number;
  currentParticipants: number;
  creatorId: number;
  category?: string;
  instructor?: string;
  price?: number;
  status?: string;
  createdAt?: string;
}

export interface CreateActivityRequest {
  title: string;
  description: string;
  location: string;
  startTime: string;
  endTime: string;
  maxParticipants: number;
}

export interface UpdateActivityRequest extends Partial<CreateActivityRequest> {}

// 预订相关类型
export interface Booking {
  id: number;
  userId: number;
  activityId: number;
  status: 'active' | 'cancelled';
  createdAt: string;
  activity?: Activity;
  user?: User;
}

export interface CreateBookingRequest {
  activityId: number;
}

// API 响应类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  code?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 常用枚举
export const BookingStatus = {
  ACTIVE: 'active',
  CANCELLED: 'cancelled'
} as const;

export type BookingStatus = typeof BookingStatus[keyof typeof BookingStatus];

export const UserRole = {
  USER: 'user',
  ADMIN: 'admin'
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

// 评论相关类型
export interface Comment {
  id: number;
  userId: number;
  activityId: number;
  content: string;
  rating: number; // 1-5星评级
  createdAt: string;
  updatedAt?: string;
  // 关联数据（查询时可能包含）
  user?: {
    id: number;
    username: string;
    realName?: string;
  };
  activity?: {
    id: number;
    name: string;
  };
}

export interface CreateCommentRequest {
  activityId: number;
  content: string;
  rating: number;
}

export interface UpdateCommentRequest {
  content?: string;
  rating?: number;
}

export interface CommentQueryParams {
  activityId?: number;
  userId?: number;
  page?: number;
  limit?: number;
  sortBy?: 'rating' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}
