import { Inject, Controller, Post, Get, Body } from '@midwayjs/core';
import { Context } from '@midwayjs/koa';
import { UserService } from '../service/user.service';
import { RegisterRequest, LoginRequest } from '../interface/user';

@Controller('/api/user')
export class UserController {
  @Inject()
  ctx: Context;

  @Inject()
  userService: UserService;

  // 用户注册
  @Post('/register')
  async register(@Body() userData: RegisterRequest) {
    try {
      const result = await this.userService.register(userData);
      return {
        success: true,
        message: result.message,
        data: null
      };
    } catch (error) {
      this.ctx.status = 400;
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }

  // 用户登录
  @Post('/login')
  async login(@Body() loginData: LoginRequest) {
    try {
      const result = await this.userService.login(loginData);
      return {
        success: true,
        message: '登录成功',
        data: result
      };
    } catch (error) {
      this.ctx.status = 401;
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }

  // 获取用户信息（需要认证）
  @Get('/info')
  async getUserInfo() {
    try {
      // 手动验证 token
      const authHeader = this.ctx.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        this.ctx.status = 401;
        return {
          success: false,
          message: '未提供有效的认证令牌',
          data: null
        };
      }

      const token = authHeader.substring(7);
      const user = await this.userService.getUserByToken(token);
      
      return {
        success: true,
        message: '获取用户信息成功',
        data: user
      };
    } catch (error) {
      this.ctx.status = 401;
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }

  // 用户登出
  @Post('/logout')
  async logout() {
    try {
      // 手动验证 token
      const authHeader = this.ctx.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        this.ctx.status = 401;
        return {
          success: false,
          message: '未提供有效的认证令牌',
          data: null
        };
      }

      return {
        success: true,
        message: '登出成功',
        data: null
      };
    } catch (error) {
      this.ctx.status = 401;
      return {
        success: false,
        message: error.message,
        data: null
      };
    }
  }
}
