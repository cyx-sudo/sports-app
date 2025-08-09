import request from '../utils/request';
import type { ApiResponse } from '../../../shared/types';

export interface Favorite {
  id: number;
  userId: number;
  activityId: number;
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
    status: string;
    capacity: number;
    currentParticipants: number;
  };
}

export interface FavoriteListResponse {
  favorites: Favorite[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 添加收藏
export const addFavorite = (activityId: number) => {
  return request.post<ApiResponse<Favorite>>(`/api/favorite/${activityId}`);
};

// 取消收藏
export const removeFavorite = (activityId: number) => {
  return request.delete<ApiResponse<null>>(`/api/favorite/${activityId}`);
};

// 获取我的收藏列表
export const getMyFavorites = (params?: {
  page?: number;
  limit?: number;
}) => {
  return request.get<ApiResponse<FavoriteListResponse>>('/api/favorite/my', { params });
};

// 检查活动是否已收藏
export const checkFavorite = (activityId: number) => {
  return request.get<ApiResponse<{ isFavorited: boolean }>>(`/api/favorite/check/${activityId}`);
};
