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
exports.ActivityHistoryService = void 0;
const core_1 = require("@midwayjs/core");
const database_service_1 = require("./database.service");
let ActivityHistoryService = class ActivityHistoryService {
    // 添加活动历史记录
    async addActivityHistory(userId, activityId, bookingId, status) {
        const db = this.databaseService.getDatabase();
        // 检查是否已经有历史记录
        const existing = db
            .prepare('SELECT id FROM activity_history WHERE userId = ? AND activityId = ? AND bookingId = ?')
            .get(userId, activityId, bookingId);
        if (existing) {
            // 更新现有记录
            db.prepare('UPDATE activity_history SET status = ?, participatedAt = CURRENT_TIMESTAMP WHERE id = ?').run(status, existing.id);
            return this.getActivityHistoryById(existing.id);
        }
        else {
            // 创建新记录
            const result = db
                .prepare('INSERT INTO activity_history (userId, activityId, bookingId, status, participatedAt) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)')
                .run(userId, activityId, bookingId, status);
            return this.getActivityHistoryById(result.lastInsertRowid);
        }
    }
    // 获取用户活动历史列表
    async getUserActivityHistory(userId, params) {
        const db = this.databaseService.getDatabase();
        const page = params.page || 1;
        const limit = params.limit || 10;
        const offset = (page - 1) * limit;
        // 构建查询条件
        let whereClause = 'WHERE h.userId = ?';
        const queryParams = [userId];
        if (params.status) {
            whereClause += ' AND h.status = ?';
            queryParams.push(params.status);
        }
        if (params.dateFrom) {
            whereClause += ' AND h.participatedAt >= ?';
            queryParams.push(params.dateFrom);
        }
        if (params.dateTo) {
            whereClause += ' AND h.participatedAt <= ?';
            queryParams.push(params.dateTo);
        }
        // 获取总数
        const countQuery = `
      SELECT COUNT(*) as total 
      FROM activity_history h 
      ${whereClause}
    `;
        const countResult = db.prepare(countQuery).get(...queryParams);
        // 获取历史列表（包含活动和预约信息）
        const listQuery = `
      SELECT 
        h.*,
        a.name as activityName,
        a.description as activityDescription,
        a.location as activityLocation,
        a.startTime as activityStartTime,
        a.endTime as activityEndTime,
        a.price as activityPrice,
        a.instructor as activityInstructor,
        a.category as activityCategory,
        a.capacity as activityCapacity,
        b.bookingTime as bookingTime,
        b.status as bookingStatus
      FROM activity_history h 
      JOIN activities a ON h.activityId = a.id 
      LEFT JOIN bookings b ON h.bookingId = b.id 
      ${whereClause}
      ORDER BY h.participatedAt DESC 
      LIMIT ? OFFSET ?
    `;
        const histories = db
            .prepare(listQuery)
            .all(...queryParams, limit, offset);
        // 重构数据格式
        const formattedHistories = histories.map(history => ({
            id: history.id,
            userId: history.userId,
            activityId: history.activityId,
            bookingId: history.bookingId,
            status: history.status,
            participatedAt: history.participatedAt,
            createdAt: history.createdAt,
            activity: {
                id: history.activityId,
                name: history.activityName,
                description: history.activityDescription,
                location: history.activityLocation,
                startTime: history.activityStartTime,
                endTime: history.activityEndTime,
                price: history.activityPrice,
                instructor: history.activityInstructor,
                category: history.activityCategory,
                capacity: history.activityCapacity,
            },
            booking: {
                id: history.bookingId,
                bookingTime: history.bookingTime,
                status: history.bookingStatus,
            },
        }));
        return {
            histories: formattedHistories,
            total: countResult.total,
            page,
            limit,
            totalPages: Math.ceil(countResult.total / limit),
        };
    }
    // 根据ID获取活动历史记录
    async getActivityHistoryById(id) {
        const db = this.databaseService.getDatabase();
        const history = db
            .prepare('SELECT * FROM activity_history WHERE id = ?')
            .get(id);
        return history || null;
    }
    // 获取用户某个活动的历史记录
    async getUserActivityHistoryByActivity(userId, activityId) {
        const db = this.databaseService.getDatabase();
        const histories = db
            .prepare('SELECT * FROM activity_history WHERE userId = ? AND activityId = ? ORDER BY participatedAt DESC')
            .all(userId, activityId);
        return histories;
    }
    // 获取用户活动统计
    async getUserActivityStats(userId) {
        const db = this.databaseService.getDatabase();
        const totalResult = db
            .prepare('SELECT COUNT(*) as count FROM activity_history WHERE userId = ?')
            .get(userId);
        const completedResult = db
            .prepare('SELECT COUNT(*) as count FROM activity_history WHERE userId = ? AND status = ?')
            .get(userId, 'completed');
        const cancelledResult = db
            .prepare('SELECT COUNT(*) as count FROM activity_history WHERE userId = ? AND status = ?')
            .get(userId, 'cancelled');
        const noShowResult = db
            .prepare('SELECT COUNT(*) as count FROM activity_history WHERE userId = ? AND status = ?')
            .get(userId, 'no-show');
        return {
            totalActivities: totalResult.count,
            completedActivities: completedResult.count,
            cancelledActivities: cancelledResult.count,
            noShowActivities: noShowResult.count,
        };
    }
    // 删除活动历史记录
    async deleteActivityHistory(id) {
        const db = this.databaseService.getDatabase();
        const result = db
            .prepare('DELETE FROM activity_history WHERE id = ?')
            .run(id);
        return result.changes > 0;
    }
};
__decorate([
    (0, core_1.Inject)(),
    __metadata("design:type", database_service_1.DatabaseService)
], ActivityHistoryService.prototype, "databaseService", void 0);
ActivityHistoryService = __decorate([
    (0, core_1.Provide)(),
    (0, core_1.Scope)(core_1.ScopeEnum.Singleton)
], ActivityHistoryService);
exports.ActivityHistoryService = ActivityHistoryService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aXZpdHktaGlzdG9yeS5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3NlcnZpY2UvYWN0aXZpdHktaGlzdG9yeS5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLHlDQUFtRTtBQUNuRSx5REFBcUQ7QUF3QjlDLElBQU0sc0JBQXNCLEdBQTVCLE1BQU0sc0JBQXNCO0lBSWpDLFdBQVc7SUFDWCxLQUFLLENBQUMsa0JBQWtCLENBQ3RCLE1BQWMsRUFDZCxVQUFrQixFQUNsQixTQUFpQixFQUNqQixNQUE2QztRQUU3QyxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBRTlDLGNBQWM7UUFDZCxNQUFNLFFBQVEsR0FBRyxFQUFFO2FBQ2hCLE9BQU8sQ0FDTix1RkFBdUYsQ0FDeEY7YUFDQSxHQUFHLENBQUMsTUFBTSxFQUFFLFVBQVUsRUFBRSxTQUFTLENBQStCLENBQUM7UUFFcEUsSUFBSSxRQUFRLEVBQUU7WUFDWixTQUFTO1lBQ1QsRUFBRSxDQUFDLE9BQU8sQ0FDUix5RkFBeUYsQ0FDMUYsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUUzQixPQUFPLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLENBQUM7U0FDakQ7YUFBTTtZQUNMLFFBQVE7WUFDUixNQUFNLE1BQU0sR0FBRyxFQUFFO2lCQUNkLE9BQU8sQ0FDTiw2SEFBNkgsQ0FDOUg7aUJBQ0EsR0FBRyxDQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDO1lBRTlDLE9BQU8sSUFBSSxDQUFDLHNCQUFzQixDQUFDLE1BQU0sQ0FBQyxlQUF5QixDQUFDLENBQUM7U0FDdEU7SUFDSCxDQUFDO0lBRUQsYUFBYTtJQUNiLEtBQUssQ0FBQyxzQkFBc0IsQ0FDMUIs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