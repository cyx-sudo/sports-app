import { Context, NextFunction } from '@midwayjs/koa';
export declare class CorsMiddleware {
    resolve(): (ctx: Context, next: NextFunction) => Promise<void>;
}
