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
        // 移除预约限制，允许任何用户评论活动
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWVudC5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3NlcnZpY2UvY29tbWVudC5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLHlDQUFpRDtBQUNqRCx5REFBcUQ7QUFTOUMsSUFBTSxjQUFjLEdBQXBCLE1BQU0sY0FBYztJQUl6Qjs7T0FFRztJQUNILEtBQUssQ0FBQyxhQUFhLENBQ2pCLE1BQWMsRUFDZCxXQUFpQztRQUVqQyxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBRTlDLFNBQVM7UUFDVCxJQUFJLFdBQVcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxJQUFJLFdBQVcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQ3BELE1BQU0sSUFBSSxLQUFLLENBQUMsWUFBWSxDQUFDLENBQUM7U0FDL0I7UUFFRCxpQkFBaUI7UUFDakIsTUFBTSxlQUFlLEdBQUcsRUFBRTthQUN2QixPQUFPLENBQUMsNkRBQTZELENBQUM7YUFDdEUsR0FBRyxDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7UUFFdkMsSUFBSSxlQUFlLEVBQUU7WUFDbkIsTUFBTSxJQUFJLEtBQUssQ0FBQyxXQUFXLENBQUMsQ0FBQztTQUM5QjtRQUVELG9CQUFvQjtRQUVwQixNQUFNLElBQUksR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDOzs7S0FHdkIsQ0FBQyxDQUFDO1FBRUgsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FDckIsTUFBTSxFQUNOLFdBQVcsQ0FBQyxVQUFVLEVBQ3RCLFdBQVcsQ0FBQyxPQUFPLEVBQ25CLFdBQVcsQ0FBQyxNQUFNLENBQ25CLENBQUM7UUFFRixPQUFPLElBQUksQ0FBQyxjQUFjLENBQUMsTUFBTSxDQUFDLGVBQXlCLENBQUMsQ0FBQztJQUMvRCxDQUFDO0lBRUQ7O09BRUc7SUFDSCxLQUFL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