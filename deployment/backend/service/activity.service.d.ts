import { DatabaseService } from './database.service';
import { Activity, CreateActivityRequest, UpdateActivityRequest, ActivityListRequest, ActivityListResponse } from '../interface/activity';
export declare class ActivityService {
    databaseService: DatabaseService;
    createActivity(activityData: CreateActivityRequest): Promise<Activity>;
    getActivityList(params: ActivityListRequest): Promise<ActivityListResponse>;
    calculateCurrentParticipants(activityId: number): Promise<number>;
    getActivityById(id: number): Promise<Activity | null>;
    updateActivity(id: number, updateData: UpdateActivityRequest): Promise<Activity | null>;
    deleteActivity(id: number): Promise<boolean>;
    getActivityCategories(): Promise<string[]>;
    isActivityBookable(activityId: number): Promise<boolean>;
}
