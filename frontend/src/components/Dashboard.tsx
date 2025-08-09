import { Routes, Route, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import type { User } from '../../../shared/types';
import ActivityList from './ActivityList';
import ActivityDetail from './ActivityDetail';
import BookingHistory from './BookingHistory';
import AdminActivityManagement from './AdminActivityManagement';
import Profile from './Profile';
import FavoriteList from './FavoriteList';
import ActivityHistoryList from './ActivityHistoryList';

interface DashboardProps {
  user: User;
  onLogout: () => void;
  onUserUpdate: (user: User) => void;
}

export default function Dashboard({ user, onLogout, onUserUpdate }: DashboardProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<User>(user);

  // 检查是否为管理员
  const isAdmin = currentUser.role === 'admin' || currentUser.username === 'admin';

  useEffect(() => {
    console.log('当前路径:', location.pathname);
  }, [location.pathname]);

  useEffect(() => {
    setCurrentUser(user);
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    onLogout();
    navigate('/login');
  };

  const handleUserUpdate = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    onUserUpdate(updatedUser);
    // 更新localStorage中的用户信息
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const getActiveTab = () => {
    const path = location.pathname;
    if (path.includes('/activities')) return 'activities';
    if (path.includes('/bookings')) return 'bookings';
    if (path.includes('/favorites')) return 'favorites';
    if (path.includes('/history')) return 'history';
    if (path.includes('/admin')) return 'admin';
    if (path.includes('/profile')) return 'profile';
    return 'activities'; // 默认为活动列表
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* 顶部导航 */}
      <nav className="navbar sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h1 className="text-xl font-bold text-gray-900">
                  体育活动室
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div className="text-sm">
                  <div className="font-medium text-gray-900">欢迎，{currentUser.username}</div>
                  <div className="text-gray-500 text-xs">
                    {isAdmin ? '管理员' : '普通用户'}
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="btn-outline text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                退出
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="animate-fadeIn">
          {/* 欢迎卡片 */}
          <div className="card-gradient p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  欢迎回来，{currentUser.username}！
                </h2>
                <p className="text-gray-600">
                  今天是个运动的好日子，快来预约您喜欢的活动吧！
                </p>
              </div>
              <div className="hidden md:block">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* 标签导航 */}
          <div className="bg-white rounded-xl shadow-lg p-1 mb-8">
            <nav className="flex space-x-1">
              <NavLink
                to="/dashboard/activities"
                className={({ isActive }) => 
                  `flex-1 flex items-center justify-center py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
                    isActive || getActiveTab() === 'activities'
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`
                }
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                场馆预约
              </NavLink>
              <NavLink
                to="/dashboard/bookings"
                className={({ isActive }) => 
                  `flex-1 flex items-center justify-center py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`
                }
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                我的预约
              </NavLink>
              <NavLink
                to="/dashboard/favorites"
                className={({ isActive }) => 
                  `flex-1 flex items-center justify-center py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`
                }
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                我的收藏
              </NavLink>
              <NavLink
                to="/dashboard/history"
                className={({ isActive }) => 
                  `flex-1 flex items-center justify-center py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`
                }
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                活动历史
              </NavLink>
              {/* 管理员标签页 */}
              {isAdmin && (
                <NavLink
                  to="/dashboard/admin"
                  className={({ isActive }) => 
                    `flex-1 flex items-center justify-center py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`
                  }
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  活动管理
                </NavLink>
              )}
              <NavLink
                to="/dashboard/profile"
                className={({ isActive }) => 
                  `flex-1 flex items-center justify-center py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`
                }
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                个人信息
              </NavLink>
            </nav>
          </div>

          {/* 内容区域 - 使用路由 */}
          <div className="mt-6">
            <Routes>
              <Route index element={<ActivityList />} />
              <Route path="activities" element={<ActivityList />} />
              <Route path="activities/:id" element={<ActivityDetail />} />
              <Route path="bookings" element={
                <div className="card p-6">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">我的预约</h2>
                    <p className="text-gray-600 mt-1">查看和管理您的所有预约记录</p>
                  </div>
                  <BookingHistory />
                </div>
              } />
              <Route path="favorites" element={
                <div className="card p-6">
                  <FavoriteList />
                </div>
              } />
              <Route path="history" element={
                <div className="card p-6">
                  <ActivityHistoryList />
                </div>
              } />
              {isAdmin && (
                <Route path="admin" element={
                  <div className="card p-6">
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">活动管理</h2>
                      <p className="text-gray-600 mt-1">管理所有体育活动</p>
                    </div>
                    <AdminActivityManagement />
                  </div>
                } />
              )}
              <Route path="profile" element={
                <div className="card p-6">
                  <Profile user={currentUser} onUserUpdate={handleUserUpdate} />
                </div>
              } />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
}
