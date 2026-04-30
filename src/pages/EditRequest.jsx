import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, Edit } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { KERALA_DISTRICTS, BLOOD_GROUPS } from '../utils/constants';
import { useAuth } from '../contexts/AuthContext';

export default function EditRequest() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [form, setForm] = useState({
    bloodGroup: '', units: 1, hospital: '',
    district: '', urgency: 'normal',
    contactName: '', contactPhone: '',
    additionalInfo: '',
  });

  const [hospitals, setHospitals] = useState([]);
  const [loadingHospitals, setLoadingHospitals] = useState(false);

  // Fetch existing request data
  useEffect(() => {
    console.log("Edit ID:", id);
    api.get(`/requests/${id}`)
      .then(({ data }) => {
        const r = data.request;
        setForm({
          bloodGroup: r.bloodGroup || '',
          units: r.units || 1,
          hospital: r.hospital || '',
          district: r.district || '',
          urgency: r.urgency || 'normal',
          contactName: r.contactName || '',
          contactPhone: r.contactPhone || '',
          additionalInfo: r.additionalInfo || '',
        });
      })
      .catch((err) => {
        toast.error('Failed to load request data');
        navigate('/requests');
      })
      .finally(() => setFetching(false));
  }, [id, navigate]);

  // Fetch hospitals when district changes
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
      await api.put(`/requests/${id}`, form);
      toast.success('Blood request updated successfully!');
      navigate('/requests');
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors?.length) toast.error(errors[0].message);
      else toast.error(err.response?.data?.message || 'Failed to update request');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <p className="text-text-muted font-bold animate-pulse">Loading request details...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="page-header">
        <div className="max-w-3xl mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Edit Request</p>
          <h1 className="text-3xl font-black">Update Request Form</h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="border-2 border-bg-darker p-4 bg-bg-dark mb-6 flex items-start gap-3">
          <AlertTriangle size={18} className="text-yellow-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-text-secondary">
            You are editing an existing request in <strong>{form.district || 'your district'}</strong>. 
            Ensure all details are accurate as this affects donor matching.
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
              {/* If the current selected hospital is not in the fetched list yet, show it anyway so it doesn't blank out on first load */}
              {form.hospital && !hospitals.some(h => h.name === form.hospital) && (
                <option value={form.hospital}>{form.hospital}</option>
              )}
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
            <button type="submit" disabled={loading} className="btn-primary flex-1 py-3 flex items-center justify-center gap-2 disabled:opacity-60">
              <Edit size={18} />
              {loading ? 'Updating...' : 'Update Request'}
            </button>
          </div>
        </motion.form>
      </div>
    </div>
  );
}
