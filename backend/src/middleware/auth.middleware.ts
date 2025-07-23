import { Middleware } from '@midwayjs/core';
import { Context, NextFunction } from '@midwayjs/koa';
import * as jwt from 'jsonwebtoken';

@Middleware()
export class AuthMiddleware {
  private jwtSecret = 'your-secret-key-change-in-production';

  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      // 获取 Authorization header
      const authHeader = ctx.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        ctx.status = 401;
        ctx.body = { success: false, message: '未提供有效的认证令牌' };
        return;
      }

      const token = authHeader.substring(7); // 移除 "Bearer " 前缀

      try {
        // 验证 JWT token
        const decoded = jwt.verify(token, this.jwtSecret) as any;

        // 将用户信息添加到 ctx.state
        ctx.state.user = {
          userId: decoded.userId,
          username: decoded.username,
        };

        await next();
      } catch (error) {
        ctx.status = 401;
        ctx.body = { success: false, message: '无效的认证令牌' };
      }
    };
  }
}
