import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Droplets, CheckCircle, Clock, XCircle, TrendingUp, AlertTriangle } from 'lucide-react';
import { LoadingSpinner, BloodGroupBadge } from '../components/UI';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';
import { timeAgo } from '../utils/constants';

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

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
    { label: 'Total Donors', value: stats?.totalDonors, icon: Users, accent: false },
    { label: 'Eligible Donors', value: stats?.eligibleDonors, icon: CheckCircle, accent: true },
    { label: 'Pending Requests', value: stats?.pendingRequests, icon: Clock, accent: false },
    { label: 'Active Requests', value: stats?.approvedRequests, icon: Droplets, accent: false },
    { label: 'Fulfilled', value: stats?.fulfilledRequests, icon: TrendingUp, accent: false },
    { label: 'Fulfillment Rate', value: `${stats?.fulfillmentRate}%`, icon: TrendingUp, accent: true },
  ];

  return (
    <div className="min-h-screen bg-bg">
      
      {/* Header */}
      <div className="bg-text-primary text-white px-4 sm:px-6 lg:px-8 py-6 md:py-8 border-b-4 border-primary">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4 min-w-0">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Admin Panel</span>
              <span className="text-xs bg-primary/30 text-primary-light border border-primary/40 px-2 py-0.5 font-bold">DISTRICT ADMIN</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black truncate">{user?.district} Dashboard</h1>
            <p className="text-gray-400 text-sm mt-1 truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6 md:space-y-8 min-w-0">
        {/* Stats Grid */}
        <motion.div
          variants={{ show: { transition: { staggerChildren: 0.08 } } }}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {statCards.map((card, i) => (
            <motion.div key={i} variants={fadeUp} className={`card p-4 w-full text-center ${card.accent ? 'border-t-4 border-t-primary' : ''}`}>
              <card.icon size={18} className={`mx-auto mb-2 ${card.accent ? 'text-primary' : 'text-text-muted'}`} />
              <p className="text-3xl font-black text-text-primary">{card.value ?? '—'}</p>
              <p className="text-xs text-text-muted mt-1 font-medium">{card.label}</p>
            </motion.div>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Blood Group Breakdown */}
          <motion.div variants={fadeUp} initial="hidden" animate="show" className="card p-4 min-w-0">
            <h2 className="font-black text-base md:text-lg mb-4 border-b border-bg-darker pb-3">Eligible Donors by Blood Group</h2>
            {bloodGroupBreakdown?.length === 0 ? (
              <p className="text-text-muted text-sm text-center py-4">No data yet</p>
            ) : (
              <div className="space-y-3">
                {bloodGroupBreakdown?.map((bg) => (
                  <div key={bg._id} className="flex items-center justify-between min-w-0 gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <BloodGroupBadge group={bg._id} size="sm" />
                      <span className="font-semibold text-sm truncate">{bg._id}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="w-16 sm:w-24 h-2 bg-bg-darker overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${Math.min(100, (bg.count / (stats?.eligibleDonors || 1)) * 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold w-5 text-right">{bg.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Recent Requests */}
          <motion.div variants={fadeUp} initial="hidden" animate="show" className="md:col-span-2 card p-4 min-w-0">
            <div className="flex items-center justify-between mb-4 border-b border-bg-darker pb-3 gap-2">
              <h2 className="font-black text-base md:text-lg">Recent Requests</h2>
              <Link to="/admin/requests" className="text-primary text-sm font-semibold hover:underline whitespace-nowrap">Manage All →</Link>
            </div>

            {recentRequests?.length === 0 ? (
              <p className="text-text-muted text-sm text-center py-8">No requests yet in {user?.district}</p>
            ) : (
              <div className="space-y-1">
                {recentRequests?.map((req) => (
                  <Link
                    key={req._id}
                    to={`/requests/${req._id}`}
                    className="flex items-center justify-between py-3 border-b border-bg-darker last:border-0 hover:bg-bg transition-colors px-2 -mx-2 gap-3 min-w-0"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <BloodGroupBadge group={req.bloodGroup} size="sm" />
                      <div className="min-w-0">
                        <p className="font-semibold text-sm truncate">{req.hospital}</p>
                        <p className="text-xs text-text-muted">{req.units} unit(s) &bull; {timeAgo(req.createdAt)}</p>
                      </div>
                    </div>
                    <span className={`badge shrink-0 ${
                      req.status === 'pending' ? 'badge-pending' :
                      req.status === 'approved' ? 'badge-approved' :
                      req.status === 'rejected' ? 'badge-rejected' : 'badge-fulfilled'
                    }`}>{req.status}</span>
                  </Link>
                ))}
              </div>
            )}

            {/* Pending alert */}
            {stats?.pendingRequests > 0 && (
              <div className="mt-4 bg-yellow-50 border border-yellow-200 p-3 flex flex-wrap items-center gap-2">
                <AlertTriangle size={16} className="text-yellow-600 flex-shrink-0" />
                <p className="text-sm text-yellow-800 font-medium flex-1 min-w-0">
                  {stats.pendingRequests} request(s) awaiting your approval
                </p>
                <Link to="/admin/requests?status=pending" className="text-xs font-bold text-yellow-700 hover:underline whitespace-nowrap shrink-0">
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
