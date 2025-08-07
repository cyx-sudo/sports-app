import { useState, useEffect } from 'react';
import { getActivityList, getActivityCategories, bookActivity } from '../api/activity';
import type { Activity } from '../../../shared/types';

interface ActivityListProps {
  onActivitySelect?: (activity: Activity) => void;
}

export default function ActivityList({ onActivitySelect }: ActivityListProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');

  // 加载活动列表
  const loadActivities = async (page = 1, category = '', search = '') => {
    try {
      setLoading(true);
      const response = await getActivityList({
        page,
        limit: 12,
        category: category || undefined,
        search: search || undefined,
        status: 'active'
      });
      
      if (response.data.success && response.data.data) {
        setActivities(response.data.data.items);
        setTotalPages(response.data.data.totalPages);
        setCurrentPage(page);
      } else {
        setError(response.data.message || '加载活动列表失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '网络错误');
    } finally {
      setLoading(false);
    }
  };

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

  // 处理预约
  const handleBookActivity = async (activityId: number) => {
    try {
      await bookActivity(activityId, { activityId });
      alert('预约成功！');
      // 重新加载活动列表以更新参与人数
      loadActivities(currentPage, selectedCategory, searchKeyword);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '预约失败';
      alert(errorMessage);
    }
  };

  // 处理分类筛选
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    loadActivities(1, category, searchKeyword);
  };

  // 处理搜索
  const handleSearch = () => {
    loadActivities(1, selectedCategory, searchKeyword);
  };

  // 处理分页
  const handlePageChange = (page: number) => {
    loadActivities(page, selectedCategory, searchKeyword);
  };

  useEffect(() => {
    loadActivities();
    loadCategories();
  }, []);

  if (loading && activities.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">加载中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 搜索和筛选 */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col md:flex-row gap-4">
          {/* 搜索框 */}
          <div className="flex-1">
            <div className="flex">
              <input
                type="text"
                placeholder="搜索活动名称或描述..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                搜索
              </button>
            </div>
          </div>

          {/* 分类筛选 */}
          <div className="md:w-48">
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">所有分类</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* 活动列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {activities.map((activity) => (
          <div key={activity.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                  {activity.title}
                </h3>
                <span className="text-sm bg-indigo-100 text-indigo-800 px-2 py-1 rounded">
                  {activity.category}
                </span>
              </div>
              
              <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                {activity.description}
              </p>
              
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center">
                  <span className="w-4 h-4 mr-2">📍</span>
                  {activity.location}
                </div>
                <div className="flex items-center">
                  <span className="w-4 h-4 mr-2">⏰</span>
                  {new Date(activity.startTime).toLocaleDateString()} {new Date(activity.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
                <div className="flex items-center">
                  <span className="w-4 h-4 mr-2">👥</span>
                  {activity.currentParticipants}/{activity.maxParticipants} 人
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => onActivitySelect?.(activity)}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                >
                  查看详情
                </button>
                <button
                  onClick={() => handleBookActivity(activity.id)}
                  disabled={activity.currentParticipants >= (activity.capacity || activity.maxParticipants || 0)}
                  className={`flex-1 px-3 py-2 text-sm rounded ${
                    activity.currentParticipants >= (activity.capacity || activity.maxParticipants || 0)
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {activity.currentParticipants >= (activity.capacity || activity.maxParticipants || 0) ? '已满' : '立即预约'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 空状态 */}
      {activities.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg">暂无活动</div>
          <div className="text-gray-500 text-sm mt-2">请尝试调整搜索条件</div>
        </div>
      )}

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className={`px-3 py-2 rounded ${
              currentPage <= 1
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            上一页
          </button>
          
          <span className="px-3 py-2 text-gray-700">
            第 {currentPage} 页，共 {totalPages} 页
          </span>
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className={`px-3 py-2 rounded ${
              currentPage >= totalPages
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            下一页
          </button>
        </div>
      )}
    </div>
  );
}
