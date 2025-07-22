# 体育活动预订系统

一个完整的体育活动预订管理系统，包含前端用户界面和后端 API 服务。

## 项目结构

```
sports-booking-system/
├── frontend/          # React + TypeScript 前端应用
├── backend/           # Midway.js + Node.js 后端服务
├── shared/            # 共享类型定义和工具
├── .github/           # CI/CD 配置
└── docs/              # 项目文档
```

## 功能特性

### 用户功能
- 用户注册和登录
- 浏览体育活动列表
- 查看活动详情
- 预订和取消活动
- 查看个人预订记录

### 管理功能
- 创建和管理体育活动
- 查看活动参与情况
- 用户管理

### 技术特性
- JWT 身份验证
- SQLite 数据库存储
- RESTful API 设计
- TypeScript 类型安全
- 响应式用户界面

## 技术栈

### 前端
- React 19.1.0
- TypeScript 5.8.3
- Vite 7.0.4
- Tailwind CSS 4.1.11
- Axios HTTP 客户端

### 后端
- Midway.js 3.12.0
- Node.js
- TypeScript 4.8.0
- SQLite + better-sqlite3
- bcryptjs 密码加密
- jsonwebtoken JWT 认证

## 快速开始

### 前置要求
- Node.js >= 18.0.0
- npm >= 8.0.0

### 安装依赖
```bash
# 安装所有依赖
npm run install:all

# 或分别安装
npm install              # 根目录依赖
npm run install:frontend # 前端依赖
npm run install:backend  # 后端依赖
```

### 开发模式
```bash
# 同时启动前后端开发服务器
npm run dev

# 或分别启动
npm run dev:frontend     # 前端开发服务器 (http://localhost:5173)
npm run dev:backend      # 后端开发服务器 (http://localhost:7001)
```

### 构建项目
```bash
# 构建所有项目
npm run build

# 或分别构建
npm run build:frontend
npm run build:backend
```

### 运行测试
```bash
# 运行所有测试
npm run test

# 或分别测试
npm run test:frontend
npm run test:backend
```

### 代码检查
```bash
# 运行所有代码检查
npm run lint

# 或分别检查
npm run lint:frontend
npm run lint:backend
```

## API 接口

### 用户认证
- `POST /api/user/register` - 用户注册
- `POST /api/user/login` - 用户登录
- `GET /api/user/profile` - 获取用户信息

### 活动管理
- `POST /api/activity` - 创建活动
- `GET /api/activity/list` - 获取活动列表
- `GET /api/activity/:id` - 获取活动详情
- `PUT /api/activity/:id` - 更新活动
- `DELETE /api/activity/:id` - 删除活动
- `POST /api/activity/:id/join` - 参加活动

### 预订管理
- `POST /api/booking` - 创建预订
- `GET /api/booking/user/:userId` - 获取用户预订列表
- `GET /api/booking/activity/:activityId` - 获取活动预订列表
- `DELETE /api/booking/:id` - 取消预订

## 数据库设计

### 用户表 (users)
- id, username, email, password, created_at

### 活动表 (activities)
- id, title, description, location, start_time, end_time, max_participants, current_participants, creator_id, created_at

### 预订表 (bookings)
- id, user_id, activity_id, status, created_at

## CI/CD

项目使用 GitHub Actions 进行持续集成和部署：

- **代码检查**: ESLint + TypeScript 编译检查
- **单元测试**: 前后端测试套件
- **集成测试**: API 健康检查
- **安全扫描**: npm audit + CodeQL
- **自动部署**: 主分支自动部署

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。
