/**
 * @description User-Service parameters
 */
export interface IUserOptions {
  uid: number;
}

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
