import { Context } from '@midwayjs/koa';
import { CommentService } from '../service/comment.service';
import type { CreateCommentRequest, UpdateCommentRequest, CommentQueryParams } from '../interface';
export declare class CommentController {
    ctx: Context;
    commentService: CommentService;
    /**
     * 创建评论
     */
    createComment(commentData: CreateCommentRequest): Promise<{
        success: boolean;
        data: import("../interface").Comment;
        message: string;
    } | {
        success: boolean;
        message: any;
        data?: undefined;
    }>;
    /**
     * 获取评论列表
     */
    getComments(queryParams: CommentQueryParams): Promise<{
        success: boolean;
        data: {
            items: import("../interface").Comment[];
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
        message?: undefined;
    } | {
        success: boolean;
        message: any;
        data?: undefined;
    }>;
    /**
     * 获取活动评论
     */
    getActivityComments(activityId: number, queryParams: Omit<CommentQueryParams, 'activityId'>): Promise<{
        success: boolean;
        data: {
            items: import("../interface").Comment[];
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
        message?: undefined;
    } | {
        success: boolean;
        message: any;
        data?: undefined;
    }>;
    /**
     * 获取用户评论
     */
    getMyComments(queryParams: Omit<CommentQueryParams, 'userId'>): Promise<{
        success: boolean;
        data: {
            items: import("../interface").Comment[];
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
        message?: undefined;
    } | {
        success: boolean;
        message: any;
        data?: undefined;
    }>;
    /**
     * 获取评论详情
     */
    getComment(commentId: number): Promise<{
        success: boolean;
        data: import("../interface").Comment;
        message?: undefined;
    } | {
        success: boolean;
        message: any;
        data?: undefined;
    }>;
    /**
     * 更新评论
     */
    updateComment(commentId: number, updateData: UpdateCommentRequest): Promise<{
        success: boolean;
        data: import("../interface").Comment;
        message: string;
    } | {
        success: boolean;
        message: any;
        data?: undefined;
    }>;
    /**
     * 删除评论
     */
    deleteComment(commentId: number): Promise<{
        success: boolean;
        message: any;
    }>;
    /**
     * 获取活动评分统计
     */
    getActivityRatingStats(activityId: number): Promise<{
        success: boolean;
        data: {
            totalComments: any;
            averageRating: number;
            ratingDistribution: {
                5: any;
                4: any;
                3: any;
                2: any;
                1: any;
            };
        };
        message?: undefined;
    } | {
        success: boolean;
        message: any;
        data?: undefined;
    }>;
}
