import { useState, useEffect, useCallback } from 'react';
import { getMyBookings, cancelBooking } from '../api/booking';
import type { Booking } from '../../../shared/types';

export default function BookingHistory() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // 获取预约列表
  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {
        page: currentPage,
        limit: 10,
        ...(statusFilter && { status: statusFilter })
      };

      const response = await getMyBookings(params);
      
      if (response.data.success) {
        const data = response.data.data as { 
          bookings?: Booking[]; 
          items?: Booking[]; 
          totalPages?: number; 
          total?: number; 
        };
        if (data) {
          // 后端返回 bookings 数组而不是 items
          setBookings(data.bookings || data.items || []);
          setTotalPages(data.totalPages || Math.ceil((data.total || 0) / 10));
        }
      } else {
        setError(response.data.message || '获取预约列表失败');
      }
    } catch (err) {
      console.error('获取预约列表错误:', err);
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter]);

  // 取消预约
  const handleCancelBooking = async (bookingId: number) => {
    if (!confirm('确定要取消这个预约吗？')) return;

    try {
      const response = await cancelBooking(bookingId);
      if (response.data.success) {
        // 重新获取列表
        fetchBookings();
      } else {
        setError(response.data.message || '取消预约失败');
      }
    } catch (err) {
      console.error('取消预约错误:', err);
      setError('取消预约失败，请稍后重试');
    }
  };

  // 状态筛选
  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1); // 重置到第一页
  };

  // 页面切换
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // 初始加载和状态/页面变化时重新获取数据
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  if (loading && bookings.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">我的预约</h3>

      {/* 筛选器 */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">预约状态：</span>
          <div className="flex space-x-2">
            <button
              onClick={() => handleStatusChange('')}
              className={`px-3 py-1 text-sm rounded ${
                statusFilter === ''
                  ? 'bg-indigo-100 text-indigo-800'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              全部
            </button>
            <button
              onClick={() => handleStatusChange('active')}
              className={`px-3 py-1 text-sm rounded ${
                statusFilter === 'active'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              有效
            </button>
            <button
              onClick={() => handleStatusChange('cancelled')}
              className={`px-3 py-1 text-sm rounded ${
                statusFilter === 'cancelled'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              已取消
            </button>
          </div>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* 预约列表 */}
      <div className="space-y-4">
        {bookings.map((booking) => (
          <div key={booking.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {booking.activity?.title || booking.activity?.name || '活动名称'}
                    </h3>
                    <span className={`ml-3 px-2 py-1 text-xs rounded-full ${
                      (booking.status as string) === 'cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {(booking.status as string) === 'cancelled' ? '已取消' : '有效'}
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center">
                      <span className="w-4 h-4 mr-2">📍</span>
                      {booking.activity?.location || '地点信息'}
                    </div>
                    <div className="flex items-center">
                      <span className="w-4 h-4 mr-2">⏰</span>
                      {booking.activity?.startTime ? 
                        `${new Date(booking.activity.startTime).toLocaleString()}` : 
                        '时间信息'
                      }
                    </div>
                    <div className="flex items-center">
                      <span className="w-4 h-4 mr-2">📅</span>
                      预约时间：{new Date((booking as Booking & { bookingTime?: string }).bookingTime || booking.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="mt-4 md:mt-0 md:ml-6">
                  {(booking.status as string) !== 'cancelled' && (
                    <button
                      onClick={() => handleCancelBooking(booking.id)}
                      className="px-4 py-2 text-sm border border-red-300 text-red-700 rounded hover:bg-red-50"
                    >
                      取消预约
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 空状态 */}
      {bookings.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg">暂无预约记录</div>
          <div className="text-gray-500 text-sm mt-2">去活动列表看看有什么感兴趣的活动吧</div>
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
