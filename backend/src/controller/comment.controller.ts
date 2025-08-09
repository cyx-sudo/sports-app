import {
  Controller,
  Post,
  Get,
  Put,
  Del,
  Inject,
  Body,
  Param,
  Query,
} from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { CommentService } from '../service/comment.service';
import { UserService } from '../service/user.service';
import type {
  CreateCommentRequest,
  UpdateCommentRequest,
  CommentQueryParams,
} from '../interface';

@Controller('/api/comment')
export class CommentController {
  @Inject()
  ctx: Context;

  @Inject()
  commentService: CommentService;

  @Inject()
  userService: UserService;

  /**
   * 创建评论
   */
  @Post('/')
  async createComment(@Body() commentData: CreateCommentRequest) {
    try {
      // 验证用户登录
      const authHeader = this.ctx.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        this.ctx.status = 401;
        return {
          success: false,
          message: '未提供有效的认证令牌',
        };
      }

      const token = authHeader.substring(7);
      const user = await this.userService.getUserByToken(token);

      const comment = await this.commentService.createComment(
        user.id,
        commentData
      );

      return {
        success: true,
        data: comment,
        message: '评论创建成功',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || '创建评论失败',
      };
    }
  }

  /**
   * 获取评论列表
   */
  @Get('/list')
  async getComments(@Query() queryParams: CommentQueryParams) {
    try {
      const result = await this.commentService.getComments(queryParams);

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || '获取评论列表失败',
      };
    }
  }

  /**
   * 获取活动评论
   */
  @Get('/activity/:activityId')
  async getActivityComments(
    @Param('activityId') activityId: number,
    @Query() queryParams: Omit<CommentQueryParams, 'activityId'>
  ) {
    try {
      const result = await this.commentService.getComments({
        ...queryParams,
        activityId,
      });

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || '获取活动评论失败',
      };
    }
  }

  /**
   * 获取用户评论
   */
  @Get('/my')
  async getMyComments(
    @Query() queryParams: Omit<CommentQueryParams, 'userId'>
  ) {
    try {
      const userId = this.ctx.state.user?.id;
      if (!userId) {
        return {
          success: false,
          message: '请先登录',
        };
      }

      const result = await this.commentService.getComments({
        ...queryParams,
        userId,
      });

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || '获取我的评论失败',
      };
    }
  }

  /**
   * 获取评论详情
   */
  @Get('/:id')
  async getComment(@Param('id') commentId: number) {
    try {
      const comment = await this.commentService.getCommentById(commentId);

      if (!comment) {
        return {
          success: false,
          message: '评论不存在',
        };
      }

      return {
        success: true,
        data: comment,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || '获取评论详情失败',
      };
    }
  }

  /**
   * 更新评论
   */
  @Put('/:id')
  async updateComment(
    @Param('id') commentId: number,
    @Body() updateData: UpdateCommentRequest
  ) {
    try {
      // 验证用户登录
      const authHeader = this.ctx.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        this.ctx.status = 401;
        return {
          success: false,
          message: '未提供有效的认证令牌',
        };
      }

      const token = authHeader.substring(7);
      const user = await this.userService.getUserByToken(token);

      const comment = await this.commentService.updateComment(
        commentId,
        user.id,
        updateData
      );

      return {
        success: true,
        data: comment,
        message: '评论更新成功',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || '更新评论失败',
      };
    }
  }

  /**
   * 删除评论
   */
  @Del('/:id')
  async deleteComment(@Param('id') commentId: number) {
    try {
      // 验证用户登录
      const authHeader = this.ctx.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        this.ctx.status = 401;
        return {
          success: false,
          message: '未提供有效的认证令牌',
        };
      }

      const token = authHeader.substring(7);
      const user = await this.userService.getUserByToken(token);

      await this.commentService.deleteComment(commentId, user.id);

      return {
        success: true,
        message: '评论删除成功',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || '删除评论失败',
      };
    }
  }

  /**
   * 获取活动评分统计
   */
  @Get('/stats/:activityId')
  async getActivityRatingStats(@Param('activityId') activityId: number) {
    try {
      const stats = await this.commentService.getActivityRatingStats(
        activityId
      );

      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || '获取评分统计失败',
      };
    }
  }
}
