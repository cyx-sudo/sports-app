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
exports.DatabaseService = void 0;
const core_1 = require("@midwayjs/core");
const Database = require("better-sqlite3");
const path = require("path");
let DatabaseService = class DatabaseService {
    async init() {
        // 数据库文件路径
        const dbPath = path.join(__dirname, '../../data/sports_app.db');
        // 创建数据库连接
        this.db = new Database(dbPath);
        // 创建用户表
        this.createUserTable();
        // 创建活动表
        this.createActivityTable();
        // 创建预约表
        this.createBookingTable();
        // 创建收藏表
        this.createFavoriteTable();
        // 创建活动历史表
        this.createActivityHistoryTable();
        // 创建评论表
        this.createCommentTable();
        // 插入测试数据
        this.insertTestData();
        console.log('Database initialized successfully');
    }
    createUserTable() {
        const createTableSQL = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT UNIQUE NOT NULL,
        realName TEXT,
        role TEXT DEFAULT 'user',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;
        this.db.exec(createTableSQL);
        // 创建索引
        this.db.exec('CREATE INDEX IF NOT EXISTS idx_username ON users(username)');
        this.db.exec('CREATE INDEX IF NOT EXISTS idx_email ON users(email)');
        this.db.exec('CREATE INDEX IF NOT EXISTS idx_phone ON users(phone)');
    }
    createActivityTable() {
        const createTableSQL = `
      CREATE TABLE IF NOT EXISTS activities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        location TEXT NOT NULL,
        capacity INTEGER NOT NULL,
        currentParticipants INTEGER DEFAULT 0,
        startTime DATETIME NOT NULL,
        endTime DATETIME NOT NULL,
        price REAL NOT NULL,
        instructor TEXT NOT NULL,
        category TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'active',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;
        this.db.exec(createTableSQL);
        // 创建索引
        this.db.exec('CREATE INDEX IF NOT EXISTS idx_activity_category ON activities(category)');
        this.db.exec('CREATE INDEX IF NOT EXISTS idx_activity_status ON activities(status)');
        this.db.exec('CREATE INDEX IF NOT EXISTS idx_activity_start_time ON activities(startTime)');
        this.db.exec('CREATE INDEX IF NOT EXISTS idx_activity_name ON activities(name)');
    }
    createBookingTable() {
        const createTableSQL = `
      CREATE TABLE IF NOT EXISTS bookings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        activityId INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        bookingTime DATETIME DEFAULT CURRENT_TIMESTAMP,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id),
        FOREIGN KEY (activityId) REFERENCES activities(id),
        UNIQUE(userId, activityId)
      )
    `;
        this.db.exec(createTableSQL);
        // 创建索引
        this.db.exec('CREATE INDEX IF NOT EXISTS idx_booking_user ON bookings(userId)');
        this.db.exec('CREATE INDEX IF NOT EXISTS idx_booking_activity ON bookings(activityId)');
        this.db.exec('CREATE INDEX IF NOT EXISTS idx_booking_status ON bookings(status)');
    }
    createFavoriteTable() {
        const createTableSQL = `
      CREATE TABLE IF NOT EXISTS favorites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        activityId INTEGER NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (activityId) REFERENCES activities(id) ON DELETE CASCADE,
        UNIQUE(userId, activityId)
      )
    `;
        this.db.exec(createTableSQL);
        // 创建索引
        this.db.exec('CREATE INDEX IF NOT EXISTS idx_favorite_user ON favorites(userId)');
        this.db.exec('CREATE INDEX IF NOT EXISTS idx_favorite_activity ON favorites(activityId)');
    }
    createActivityHistoryTable() {
        const createTableSQL = `
      CREATE TABLE IF NOT EXISTS activity_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        activityId INTEGER NOT NULL,
        bookingId INTEGER NOT NULL,
        status TEXT NOT NULL CHECK(status IN ('completed', 'cancelled', 'no-show')),
        participatedAt DATETIME NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (activityId) REFERENCES activities(id) ON DELETE CASCADE,
        FOREIGN KEY (bookingId) REFERENCES bookings(id) ON DELETE CASCADE
      )
    `;
        this.db.exec(createTableSQL);
        // 创建索引
        this.db.exec('CREATE INDEX IF NOT EXISTS idx_activity_history_user ON activity_history(userId)');
        this.db.exec('CREATE INDEX IF NOT EXISTS idx_activity_history_activity ON activity_history(activityId)');
        this.db.exec('CREATE INDEX IF NOT EXISTS idx_activity_history_booking ON activity_history(bookingId)');
        this.db.exec('CREATE INDEX IF NOT EXISTS idx_activity_history_status ON activity_history(status)');
        this.db.exec('CREATE INDEX IF NOT EXISTS idx_activity_history_participated ON activity_history(participatedAt)');
    }
    createCommentTable() {
        const createTableSQL = `
      CREATE TABLE IF NOT EXISTS comments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        activityId INTEGER NOT NULL,
        content TEXT NOT NULL,
        rating INTEGER NOT NULL DEFAULT 5,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (activityId) REFERENCES activities(id) ON DELETE CASCADE
      )
    `;
        this.db.exec(createTableSQL);
        // 创建索引
        this.db.exec('CREATE INDEX IF NOT EXISTS idx_comment_user ON comments(userId)');
        this.db.exec('CREATE INDEX IF NOT EXISTS idx_comment_activity ON comments(activityId)');
        this.db.exec('CREATE INDEX IF NOT EXISTS idx_comment_rating ON comments(rating)');
        this.db.exec('CREATE INDEX IF NOT EXISTS idx_comment_created ON comments(createdAt)');
    }
    insertTestData() {
        const db = this.db;
        // 检查是否已经有测试数据
        const activityCount = db
            .prepare('SELECT COUNT(*) as count FROM activities')
            .get();
        if (activityCount.count > 0) {
            return; // 已有数据，不需要插入
        }
        // 插入测试活动数据
        const insertActivity = db.prepare(`
      INSERT INTO activities (name, description, location, capacity, startTime, endTime, price, instructor, category)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
        const activities = [
            {
                name: '羽毛球初级班',
                description: '适合初学者的羽毛球课程，教授基本技巧和规则',
                location: '羽毛球馆A',
                capacity: 12,
                startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
                price: 50,
                instructor: '张教练',
                category: '羽毛球',
            },
            {
                name: '篮球训练营',
                description: '专业篮球训练，提升投篮和团队配合能力',
                location: '篮球场1号',
                capacity: 16,
                startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
                endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000).toISOString(),
                price: 80,
                instructor: '李教练',
                category: '篮球',
            },
            {
                name: '游泳健身课',
                description: '游泳技巧训练和水中健身运动',
                location: '游泳馆',
                capacity: 8,
                startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
                endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000).toISOString(),
                price: 100,
                instructor: '王教练',
                category: '游泳',
            },
            {
                name: '瑜伽放松课',
                description: '舒缓身心的瑜伽课程，适合所有水平的学员',
                location: '瑜伽室',
                capacity: 15,
                startTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
                endTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
                price: 60,
                instructor: '刘教练',
                category: '瑜伽',
            },
            {
                name: '乒乓球技巧提升',
                description: '提升乒乓球技巧，包括发球、接球和战术',
                location: '乒乓球馆',
                capacity: 10,
                startTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
                endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
                price: 45,
                instructor: '陈教练',
                category: '乒乓球',
            },
        ];
        for (const activity of activities) {
            insertActivity.run(activity.name, activity.description, activity.location, activity.capacity, activity.startTime, activity.endTime, activity.price, activity.instructor, activity.category);
        }
        console.log('Test data inserted successfully');
    }
    getDatabase() {
        return this.db;
    }
    close() {
        if (this.db) {
            this.db.close();
        }
    }
};
__decorate([
    (0, core_1.Init)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DatabaseService.prototype, "init", null);
DatabaseService = __decorate([
    (0, core_1.Provide)(),
    (0, core_1.Scope)(core_1.ScopeEnum.Singleton)
], DatabaseService);
exports.DatabaseService = DatabaseService;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0YWJhc2Uuc2VydmljZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2aWNlL2RhdGFiYXNlLnNlcnZpY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEseUNBQWlFO0FBQ2pFLDJDQUEyQztBQUMzQyw2QkFBNkI7QUFJdEIsSUFBTSxlQUFlLEdBQXJCLE1BQU0sZUFBZTtJQUlwQixBQUFOLEtBQUssQ0FBQyxJQUFJO1FBQ1IsVUFBVTtRQUNWLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLDBCQUEwQixDQUFDLENBQUM7UUFFaEUsVUFBVTtRQUNWLElBQUksQ0FBQyxFQUFFLEdBQUcsSUFBSSxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFL0IsUUFBUTtRQUNSLElBQUksQ0FBQyxlQUFlLEVBQUUsQ0FBQztRQUV2QixRQUFRO1FBQ1IsSUFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7UUFFM0IsUUFBUTtRQUNSLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBRTFCLFFBQVE7UUFDUixJQUFJLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztRQUUzQixVQUFVO1FBQ1YsSUFBSSxDQUFDLDBCQUEwQixFQUFFLENBQUM7UUFFbEMsUUFBUTtRQUNSLElBQUksQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO1FBRTFCLFNBQVM7UUFDVCxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7UUFFdEIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQ0FBbUMsQ0FBQyxDQUFDO0lBQ25ELENBQUM7SUFFTyxlQUFlO1FBQ3JCLE1BQU0sY0FBYyxHQUFHOzs7Ozs7Ozs7Ozs7S0FZdEIsQ0FBQztRQUVGLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDO1FBRTdCLE9BQU87UUFDUCxJQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyw0REFBNEQsQ0FBQyxDQUFD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