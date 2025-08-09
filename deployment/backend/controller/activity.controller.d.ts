import { Context } from '@midwayjs/koa';
import { ActivityService } from '../service/activity.service';
import { BookingService } from '../service/booking.service';
import { UserService } from '../service/user.service';
import { CreateActivityRequest, UpdateActivityRequest, ActivityListRequest, CreateBookingRequest, BookingListRequest } from '../interface/activity';
export declare class ActivityController {
    ctx: Context;
    activityService: ActivityService;
    bookingService: BookingService;
    userService: UserService;
    createActivity(activityData: CreateActivityRequest): Promise<{
        success: boolean;
        message: string;
        data: import("../interface/activity").Activity;
    } | {
        success: boolean;
        message: any;
        data: any;
    }>;
    getActivityList(params: ActivityListRequest): Promise<{
        success: boolean;
        message: string;
        data: import("../interface/activity").ActivityListResponse;
    } | {
        success: boolean;
        message: any;
        data: any;
    }>;
    getActivityDetail(id: string): Promise<{
        success: boolean;
        message: string;
        data: {
            activity: import("../interface/activity").Activity;
            bookingStats: {
                total: number;
                pending: number;
                confirmed: number;
                cancelled: number;
            };
        };
    } | {
        success: boolean;
        message: any;
        data: any;
    }>;
    updateActivity(id: string, updateData: UpdateActivityRequest): Promise<{
        success: boolean;
        message: string;
        data: import("../interface/activity").Activity;
    } | {
        success: boolean;
        message: any;
        data: any;
    }>;
    deleteActivity(id: string): Promise<{
        success: boolean;
        message: any;
        data: any;
    }>;
    getActivityCategories(): Promise<{
        success: boolean;
        message: string;
        data: string[];
    } | {
        success: boolean;
        message: any;
        data: any;
    }>;
    bookActivity(id: string, bookingData: CreateBookingRequest): Promise<{
        success: boolean;
        message: string;
        data: import("../interface/activity").Booking;
    } | {
        success: boolean;
        message: any;
        data: any;
    }>;
    getActivityBookings(id: string, params: BookingListRequest): Promise<{
        success: boolean;
        message: string;
        data: {
            bookings: (import("../interface/activity").Booking & {
                user: any;
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
    getActivityStats(id: string): Promise<{
        success: boolean;
        message: string;
        data: {
            activity: {
                id: number;
                name: string;
                capacity: number;
                currentParticipants: number;
                availableSpots: number;
                status: "completed" | "cancelled" | "active";
            };
            bookingStats: {
                total: number;
                pending: number;
                confirmed: number;
                cancelled: number;
            };
        };
    } | {
        success: boolean;
        message: any;
        data: any;
    }>;
}
