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
BookingService = __decorate([
    (0, core_1.Provide)(),
    (0, core_1.Scope)(core_1.ScopeEnum.Singleton)
], BookingService);
exports.BookingService = BookingService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm9va2luZy5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3NlcnZpY2UvYm9va2luZy5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLHlDQUFtRTtBQUNuRSx5REFBcUQ7QUFDckQseURBQXFEO0FBUzlDLElBQU0sY0FBYyxHQUFwQixNQUFNLGNBQWM7SUFPekIsT0FBTztJQUNQLEtBQUssQ0FBQyxhQUFhLENBQ2pCLE1BQWMsRUFDZCxXQUFpQztRQUVqQyxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBRTlDLFlBQVk7UUFDWixNQUFNLFVBQVUsR0FBRyxNQUFNLElBQUksQ0FBQyxlQUFlLENBQUMsa0JBQWtCLENBQzlELFdBQVcsQ0FBQyxVQUFVLENBQ3ZCLENBQUM7UUFDRixJQUFJLENBQUMsVUFBVSxFQUFFO1lBQ2YsTUFBTSxJQUFJLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztTQUM1QjtRQUVELGlCQUFpQjtRQUNqQixNQUFNLGVBQWUsR0FBRyxFQUFFO2FBQ3ZCLE9BQU8sQ0FDTjs7O0tBR0gsQ0FDRTthQUNBLEdBQUcsQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1FBRXZDLElBQUksZUFBZSxFQUFFO1lBQ25CLE1BQU0sSUFBSSxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUM7U0FDOUI7UUFFRCxpQkFBaUI7UUFDakIsTUFBTSxRQUFRLEdBQUcsTUFBTSxJQUFJLENBQUMsZUFBZSxDQUFDLGVBQWUsQ0FDekQsV0FBVyxDQUFDLFVBQVUsQ0FDdkIsQ0FBQztRQUNGLElBQUksQ0FBQyxRQUFRLEVBQUU7WUFDYixNQUFNLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQzFCO1FBRUQsb0JBQW9CO1FBQ3BCLE1BQU0sbUJBQW1CLEdBQ3ZCLE1BQU0sSUFBSSxDQUFDLGVBQWUsQ0FBQyw0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