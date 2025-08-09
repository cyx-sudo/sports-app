import { Context } from '@midwayjs/koa';
import { FavoriteService, FavoriteListRequest } from '../service/favorite.service';
import { UserService } from '../service/user.service';
export declare class FavoriteController {
    ctx: Context;
    favoriteService: FavoriteService;
    userService: UserService;
    addFavorite(activityId: string): Promise<{
        success: boolean;
        message: string;
        data: import("../service/favorite.service").Favorite;
    } | {
        success: boolean;
        message: any;
        data: any;
    }>;
    removeFavorite(activityId: string): Promise<{
        success: boolean;
        message: any;
        data: any;
    }>;
    getMyFavorites(params: FavoriteListRequest): Promise<{
        success: boolean;
        message: string;
        data: {
            favorites: (import("../service/favorite.service").Favorite & {
                activity: any;
            })[];
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    } | {
        success: boolean;
        message: any;
        data: any;
    }>;
    checkFavorite(activityId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            isFavorited: boolean;
        };
    } | {
        success: boolean;
        message: any;
        data: any;
    }>;
}
