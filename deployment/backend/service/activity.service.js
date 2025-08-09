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
exports.ActivityService = void 0;
const core_1 = require("@midwayjs/core");
const database_service_1 = require("./database.service");
let ActivityService = class ActivityService {
    // 创建活动
    async createActivity(activityData) {
        const db = this.databaseService.getDatabase();
        const insertActivity = db.prepare(`
      INSERT INTO activities (name, description, location, capacity, startTime, endTime, price, instructor, category)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
        const result = insertActivity.run(activityData.name, activityData.description, activityData.location, activityData.capacity, activityData.startTime, activityData.endTime, activityData.price, activityData.instructor, activityData.category);
        return this.getActivityById(result.lastInsertRowid);
    }
    // 获取活动列表
    async getActivityList(params) {
        const db = this.databaseService.getDatabase();
        const page = params.page || 1;
        const limit = params.limit || 10;
        const offset = (page - 1) * limit;
        // 构建查询条件
        let whereClause = 'WHERE 1=1';
        const queryParams = [];
        if (params.category) {
            whereClause += ' AND category = ?';
            queryParams.push(params.category);
        }
        if (params.status) {
            whereClause += ' AND status = ?';
            queryParams.push(params.status);
        }
        if (params.search) {
            whereClause +=
                ' AND (name LIKE ? OR description LIKE ? OR instructor LIKE ?)';
            const searchTerm = `%${params.search}%`;
            queryParams.push(searchTerm, searchTerm, searchTerm);
        }
        // 获取总数
        const countQuery = `SELECT COUNT(*) as total FROM activities ${whereClause}`;
        const countResult = db.prepare(countQuery).get(...queryParams);
        // 获取活动列表
        const listQuery = `
      SELECT * FROM activities 
      ${whereClause} 
      ORDER BY startTime ASC 
      LIMIT ? OFFSET ?
    `;
        const activities = db
            .prepare(listQuery)
            .all(...queryParams, limit, offset);
        // 为每个活动动态计算当前参与人数
        for (const activity of activities) {
            activity.currentParticipants = await this.calculateCurrentParticipants(activity.id);
        }
        return {
            items: activities,
            total: countResult.total,
            page,
            limit,
            totalPages: Math.ceil(countResult.total / limit),
        };
    }
    // 根据预约记录计算活动的实际参与人数
    async calculateCurrentParticipants(activityId) {
        const db = this.databaseService.getDatabase();
        const result = db
            .prepare(`
        SELECT COUNT(*) as count 
        FROM bookings 
        WHERE activityId = ? AND status IN ('pending', 'confirmed')
      `)
            .get(activityId);
        return result.count || 0;
    }
    // 根据ID获取活动详情
    async getActivityById(id) {
        const db = this.databaseService.getDatabase();
        const activity = db
            .prepare('SELECT * FROM activities WHERE id = ?')
            .get(id);
        if (activity) {
            // 根据实际预约记录计算当前参与人数
            activity.currentParticipants = await this.calculateCurrentParticipants(id);
        }
        return activity || null;
    }
    // 更新活动
    async updateActivity(id, updateData) {
        const db = this.databaseService.getDatabase();
        // 构建更新字段
        const fields = [];
        const values = [];
        if (updateData.name !== undefined) {
            fields.push('name = ?');
            values.push(updateData.name);
        }
        if (updateData.description !== undefined) {
            fields.push('description = ?');
            values.push(updateData.description);
        }
        if (updateData.location !== undefined) {
            fields.push('location = ?');
            values.push(updateData.location);
        }
        if (updateData.capacity !== undefined) {
            fields.push('capacity = ?');
            values.push(updateData.capacity);
        }
        if (updateData.startTime !== undefined) {
            fields.push('startTime = ?');
            values.push(updateData.startTime);
        }
        if (updateData.endTime !== undefined) {
            fields.push('endTime = ?');
            values.push(updateData.endTime);
        }
        if (updateData.price !== undefined) {
            fields.push('price = ?');
            values.push(updateData.price);
        }
        if (updateData.instructor !== undefined) {
            fields.push('instructor = ?');
            values.push(updateData.instructor);
        }
        if (updateData.category !== undefined) {
            fields.push('category = ?');
            values.push(updateData.category);
        }
        if (updateData.status !== undefined) {
            fields.push('status = ?');
            values.push(updateData.status);
        }
        if (fields.length === 0) {
            return this.getActivityById(id);
        }
        fields.push('updatedAt = CURRENT_TIMESTAMP');
        values.push(id);
        const updateQuery = `UPDATE activities SET ${fields.join(', ')} WHERE id = ?`;
        const result = db.prepare(updateQuery).run(...values);
        if (result.changes === 0) {
            return null;
        }
        return this.getActivityById(id);
    }
    // 删除活动
    async deleteActivity(id) {
        const db = this.databaseService.getDatabase();
        // 检查是否有相关的预约记录
        const bookingCount = db
            .prepare('SELECT COUNT(*) as count FROM bookings WHERE activityId = ? AND status != ?')
            .get(id, 'cancelled');
        if (bookingCount.count > 0) {
            throw new Error(`无法删除活动，该活动还有 ${bookingCount.count} 个有效预约记录。请先处理相关预约。`);
        }
        // 如果没有有效预约记录，则可以安全删除
        const transaction = db.transaction(() => {
            // 先删除已取消的预约记录（如果有的话）
            db.prepare('DELETE FROM bookings WHERE activityId = ? AND status = ?').run(id, 'cancelled');
            // 然后删除活动
            const result = db.prepare('DELETE FROM activities WHERE id = ?').run(id);
            return result.changes > 0;
        });
        return transaction();
    }
    // 获取活动分类列表
    async getActivityCategories() {
        const db = this.databaseService.getDatabase();
        const categories = db
            .prepare('SELECT DISTINCT category FROM activities ORDER BY category')
            .all();
        return categories.map(c => c.category);
    }
    // 检查活动是否可以预约
    async isActivityBookable(activityId) {
        const activity = await this.getActivityById(activityId);
        if (!activity) {
            return false;
        }
        // 获取当前实际参与人数
        const currentParticipants = await this.calculateCurrentParticipants(activityId);
        return (activity.status === 'active' &&
            currentParticipants < activity.capacity &&
            new Date(activity.startTime) > new Date());
    }
};
__decorate([
    (0, core_1.Inject)(),
    __metadata("design:type", database_service_1.DatabaseService)
], ActivityService.prototype, "databaseService", void 0);
ActivityService = __decorate([
    (0, core_1.Provide)(),
    (0, core_1.Scope)(core_1.ScopeEnum.Singleton)
], ActivityService);
exports.ActivityService = ActivityService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aXZpdHkuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2aWNlL2FjdGl2aXR5LnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEseUNBQW1FO0FBQ25FLHlEQUFxRDtBQVc5QyxJQUFNLGVBQWUsR0FBckIsTUFBTSxlQUFlO0lBSTFCLE9BQU87SUFDUCxLQUFLLENBQUMsY0FBYyxDQUFDLFlBQW1DO1FBQ3RELE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsV0FBVyxFQUFFLENBQUM7UUFFOUMsTUFBTSxjQUFjLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQzs7O0tBR2pDLENBQUMsQ0FBQztRQUVILE1BQU0sTUFBTSxHQUFHLGNBQWMsQ0FBQyxHQUFHLENBQy9CLFlBQVksQ0FBQyxJQUFJLEVBQ2pCLFlBQVksQ0FBQyxXQUFXLEVBQ3hCLFlBQVksQ0FBQyxRQUFRLEVBQ3JCLFlBQVksQ0FBQyxRQUFRLEVBQ3JCLFlBQVksQ0FBQyxTQUFTLEVBQ3RCLFlBQVksQ0FBQyxPQUFPLEVBQ3BCLFlBQVksQ0FBQyxLQUFLLEVBQ2xCLFlBQVksQ0FBQyxVQUFVLEVBQ3ZCLFlBQVksQ0FBQyxRQUFRLENBQ3RCLENBQUM7UUFFRixPQUFPLElBQUksQ0FBQyxlQUFlLENBQUMsTUFBTSxDQUFDLGVBQXlCLENBQUMsQ0FBQztJQUNoRSxDQUFDO0lBRUQsU0FBUztJQUNULEtBQUssQ0FBQyxlQUFlLENBQ25CLE1BQTJCO1FBRTNCLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsV0FBVyxFQUFFLENBQUM7UUFFOUMsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksSUFBSSxDQUFDLENBQUM7UUFDOUIsTUFBTSxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssSUFBSSxFQUFFLENBQUM7UUFDakMsTUFBTSxNQUFNLEdBQUcsQ0FBQyxJQUFJLEdBQUcsQ0FB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