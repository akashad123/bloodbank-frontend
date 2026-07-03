import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, CheckCheck, Trash2, X } from 'lucide-react';
import { LoadingSpinner, EmptyState, PageHeader } from '../components/UI';
import { useNotifications } from '../contexts/NotificationContext';
import api from '../api/axios';
import { timeAgo } from '../utils/constants';

/* ─── Notification type visual config ─────────────────────────────── */
const typeConfig = {
  blood_request:      { icon: '🩸', color: 'border-l-red-500',     bg: 'bg-red-50/40'     },
  request_approved:   { icon: '✅', color: 'border-l-green-500',   bg: 'bg-green-50/40'   },
  request_rejected:   { icon: '❌', color: 'border-l-red-400',     bg: 'bg-red-50/30'     },
  request_fulfilled:  { icon: '🎉', color: 'border-l-blue-500',    bg: 'bg-blue-50/40'    },
  donor_assigned:     { icon: '🙋‍♂️', color: 'border-l-indigo-500', bg: 'bg-indigo-50/40'  },
  donor_accepted:     { icon: '🤝', color: 'border-l-emerald-500', bg: 'bg-emerald-50/40' },
  donor_rejected:     { icon: '❌', color: 'border-l-amber-500',   bg: 'bg-amber-50/30'   },
  donation_completed: { icon: '🏆', color: 'border-l-purple-500',  bg: 'bg-purple-50/40'  },
  system:             { icon: '🔔', color: 'border-l-gray-400',    bg: 'bg-gray-50/40'    },
};

/* ─── Animation variants ──────────────────────────────────────────── */
const cardVariants = {
  hidden:  { opacity: 0, x: -16, scale: 0.98 },
  visible: { opacity: 1, x: 0,   scale: 1,   transition: { duration: 0.28, ease: 'easeOut' } },
  exit:    { opacity: 0, x: 40,  scale: 0.95, transition: { duration: 0.25, ease: 'easeIn' } },
};

