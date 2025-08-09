import { DatabaseService } from './database.service';
export interface Favorite {
    id: number;
    userId: number;
    activityId: number;
    createdAt: string;
    activity?: any;
}
export interface FavoriteListRequest {
    page?: number;
    limit?: number;
}
export declare class FavoriteService {
    databaseService: DatabaseService;
    addFavorite(userId: number, activityId: number): Promise<Favorite>;
    removeFavorite(userId: number, activityId: number): Promise<boolean>;
    isFavorited(userId: number, activityId: number): Promise<boolean>;
    getUserFavorites(userId: number, params: FavoriteListRequest): Promise<{
        favorites: (Favorite & {
            activity: any;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getFavoriteById(id: number): Promise<Favorite | null>;
    getActivityFavoriteCount(activityId: number): Promise<number>;
}
