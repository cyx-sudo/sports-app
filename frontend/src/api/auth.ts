import request from '../utils/request';

// 用户注册接口
export interface RegisterParams {
  username: string;
  password: string;
  email: string;
  phone: string;
  realName: string;
}

// 用户登录接口
export interface LoginParams {
  username: string;
  password: string;
}

// 用户信息接口
export interface User {
  id: number;
  username: string;
  email: string;
  phone: string;
  realName: string;
  createdAt: string;
}

// 注册
export const register = (params: RegisterParams) => {
  return request.post('/api/user/register', params);
};

// 登录
export const login = (params: LoginParams) => {
  return request.post('/api/user/login', params);
};

// 获取用户信息
export const getUserInfo = () => {
  return request.get('/api/user/info');
};

// 登出
export const logout = () => {
  return request.post('/api/user/logout');
};
