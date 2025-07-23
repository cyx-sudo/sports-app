import request from '../utils/request';
import type { RegisterRequest, LoginRequest } from '../../../shared/types';

// 注册
export const register = (params: RegisterRequest) => {
  return request.post('/api/user/register', params);
};

// 登录
export const login = (params: LoginRequest) => {
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
