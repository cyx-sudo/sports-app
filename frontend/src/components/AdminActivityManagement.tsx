import React, { useState, useEffect, useCallback } from 'react';
import {
  getActivityList,
  createActivity,
  updateActivity,
  deleteActivity,
  getActivityCategories,
  getActivityBookings
} from '../api/activity';
import type { Activity, Booking } from '../../../shared/types';

interface ActivityFormData {
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

export default function AdminActivityManagement() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // 搜索筛选状态
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  
  // 表单状态
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [formData, setFormData] = useState<ActivityFormData>({
    name: '',
    description: '',
    location: '',
    capacity: 0,
    startTime: '',
    endTime: '',
    price: 0,
    instructor: '',
    category: ''
  });

  // 详情模态框状态
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  const [activityBookings, setActivityBookings] = useState<Booking[]>([]);

  // 加载活动列表
  const loadActivities = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = { page, limit: 10 };
      
      if (searchKeyword) params.search = searchKeyword;
      if (selectedCategory) params.category = selectedCategory;
      if (selectedStatus) params.status = selectedStatus;
      
      const response = await getActivityList(params);
      
      if (response.data.success && response.data.data) {
        setActivities(response.data.data.items || []);
        setTotalPages(response.data.data.totalPages || 1);
        setCurrentPage(page);
      } else {
        setError(response.data.message || '加载活动列表失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '网络错误');
    } finally {
      setLoading(false);
    }
  }, [searchKeyword, selectedCategory, selectedStatus]);

  // 加载分类列表
  const loadCategories = async () => {
    try {
      const response = await getActivityCategories();
      if (response.data.success) {
        setCategories(response.data.data || []);
      }
    } catch (err) {
      console.error('加载分类失败:', err);
    }
  };

  // 重置表单
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      location: '',
      capacity: 0,
      startTime: '',
      endTime: '',
      price: 0,
      instructor: '',
      category: ''
    });
  };

  // 处理创建活动
  const handleCreateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.description.trim() || !formData.location.trim()) {
      alert('请填写必填字段');
      return;
    }

    if (new Date(formData.startTime) >= new Date(formData.endTime)) {
      alert('结束时间必须晚于开始时间');
      return;
    }

    try {
      const response = await createActivity(formData);
      
      if (response.data.success) {
        alert('活动创建成功！');
        setShowCreateForm(false);
        resetForm();
        loadActivities(currentPage);
      } else {
        alert(response.data.message || '创建活动失败');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : '创建活动失败');
    }
  };

  // 处理编辑活动
  const handleEditActivity = (activity: Activity) => {
    setEditingActivity(activity);
    setFormData({
      name: activity.name || activity.title || '',
      description: activity.description || '',
      location: activity.location || '',
      capacity: activity.capacity || activity.maxParticipants || 0,
      startTime: activity.startTime ? activity.startTime.slice(0, 16) : '',
      endTime: activity.endTime ? activity.endTime.slice(0, 16) : '',
      price: activity.price || 0,
      instructor: activity.instructor || '',
      category: activity.category || ''
    });
    setShowEditForm(true);
  };

  // 处理更新活动
  const handleUpdateActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingActivity) return;

    if (!formData.name.trim() || !formData.description.trim() || !formData.location.trim()) {
      alert('请填写必填字段');
      return;
    }

    if (new Date(formData.startTime) >= new Date(formData.endTime)) {
      alert('结束时间必须晚于开始时间');
      return;
    }

    try {
      const response = await updateActivity(editingActivity.id, formData);
      
      if (response.data.success) {
        alert('活动更新成功！');
        setShowEditForm(false);
        setEditingActivity(null);
        resetForm();
        loadActivities(currentPage);
      } else {
        alert(response.data.message || '更新活动失败');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : '更新活动失败');
    }
  };

  // 处理删除活动
  const handleDeleteActivity = async (activity: Activity) => {
    if (!confirm(`确定要删除活动"${activity.name || activity.title}"吗？`)) {
      return;
    }

    try {
      const response = await deleteActivity(activity.id);
      
      if (response.data.success) {
        alert('活动删除成功！');
        loadActivities(currentPage);
      } else {
        alert(response.data.message || '删除活动失败');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : '删除活动失败');
    }
  };

  // 查看活动详情和预约情况
  const handleViewDetail = async (activity: Activity) => {
    setSelectedActivity(activity);
    setShowDetailModal(true);
    
    try {
      const response = await getActivityBookings(activity.id, { page: 1, limit: 50 });
      if (response.data.success) {
        setActivityBookings(response.data.data?.items || []);
      }
    } catch (err) {
      console.error('加载预约信息失败:', err);
    }
  };

  // 处理状态切换
  const handleStatusToggle = async (activity: Activity) => {
    const newStatus = activity.status === 'active' ? 'inactive' : 'active';
    
    try {
      const response = await updateActivity(activity.id, { status: newStatus });
      
      if (response.data.success) {
        alert(`活动已${newStatus === 'active' ? '激活' : '停用'}`);
        loadActivities(currentPage);
      } else {
        alert(response.data.message || '状态更新失败');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : '状态更新失败');
    }
  };

  // 处理搜索
  const handleSearch = () => {
    loadActivities(1);
  };

  // 处理分页
  const handlePageChange = (page: number) => {
    loadActivities(page);
  };

  // 格式化日期时间
  const formatDateTime = (dateTimeStr: string) => {
    if (!dateTimeStr) return '';
    return new Date(dateTimeStr).toLocaleString('zh-CN');
  };

  // 获取状态标签样式
  const getStatusBadge = (status: string) => {
    const baseClasses = 'px-2 py-1 text-xs rounded-full';
    switch (status) {
      case 'active':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'inactive':
        return `${baseClasses} bg-gray-100 text-gray-800`;
      case 'cancelled':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-blue-100 text-blue-800`;
    }
  };

  useEffect(() => {
    loadActivities();
    loadCategories();
  }, [loadActivities]);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow">
        {/* 页面标题 */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">活动管理</h1>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
            >
              创建活动
            </button>
          </div>
        </div>

        {/* 搜索和筛选区域 */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <input
                type="text"
                placeholder="搜索活动名称、描述或教练"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">所有分类</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">所有状态</option>
                <option value="active">激活</option>
                <option value="inactive">停用</option>
                <option value="cancelled">已取消</option>
              </select>
            </div>
            <div>
              <button
                onClick={handleSearch}
                className="w-full bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
              >
                搜索
              </button>
            </div>
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* 活动列表 */}
        <div className="px-6 py-4">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-lg text-gray-600">加载中...</div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        活动信息
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        时间地点
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        容量/价格
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        状态
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {activities.map((activity) => (
                      <tr key={activity.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="font-medium text-gray-900">
                              {activity.name || activity.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {activity.category} · {activity.instructor}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDateTime(activity.startTime)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {activity.location}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {activity.currentParticipants || 0}/{activity.capacity || activity.maxParticipants}人
                          </div>
                          <div className="text-sm text-gray-500">
                            ¥{activity.price || 0}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={getStatusBadge(activity.status || 'active')}>
                            {activity.status === 'active' ? '激活' : 
                             activity.status === 'inactive' ? '停用' : 
                             activity.status === 'cancelled' ? '已取消' : '未知'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => handleViewDetail(activity)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            详情
                          </button>
                          <button
                            onClick={() => handleEditActivity(activity)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            编辑
                          </button>
                          <button
                            onClick={() => handleStatusToggle(activity)}
                            className="text-yellow-600 hover:text-yellow-900"
                          >
                            {activity.status === 'active' ? '停用' : '激活'}
                          </button>
                          <button
                            onClick={() => handleDeleteActivity(activity)}
                            className="text-red-600 hover:text-red-900"
                          >
                            删除
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 空状态 */}
              {activities.length === 0 && !loading && (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-lg">暂无活动</div>
                  <div className="text-gray-500 text-sm mt-2">
                    点击"创建活动"按钮添加第一个活动
                  </div>
                </div>
              )}

              {/* 分页 */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-6">
                  <div className="flex space-x-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-2 rounded ${
                          currentPage === page
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* 创建活动模态框 */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">创建活动</h3>
              <form onSubmit={handleCreateActivity} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      活动名称 *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      活动分类 *
                    </label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">选择分类</option>
                      <option value="篮球">篮球</option>
                      <option value="羽毛球">羽毛球</option>
                      <option value="乒乓球">乒乓球</option>
                      <option value="网球">网球</option>
                      <option value="游泳">游泳</option>
                      <option value="健身">健身</option>
                      <option value="瑜伽">瑜伽</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    活动描述 *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      活动地点 *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      指导老师
                    </label>
                    <input
                      type="text"
                      value={formData.instructor}
                      onChange={(e) => setFormData({...formData, instructor: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      开始时间 *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.startTime}
                      onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      结束时间 *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.endTime}
                      onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      容量 *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.capacity}
                      onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      价格 (元)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    创建活动
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 编辑活动模态框 */}
      {showEditForm && editingActivity && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                编辑活动 - {editingActivity.name || editingActivity.title}
              </h3>
              <form onSubmit={handleUpdateActivity} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      活动名称 *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      活动分类 *
                    </label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">选择分类</option>
                      <option value="篮球">篮球</option>
                      <option value="羽毛球">羽毛球</option>
                      <option value="乒乓球">乒乓球</option>
                      <option value="网球">网球</option>
                      <option value="游泳">游泳</option>
                      <option value="健身">健身</option>
                      <option value="瑜伽">瑜伽</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    活动描述 *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      活动地点 *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      指导老师
                    </label>
                    <input
                      type="text"
                      value={formData.instructor}
                      onChange={(e) => setFormData({...formData, instructor: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      开始时间 *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.startTime}
                      onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      结束时间 *
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.endTime}
                      onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      容量 *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.capacity}
                      onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      价格 (元)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditForm(false);
                      setEditingActivity(null);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    更新活动
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* 活动详情模态框 */}
      {showDetailModal && selectedActivity && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-4/5 lg:w-3/4 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  活动详情 - {selectedActivity.name || selectedActivity.title}
                </h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 活动信息 */}
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-3">基本信息</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">分类：</span>{selectedActivity.category}</div>
                    <div><span className="font-medium">地点：</span>{selectedActivity.location}</div>
                    <div><span className="font-medium">指导老师：</span>{selectedActivity.instructor || '未指定'}</div>
                    <div><span className="font-medium">价格：</span>¥{selectedActivity.price || 0}</div>
                    <div><span className="font-medium">容量：</span>{selectedActivity.currentParticipants || 0}/{selectedActivity.capacity || selectedActivity.maxParticipants}人</div>
                    <div><span className="font-medium">开始时间：</span>{formatDateTime(selectedActivity.startTime)}</div>
                    <div><span className="font-medium">结束时间：</span>{formatDateTime(selectedActivity.endTime)}</div>
                    <div><span className="font-medium">状态：</span>
                      <span className={getStatusBadge(selectedActivity.status || 'active')}>
                        {selectedActivity.status === 'active' ? '激活' : 
                         selectedActivity.status === 'inactive' ? '停用' : 
                         selectedActivity.status === 'cancelled' ? '已取消' : '未知'}
                      </span>
                    </div>
                  </div>
                  
                  <h4 className="text-md font-semibold text-gray-900 mt-4 mb-3">活动描述</h4>
                  <p className="text-sm text-gray-600">{selectedActivity.description}</p>
                </div>

                {/* 预约列表 */}
                <div>
                  <h4 className="text-md font-semibold text-gray-900 mb-3">
                    预约列表 ({activityBookings.length}人)
                  </h4>
                  <div className="max-h-96 overflow-y-auto">
                    {activityBookings.length > 0 ? (
                      <div className="space-y-2">
                        {activityBookings.map((booking) => (
                          <div key={booking.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <div>
                              <div className="font-medium text-sm">
                                {booking.user?.realName || booking.user?.username || '未知用户'}
                              </div>
                              <div className="text-xs text-gray-500">
                                {booking.user?.email} · {booking.user?.phone}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-gray-500">
                                {formatDateTime(booking.createdAt)}
                              </div>
                              <div className={`text-xs px-2 py-1 rounded ${
                                booking.status === 'active' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {booking.status === 'active' ? '已预约' : '已取消'}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 py-8">
                        暂无预约
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
