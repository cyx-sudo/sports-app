import { DatabaseService } from './database.service';
import { ActivityService } from './activity.service';
import { ActivityHistoryService } from './activity-history.service';
import { Booking, CreateBookingRequest, BookingListRequest } from '../interface/activity';
export declare class BookingService {
    databaseService: DatabaseService;
    activityService: ActivityService;
    activityHistoryService: ActivityHistoryService;
    createBooking(userId: number, bookingData: CreateBookingRequest): Promise<Booking>;
    getBookingById(id: number): Promise<Booking | null>;
    getUserBookings(userId: number, params: BookingListRequest): Promise<{
        bookings: (Booking & {
            activity: any;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getActivityBookings(activityId: number, params: BookingListRequest): Promise<{
        bookings: (Booking & {
            user: any;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    cancelBooking(userId: number, bookingId: number): Promise<boolean>;
    confirmBooking(bookingId: number): Promise<boolean>;
    getBookingStats(activityId?: number): Promise<{
        total: number;
        pending: number;
        confirmed: number;
        cancelled: number;
    }>;
    checkUserBooking(userId: number, activityId: number): Promise<{
        isBooked: boolean;
        bookingId?: number;
    }>;
    confirmAttendance(userId: number, bookingId: number): Promise<void>;
}
