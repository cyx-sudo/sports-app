import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getMyActivityHistory, 
  getMyActivityStats, 
  deleteActivityHistory 
} from '../api/activity-history';
import type { ActivityHistory, ActivityHistoryStats } from '../api/activity-history';

export default function ActivityHistoryList() {
  const navigate = useNavigate();
  const [histories, setHistories] = useState<ActivityHistory[]>([]);
  const [stats, setStats] = useState<ActivityHistoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // 加载活动历史列表
  const loadHistories = async (page = 1, status = '', from = '', to = '') => {
    try {
      setLoading(true);
      const response = await getMyActivityHistory({
        page,
        limit: 12,
        status: status || undefined,
        dateFrom: from || undefined,
        dateTo: to || undefined,
      });
      
      if (response.data.success && response.data.data) {
        setHistories(response.data.data.histories);
        setTotalPages(response.data.data.totalPages);
        setCurrentPage(page);
        setError('');
      } else {
        setError(response.data.message || '加载活动历史失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '网络错误');
    } finally {
      setLoading(false);
    }
  };

  // 加载活动统计
  const loadStats = async () => {
    try {
      const response = await getMyActivityStats();
      if (response.data.success && response.data.data) {
        setStats(response.data.data);
      }
    } catch (err) {
      console.error('加载统计数据失败:', err);
    }
  };

  // 删除历史记录
  const handleDeleteHistory = async (id: number) => {
    if (!confirm('确定要删除这条活动历史记录吗？')) {
      return;
    }

    try {
      const response = await deleteActivityHistory(id);
      if (response.data.success) {
        // 重新加载当前页
        loadHistories(currentPage, selectedStatus, dateFrom, dateTo);
        loadStats(); // 重新加载统计
        alert('删除成功');
      } else {
        alert(response.data.message || '删除失败');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : '网络错误');
    }
  };

  // 处理筛选
  const handleFilter = () => {
    loadHistories(1, selectedStatus, dateFrom, dateTo);
  };

  // 重置筛选
  const handleResetFilter = () => {
    setSelectedStatus('');
    setDateFrom('');
    setDateTo('');
    loadHistories(1, '', '', '');
  };

  // 分页处理
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      loadHistories(page, selectedStatus, dateFrom, dateTo);
    }
  };

  // 获取状态标签样式
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // 获取状态中文名
  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return '已完成';
      case 'cancelled':
        return '已取消';
      default:
        return status;
    }
  };

  useEffect(() => {
    loadHistories();
    loadStats();
  }, []);

  if (loading && histories.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">加载中...</div>
      </div>
    );
  }

  return (
    <div>
      {/* 标题和统计 */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">活动历史记录</h3>
        
        {/* 统计卡片 */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.totalActivities}</div>
              <div className="text-sm text-blue-600">总活动数</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.completedActivities}</div>
              <div className="text-sm text-green-600">已完成</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{stats.cancelledActivities}</div>
              <div className="text-sm text-red-600">已取消</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">{stats.noShowActivities}</div>
              <div className="text-sm text-gray-600">缺席</div>
            </div>
          </div>
        )}

        {/* 筛选条件 */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">状态筛选</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">全部状态</option>
                <option value="completed">已完成</option>
                <option value="cancelled">已取消</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">开始日期</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">结束日期</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={handleFilter}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                筛选
              </button>
              <button
                onClick={handleResetFilter}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                重置
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* 历史记录列表 */}
      <div className="space-y-4">
        {histories.map((history) => (
          <div key={history.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-900 mb-1">
                    {history.activity.name}
                  </h4>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <span className="w-4 h-4 mr-1">📍</span>
                      {history.activity.location}
                    </span>
                    <span className="flex items-center">
                      <span className="w-4 h-4 mr-1">👨‍🏫</span>
                      {history.activity.instructor}
                    </span>
                    <span className="flex items-center">
                      <span className="w-4 h-4 mr-1">🏷️</span>
                      {history.activity.category}
                    </span>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(history.status)}`}>
                  {getStatusText(history.status)}
                </span>
              </div>
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {history.activity.description}
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-500 mb-4">
                <div>
                  <span className="font-medium">活动时间:</span>
                  <br />
                  {new Date(history.activity.startTime).toLocaleDateString()} {new Date(history.activity.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
                <div>
                  <span className="font-medium">预约时间:</span>
                  <br />
                  {new Date(history.booking.bookingTime).toLocaleDateString()} {new Date(history.booking.bookingTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
                <div>
                  <span className="font-medium">费用:</span>
                  <br />
                  ¥{history.activity.price}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/dashboard/activities/${history.activity.id}`)}
                  className="px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                >
                  查看活动
                </button>
                <button
                  onClick={() => handleDeleteHistory(history.id)}
                  className="px-3 py-2 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100"
                >
                  删除记录
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 空状态 */}
      {histories.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg">暂无活动历史记录</div>
          <div className="text-gray-500 text-sm mt-2">参与活动后会在这里显示记录</div>
          <button 
            onClick={() => navigate('/dashboard/activities')}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            浏览活动
          </button>
        </div>
      )}

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2 mt-6">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className={`px-3 py-2 rounded ${
              currentPage <= 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
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
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            下一页
          </button>
        </div>
      )}
    </div>
  );
}
