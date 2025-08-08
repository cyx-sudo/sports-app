import { useState } from 'react';
import { updateProfile, changePassword } from '../api/auth';
import type { User } from '../../../shared/types';

interface ProfileProps {
  user: User;
  onUserUpdate: (updatedUser: User) => void;
}

export default function Profile({ user, onUserUpdate }: ProfileProps) {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // 编辑资料表单状态
  const [profileForm, setProfileForm] = useState({
    email: user.email || '',
    phone: user.phone || '',
    realName: user.realName || '',
  });

  // 修改密码表单状态
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // 提交编辑资料
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await updateProfile(profileForm);
      if (response.data.success) {
        onUserUpdate(response.data.data);
        setSuccess('个人信息更新成功！');
        setIsEditingProfile(false);
      } else {
        setError(response.data.message || '更新失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 提交密码修改
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('新密码与确认密码不一致');
      setLoading(false);
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setError('新密码长度至少6位');
      setLoading(false);
      return;
    }

    try {
      const response = await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      
      if (response.data.success) {
        setSuccess('密码修改成功！');
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setIsChangingPassword(false);
      } else {
        setError(response.data.message || '密码修改失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '密码修改失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* 成功/错误提示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      {/* 个人信息卡片 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">个人信息</h2>
        
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{user.username}</h3>
              <p className="text-gray-600">{user.role === 'admin' ? '管理员' : '普通用户'}</p>
            </div>
          </div>

          {!isEditingProfile ? (
            // 显示模式
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">用户名</label>
                <div className="text-gray-900 bg-gray-50 rounded-md px-3 py-2">{user.username}</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">邮箱</label>
                <div className="text-gray-900 bg-gray-50 rounded-md px-3 py-2">{user.email || '未设置'}</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">手机号</label>
                <div className="text-gray-900 bg-gray-50 rounded-md px-3 py-2">{user.phone || '未设置'}</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">真实姓名</label>
                <div className="text-gray-900 bg-gray-50 rounded-md px-3 py-2">{user.realName || '未设置'}</div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">角色</label>
                <div className="text-gray-900 bg-gray-50 rounded-md px-3 py-2">
                  {user.role === 'admin' ? '管理员' : '普通用户'}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">注册时间</label>
                <div className="text-gray-900 bg-gray-50 rounded-md px-3 py-2">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '未知'}
                </div>
              </div>
            </div>
          ) : (
            // 编辑模式
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">用户名</label>
                  <div className="text-gray-900 bg-gray-100 rounded-md px-3 py-2">{user.username}</div>
                  <p className="text-xs text-gray-500 mt-1">用户名不可修改</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">邮箱</label>
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="请输入邮箱"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">手机号</label>
                  <input
                    type="tel"
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="请输入手机号"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">真实姓名</label>
                  <input
                    type="text"
                    value={profileForm.realName}
                    onChange={(e) => setProfileForm({ ...profileForm, realName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="请输入真实姓名"
                  />
                </div>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? '保存中...' : '保存'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingProfile(false);
                    setProfileForm({
                      email: user.email || '',
                      phone: user.phone || '',
                      realName: user.realName || '',
                    });
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  取消
                </button>
              </div>
            </form>
          )}

          <div className="pt-6 border-t border-gray-200">
            <h4 className="text-lg font-medium text-gray-900 mb-4">账户操作</h4>
            <div className="space-y-3">
              <button
                onClick={() => setIsChangingPassword(true)}
                className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                修改密码
              </button>
              <button
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className="w-full md:w-auto px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors ml-0 md:ml-3"
              >
                {isEditingProfile ? '取消编辑' : '编辑资料'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 修改密码弹窗 */}
      {isChangingPassword && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">修改密码</h3>
            
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">当前密码</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入当前密码"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">新密码</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入新密码（至少6位）"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">确认新密码</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请再次输入新密码"
                  required
                />
              </div>
              
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? '修改中...' : '确认修改'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsChangingPassword(false);
                    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  }}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
