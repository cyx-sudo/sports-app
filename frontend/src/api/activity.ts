import request from '../utils/request';
import type { Activity, ApiResponse, PaginatedResponse, CreateBookingRequest } from '../../../shared/types';

// 获取活动列表
export const getActivityList = (params?: {
  page?: number;
  limit?: number;
  category?: string;
  status?: string;
  search?: string;
}) => {
  return request.get<ApiResponse<PaginatedResponse<Activity>>>('/api/activity/list', { params });
};

// 获取活动详情
export const getActivityDetail = (id: number) => {
  return request.get<ApiResponse<Activity>>(`/api/activity/${id}`);
};

// 获取活动分类
export const getActivityCategories = () => {
  return request.get<ApiResponse<string[]>>('/api/activity/categories');
};

// 预约活动
export const bookActivity = (activityId: number, bookingData: CreateBookingRequest) => {
  return request.post(`/api/activity/${activityId}/book`, bookingData);
};

// === 管理员活动管理API ===

// 创建活动
export const createActivity = (activityData: {
  name: string;
  description: string;
  location: string;
  capacity: number;
  startTime: string;
  endTime: string;
  price?: number;
  instructor?: string;
  category: string;
}) => {
  return request.post<ApiResponse<Activity>>('/api/activity', activityData);
};

// 更新活动
export const updateActivity = (id: number, activityData: Partial<{
  name: string;
  description: string;
  location: string;
  capacity: number;
  startTime: string;
  endTime: string;
  price?: number;
  instructor?: string;
  category: string;
  status: string;
}>) => {
  return request.put<ApiResponse<Activity>>(`/api/activity/${id}`, activityData);
};

// 删除活动
export const deleteActivity = (id: number) => {
  return request.delete<ApiResponse<null>>(`/api/activity/${id}`);
};

// 获取活动预约列表
export const getActivityBookings = (id: number, params?: {
  page?: number;
  limit?: number;
  status?: string;
}) => {
  return request.get<ApiResponse<PaginatedResponse<any>>>(`/api/activity/${id}/bookings`, { params });
};
