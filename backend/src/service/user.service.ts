import { Provide, Scope, ScopeEnum, Inject } from '@midwayjs/core';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import {
  User,
  RegisterRequest,
  LoginRequest,
  LoginResponse,
} from '../interface/user';
import { DatabaseService } from './database.service';

@Provide()
@Scope(ScopeEnum.Singleton)
export class UserService {
  @Inject()
  databaseService: DatabaseService;

  // JWT 密钥
  private jwtSecret = 'your-secret-key-change-in-production';

  // 注册用户
  async register(
    userData: RegisterRequest
  ): Promise<{ success: boolean; message: string }> {
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
      insertUser.run(
        userData.username,
        hashedPassword,
        userData.email,
        userData.phone
      );
      return { success: true, message: '注册成功' };
    } catch (error) {
      throw new Error('注册失败，请重试');
    }
  }

  // 用户登录
  async login(loginData: LoginRequest): Promise<LoginResponse> {
    const db = this.databaseService.getDatabase();

    // 查找用户
    const user = db
      .prepare('SELECT * FROM users WHERE username = ?')
      .get(loginData.username) as User;
    if (!user) {
      throw new Error('用户名或密码错误');
    }

    // 验证密码
    const isValidPassword = await bcrypt.compare(
      loginData.password,
      user.password
    );
    if (!isValidPassword) {
      throw new Error('用户名或密码错误');
    }

    // 生成 JWT token
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      this.jwtSecret,
      { expiresIn: '24h' }
    );

    // 返回用户信息（不包含密码）
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, ...userWithoutPassword } = user;
    return {
      token,
      user: userWithoutPassword,
    };
  }

  // 根据 token 获取用户信息
  async getUserByToken(token: string): Promise<Omit<User, 'password'>> {
    const db = this.databaseService.getDatabase();

    try {
      const decoded = jwt.verify(token, this.jwtSecret) as any;
      const user = db
        .prepare('SELECT * FROM users WHERE id = ?')
        .get(decoded.userId) as User;

      if (!user) {
        throw new Error('用户不存在');
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      throw new Error('无效的token');
    }
  }

  // 获取所有用户（管理员功能）
  async getAllUsers(): Promise<Omit<User, 'password'>[]> {
    const db = this.databaseService.getDatabase();
    const users = db
      .prepare(
        'SELECT id, username, email, phone, createdAt, updatedAt FROM users'
      )
      .all() as Omit<User, 'password'>[];
    return users;
  }

  // 根据 ID 获取用户
  async getUser(options: {
    uid: number;
  }): Promise<Omit<User, 'password'> | null> {
    const db = this.databaseService.getDatabase();
    const user = db
      .prepare(
        'SELECT id, username, email, phone, createdAt, updatedAt FROM users WHERE id = ?'
      )
      .get(options.uid) as Omit<User, 'password'>;
    return user || null;
  }

  // 更新用户资料
  async updateUserProfile(userId: number, profileData: { email?: string; phone?: string; realName?: string }): Promise<Omit<User, 'password'>> {
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
    if (updateFields.length > 1) { // 除了 updatedAt 还有其他字段
      const updateSql = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;
      db.prepare(updateSql).run(...updateValues);
    }

    // 返回更新后的用户信息
    const user = db
      .prepare('SELECT id, username, email, phone, realName, createdAt, updatedAt FROM users WHERE id = ?')
      .get(userId) as Omit<User, 'password'>;

    return user;
  }

  // 修改密码
  async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<void> {
    const db = this.databaseService.getDatabase();

    // 获取用户当前密码
    const user = db
      .prepare('SELECT password FROM users WHERE id = ?')
      .get(userId) as { password: string } | undefined;

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
    db.prepare('UPDATE users SET password = ?, updatedAt = ? WHERE id = ?')
      .run(hashedNewPassword, new Date().toISOString(), userId);
  }
}
