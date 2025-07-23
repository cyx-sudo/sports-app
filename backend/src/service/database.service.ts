import { Provide, Scope, ScopeEnum, Init } from '@midwayjs/core';
import * as Database from 'better-sqlite3';
import * as path from 'path';

@Provide()
@Scope(ScopeEnum.Singleton)
export class DatabaseService {
  private db: Database.Database;

  @Init()
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

    // 插入测试数据
    this.insertTestData();

    console.log('Database initialized successfully');
  }

  private createUserTable() {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        phone TEXT UNIQUE NOT NULL,
        realName TEXT NOT NULL,
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

  private createActivityTable() {
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
    this.db.exec(
      'CREATE INDEX IF NOT EXISTS idx_activity_category ON activities(category)'
    );
    this.db.exec(
      'CREATE INDEX IF NOT EXISTS idx_activity_status ON activities(status)'
    );
    this.db.exec(
      'CREATE INDEX IF NOT EXISTS idx_activity_start_time ON activities(startTime)'
    );
    this.db.exec(
      'CREATE INDEX IF NOT EXISTS idx_activity_name ON activities(name)'
    );
  }

  private createBookingTable() {
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
    this.db.exec(
      'CREATE INDEX IF NOT EXISTS idx_booking_user ON bookings(userId)'
    );
    this.db.exec(
      'CREATE INDEX IF NOT EXISTS idx_booking_activity ON bookings(activityId)'
    );
    this.db.exec(
      'CREATE INDEX IF NOT EXISTS idx_booking_status ON bookings(status)'
    );
  }

  private insertTestData() {
    const db = this.db;

    // 检查是否已经有测试数据
    const activityCount = db
      .prepare('SELECT COUNT(*) as count FROM activities')
      .get() as { count: number };
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
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 明天
        endTime: new Date(
          Date.now() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000
        ).toISOString(), // 明天 + 2小时
        price: 50,
        instructor: '张教练',
        category: '羽毛球',
      },
      {
        name: '篮球训练营',
        description: '专业篮球训练，提升投篮和团队配合能力',
        location: '篮球场1号',
        capacity: 16,
        startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 后天
        endTime: new Date(
          Date.now() + 2 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000
        ).toISOString(), // 后天 + 3小时
        price: 80,
        instructor: '李教练',
        category: '篮球',
      },
      {
        name: '游泳健身课',
        description: '游泳技巧训练和水中健身运动',
        location: '游泳馆',
        capacity: 8,
        startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 三天后
        endTime: new Date(
          Date.now() + 3 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000
        ).toISOString(), // 三天后 + 1.5小时
        price: 100,
        instructor: '王教练',
        category: '游泳',
      },
      {
        name: '瑜伽放松课',
        description: '舒缓身心的瑜伽课程，适合所有水平的学员',
        location: '瑜伽室',
        capacity: 15,
        startTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(), // 四天后
        endTime: new Date(
          Date.now() + 4 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000
        ).toISOString(), // 四天后 + 1小时
        price: 60,
        instructor: '刘教练',
        category: '瑜伽',
      },
      {
        name: '乒乓球技巧提升',
        description: '提升乒乓球技巧，包括发球、接球和战术',
        location: '乒乓球馆',
        capacity: 10,
        startTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 五天后
        endTime: new Date(
          Date.now() + 5 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000
        ).toISOString(), // 五天后 + 2小时
        price: 45,
        instructor: '陈教练',
        category: '乒乓球',
      },
    ];

    for (const activity of activities) {
      insertActivity.run(
        activity.name,
        activity.description,
        activity.location,
        activity.capacity,
        activity.startTime,
        activity.endTime,
        activity.price,
        activity.instructor,
        activity.category
      );
    }

    console.log('Test data inserted successfully');
  }

  getDatabase(): Database.Database {
    return this.db;
  }

  close() {
    if (this.db) {
      this.db.close();
    }
  }
}
