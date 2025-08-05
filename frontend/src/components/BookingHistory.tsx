import { useState, useEffect } from 'react';
import { getMyBookings, cancelBooking } from '../api/booking';
import type { Booking } from '../../../shared/types';

export default function BookingHistory() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  // 加载预约列表
  const loadBookings = async (page = 1, status = '') => {
    try {
      setLoading(true);
      const response = await getMyBookings({
        page,
        limit: 10,
        status: status || undefined
      });
      
      if (response.data.success && response.data.data) {
        setBookings(response.data.data.items);
        setTotalPages(response.data.data.totalPages);
        setCurrentPage(page);
      } else {
        setError(response.data.message || '加载预约列表失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '网络错误');
    } finally {
      setLoading(false);
    }
  };

  // 处理取消预约
  const handleCancelBooking = async (bookingId: number) => {
    if (!confirm('确定要取消这个预约吗？')) {
      return;
    }

    try {
      await cancelBooking(bookingId);
      alert('预约已取消');
      // 重新加载列表
      loadBookings(currentPage, statusFilter);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '取消预约失败';
      alert(errorMessage);
    }
  };

  // 处理状态筛选
  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
    loadBookings(1, status);
  };

  // 处理分页
  const handlePageChange = (page: number) => {
    loadBookings(page, statusFilter);
  };

  useEffect(() => {
    loadBookings();
  }, []);

  if (loading && bookings.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">加载中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
                      {booking.activity?.title || '活动名称'}
                    </h3>
                    <span className={`ml-3 px-2 py-1 text-xs rounded-full ${
                      booking.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {booking.status === 'active' ? '有效' : '已取消'}
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
                      预约时间：{new Date(booking.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="mt-4 md:mt-0 md:ml-6">
                  {booking.status === 'active' && (
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
