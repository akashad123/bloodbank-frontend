import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, CheckCheck } from 'lucide-react';
import { LoadingSpinner, EmptyState } from '../components/UI';
import { useNotifications } from '../contexts/NotificationContext';
import api from '../api/axios';
import { timeAgo } from '../utils/constants';

const typeConfig = {
  blood_request: { icon: '🩸', color: 'border-l-red-500' },
  request_approved: { icon: '✅', color: 'border-l-green-500' },
  request_rejected: { icon: '❌', color: 'border-l-red-400' },
  request_fulfilled: { icon: '🎉', color: 'border-l-blue-500' },
  system: { icon: '🔔', color: 'border-l-gray-400' },
};

export default function Notifications() {
  const { unreadCount, fetchUnreadCount, markAllRead } = useNotifications();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    try {
      const { data } = await api.get('/notifications?limit=50');
      setNotifications(data.notifications);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, isRead: true } : n));
      fetchUnreadCount();
    } catch { }
  };

  const handleMarkAll = async () => {
    await markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  return (
    <div className="min-h-screen bg-bg">
      
      <div className="page-header">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Notifications</p>
            <h1 className="text-3xl font-black">Alerts</h1>
            {unreadCount > 0 && (
              <p className="text-primary-light text-sm mt-1">{unreadCount} unread</p>
            )}
          </div>
          {unreadCount > 0 && (
            <button onClick={handleMarkAll} className="flex items-center gap-2 btn-ghost border border-white/20 text-white hover:bg-white/10 text-sm px-4 py-2">
              <CheckCheck size={16} /> Mark All Read
            </button>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        {loading ? <LoadingSpinner /> : notifications.length === 0 ? (
          <EmptyState icon="🔔" title="No Notifications" description="You'll see donor alerts and request updates here." />
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => {
              const cfg = typeConfig[n.type] || typeConfig.system;
              return (
                <motion.div
                  key={n._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => !n.isRead && markRead(n._id)}
                  className={`card border-l-4 ${cfg.color} cursor-pointer transition-all ${
                    n.isRead ? 'opacity-60' : 'shadow-card'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{cfg.icon}</span>
                      <div>
                        <p className="font-bold text-sm">{n.title}</p>
                        <p className="text-sm text-text-secondary mt-1">{n.message}</p>
                        <p className="text-xs text-text-muted mt-2">{timeAgo(n.createdAt)}</p>
                      </div>
                    </div>
                    {!n.isRead && (
                      <span className="w-2 h-2 bg-primary flex-shrink-0 mt-1" style={{ borderRadius: '50%' }} />
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
