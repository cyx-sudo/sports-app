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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentController = void 0;
const core_1 = require("@midwayjs/core");
const comment_service_1 = require("../service/comment.service");
let CommentController = class CommentController {
    /**
     * 创建评论
     */
    async createComment(commentData) {
        var _a;
        try {
            // 通过认证中间件获取用户ID
            const userId = (_a = this.ctx.state.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                return {
                    success: false,
                    message: '请先登录',
                };
            }
            const comment = await this.commentService.createComment(userId, commentData);
            return {
                success: true,
                data: comment,
                message: '评论创建成功',
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || '创建评论失败',
            };
        }
    }
    /**
     * 获取评论列表
     */
    async getComments(queryParams) {
        try {
            const result = await this.commentService.getComments(queryParams);
            return {
                success: true,
                data: result,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || '获取评论列表失败',
            };
        }
    }
    /**
     * 获取活动评论
     */
    async getActivityComments(activityId, queryParams) {
        try {
            const result = await this.commentService.getComments({
                ...queryParams,
                activityId,
            });
            return {
                success: true,
                data: result,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || '获取活动评论失败',
            };
        }
    }
    /**
     * 获取用户评论
     */
    async getMyComments(queryParams) {
        var _a;
        try {
            const userId = (_a = this.ctx.state.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                return {
                    success: false,
                    message: '请先登录',
                };
            }
            const result = await this.commentService.getComments({
                ...queryParams,
                userId,
            });
            return {
                success: true,
                data: result,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || '获取我的评论失败',
            };
        }
    }
    /**
     * 获取评论详情
     */
    async getComment(commentId) {
        try {
            const comment = await this.commentService.getCommentById(commentId);
            if (!comment) {
                return {
                    success: false,
                    message: '评论不存在',
                };
            }
            return {
                success: true,
                data: comment,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || '获取评论详情失败',
            };
        }
    }
    /**
     * 更新评论
     */
    async updateComment(commentId, updateData) {
        var _a;
        try {
            const userId = (_a = this.ctx.state.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                return {
                    success: false,
                    message: '请先登录',
                };
            }
            const comment = await this.commentService.updateComment(commentId, userId, updateData);
            return {
                success: true,
                data: comment,
                message: '评论更新成功',
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || '更新评论失败',
            };
        }
    }
    /**
     * 删除评论
     */
    async deleteComment(commentId) {
        var _a;
        try {
            const userId = (_a = this.ctx.state.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                return {
                    success: false,
                    message: '请先登录',
                };
            }
            await this.commentService.deleteComment(commentId, userId);
            return {
                success: true,
                message: '评论删除成功',
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || '删除评论失败',
            };
        }
    }
    /**
     * 获取活动评分统计
     */
    async getActivityRatingStats(activityId) {
        try {
            const stats = await this.commentService.getActivityRatingStats(activityId);
            return {
                success: true,
                data: stats,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || '获取评分统计失败',
            };
        }
    }
};
__decorate([
    (0, core_1.Inject)(),
    __metadata("design:type", Object)
], CommentController.prototype, "ctx", void 0);
__decorate([
    (0, core_1.Inject)(),
    __metadata("design:type", comment_service_1.CommentService)
], CommentController.prototype, "commentService", void 0);
__decorate([
    (0, core_1.Post)('/'),
    __param(0, (0, core_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CommentController.prototype, "createComment", null);
__decorate([
    (0, core_1.Get)('/list'),
    __param(0, (0, core_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CommentController.prototype, "getComments", null);
__decorate([
    (0, core_1.Get)('/activity/:activityId'),
    __param(0, (0, core_1.Param)('activityId')),
    __param(1, (0, core_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], CommentController.prototype, "getActivityComments", null);
__decorate([
    (0, core_1.Get)('/my'),
    __param(0, (0, core_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CommentController.prototype, "getMyComments", null);
__decorate([
    (0, core_1.Get)('/:id'),
    __param(0, (0, core_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CommentController.prototype, "getComment", null);
__decorate([
    (0, core_1.Put)('/:id'),
    __param(0, (0, core_1.Param)('id')),
    __param(1, (0, core_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], CommentController.prototype, "updateComment", null);
__decorate([
    (0, core_1.Del)('/:id'),
    __param(0, (0, core_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CommentController.prototype, "deleteComment", null);
__decorate([
    (0, core_1.Get)('/stats/:activityId'),
    __param(0, (0, core_1.Param)('activityId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], CommentController.prototype, "getActivityRatingStats", null);
CommentController = __decorate([
    (0, core_1.Controller)('/api/comment')
], CommentController);
exports.CommentController = CommentController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbWVudC5jb250cm9sbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbnRyb2xsZXIvY29tbWVudC5jb250cm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHlDQVV3QjtBQUV4QixnRUFBNEQ7QUFRckQsSUFBTSxpQkFBaUIsR0FBdkIsTUFBTSxpQkFBaUI7SUFPNUI7O09BRUc7SUFFRyxBQUFOLEtBQUssQ0FBQyxhQUFhLENBQVMsV0FBaUM7O1FBQzNELElBQUk7WUFDRixnQkFBZ0I7WUFDaEIsTUFBTSxNQUFNLEdBQUcsTUFBQSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLDBDQUFFLEVBQUUsQ0FBQztZQUN2QyxJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUNYLE9BQU87b0JBQ0wsT0FBTyxFQUFFLEtBQUs7b0JBQ2QsT0FBTyxFQUFFLE1BQU07aUJBQ2hCLENBQUM7YUFDSDtZQUVELE1BQU0sT0FBTyxHQUFHLE1BQU0sSUFBSSxDQUFDLGNBQWMsQ0FBQyxhQUFhLENBQ3JELE1BQU0sRUFDTixXQUFXLENBQ1osQ0FBQztZQUVGLE9BQU87Z0JBQ0wsT0FBTyxFQUFFLElBQUk7Z0JBQ2IsSUFBSSxFQUFFLE9BQU87Z0JBQ2IsT0FBTyxFQUFFLFFBQVE7YUFDbEIsQ0FBQztTQUNIO1FBQUMsT0FBTyxLQUFLLEVBQUU7WUFDZCxPQUFPO2dCQUNMLE9BQU8sRUFBRSxLQUFLO2dCQUNkLE9BQU8sRUFBRSxLQUFLLENBQUMsT0FBTyxJQUFJLFFBQVE7YUFDbkMsQ0FBQztTQUNIO0lBQ0gsQ0FBQztJQUVEOztPQUVHO0lBRUcsQUFBTixLQUFLLENBQUMsV0FBVyxDQUFVLFdBQStCO1FBQ3hELElBQUk7WUFDRixNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxjQUFjLENBQUMsV0FBVyxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBRWxFLE9BQU87Z0JBQ0wsT0FBTyxF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