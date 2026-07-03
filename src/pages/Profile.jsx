import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, ToggleLeft, ToggleRight } from 'lucide-react';
import { BloodGroupBadge, EligibilityBanner, LoadingSpinner, PageHeader } from '../components/UI';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { KERALA_DISTRICTS, BLOOD_GROUPS, formatDate } from '../utils/constants';

export default function Profile() {
  const { user, updateUser } = useAuth();
  const isDonor = user?.role === 'donor';
  const [eligibility, setEligibility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', phone: '', bloodGroup: '', district: '',
    lastDonationDate: '', whatsappEnabled: false,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eRes] = await Promise.all([api.get('/users/eligibility')]);
        setEligibility(eRes.data);
        setForm({
          name: user?.name || '',
          phone: user?.phone || '',
          bloodGroup: user?.bloodGroup || '',
          district: user?.district || '',
          lastDonationDate: user?.lastDonationDate ? user.lastDonationDate.split('T')[0] : '',
          whatsappEnabled: user?.whatsappEnabled || false,
        });
      } catch { } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form };
      if (!isDonor) {
        delete payload.lastDonationDate;
      }
      const { data } = await api.put('/users/profile', payload);
      updateUser(data.user);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setSaving(false); }
  };

  const toggleAvailability = async () => {
    try {
      const { data } = await api.put('/users/availability');
      updateUser({ ...user, availabilityStatus: data.availabilityStatus });
      toast.success(data.message);
    } catch { toast.error('Failed to toggle availability'); }
  };

  if (loading) return <><LoadingSpinner /></>;

  return (
    <div className="min-h-screen bg-gray-50/50">
      
      <PageHeader
        eyebrow="My Profile"
        title={user?.name ?? ''}
        subtitle={[
          user?.phone ? `+91 ${user.phone}` : user?.email,
          user?.district,
          user?.bloodGroup,
        ].filter(Boolean).join('  ·  ')}
        maxWidth="max-w-3xl"
      />

      <div className="max-w-3xl px-6 pt-6 pb-8 space-y-6">
        
        {/* Account Identity & Permissions Card */}
        <div className="bg-white p-6 shadow-sm border border-gray-200 flex flex-col gap-5" style={{ borderRadius: '0' }}>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Account Identity</span>
            <div className="flex flex-wrap items-center gap-3 mt-1.5">
              {isDonor ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 border border-red-200 text-red-800 text-xs font-black tracking-wider uppercase select-none">
                  🔴 Donor Account
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 border border-gray-300 text-gray-700 text-xs font-black tracking-wider uppercase select-none">
                  ⚫ Requester Account
                </span>
              )}
              <span className="text-sm font-bold text-text-secondary">
                Status: <strong className={isDonor ? "text-primary" : "text-text-primary"}>
                  {isDonor ? (user?.donorStatus || 'Pending Pre-screening') : 'Verified Requester'}
                </strong>
              </span>
            </div>
          </div>

          <div className="border-t border-gray-150 pt-4">
            <p className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-3">Permissions & Available Features:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {isDonor ? (
                <>
                  <div className="flex items-center gap-2 text-xs text-green-700 font-semibold bg-green-50 p-2.5 border border-green-200" style={{ borderRadius: '0' }}>
                    <span className="text-sm">✓</span> Donate Blood (Subject to status check)
                  </div>
                  <div className="flex items-center gap-2 text-xs text-green-700 font-semibold bg-green-50 p-2.5 border border-green-200" style={{ borderRadius: '0' }}>
                    <span className="text-sm">✓</span> Create Emergency Blood Requests
                  </div>
                  <div className="flex items-center gap-2 text-xs text-green-700 font-semibold bg-green-50 p-2.5 border border-green-200" style={{ borderRadius: '0' }}>
                    <span className="text-sm">✓</span> Access AI Chatbot Assistant
                  </div>
                  <div className="flex items-center gap-2 text-xs text-green-700 font-semibold bg-green-50 p-2.5 border border-green-200" style={{ borderRadius: '0' }}>
                    <span className="text-sm">✓</span> Generate & Download Certificates
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-xs text-green-700 font-semibold bg-green-50 p-2.5 border border-green-200" style={{ borderRadius: '0' }}>
                    <span className="text-sm">✓</span> Create Emergency Blood Requests
                  </div>
                  <div className="flex items-center gap-2 text-xs text-green-700 font-semibold bg-green-50 p-2.5 border border-green-200" style={{ borderRadius: '0' }}>
                    <span className="text-sm">✓</span> Track Real-time Request Status
                  </div>
                  <div className="flex items-center gap-2 text-xs text-green-700 font-semibold bg-green-50 p-2.5 border border-green-200" style={{ borderRadius: '0' }}>
                    <span className="text-sm">✓</span> Contact DYFI Support Coordinators
                  </div>
                  <div className="flex items-center gap-2 text-xs text-red-750 font-semibold bg-red-50 p-2.5 border border-red-200 animate-pulse" style={{ borderRadius: '0' }}>
                    <span className="text-sm">✗</span> Blood Donation (Unavailable for Requesters)
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Eligibility Banner & Donor Status */}
        {isDonor && (
          <div className="space-y-4">
            {eligibility && (
              <EligibilityBanner
                isEligible={eligibility.isEligible}
                daysLeft={eligibility.daysUntilEligible}
                lastDonationDate={eligibility.lastDonationDate}
              />
            )}
            <div className="bg-white p-4 shadow-sm border border-gray-150 flex items-center justify-between" style={{ borderRadius: '0' }}>
              <span className="text-sm font-bold text-text-secondary">Donor Medical Status</span>
              <span className={`inline-flex items-center px-3 py-1 text-xs font-black border uppercase tracking-wider ${
                user?.donorStatus === 'Eligible to Donate' ? 'bg-green-50 border-green-200 text-green-700' :
                user?.donorStatus === 'Waiting Period Active' ? 'bg-amber-50 border-amber-250 text-amber-800' :
                user?.donorStatus === 'Eligibility Unknown' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                user?.donorStatus === 'Screening Failed' ? 'bg-red-50 border-red-200 text-red-700' :
                'bg-gray-50 border-gray-200 text-text-muted'
              }`} style={{ borderRadius: '0' }}>
                {user?.donorStatus || 'Pending Screening'}
              </span>
            </div>
          </div>
        )}

        {/* Availability Toggle */}
        {isDonor && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="font-bold text-text-primary">Available for Donation</p>
              <p className="text-sm text-text-secondary">Toggle this to pause/resume donation requests to you</p>
            </div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={user?.availabilityStatus ?? false}
                onChange={toggleAvailability}
                className="sr-only"
              />
              <div className={`w-14 h-7 relative transition-colors ${user?.availabilityStatus ? 'bg-green-500' : 'bg-gray-200'}`}
                style={{ borderRadius: '9999px' }}>
                <div className={`absolute top-1 w-5 h-5 bg-white shadow-sm transition-transform ${user?.availabilityStatus ? 'translate-x-8' : 'translate-x-1'}`}
                  style={{ borderRadius: '50%' }} />
              </div>
            </label>
          </div>
        )}

        {/* WhatsApp Alerts */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="font-bold text-text-primary">WhatsApp Alerts</p>
            <p className="text-sm text-text-secondary">Receive blood request alerts on WhatsApp when matched</p>
          </div>
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="whatsappEnabled"
              checked={form.whatsappEnabled}
              onChange={handleChange}
              className="sr-only"
            />
            <div className={`w-14 h-7 relative transition-colors ${form.whatsappEnabled ? 'bg-green-500' : 'bg-gray-200'}`}
              style={{ borderRadius: '9999px' }}>
              <div className={`absolute top-1 w-5 h-5 bg-white shadow-sm transition-transform ${form.whatsappEnabled ? 'translate-x-8' : 'translate-x-1'}`}
                style={{ borderRadius: '50%' }} />
            </div>
          </label>
        </div>

        {/* Profile Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSave}
          className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6"
        >
          <h2 className="font-black text-xl border-b border-gray-100 pb-4 text-text-primary">Edit Profile</h2>

          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="label">Full Name</label>
              <input type="text" name="name" value={form.name} onChange={handleChange} className="input" required />
            </div>
            <div>
              <label className="label">Phone</label>
              <input type="tel" name="phone" value={form.phone} onChange={handleChange} className="input" pattern="[6-9][0-9]{9}" required />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="label">Blood Group</label>
              <select name="bloodGroup" value={form.bloodGroup} onChange={handleChange} className="select">
                {BLOOD_GROUPS.map((bg) => <option key={bg} value={bg}>{bg}</option>)}
              </select>
            </div>
            <div>
              <label className="label">District</label>
              <select name="district" value={form.district} onChange={handleChange} className="select">
                {KERALA_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          {isDonor && (
            <div>
              <label className="label">Last Donation Date</label>
              <input type="date" name="lastDonationDate" value={form.lastDonationDate} onChange={handleChange} className="input" max={new Date().toISOString().split('T')[0]} />
              <p className="text-xs text-text-secondary mt-2">Used to calculate your eligibility. 90-day gap required between donations.</p>
            </div>
          )}

          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 px-8 py-3 disabled:opacity-60">
            <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </motion.form>
      </div>
    </div>
  );
}
