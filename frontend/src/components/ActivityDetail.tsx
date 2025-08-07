import { useState, useEffect, useCallback } from 'react';
import { getActivityDetail, bookActivity } from '../api/activity';
import ActivityComments from './ActivityComments';
import type { Activity } from '../../../shared/types';

interface ActivityDetailProps {
  activityId: number;
  onBack: () => void;
}

export default function ActivityDetail({ activityId, onBack }: ActivityDetailProps) {
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  // 加载活动详情
  const loadActivityDetail = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getActivityDetail(activityId);
      
      if (response.data.success && response.data.data) {
        setActivity(response.data.data);
      } else {
        setError(response.data.message || '加载活动详情失败');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '网络错误');
    } finally {
      setLoading(false);
    }
  }, [activityId]);

  // 处理预约
  const handleBookActivity = async () => {
    if (!activity) return;
    
    try {
      setBookingLoading(true);
      await bookActivity(activity.id, { activityId: activity.id });
      alert('预约成功！');
      // 重新加载活动详情以更新参与人数
      loadActivityDetail();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '预约失败';
      alert(errorMessage);
    } finally {
      setBookingLoading(false);
    }
  };

  useEffect(() => {
    loadActivityDetail();
  }, [loadActivityDetail]);

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
        <button 
          onClick={onBack}
          className="ml-4 text-indigo-600 hover:text-indigo-500"
        >
          返回列表
        </button>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-lg">活动不存在</div>
        <button 
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          返回列表
        </button>
      </div>
    );
  }

  const isFullyBooked = activity.currentParticipants >= (activity.capacity || activity.maxParticipants || 0);
  const startTime = new Date(activity.startTime);
  const endTime = new Date(activity.endTime);

  return (
    <div className="max-w-4xl mx-auto">
      {/* 头部导航 */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center text-indigo-600 hover:text-indigo-500"
        >
          <span className="mr-2">←</span>
          返回活动列表
        </button>
      </div>

      {/* 活动详情卡片 */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* 头部信息 */}
        <div className="px-6 py-8 border-b">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <h1 className="text-3xl font-bold text-gray-900 mr-4">
                  {activity.title}
                </h1>
                {activity.category && (
                  <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                    {activity.category}
                  </span>
                )}
              </div>
              <p className="text-gray-600 text-lg leading-relaxed">
                {activity.description}
              </p>
            </div>
            
            <div className="mt-6 md:mt-0 md:ml-6">
              <button
                onClick={handleBookActivity}
                disabled={isFullyBooked || bookingLoading}
                className={`w-full md:w-auto px-8 py-3 text-lg font-medium rounded-lg ${
                  isFullyBooked
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : bookingLoading
                    ? 'bg-indigo-400 text-white cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {bookingLoading ? '预约中...' : isFullyBooked ? '名额已满' : '立即预约'}
              </button>
            </div>
          </div>
        </div>

        {/* 详细信息 */}
        <div className="px-6 py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 基本信息 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">基本信息</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="w-6 h-6 mr-3 text-gray-400">📍</span>
                  <div>
                    <span className="text-sm text-gray-500">活动地点</span>
                    <div className="text-gray-900">{activity.location}</div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <span className="w-6 h-6 mr-3 text-gray-400">👥</span>
                  <div>
                    <span className="text-sm text-gray-500">参与人数</span>
                    <div className="text-gray-900">
                      {activity.currentParticipants} / {activity.maxParticipants} 人
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className="bg-indigo-600 h-2 rounded-full"
                          style={{
                            width: `${(activity.currentParticipants / (activity.capacity || activity.maxParticipants || 1)) * 100}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {activity.instructor && (
                  <div className="flex items-center">
                    <span className="w-6 h-6 mr-3 text-gray-400">👨‍🏫</span>
                    <div>
                      <span className="text-sm text-gray-500">指导老师</span>
                      <div className="text-gray-900">{activity.instructor}</div>
                    </div>
                  </div>
                )}

                {activity.price && (
                  <div className="flex items-center">
                    <span className="w-6 h-6 mr-3 text-gray-400">💰</span>
                    <div>
                      <span className="text-sm text-gray-500">活动费用</span>
                      <div className="text-gray-900">¥{activity.price}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 时间信息 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">时间安排</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="w-6 h-6 mr-3 text-gray-400">📅</span>
                  <div>
                    <span className="text-sm text-gray-500">活动日期</span>
                    <div className="text-gray-900">
                      {startTime.toLocaleDateString('zh-CN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        weekday: 'long'
                      })}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <span className="w-6 h-6 mr-3 text-gray-400">⏰</span>
                  <div>
                    <span className="text-sm text-gray-500">活动时间</span>
                    <div className="text-gray-900">
                      {startTime.toLocaleTimeString('zh-CN', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })} - {endTime.toLocaleTimeString('zh-CN', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <span className="w-6 h-6 mr-3 text-gray-400">⏱️</span>
                  <div>
                    <span className="text-sm text-gray-500">活动时长</span>
                    <div className="text-gray-900">
                      {Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60))} 分钟
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 注意事项 */}
        <div className="px-6 py-6 bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">注意事项</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div>• 请按时参加活动，迟到可能影响活动进行</div>
            <div>• 请穿着合适的运动服装和运动鞋</div>
            <div>• 如需取消预约，请提前24小时操作</div>
            <div>• 活动过程中请注意安全，听从指导老师安排</div>
            <div>• 如有身体不适，请立即告知工作人员</div>
          </div>
        </div>

        {/* 用户评价 */}
        <div className="px-6 py-6 border-t">
          <ActivityComments activityId={activityId} />
        </div>
      </div>
    </div>
  );
}
