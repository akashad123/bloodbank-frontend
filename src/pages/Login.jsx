import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Droplets, Phone, Mail, Lock, Eye, EyeOff,
  ArrowRight, Home, Shield, ChevronDown, ChevronUp
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';

// ─── Left Panel — Desktop branding panel ─────────────────────────────────────
const LeftPanel = () => (
  <div className="hidden lg:flex lg:w-5/12 xl:w-[42%] bg-primary flex-col justify-between p-10 xl:p-14 relative overflow-hidden">
    {/* Decorative circles */}
    <div className="absolute -top-24 -right-24 w-72 h-72 bg-white/5 rounded-full pointer-events-none" />
    <div className="absolute bottom-20 -left-16 w-56 h-56 bg-white/5 rounded-full pointer-events-none" />

    {/* Logo */}
    <Link to="/" className="flex items-center gap-2 font-black text-xl text-white z-10">
      <Droplets size={30} fill="white" className="shrink-0" />
      <span className="flex items-center gap-2 whitespace-nowrap">
        <span>RED<span className="text-white/70">CONNECT</span></span>
        <span className="text-[10px] font-bold text-white/50 tracking-widest border-l-2 border-white/30 pl-2">
          DYFI MOKERI EAST
        </span>
      </span>
    </Link>

    {/* Hero Text */}
    <div className="z-10">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-0.5 bg-white/40" />
        <span className="text-white/60 text-xs font-semibold tracking-widest uppercase">Welcome Back</span>
      </div>
      <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight mb-4">
        EVERY DROP<br />
        <span className="text-white/70">COUNTS.</span>
      </h1>
      <p className="text-white/60 text-base max-w-xs leading-relaxed">
        Sign in with your mobile number to access the donor dashboard and respond to blood requests in your area.
      </p>
    </div>

    {/* Stats */}
    <div className="grid grid-cols-2 gap-3 z-10">
      {[
        { label: '14 Districts', sub: 'Kerala-wide network' },
        { label: '8 Blood Types', sub: 'All groups covered' },
        { label: '< 5 min', sub: 'Average response time' },
        { label: 'AI Guided', sub: 'Smart donor matching' },
      ].map(({ label, sub }) => (
        <div key={label} className="bg-white/10 border border-white/10 px-3 py-3 backdrop-blur-sm">
          <p className="text-white font-bold text-sm">{label}</p>
          <p className="text-white/50 text-xs mt-0.5">{sub}</p>
        </div>
      ))}
    </div>
  </div>
);

// ─── Animated Droplet Icon ────────────────────────────────────────────────────
const AnimatedDroplet = () => (
  <motion.div
    className="w-14 h-14 bg-primary flex items-center justify-center mb-6"
    animate={{ scale: [1, 1.08, 1] }}
    transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
  >
    <Droplets size={28} fill="white" className="text-white" />
  </motion.div>
);

// ─── Main Login Component ─────────────────────────────────────────────────────
export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Donor phone login state
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [loading, setLoading] = useState(false);

  // Admin login state — hidden by default
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminForm, setAdminForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);

  // ── Donor phone-only login ─────────────────────────────────────────────
  const handlePhoneLogin = async (e) => {
    e.preventDefault();
    setPhoneError('');

    // Client-side validation
    if (!phone.trim()) {
      setPhoneError('Please enter your mobile number');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(phone.trim())) {
      setPhoneError('Enter a valid 10-digit Indian mobile number');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { phone: phone.trim() });
      login(data.user, data.token);
      toast.success(`Logged in successfully as ${data.user.role === 'admin' ? 'ADMIN' : data.user.isQualifiedDonor ? 'DONOR' : 'REQUESTER'}`);
      navigate(data.user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Sign in failed. Please try again.';
      toast.error(msg);
      if (err.response?.status === 404 || msg.toLowerCase().includes('not registered') || msg.toLowerCase().includes('not found')) {
        setPhoneError('This mobile number is not registered. Please register first.');
      } else {
        setPhoneError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Admin email + password login ──────────────────────────────────────
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    if (!adminForm.email || !adminForm.password) {
      toast.error('Please enter email and password');
      return;
    }
    setAdminLoading(true);
    try {
      const { data } = await api.post('/auth/login', {
        email: adminForm.email,
        password: adminForm.password,
      });
      login(data.user, data.token);
      toast.success('Logged in successfully as ADMIN');
      navigate(data.user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setAdminLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* ── Left Branding Panel ────────────────────────── */}
      <LeftPanel />

      {/* ── Right Form Panel ───────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">

          {/* Mobile: Logo + Home */}
          <div className="flex items-center justify-between mb-8 lg:hidden">
            <Link to="/" className="flex items-center gap-2 font-black text-lg text-text-primary shrink-0">
              <Droplets size={24} className="text-primary shrink-0" fill="currentColor" />
              <span>RED<span className="text-primary">CONNECT</span></span>
            </Link>
            <Link to="/" className="text-text-muted hover:text-primary transition-colors">
              <Home size={20} />
            </Link>
          </div>

          {/* Desktop: Home icon */}
          <div className="hidden lg:flex justify-end mb-2">
            <Link to="/" className="text-text-muted hover:text-primary transition-colors p-1">
              <Home size={20} />
            </Link>
          </div>

          {/* ── Donor Login Section ──────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            {/* Premium Heading Section */}
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="mb-8"
            >
              <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-primary-50 border-l-4 border-primary mb-4 select-none">
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">
                  WELCOME BACK
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-text-primary tracking-tight leading-none">
                SIGN IN TO <span className="text-primary">SAVE LIVES.</span>
              </h2>
              <p className="text-text-secondary text-sm sm:text-base mt-3.5 leading-relaxed">
                Access the DYFI Mokeri East blood donor network and continue helping people across Kerala.
              </p>
            </motion.div>

            <form onSubmit={handlePhoneLogin} className="space-y-5">
              {/* Phone Input */}
              <div>
                <label className="label" htmlFor="login-phone">Mobile Number</label>
                <div className="flex">
                  <div className="flex items-center px-3 py-4 bg-gray-50 border border-r-0 border-gray-200 text-sm font-semibold text-text-secondary shrink-0 select-none">
                    🇮🇳 +91
                  </div>
                  <input
                    id="login-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (phoneError) setPhoneError('');
                    }}
                    className={`input flex-1 py-4 text-base ${
                      phoneError ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : ''
                    }`}
                    placeholder="9876543210"
                    pattern="[6-9][0-9]{9}"
                    maxLength={10}
                    autoComplete="tel"
                    inputMode="numeric"
                    autoFocus
                  />
                </div>
                <AnimatePresence>
                  {phoneError && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: 'auto' }}
                      exit={{ opacity: 0, y: -8, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-start gap-2.5 bg-red-50 border-l-4 border-primary p-3 mt-2.5 select-none">
                        <span className="text-primary mt-0.5 text-sm shrink-0">⚠️</span>
                        <div className="flex-1">
                          <p className="text-primary text-[10px] font-black uppercase tracking-wider">
                            Authentication Notice
                          </p>
                          <p className="text-text-primary text-xs mt-0.5 font-semibold leading-relaxed">
                            {phoneError}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* CTA Button */}
              <button
                id="login-submit"
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-4 text-sm flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing you in...
                  </span>
                ) : (
                  <>
                    Access Dashboard
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>

            {/* Register Link */}
            <p className="mt-6 text-sm text-text-muted text-center">
              New to RedConnect?{' '}
              <Link to="/register" className="text-primary font-bold hover:underline">
                Register here
              </Link>
            </p>

          </motion.div>
        </div>
      </div>
    </div>
  );
}
