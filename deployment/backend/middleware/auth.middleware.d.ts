import { Context, NextFunction } from '@midwayjs/koa';
export declare class AuthMiddleware {
    private jwtSecret;
    resolve(): (ctx: Context, next: NextFunction) => Promise<void>;
}
