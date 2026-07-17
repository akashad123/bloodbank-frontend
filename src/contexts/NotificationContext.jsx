import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';
import { fetchUnseenCertificateCount } from '../api/certificates';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { user, socket } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  // Badge count for new/unseen certificates — only applicable to donor accounts
  const [unreadCertificatesCount, setUnreadCertificatesCount] = useState(0);

  const isDonor = user?.isQualifiedDonor;

  // ── Fetch unread notification count ───────────────────────────────────────
  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await api.get('/notifications/unread-count');
      setUnreadCount(data.count);
    } catch { /* silent fail */ }
  }, [user]);

  // ── Fetch unseen certificate count (donor only) ───────────────────────────
  const fetchUnseenCertCount = useCallback(async () => {
    if (!user || !isDonor) return;
    try {
      const { data } = await fetchUnseenCertificateCount();
      setUnreadCertificatesCount(data.count);
    } catch { /* silent fail */ }
  }, [user, isDonor]);

  // ── Clear the certificate badge (called when Certificates page mounts) ────
  const clearCertificateBadge = useCallback(() => {
    setUnreadCertificatesCount(0);
  }, []);

  // Poll every 30 seconds
  useEffect(() => {
    fetchUnreadCount();
    fetchUnseenCertCount();
    const interval = setInterval(() => {
      fetchUnreadCount();
      fetchUnseenCertCount();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchUnreadCount, fetchUnseenCertCount]);

  // ── Real-time: listen for socket events ──────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (notification) => {
      setUnreadCount((c) => c + 1);
      setNotifications((prev) => [notification, ...prev]);

      // If this is a fulfilled-request notification for a donor, increment cert badge
      if (isDonor && notification.type === 'request_fulfilled') {
        setUnreadCertificatesCount((c) => c + 1);
      }
    };

    socket.on('new_notification', handleNewNotification);
    return () => socket.off('new_notification', handleNewNotification);
  }, [socket, isDonor]);

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setUnreadCount(0);
    } catch { /* silent */ }
  };

  return (
    <NotificationContext.Provider
      value={{
        unreadCount,
        notifications,
        fetchUnreadCount,
        markAllRead,
        unreadCertificatesCount,
        fetchUnseenCertCount,
        clearCertificateBadge,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used inside NotificationProvider');
  return ctx;
};