/* ─── Main Component ──────────────────────────────────────────────── */
export default function Notifications() {
  const navigate = useNavigate();
  const { unreadCount, fetchUnreadCount, markAllRead } = useNotifications();

  const [notifications, setNotifications]     = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [dismissingAll, setDismissingAll]     = useState(false);

  /* Fetch notifications on mount */
  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications?limit=50');
      setNotifications(data.notifications);
    } catch { } finally { setLoading(false); }
  };

  useEffect(() => { fetchNotifications(); }, []);

  /* ── Mark single notification as read ── */
  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      fetchUnreadCount();
    } catch { }
  };

  /* ── Mark all as read ── */
  const handleMarkAll = async () => {
    await markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  /* ── Dismiss single notification ── */
  const handleDismiss = async (e, id) => {
    // Stop click from bubbling to card (which navigates)
    e.stopPropagation();
    // Optimistically remove from UI immediately for snappy feel
    setNotifications((prev) => prev.filter((n) => n._id !== id));
    fetchUnreadCount();
    // Sync with backend (fire-and-forget; already removed from UI)
    try { await api.delete(`/notifications/${id}/dismiss`); } catch { }
  };

  /* ── Dismiss all notifications ── */
  const handleDismissAll = async () => {
    setDismissingAll(true);
    // Stagger-clear after brief pause so exit animations can play
    setNotifications([]);
    fetchUnreadCount();
    try { await api.delete('/notifications/dismiss-all'); } catch { }
    setDismissingAll(false);
  };

  /* ── Card click → navigate ── */
  const handleCardClick = async (n) => {
    if (!n.isRead) await markRead(n._id);
    if (n.requestId) {
      const targetId = n.requestId._id || n.requestId;
      navigate(`/requests/${targetId}`);
    }
  };

  /* ─── Header right‑side action buttons ──────────────────────────── */
  const headerActions = (
    <div className="flex items-center gap-2">
      {unreadCount > 0 && (
        <button
          onClick={handleMarkAll}
          className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 border border-gray-200 bg-white hover:bg-gray-50 text-text-primary transition-colors"
        >
          <CheckCheck size={13} />
          Mark All Read
        </button>
      )}
      {notifications.length > 0 && (
        <button
          onClick={handleDismissAll}
          disabled={dismissingAll}
          className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 transition-colors disabled:opacity-50"
        >
          <Trash2 size={13} />
          Dismiss All
        </button>
      )}
    </div>
  );

  /* ─── Render ─────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-gray-50/50">
      <PageHeader
        eyebrow="Notifications"
        title="Alerts"
        subtitle={
          unreadCount > 0
            ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
            : 'All caught up'
        }
        maxWidth="max-w-3xl"
        right={headerActions}
      />

      <div className="max-w-3xl px-4 sm:px-6 pt-6 pb-10">
        {loading ? (
          <LoadingSpinner />
        ) : notifications.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <EmptyState
              icon="🔔"
              title="No Notifications"
              description="You'll see donor alerts and request updates here."
            />
          </motion.div>
        ) : (
          <div className="space-y-3">
            <AnimatePresence initial={false} mode="popLayout">
              {notifications.map((n) => {
                const cfg = typeConfig[n.type] || typeConfig.system;
                return (
                  <motion.div
                    key={n._id}
                    layout
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className={`
                      relative group bg-white border-l-4 ${cfg.color}
                      border-y border-r border-gray-100
                      cursor-pointer select-none
                      transition-shadow duration-200
                      ${n.isRead
                        ? 'opacity-60 shadow-none'
                        : 'shadow-sm hover:shadow-md hover:-translate-y-0.5'}
                    `}
                    style={{ borderRadius: 0 }}
                    onClick={() => handleCardClick(n)}
                  >
                    {/* ── Unread dot indicator ── */}
                    {!n.isRead && (
                      <span
                        className="absolute top-4 left-[-6px] w-2.5 h-2.5 bg-primary border-2 border-white"
                        style={{ borderRadius: '50%' }}
                      />
                    )}

                    <div className="flex items-start gap-3 p-4 sm:p-5 pr-12">
                      {/* Icon */}
                      <span className="text-2xl flex-shrink-0 mt-0.5" role="img">
                        {cfg.icon}
                      </span>

                      {/* Text content */}
                      <div className="flex-1 min-w-0">
                        <p className={`font-bold text-sm leading-snug ${n.isRead ? 'text-text-secondary' : 'text-text-primary'}`}>
                          {n.title}
                        </p>
                        <p className="text-sm text-text-secondary mt-1 leading-relaxed">
                          {n.message}
                        </p>
                        <p className="text-xs font-medium text-text-muted mt-2 flex items-center gap-1">
                          <Bell size={10} className="opacity-60" />
                          {timeAgo(n.createdAt)}
                        </p>
                      </div>
                    </div>

                    {/* ── Close / Dismiss button ── */}
                    <button
                      id={`dismiss-${n._id}`}
                      aria-label="Dismiss notification"
                      onClick={(e) => handleDismiss(e, n._id)}
                      className="
                        absolute top-3 right-3
                        w-7 h-7 flex items-center justify-center
                        rounded-full
                        text-gray-400
                        opacity-0 group-hover:opacity-100
                        hover:bg-red-50 hover:text-red-500
                        focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-300
                        transition-all duration-200
                        z-10
                      "
                    >
                      <X size={14} strokeWidth={2.5} />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* ── Bottom dismiss-all footer ── */}
            {notifications.length > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex justify-center pt-2"
              >
                <button
                  onClick={handleDismissAll}
                  disabled={dismissingAll}
                  className="text-xs text-text-muted hover:text-red-500 flex items-center gap-1.5 transition-colors duration-200 disabled:opacity-40"
                >
                  <Trash2 size={11} />
                  Clear all notifications
                </button>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
