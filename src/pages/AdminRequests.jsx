import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, UserPlus, X, Phone, Droplets } from 'lucide-react';
import { BloodGroupBadge, UrgencyBadge, StatusBadge, LoadingSpinner, EmptyState } from '../components/UI';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { timeAgo } from '../utils/constants';

const STATUS_TABS = ['all', 'pending', 'assigned', 'fulfilled'];

// ─── Assign Donor Modal ───────────────────────────────────────────────────────
function AssignDonorModal({ request, onClose, onAssigned }) {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(null); // donorId being assigned

  useEffect(() => {
    api.get(`/requests/${request._id}/matches`)
      .then(({ data }) => setDonors(data.donors))
      .catch(() => toast.error('Failed to load matched donors'))
      .finally(() => setLoading(false));
  }, [request._id]);

  const handleAssign = async (donorId) => {
    setAssigning(donorId);
    try {
      await api.patch(`/requests/${request._id}/assign-donor`, { donorId });
      toast.success('Donor assigned successfully!');
      onAssigned();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign donor');
    } finally {
      setAssigning(null);
    }
  };

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="bg-white w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-text-primary text-white px-5 py-4 flex items-center justify-between border-b-4 border-primary shrink-0">
            <div>
              <h2 className="font-black text-lg">Assign Donor</h2>
              <p className="text-gray-400 text-xs mt-0.5">
                {request.bloodGroup} &bull; {request.hospital} &bull; {request.district}
              </p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors p-1">
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <LoadingSpinner message="Finding matched donors..." />
            ) : donors.length === 0 ? (
              <div className="text-center py-10">
                <Droplets size={40} className="mx-auto text-gray-300 mb-3" />
                <p className="font-semibold text-text-primary">No matching donors found</p>
                <p className="text-sm text-text-muted mt-1">
                  No eligible {request.bloodGroup} donors in {request.district}.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-text-muted font-semibold uppercase tracking-wide mb-2">
                  {donors.length} eligible donor{donors.length !== 1 ? 's' : ''} found
                </p>
                {donors.map((donor) => {
                  const isCurrentlyAssigned = request.assignedDonor?._id === donor._id ||
                    request.assignedDonor === donor._id;
                  return (
                    <div
                      key={donor._id}
                      className={`flex items-center justify-between gap-3 p-3 border-2 transition-colors ${
                        isCurrentlyAssigned
                          ? 'border-green-500 bg-green-50'
                          : 'border-bg-darker hover:border-primary/40'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <BloodGroupBadge group={donor.bloodGroup} size="sm" />
                        <div className="min-w-0">
                          <p className="font-bold text-sm truncate">{donor.name}</p>
                          <p className="text-xs text-text-muted flex items-center gap-1">
                            <Phone size={10} /> {donor.phone}
                          </p>
                          <p className="text-xs text-gray-500">{donor.district}</p>
                        </div>
                      </div>
                      {isCurrentlyAssigned ? (
                        <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 whitespace-nowrap shrink-0">
                          ✓ Assigned
                        </span>
                      ) : (
                        <button
                          onClick={() => handleAssign(donor._id)}
                          disabled={assigning === donor._id}
                          className="btn-primary py-1.5 px-3 text-xs shrink-0 disabled:opacity-50"
                        >
                          {assigning === donor._id ? 'Assigning...' : 'Assign'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-bg-darker bg-gray-50 shrink-0">
            <button onClick={onClose} className="btn-ghost border border-bg-darker w-full py-2 text-sm">
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminRequests() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [assignModal, setAssignModal] = useState(null); // request object or null

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
    <div className="min-h-screen bg-bg">
      {/* Assign Donor Modal */}
      {assignModal && (
        <AssignDonorModal
          request={assignModal}
          onClose={() => setAssignModal(null)}
          onAssigned={fetchRequests}
        />
      )}

      <div className="page-header px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-2 min-w-0">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Admin</p>
            <h1 className="text-2xl md:text-3xl font-black truncate">Manage Requests</h1>
            <p className="text-gray-400 text-sm truncate">{user?.district} District</p>
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="border-b-2 border-bg-darker bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 overflow-x-auto">
          <div className="flex gap-0 whitespace-nowrap min-w-max">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setSearchParams({ status: tab })}
                className={`px-4 sm:px-5 py-3 text-sm font-semibold uppercase tracking-wide whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-primary text-primary'
                    : 'border-transparent text-text-muted hover:text-text-primary'
                }`}
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
          <EmptyState icon="📋" title={`No ${activeTab} requests`} description={`No blood requests with status "${activeTab}" in ${user?.district}.`} />
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <motion.div
                key={req._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`card ${req.urgency === 'emergency' ? 'border-l-4 border-l-red-600' : ''}`}
              >
                <div className="flex flex-col md:flex-row items-start justify-between gap-4 w-full overflow-hidden">
                  {/* Left — request info */}
                  <div className="flex items-start gap-3 flex-1 min-w-0 w-full">
                    <BloodGroupBadge group={req.bloodGroup} size="md" />
                    <div className="flex-1 min-w-0 flex flex-col gap-1">
                      <p className="font-bold text-sm md:text-base break-words">{req.hospital}</p>
                      <div className="flex flex-wrap gap-2 mb-1">
                        <UrgencyBadge urgency={req.urgency} />
                        <StatusBadge status={req.status} />
                      </div>
                      <p className="text-xs text-gray-500">{req.district}</p>
                      <p className="text-xs text-text-muted whitespace-nowrap overflow-hidden text-ellipsis">
                        {req.units} unit(s) of {req.bloodGroup} &bull; Req by {req.createdBy?.name || 'Unknown'} &bull; {timeAgo(req.createdAt)}
                      </p>
                      <p className="text-xs text-text-muted break-all">
                        Contact: <strong>{req.contactName}</strong> &bull; {req.contactPhone}
                      </p>
                      {req.additionalInfo && (
                        <p className="text-xs text-text-secondary italic break-words">"{req.additionalInfo}"</p>
                      )}
                      {req.adminNote && (
                        <p className="text-xs text-yellow-700 bg-yellow-50 border border-yellow-200 px-2 py-1 break-words">
                          Note: {req.adminNote}
                        </p>
                      )}

                      {/* Assigned Donor Indicator */}
                      {req.assignedDonor ? (
                        <div className="mt-1 flex items-center gap-2 bg-green-50 border border-green-200 px-2 py-1.5">
                          <UserPlus size={12} className="text-green-600 shrink-0" />
                          <span className="text-xs text-green-800 font-semibold">
                            Assigned: {req.assignedDonor?.name || 'Donor'} &bull; {req.assignedDonor?.phone || '—'}
                          </span>
                        </div>
                      ) : req.status === 'pending' && req.matchedDonors?.length > 0 ? (
                        <p className="text-xs text-blue-600 mt-1">
                          {req.matchedDonors.length} matched donor{req.matchedDonors.length !== 1 ? 's' : ''} available
                        </p>
                      ) : null}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 w-full md:min-w-48 md:w-auto mt-2 md:mt-0 shrink-0">
                    <Link to={`/requests/${req._id}`} className="btn-ghost border border-bg-darker flex items-center gap-2 text-xs justify-center py-2">
                      <Eye size={14} /> View Details
                    </Link>

                    {req.status === 'pending' && (
                      <button
                        onClick={() => setAssignModal(req)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 text-xs font-bold uppercase tracking-wide hover:bg-blue-700 justify-center"
                      >
                        <UserPlus size={14} /> Assign Donor
                      </button>
                    )}

                    {req.status === 'assigned' && (
                      <>
                        <button
                          onClick={() => setAssignModal(req)}
                          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 text-xs font-bold uppercase tracking-wide hover:bg-blue-700 justify-center"
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
