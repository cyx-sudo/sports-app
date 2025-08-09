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
exports.ActivityController = void 0;
const core_1 = require("@midwayjs/core");
const activity_service_1 = require("../service/activity.service");
const booking_service_1 = require("../service/booking.service");
const user_service_1 = require("../service/user.service");
let ActivityController = class ActivityController {
    // 创建活动（管理员功能）
    async createActivity(activityData) {
        try {
            const activity = await this.activityService.createActivity(activityData);
            return {
                success: true,
                message: '活动创建成功',
                data: activity,
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
    // 获取活动列表
    async getActivityList(params) {
        try {
            const result = await this.activityService.getActivityList(params);
            return {
                success: true,
                message: '获取活动列表成功',
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
    // 获取活动详情
    async getActivityDetail(id) {
        try {
            const activityId = parseInt(id);
            if (isNaN(activityId)) {
                this.ctx.status = 400;
                return {
                    success: false,
                    message: '无效的活动ID',
                    data: null,
                };
            }
            const activity = await this.activityService.getActivityById(activityId);
            if (!activity) {
                this.ctx.status = 404;
                return {
                    success: false,
                    message: '活动不存在',
                    data: null,
                };
            }
            // 获取预约统计
            const bookingStats = await this.bookingService.getBookingStats(activityId);
            return {
                success: true,
                message: '获取活动详情成功',
                data: {
                    activity,
                    bookingStats,
                },
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
    // 更新活动（管理员功能）
    async updateActivity(id, updateData) {
        try {
            const activityId = parseInt(id);
            if (isNaN(activityId)) {
                this.ctx.status = 400;
                return {
                    success: false,
                    message: '无效的活动ID',
                    data: null,
                };
            }
            const activity = await this.activityService.updateActivity(activityId, updateData);
            if (!activity) {
                this.ctx.status = 404;
                return {
                    success: false,
                    message: '活动不存在',
                    data: null,
                };
            }
            return {
                success: true,
                message: '活动更新成功',
                data: activity,
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
    // 删除活动（管理员功能）
    async deleteActivity(id) {
        try {
            const activityId = parseInt(id);
            if (isNaN(activityId)) {
                this.ctx.status = 400;
                return {
                    success: false,
                    message: '无效的活动ID',
                    data: null,
                };
            }
            const success = await this.activityService.deleteActivity(activityId);
            if (!success) {
                this.ctx.status = 404;
                return {
                    success: false,
                    message: '活动不存在',
                    data: null,
                };
            }
            return {
                success: true,
                message: '活动删除成功',
                data: null,
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
    // 获取活动分类
    async getActivityCategories() {
        try {
            const categories = await this.activityService.getActivityCategories();
            return {
                success: true,
                message: '获取活动分类成功',
                data: categories,
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
    // 预约活动
    async bookActivity(id, bookingData) {
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
            const activityId = parseInt(id);
            if (isNaN(activityId)) {
                this.ctx.status = 400;
                return {
                    success: false,
                    message: '无效的活动ID',
                    data: null,
                };
            }
            // 设置活动ID
            bookingData.activityId = activityId;
            const booking = await this.bookingService.createBooking(user.id, bookingData);
            return {
                success: true,
                message: '预约成功',
                data: booking,
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
    // 获取活动的预约列表（管理员功能）
    async getActivityBookings(id, params) {
        try {
            const activityId = parseInt(id);
            if (isNaN(activityId)) {
                this.ctx.status = 400;
                return {
                    success: false,
                    message: '无效的活动ID',
                    data: null,
                };
            }
            const result = await this.bookingService.getActivityBookings(activityId, params);
            return {
                success: true,
                message: '获取活动预约列表成功',
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
    // 获取活动统计信息（包括实时参与人数）
    async getActivityStats(id) {
        try {
            const activityId = parseInt(id);
            if (isNaN(activityId)) {
                this.ctx.status = 400;
                return {
                    success: false,
                    message: '无效的活动ID',
                    data: null,
                };
            }
            const activity = await this.activityService.getActivityById(activityId);
            if (!activity) {
                this.ctx.status = 404;
                return {
                    success: false,
                    message: '活动不存在',
                    data: null,
                };
            }
            const bookingStats = await this.bookingService.getBookingStats(activityId);
            const currentParticipants = await this.activityService.calculateCurrentParticipants(activityId);
            return {
                success: true,
                message: '获取活动统计成功',
                data: {
                    activity: {
                        id: activity.id,
                        name: activity.name,
                        capacity: activity.capacity,
                        currentParticipants,
                        availableSpots: activity.capacity - currentParticipants,
                        status: activity.status,
                    },
                    bookingStats,
                },
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
};
__decorate([
    (0, core_1.Inject)(),
    __metadata("design:type", Object)
], ActivityController.prototype, "ctx", void 0);
__decorate([
    (0, core_1.Inject)(),
    __metadata("design:type", activity_service_1.ActivityService)
], ActivityController.prototype, "activityService", void 0);
__decorate([
    (0, core_1.Inject)(),
    __metadata("design:type", booking_service_1.BookingService)
], ActivityController.prototype, "bookingService", void 0);
__decorate([
    (0, core_1.Inject)(),
    __metadata("design:type", user_service_1.UserService)
], ActivityController.prototype, "userService", void 0);
__decorate([
    (0, core_1.Post)('/'),
    __param(0, (0, core_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ActivityController.prototype, "createActivity", null);
__decorate([
    (0, core_1.Get)('/list'),
    __param(0, (0, core_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ActivityController.prototype, "getActivityList", null);
__decorate([
    (0, core_1.Get)('/:id'),
    __param(0, (0, core_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ActivityController.prototype, "getActivityDetail", null);
__decorate([
    (0, core_1.Put)('/:id'),
    __param(0, (0, core_1.Param)('id')),
    __param(1, (0, core_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ActivityController.prototype, "updateActivity", null);
__decorate([
    (0, core_1.Del)('/:id'),
    __param(0, (0, core_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ActivityController.prototype, "deleteActivity", null);
__decorate([
    (0, core_1.Get)('/categories'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ActivityController.prototype, "getActivityCategories", null);
__decorate([
    (0, core_1.Post)('/:id/book'),
    __param(0, (0, core_1.Param)('id')),
    __param(1, (0, core_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ActivityController.prototype, "bookActivity", null);
__decorate([
    (0, core_1.Get)('/:id/bookings'),
    __param(0, (0, core_1.Param)('id')),
    __param(1, (0, core_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ActivityController.prototype, "getActivityBookings", null);
__decorate([
    (0, core_1.Get)('/:id/stats'),
    __param(0, (0, core_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ActivityController.prototype, "getActivityStats", null);
ActivityController = __decorate([
    (0, core_1.Controller)('/api/activity')
], ActivityController);
exports.ActivityController = ActivityController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWN0aXZpdHkuY29udHJvbGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb250cm9sbGVyL2FjdGl2aXR5LmNvbnRyb2xsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQUEseUNBVXdCO0FBRXhCLGtFQUE4RDtBQUM5RCxnRUFBNEQ7QUFDNUQsMERBQXNEO0FBVS9DLElBQU0sa0JBQWtCLEdBQXhCLE1BQU0sa0JBQWtCO0lBYTdCLGNBQWM7SUFFUixBQUFOLEtBQUssQ0FBQyxjQUFjLENBQVMsWUFBbUM7UUFDOUQsSUFBSTtZQUNGLE1BQU0sUUFBUSxHQUFHLE1BQU0sSUFBSSxDQUFDLGVBQWUsQ0FBQyxjQUFjLENBQUMsWUFBWSxDQUFDLENBQUM7WUFDekUsT0FBTztnQkFDTCxPQUFPLEVBQUUsSUFBSTtnQkFDYixPQUFPLEVBQUUsUUFBUTtnQkFDakIsSUFBSSxFQUFFLFFBQVE7YUFDZixDQUFDO1NBQ0g7UUFBQyxPQUFPLEtBQUssRUFBRTtZQUNkLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQztZQUN0QixPQUFPO2dCQUNMLE9BQU8sRUFBRSxLQUFLO2dCQUNkLE9BQU8sRUFBRSxLQUFLLENBQUMsT0FBTztnQkFDdEIsSUFBSSxFQUFFLElBQUk7YUFDWCxDQUFDO1NBQ0g7SUFDSCxDQUFDO0lBRUQsU0FBUztJQUVILEFBQU4sS0FBSyxDQUFDLGVBQWUsQ0FBVSxNQUEyQjtRQUN4RCxJQUFJO1lBQ0YsTUFBTSxNQUFNLEdBQUcsTUFBTSxJQUFJLENBQUMsZUFBZSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUNsRSxPQUFPO2dCQUNMLE9BQU8sRUFBRSxJQUFJO2dCQUNiLE9BQU8sRUFBRSxVQUFVO2dCQUNuQixJQUFJLEVBQUUsTUFBTTthQUNiLENBQUM7U0FDSDtRQUFDLE9BQU8sS0FBSyxFQUFFO1lBQ2QsSUFBSSxDQUFDLEdBQUcsQ0FBQyxN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