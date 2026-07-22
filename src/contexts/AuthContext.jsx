import { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('bb_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('bb_token'));
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize socket and join user room
  useEffect(() => {
    if (token && user) {
      const socketUrl = import.meta.env.VITE_SOCKET_URL;
      
      if (!socketUrl) {
        console.error('VITE_SOCKET_URL is not configured. Socket.IO connection skipped.');
        return;
      }

      console.log('[Socket] Initializing connection to:', socketUrl);
      const s = io(socketUrl);
      
      s.on('connect', () => {
        console.log('[Socket] Successfully connected with ID:', s.id);
        s.emit('join_user_room', user._id);
      });
      
      s.on('connect_error', (err) => {
        console.error('[Socket] Connection error:', err.message);
      });
      
      s.on('disconnect', (reason) => {
        console.warn('[Socket] Disconnected. Reason:', reason);
      });
      
      s.io.on('reconnect_attempt', (attempt) => {
        console.log(`[Socket] Reconnection attempt ${attempt}...`);
      });

      setSocket(s);
      
      return () => {
        console.log('[Socket] Cleaning up socket connection');
        s.disconnect();
      };
    }
  }, [token, user?._id]);

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) { setLoading(false); return; }
      try {
        const { data } = await api.get('/auth/me');
        setUser(data.user);
        localStorage.setItem('bb_user', JSON.stringify(data.user));
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    };
    verifyToken();
  }, []);

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('bb_token', authToken);
    localStorage.setItem('bb_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    socket?.disconnect();
    setSocket(null);
    localStorage.removeItem('bb_token');
    localStorage.removeItem('bb_user');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('bb_user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{ user, token, socket, loading, login, logout, updateUser, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
