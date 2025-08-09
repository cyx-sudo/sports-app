# Sports App 部署打包脚本
# 更新日期: 2025年8月9日

Write-Host "🚀 开始构建 Sports App 部署包..." -ForegroundColor Green

# 设置项目根目录
$rootPath = Split-Path $PSScriptRoot -Parent
$deploymentPath = Join-Path $rootPath "deployment"
$backendPath = Join-Path $rootPath "backend"
$frontendPath = Join-Path $rootPath "frontend"

# 清理并重新创建部署目录
Write-Host "📁 清理部署目录..." -ForegroundColor Yellow
if (Test-Path $deploymentPath) {
    Remove-Item $deploymentPath -Recurse -Force
}
New-Item -ItemType Directory -Path $deploymentPath | Out-Null

# 1. 构建后端项目
Write-Host "🔨 构建后端项目..." -ForegroundColor Yellow
Set-Location $backendPath
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 后端构建失败!" -ForegroundColor Red
    exit 1
}

# 2. 构建前端项目
Write-Host "🔨 构建前端项目..." -ForegroundColor Yellow
Set-Location $frontendPath
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 前端构建失败!" -ForegroundColor Red
    exit 1
}

# 3. 复制后端文件
Write-Host "📦 打包后端文件..." -ForegroundColor Yellow
$backendDeployPath = Join-Path $deploymentPath "backend"
New-Item -ItemType Directory -Path $backendDeployPath | Out-Null

# 复制编译后的代码
Copy-Item (Join-Path $backendPath "dist") $backendDeployPath -Recurse
Copy-Item (Join-Path $backendPath "package.json") $backendDeployPath
Copy-Item (Join-Path $backendPath "package-lock.json") $backendDeployPath -ErrorAction SilentlyContinue
Copy-Item (Join-Path $backendPath "bootstrap.js") $backendDeployPath
Copy-Item (Join-Path $backendPath "data") $backendDeployPath -Recurse

# 复制配置文件
if (Test-Path (Join-Path $backendPath ".env")) {
    Copy-Item (Join-Path $backendPath ".env") $backendDeployPath
}

# 4. 复制前端文件
Write-Host "📦 打包前端文件..." -ForegroundColor Yellow
$frontendDeployPath = Join-Path $deploymentPath "frontend"
New-Item -ItemType Directory -Path $frontendDeployPath | Out-Null

# 复制构建后的静态文件
Copy-Item (Join-Path $frontendPath "dist") $frontendDeployPath -Recurse
Copy-Item (Join-Path $frontendPath "package.json") $frontendDeployPath

# 5. 创建部署说明文档
Write-Host "📝 生成部署文档..." -ForegroundColor Yellow

$deployReadme = @"
# Sports App 部署包

**构建时间:** $(Get-Date -Format "yyyy年MM月dd日 HH:mm:ss")
**版本信息:** 最新版本 (包含评论系统修复)

## 📁 目录结构

```
deployment/
├── backend/              # 后端部署文件
│   ├── dist/            # 编译后的代码
│   ├── data/            # 数据库文件
│   ├── package.json     # 依赖配置
│   └── bootstrap.js     # 启动脚本
├── frontend/            # 前端部署文件
│   ├── dist/           # 构建后的静态文件
│   └── package.json    # 包信息
└── README.md           # 此文件
```

## 🚀 部署步骤

### 1. 后端部署

```bash
cd backend
npm install --production
npm start
```

**默认端口:** 7001
**数据库:** SQLite (已包含测试数据)

### 2. 前端部署

#### 方式1: 使用 Nginx (推荐)
```nginx
server {
    listen 80;
    server_name localhost;
    
    root /path/to/frontend/dist;
    index index.html;
    
    location / {
        try_files `$uri `$uri/ /index.html;
    }
    
    location /api/ {
        proxy_pass http://localhost:7001;
        proxy_set_header Host `$host;
        proxy_set_header X-Real-IP `$remote_addr;
    }
}
```

#### 方式2: 使用 serve (开发/测试)
```bash
cd frontend/dist
npx serve -s . -p 3000
```

## ✨ 功能特性

### 已实现的核心功能
- ✅ 用户注册/登录系统
- ✅ 活动列表与详情展示
- ✅ 活动预约/取消预约
- ✅ 我的预约管理
- ✅ 活动历史确认
- ✅ 评论系统 (任何用户可评论)
- ✅ 活动收藏功能
- ✅ 用户个人资料管理

### 最新修复
- 🔧 修复了评论发布失败的认证问题
- 🔧 优化了活动状态显示逻辑
- 🔧 增强了预约反馈机制
- 🔧 改进了权限控制系统

## 🔧 环境要求

