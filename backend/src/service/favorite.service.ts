import { Provide, Scope, ScopeEnum, Inject } from '@midwayjs/core';
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

@Provide()
@Scope(ScopeEnum.Singleton)
export class FavoriteService {
  @Inject()
  databaseService: DatabaseService;

  // 添加收藏
  async addFavorite(userId: number, activityId: number): Promise<Favorite> {
    const db = this.databaseService.getDatabase();

    // 检查是否已经收藏过
    const existing = db
      .prepare('SELECT id FROM favorites WHERE userId = ? AND activityId = ?')
      .get(userId, activityId);

    if (existing) {
      throw new Error('已经收藏过该活动');
    }

    // 添加收藏
    const result = db
      .prepare('INSERT INTO favorites (userId, activityId) VALUES (?, ?)')
      .run(userId, activityId);

    return this.getFavoriteById(result.lastInsertRowid as number);
  }

  // 取消收藏
  async removeFavorite(userId: number, activityId: number): Promise<boolean> {
    const db = this.databaseService.getDatabase();

    const result = db
      .prepare('DELETE FROM favorites WHERE userId = ? AND activityId = ?')
      .run(userId, activityId);

    return result.changes > 0;
  }

  // 检查是否已收藏
  async isFavorited(userId: number, activityId: number): Promise<boolean> {
    const db = this.databaseService.getDatabase();

    const result = db
      .prepare('SELECT id FROM favorites WHERE userId = ? AND activityId = ?')
      .get(userId, activityId);

    return !!result;
  }

  // 获取用户的收藏列表
  async getUserFavorites(
    userId: number,
    params: FavoriteListRequest
  ): Promise<{
    favorites: (Favorite & { activity: any })[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const db = this.databaseService.getDatabase();

    const page = params.page || 1;
    const limit = params.limit || 10;
    const offset = (page - 1) * limit;

    // 获取总数
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM favorites f 
      WHERE f.userId = ?
    `;
    const countResult = db.prepare(countQuery).get(userId) as {
      total: number;
    };

    // 获取收藏列表（包含活动信息）
    const listQuery = `
      SELECT 
        f.*,
        a.name as activityName,
        a.description as activityDescription,
        a.location as activityLocation,
        a.startTime as activityStartTime,
        a.endTime as activityEndTime,
        a.price as activityPrice,
        a.instructor as activityInstructor,
        a.category as activityCategory,
        a.status as activityStatus,
        a.capacity as activityCapacity,
        a.currentParticipants as activityCurrentParticipants
      FROM favorites f 
      JOIN activities a ON f.activityId = a.id 
      WHERE f.userId = ?
      ORDER BY f.createdAt DESC 
      LIMIT ? OFFSET ?
    `;

    const favorites = db.prepare(listQuery).all(userId, limit, offset) as any[];

    // 重构数据格式
    const formattedFavorites = favorites.map(favorite => ({
      id: favorite.id,
      userId: favorite.userId,
      activityId: favorite.activityId,
      createdAt: favorite.createdAt,
      activity: {
        id: favorite.activityId,
        name: favorite.activityName,
        description: favorite.activityDescription,
        location: favorite.activityLocation,
        startTime: favorite.activityStartTime,
        endTime: favorite.activityEndTime,
        price: favorite.activityPrice,
        instructor: favorite.activityInstructor,
        category: favorite.activityCategory,
        status: favorite.activityStatus,
        capacity: favorite.activityCapacity,
        currentParticipants: favorite.activityCurrentParticipants,
      },
    }));

    return {
      favorites: formattedFavorites,
      total: countResult.total,
      page,
      limit,
      totalPages: Math.ceil(countResult.total / limit),
    };
  }

  // 根据ID获取收藏记录
  async getFavoriteById(id: number): Promise<Favorite | null> {
    const db = this.databaseService.getDatabase();

    const favorite = db
      .prepare('SELECT * FROM favorites WHERE id = ?')
      .get(id) as Favorite;

    return favorite || null;
  }

  // 获取活动的收藏数量
  async getActivityFavoriteCount(activityId: number): Promise<number> {
    const db = this.databaseService.getDatabase();

    const result = db
      .prepare('SELECT COUNT(*) as count FROM favorites WHERE activityId = ?')
      .get(activityId) as { count: number };

    return result.count || 0;
  }
}
