import { Context } from '@midwayjs/koa';
import { ActivityHistoryService, ActivityHistoryListRequest } from '../service/activity-history.service';
import { UserService } from '../service/user.service';
export declare class ActivityHistoryController {
    ctx: Context;
    activityHistoryService: ActivityHistoryService;
    userService: UserService;
    addActivityHistory(body: {
        activityId: number;
        bookingId: number;
        status: 'completed' | 'cancelled' | 'no-show';
    }): Promise<{
        success: boolean;
        message: string;
        data: import("../service/activity-history.service").ActivityHistory;
    } | {
        success: boolean;
        message: any;
        data: any;
    }>;
    getMyActivityHistory(params: ActivityHistoryListRequest): Promise<{
        success: boolean;
        message: string;
        data: {
            histories: (import("../service/activity-history.service").ActivityHistory & {
                activity: any;
                booking: any;
            })[];
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    } | {
        success: boolean;
        message: any;
        data: any;
    }>;
    getMyActivityStats(): Promise<{
        success: boolean;
        message: string;
        data: {
            totalActivities: number;
            completedActivities: number;
            cancelledActivities: number;
            noShowActivities: number;
        };
    } | {
        success: boolean;
        message: any;
        data: any;
    }>;
    getActivityHistory(activityId: string): Promise<{
        success: boolean;
        message: string;
        data: import("../service/activity-history.service").ActivityHistory[];
    } | {
        success: boolean;
        message: any;
        data: any;
    }>;
    deleteActivityHistory(id: string): Promise<{
        success: boolean;
        message: any;
        data: any;
    }>;
}
