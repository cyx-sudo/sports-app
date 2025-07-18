import { useState, useEffect } from 'react'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './components/Dashboard'
import type { User } from './api/auth'
import './App.css'

type AuthMode = 'login' | 'register';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>('login');
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

  const handleLogin = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
  };

  const handleRegisterSuccess = () => {
    setAuthMode('login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">加载中...</div>
      </div>
    );
  }

  if (user) {
    return <Dashboard user={user} onLogout={handleLogout} />;
  }

  return (
    <>
      {authMode === 'login' ? (
        <Login 
          onLogin={handleLogin} 
          onSwitchToRegister={() => setAuthMode('register')} 
        />
      ) : (
        <Register 
          onRegisterSuccess={handleRegisterSuccess}
          onSwitchToLogin={() => setAuthMode('login')}
        />
      )}
    </>
  );
}

export default App
