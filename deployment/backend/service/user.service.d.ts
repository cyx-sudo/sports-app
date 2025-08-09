import { User, RegisterRequest, LoginRequest, LoginResponse } from '../interface/user';
import { DatabaseService } from './database.service';
export declare class UserService {
    databaseService: DatabaseService;
    private jwtSecret;
    register(userData: RegisterRequest): Promise<{
        success: boolean;
        message: string;
    }>;
    login(loginData: LoginRequest): Promise<LoginResponse>;
    getUserByToken(token: string): Promise<Omit<User, 'password'>>;
    getAllUsers(): Promise<Omit<User, 'password'>[]>;
    getUser(options: {
        uid: number;
    }): Promise<Omit<User, 'password'> | null>;
    updateUserProfile(userId: number, profileData: {
        email?: string;
        phone?: string;
        realName?: string;
    }): Promise<Omit<User, 'password'>>;
    changePassword(userId: number, currentPassword: string, newPassword: string): Promise<void>;
}
