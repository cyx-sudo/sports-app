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
exports.BookingController = void 0;
const core_1 = require("@midwayjs/core");
const booking_service_1 = require("../service/booking.service");
const user_service_1 = require("../service/user.service");
let BookingController = class BookingController {
    // 获取用户的预约列表
    async getMyBookings(params) {
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
            const result = await this.bookingService.getUserBookings(user.id, params);
            return {
                success: true,
                message: '获取预约列表成功',
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
    // 取消预约
    async cancelBooking(id) {
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
            const bookingId = parseInt(id);
            if (isNaN(bookingId)) {
                this.ctx.status = 400;
                return {
                    success: false,
                    message: '无效的预约ID',
                    data: null,
                };
            }
            const success = await this.bookingService.cancelBooking(user.id, bookingId);
            if (!success) {
                this.ctx.status = 404;
                return {
                    success: false,
                    message: '预约不存在或已取消',
                    data: null,
                };
            }
            return {
                success: true,
                message: '预约取消成功',
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
    // 确认预约（管理员功能）
    async confirmBooking(id) {
        try {
            const bookingId = parseInt(id);
            if (isNaN(bookingId)) {
                this.ctx.status = 400;
                return {
                    success: false,
                    message: '无效的预约ID',
                    data: null,
                };
            }
            const success = await this.bookingService.confirmBooking(bookingId);
            if (!success) {
                this.ctx.status = 404;
                return {
                    success: false,
                    message: '预约不存在或状态错误',
                    data: null,
                };
            }
            return {
                success: true,
                message: '预约确认成功',
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
    // 获取预约详情
    async getBookingDetail(id) {
        try {
            const bookingId = parseInt(id);
            if (isNaN(bookingId)) {
                this.ctx.status = 400;
                return {
                    success: false,
                    message: '无效的预约ID',
                    data: null,
                };
            }
            const booking = await this.bookingService.getBookingById(bookingId);
            if (!booking) {
                this.ctx.status = 404;
                return {
                    success: false,
                    message: '预约不存在',
                    data: null,
                };
            }
            return {
                success: true,
                message: '获取预约详情成功',
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
    // 获取预约统计（管理员功能）
    async getBookingStats(activityId) {
        try {
            const activityIdNum = activityId ? parseInt(activityId) : undefined;
            const stats = await this.bookingService.getBookingStats(activityIdNum);
            return {
                success: true,
                message: '获取预约统计成功',
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
    // 检查用户是否已预约某个活动
    async checkUserBooking(activityId) {
        try {
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
            const result = await this.bookingService.checkUserBooking(user.id, activityIdNum);
            return {
                success: true,
                message: '检查预约状态成功',
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
    // 确认参加活动
    async confirmAttendance(id) {
        try {
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
            const bookingId = parseInt(id);
            await this.bookingService.confirmAttendance(user.id, bookingId);
            return {
                success: true,
                message: '确认参加成功',
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
};
__decorate([
    (0, core_1.Inject)(),
    __metadata("design:type", Object)
], BookingController.prototype, "ctx", void 0);
__decorate([
    (0, core_1.Inject)(),
    __metadata("design:type", booking_service_1.BookingService)
], BookingController.prototype, "bookingService", void 0);
__decorate([
    (0, core_1.Inject)(),
    __metadata("design:type", user_service_1.UserService)
], BookingController.prototype, "userService", void 0);
__decorate([
    (0, core_1.Get)('/my'),
    __param(0, (0, core_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], BookingController.prototype, "getMyBookings", null);
__decorate([
    (0, core_1.Del)('/:id'),
    __param(0, (0, core_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BookingController.prototype, "cancelBooking", null);
__decorate([
    (0, core_1.Put)('/:id/confirm'),
    __param(0, (0, core_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BookingController.prototype, "confirmBooking", null);
__decorate([
    (0, core_1.Get)('/:id'),
    __param(0, (0, core_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BookingController.prototype, "getBookingDetail", null);
__decorate([
    (0, core_1.Get)('/stats'),
    __param(0, (0, core_1.Query)('activityId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BookingController.prototype, "getBookingStats", null);
__decorate([
    (0, core_1.Get)('/check/:activityId'),
    __param(0, (0, core_1.Param)('activityId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BookingController.prototype, "checkUserBooking", null);
__decorate([
    (0, core_1.Put)('/:id/attend'),
    __param(0, (0, core_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], BookingController.prototype, "confirmAttendance", null);
BookingController = __decorate([
    (0, core_1.Controller)('/api/booking')
], BookingController);
exports.BookingController = BookingController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm9va2luZy5jb250cm9sbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbnRyb2xsZXIvYm9va2luZy5jb250cm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHlDQVF3QjtBQUV4QixnRUFBNEQ7QUFDNUQsMERBQXNEO0FBSS9DLElBQU0saUJBQWlCLEdBQXZCLE1BQU0saUJBQWlCO0lBVTVCLFlBQVk7SUFFTixBQUFOLEtBQUssQ0FBQyxhQUFhLENBQVUsTUFBMEI7UUFDckQsSUFBSTtZQUNGLFNBQVM7WUFDVCxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUM7WUFDbEQsSUFBSSxDQUFDLFVBQVUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLEVBQUU7Z0JBQ3BELElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQztnQkFDdEIsT0FBTztvQkFDTCxPQUFPLEVBQUUsS0FBSztvQkFDZCxPQUFPLEVBQUUsWUFBWTtvQkFDckIsSUFBSSxFQUFFLElBQUk7aUJBQ1gsQ0FBQzthQUNIO1lBRUQsTUFBTSxLQUFLLEdBQUcsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN0QyxNQUFNLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBRTFELE1BQU0sTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLGNBQWMsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxNQUFNLENBQUMsQ0FBQztZQUMxRSxPQUFPO2dCQUNMLE9BQU8sRUFBRSxJQUFJO2dCQUNiLE9BQU8sRUFBRSxVQUFVO2dCQUNuQixJQUFJLEVBQUUsTUFBTTthQUNiLENBQUM7U0FDSDtRQUFDLE9BQU8sS0FBSyxFQUFFO1lBQ2QsSUFBSSxD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