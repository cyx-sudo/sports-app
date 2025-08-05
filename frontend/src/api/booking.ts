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
  return request.delete(`/api/booking/${id}`);
};
