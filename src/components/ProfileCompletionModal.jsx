import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { KERALA_DISTRICTS } from '../utils/constants';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function ProfileCompletionModal() {
  const { user, updateUser } = useAuth();

  // Profile is incomplete if user is logged in, not an admin, and place is missing or empty
  const isProfileIncomplete = Boolean(
    user &&
    user.role !== 'admin' &&
    (!user.place || !user.place.trim())
  );

  const [place, setPlace] = useState('');
  const [district, setDistrict] = useState(user?.district || 'Kannur');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Keep district in sync if user profile loads after component mounts
  useEffect(() => {
    if (user?.district) {
      setDistrict(user.district);
    }
  }, [user?.district]);

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }

    const trimmedPlace = place.trim();
    if (!trimmedPlace) {
      setError('Please enter your place / locality');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const targetDistrict = user?.district || district || 'Kannur';
      const payload = {
        place: trimmedPlace,
        district: targetDistrict,
      };

      const { data } = await api.put('/users/profile', payload);

      if (data?.user) {
        // Update user in AuthContext immediately with fresh user data from API
        updateUser(data.user);
        toast.success('Profile completed successfully! Thank you.');
      } else {
        throw new Error('Failed to obtain updated profile data');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to update profile. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isProfileIncomplete && (
        <motion.div
          key="profile-completion-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        >
          <motion.div
            key="profile-completion-card"
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.2 }}
            className="bg-white w-full max-w-md overflow-hidden border border-gray-200 shadow-2xl"
            style={{
              borderRadius: 0,
              borderTop: '4px solid #B03030',
            }}
          >
            {/* Header */}
            <div className="p-6 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5"
                  style={{
                    background: 'rgba(176,48,48,0.1)',
                    color: '#B03030',
                    border: '1px solid rgba(176,48,48,0.2)',
                    borderRadius: 0,
                  }}
                >
                  Action Required
                </span>
              </div>
              <h2 className="text-xl font-black text-text-primary flex items-center gap-2">
                <MapPin size={22} className="text-primary" />
                Complete Your Profile
              </h2>
              <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">
                Please add your place/locality to continue using RedConnect. This helps district coordinators match nearby donors in emergency blood requests.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 flex items-center gap-2 text-xs font-semibold text-red-700">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {!user?.district && (
                <div>
                  <label className="label">District in Kerala</label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="select w-full"
                    required
                  >
                    {KERALA_DISTRICTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="label">Place / Locality</label>
                <input
                  type="text"
                  value={place}
                  onChange={(e) => {
                    setPlace(e.target.value);
                    if (error) setError('');
                  }}
                  className={`input w-full ${error ? 'border-red-400' : ''}`}
                  placeholder="e.g. Thalassery, Mokeri, Payyannur, Kannur"
                  autoFocus
                  required
                />
                <p className="text-[11px] text-text-muted mt-1">
                  Enter your general area or town (no street/house address needed).
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  onClick={(e) => {
                    if (!saving) handleSubmit(e);
                  }}
                  className="btn-primary w-full py-3 text-sm font-bold tracking-wide uppercase flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  style={{ borderRadius: 0 }}
                >
                  {saving ? (
                    <span>Updating Profile...</span>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      <span>Update Profile</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
