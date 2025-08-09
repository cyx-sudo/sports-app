import { Context } from '@midwayjs/koa';
import { UserService } from '../service/user.service';
import { RegisterRequest, LoginRequest } from '../interface/user';
export declare class UserController {
    ctx: Context;
    userService: UserService;
    register(userData: RegisterRequest): Promise<{
        success: boolean;
        message: any;
        data: any;
    }>;
    login(loginData: LoginRequest): Promise<{
        success: boolean;
        message: string;
        data: import("../interface/user").LoginResponse;
    } | {
        success: boolean;
        message: any;
        data: any;
    }>;
    getUserInfo(): Promise<{
        success: boolean;
        message: string;
        data: Omit<import("../interface/user").User, "password">;
    } | {
        success: boolean;
        message: any;
        data: any;
    }>;
    logout(): Promise<{
        success: boolean;
        message: any;
        data: any;
    }>;
    updateProfile(profileData: any): Promise<{
        success: boolean;
        message: string;
        data: Omit<import("../interface/user").User, "password">;
    } | {
        success: boolean;
        message: any;
        data: any;
    }>;
    changePassword(passwordData: {
        currentPassword: string;
        newPassword: string;
    }): Promise<{
        success: boolean;
        message: any;
        data: any;
    }>;
}
