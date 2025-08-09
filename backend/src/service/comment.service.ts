import { Provide, Inject } from '@midwayjs/core';
import { DatabaseService } from './database.service';
import type {
  Comment,
  CreateCommentRequest,
  UpdateCommentRequest,
  CommentQueryParams,
} from '../interface';

@Provide()
export class CommentService {
  @Inject()
  databaseService: DatabaseService;

  /**
   * 创建评论
   */
  async createComment(
    userId: number,
    commentData: CreateCommentRequest
  ): Promise<Comment> {
    const db = this.databaseService.getDatabase();

    // 验证评分范围
    if (commentData.rating < 1 || commentData.rating > 5) {
      throw new Error('评分必须在1-5之间');
    }

    // 检查用户是否已经评论过该活动
    const existingComment = db
      .prepare('SELECT id FROM comments WHERE userId = ? AND activityId = ?')
      .get(userId, commentData.activityId);

    if (existingComment) {
      throw new Error('您已经评论过该活动');
    }

    // 移除预约限制，允许任何用户评论活动

    const stmt = db.prepare(`
      INSERT INTO comments (userId, activityId, content, rating)
      VALUES (?, ?, ?, ?)
    `);

    const result = stmt.run(
      userId,
      commentData.activityId,
      commentData.content,
      commentData.rating
    );

    return this.getCommentById(result.lastInsertRowid as number);
  }

  /**
   * 获取评论详情
   */
  async getCommentById(commentId: number): Promise<Comment | null> {
    const db = this.databaseService.getDatabase();

    const comment = db
      .prepare(
        `
      SELECT 
        c.*,
        u.username,
        u.realName,
        a.name as activityName
      FROM comments c
      LEFT JOIN users u ON c.userId = u.id
      LEFT JOIN activities a ON c.activityId = a.id
      WHERE c.id = ?
    `
      )
      .get(commentId) as any;

    if (!comment) {
      return null;
    }

    return {
      id: comment.id,
      userId: comment.userId,
      activityId: comment.activityId,
      content: comment.content,
      rating: comment.rating,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      user: {
        id: comment.userId,
        username: comment.username,
        realName: comment.realName,
      },
      activity: {
        id: comment.activityId,
        name: comment.activityName,
      },
    };
  }

  /**
   * 获取评论列表
   */
  async getComments(params: CommentQueryParams = {}) {
    const db = this.databaseService.getDatabase();

    const {
      activityId,
      userId,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = params;

    let whereClause = '';
    const whereParams: any[] = [];

    if (activityId) {
      whereClause += ' WHERE c.activityId = ?';
      whereParams.push(activityId);
    }

    if (userId) {
      whereClause += (whereClause ? ' AND' : ' WHERE') + ' c.userId = ?';
      whereParams.push(userId);
    }

    const orderClause = `ORDER BY c.${sortBy} ${sortOrder.toUpperCase()}`;
    const offset = (page - 1) * limit;

    // 获取总数
    const countQuery = `
      SELECT COUNT(*) as total
      FROM comments c
      ${whereClause}
    `;
    const { total } = db.prepare(countQuery).get(...whereParams) as {
      total: number;
    };

    // 获取评论列表
    const query = `
      SELECT 
        c.*,
        u.username,
        u.realName,
        a.name as activityName
      FROM comments c
      LEFT JOIN users u ON c.userId = u.id
      LEFT JOIN activities a ON c.activityId = a.id
      ${whereClause}
      ${orderClause}
      LIMIT ? OFFSET ?
    `;

    const comments = db
      .prepare(query)
      .all(...whereParams, limit, offset) as any[];

    const formattedComments: Comment[] = comments.map(comment => ({
      id: comment.id,
      userId: comment.userId,
      activityId: comment.activityId,
      content: comment.content,
      rating: comment.rating,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      user: {
        id: comment.userId,
        username: comment.username,
        realName: comment.realName,
      },
      activity: {
        id: comment.activityId,
        name: comment.activityName,
      },
    }));

    return {
      items: formattedComments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * 更新评论
   */
  async updateComment(
    commentId: number,
    userId: number,
    updateData: UpdateCommentRequest
  ): Promise<Comment> {
    const db = this.databaseService.getDatabase();

    // 检查评论是否存在且属于当前用户
    const comment = db
      .prepare('SELECT * FROM comments WHERE id = ? AND userId = ?')
      .get(commentId, userId);

    if (!comment) {
      throw new Error('评论不存在或无权修改');
    }

    // 验证评分范围
    if (updateData.rating && (updateData.rating < 1 || updateData.rating > 5)) {
      throw new Error('评分必须在1-5之间');
    }

    const updates: string[] = [];
    const params: any[] = [];

    if (updateData.content !== undefined) {
      updates.push('content = ?');
      params.push(updateData.content);
    }

    if (updateData.rating !== undefined) {
      updates.push('rating = ?');
      params.push(updateData.rating);
    }

    if (updates.length === 0) {
      throw new Error('没有要更新的内容');
    }

    updates.push('updatedAt = CURRENT_TIMESTAMP');
    params.push(commentId);

    const stmt = db.prepare(`
      UPDATE comments 
      SET ${updates.join(', ')}
      WHERE id = ?
    `);

    stmt.run(...params);

    return this.getCommentById(commentId);
  }

  /**
   * 删除评论
   */
  async deleteComment(commentId: number, userId: number): Promise<void> {
    const db = this.databaseService.getDatabase();

    // 检查评论是否存在且属于当前用户
    const comment = db
      .prepare('SELECT * FROM comments WHERE id = ? AND userId = ?')
      .get(commentId, userId);

    if (!comment) {
      throw new Error('评论不存在或无权删除');
    }

    db.prepare('DELETE FROM comments WHERE id = ?').run(commentId);
  }

  /**
   * 获取活动的评分统计
   */
  async getActivityRatingStats(activityId: number) {
    const db = this.databaseService.getDatabase();

    const stats = db
      .prepare(
        `
      SELECT 
        COUNT(*) as totalComments,
        AVG(rating) as averageRating,
        COUNT(CASE WHEN rating = 5 THEN 1 END) as fiveStars,
        COUNT(CASE WHEN rating = 4 THEN 1 END) as fourStars,
        COUNT(CASE WHEN rating = 3 THEN 1 END) as threeStars,
        COUNT(CASE WHEN rating = 2 THEN 1 END) as twoStars,
        COUNT(CASE WHEN rating = 1 THEN 1 END) as oneStars
      FROM comments 
      WHERE activityId = ?
    `
      )
      .get(activityId) as any;

    return {
      totalComments: stats.totalComments || 0,
      averageRating: stats.averageRating
        ? parseFloat(stats.averageRating.toFixed(1))
        : 0,
      ratingDistribution: {
        5: stats.fiveStars || 0,
        4: stats.fourStars || 0,
        3: stats.threeStars || 0,
        2: stats.twoStars || 0,
        1: stats.oneStars || 0,
      },
    };
  }
}
