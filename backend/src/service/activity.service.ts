import { Provide, Scope, ScopeEnum, Inject } from '@midwayjs/core';
import { DatabaseService } from './database.service';
import {
  Activity,
  CreateActivityRequest,
  UpdateActivityRequest,
  ActivityListRequest,
  ActivityListResponse,
} from '../interface/activity';

@Provide()
@Scope(ScopeEnum.Singleton)
export class ActivityService {
  @Inject()
  databaseService: DatabaseService;

  // 创建活动
  async createActivity(activityData: CreateActivityRequest): Promise<Activity> {
    const db = this.databaseService.getDatabase();

    const insertActivity = db.prepare(`
      INSERT INTO activities (name, description, location, capacity, startTime, endTime, price, instructor, category)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insertActivity.run(
      activityData.name,
      activityData.description,
      activityData.location,
      activityData.capacity,
      activityData.startTime,
      activityData.endTime,
      activityData.price,
      activityData.instructor,
      activityData.category
    );

    return this.getActivityById(result.lastInsertRowid as number);
  }

  // 获取活动列表
  async getActivityList(
    params: ActivityListRequest
  ): Promise<ActivityListResponse> {
    const db = this.databaseService.getDatabase();

    const page = params.page || 1;
    const limit = params.limit || 10;
    const offset = (page - 1) * limit;

    // 构建查询条件
    let whereClause = 'WHERE 1=1';
    const queryParams: any[] = [];

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
    const countResult = db.prepare(countQuery).get(...queryParams) as {
      total: number;
    };

    // 获取活动列表
    const listQuery = `
      SELECT * FROM activities 
      ${whereClause} 
      ORDER BY startTime ASC 
      LIMIT ? OFFSET ?
    `;
    const activities = db
      .prepare(listQuery)
      .all(...queryParams, limit, offset) as Activity[];

    // 为每个活动动态计算当前参与人数
    for (const activity of activities) {
      activity.currentParticipants = await this.calculateCurrentParticipants(
        activity.id
      );
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
  async calculateCurrentParticipants(activityId: number): Promise<number> {
    const db = this.databaseService.getDatabase();

    const result = db
      .prepare(
        `
        SELECT COUNT(*) as count 
        FROM bookings 
        WHERE activityId = ? AND status IN ('pending', 'confirmed')
      `
      )
      .get(activityId) as { count: number };

    return result.count || 0;
  }

  // 根据ID获取活动详情
  async getActivityById(id: number): Promise<Activity | null> {
    const db = this.databaseService.getDatabase();

    const activity = db
      .prepare('SELECT * FROM activities WHERE id = ?')
      .get(id) as Activity;

    if (activity) {
      // 根据实际预约记录计算当前参与人数
      activity.currentParticipants = await this.calculateCurrentParticipants(
        id
      );
    }

    return activity || null;
  }

  // 更新活动
  async updateActivity(
    id: number,
    updateData: UpdateActivityRequest
  ): Promise<Activity | null> {
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

    const updateQuery = `UPDATE activities SET ${fields.join(
      ', '
    )} WHERE id = ?`;
    const result = db.prepare(updateQuery).run(...values);

    if (result.changes === 0) {
      return null;
    }

    return this.getActivityById(id);
  }

  // 删除活动
  async deleteActivity(id: number): Promise<boolean> {
    const db = this.databaseService.getDatabase();

    // 检查是否有相关的预约记录
    const bookingCount = db
      .prepare(
        'SELECT COUNT(*) as count FROM bookings WHERE activityId = ? AND status != ?'
      )
      .get(id, 'cancelled') as { count: number };

    if (bookingCount.count > 0) {
      throw new Error(
        `无法删除活动，该活动还有 ${bookingCount.count} 个有效预约记录。请先处理相关预约。`
      );
    }

    // 如果没有有效预约记录，则可以安全删除
    const transaction = db.transaction(() => {
      // 先删除已取消的预约记录（如果有的话）
      db.prepare(
        'DELETE FROM bookings WHERE activityId = ? AND status = ?'
      ).run(id, 'cancelled');

      // 然后删除活动
      const result = db.prepare('DELETE FROM activities WHERE id = ?').run(id);
      return result.changes > 0;
    });

    return transaction();
  }

  // 获取活动分类列表
  async getActivityCategories(): Promise<string[]> {
    const db = this.databaseService.getDatabase();

    const categories = db
      .prepare('SELECT DISTINCT category FROM activities ORDER BY category')
      .all() as { category: string }[];
    return categories.map(c => c.category);
  }

  // 检查活动是否可以预约
  async isActivityBookable(activityId: number): Promise<boolean> {
    const activity = await this.getActivityById(activityId);
    if (!activity) {
      return false;
    }

    // 获取当前实际参与人数
    const currentParticipants = await this.calculateCurrentParticipants(
      activityId
    );

    return (
      activity.status === 'active' &&
      currentParticipants < activity.capacity &&
      new Date(activity.startTime) > new Date()
    );
  }
}
