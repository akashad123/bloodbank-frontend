import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Droplets, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { KERALA_DISTRICTS, BLOOD_GROUPS } from '../utils/constants';
import { Home } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '',
    bloodGroup: '', district: '', lastDonationDate: '',
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleNext = (e) => {
    e.preventDefault();
    if (step === 1) {
      if (!form.name || !form.email || !form.phone || !form.password) {
        toast.error('Please fill all fields'); return;
      }
      if (form.password.length < 6) { toast.error('Password must be 6+ characters'); return; }
    }
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.bloodGroup || !form.district) { toast.error('Select blood group and district'); return; }
    setLoading(true);
    try {
      const payload = { ...form, lastDonationDate: form.lastDonationDate || undefined };
      const { data } = await api.post('/auth/register', payload);
      login(data.user, data.token);
      toast.success('Welcome to RedConnect!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-6 relative">
      <Link to="/" className="absolute top-[20px] right-[20px] text-text-primary hover:text-primary transition-colors">
        <Home size={24} />
      </Link>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        {/* Header */}
        <Link to="/" className="flex items-center gap-2 font-black text-xl mb-8">
          <Droplets size={24} className="text-primary" fill="currentColor" />
          RED<span className="text-primary">CONNECT</span>
        </Link>

        <div className="card border-t-4 border-t-primary">
          {/* Step Indicator */}
          <div className="flex items-center gap-3 mb-8">
            <div className={`flex items-center justify-center w-8 h-8 text-xs font-bold ${step >= 1 ? 'bg-primary text-white' : 'bg-bg-dark text-text-muted'}`}>1</div>
            <div className={`flex-1 h-0.5 ${step >= 2 ? 'bg-primary' : 'bg-bg-darker'}`} />
            <div className={`flex items-center justify-center w-8 h-8 text-xs font-bold ${step >= 2 ? 'bg-primary text-white' : 'bg-bg-dark text-text-muted'}`}>2</div>
          </div>

          {step === 1 && (
            <motion.form
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onSubmit={handleNext}
              className="space-y-5"
            >
              <div>
                <h2 className="text-2xl font-black mb-1">Create Account</h2>
                <p className="text-text-muted text-sm">Step 1 of 2 — Personal Information</p>
              </div>

              <div>
                <label className="label">Full Name</label>
                <input type="text" name="name" value={form.name} onChange={handleChange} className="input" placeholder="Rajan Pillai" required />
              </div>

              <div>
                <label className="label">Email Address</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} className="input" placeholder="you@example.com" required />
              </div>

              <div>
                <label className="label">Phone Number</label>
                <input type="tel" name="phone" value={form.phone} onChange={handleChange} className="input" placeholder="9876543210" pattern="[6-9][0-9]{9}" required />
              </div>

              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange} className="input pr-12" placeholder="Min 6 characters" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button type="submit" className="btn-primary w-full py-4">Next →</button>
            </motion.form>
          )}

          {step === 2 && (
            <motion.form
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <div>
                <h2 className="text-2xl font-black mb-1">Donor Profile</h2>
                <p className="text-text-muted text-sm">Step 2 of 2 — Donation Details</p>
              </div>

              <div>
                <label className="label">Blood Group</label>
                <select name="bloodGroup" value={form.bloodGroup} onChange={handleChange} className="select" required>
                  <option value="">Select Blood Group</option>
                  {BLOOD_GROUPS.map((bg) => <option key={bg} value={bg}>{bg}</option>)}
                </select>
              </div>

              <div>
                <label className="label">District</label>
                <select name="district" value={form.district} onChange={handleChange} className="select" required>
                  <option value="">Select District</option>
                  {KERALA_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>

              <div>
                <label className="label">Last Donation Date <span className="text-text-muted font-normal normal-case">(optional)</span></label>
                <input type="date" name="lastDonationDate" value={form.lastDonationDate} onChange={handleChange} className="input" max={new Date().toISOString().split('T')[0]} />
              </div>

              <div className="border border-bg-darker p-4 bg-bg text-xs text-text-muted">
                <p className="font-semibold text-text-secondary mb-1">Eligibility Rule</p>
                A 90-day gap is required between donations. Your eligibility will be calculated automatically.
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="btn-ghost border border-bg-darker px-6 py-4 flex-1">
                  ← Back
                </button>
                <button type="submit" disabled={loading} className="btn-primary flex-1 py-4 disabled:opacity-60">
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </div>
            </motion.form>
          )}
        </div>

        <p className="mt-4 text-sm text-text-muted text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
