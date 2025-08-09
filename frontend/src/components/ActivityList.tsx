import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getActivityList, getActivityCategories, bookActivity } from '../api/activity';
import { addFavorite, removeFavorite, checkFavorite } from '../api/favorite';
import { checkUserBooking, cancelBooking } from '../api/booking';
import type { Activity } from '../../../shared/types';

export default function ActivityList() {
  const navigate = useNavigate();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [favoriteStates, setFavoriteStates] = useState<Record<number, boolean>>({});
  const [bookingStates, setBookingStates] = useState<Record<number, { isBooked: boolean; bookingId?: number }>>({});
  const [bookingLoading, setBookingLoading] = useState<Record<number, boolean>>({});

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
        // 只显示未开始的活动
        const now = new Date();
        const upcomingActivities = response.data.data.items.filter((activity: Activity) => {
          return new Date(activity.startTime) > now;
        });
        
        setActivities(upcomingActivities);
        setTotalPages(response.data.data.totalPages);
        setCurrentPage(page);
        setError(''); // 清除错误信息
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
    if (bookingLoading[activityId]) return;
    
    setBookingLoading(prev => ({ ...prev, [activityId]: true }));
    try {
      await bookActivity(activityId, { activityId });
      alert('预约成功！');
      // 重新加载活动列表以更新参与人数
      loadActivities(currentPage, selectedCategory, searchKeyword);
      // 更新预约状态
      loadBookingStates([activityId]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '预约失败';
      alert(errorMessage);
    } finally {
      setBookingLoading(prev => ({ ...prev, [activityId]: false }));
    }
  };

  // 处理取消预约
  const handleCancelBooking = async (activityId: number) => {
    console.log('ActivityList: 尝试取消预约, activityId:', activityId);
    const bookingState = bookingStates[activityId];
    console.log('ActivityList: bookingState:', bookingState);
    
    if (!bookingState?.isBooked || !bookingState.bookingId || bookingLoading[activityId]) {
      console.log('ActivityList: 取消预约条件不满足');
      return;
    }
    
    if (!confirm('确定要取消预约吗？')) return;
    
    setBookingLoading(prev => ({ ...prev, [activityId]: true }));
    try {
      console.log('ActivityList: 开始调用取消预约API, bookingId:', bookingState.bookingId);
      await cancelBooking(bookingState.bookingId);
      alert('取消预约成功！');
      // 重新加载活动列表以更新参与人数
      loadActivities(currentPage, selectedCategory, searchKeyword);
      // 更新预约状态
      loadBookingStates([activityId]);
    } catch (err) {
      console.error('ActivityList: 取消预约错误:', err);
      const errorMessage = err instanceof Error ? err.message : '取消预约失败';
      alert(errorMessage);
    } finally {
      setBookingLoading(prev => ({ ...prev, [activityId]: false }));
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

  // 加载收藏状态
  const loadFavoriteStates = async (activityIds: number[]) => {
    try {
      const states: Record<number, boolean> = {};
      for (const id of activityIds) {
        try {
          const response = await checkFavorite(id);
          if (response.data.success) {
            states[id] = response.data.data?.isFavorited || false;
          }
        } catch {
          states[id] = false;
        }
      }
      setFavoriteStates(states);
    } catch (err) {
      console.error('加载收藏状态失败:', err);
    }
  };

  // 加载预约状态
  const loadBookingStates = async (activityIds: number[]) => {
    try {
      const states: Record<number, { isBooked: boolean; bookingId?: number }> = {};
      for (const id of activityIds) {
        try {
          const response = await checkUserBooking(id);
          if (response.data.success) {
            states[id] = response.data.data || { isBooked: false };
          }
        } catch {
          states[id] = { isBooked: false };
        }
      }
      setBookingStates(states);
    } catch (err) {
      console.error('加载预约状态失败:', err);
    }
  };

  // 切换收藏状态
  const handleToggleFavorite = async (activityId: number) => {
    try {
      const isFavorited = favoriteStates[activityId];
      
      if (isFavorited) {
        const response = await removeFavorite(activityId);
        if (response.data.success) {
          setFavoriteStates(prev => ({ ...prev, [activityId]: false }));
        } else {
          alert(response.data.message || '取消收藏失败');
        }
      } else {
        const response = await addFavorite(activityId);
        if (response.data.success) {
          setFavoriteStates(prev => ({ ...prev, [activityId]: true }));
        } else {
          alert(response.data.message || '收藏失败');
        }
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : '网络错误');
    }
  };

  useEffect(() => {
    loadActivities();
    loadCategories();
  }, []);

  // 当活动列表更新时，加载收藏状态和预约状态
  useEffect(() => {
    if (activities.length > 0) {
      const activityIds = activities.map(activity => activity.id);
      loadFavoriteStates(activityIds);
      loadBookingStates(activityIds);
    }
  }, [activities]);

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
                  {activity.name || activity.title}
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
                  {activity.currentParticipants}/{activity.capacity || activity.maxParticipants} 人
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => navigate(`/dashboard/activities/${activity.id}`)}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                >
                  查看详情
                </button>
                <button
                  onClick={() => handleToggleFavorite(activity.id)}
                  className={`px-3 py-2 text-sm rounded ${
                    favoriteStates[activity.id]
                      ? 'bg-red-50 text-red-600 hover:bg-red-100'
                      : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                  title={favoriteStates[activity.id] ? '取消收藏' : '收藏'}
                >
                  {favoriteStates[activity.id] ? '❤️' : '🤍'}
                </button>
                {/* 预约/取消按钮 */}
                {bookingStates[activity.id]?.isBooked ? (
                  <button
                    onClick={() => handleCancelBooking(activity.id)}
                    disabled={bookingLoading[activity.id]}
                    className={`flex-1 px-3 py-2 text-sm rounded ${
                      bookingLoading[activity.id]
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                  >
                    {bookingLoading[activity.id] ? '处理中...' : '取消预约'}
                  </button>
                ) : (
                  <button
                    onClick={() => handleBookActivity(activity.id)}
                    disabled={
                      activity.currentParticipants >= (activity.capacity || activity.maxParticipants || 0) ||
                      bookingLoading[activity.id]
                    }
                    className={`flex-1 px-3 py-2 text-sm rounded ${
                      activity.currentParticipants >= (activity.capacity || activity.maxParticipants || 0) ||
                      bookingLoading[activity.id]
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {bookingLoading[activity.id] 
                      ? '处理中...' 
                      : activity.currentParticipants >= (activity.capacity || activity.maxParticipants || 0) 
                      ? '已满' 
                      : '立即预约'
                    }
                  </button>
                )}
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
