import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyFavorites, removeFavorite } from '../api/favorite';
import type { Favorite } from '../api/favorite';

export default function FavoriteList() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // 加载收藏列表
  const loadFavorites = async (page = 1) => {
    try {
      setLoading(true);
      const response = await getMyFavorites({
        page,
        limit: 12,
      });
      
      if (response.data.success && response.data.data) {
        setFavorites(response.data.data.favorites);
        setTotalPages(response.data.data.totalPages);
        setCurrentPage(page);
        setError('');
      } else {
        setError(response.data.message || '加载收藏列表失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '网络错误');
    } finally {
      setLoading(false);
    }
  };

  // 取消收藏
  const handleRemoveFavorite = async (activityId: number) => {
    try {
      const response = await removeFavorite(activityId);
      if (response.data.success) {
        // 重新加载当前页
        loadFavorites(currentPage);
        alert('取消收藏成功');
      } else {
        alert(response.data.message || '取消收藏失败');
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : '网络错误');
    }
  };

  // 分页处理
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      loadFavorites(page);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  return (
    <div>
      {/* 标题 */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">我的收藏</h3>
        <p className="text-gray-600 text-sm mt-1">管理您收藏的活动</p>
      </div>

      {/* 活动列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {favorites.map((favorite) => (
          <div key={favorite.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex justify-between items-start mb-3">
                <h4 className="text-lg font-semibold text-gray-900 line-clamp-2">
                  {favorite.activity.name}
                </h4>
                <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded text-xs font-medium">
                  {favorite.activity.category}
                </span>
              </div>
              
              <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                {favorite.activity.description}
              </p>
              
              <div className="space-y-2 text-sm text-gray-500">
                <div className="flex items-center">
                  <span className="w-4 h-4 mr-2">📍</span>
                  {favorite.activity.location}
                </div>
                <div className="flex items-center">
                  <span className="w-4 h-4 mr-2">⏰</span>
                  {new Date(favorite.activity.startTime).toLocaleDateString()} {new Date(favorite.activity.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
                <div className="flex items-center">
                  <span className="w-4 h-4 mr-2">👥</span>
                  {favorite.activity.currentParticipants}/{favorite.activity.capacity} 人
                </div>
                <div className="flex items-center">
                  <span className="w-4 h-4 mr-2">❤️</span>
                  收藏于 {new Date(favorite.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => navigate(`/dashboard/activities/${favorite.activity.id}`)}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
                >
                  查看详情
                </button>
                <button
                  onClick={() => handleRemoveFavorite(favorite.activity.id)}
                  className="px-3 py-2 text-sm bg-red-50 text-red-600 rounded hover:bg-red-100"
                >
                  取消收藏
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 空状态 */}
      {favorites.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg">暂无收藏的活动</div>
          <div className="text-gray-500 text-sm mt-2">去活动列表看看有什么感兴趣的活动吧</div>
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
