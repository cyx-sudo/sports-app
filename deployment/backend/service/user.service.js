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
exports.UserService = void 0;
const core_1 = require("@midwayjs/core");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const database_service_1 = require("./database.service");
let UserService = class UserService {
    constructor() {
        // JWT 密钥
        this.jwtSecret = 'your-secret-key-change-in-production';
    }
    // 注册用户
    async register(userData) {
        const db = this.databaseService.getDatabase();
        // 检查用户名是否已存在
        const existingUser = db
            .prepare('SELECT id FROM users WHERE username = ?')
            .get(userData.username);
        if (existingUser) {
            throw new Error('用户名已存在');
        }
        // 检查邮箱是否已存在
        const existingEmail = db
            .prepare('SELECT id FROM users WHERE email = ?')
            .get(userData.email);
        if (existingEmail) {
            throw new Error('邮箱已被注册');
        }
        // 检查手机号是否已存在
        const existingPhone = db
            .prepare('SELECT id FROM users WHERE phone = ?')
            .get(userData.phone);
        if (existingPhone) {
            throw new Error('手机号已被注册');
        }
        // 加密密码
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        // 插入新用户
        const insertUser = db.prepare(`
      INSERT INTO users (username, password, email, phone)
      VALUES (?, ?, ?, ?)
    `);
        try {
            insertUser.run(userData.username, hashedPassword, userData.email, userData.phone);
            return { success: true, message: '注册成功' };
        }
        catch (error) {
            throw new Error('注册失败，请重试');
        }
    }
    // 用户登录
    async login(loginData) {
        const db = this.databaseService.getDatabase();
        // 查找用户
        const user = db
            .prepare('SELECT * FROM users WHERE username = ?')
            .get(loginData.username);
        if (!user) {
            throw new Error('用户名或密码错误');
        }
        // 验证密码
        const isValidPassword = await bcrypt.compare(loginData.password, user.password);
        if (!isValidPassword) {
            throw new Error('用户名或密码错误');
        }
        // 生成 JWT token
        const token = jwt.sign({ userId: user.id, username: user.username }, this.jwtSecret, { expiresIn: '24h' });
        // 返回用户信息（不包含密码）
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password, ...userWithoutPassword } = user;
        return {
            token,
            user: userWithoutPassword,
        };
    }
    // 根据 token 获取用户信息
    async getUserByToken(token) {
        const db = this.databaseService.getDatabase();
        try {
            const decoded = jwt.verify(token, this.jwtSecret);
            const user = db
                .prepare('SELECT * FROM users WHERE id = ?')
                .get(decoded.userId);
            if (!user) {
                throw new Error('用户不存在');
            }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
        }
        catch (error) {
            throw new Error('无效的token');
        }
    }
    // 获取所有用户（管理员功能）
    async getAllUsers() {
        const db = this.databaseService.getDatabase();
        const users = db
            .prepare('SELECT id, username, email, phone, createdAt, updatedAt FROM users')
            .all();
        return users;
    }
    // 根据 ID 获取用户
    async getUser(options) {
        const db = this.databaseService.getDatabase();
        const user = db
            .prepare('SELECT id, username, email, phone, createdAt, updatedAt FROM users WHERE id = ?')
            .get(options.uid);
        return user || null;
    }
    // 更新用户资料
    async updateUserProfile(userId, profileData) {
        const db = this.databaseService.getDatabase();
        // 检查邮箱是否已被其他用户使用
        if (profileData.email) {
            const existingEmail = db
                .prepare('SELECT id FROM users WHERE email = ? AND id != ?')
                .get(profileData.email, userId);
            if (existingEmail) {
                throw new Error('邮箱已被其他用户使用');
            }
        }
        // 检查手机号是否已被其他用户使用
        if (profileData.phone) {
            const existingPhone = db
                .prepare('SELECT id FROM users WHERE phone = ? AND id != ?')
                .get(profileData.phone, userId);
            if (existingPhone) {
                throw new Error('手机号已被其他用户使用');
            }
        }
        // 构建更新字段
        const updateFields = [];
        const updateValues = [];
        if (profileData.email !== undefined) {
            updateFields.push('email = ?');
            updateValues.push(profileData.email);
        }
        if (profileData.phone !== undefined) {
            updateFields.push('phone = ?');
            updateValues.push(profileData.phone);
        }
        if (profileData.realName !== undefined) {
            updateFields.push('realName = ?');
            updateValues.push(profileData.realName);
        }
        updateFields.push('updatedAt = ?');
        updateValues.push(new Date().toISOString());
        updateValues.push(userId);
        // 执行更新
        if (updateFields.length > 1) {
            // 除了 updatedAt 还有其他字段
            const updateSql = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
            db.prepare(updateSql).run(...updateValues);
        }
        // 返回更新后的用户信息
        const user = db
            .prepare('SELECT id, username, email, phone, realName, createdAt, updatedAt FROM users WHERE id = ?')
            .get(userId);
        return user;
    }
    // 修改密码
    async changePassword(userId, currentPassword, newPassword) {
        const db = this.databaseService.getDatabase();
        // 获取用户当前密码
        const user = db
            .prepare('SELECT password FROM users WHERE id = ?')
            .get(userId);
        if (!user) {
            throw new Error('用户不存在');
        }
        // 验证当前密码
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            throw new Error('当前密码错误');
        }
        // 加密新密码
        const hashedNewPassword = await bcrypt.hash(newPassword, 10);
        // 更新密码
        db.prepare('UPDATE users SET password = ?, updatedAt = ? WHERE id = ?').run(hashedNewPassword, new Date().toISOString(), userId);
    }
};
__decorate([
    (0, core_1.Inject)(),
    __metadata("design:type", database_service_1.DatabaseService)
], UserService.prototype, "databaseService", void 0);
UserService = __decorate([
    (0, core_1.Provide)(),
    (0, core_1.Scope)(core_1.ScopeEnum.Singleton)
], UserService);
exports.UserService = UserService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlci5zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3NlcnZpY2UvdXNlci5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLHlDQUFtRTtBQUNuRSxtQ0FBbUM7QUFDbkMsb0NBQW9DO0FBT3BDLHlEQUFxRDtBQUk5QyxJQUFNLFdBQVcsR0FBakIsTUFBTSxXQUFXO0lBQWpCO1FBSUwsU0FBUztRQUNELGNBQVMsR0FBRyxzQ0FBc0MsQ0FBQztJQWdQN0QsQ0FBQztJQTlPQyxPQUFPO0lBQ1AsS0FBSyxDQUFDLFFBQVEsQ0FDWixRQUF5QjtRQUV6QixNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBRTlDLGFBQWE7UUFDYixNQUFNLFlBQVksR0FBRyxFQUFFO2FBQ3BCLE9BQU8sQ0FBQyx5Q0FBeUMsQ0FBQzthQUNsRCxHQUFHLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzFCLElBQUksWUFBWSxFQUFFO1lBQ2hCLE1BQU0sSUFBSSxLQUFLLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDM0I7UUFFRCxZQUFZO1FBQ1osTUFBTSxhQUFhLEdBQUcsRUFBRTthQUNyQixPQUFPLENBQUMsc0NBQXNDLENBQUM7YUFDL0MsR0FBRyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUN2QixJQUFJLGFBQWEsRUFBRTtZQUNqQixNQUFNLElBQUksS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQzNCO1FBRUQsYUFBYTtRQUNiLE1BQU0sYUFBYSxHQUFHLEVBQUU7YUFDckIsT0FBTyxDQUFDLHNDQUFzQyxDQUFDO2FBQy9DLEdBQUcsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDdkIsSUFBSSxhQUFhLEVBQUU7WUFDakIsTUFBTSxJQUFJLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQztTQUM1QjtRQUVELE9BQU87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