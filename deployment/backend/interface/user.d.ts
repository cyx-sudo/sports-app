export interface User {
    id?: number;
    username: string;
    password: string;
    email: string;
    phone: string;
    createdAt?: Date;
    updatedAt?: Date;
}
export interface RegisterRequest {
    username: string;
    password: string;
    email: string;
    phone: string;
}
export interface LoginRequest {
    username: string;
    password: string;
}
export interface LoginResponse {
    token: string;
    user: Omit<User, 'password'>;
}
