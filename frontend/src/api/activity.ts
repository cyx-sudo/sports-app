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
