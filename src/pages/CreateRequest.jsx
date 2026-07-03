import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { KERALA_DISTRICTS, BLOOD_GROUPS } from '../utils/constants';
import { useAuth } from '../contexts/AuthContext';
import { PageHeader } from '../components/UI';
import { fetchHospitalsByDistrict } from '../api/hospitals';

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
      fetchHospitalsByDistrict(form.district)
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
    <div className="min-h-screen bg-gray-50/50">
      
      <PageHeader
        eyebrow="New Request"
        title="Blood Request Form"
        subtitle="Fill in the details below — your request will be reviewed by the district admin"
        maxWidth="max-w-3xl"
      />

      <div className="max-w-3xl mx-auto px-6 pt-6 pb-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex items-start gap-3 shadow-sm">
          <AlertTriangle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-yellow-800 font-medium">
            Your request will be reviewed by the <strong className="font-bold">{form.district}</strong> district admin before going live.
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
                  className={`py-3 font-bold text-sm uppercase tracking-wide border-2 rounded-xl transition-all ${
                    form.urgency === u
                      ? u === 'emergency' ? 'bg-primary text-white border-primary shadow-sm' : 'bg-text-primary text-white border-text-primary shadow-sm'
                      : 'bg-white text-text-secondary border-gray-200 hover:border-gray-300'
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
            <button type="button" onClick={() => navigate('/requests')} className="btn-ghost bg-white border border-gray-200 px-6 py-3 rounded-xl shadow-sm">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 py-3 disabled:opacity-60">
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
