import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, UserPlus, X, Phone, Droplets } from 'lucide-react';
import { BloodGroupBadge, UrgencyBadge, StatusBadge, LoadingSpinner, EmptyState } from '../components/UI';
import AssignDonorModal from '../components/AssignDonorModal';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { timeAgo } from '../utils/constants';

const STATUS_TABS = ['all', 'pending', 'assigned', 'accepted', 'completed', 'fulfilled'];

/* ── Shared admin card border style ── */
const adminCard = {
  border: '1px solid rgba(0,0,0,0.12)',
  boxShadow: '0 1px 6px rgba(0,0,0,0.06), 0 0 0 0.5px rgba(0,0,0,0.04)',
};

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminRequests() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [assignModal, setAssignModal] = useState(null);

  const activeTab = searchParams.get('status') || 'pending';

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: 50 });
      if (activeTab !== 'all') params.set('status', activeTab);
      const { data } = await api.get(`/requests?${params}`);
      setRequests(data.requests);
    } catch { } finally { setLoading(false); }
  }, [activeTab]);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);

  const handleFulfill = async (reqId) => {
    setActionLoading(reqId);
    try {
      await api.put(`/requests/${reqId}/status`, { status: 'fulfilled' });
      toast.success('Request marked as fulfilled!');
      fetchRequests();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to mark fulfilled');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: '#F7F7F8' }}>

      {/* Assign Donor Modal */}
      {assignModal && (
        <AssignDonorModal
          request={assignModal}
          onClose={() => setAssignModal(null)}
          onAssigned={fetchRequests}
        />
      )}

      {/* ── Admin Page Header ── */}
      <div
        className="text-white px-4 sm:px-6 lg:px-8 py-8 mb-0"
        style={{
          background: 'linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 100%)',
          borderBottom: '3px solid #B03030',
        }}
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-2 min-w-0">
          <div className="min-w-0">
            <p
              className="text-[10px] font-black uppercase tracking-widest mb-1"
              style={{ color: '#888888' }}
            >
              Admin
            </p>
            <h1 className="text-2xl md:text-3xl font-black truncate text-white">
              Manage Requests
            </h1>
            <p className="text-sm truncate mt-0.5" style={{ color: '#AAAAAA' }}>
              {user?.district} District
            </p>
          </div>
        </div>
      </div>

      {/* ── Status Tab Bar ── */}
      <div style={{ background: '#1E1E1E', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 overflow-x-auto">
          <div className="flex gap-0 whitespace-nowrap min-w-max">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setSearchParams({ status: tab })}
                className="px-4 sm:px-5 py-3 text-sm font-bold uppercase tracking-wide whitespace-nowrap transition-all duration-200"
                style={{
                  color: activeTab === tab ? '#FFFFFF' : '#888888',
                  borderBottom: activeTab === tab ? '2px solid #B03030' : '2px solid transparent',
                  background: activeTab === tab ? 'rgba(176,48,48,0.12)' : 'transparent',
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 min-w-0">
        {loading ? (
          <LoadingSpinner message="Loading requests..." />
        ) : requests.length === 0 ? (
          <EmptyState
            icon="📋"
            title={`No ${activeTab} requests`}
            description={`No blood requests with status "${activeTab}" in ${user?.district}.`}
          />
        ) : (
          <div className="space-y-3">
            {requests.map((req) => (
              <motion.div
                key={req._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white transition-shadow duration-200"
                style={{
                  ...adminCard,
                  ...(req.urgency === 'emergency'
                    ? { borderLeft: '3px solid #B03030' }
                    : {}),
                }}
              >
                <div className="p-5 flex flex-col md:flex-row items-start justify-between gap-4 w-full overflow-hidden">

                  {/* Left — request info */}
                  <div className="flex items-start gap-3 flex-1 min-w-0 w-full">
                    <BloodGroupBadge group={req.bloodGroup} size="md" />
                    <div className="flex-1 min-w-0 flex flex-col gap-1">
                      <p className="font-bold text-sm md:text-base break-words" style={{ color: '#111111' }}>
                        {req.hospital}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-1">
                        <UrgencyBadge urgency={req.urgency} />
                        <StatusBadge status={req.status} />
                      </div>
                      <p className="text-xs" style={{ color: '#888888' }}>{req.district}</p>
                      <p className="text-xs overflow-hidden text-ellipsis" style={{ color: '#AAAAAA' }}>
                        {req.units} unit(s) of {req.bloodGroup} · Req by {req.createdBy?.name || 'Unknown'} · {timeAgo(req.createdAt)}
                      </p>
                      <p className="text-xs break-all" style={{ color: '#AAAAAA' }}>
                        Contact: <strong style={{ color: '#444444' }}>{req.contactName}</strong> · {req.contactPhone}
                      </p>
                      {req.additionalInfo && (
                        <p className="text-xs italic break-words" style={{ color: '#888888' }}>
                          "{req.additionalInfo}"
                        </p>
                      )}
                      {req.adminNote && (
                        <p
                          className="text-xs px-2 py-1 break-words"
                          style={{
                            background: '#FFFBEB',
                            border: '1px solid rgba(234,179,8,0.25)',
                            color: '#92400E',
                          }}
                        >
                          Note: {req.adminNote}
                        </p>
                      )}

                      {/* Assigned Donor Indicator */}
                      {req.assignedDonor ? (
                        <div
                          className="mt-1 flex items-center gap-2 px-2 py-1.5"
                          style={{
                            background: '#F0FDF4',
                            border: '1px solid rgba(34,197,94,0.25)',
                          }}
                        >
                          <UserPlus size={12} className="shrink-0" style={{ color: '#22C55E' }} />
                          <span className="text-xs font-semibold" style={{ color: '#166534' }}>
                            Assigned: {req.assignedDonor?.name || 'Donor'} · {req.assignedDonor?.phone || '—'}
                          </span>
                        </div>
                      ) : req.status === 'pending' && req.matchedDonors?.length > 0 ? (
                        <p className="text-xs mt-1" style={{ color: '#3B82F6' }}>
                          {req.matchedDonors.length} matched donor{req.matchedDonors.length !== 1 ? 's' : ''} available
                        </p>
                      ) : null}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 w-full md:min-w-48 md:w-auto mt-2 md:mt-0 shrink-0">
                    <Link
                      to={`/requests/${req._id}`}
                      className="flex items-center gap-2 text-xs font-semibold justify-center py-2 px-4 transition-colors duration-200"
                      style={{
                        border: '1px solid rgba(0,0,0,0.15)',
                        color: '#444444',
                        background: '#FAFAFA',
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = '#F0F0F0';
                        e.currentTarget.style.borderColor = 'rgba(0,0,0,0.25)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = '#FAFAFA';
                        e.currentTarget.style.borderColor = 'rgba(0,0,0,0.15)';
                      }}
                    >
                      <Eye size={14} /> View Details
                    </Link>

                    {req.status === 'pending' && (
                      <button
                        onClick={() => setAssignModal(req)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wide justify-center transition-colors duration-200"
                        style={{ background: '#1D4ED8', color: '#FFFFFF' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#1E40AF'}
                        onMouseLeave={e => e.currentTarget.style.background = '#1D4ED8'}
                      >
                        <UserPlus size={14} /> Assign Donor
                      </button>
                    )}

                    {['assigned', 'accepted'].includes(req.status) && (
                      <>
                        <button
                          onClick={() => setAssignModal(req)}
                          className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wide justify-center transition-colors duration-200"
                          style={{ background: '#1D4ED8', color: '#FFFFFF' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#1E40AF'}
                          onMouseLeave={e => e.currentTarget.style.background = '#1D4ED8'}
                        >
                          <UserPlus size={14} /> Change Donor
                        </button>
                        <button
                          onClick={() => handleFulfill(req._id)}
                          disabled={actionLoading === req._id}
                          className="btn-primary py-2 text-xs flex items-center gap-2 justify-center"
                        >
                          {actionLoading === req._id ? 'Processing...' : '✅ Mark Fulfilled'}
                        </button>
                      </>
                    )}

                    {req.status === 'completed' && (
                      <button
                        onClick={() => handleFulfill(req._id)}
                        disabled={actionLoading === req._id}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wide justify-center transition-colors duration-200"
                        style={{ background: '#10B981', color: '#FFFFFF' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#059669'}
                        onMouseLeave={e => e.currentTarget.style.background = '#10B981'}
                      >
                        {actionLoading === req._id ? 'Verifying...' : '✅ Verify & Fulfill'}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