- Node.js >= 16.0.0
- npm >= 7.0.0
- Nginx (生产环境推荐)

## 📊 数据库说明

使用 SQLite 数据库，包含以下表：
- users (用户信息)
- activities (活动信息)
- bookings (预约记录)
- comments (评论数据)
- favorites (收藏记录)
- activity_history (活动历史)

## 🌐 API 接口

后端提供完整的 RESTful API:
- `/api/auth/*` - 认证相关
- `/api/activity/*` - 活动管理
- `/api/booking/*` - 预约管理
- `/api/comment/*` - 评论系统
- `/api/user/*` - 用户管理

## 🛠️ 故障排除

### 常见问题
1. **端口冲突:** 修改 backend/src/config/config.default.ts 中的端口配置
2. **数据库问题:** 检查 data/sports_app.db 文件权限
3. **跨域问题:** 确保前端请求地址正确配置

### 日志位置
- 后端日志: `backend/logs/`
- 错误日志: `backend/logs/my-midway-project/common-error.log`

---

**部署支持:** 如有问题请检查日志文件或联系开发团队
"@

Set-Content -Path (Join-Path $deploymentPath "README.md") -Value $deployReadme

# 6. 创建数据库配置说明
$dbConfigDoc = @"
# 数据库配置说明

## 数据库文件位置
`backend/data/sports_app.db`

## 表结构

### users - 用户表
- id: 用户ID (主键)
- username: 用户名 (唯一)
- password: 密码 (加密存储)
- email: 邮箱
- created_at: 创建时间

### activities - 活动表
- id: 活动ID (主键)
- title: 活动标题
- description: 活动描述
- location: 活动地点
- start_time: 开始时间
- end_time: 结束时间
- max_participants: 最大参与人数
- current_participants: 当前参与人数
- created_at: 创建时间

### bookings - 预约表
- id: 预约ID (主键)
- user_id: 用户ID (外键)
- activity_id: 活动ID (外键)
- status: 预约状态 (pending/confirmed/cancelled)
- created_at: 创建时间

### comments - 评论表
- id: 评论ID (主键)
- user_id: 用户ID (外键)
- activity_id: 活动ID (外键)
- content: 评论内容
- rating: 评分 (1-5)
- created_at: 创建时间
- updated_at: 更新时间

### favorites - 收藏表
- id: 收藏ID (主键)
- user_id: 用户ID (外键)
- activity_id: 活动ID (外键)
- created_at: 创建时间

### activity_history - 活动历史表
- id: 历史ID (主键)
- user_id: 用户ID (外键)
- activity_id: 活动ID (外键)
- booking_id: 预约ID (外键)
- confirmed_at: 确认时间

## 数据库备份与恢复

### 备份
```bash
cp backend/data/sports_app.db backup/sports_app_backup_$(Get-Date -Format "yyyyMMdd").db
```

### 恢复
```bash
cp backup/sports_app_backup_YYYYMMDD.db backend/data/sports_app.db
```

## 测试数据

数据库中包含以下测试数据:
- 测试用户: test999 (密码: 123456)
- 示例活动数据
- 示例评论和预约数据

**注意:** 生产环境部署前请清理测试数据
"@

Set-Content -Path (Join-Path $deploymentPath "数据库配置说明.md") -Value $dbConfigDoc

# 7. 创建部署压缩包
Write-Host "📦 创建部署压缩包..." -ForegroundColor Yellow
Set-Location $rootPath

# 删除旧的压缩包
if (Test-Path "sports-app-deployment.zip") {
    Remove-Item "sports-app-deployment.zip" -Force
}

# 创建新的压缩包
Compress-Archive -Path $deploymentPath -DestinationPath "sports-app-deployment.zip" -Force

# 8. 显示部署包信息
Write-Host "✅ 部署包构建完成!" -ForegroundColor Green
Write-Host ""
Write-Host "📦 部署包信息:" -ForegroundColor Cyan
Write-Host "  📁 部署目录: $deploymentPath"
Write-Host "  📦 压缩包: $(Join-Path $rootPath 'sports-app-deployment.zip')"
Write-Host "  📏 包大小: $((Get-Item 'sports-app-deployment.zip').Length / 1MB | ForEach-Object { [math]::Round($_, 2) }) MB"
Write-Host ""

# 显示目录结构
Write-Host "📁 包含内容:" -ForegroundColor Cyan
Get-ChildItem $deploymentPath -Recurse -Name | ForEach-Object { 
    Write-Host "    $_"
}

Write-Host ""
Write-Host "🚀 部署包已准备就绪，可以部署到生产环境!" -ForegroundColor Green

# 返回原始目录
Set-Location $rootPath
