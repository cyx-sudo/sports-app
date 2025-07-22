import { Middleware } from '@midwayjs/core';
import { Context, NextFunction } from '@midwayjs/koa';

@Middleware()
export class CorsMiddleware {
  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      // 设置CORS头
      ctx.set('Access-Control-Allow-Origin', 'http://localhost:5173');
      ctx.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      ctx.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      ctx.set('Access-Control-Allow-Credentials', 'true');

      // 处理预检请求
      if (ctx.method === 'OPTIONS') {
        ctx.status = 200;
        return;
      }

      await next();
    };
  }
}
