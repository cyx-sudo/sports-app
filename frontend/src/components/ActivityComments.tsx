import { useState, useEffect, useCallback } from 'react';
import { getActivityComments, createComment, updateComment, deleteComment, getActivityRatingStats } from '../api/comment';
import type { Comment, CreateCommentRequest } from '../../../shared/types';

interface ActivityCommentsProps {
  activityId: number;
}

export default function ActivityComments({ activityId }: ActivityCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [stats, setStats] = useState<{
    totalComments: number;
    averageRating: number;
    ratingDistribution: Record<string, number>;
  } | null>(null);

  // 新评论表单数据
  const [newComment, setNewComment] = useState({
    content: '',
    rating: 5
  });

  // 加载评论列表
  const loadComments = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const response = await getActivityComments(activityId, {
        page,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });

      if (response.data.success && response.data.data) {
        setComments(response.data.data.items);
        setTotal(response.data.data.total);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('加载评论失败:', error);
    } finally {
      setLoading(false);
    }
  }, [activityId]);

  // 加载评分统计
  const loadStats = useCallback(async () => {
    try {
      const response = await getActivityRatingStats(activityId);
      if (response.data.success && response.data.data) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('加载评分统计失败:', error);
    }
  }, [activityId]);

  // 提交新评论
  const handleCreateComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newComment.content.trim()) {
      alert('请输入评论内容');
      return;
    }

    try {
      const commentData: CreateCommentRequest = {
        activityId,
        content: newComment.content.trim(),
        rating: newComment.rating
      };

      const response = await createComment(commentData);
      
      if (response.data.success) {
        alert('评论发布成功！');
        setNewComment({ content: '', rating: 5 });
        setShowCreateForm(false);
        loadComments(1);
        loadStats();
      } else {
        alert(response.data.message || '发布评论失败');
      }
    } catch {
      alert('发布评论失败');
    }
  };

  // 编辑评论
  const handleEditComment = (comment: Comment) => {
    setEditingComment(comment);
    setNewComment({
      content: comment.content,
      rating: comment.rating
    });
  };

  // 更新评论
  const handleUpdateComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingComment || !newComment.content.trim()) {
      return;
    }

    try {
      const response = await updateComment(editingComment.id, {
        content: newComment.content.trim(),
        rating: newComment.rating
      });

      if (response.data.success) {
        alert('评论更新成功！');
        setEditingComment(null);
        setNewComment({ content: '', rating: 5 });
        loadComments(currentPage);
        loadStats();
      } else {
        alert(response.data.message || '更新评论失败');
      }
    } catch {
      alert('更新评论失败');
    }
  };

  // 删除评论
  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('确定要删除这条评论吗？')) {
      return;
    }

    try {
      const response = await deleteComment(commentId);
      
      if (response.data.success) {
        alert('评论删除成功！');
        loadComments(currentPage);
        loadStats();
      } else {
        alert(response.data.message || '删除评论失败');
      }
    } catch {
      alert('删除评论失败');
    }
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setEditingComment(null);
    setNewComment({ content: '', rating: 5 });
    setShowCreateForm(false);
  };

  // 渲染星级评分
  const renderStars = (rating: number, interactive = false, onChange?: (rating: number) => void) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`text-xl ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            } ${interactive ? 'hover:text-yellow-400 cursor-pointer' : ''}`}
            onClick={() => interactive && onChange && onChange(star)}
            disabled={!interactive}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  useEffect(() => {
    loadComments(1);
    loadStats();
  }, [loadComments, loadStats]);

  if (loading && comments.length === 0) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="text-lg text-gray-600">加载中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 评分统计 */}
      {stats && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold mb-3">评价统计</h3>
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {stats.averageRating.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">平均评分</div>
              {renderStars(Math.round(stats.averageRating))}
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-600 mb-2">
                共 {stats.totalComments} 条评价
              </div>
              {Object.entries(stats.ratingDistribution)
                .reverse()
                .map(([rating, count]) => (
                  <div key={rating} className="flex items-center space-x-2 mb-1">
                    <span className="text-sm w-4">{rating}★</span>
                    <div className="flex-1 bg-gray-200 rounded h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded"
                        style={{
                          width: stats.totalComments > 0 
                            ? `${(count / stats.totalComments) * 100}%` 
                            : '0%'
                        }}
                      />
                    </div>
                    <span className="text-sm w-8 text-right">{count}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* 添加评论按钮 */}
      {!showCreateForm && !editingComment && (
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          写评论
        </button>
      )}

      {/* 评论表单 */}
      {(showCreateForm || editingComment) && (
        <form 
          onSubmit={editingComment ? handleUpdateComment : handleCreateComment}
          className="bg-white border rounded-lg p-4 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              评分
            </label>
            {renderStars(newComment.rating, true, (rating) => 
              setNewComment(prev => ({ ...prev, rating }))
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              评论内容
            </label>
            <textarea
              value={newComment.content}
              onChange={(e) => setNewComment(prev => ({ ...prev, content: e.target.value }))}
              className="w-full p-3 border rounded-lg resize-none h-24"
              placeholder="分享您的参与体验..."
              required
            />
          </div>
          
          <div className="flex space-x-2">
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              {editingComment ? '更新评论' : '发布评论'}
            </button>
            <button
              type="button"
              onClick={handleCancelEdit}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
            >
              取消
            </button>
          </div>
        </form>
      )}

      {/* 评论列表 */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          用户评价 ({total})
        </h3>
        
        {comments.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            暂无评价，快来写下第一条评论吧！
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="bg-white border rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="font-medium text-gray-900">
                      {comment.user?.realName || comment.user?.username || '匿名用户'}
                    </span>
                    {renderStars(comment.rating)}
                    <span className="text-sm text-gray-500">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {comment.content}
                  </p>
                  {comment.updatedAt && comment.updatedAt !== comment.createdAt && (
                    <p className="text-xs text-gray-400 mt-1">
                      已编辑
                    </p>
                  )}
                </div>
                
                {/* 当前用户的评论显示编辑/删除按钮 */}
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => handleEditComment(comment)}
                    className="text-blue-500 hover:text-blue-700 text-sm"
                  >
                    编辑
                  </button>
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    删除
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 分页 */}
      {total > 10 && (
        <div className="flex justify-center space-x-2">
          <button
            onClick={() => loadComments(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            上一页
          </button>
          <span className="px-3 py-1">
            {currentPage} / {Math.ceil(total / 10)}
          </span>
          <button
            onClick={() => loadComments(currentPage + 1)}
            disabled={currentPage >= Math.ceil(total / 10)}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            下一页
          </button>
        </div>
      )}
    </div>
  );
}
