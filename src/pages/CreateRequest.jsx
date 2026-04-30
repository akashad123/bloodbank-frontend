import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { KERALA_DISTRICTS, BLOOD_GROUPS } from '../utils/constants';
import { useAuth } from '../contexts/AuthContext';

export default function CreateRequest() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    bloodGroup: '', units: 1, hospital: '',
    district: user?.district || '', urgency: 'normal',
    contactName: user?.name || '', contactPhone: user?.phone || '',
    additionalInfo: '',
  });

  const [hospitals, setHospitals] = useState([]);
  const [loadingHospitals, setLoadingHospitals] = useState(false);

  useEffect(() => {
    if (form.district) {
      setLoadingHospitals(true);
      api.get(`/hospitals/${form.district}`)
        .then(({ data }) => setHospitals(data.hospitals))
        .catch(() => setHospitals([]))
        .finally(() => setLoadingHospitals(false));
    } else {
      setHospitals([]);
    }
  }, [form.district]);

  const handleChange = (e) => {
    const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
    const name = e.target.name;
    
    if (name === 'district') {
      setForm({ ...form, district: value, hospital: '' });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/requests', form);
      toast.success('Blood request submitted! Awaiting admin approval.');
      navigate('/requests');
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors?.length) toast.error(errors[0].message);
      else toast.error(err.response?.data?.message || 'Failed to create request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg">
      
      <div className="page-header">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">New Request</p>
          <h1 className="text-3xl font-black">Blood Request Form</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="border-2 border-bg-darker p-4 bg-bg-dark mb-6 flex items-start gap-3">
          <AlertTriangle size={18} className="text-yellow-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-text-secondary">
            Your request will be reviewed by the <strong>{form.district}</strong> district admin before going live.
            Emergency requests are prioritized. Please provide accurate contact details.
          </p>
        </div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="card space-y-6"
        >
          {/* Urgency toggle */}
          <div>
            <label className="label">Urgency Level</label>
            <div className="grid grid-cols-2 gap-3">
              {['normal', 'emergency'].map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setForm({ ...form, urgency: u })}
                  className={`py-3 font-bold text-sm uppercase tracking-wide border-2 transition-all ${
                    form.urgency === u
                      ? u === 'emergency' ? 'bg-red-600 text-white border-red-600' : 'bg-text-primary text-white border-text-primary'
                      : 'bg-white text-text-secondary border-bg-darker hover:border-text-primary'
                  }`}
                >
                  {u === 'emergency' ? '🚨 Emergency' : '🩸 Normal'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="label">Blood Group Required</label>
              <select name="bloodGroup" value={form.bloodGroup} onChange={handleChange} className="select" required>
                <option value="">Select Blood Group</option>
                {BLOOD_GROUPS.map((bg) => <option key={bg} value={bg}>{bg}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Units Required</label>
              <input type="number" name="units" value={form.units} onChange={handleChange} min={1} max={20} className="input" required />
            </div>
          </div>

          <div>
            <label className="label">District</label>
            <select name="district" value={form.district} onChange={handleChange} className="select" required>
              <option value="">Select District</option>
              {KERALA_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div>
            <label className="label">Hospital Name</label>
            <select 
              name="hospital" 
              value={form.hospital} 
              onChange={handleChange} 
              className="select" 
              required
              disabled={!form.district || loadingHospitals}
            >
              <option value="">{loadingHospitals ? 'Loading hospitals...' : 'Select Hospital'}</option>
              {hospitals.map((h) => <option key={h.name} value={h.name}>{h.name}</option>)}
            </select>
          </div>

          <div className="section-divider" />

          <div className="grid md:grid-cols-2 gap-5">
            <div>
              <label className="label">Contact Person Name</label>
              <input type="text" name="contactName" value={form.contactName} onChange={handleChange} className="input" required />
            </div>
            <div>
              <label className="label">Contact Phone</label>
              <input type="tel" name="contactPhone" value={form.contactPhone} onChange={handleChange} className="input" pattern="[6-9][0-9]{9}" required />
            </div>
          </div>

          <div>
            <label className="label">Additional Information <span className="text-text-muted font-normal normal-case">(optional)</span></label>
            <textarea name="additionalInfo" value={form.additionalInfo} onChange={handleChange} className="input h-24 resize-none" placeholder="Patient details, blood type compatibility notes, etc." />
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => navigate('/requests')} className="btn-ghost border border-bg-darker px-6 py-3">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 py-3 disabled:opacity-60">
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
