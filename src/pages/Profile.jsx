import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, ToggleLeft, ToggleRight } from 'lucide-react';
import { BloodGroupBadge, EligibilityBanner, LoadingSpinner } from '../components/UI';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { KERALA_DISTRICTS, BLOOD_GROUPS, formatDate } from '../utils/constants';

export default function Profile() {
  const { user, updateUser } = useAuth();
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
      const { data } = await api.put('/users/profile', form);
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
    <div className="min-h-screen bg-bg">
      
      <div className="page-header">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <BloodGroupBadge group={user?.bloodGroup} size="lg" />
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">My Profile</p>
            <h1 className="text-3xl font-black">{user?.name}</h1>
            <p className="text-gray-400 text-sm">{user?.email} · {user?.district}</p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {/* Eligibility Banner */}
        {eligibility && (
          <EligibilityBanner
            isEligible={eligibility.isEligible}
            daysLeft={eligibility.daysUntilEligible}
            lastDonationDate={eligibility.lastDonationDate}
          />
        )}

        {/* Availability Toggle */}
        <div className="card flex items-center justify-between">
          <div>
            <p className="font-bold">Available for Donation</p>
            <p className="text-sm text-text-muted">Toggle this to pause/resume donation requests to you</p>
          </div>
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={user?.availabilityStatus ?? false}
              onChange={toggleAvailability}
              className="sr-only"
            />
            <div className={`w-12 h-6 relative transition-colors ${user?.availabilityStatus ? 'bg-green-500' : 'bg-bg-darker'}`}
              style={{ borderRadius: '9999px' }}>
              <div className={`absolute top-1 w-4 h-4 bg-white transition-transform ${user?.availabilityStatus ? 'translate-x-7' : 'translate-x-1'}`}
                style={{ borderRadius: '50%' }} />
            </div>
          </label>
        </div>

        {/* WhatsApp Alerts */}
        <div className="card flex items-center justify-between">
          <div>
            <p className="font-bold">WhatsApp Alerts</p>
            <p className="text-sm text-text-muted">Receive blood request alerts on WhatsApp when matched</p>
          </div>
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="whatsappEnabled"
              checked={form.whatsappEnabled}
              onChange={handleChange}
              className="sr-only"
            />
            <div className={`w-12 h-6 relative transition-colors ${form.whatsappEnabled ? 'bg-green-500' : 'bg-bg-darker'}`}
              style={{ borderRadius: '9999px' }}>
              <div className={`absolute top-1 w-4 h-4 bg-white transition-transform ${form.whatsappEnabled ? 'translate-x-7' : 'translate-x-1'}`}
                style={{ borderRadius: '50%' }} />
            </div>
          </label>
        </div>

        {/* Profile Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSave}
          className="card space-y-5"
        >
          <h2 className="font-black text-lg border-b border-bg-darker pb-3">Edit Profile</h2>

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

          <div>
            <label className="label">Last Donation Date</label>
            <input type="date" name="lastDonationDate" value={form.lastDonationDate} onChange={handleChange} className="input" max={new Date().toISOString().split('T')[0]} />
            <p className="text-xs text-text-muted mt-1">Used to calculate your eligibility. 90-day gap required between donations.</p>
          </div>

          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 px-8 py-3 disabled:opacity-60">
            <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </motion.form>
      </div>
    </div>
  );
}
