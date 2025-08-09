/**
 * @description User-Service parameters
 */
export interface IUserOptions {
    uid: number;
}
export interface Comment {
    id: number;
    userId: number;
    activityId: number;
    content: string;
    rating: number;
    createdAt: string;
    updatedAt?: string;
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
