import { DatabaseService } from './database.service';
export interface ActivityHistory {
    id: number;
    userId: number;
    activityId: number;
    bookingId: number;
    status: 'completed' | 'cancelled' | 'no-show';
    participatedAt: string;
    createdAt: string;
    activity?: any;
    booking?: any;
}
export interface ActivityHistoryListRequest {
    page?: number;
    limit?: number;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
}
export declare class ActivityHistoryService {
    databaseService: DatabaseService;
    addActivityHistory(userId: number, activityId: number, bookingId: number, status: 'completed' | 'cancelled' | 'no-show'): Promise<ActivityHistory>;
    getUserActivityHistory(userId: number, params: ActivityHistoryListRequest): Promise<{
        histories: (ActivityHistory & {
            activity: any;
            booking: any;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getActivityHistoryById(id: number): Promise<ActivityHistory | null>;
    getUserActivityHistoryByActivity(userId: number, activityId: number): Promise<ActivityHistory[]>;
    getUserActivityStats(userId: number): Promise<{
        totalActivities: number;
        completedActivities: number;
        cancelledActivities: number;
        noShowActivities: number;
    }>;
    deleteActivityHistory(id: number): Promise<boolean>;
}
