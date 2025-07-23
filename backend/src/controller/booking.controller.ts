import {
  Inject,
  Controller,
  Get,
  Put,
  Del,
  Query,
  Param,
} from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { BookingService } from '../service/booking.service';
import { UserService } from '../service/user.service';
import { BookingListRequest } from '../interface/activity';

@Controller('/api/booking')
export class BookingController {
  @Inject()
  ctx: Context;

  @Inject()
  bookingService: BookingService;

  @Inject()
  userService: UserService;

  // 获取用户的预约列表
  @Get('/my')
  async getMyBookings(@Query() params: BookingListRequest) {
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

      const result = await this.bookingService.getUserBookings(user.id, params);
      return {
        success: true,
        message: '获取预约列表成功',
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

  // 取消预约
  @Del('/:id')
  async cancelBooking(@Param('id') id: string) {
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

      const bookingId = parseInt(id);
      if (isNaN(bookingId)) {
        this.ctx.status = 400;
        return {
          success: false,
          message: '无效的预约ID',
          data: null,
        };
      }

      const success = await this.bookingService.cancelBooking(
        user.id,
        bookingId
      );
      if (!success) {
        this.ctx.status = 404;
        return {
          success: false,
          message: '预约不存在或已取消',
          data: null,
        };
      }

      return {
        success: true,
        message: '预约取消成功',
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

  // 确认预约（管理员功能）
  @Put('/:id/confirm')
  async confirmBooking(@Param('id') id: string) {
    try {
      const bookingId = parseInt(id);
      if (isNaN(bookingId)) {
        this.ctx.status = 400;
        return {
          success: false,
          message: '无效的预约ID',
          data: null,
        };
      }

      const success = await this.bookingService.confirmBooking(bookingId);
      if (!success) {
        this.ctx.status = 404;
        return {
          success: false,
          message: '预约不存在或状态错误',
          data: null,
        };
      }

      return {
        success: true,
        message: '预约确认成功',
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

  // 获取预约详情
  @Get('/:id')
  async getBookingDetail(@Param('id') id: string) {
    try {
      const bookingId = parseInt(id);
      if (isNaN(bookingId)) {
        this.ctx.status = 400;
        return {
          success: false,
          message: '无效的预约ID',
          data: null,
        };
      }

      const booking = await this.bookingService.getBookingById(bookingId);
      if (!booking) {
        this.ctx.status = 404;
        return {
          success: false,
          message: '预约不存在',
          data: null,
        };
      }

      return {
        success: true,
        message: '获取预约详情成功',
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

  // 获取预约统计（管理员功能）
  @Get('/stats')
  async getBookingStats(@Query('activityId') activityId?: string) {
    try {
      const activityIdNum = activityId ? parseInt(activityId) : undefined;
      const stats = await this.bookingService.getBookingStats(activityIdNum);

      return {
        success: true,
        message: '获取预约统计成功',
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
}
