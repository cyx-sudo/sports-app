import {
  Inject,
  Controller,
  Post,
  Get,
  Put,
  Del,
  Body,
  Param,
  Query,
} from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { ActivityService } from '../service/activity.service';
import { BookingService } from '../service/booking.service';
import { UserService } from '../service/user.service';
import {
  CreateActivityRequest,
  UpdateActivityRequest,
  ActivityListRequest,
  CreateBookingRequest,
  BookingListRequest,
} from '../interface/activity';

@Controller('/api/activity')
export class ActivityController {
  @Inject()
  ctx: Context;

  @Inject()
  activityService: ActivityService;

  @Inject()
  bookingService: BookingService;

  @Inject()
  userService: UserService;

  // 创建活动（管理员功能）
  @Post('/')
  async createActivity(@Body() activityData: CreateActivityRequest) {
    try {
      const activity = await this.activityService.createActivity(activityData);
      return {
        success: true,
        message: '活动创建成功',
        data: activity,
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

  // 获取活动列表
  @Get('/list')
  async getActivityList(@Query() params: ActivityListRequest) {
    try {
      const result = await this.activityService.getActivityList(params);
      return {
        success: true,
        message: '获取活动列表成功',
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

  // 获取活动详情
  @Get('/:id')
  async getActivityDetail(@Param('id') id: string) {
    try {
      const activityId = parseInt(id);
      if (isNaN(activityId)) {
        this.ctx.status = 400;
        return {
          success: false,
          message: '无效的活动ID',
          data: null,
        };
      }

      const activity = await this.activityService.getActivityById(activityId);
      if (!activity) {
        this.ctx.status = 404;
        return {
          success: false,
          message: '活动不存在',
          data: null,
        };
      }

      // 获取预约统计
      const bookingStats = await this.bookingService.getBookingStats(
        activityId
      );

      return {
        success: true,
        message: '获取活动详情成功',
        data: {
          activity,
          bookingStats,
        },
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

  // 更新活动（管理员功能）
  @Put('/:id')
  async updateActivity(
    @Param('id') id: string,
    @Body() updateData: UpdateActivityRequest
  ) {
    try {
      const activityId = parseInt(id);
      if (isNaN(activityId)) {
        this.ctx.status = 400;
        return {
          success: false,
          message: '无效的活动ID',
          data: null,
        };
      }

      const activity = await this.activityService.updateActivity(
        activityId,
        updateData
      );
      if (!activity) {
        this.ctx.status = 404;
        return {
          success: false,
          message: '活动不存在',
          data: null,
        };
      }

      return {
        success: true,
        message: '活动更新成功',
        data: activity,
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

  // 删除活动（管理员功能）
  @Del('/:id')
  async deleteActivity(@Param('id') id: string) {
    try {
      const activityId = parseInt(id);
      if (isNaN(activityId)) {
        this.ctx.status = 400;
        return {
          success: false,
          message: '无效的活动ID',
          data: null,
        };
      }

      const success = await this.activityService.deleteActivity(activityId);
      if (!success) {
        this.ctx.status = 404;
        return {
          success: false,
          message: '活动不存在',
          data: null,
        };
      }

      return {
        success: true,
        message: '活动删除成功',
        data: null,
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

  // 获取活动分类
  @Get('/categories')
  async getActivityCategories() {
    try {
      const categories = await this.activityService.getActivityCategories();
      return {
        success: true,
        message: '获取活动分类成功',
        data: categories,
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

  // 预约活动
  @Post('/:id/book')
  async bookActivity(
    @Param('id') id: string,
    @Body() bookingData: CreateBookingRequest
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

      const activityId = parseInt(id);
      if (isNaN(activityId)) {
        this.ctx.status = 400;
        return {
          success: false,
          message: '无效的活动ID',
          data: null,
        };
      }

      // 设置活动ID
      bookingData.activityId = activityId;

      const booking = await this.bookingService.createBooking(
        user.id,
        bookingData
      );
      return {
        success: true,
        message: '预约成功',
        data: booking,
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

  // 获取活动的预约列表（管理员功能）
  @Get('/:id/bookings')
  async getActivityBookings(
    @Param('id') id: string,
    @Query() params: BookingListRequest
  ) {
    try {
      const activityId = parseInt(id);
      if (isNaN(activityId)) {
        this.ctx.status = 400;
        return {
          success: false,
          message: '无效的活动ID',
          data: null,
        };
      }

      const result = await this.bookingService.getActivityBookings(
        activityId,
        params
      );
      return {
        success: true,
        message: '获取活动预约列表成功',
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

  // 获取活动统计信息（包括实时参与人数）
  @Get('/:id/stats')
  async getActivityStats(@Param('id') id: string) {
    try {
      const activityId = parseInt(id);
      if (isNaN(activityId)) {
        this.ctx.status = 400;
        return {
          success: false,
          message: '无效的活动ID',
          data: null,
        };
      }

      const activity = await this.activityService.getActivityById(activityId);
      if (!activity) {
        this.ctx.status = 404;
        return {
          success: false,
          message: '活动不存在',
          data: null,
        };
      }

      const bookingStats = await this.bookingService.getBookingStats(activityId);
      const currentParticipants = await this.activityService.calculateCurrentParticipants(activityId);

      return {
        success: true,
        message: '获取活动统计成功',
        data: {
          activity: {
            id: activity.id,
            name: activity.name,
            capacity: activity.capacity,
            currentParticipants,
            availableSpots: activity.capacity - currentParticipants,
            status: activity.status,
          },
          bookingStats,
        },
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
}
