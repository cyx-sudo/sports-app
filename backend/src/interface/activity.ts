export interface Activity {
  id: number;
  name: string;
  description: string;
  location: string;
  capacity: number;
  currentParticipants: number;
  startTime: Date;
  endTime: Date;
  price: number;
  instructor: string;
  category: string;
  status: 'active' | 'cancelled' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateActivityRequest {
  name: string;
  description: string;
  location: string;
  capacity: number;
  startTime: string;
  endTime: string;
  price: number;
  instructor: string;
  category: string;
}

export interface UpdateActivityRequest {
  name?: string;
  description?: string;
  location?: string;
  capacity?: number;
  startTime?: string;
  endTime?: string;
  price?: number;
  instructor?: string;
  category?: string;
  status?: 'active' | 'cancelled' | 'completed';
}

export interface ActivityListRequest {
  page?: number;
  limit?: number;
  category?: string;
  status?: 'active' | 'cancelled' | 'completed';
  search?: string;
}

export interface ActivityListResponse {
  items: Activity[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Booking {
  id: number;
  userId: number;
  activityId: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  bookingTime: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBookingRequest {
  activityId: number;
}

export interface BookingListRequest {
  page?: number;
  limit?: number;
  userId?: number;
  activityId?: number;
  status?: 'pending' | 'confirmed' | 'cancelled';
}
