"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthMiddleware = void 0;
const core_1 = require("@midwayjs/core");
const jwt = require("jsonwebtoken");
let AuthMiddleware = class AuthMiddleware {
    constructor() {
        this.jwtSecret = 'your-secret-key-change-in-production';
    }
    resolve() {
        return async (ctx, next) => {
            // 获取 Authorization header
            const authHeader = ctx.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                ctx.status = 401;
                ctx.body = { success: false, message: '未提供有效的认证令牌' };
                return;
            }
            const token = authHeader.substring(7); // 移除 "Bearer " 前缀
            try {
                // 验证 JWT token
                const decoded = jwt.verify(token, this.jwtSecret);
                // 将用户信息添加到 ctx.state
                ctx.state.user = {
                    userId: decoded.userId,
                    username: decoded.username,
                };
                await next();
            }
            catch (error) {
                ctx.status = 401;
                ctx.body = { success: false, message: '无效的认证令牌' };
            }
        };
    }
};
AuthMiddleware = __decorate([
    (0, core_1.Middleware)()
], AuthMiddleware);
exports.AuthMiddleware = AuthMiddleware;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXV0aC5taWRkbGV3YXJlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL21pZGRsZXdhcmUvYXV0aC5taWRkbGV3YXJlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBLHlDQUE0QztBQUU1QyxvQ0FBb0M7QUFHN0IsSUFBTSxjQUFjLEdBQXBCLE1BQU0sY0FBYztJQUFwQjtRQUNHLGNBQVMsR0FBRyxzQ0FBc0MsQ0FBQztJQWdDN0QsQ0FBQztJQTlCQyxPQUFPO1FBQ0wsT0FBTyxLQUFLLEVBQUUsR0FBWSxFQUFFLElBQWtCLEVBQUUsRUFBRTtZQUNoRCwwQkFBMEI7WUFDMUIsTUFBTSxVQUFVLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxhQUFhLENBQUM7WUFFN0MsSUFBSSxDQUFDLFVBQVUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLEVBQUU7Z0JBQ3BELEdBQUcsQ0FBQyxNQUFNLEdBQUcsR0FBRyxDQUFDO2dCQUNqQixHQUFHLENBQUMsSUFBSSxHQUFHLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsWUFBWSxFQUFFLENBQUM7Z0JBQ3JELE9BQU87YUFDUjtZQUVELE1BQU0sS0FBSyxHQUFHLFVBQVUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxrQkFBa0I7WUFFekQsSUFBSTtnQkFDRixlQUFlO2dCQUNmLE1BQU0sT0FBTyxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQVEsQ0FBQztnQkFFekQscUJBQXFCO2dCQUNyQixHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRztvQkFDZixNQUFNLEVBQUUsT0FBTyxDQUFDLE1BQU07b0JBQ3RCLFFBQVEsRUFBRSxPQUFPLENBQUMsUUFBUTtpQkFDM0IsQ0FBQztnQkFFRixNQUFNLElBQUksRUFBRSxDQUFDO2FBQ2Q7WUFBQyxPQUFPLEtBQUssRUFBRTtnQkFDZCxHQUFHLENBQUMsTUFBTSxHQUFHLEdBQUcsQ0FBQztnQkFDakIsR0FBRyxDQUFDLElBQUksR0FBRyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxDQUFDO2FBQ25EO1FBQ0gsQ0FBQyxDQUFDO0lBQ0osQ0FBQztDQUNGLENBQUE7QUFqQ1ksY0FBYztJQUQxQixJQUFBLGlCQUFVLEdBQUU7R0FDQSxjQUFjLENBaUMxQjtBQWpDWSx3Q0FBYyJ9