// 用户数据模型
export interface User {
  id?: number;
  username: string;
  password: string;
  email: string;
  phone: string;
  realName: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// 注册请求参数
export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  phone: string;
  realName: string;
}

// 登录请求参数
export interface LoginRequest {
  username: string;
  password: string;
}

// 登录响应数据
export interface LoginResponse {
  token: string;
  user: Omit<User, 'password'>;
}
