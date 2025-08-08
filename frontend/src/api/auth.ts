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

// 更新用户资料
export const updateProfile = (profileData: {
  email?: string;
  phone?: string;
  realName?: string;
}) => {
  return request.put('/api/user/profile', profileData);
};

// 修改密码
export const changePassword = (passwordData: {
  currentPassword: string;
  newPassword: string;
}) => {
  return request.put('/api/user/password', passwordData);
};
