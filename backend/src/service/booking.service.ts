import { Provide, Scope, ScopeEnum, Inject } from '@midwayjs/core';
import { DatabaseService } from './database.service';
import { ActivityService } from './activity.service';
import {
  Booking,
  CreateBookingRequest,
  BookingListRequest,
} from '../interface/activity';

@Provide()
@Scope(ScopeEnum.Singleton)
export class BookingService {
  @Inject()
  databaseService: DatabaseService;

  @Inject()
  activityService: ActivityService;

  // 创建预约
  async createBooking(
    userId: number,
    bookingData: CreateBookingRequest
  ): Promise<Booking> {
    const db = this.databaseService.getDatabase();

    // 检查活动是否可预约
    const isBookable = await this.activityService.isActivityBookable(
      bookingData.activityId
    );
    if (!isBookable) {
      throw new Error('该活动不可预约');
    }

    // 检查用户是否已经预约过该活动
    const existingBooking = db
      .prepare(
        `
      SELECT id FROM bookings 
      WHERE userId = ? AND activityId = ? AND status != 'cancelled'
    `
      )
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

      return result.lastInsertRowid as number;
    });

    const bookingId = transaction();
    return this.getBookingById(bookingId);
  }

  // 获取预约详情
  async getBookingById(id: number): Promise<Booking | null> {
    const db = this.databaseService.getDatabase();

    const booking = db
      .prepare('SELECT * FROM bookings WHERE id = ?')
      .get(id) as Booking;
    return booking || null;
  }

  // 获取用户的预约列表
  async getUserBookings(
    userId: number,
    params: BookingListRequest
  ): Promise<{
    bookings: (Booking & { activity: any })[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const db = this.databaseService.getDatabase();

    const page = params.page || 1;
    const limit = params.limit || 10;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE b.userId = ?';
    const queryParams: any[] = [userId];

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
    const countResult = db.prepare(countQuery).get(...queryParams) as {
      total: number;
    };

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
      .all(...queryParams, limit, offset) as any[];

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
  async getActivityBookings(
    activityId: number,
    params: BookingListRequest
  ): Promise<{
    bookings: (Booking & { user: any })[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const db = this.databaseService.getDatabase();

    const page = params.page || 1;
    const limit = params.limit || 10;
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE b.activityId = ?';
    const queryParams: any[] = [activityId];

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
    const countResult = db.prepare(countQuery).get(...queryParams) as {
      total: number;
    };

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
      .all(...queryParams, limit, offset) as any[];

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
  async cancelBooking(userId: number, bookingId: number): Promise<boolean> {
    const db = this.databaseService.getDatabase();

    // 验证预约是否存在且属于当前用户
    const booking = db
      .prepare('SELECT * FROM bookings WHERE id = ? AND userId = ?')
      .get(bookingId, userId) as Booking;

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
  async confirmBooking(bookingId: number): Promise<boolean> {
    const db = this.databaseService.getDatabase();

    const result = db
      .prepare(
        `
      UPDATE bookings 
      SET status = 'confirmed', updatedAt = CURRENT_TIMESTAMP 
      WHERE id = ? AND status = 'pending'
    `
      )
      .run(bookingId);

    return result.changes > 0;
  }

  // 获取预约统计
  async getBookingStats(activityId?: number): Promise<{
    total: number;
    pending: number;
    confirmed: number;
    cancelled: number;
  }> {
    const db = this.databaseService.getDatabase();

    let whereClause = '';
    const queryParams: any[] = [];

    if (activityId) {
      whereClause = 'WHERE activityId = ?';
      queryParams.push(activityId);
    }

    const stats = db
      .prepare(
        `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled
      FROM bookings 
      ${whereClause}
    `
      )
      .get(...queryParams) as any;

    return {
      total: stats.total || 0,
      pending: stats.pending || 0,
      confirmed: stats.confirmed || 0,
      cancelled: stats.cancelled || 0,
    };
  }
}
