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
exports.ActivityHistoryController = void 0;
const core_1 = require("@midwayjs/core");
const activity_history_service_1 = require("../service/activity-history.service");
const user_service_1 = require("../service/user.service");
let ActivityHistoryController = class ActivityHistoryController {
    // 添加活动历史记录
    async addActivityHistory(body) {
        try {
            // 验证用户登录
            const authHeader = this.ctx.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                this.ctx.status = 401;
                return {
                    success: false,
                    message: '未提供有效的认证令牌',
                    data: null,
                };
            }
            const token = authHeader.substring(7);
            const user = await this.userService.getUserByToken(token);
            const { activityId, bookingId, status } = body;
            if (!activityId || !bookingId || !status) {
                this.ctx.status = 400;
                return {
                    success: false,
                    message: '缺少必要参数',
                    data: null,
                };
            }
            const history = await this.activityHistoryService.addActivityHistory(user.id, activityId, bookingId, status);
            return {
                success: true,
                message: '添加活动历史记录成功',
                data: history,
            };
        }
        catch (error) {
            this.ctx.status = 400;
            return {
                success: false,
                message: error.message,
                data: null,
            };
        }
    }
    // 获取用户活动历史列表
    async getMyActivityHistory(params) {
        try {
            // 验证用户登录
            const authHeader = this.ctx.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                this.ctx.status = 401;
                return {
                    success: false,
                    message: '未提供有效的认证令牌',
                    data: null,
                };
            }
            const token = authHeader.substring(7);
            const user = await this.userService.getUserByToken(token);
            const result = await this.activityHistoryService.getUserActivityHistory(user.id, params);
            return {
                success: true,
                message: '获取活动历史列表成功',
                data: result,
            };
        }
        catch (error) {
            this.ctx.status = 400;
            return {
                success: false,
                message: error.message,
                data: null,
            };
        }
    }
    // 获取用户活动统计
    async getMyActivityStats() {
        try {
            // 验证用户登录
            const authHeader = this.ctx.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                this.ctx.status = 401;
                return {
                    success: false,
                    message: '未提供有效的认证令牌',
                    data: null,
                };
            }
            const token = authHeader.substring(7);
            const user = await this.userService.getUserByToken(token);
            const stats = await this.activityHistoryService.getUserActivityStats(user.id);
            return {
                success: true,
                message: '获取活动统计成功',
                data: stats,
            };
        }
        catch (error) {
            this.ctx.status = 400;
            return {
                success: false,
                message: error.message,
                data: null,
            };
        }
    }
    // 获取用户某个活动的历史记录
    async getActivityHistory(activityId) {
        try {
            // 验证用户登录
            const authHeader = this.ctx.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                this.ctx.status = 401;
                return {
                    success: false,
                    message: '未提供有效的认证令牌',
                    data: null,
                };
            }
            const token = authHeader.substring(7);
            const user = await this.userService.getUserByToken(token);
            const activityIdNum = parseInt(activityId);
            if (isNaN(activityIdNum)) {
                this.ctx.status = 400;
                return {
                    success: false,
                    message: '无效的活动ID',
                    data: null,
                };
            }
            const histories = await this.activityHistoryService.getUserActivityHistoryByActivity(user.id, activityIdNum);
            return {
                success: true,
                message: '获取活动历史记录成功',
                data: histories,
            };
        }
        catch (error) {
            this.ctx.status = 400;
            return {
                success: false,
                message: error.message,
                data: null,
            };
        }
    }
    // 删除活动历史记录
    async deleteActivityHistory(id) {
        try {
            // 验证用户登录
            const authHeader = this.ctx.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                this.ctx.status = 401;
                return {
                    success: false,
                    message: '未提供有效的认证令牌',
                    data: null,
                };
            }
            const token = authHeader.substring(7);
            const user = await this.userService.getUserByToken(token);
            const historyId = parseInt(id);
            if (isNaN(historyId)) {
                this.ctx.status = 400;
                return {
                    success: false,
                    message: '无效的历史记录ID',
                    data: null,
                };
            }
            // 验证记录所有权
            const history = await this.activityHistoryService.getActivityHistoryById(historyId);
            if (!history || history.userId !== user.id) {
                this.ctx.status = 403;
                return {
                    success: false,
                    message: '无权限删除此记录',
                    data: null,
                };
            }
            const success = await this.activityHistoryService.deleteActivityHistory(historyId);
            if (success) {
                return {
                    success: true,
                    message: '删除活动历史记录成功',
                    data: null,
                };
            }
            else {
                return {
                    success: false,
                    message: '删除失败',
                    data: null,
                };
            }
        }
        catch (error) {
            this.ctx.status = 400;
            return {
                success: false,
                message: error.message,
                data: null,
            };
        }
    }
};
__decorate([
    (0, core_1.Inject)(),
    __metadata("design:type", Object)
], ActivityHistoryController.prototype, "ctx", void 0);
__decorate([
    (0, core_1.Inject)(),
    __metadata("design:type", activity_history_service_1.ActivityHistoryService)
], ActivityHistoryController.prototype, "activityHistoryService", void 0);
__decorate([
    (0, core_1.Inject)(),
    __metadata("design:type", user_service_1.UserService)
], ActivityHistoryController.prototype, "userService", void 0);
__decorate([
    (0, core_1.Post)('/'),
    __param(0, (0, core_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ActivityHistoryController.prototype, "addActivityHistory", null);
__decorate([
    (0, core_1.Get)('/my'),
    __param(0, (0, core_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ActivityHistoryController.prototype, "getMyActivityHistory", null);
__decorate([
    (0, core_1.Get)('/stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ActivityHistoryController.prototype, "getMyActivityStats", null);
__decorate([
    (0, core_1.Get)('/activity/:activityId'),
    __param(0, (0, core_1.Param)('activityId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ActivityHistoryController.prototype, "getActivityHistory", null);
__decorate([
    (0, core_1.Del)('/:id'),
    __param(0, (0, core_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ActivityHistoryController.prototype, "deleteActivityHistory", null);
ActivityHistoryController = __decorate([
    (0, core_1.Controller)('/api/activity-history')
], ActivityHistoryController);
exports.ActivityHistoryController = ActivityHistoryController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aXZpdHktaGlzdG9yeS5jb250cm9sbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbnRyb2xsZXIvYWN0aXZpdHktaGlzdG9yeS5jb250cm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHlDQVN3QjtBQUV4QixrRkFHNkM7QUFDN0MsMERBQXNEO0FBRy9DLElBQU0seUJBQXlCLEdBQS9CLE1BQU0seUJBQXlCO0lBVXBDLFdBQVc7SUFFTCxBQUFOLEtBQUssQ0FBQyxrQkFBa0IsQ0FFdEIsSUFJQztRQUVELElBQUk7WUFDRixTQUFTO1lBQ1QsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDO1lBQ2xELElBQUksQ0FBQyxVQUFVLElBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxFQUFFO2dCQUNwRCxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUM7Z0JBQ3RCLE9BQU87b0JBQ0wsT0FBTyxFQUFFLEtBQUs7b0JBQ2QsT0FBTyxFQUFFLFlBQVk7b0JBQ3JCLElBQUksRUFBRSxJQUFJO2lCQUNYLENBQUM7YUFDSDtZQUVELE1BQU0sS0FBSyxHQUFHLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdEMsTUFBTSxJQUFJLEdBQUcsTUFBTSxJQUFJLENBQUMsV0FBVyxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUUxRCxNQUFNLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUM7WUFFL0MsSUFBSSxDQUFDLFVBQVUsSUFBSSxDQUFDLFNBQVMsSUFBSSxDQUFDLE1BQU0sRUFBRTtnQkFDeEMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDO2dCQUN0QixPQUFPO29CQUNMLE9BQU8sRUFBRSxL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