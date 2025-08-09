import {
  Inject,
  Controller,
  Post,
  Del,
  Get,
  Param,
  Query,
} from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import {
  FavoriteService,
  FavoriteListRequest,
} from '../service/favorite.service';
import { UserService } from '../service/user.service';

@Controller('/api/favorite')
export class FavoriteController {
  @Inject()
  ctx: Context;

  @Inject()
  favoriteService: FavoriteService;

  @Inject()
  userService: UserService;

  // 添加收藏
  @Post('/:activityId')
  async addFavorite(@Param('activityId') activityId: string) {
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

      const favorite = await this.favoriteService.addFavorite(
        user.id,
        activityIdNum
      );

      return {
        success: true,
        message: '收藏成功',
        data: favorite,
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

  // 取消收藏
  @Del('/:activityId')
  async removeFavorite(@Param('activityId') activityId: string) {
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

      const success = await this.favoriteService.removeFavorite(
        user.id,
        activityIdNum
      );

      if (success) {
        return {
          success: true,
          message: '取消收藏成功',
          data: null,
        };
      } else {
        return {
          success: false,
          message: '未找到收藏记录',
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

  // 获取用户收藏列表
  @Get('/my')
  async getMyFavorites(@Query() params: FavoriteListRequest) {
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

      const result = await this.favoriteService.getUserFavorites(
        user.id,
        params
      );

      return {
        success: true,
        message: '获取收藏列表成功',
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

  // 检查活动是否已收藏
  @Get('/check/:activityId')
  async checkFavorite(@Param('activityId') activityId: string) {
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

      const isFavorited = await this.favoriteService.isFavorited(
        user.id,
        activityIdNum
      );

      return {
        success: true,
        message: '检查收藏状态成功',
        data: { isFavorited },
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
