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
exports.BookingService = void 0;
const core_1 = require("@midwayjs/core");
const database_service_1 = require("./database.service");
const activity_service_1 = require("./activity.service");
const activity_history_service_1 = require("./activity-history.service");
let BookingService = class BookingService {
    // 创建预约
    async createBooking(userId, bookingData) {
        const db = this.databaseService.getDatabase();
        // 检查活动是否可预约
        const isBookable = await this.activityService.isActivityBookable(bookingData.activityId);
        if (!isBookable) {
            throw new Error('该活动不可预约');
        }
        // 检查用户是否已经预约过该活动
        const existingBooking = db
            .prepare(`
      SELECT id FROM bookings 
      WHERE userId = ? AND activityId = ? AND status != 'cancelled'
    `)
            .get(userId, bookingData.activityId);
        if (existingBooking) {
            throw new Error('您已经预约过该活动');
        }
        // 获取活动详情进行最终容量检查
        const activity = await this.activityService.getActivityById(bookingData.activityId);
        if (!activity) {
            throw new Error('活动不存在');
        }
        // 再次检查容量（使用动态计算的人数）
        const currentParticipants = await this.activityService.calculateCurrentParticipants(bookingData.activityId);
        if (currentParticipants >= activity.capacity) {
            throw new Error('活动已满，无法预约');
        }
        // 使用事务确保数据一致性
        const transaction = db.transaction(() => {
            // 创建预约
            const insertBooking = db.prepare(`
        INSERT INTO bookings (userId, activityId, status)
        VALUES (?, ?, 'pending')
      `);
            const result = insertBooking.run(userId, bookingData.activityId);
            return result.lastInsertRowid;
        });
        const bookingId = transaction();
        return this.getBookingById(bookingId);
    }
    // 获取预约详情
    async getBookingById(id) {
        const db = this.databaseService.getDatabase();
        const booking = db
            .prepare('SELECT * FROM bookings WHERE id = ?')
            .get(id);
        return booking || null;
    }
    // 获取用户的预约列表
    async getUserBookings(userId, params) {
        const db = this.databaseService.getDatabase();
        const page = params.page || 1;
        const limit = params.limit || 10;
        const offset = (page - 1) * limit;
        let whereClause = 'WHERE b.userId = ?';
        const queryParams = [userId];
        if (params.status) {
            whereClause += ' AND b.status = ?';
            queryParams.push(params.status);
        }
        // 获取总数
        const countQuery = `
      SELECT COUNT(*) as total 
      FROM bookings b 
      ${whereClause}
    `;
        const countResult = db.prepare(countQuery).get(...queryParams);
        // 获取预约列表（包含活动信息）
        const listQuery = `
      SELECT 
        b.*,
        a.name as activityName,
        a.description as activityDescription,
        a.location as activityLocation,
        a.startTime as activityStartTime,
        a.endTime as activityEndTime,
        a.price as activityPrice,
        a.instructor as activityInstructor,
        a.category as activityCategory,
        a.status as activityStatus
      FROM bookings b 
      JOIN activities a ON b.activityId = a.id 
      ${whereClause} 
      ORDER BY b.createdAt DESC 
      LIMIT ? OFFSET ?
    `;
        const bookings = db
            .prepare(listQuery)
            .all(...queryParams, limit, offset);
        // 重构数据格式
        const formattedBookings = bookings.map(booking => ({
            id: booking.id,
            userId: booking.userId,
            activityId: booking.activityId,
            status: booking.status,
            bookingTime: booking.bookingTime,
            createdAt: booking.createdAt,
            updatedAt: booking.updatedAt,
            activity: {
                id: booking.activityId,
                name: booking.activityName,
                description: booking.activityDescription,
                location: booking.activityLocation,
                startTime: booking.activityStartTime,
                endTime: booking.activityEndTime,
                price: booking.activityPrice,
                instructor: booking.activityInstructor,
                category: booking.activityCategory,
                status: booking.activityStatus,
            },
        }));
        return {
            bookings: formattedBookings,
            total: countResult.total,
            page,
            limit,
            totalPages: Math.ceil(countResult.total / limit),
        };
    }
    // 获取活动的预约列表
    async getActivityBookings(activityId, params) {
        const db = this.databaseService.getDatabase();
        const page = params.page || 1;
        const limit = params.limit || 10;
        const offset = (page - 1) * limit;
        let whereClause = 'WHERE b.activityId = ?';
        const queryParams = [activityId];
        if (params.status) {
            whereClause += ' AND b.status = ?';
            queryParams.push(params.status);
        }
        // 获取总数
        const countQuery = `
      SELECT COUNT(*) as total 
      FROM bookings b 
      ${whereClause}
    `;
        const countResult = db.prepare(countQuery).get(...queryParams);
        // 获取预约列表（包含用户信息）
        const listQuery = `
      SELECT 
        b.*,
        u.username,
        u.email,
        u.phone,
        u.realName
      FROM bookings b 
      JOIN users u ON b.userId = u.id 
      ${whereClause} 
      ORDER BY b.createdAt DESC 
      LIMIT ? OFFSET ?
    `;
        const bookings = db
            .prepare(listQuery)
            .all(...queryParams, limit, offset);
        // 重构数据格式
        const formattedBookings = bookings.map(booking => ({
            id: booking.id,
            userId: booking.userId,
            activityId: booking.activityId,
            status: booking.status,
            bookingTime: booking.bookingTime,
            createdAt: booking.createdAt,
            updatedAt: booking.updatedAt,
            user: {
                id: booking.userId,
                username: booking.username,
                email: booking.email,
                phone: booking.phone,
                realName: booking.realName,
            },
        }));
        return {
            bookings: formattedBookings,
            total: countResult.total,
            page,
            limit,
            totalPages: Math.ceil(countResult.total / limit),
        };
    }
    // 取消预约
    async cancelBooking(userId, bookingId) {
        const db = this.databaseService.getDatabase();
        // 验证预约是否存在且属于当前用户
        const booking = db
            .prepare('SELECT * FROM bookings WHERE id = ? AND userId = ?')
            .get(bookingId, userId);
        if (!booking) {
            throw new Error('预约不存在或无权限取消');
        }
        if (booking.status === 'cancelled') {
            throw new Error('预约已取消');
        }
        const transaction = db.transaction(() => {
            // 更新预约状态为取消
            const updateBooking = db.prepare(`
        UPDATE bookings 
        SET status = 'cancelled', updatedAt = CURRENT_TIMESTAMP 
        WHERE id = ?
      `);
            const result = updateBooking.run(bookingId);
            return result.changes > 0;
        });
        return transaction();
    }
    // 确认预约
    async confirmBooking(bookingId) {
        const db = this.databaseService.getDatabase();
        const result = db
            .prepare(`
      UPDATE bookings 
      SET status = 'confirmed', updatedAt = CURRENT_TIMESTAMP 
      WHERE id = ? AND status = 'pending'
    `)
            .run(bookingId);
        return result.changes > 0;
    }
    // 获取预约统计
    async getBookingStats(activityId) {
        const db = this.databaseService.getDatabase();
        let whereClause = '';
        const queryParams = [];
        if (activityId) {
            whereClause = 'WHERE activityId = ?';
            queryParams.push(activityId);
        }
        const stats = db
            .prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled
      FROM bookings 
      ${whereClause}
    `)
            .get(...queryParams);
        return {
            total: stats.total || 0,
            pending: stats.pending || 0,
            confirmed: stats.confirmed || 0,
            cancelled: stats.cancelled || 0,
        };
    }
    // 检查用户是否已预约某个活动
    async checkUserBooking(userId, activityId) {
        const db = this.databaseService.getDatabase();
        const booking = db
            .prepare('SELECT id FROM bookings WHERE userId = ? AND activityId = ? AND status != ?')
            .get(userId, activityId, 'cancelled');
        return {
            isBooked: !!booking,
            bookingId: booking === null || booking === void 0 ? void 0 : booking.id,
        };
    }
    // 确认参加活动
    async confirmAttendance(userId, bookingId) {
        const db = this.databaseService.getDatabase();
        // 检查预约是否属于该用户
        const booking = db
            .prepare('SELECT * FROM bookings WHERE id = ? AND userId = ?')
            .get(bookingId, userId);
        if (!booking) {
            throw new Error('预约不存在或无权限');
        }
        // 检查活动是否已开始
        const activity = db
            .prepare('SELECT startTime FROM activities WHERE id = ?')
            .get(booking.activityId);
        if (!activity) {
            throw new Error('活动不存在');
        }
        const now = new Date();
        const startTime = new Date(activity.startTime);
        if (startTime > now) {
            throw new Error('活动尚未开始，无法确认参加');
        }
        // 更新预约状态为已确认
        db.prepare('UPDATE bookings SET status = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?').run('confirmed', bookingId);
        // 创建活动历史记录
        try {
            await this.activityHistoryService.addActivityHistory(userId, booking.activityId, bookingId, 'completed');
        }
        catch (error) {
            console.warn('创建活动历史记录失败:', error);
            // 不影响主要流程，只记录警告
        }
    }
};
__decorate([
    (0, core_1.Inject)(),
    __metadata("design:type", database_service_1.DatabaseService)
], BookingService.prototype, "databaseService", void 0);
__decorate([
    (0, core_1.Inject)(),
    __metadata("design:type", activity_service_1.ActivityService)
], BookingService.prototype, "activityService", void 0);
__decorate([
    (0, core_1.Inject)(),
    __metadata("design:type", activity_history_service_1.ActivityHistoryService)
], BookingService.prototype, "activityHistoryService", void 0);
BookingService = __decorate([
    (0, core_1.Provide)(),
    (0, core_1.Scope)(core_1.ScopeEnum.Singleton)
], BookingService);
exports.BookingService = BookingService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm9va2luZy5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3NlcnZpY2UvYm9va2luZy5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLHlDQUFtRTtBQUNuRSx5REFBcUQ7QUFDckQseURBQXFEO0FBQ3JELHlFQUFvRTtBQVM3RCxJQUFNLGNBQWMsR0FBcEIsTUFBTSxjQUFjO0lBVXpCLE9BQU87SUFDUCxLQUFLLENBQUMsYUFBYSxDQUNqQixNQUFjLEVBQ2QsV0FBaUM7UUFFakMsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLGVBQWUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUU5QyxZQUFZO1FBQ1osTUFBTSxVQUFVLEdBQUcsTUFBTSxJQUFJLENBQUMsZUFBZSxDQUFDLGtCQUFrQixDQUM5RCxXQUFXLENBQUMsVUFBVSxDQUN2QixDQUFDO1FBQ0YsSUFBSSxDQUFDLFVBQVUsRUFBRTtZQUNmLE1BQU0sSUFBSSxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUM7U0FDNUI7UUFFRCxpQkFBaUI7UUFDakIsTUFBTSxlQUFlLEdBQUcsRUFBRTthQUN2QixPQUFPLENBQ047OztLQUdILENBQ0U7YUFDQSxHQUFHLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUV2QyxJQUFJLGVBQWUsRUFBRTtZQUNuQixNQUFNLElBQUksS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1NBQzlCO1FBRUQsaUJBQWlCO1FBQ2pCLE1BQU0sUUFBUSxHQUFHLE1BQU0sSUFBSSxDQUFDLGVBQWUsQ0FBQyxlQUFlLENBQ3pELFdBQVcsQ0FBQyxVQUFVLENBQ3ZCLENBQUM7UUFDRixJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ2IsTUFBTSxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUMxQjtRQUVELG9CQUFvQjtRQUNwQixNQUFNLG1CQUFtQixHQUN2QixNQUFNLElBQUksQ0FB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