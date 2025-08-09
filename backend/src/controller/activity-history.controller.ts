import {
  Inject,
  Controller,
  Post,
  Get,
  Del,
  Param,
  Query,
  Body,
} from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import {
  ActivityHistoryService,
  ActivityHistoryListRequest,
} from '../service/activity-history.service';
import { UserService } from '../service/user.service';

@Controller('/api/activity-history')
export class ActivityHistoryController {
  @Inject()
  ctx: Context;

  @Inject()
  activityHistoryService: ActivityHistoryService;

  @Inject()
  userService: UserService;

  // 添加活动历史记录
  @Post('/')
  async addActivityHistory(
    @Body()
    body: {
      activityId: number;
      bookingId: number;
      status: 'completed' | 'cancelled' | 'no-show';
    }
  ) {
    try {
      // 验证用户登录
      const authHeader = this.ctx.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        this.ctx.status = 401;
        return {
          success: false,
          message: '未提供有效的认证令牌',
          data: null,
        };
      }

      const token = authHeader.substring(7);
      const user = await this.userService.getUserByToken(token);

      const { activityId, bookingId, status } = body;

      if (!activityId || !bookingId || !status) {
        this.ctx.status = 400;
        return {
          success: false,
          message: '缺少必要参数',
          data: null,
        };
      }

      const history = await this.activityHistoryService.addActivityHistory(
        user.id,
        activityId,
        bookingId,
        status
      );

      return {
        success: true,
        message: '添加活动历史记录成功',
        data: history,
      };
    } catch (error) {
      this.ctx.status = 400;
      return {
        success: false,
        message: error.message,
        data: null,
      };
    }
  }

  // 获取用户活动历史列表
  @Get('/my')
  async getMyActivityHistory(@Query() params: ActivityHistoryListRequest) {
    try {
      // 验证用户登录
      const authHeader = this.ctx.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        this.ctx.status = 401;
        return {
          success: false,
          message: '未提供有效的认证令牌',
          data: null,
        };
      }

      const token = authHeader.substring(7);
      const user = await this.userService.getUserByToken(token);

      const result = await this.activityHistoryService.getUserActivityHistory(
        user.id,
        params
      );

      return {
        success: true,
        message: '获取活动历史列表成功',
        data: result,
      };
    } catch (error) {
      this.ctx.status = 400;
      return {
        success: false,
        message: error.message,
        data: null,
      };
    }
  }

  // 获取用户活动统计
  @Get('/stats')
  async getMyActivityStats() {
    try {
      // 验证用户登录
      const authHeader = this.ctx.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        this.ctx.status = 401;
        return {
          success: false,
          message: '未提供有效的认证令牌',
          data: null,
        };
      }

      const token = authHeader.substring(7);
      const user = await this.userService.getUserByToken(token);

      const stats = await this.activityHistoryService.getUserActivityStats(
        user.id
      );

      return {
        success: true,
        message: '获取活动统计成功',
        data: stats,
      };
    } catch (error) {
      this.ctx.status = 400;
      return {
        success: false,
        message: error.message,
        data: null,
      };
    }
  }

  // 获取用户某个活动的历史记录
  @Get('/activity/:activityId')
  async getActivityHistory(@Param('activityId') activityId: string) {
    try {
      // 验证用户登录
      const authHeader = this.ctx.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        this.ctx.status = 401;
        return {
          success: false,
          message: '未提供有效的认证令牌',
          data: null,
        };
      }

      const token = authHeader.substring(7);
      const user = await this.userService.getUserByToken(token);

      const activityIdNum = parseInt(activityId);
      if (isNaN(activityIdNum)) {
        this.ctx.status = 400;
        return {
          success: false,
          message: '无效的活动ID',
          data: null,
        };
      }

      const histories =
        await this.activityHistoryService.getUserActivityHistoryByActivity(
          user.id,
          activityIdNum
        );

      return {
        success: true,
        message: '获取活动历史记录成功',
        data: histories,
      };
    } catch (error) {
      this.ctx.status = 400;
      return {
        success: false,
        message: error.message,
        data: null,
      };
    }
  }

  // 删除活动历史记录
  @Del('/:id')
  async deleteActivityHistory(@Param('id') id: string) {
    try {
      // 验证用户登录
      const authHeader = this.ctx.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        this.ctx.status = 401;
        return {
          success: false,
          message: '未提供有效的认证令牌',
          data: null,
        };
      }

      const token = authHeader.substring(7);
      const user = await this.userService.getUserByToken(token);

      const historyId = parseInt(id);
      if (isNaN(historyId)) {
        this.ctx.status = 400;
        return {
          success: false,
          message: '无效的历史记录ID',
          data: null,
        };
      }

      // 验证记录所有权
      const history = await this.activityHistoryService.getActivityHistoryById(
        historyId
      );
      if (!history || history.userId !== user.id) {
        this.ctx.status = 403;
        return {
          success: false,
          message: '无权限删除此记录',
          data: null,
        };
      }

      const success = await this.activityHistoryService.deleteActivityHistory(
        historyId
      );

      if (success) {
        return {
          success: true,
          message: '删除活动历史记录成功',
          data: null,
        };
      } else {
        return {
          success: false,
          message: '删除失败',
          data: null,
        };
      }
    } catch (error) {
      this.ctx.status = 400;
      return {
        success: false,
        message: error.message,
        data: null,
      };
    }
  }
}
