# 体育活动预订系统

2025年南京大学暑期课程web开发大作业，一个完整的体育活动预订管理系统，包含前端用户界面和后端 API 服务。

## GitHub仓库地址 
包含了前后端文件
https://github.com/cyx-sudo/sports-app/ 

## 打包平台 
Windows 11

## 项目结构

```
sports-booking-system/
├── frontend/          # React + TypeScript 前端应用
├── backend/           # Midway.js + Node.js 后端服务
├── shared/            # 共享类型定义和工具
├── .github/           # CI/CD 配置
└── docs/              # 项目文档
```

## 核心功能

### 基础功能
- ✅ 多用户注册与登录
- ✅ 活动管理
- ✅ 活动报名
- ✅ 活动订单管理
- ✅ 活动列表查看
- ✅ 活动详情查看
- ✅ 活动评论
- ✅ 活动搜索

### 附加功能
- ✅ 活动收藏
- ✅ 活动历史记录
- ✅ 活动确认


## 对课程内容的改进建议
 建议本课程与软工二课程合作，可以参与软工二的实践部分，进行web项目的开发，形成课程间的有效联动和协同

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

## CI/CD

项目使用 GitHub Actions 进行持续集成和部署：

- **代码检查**: ESLint + TypeScript 编译检查
- **单元测试**: 前后端测试套件
- **集成测试**: API 健康检查
- **安全扫描**: npm audit + CodeQL
- **自动部署**: 主分支自动部署