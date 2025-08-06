import request from '../utils/request';
import type { Comment, CreateCommentRequest, UpdateCommentRequest, CommentQueryParams, ApiResponse, PaginatedResponse } from '../../../shared/types';

// 创建评论
export const createComment = (commentData: CreateCommentRequest) => {
  return request.post<ApiResponse<Comment>>('/api/comment', commentData);
};

// 获取评论列表
export const getCommentList = (params?: CommentQueryParams) => {
  return request.get<ApiResponse<PaginatedResponse<Comment>>>('/api/comment/list', { params });
};

// 获取活动评论
export const getActivityComments = (activityId: number, params?: Omit<CommentQueryParams, 'activityId'>) => {
  return request.get<ApiResponse<PaginatedResponse<Comment>>>(`/api/comment/activity/${activityId}`, { params });
};

// 获取我的评论
export const getMyComments = (params?: Omit<CommentQueryParams, 'userId'>) => {
  return request.get<ApiResponse<PaginatedResponse<Comment>>>('/api/comment/my', { params });
};

// 获取评论详情
export const getCommentDetail = (commentId: number) => {
  return request.get<ApiResponse<Comment>>(`/api/comment/${commentId}`);
};

// 更新评论
export const updateComment = (commentId: number, updateData: UpdateCommentRequest) => {
  return request.put<ApiResponse<Comment>>(`/api/comment/${commentId}`, updateData);
};

// 删除评论
export const deleteComment = (commentId: number) => {
  return request.delete<ApiResponse<void>>(`/api/comment/${commentId}`);
};

// 获取活动评分统计
export const getActivityRatingStats = (activityId: number) => {
  return request.get<ApiResponse<{
    totalComments: number;
    averageRating: number;
    ratingDistribution: Record<string, number>;
  }>>(`/api/comment/stats/${activityId}`);
};
