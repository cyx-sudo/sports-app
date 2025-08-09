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
exports.FavoriteController = void 0;
const core_1 = require("@midwayjs/core");
const favorite_service_1 = require("../service/favorite.service");
const user_service_1 = require("../service/user.service");
let FavoriteController = class FavoriteController {
    // 添加收藏
    async addFavorite(activityId) {
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
            const favorite = await this.favoriteService.addFavorite(user.id, activityIdNum);
            return {
                success: true,
                message: '收藏成功',
                data: favorite,
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
    // 取消收藏
    async removeFavorite(activityId) {
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
            const success = await this.favoriteService.removeFavorite(user.id, activityIdNum);
            if (success) {
                return {
                    success: true,
                    message: '取消收藏成功',
                    data: null,
                };
            }
            else {
                return {
                    success: false,
                    message: '未找到收藏记录',
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
    // 获取用户收藏列表
    async getMyFavorites(params) {
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
            const result = await this.favoriteService.getUserFavorites(user.id, params);
            return {
                success: true,
                message: '获取收藏列表成功',
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
    // 检查活动是否已收藏
    async checkFavorite(activityId) {
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
            const isFavorited = await this.favoriteService.isFavorited(user.id, activityIdNum);
            return {
                success: true,
                message: '检查收藏状态成功',
                data: { isFavorited },
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
], FavoriteController.prototype, "ctx", void 0);
__decorate([
    (0, core_1.Inject)(),
    __metadata("design:type", favorite_service_1.FavoriteService)
], FavoriteController.prototype, "favoriteService", void 0);
__decorate([
    (0, core_1.Inject)(),
    __metadata("design:type", user_service_1.UserService)
], FavoriteController.prototype, "userService", void 0);
__decorate([
    (0, core_1.Post)('/:activityId'),
    __param(0, (0, core_1.Param)('activityId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FavoriteController.prototype, "addFavorite", null);
__decorate([
    (0, core_1.Del)('/:activityId'),
    __param(0, (0, core_1.Param)('activityId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FavoriteController.prototype, "removeFavorite", null);
__decorate([
    (0, core_1.Get)('/my'),
    __param(0, (0, core_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FavoriteController.prototype, "getMyFavorites", null);
__decorate([
    (0, core_1.Get)('/check/:activityId'),
    __param(0, (0, core_1.Param)('activityId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FavoriteController.prototype, "checkFavorite", null);
FavoriteController = __decorate([
    (0, core_1.Controller)('/api/favorite')
], FavoriteController);
exports.FavoriteController = FavoriteController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmF2b3JpdGUuY29udHJvbGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb250cm9sbGVyL2Zhdm9yaXRlLmNvbnRyb2xsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQUEseUNBUXdCO0FBRXhCLGtFQUdxQztBQUNyQywwREFBc0Q7QUFHL0MsSUFBTSxrQkFBa0IsR0FBeEIsTUFBTSxrQkFBa0I7SUFVN0IsT0FBTztJQUVELEFBQU4sS0FBSyxDQUFDLFdBQVcsQ0FBc0IsVUFBa0I7UUFDdkQsSUFBSTtZQUNGLFNBQVM7WUFDVCxNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUM7WUFDbEQsSUFBSSxDQUFDLFVBQVUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLEVBQUU7Z0JBQ3BELElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQztnQkFDdEIsT0FBTztvQkFDTCxPQUFPLEVBQUUsS0FBSztvQkFDZCxPQUFPLEVBQUUsWUFBWTtvQkFDckIsSUFBSSxFQUFFLElBQUk7aUJBQ1gsQ0FBQzthQUNIO1lBRUQsTUFBTSxLQUFLLEdBQUcsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN0QyxNQUFNLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBRTFELE1BQU0sYUFBYSxHQUFHLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUMzQyxJQUFJLEtBQUssQ0FBQyxhQUFhLENBQUMsRUFBRTtnQkFDeEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDO2dCQUN0QixPQUFPO29CQUNMLE9BQU8sRUFBRSxLQUFLO29CQUNkLE9BQU8sRUFBRSxTQUFTO29CQUNsQixJQUFJLEVBQUUsSUFBSTtpQkFD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