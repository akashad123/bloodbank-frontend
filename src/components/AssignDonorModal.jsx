import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Phone, Droplets } from 'lucide-react';
import { BloodGroupBadge, LoadingSpinner } from './UI';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function AssignDonorModal({ request, onClose, onAssigned }) {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(null);

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
          className="bg-white w-full max-w-md max-h-[80vh] flex flex-col overflow-hidden"
          style={{
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
              <h2 className="font-black text-lg">Assign Donor</h2>
              <p className="text-xs mt-0.5" style={{ color: '#999999' }}>
                {request.bloodGroup} · {request.hospital} · {request.district}
              </p>
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
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <LoadingSpinner message="Finding matched donors..." />
            ) : donors.length === 0 ? (
              <div className="text-center py-10">
                <Droplets size={40} className="mx-auto mb-3" style={{ color: '#CCCCCC' }} />
                <p className="font-semibold" style={{ color: '#111111' }}>No matching donors found</p>
                <p className="text-sm mt-1" style={{ color: '#888888' }}>
                  No eligible {request.bloodGroup} donors in {request.district}.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: '#888888' }}>
                  {donors.length} eligible donor{donors.length !== 1 ? 's' : ''} found
                </p>
                {donors.map((donor) => {
                  const isCurrentlyAssigned =
                    request.assignedDonor?._id === donor._id || request.assignedDonor === donor._id;
                  return (
                    <div
                      key={donor._id}
                      className="flex items-center justify-between gap-3 p-3 transition-colors"
                      style={{
                        border: isCurrentlyAssigned
                          ? '1.5px solid #22C55E'
                          : '1px solid rgba(0,0,0,0.12)',
                        background: isCurrentlyAssigned ? '#F0FDF4' : '#FAFAFA',
                      }}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <BloodGroupBadge group={donor.bloodGroup} size="sm" />
                        <div className="min-w-0">
                          <p className="font-bold text-sm truncate" style={{ color: '#111111' }}>
                            {donor.name}
                          </p>
                          <p className="text-xs flex items-center gap-1" style={{ color: '#888888' }}>
                            <Phone size={10} /> {donor.phone}
                          </p>
                          <p className="text-xs" style={{ color: '#AAAAAA' }}>{donor.district}</p>
                        </div>
                      </div>
                      {isCurrentlyAssigned ? (
                        <span
                          className="text-xs font-bold px-2 py-1 whitespace-nowrap shrink-0"
                          style={{ background: '#DCFCE7', color: '#166534' }}
                        >
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
          <div
            className="px-4 py-3 shrink-0"
            style={{
              borderTop: '1px solid rgba(0,0,0,0.08)',
              background: '#F5F5F5',
            }}
          >
            <button
              onClick={onClose}
              className="w-full py-2 text-sm font-semibold transition-all duration-200"
              style={{
                border: '1px solid rgba(0,0,0,0.15)',
                color: '#444444',
                background: '#FFFFFF',
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
