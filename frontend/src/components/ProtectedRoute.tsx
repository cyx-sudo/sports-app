import { Navigate, useLocation } from 'react-router-dom';
import type { User } from '../../../shared/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  user: User | null;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, user, requireAdmin = false }: ProtectedRouteProps) {
  const location = useLocation();

  if (!user) {
    // 保存当前路径，登录后可以返回
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && user.role !== 'admin' && user.username !== 'admin') {
    // 非管理员访问管理员页面，重定向到仪表板
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
