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
exports.UserController = void 0;
const core_1 = require("@midwayjs/core");
const user_service_1 = require("../service/user.service");
let UserController = class UserController {
    // 用户注册
    async register(userData) {
        try {
            const result = await this.userService.register(userData);
            return {
                success: true,
                message: result.message,
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
    // 用户登录
    async login(loginData) {
        try {
            const result = await this.userService.login(loginData);
            return {
                success: true,
                message: '登录成功',
                data: result,
            };
        }
        catch (error) {
            this.ctx.status = 401;
            return {
                success: false,
                message: error.message,
                data: null,
            };
        }
    }
    // 获取用户信息（需要认证）
    async getUserInfo() {
        try {
            // 手动验证 token
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
            return {
                success: true,
                message: '获取用户信息成功',
                data: user,
            };
        }
        catch (error) {
            this.ctx.status = 401;
            return {
                success: false,
                message: error.message,
                data: null,
            };
        }
    }
    // 用户登出
    async logout() {
        try {
            // 手动验证 token
            const authHeader = this.ctx.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                this.ctx.status = 401;
                return {
                    success: false,
                    message: '未提供有效的认证令牌',
                    data: null,
                };
            }
            return {
                success: true,
                message: '登出成功',
                data: null,
            };
        }
        catch (error) {
            this.ctx.status = 401;
            return {
                success: false,
                message: error.message,
                data: null,
            };
        }
    }
    // 更新用户信息
    async updateProfile(profileData) {
        try {
            // 手动验证 token
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
            // 更新用户信息
            const updatedUser = await this.userService.updateUserProfile(user.id, profileData);
            return {
                success: true,
                message: '更新用户信息成功',
                data: updatedUser,
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
    // 修改密码
    async changePassword(passwordData) {
        try {
            // 手动验证 token
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
            // 修改密码
            await this.userService.changePassword(user.id, passwordData.currentPassword, passwordData.newPassword);
            return {
                success: true,
                message: '密码修改成功',
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
], UserController.prototype, "ctx", void 0);
__decorate([
    (0, core_1.Inject)(),
    __metadata("design:type", user_service_1.UserService)
], UserController.prototype, "userService", void 0);
__decorate([
    (0, core_1.Post)('/register'),
    __param(0, (0, core_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "register", null);
__decorate([
    (0, core_1.Post)('/login'),
    __param(0, (0, core_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "login", null);
__decorate([
    (0, core_1.Get)('/info'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getUserInfo", null);
__decorate([
    (0, core_1.Post)('/logout'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UserController.prototype, "logout", null);
__decorate([
    (0, core_1.Put)('/profile'),
    __param(0, (0, core_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "updateProfile", null);
__decorate([
    (0, core_1.Put)('/password'),
    __param(0, (0, core_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "changePassword", null);
UserController = __decorate([
    (0, core_1.Controller)('/api/user')
], UserController);
exports.UserController = UserController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlci5jb250cm9sbGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbnRyb2xsZXIvdXNlci5jb250cm9sbGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHlDQUEwRTtBQUUxRSwwREFBc0Q7QUFJL0MsSUFBTSxjQUFjLEdBQXBCLE1BQU0sY0FBYztJQU96QixPQUFPO0lBRUQsQUFBTixLQUFLLENBQUMsUUFBUSxDQUFTLFFBQXlCO1FBQzlDLElBQUk7WUFDRixNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3pELE9BQU87Z0JBQ0wsT0FBTyxFQUFFLElBQUk7Z0JBQ2IsT0FBTyxFQUFFLE1BQU0sQ0FBQyxPQUFPO2dCQUN2QixJQUFJLEVBQUUsSUFBSTthQUNYLENBQUM7U0FDSDtRQUFDLE9BQU8sS0FBSyxFQUFFO1lBQ2QsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDO1lBQ3RCLE9BQU87Z0JBQ0wsT0FBTyxFQUFFLEtBQUs7Z0JBQ2QsT0FBTyxFQUFFLEtBQUssQ0FBQyxPQUFPO2dCQUN0QixJQUFJLEVBQUUsSUFBSTthQUNYLENBQUM7U0FDSDtJQUNILENBQUM7SUFFRCxPQUFPO0lBRUQsQUFBTixLQUFLLENBQUMsS0FBSyxDQUFTLFNBQXVCO1FBQ3pDLElBQUk7WUFDRixNQUFNLE1BQU0sR0FBRyxNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ3ZELE9BQU87Z0JBQ0wsT0FBTyxFQUFFLElBQUk7Z0JBQ2IsT0FBTyxFQUFFLE1BQU07Z0JBQ2YsSUFBSSxFQUFFLE1BQU07YUFDYixDQUFDO1NBQ0g7UUFBQyxPQUFPLEtBQUssRUFBRTtZQUNkLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQztZQUN0QixPQUFPO2dCQUNMLE9BQU8sRUFBRSxLQUFLO2dCQUNkLE9BQU8sRUFBRSxLQUFLLENBQUMsT0FBTztnQkFDdEIsSUFBSSxFQUFFLElBQUk7YUFDWCxDQUFDO1NBQ0g7SUFDSCxDQUFDO0lBRUQsZUFBZTtJQUVULEFBQU4sS0FBSyxDQUFDLFdBQVc7UUFDZixJQUFJO1lBQ0YsYUFBYTtZQUNiLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQztZQUNsRCxJQUFJLENBQUMsVUFBVSxJQUFJLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsRUFBRTtnQkFDcEQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDO2dCQUN0QixPQUFPO29CQUNMLE9BQU8sRUFBRSxLQUFLO29CQUNkLE9BQU8sRUFBRSxZQUFZO29CQUNyQixJQUFJLEVBQUUsSUFBSTtpQkFDWCxDQUFDO2FBQ0g7WUFFRCxNQUFNLEtBQUssR0FBRyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3RDLE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUM7WUFFMUQsT0FBTztnQkFDTCxPQUFPLEVBQUUsSUFBSTtnQkFDYixPQUFPLEVBQUUsVUFBVTtnQkFDbkIsSUFBSSxFQUFFLElBQUk7YUFDWCxDQUFDO1NBQ0g7UUFBQyxPQUFPLEtBQUssRUFBRTtZQUNkLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQztZQUN0QixPQUFPO2dCQUNMLE9BQU8sRUFBRSxLQUFLO2dCQUNkLE9BQU8sRUFBRSxLQUFLLENBQUMsT0FBTztnQkFDdEIsSUFBSSxFQUFFLElBQUk7YUFDWCxDQUFDO1NBQ0g7SUFDSCxDQUFDO0lBRUQsT0FBTztJQUVELEFBQU4sS0FBSyxDQUFDLE1BQU07UUFDVixJQUFJO1lBQ0YsYUFBYTtZQUNiLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQztZQUNsRCxJQUFJLENBQUMsVUFBVSxJQUFJLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsRUFBRTtnQkFDcEQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDO2dCQUN0QixPQUFPO29CQUNMLE9BQU8sRUFBRSxLQUFLO29CQUNkLE9BQU8sRUFBRSxZQUFZO29CQUNyQixJQUFJLEVBQUUsSUFBSTtpQkFDWCxDQUFDO2FBQ0g7WUFFRCxPQUFPO2dCQUNMLE9BQU8sRUFBRSxJQUFJO2dCQUNiLE9BQU8sRUFBRSxNQUFNO2dCQUNmLElBQUksRUFBRSxJQUFJO2FBQ1gsQ0FBQztTQUNIO1FBQUMsT0FBTyxLQUFLLEVBQUU7WUFDZCxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUM7WUFDdEIsT0FBTztnQkFDTCxPQUFPLEVBQUUsS0FBSztnQkFDZCxPQUFPLEVBQUUsS0FBSyxDQUFDLE9BQU87Z0JBQ3RCLElBQUksRUFBRSxJQUFJO2FBQ1gsQ0FBQztTQUNIO0lBQ0gsQ0FBQztJQUVELFNBQVM7SUFFSCxBQUFOLEtBQUssQ0FBQyxhQUFhLENBQVMsV0FBZ0I7UUFDMUMsSUFBSTtZQUNGLGFBQWE7WUFDYixNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUM7WUFDbEQsSUFBSSxDQUFDLFVBQVUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLEVBQUU7Z0JBQ3BELElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQztnQkFDdEIsT0FBTztvQkFDTCxPQUFPLEVBQUUsS0FBSztvQkFDZCxPQUFPLEVBQUUsWUFBWTtvQkFDckIsSUFBSSxFQUFFLElBQUk7aUJBQ1gsQ0FBQzthQUNIO1lBRUQsTUFBTSxLQUFLLEdBQUcsVUFBVSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN0QyxNQUFNLElBQUksR0FBRyxNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBRTFELFNBQVM7WUFDVCxNQUFNLFdBQVcsR0FBRyxNQUFNLElBQUksQ0FBQyxXQUFXLENBQUMsaUJBQWlCLENBQzFELElBQUksQ0FBQyxFQUFFLEVBQ1AsV0FBVyxDQUNaLENBQUM7WUFFRixPQUFPO2dCQUNMLE9BQU8sRUFBRSxJQUFJO2dCQUNiLE9BQU8sRUFBRSxVQUFVO2dCQUNuQixJQUFJLEVBQUUsV0FBVzthQUNsQixDQUFDO1NBQ0g7UUFBQyxPQUFPLEtBQUssRUFBRTtZQUNkLElBQUksQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQztZQUN0QixPQUFPO2dCQUNMLE9BQU8sRUFBRSxLQUFLO2dCQUNkLE9BQU8sRUFBRSxLQUFLLENBQUMsT0FBTztnQkFDdEIsSUFBSSxFQUFFLElBQUk7YUFDWCxDQUFDO1NBQ0g7SUFDSCxDQUFDO0lBRUQsT0FBTztJQUVELEFBQU4sS0FBSyxDQUFDLGNBQWMsQ0FDVixZQUE4RDtRQUV0RSxJQUFJO1lBQ0YsYUFBYTtZQUNiLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLGFBQWEsQ0FBQztZQUNsRCxJQUFJLENBQUMsVUFBVSxJQUFJLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsRUFBRTtnQkFDcEQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDO2dCQUN0QixPQUFPO29CQUNMLE9BQU8sRUFBRSxLQUFLO29CQUNkLE9BQU8sRUFBRSxZQUFZO29CQUNyQixJQUFJLEVBQUUsSUFBSTtpQkFDWCxDQUFDO2FBQ0g7WUFFRCxNQUFNLEtBQUssR0FBRyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3RDLE1BQU0sSUFBSSxHQUFHLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUM7WUFFMUQsT0FBTztZQUNQLE1BQU0sSUFBSSxDQUFDLFdBQVcsQ0FBQyxjQUFjLENBQ25DLElBQUksQ0FBQyxFQUFFLEVBQ1AsWUFBWSxDQUFDLGVBQWUsRUFDNUIsWUFBWSxDQUFDLFdBQVcsQ0FDekIsQ0FBQztZQUVGLE9BQU87Z0JBQ0wsT0FBTyxFQUFFLElBQUk7Z0JBQ2IsT0FBTyxFQUFFLFFBQVE7Z0JBQ2pCLElBQUksRUFBRSxJQUFJO2FBQ1gsQ0FBQztTQUNIO1FBQUMsT0FBTyxLQUFLLEVBQUU7WUFDZCxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sR0FBRyxHQUFHLENBQUM7WUFDdEIsT0FBTztnQkFDTCxPQUFPLEVBQUUsS0FBSztnQkFDZCxPQUFPLEVBQUUsS0FBSyxDQUFDLE9BQU87Z0JBQ3RCLElBQUksRUFBRSxJQUFJO2FBQ1gsQ0FBQztTQUNIO0lBQ0gsQ0FBQztDQUNGLENBQUE7QUE3TEM7SUFBQyxJQUFBLGFBQU0sR0FBRTs7MkNBQ0k7QUFFYjtJQUFDLElBQUEsYUFBTSxHQUFFOzhCQUNJLDBCQUFXO21EQUFDO0FBSW5CO0lBREwsSUFBQSxXQUFJLEVBQUMsV0FBVyxDQUFDO0lBQ0YsV0FBQSxJQUFBLFdBQUksR0FBRSxDQUFBOzs7OzhDQWdCckI7QUFJSztJQURMLElBQUEsV0FBSSxFQUFDLFFBQVEsQ0FBQztJQUNGLFdBQUEsSUFBQSxXQUFJLEdBQUUsQ0FBQTs7OzsyQ0FnQmxCO0FBSUs7SUFETCxJQUFBLFVBQUcsRUFBQyxPQUFPLENBQUM7Ozs7aURBOEJaO0FBSUs7SUFETCxJQUFBLFdBQUksRUFBQyxTQUFTLENBQUM7Ozs7NENBMkJmO0FBSUs7SUFETCxJQUFBLFVBQUcsRUFBQyxVQUFVLENBQUM7SUFDSyxXQUFBLElBQUEsV0FBSSxHQUFFLENBQUE7Ozs7bURBbUMxQjtBQUlLO0lBREwsSUFBQSxVQUFHLEVBQUMsV0FBVyxDQUFDO0lBRWQsV0FBQSxJQUFBLFdBQUksR0FBRSxDQUFBOzs7O29EQXFDUjtBQTdMVSxjQUFjO0lBRDFCLElBQUEsaUJBQVUsRUFBQyxXQUFXLENBQUM7R0FDWCxjQUFjLENBOEwxQjtBQTlMWSx3Q0FBYyJ9