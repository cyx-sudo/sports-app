"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FavoriteService = void 0;
const core_1 = require("@midwayjs/core");
const database_service_1 = require("./database.service");
let FavoriteService = class FavoriteService {
    // 添加收藏
    async addFavorite(userId, activityId) {
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
        return this.getFavoriteById(result.lastInsertRowid);
    }
    // 取消收藏
    async removeFavorite(userId, activityId) {
        const db = this.databaseService.getDatabase();
        const result = db
            .prepare('DELETE FROM favorites WHERE userId = ? AND activityId = ?')
            .run(userId, activityId);
        return result.changes > 0;
    }
    // 检查是否已收藏
    async isFavorited(userId, activityId) {
        const db = this.databaseService.getDatabase();
        const result = db
            .prepare('SELECT id FROM favorites WHERE userId = ? AND activityId = ?')
            .get(userId, activityId);
        return !!result;
    }
    // 获取用户的收藏列表
    async getUserFavorites(userId, params) {
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
        const countResult = db.prepare(countQuery).get(userId);
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
        const favorites = db.prepare(listQuery).all(userId, limit, offset);
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
    async getFavoriteById(id) {
        const db = this.databaseService.getDatabase();
        const favorite = db
            .prepare('SELECT * FROM favorites WHERE id = ?')
            .get(id);
        return favorite || null;
    }
    // 获取活动的收藏数量
    async getActivityFavoriteCount(activityId) {
        const db = this.databaseService.getDatabase();
        const result = db
            .prepare('SELECT COUNT(*) as count FROM favorites WHERE activityId = ?')
            .get(activityId);
        return result.count || 0;
    }
};
__decorate([
    (0, core_1.Inject)(),
    __metadata("design:type", database_service_1.DatabaseService)
], FavoriteService.prototype, "databaseService", void 0);
FavoriteService = __decorate([
    (0, core_1.Provide)(),
    (0, core_1.Scope)(core_1.ScopeEnum.Singleton)
], FavoriteService);
exports.FavoriteService = FavoriteService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmF2b3JpdGUuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2aWNlL2Zhdm9yaXRlLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEseUNBQW1FO0FBQ25FLHlEQUFxRDtBQWlCOUMsSUFBTSxlQUFlLEdBQXJCLE1BQU0sZUFBZTtJQUkxQixPQUFPO0lBQ1AsS0FBSyxDQUFDLFdBQVcsQ0FBQyxNQUFjLEVBQUUsVUFBa0I7UUFDbEQsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUU5QyxZQUFZO1FBQ1osTUFBTSxRQUFRLEdBQUcsRUFBRTthQUNoQixPQUFPLENBQUMsOERBQThELENBQUM7YUFDdkUsR0FBRyxDQUFDLE1BQU0sRUFBRSxVQUFVLENBQUMsQ0FBQztRQUUzQixJQUFJLFFBQVEsRUFBRTtZQUNaLE1BQU0sSUFBSSxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUM7U0FDN0I7UUFFRCxPQUFPO1FBQ1AsTUFBTSxNQUFNLEdBQUcsRUFBRTthQUNkLE9BQU8sQ0FBQywwREFBMEQsQ0FBQzthQUNuRSxHQUFHLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBRTNCLE9BQU8sSUFBSSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsZUFBeUIsQ0FBQyxDQUFDO0lBQ2hFLENBQUM7SUFFRCxPQUFPO0lBQ1AsS0FBSyxDQUFDLGNBQWMsQ0FBQyxNQUFjLEVBQUUsVUFBa0I7UUFDckQsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUU5QyxNQUFNLE1BQU0sR0FBRyxFQUFFO2FBQ2QsT0FBTyxDQUFDLDJEQUEyRCxDQUFDO2FBQ3BFLEdBQUcsQ0FBQyxNQUFNLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFFM0IsT0FBTyxNQUFNLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQztJQUM1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