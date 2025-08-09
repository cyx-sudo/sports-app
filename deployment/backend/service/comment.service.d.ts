import { DatabaseService } from './database.service';
import type { Comment, CreateCommentRequest, UpdateCommentRequest, CommentQueryParams } from '../interface';
export declare class CommentService {
    databaseService: DatabaseService;
    /**
     * 创建评论
     */
    createComment(userId: number, commentData: CreateCommentRequest): Promise<Comment>;
    /**
     * 获取评论详情
     */
    getCommentById(commentId: number): Promise<Comment | null>;
    /**
     * 获取评论列表
     */
    getComments(params?: CommentQueryParams): Promise<{
        items: Comment[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    /**
     * 更新评论
     */
    updateComment(commentId: number, userId: number, updateData: UpdateCommentRequest): Promise<Comment>;
    /**
     * 删除评论
     */
    deleteComment(commentId: number, userId: number): Promise<void>;
    /**
     * 获取活动的评分统计
     */
    getActivityRatingStats(activityId: number): Promise<{
        totalComments: any;
        averageRating: number;
        ratingDistribution: {
            5: any;
            4: any;
            3: any;
            2: any;
            1: any;
        };
    }>;
}
