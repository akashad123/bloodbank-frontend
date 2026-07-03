import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Droplets, CheckCircle, Clock, TrendingUp, AlertTriangle } from 'lucide-react';
import { LoadingSpinner, BloodGroupBadge } from '../components/UI';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';
import { timeAgo } from '../utils/constants';

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

/* ── Shared admin card border style ── */
const adminCard = {
  border: '1px solid rgba(0,0,0,0.12)',
  boxShadow: '0 1px 6px rgba(0,0,0,0.06), 0 0 0 0.5px rgba(0,0,0,0.04)',
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/analytics')
      .then(({ data }) => setData(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <><LoadingSpinner message="Loading analytics..." /></>;

  const { stats, bloodGroupBreakdown, recentRequests } = data || {};

  const statCards = [
    { label: 'Total Donors',     value: stats?.totalDonors,       icon: Users,       accent: false },
    { label: 'Eligible Donors',  value: stats?.eligibleDonors,    icon: CheckCircle, accent: true  },
    { label: 'Pending Requests', value: stats?.pendingRequests,   icon: Clock,       accent: false },
    { label: 'Active Requests',  value: stats?.approvedRequests,  icon: Droplets,    accent: false },
    { label: 'Fulfilled',        value: stats?.fulfilledRequests, icon: TrendingUp,  accent: false },
    { label: 'Fulfillment Rate', value: `${stats?.fulfillmentRate}%`, icon: TrendingUp, accent: true },
  ];

  return (
    <div className="min-h-screen" style={{ background: '#F7F7F8' }}>

      {/* ── Admin Header ── */}
      <div
        className="text-white px-6 py-8 mb-8"
        style={{
          background: 'linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 100%)',
          borderBottom: '3px solid #B03030',
        }}
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4 min-w-0">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {/* Admin label pill */}
              <span
                className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1"
                style={{
                  background: 'rgba(176,48,48,0.25)',
                  border: '1px solid rgba(176,48,48,0.50)',
                  color: '#EAA8A8',
                }}
              >
                Admin Panel
              </span>
              <span
                className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: '#AAAAAA',
                }}
              >
                District Admin
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black truncate text-white mb-1">
              {user?.district} Dashboard
            </h1>
            <p className="text-gray-400 font-medium text-sm truncate">
              {user?.email || (user?.phone ? `+91 ${user.phone}` : '')}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6 md:space-y-8 min-w-0">

        {/* ── Stat Cards Grid ── */}
        <motion.div
          variants={{ show: { transition: { staggerChildren: 0.08 } } }}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {statCards.map((card, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className="flex flex-col p-6 w-full bg-white transition-shadow duration-300 hover:shadow-md"
              style={{
                ...adminCard,
                ...(card.accent
                  ? { borderLeft: '3px solid #B03030', background: '#FDFAFA' }
                  : {}),
              }}
            >
              <card.icon
                size={24}
                className="mb-4"
                style={{ color: card.accent ? '#B03030' : '#888888' }}
              />
              <p className="text-4xl font-black tracking-tight" style={{ color: '#111111' }}>
                {card.value ?? '—'}
              </p>
              <p className="text-xs mt-1 font-bold uppercase tracking-wider" style={{ color: '#666666' }}>
                {card.label}
              </p>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* ── Blood Group Breakdown ── */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="bg-white p-6 min-w-0"
            style={adminCard}
          >
            {/* Section header with dark accent bar */}
            <div
              className="flex items-center gap-2 mb-4 pb-3"
              style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}
            >
              <span
                className="w-1 h-5 shrink-0"
                style={{ background: '#B03030' }}
              />
              <h2 className="font-black text-lg" style={{ color: '#111111' }}>
                Eligible Donors by Blood Group
              </h2>
            </div>

            {bloodGroupBreakdown?.length === 0 ? (
              <p className="text-sm text-center py-4" style={{ color: '#888888' }}>No data yet</p>
            ) : (
              <div className="space-y-4">
                {bloodGroupBreakdown?.map((bg) => (
                  <div key={bg._id} className="flex items-center justify-between min-w-0 gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <BloodGroupBadge group={bg._id} size="sm" />
                      <span className="font-bold text-sm truncate" style={{ color: '#222222' }}>
                        {bg._id}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {/* Progress bar */}
                      <div
                        className="w-16 sm:w-24 h-1.5 overflow-hidden"
                        style={{ background: 'rgba(0,0,0,0.08)' }}
                      >
                        <div
                          className="h-full transition-all duration-500"
                          style={{
                            width: `${Math.min(100, (bg.count / (stats?.eligibleDonors || 1)) * 100)}%`,
                            background: '#B03030',
                          }}
                        />
                      </div>
                      <span className="text-sm font-black w-5 text-right" style={{ color: '#111111' }}>
                        {bg.count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* ── Recent Requests ── */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="show"
            className="md:col-span-2 bg-white p-6 min-w-0"
            style={adminCard}
          >
            {/* Section header */}
            <div
              className="flex items-center justify-between mb-4 pb-3 gap-2"
              style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}
            >
              <div className="flex items-center gap-2">
                <span className="w-1 h-5 shrink-0" style={{ background: '#B03030' }} />
                <h2 className="font-black text-lg" style={{ color: '#111111' }}>Recent Requests</h2>
              </div>
              <Link
                to="/admin/requests"
                className="text-sm font-bold whitespace-nowrap px-3 py-1.5 transition-all duration-200 hover:opacity-80"
                style={{
                  color: '#B03030',
                  background: 'rgba(176,48,48,0.08)',
                  border: '1px solid rgba(176,48,48,0.20)',
                }}
              >
                Manage All →
              </Link>
            </div>

            {recentRequests?.length === 0 ? (
              <p className="text-sm text-center py-8" style={{ color: '#888888' }}>
                No requests yet in {user?.district}
              </p>
            ) : (
              <div className="space-y-2 mt-2">
                {recentRequests?.map((req) => (
                  <Link
                    key={req._id}
                    to={`/requests/${req._id}`}
                    className="flex items-center justify-between p-3 gap-3 min-w-0 transition-all duration-200"
                    style={{
                      border: '1px solid rgba(0,0,0,0.09)',
                      background: '#FAFAFA',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = '#F3F3F3';
                      e.currentTarget.style.borderColor = 'rgba(0,0,0,0.18)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = '#FAFAFA';
                      e.currentTarget.style.borderColor = 'rgba(0,0,0,0.09)';
                    }}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <BloodGroupBadge group={req.bloodGroup} size="sm" />
                      <div className="min-w-0">
                        <p className="font-bold text-sm truncate" style={{ color: '#111111' }}>
                          {req.hospital}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: '#888888' }}>
                          {req.units} unit(s) · {timeAgo(req.createdAt)}
                        </p>
                      </div>
                    </div>
                    <span className={`badge shrink-0 ${
                      req.status === 'pending'   ? 'badge-pending'   :
                      req.status === 'approved'  ? 'badge-approved'  :
                      req.status === 'rejected'  ? 'badge-rejected'  : 'badge-fulfilled'
                    }`}>
                      {req.status}
                    </span>
                  </Link>
                ))}
              </div>
            )}

            {/* Pending alert */}
            {stats?.pendingRequests > 0 && (
              <div
                className="mt-6 p-4 flex flex-wrap items-center gap-3"
                style={{
                  background: '#FFF5F5',
                  border: '1px solid rgba(176,48,48,0.25)',
                  borderLeft: '3px solid #B03030',
                }}
              >
                <AlertTriangle size={20} className="flex-shrink-0" style={{ color: '#B03030' }} />
                <p className="text-sm font-bold flex-1 min-w-0" style={{ color: '#7A1A1A' }}>
                  {stats.pendingRequests} request(s) awaiting your approval
                </p>
                <Link
                  to="/admin/requests?status=pending"
                  className="text-xs font-black px-3 py-1.5 transition-all duration-200 whitespace-nowrap shrink-0 hover:opacity-80"
                  style={{
                    background: '#1A1A1A',
                    color: '#FFFFFF',
                  }}
                >
                  Review →
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
