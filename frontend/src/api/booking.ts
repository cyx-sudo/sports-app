import request from '../utils/request';
import type { Booking, ApiResponse, PaginatedResponse } from '../../../shared/types';

// 获取我的预约列表
export const getMyBookings = (params?: {
  page?: number;
  limit?: number;
  status?: string;
}) => {
  return request.get<ApiResponse<PaginatedResponse<Booking>>>('/api/booking/my', { params });
};

// 取消预约
export const cancelBooking = (id: number) => {
  return request.delete<ApiResponse<null>>(`/api/booking/${id}`);
};

// 检查用户是否已预约某个活动
export const checkUserBooking = (activityId: number) => {
  return request.get<ApiResponse<{ isBooked: boolean; bookingId?: number }>>(`/api/booking/check/${activityId}`);
};

// 确认参加活动
export const confirmAttendance = (bookingId: number) => {
  return request.put<ApiResponse<null>>(`/api/booking/${bookingId}/attend`);
};
