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
exports.CommentService = void 0;
const core_1 = require("@midwayjs/core");
const database_service_1 = require("./database.service");
let CommentService = class CommentService {
    /**
     * 创建评论
     */
    async createComment(userId, commentData) {
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
        // 检查用户是否预约过该活动
        const booking = db
            .prepare('SELECT id FROM bookings WHERE userId = ? AND activityId = ? AND status = ?')
            .get(userId, commentData.activityId, 'confirmed');
        if (!booking) {
            throw new Error('只能评论已参与的活动');
        }
        const stmt = db.prepare(`
      INSERT INTO comments (userId, activityId, content, rating)
      VALUES (?, ?, ?, ?)
    `);
        const result = stmt.run(userId, commentData.activityId, commentData.content, commentData.rating);
        return this.getCommentById(result.lastInsertRowid);
    }
    /**
     * 获取评论详情
     */
    async getCommentById(commentId) {
        const db = this.databaseService.getDatabase();
        const comment = db
            .prepare(`
      SELECT 
        c.*,
        u.username,
        u.realName,
        a.name as activityName
      FROM comments c
      LEFT JOIN users u ON c.userId = u.id
      LEFT JOIN activities a ON c.activityId = a.id
      WHERE c.id = ?
    `)
            .get(commentId);
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
    async getComments(params = {}) {
        const db = this.databaseService.getDatabase();
        const { activityId, userId, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', } = params;
        let whereClause = '';
        const whereParams = [];
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
        const { total } = db.prepare(countQuery).get(...whereParams);
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
            .all(...whereParams, limit, offset);
        const formattedComments = comments.map(comment => ({
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
    async updateComment(commentId, userId, updateData) {
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
        const updates = [];
        const params = [];
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
    async deleteComment(commentId, userId) {
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
    async getActivityRatingStats(activityId) {
        const db = this.databaseService.getDatabase();
        const stats = db
            .prepare(`
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
    `)
            .get(activityId);
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
};
__decorate([
    (0, core_1.Inject)(),
    __metadata("design:type", database_service_1.DatabaseService)
], CommentService.prototype, "databaseService", void 0);
CommentService = __decorate([
    (0, core_1.Provide)()
], CommentService);
exports.CommentService = CommentService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWVudC5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3NlcnZpY2UvY29tbWVudC5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLHlDQUFpRDtBQUNqRCx5REFBcUQ7QUFTOUMsSUFBTSxjQUFjLEdBQXBCLE1BQU0sY0FBYztJQUl6Qjs7T0FFRztJQUNILEtBQUssQ0FBQyxhQUFhLENBQ2pCLE1BQWMsRUFDZCxXQUFpQztRQUVqQyxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBRTlDLFNBQVM7UUFDVCxJQUFJLFdBQVcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLFdBQVcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQ3BELE1BQU0sSUFBSSxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUM7U0FDL0I7UUFFRCxpQkFBaUI7UUFDakIsTUFBTSxlQUFlLEdBQUcsRUFBRTthQUN2QixPQUFPLENBQUMsNkRBQTZELENBQUM7YUFDdEUsR0FBRyxDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7UUFFdkMsSUFBSSxlQUFlLEVBQUU7WUFDbkIsTUFBTSxJQUFJLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQztTQUM5QjtRQUVELGVBQWU7UUFDZixNQUFNLE9BQU8sR0FBRyxFQUFFO2FBQ2YsT0FBTyxDQUNOLDRFQUE0RSxDQUM3RTthQUNBLEdBQUcsQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDLFVBQVUsRUFBRSxXQUFXLENBQUMsQ0FBQztRQUVwRCxJQUFJLENBQUMsT0FBTyxFQUFFO1lBQ1osTUFBTSxJQUFJLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQztTQUMvQjtRQUVELE1BQU0sSUFBSSxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUM7OztLQUd2QixDQUFDLENBQUM7UUFFSCxNQUFNLE1BQU0sR0FBRyxJQUFJ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