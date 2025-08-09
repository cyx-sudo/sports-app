# 体育活动预订系统 - 部署包

## 构建信息
- 构建时间: 2025年8月9日
- 项目版本: 1.0.0
- Node.js 版本要求: >= 18.0.0

## 目录结构

```
deployment/
├── frontend/           # 前端构建产物
│   ├── index.html     # 主页面
│   ├── assets/        # 静态资源
│   │   ├── index-BInDSV8X.css  # 样式文件 (29.09 kB)
│   │   └── index-CoLXBmVV.js   # JavaScript文件 (346.51 kB)
│   └── vite.svg       # 图标文件
├── backend/           # 后端构建产物
│   ├── dist/          # 编译后的JavaScript代码
│   ├── data/          # 数据库文件
│   ├── package.json   # 依赖配置
│   └── bootstrap.js   # 启动文件
└── README.md          # 本文件
```

## 部署说明

### 后端部署

1. 进入后端目录：
   ```bash
   cd deployment/backend
   ```

2. 安装生产依赖：
   ```bash
   npm install --production
   ```

3. 启动后端服务：
   ```bash
   npm start
   # 或
   node bootstrap.js
   ```

4. 默认端口：7001
   - API地址：http://localhost:7001/api
   - 健康检查：http://localhost:7001/

### 前端部署

1. 静态文件部署：
   - 将 `frontend/` 目录下的所有文件部署到Web服务器
   - 支持 Nginx、Apache、IIS 等静态文件服务器

2. Nginx 配置示例：
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       root /path/to/deployment/frontend;
       index index.html;
       
       location / {
           try_files $uri $uri/ /index.html;
       }
       
       location /api/ {
           proxy_pass http://localhost:7001;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

## 环境变量

### 后端环境变量
- `NODE_ENV`: 运行环境 (production)
- `PORT`: 服务端口 (默认 7001)
- `DATABASE_PATH`: 数据库文件路径 (可选)

## 功能特性

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

## 技术架构

### 前端技术栈
- React 19.1.0
- TypeScript 5.8.3
- Vite 7.0.4
- Tailwind CSS 4.1.11

### 后端技术栈
- Midway.js 3.12.0
- Node.js
- TypeScript 4.8.0
- SQLite + better-sqlite3

## 默认账户

### 管理员账户
- 用户名: admin
- 密码: admin123

### 测试用户账户
- 用户名: test999
- 密码: test123

## 注意事项

1. 确保后端先启动，前端才能正常工作
2. 数据库文件已包含测试数据
3. 生产环境建议修改默认密码
4. 建议配置 HTTPS 和防火墙
5. 定期备份数据库文件

## 故障排除

### 常见问题

1. **后端启动失败**
   - 检查 Node.js 版本是否 >= 18.0.0
   - 检查端口 7001 是否被占用
   - 检查数据库文件权限

2. **前端无法访问后端**
   - 检查后端服务是否正常启动
   - 检查防火墙设置
   - 检查代理配置

3. **登录失败**
   - 确认使用正确的用户名和密码
   - 检查后端日志

## 联系信息

如有问题，请联系开发团队。
