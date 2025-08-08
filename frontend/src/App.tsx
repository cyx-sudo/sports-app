import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import AuthLayout from './components/AuthLayout';
import type { User } from '../../shared/types';
import './App.css'

function AppRoutes({ user, onLogin, onLogout, onUserUpdate }: { 
  user: User | null; 
  onLogin: (user: User) => void; 
  onLogout: () => void;
  onUserUpdate: (user: User) => void;
}) {
  const navigate = useNavigate();

  return (
    <Routes>
      {/* 认证相关路由 */}
      <Route path="/login" element={
        user ? <Navigate to="/dashboard" replace /> : 
        <AuthLayout>
          <Login onLogin={onLogin} onSwitchToRegister={() => navigate('/register')} />
        </AuthLayout>
      } />
      <Route path="/register" element={
        user ? <Navigate to="/dashboard" replace /> : 
        <AuthLayout>
          <Register onRegisterSuccess={() => navigate('/login')} onSwitchToLogin={() => navigate('/login')} />
        </AuthLayout>
      } />
      
      {/* 受保护的路由 */}
      <Route 
        path="/dashboard/*" 
        element={
          <ProtectedRoute user={user}>
            <Dashboard user={user!} onLogout={onLogout} onUserUpdate={onUserUpdate} />
          </ProtectedRoute>
        } 
      />
      
      {/* 默认路由 */}
      <Route 
        path="/" 
        element={<Navigate to={user ? "/dashboard" : "/login"} replace />} 
      />
      
      {/* 404 路由 */}
      <Route 
        path="*" 
        element={<Navigate to={user ? "/dashboard" : "/login"} replace />} 
      />
    </Routes>
  );
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 检查是否已登录
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Failed to parse user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (user: User) => {
    setUser(user);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const handleUserUpdate = (updatedUser: User) => {
    setUser(updatedUser);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-lg text-gray-600 font-medium animate-pulse">正在加载中...</div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <AppRoutes user={user} onLogin={handleLogin} onLogout={handleLogout} onUserUpdate={handleUserUpdate} />
    </Router>
  );
}

export default App
