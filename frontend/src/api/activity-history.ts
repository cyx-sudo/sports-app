import request from '../utils/request';
import type { ApiResponse } from '../../../shared/types';

export interface ActivityHistory {
  id: number;
  userId: number;
  activityId: number;
  bookingId: number;
  status: 'completed' | 'cancelled' | 'no-show';
  participatedAt: string;
  createdAt: string;
  activity: {
    id: number;
    name: string;
    description: string;
    location: string;
    startTime: string;
    endTime: string;
    price: number;
    instructor: string;
    category: string;
    capacity: number;
  };
  booking: {
    id: number;
    bookingTime: string;
    status: string;
  };
}

export interface ActivityHistoryListResponse {
  histories: ActivityHistory[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ActivityHistoryStats {
  totalActivities: number;
  completedActivities: number;
  cancelledActivities: number;
  noShowActivities: number;
}

// 添加活动历史记录
export const addActivityHistory = (data: {
  activityId: number;
  bookingId: number;
  status: 'completed' | 'cancelled' | 'no-show';
}) => {
  return request.post<ApiResponse<ActivityHistory>>('/api/activity-history', data);
};

// 获取我的活动历史列表
export const getMyActivityHistory = (params?: {
  page?: number;
  limit?: number;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}) => {
  return request.get<ApiResponse<ActivityHistoryListResponse>>('/api/activity-history/my', { params });
};

// 获取我的活动统计
export const getMyActivityStats = () => {
  return request.get<ApiResponse<ActivityHistoryStats>>('/api/activity-history/stats');
};

// 获取某个活动的历史记录
export const getActivityHistory = (activityId: number) => {
  return request.get<ApiResponse<ActivityHistory[]>>(`/api/activity-history/activity/${activityId}`);
};

// 删除活动历史记录
export const deleteActivityHistory = (id: number) => {
  return request.delete<ApiResponse<null>>(`/api/activity-history/${id}`);
};
