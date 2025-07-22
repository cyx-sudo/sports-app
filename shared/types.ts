// 用户相关类型
export interface User {
  id: number;
  username: string;
  email: string;
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
  pageSize: number;
}

// 常用枚举
export enum BookingStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled'
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin'
}
