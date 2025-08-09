import { Context } from '@midwayjs/koa';
import { BookingService } from '../service/booking.service';
import { UserService } from '../service/user.service';
import { BookingListRequest } from '../interface/activity';
export declare class BookingController {
    ctx: Context;
    bookingService: BookingService;
    userService: UserService;
    getMyBookings(params: BookingListRequest): Promise<{
        success: boolean;
        message: string;
        data: {
            bookings: (import("../interface/activity").Booking & {
                activity: any;
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
    cancelBooking(id: string): Promise<{
        success: boolean;
        message: any;
        data: any;
    }>;
    confirmBooking(id: string): Promise<{
        success: boolean;
        message: any;
        data: any;
    }>;
    getBookingDetail(id: string): Promise<{
        success: boolean;
        message: string;
        data: import("../interface/activity").Booking;
    } | {
        success: boolean;
        message: any;
        data: any;
    }>;
    getBookingStats(activityId?: string): Promise<{
        success: boolean;
        message: string;
        data: {
            total: number;
            pending: number;
            confirmed: number;
            cancelled: number;
        };
    } | {
        success: boolean;
        message: any;
        data: any;
    }>;
    checkUserBooking(activityId: string): Promise<{
        success: boolean;
        message: string;
        data: {
            isBooked: boolean;
            bookingId?: number;
        };
    } | {
        success: boolean;
        message: any;
        data: any;
    }>;
    confirmAttendance(id: string): Promise<{
        success: boolean;
        message: any;
        data: any;
    }>;
}
