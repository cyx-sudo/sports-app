import { Context } from '@midwayjs/koa';
import { UserService } from '../service/user.service';
export declare class APIController {
    ctx: Context;
    userService: UserService;
    getUser(uid: any): Promise<{
        success: boolean;
        message: string;
        data: Omit<import("../interface/user").User, "password">;
    }>;
}
