import * as Database from 'better-sqlite3';
export declare class DatabaseService {
    private db;
    init(): Promise<void>;
    private createUserTable;
    private createActivityTable;
    private createBookingTable;
    private createFavoriteTable;
    private createActivityHistoryTable;
    private createCommentTable;
    private insertTestData;
    getDatabase(): Database.Database;
    close(): void;
}
