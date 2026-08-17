import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, Droplets, MapPin, CheckCircle, Clock } from 'lucide-react';
import { BloodGroupBadge, LoadingSpinner } from './UI';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function AssignDonorModal({ request, onClose, onAssigned }) {
  const [donors, setDonors] = useState([]);
  const [requestMeta, setRequestMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(null);

  useEffect(() => {
    api.get(`/requests/${request._id}/matches`)
      .then(({ data }) => {
        setDonors(data.donors || []);
        setRequestMeta(data.request || null);
      })
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

  const requesterPlace = requestMeta?.requesterPlace || request.createdBy?.place || null;
  const requesterName = requestMeta?.requesterName || request.createdBy?.name || request.contactName || 'Requester';

  // Sort donors to show same-place donors first for visual convenience, while preserving exact matches
  const sortedDonors = [...donors].sort((a, b) => {
    const aSame = Boolean(requesterPlace && a.place && requesterPlace.trim().toLowerCase() === a.place.trim().toLowerCase());
    const bSame = Boolean(requesterPlace && b.place && requesterPlace.trim().toLowerCase() === b.place.trim().toLowerCase());
    if (aSame && !bSame) return -1;
    if (!aSame && bSame) return 1;
    return 0;
  });

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Modal panel */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.18 }}
          className="bg-white w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden"
          style={{
            borderRadius: 0,
            border: '1px solid rgba(0,0,0,0.18)',
            boxShadow: '0 24px 60px rgba(0,0,0,0.25)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header — dark tone */}
          <div
            className="text-white px-5 py-4 flex items-center justify-between shrink-0"
            style={{
              background: 'linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 100%)',
              borderBottom: '3px solid #B03030',
            }}
          >
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5"
                  style={{
                    background: 'rgba(176,48,48,0.3)',
                    color: '#FFFFFF',
                    borderRadius: 0,
                  }}
                >
                  Admin Matching
                </span>
              </div>
              <h2 className="font-black text-lg mt-0.5">Assign Matched Donor</h2>
              <p className="text-xs mt-1 text-gray-300">
                <strong className="text-white">{request.bloodGroup}</strong> · {request.hospital} · {request.district}
              </p>
              {requesterPlace && (
                <p className="text-[11px] mt-0.5 text-gray-400 flex items-center gap-1">
                  <MapPin size={11} className="text-red-400" /> Requester Place: <strong className="text-gray-200">{requesterPlace}</strong> ({requesterName})
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1 transition-colors hover:text-white"
              style={{ color: '#888888' }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loading ? (
              <LoadingSpinner message="Finding matched donors in district..." />
            ) : sortedDonors.length === 0 ? (
              <div className="text-center py-10">
                <Droplets size={40} className="mx-auto mb-3" style={{ color: '#CCCCCC' }} />
                <p className="font-semibold" style={{ color: '#111111' }}>No matching donors found</p>
                <p className="text-sm mt-1" style={{ color: '#888888' }}>
                  No eligible, available {request.bloodGroup} donors found in {request.district}.
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between pb-1 border-b border-gray-100">
                  <p className="text-xs font-bold uppercase tracking-wide" style={{ color: '#888888' }}>
                    {sortedDonors.length} eligible {request.bloodGroup} donor{sortedDonors.length !== 1 ? 's' : ''} in {request.district}
                  </p>
                  {requesterPlace && (
                    <span className="text-[11px] text-text-muted">
                      Prioritizing local area: <strong className="text-text-primary">{requesterPlace}</strong>
                    </span>
                  )}
                </div>

                {sortedDonors.map((donor) => {
                  const isCurrentlyAssigned =
                    request.assignedDonor?._id === donor._id || request.assignedDonor === donor._id;
                  const isSamePlace = Boolean(
                    requesterPlace &&
                    donor.place &&
                    requesterPlace.trim().toLowerCase() === donor.place.trim().toLowerCase()
                  );

                  return (
                    <div
                      key={donor._id}
                      className="p-4 transition-all"
                      style={{
                        borderRadius: 0,
                        border: isCurrentlyAssigned
                          ? '2px solid #22C55E'
                          : isSamePlace
                          ? '2px solid #B03030'
                          : '1px solid rgba(0,0,0,0.12)',
                        background: isCurrentlyAssigned
                          ? '#F0FDF4'
                          : isSamePlace
                          ? '#FFFBFB'
                          : '#FAFAFA',
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <BloodGroupBadge group={donor.bloodGroup} size="sm" />
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="font-bold text-sm text-text-primary truncate">
                                {donor.name}
                              </p>
                              {isSamePlace && (
                                <span
                                  className="text-[10px] font-black uppercase px-2 py-0.5"
                                  style={{
                                    background: '#B03030',
                                    color: '#FFFFFF',
                                    borderRadius: 0,
                                  }}
                                >
                                  ★ Same Place
                                </span>
                              )}
                              <span className="text-[11px] text-text-muted font-medium">
                                Age 18+
                              </span>
                            </div>

                            {/* Place and District */}
                            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-secondary">
                              <span className="flex items-center gap-1 font-semibold text-text-primary">
                                <MapPin size={12} className="text-primary shrink-0" />
                                {donor.place ? `${donor.place}, ${donor.district}` : donor.district}
                              </span>
                              <a
                                href={`tel:${donor.phone}`}
                                className="flex items-center gap-1 text-primary hover:underline font-bold"
                              >
                                <Phone size={11} className="shrink-0" />
                                {donor.phone}
                              </a>
                            </div>

                            {/* Eligibility & Availability badges */}
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              <span
                                className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5"
                                style={{
                                  background: '#DCFCE7',
                                  color: '#166534',
                                  borderRadius: 0,
                                }}
                              >
                                <CheckCircle size={10} /> Eligible
                              </span>
                              <span
                                className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5"
                                style={{
                                  background: '#E0F2FE',
                                  color: '#075985',
                                  borderRadius: 0,
                                }}
                              >
                                <Clock size={10} /> Available
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Assign Button */}
                        <div className="shrink-0 pt-1">
                          {isCurrentlyAssigned ? (
                            <span
                              className="text-xs font-bold px-3 py-1.5 whitespace-nowrap block"
                              style={{ background: '#DCFCE7', color: '#166534', borderRadius: 0 }}
                            >
                              ✓ Assigned
                            </span>
                          ) : (
                            <button
                              onClick={() => handleAssign(donor._id)}
                              disabled={assigning === donor._id}
                              className="btn-primary py-2 px-4 text-xs font-bold uppercase tracking-wider shrink-0 disabled:opacity-50"
                              style={{ borderRadius: 0 }}
                            >
                              {assigning === donor._id ? 'Assigning...' : 'Assign Donor'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>

          {/* Footer */}
          <div
            className="px-4 py-3 shrink-0 flex items-center justify-between"
            style={{
              borderTop: '1px solid rgba(0,0,0,0.08)',
              background: '#F5F5F5',
            }}
          >
            <span className="text-xs text-text-muted">
              Select an eligible donor to send an immediate blood assignment alert.
            </span>
            <button
              onClick={onClose}
              className="py-1.5 px-4 text-xs font-semibold transition-all duration-200"
              style={{
                border: '1px solid rgba(0,0,0,0.15)',
                color: '#444444',
                background: '#FFFFFF',
                borderRadius: 0,
              }}
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
