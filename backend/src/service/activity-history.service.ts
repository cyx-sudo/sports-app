import { Provide, Scope, ScopeEnum, Inject } from '@midwayjs/core';
import { DatabaseService } from './database.service';

export interface ActivityHistory {
  id: number;
  userId: number;
  activityId: number;
  bookingId: number;
  status: 'completed' | 'cancelled' | 'no-show';
  participatedAt: string;
  createdAt: string;
  activity?: any;
  booking?: any;
}

export interface ActivityHistoryListRequest {
  page?: number;
  limit?: number;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

@Provide()
@Scope(ScopeEnum.Singleton)
export class ActivityHistoryService {
  @Inject()
  databaseService: DatabaseService;

  // 添加活动历史记录
  async addActivityHistory(
    userId: number,
    activityId: number,
    bookingId: number,
    status: 'completed' | 'cancelled' | 'no-show'
  ): Promise<ActivityHistory> {
    const db = this.databaseService.getDatabase();

    // 检查是否已经有历史记录
    const existing = db
      .prepare(
        'SELECT id FROM activity_history WHERE userId = ? AND activityId = ? AND bookingId = ?'
      )
      .get(userId, activityId, bookingId) as { id: number } | undefined;

    if (existing) {
      // 更新现有记录
      db.prepare(
        'UPDATE activity_history SET status = ?, participatedAt = CURRENT_TIMESTAMP WHERE id = ?'
      ).run(status, existing.id);

      return this.getActivityHistoryById(existing.id);
    } else {
      // 创建新记录
      const result = db
        .prepare(
          'INSERT INTO activity_history (userId, activityId, bookingId, status, participatedAt) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)'
        )
        .run(userId, activityId, bookingId, status);

      return this.getActivityHistoryById(result.lastInsertRowid as number);
    }
  }

  // 获取用户活动历史列表
  async getUserActivityHistory(
    userId: number,
    params: ActivityHistoryListRequest
  ): Promise<{
    histories: (ActivityHistory & { activity: any; booking: any })[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const db = this.databaseService.getDatabase();

    const page = params.page || 1;
    const limit = params.limit || 10;
    const offset = (page - 1) * limit;

    // 构建查询条件
    let whereClause = 'WHERE h.userId = ?';
    const queryParams: any[] = [userId];

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
    const countResult = db.prepare(countQuery).get(...queryParams) as {
      total: number;
    };

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
      .all(...queryParams, limit, offset) as any[];

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
  async getActivityHistoryById(id: number): Promise<ActivityHistory | null> {
    const db = this.databaseService.getDatabase();

    const history = db
      .prepare('SELECT * FROM activity_history WHERE id = ?')
      .get(id) as ActivityHistory;

    return history || null;
  }

  // 获取用户某个活动的历史记录
  async getUserActivityHistoryByActivity(
    userId: number,
    activityId: number
  ): Promise<ActivityHistory[]> {
    const db = this.databaseService.getDatabase();

    const histories = db
      .prepare(
        'SELECT * FROM activity_history WHERE userId = ? AND activityId = ? ORDER BY participatedAt DESC'
      )
      .all(userId, activityId) as ActivityHistory[];

    return histories;
  }

  // 获取用户活动统计
  async getUserActivityStats(userId: number): Promise<{
    totalActivities: number;
    completedActivities: number;
    cancelledActivities: number;
    noShowActivities: number;
  }> {
    const db = this.databaseService.getDatabase();

    const totalResult = db
      .prepare(
        'SELECT COUNT(*) as count FROM activity_history WHERE userId = ?'
      )
      .get(userId) as { count: number };

    const completedResult = db
      .prepare(
        'SELECT COUNT(*) as count FROM activity_history WHERE userId = ? AND status = ?'
      )
      .get(userId, 'completed') as { count: number };

    const cancelledResult = db
      .prepare(
        'SELECT COUNT(*) as count FROM activity_history WHERE userId = ? AND status = ?'
      )
      .get(userId, 'cancelled') as { count: number };

    const noShowResult = db
      .prepare(
        'SELECT COUNT(*) as count FROM activity_history WHERE userId = ? AND status = ?'
      )
      .get(userId, 'no-show') as { count: number };

    return {
      totalActivities: totalResult.count,
      completedActivities: completedResult.count,
      cancelledActivities: cancelledResult.count,
      noShowActivities: noShowResult.count,
    };
  }

  // 删除活动历史记录
  async deleteActivityHistory(id: number): Promise<boolean> {
    const db = this.databaseService.getDatabase();

    const result = db
      .prepare('DELETE FROM activity_history WHERE id = ?')
      .run(id);

    return result.changes > 0;
  }
}
