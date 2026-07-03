import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Droplets, Phone, User, ChevronRight, ChevronLeft,
  CheckCircle2, Heart, ArrowRight, Home, SkipForward,
  ShieldCheck, AlertTriangle, Syringe, Scale, Cigarette,
  Wine, Activity, RotateCcw
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { KERALA_DISTRICTS, BLOOD_GROUPS } from '../utils/constants';

// ─── Blood Group Tile ─────────────────────────────────────────────────────────
const BloodGroupTile = ({ group, selected, onSelect }) => (
  <button
    type="button"
    onClick={() => onSelect(group)}
    className={`
      relative flex flex-col items-center justify-center h-14 font-black text-base
      border-2 transition-all duration-200 active:scale-95
      ${selected
        ? 'bg-primary text-white border-primary shadow-lg shadow-primary/25'
        : 'bg-white text-text-primary border-gray-200 hover:border-primary/50 hover:bg-primary-50'
      }
    `}
  >
    {selected && <CheckCircle2 size={11} className="absolute top-1 right-1 text-white/80" />}
    <span className="text-base leading-none">{group}</span>
  </button>
);

// ─── Left Branding Panel ──────────────────────────────────────────────────────
const LeftPanel = ({ track }) => (
  <div className="hidden lg:flex lg:w-5/12 xl:w-[42%] bg-primary flex-col justify-between p-10 xl:p-14 relative overflow-hidden">
    <div className="absolute -top-24 -right-24 w-72 h-72 bg-white/5 rounded-full pointer-events-none" />
    <div className="absolute bottom-20 -left-16 w-56 h-56 bg-white/5 rounded-full pointer-events-none" />
    <Link to="/" className="flex items-center gap-2 font-black text-xl text-white z-10">
      <Droplets size={30} fill="white" className="shrink-0" />
      <span className="flex items-center gap-2 whitespace-nowrap">
        <span>RED<span className="text-white/70">CONNECT</span></span>
        <span className="text-[10px] font-bold text-white/50 tracking-widest border-l-2 border-white/30 pl-2">
          DYFI MOKERI EAST
        </span>
      </span>
    </Link>
    <div className="z-10">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-0.5 bg-white/40" />
        <span className="text-white/60 text-xs font-semibold tracking-widest uppercase">
          {track === 'donor' ? 'Donor Registration' : track === 'requester' ? 'Requester Registration' : 'Join RedConnect'}
        </span>
      </div>
      <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight mb-4">
        {track === 'donor' ? <>SAVE<br /><span className="text-white/70">LIVES.</span></> :
         track === 'requester' ? <>GET<br /><span className="text-white/70">HELP.</span></> :
         <>BE THE<br /><span className="text-white/70">LIFELINE.</span></>}
      </h1>
      <p className="text-white/60 text-base max-w-xs leading-relaxed">
        {track === 'donor'
          ? 'Your blood can save up to 3 lives. Join our verified donor network today.'
          : track === 'requester'
          ? 'Request blood quickly and connect with verified donors in your district.'
          : 'Join the RED CONNECT blood donation network serving 14 districts of Kerala.'}
      </p>
    </div>
    <div className="grid grid-cols-2 gap-3 z-10">
      {[
        { label: '14 Districts', sub: 'Kerala-wide network' },
        { label: '8 Blood Types', sub: 'All groups covered' },
        { label: '< 60 seconds', sub: 'Quick registration' },
        { label: 'DYFI Verified', sub: 'Trusted platform' },
      ].map(({ label, sub }) => (
        <div key={label} className="bg-white/10 border border-white/10 px-3 py-3 backdrop-blur-sm">
          <p className="text-white font-bold text-sm">{label}</p>
          <p className="text-white/50 text-xs mt-0.5">{sub}</p>
        </div>
      ))}
    </div>
  </div>
);

// ─── Step Indicator ───────────────────────────────────────────────────────────
const StepIndicator = ({ step, total, labels = [] }) => (
  <div className="flex items-center gap-1 mb-8">
    {Array.from({ length: total }).map((_, i) => (
      <div key={i} className="flex items-center gap-1 flex-1">
        <div className={`
          flex items-center justify-center w-7 h-7 text-xs font-bold transition-all duration-300 shrink-0
          ${i + 1 < step ? 'bg-primary text-white' : i + 1 === step ? 'bg-primary text-white ring-4 ring-primary/20' : 'bg-gray-100 text-text-muted'}
        `}>
          {i + 1 < step ? <CheckCircle2 size={13} /> : i + 1}
        </div>
        {labels[i] && (
          <span className={`text-[10px] font-bold uppercase tracking-wide hidden sm:block ${i + 1 === step ? 'text-primary' : 'text-text-muted'}`}>
            {labels[i]}
          </span>
        )}
        {i < total - 1 && (
          <div className={`flex-1 h-0.5 transition-all duration-500 mx-1 ${step > i + 1 ? 'bg-primary' : 'bg-gray-100'}`} />
        )}
      </div>
    ))}
  </div>
);

// ─── Eligibility Validation Logic ─────────────────────────────────────────────
const checkEligibility = (screening) => {
  const reasons = [];
  if (!screening.ageConfirmed) reasons.push('You must be 18 years or older to donate blood.');
  if (!screening.weight || Number(screening.weight) < 50)
    reasons.push('Minimum weight requirement is 50kg for blood donation.');
  return { passed: reasons.length === 0, reasons };
};

// ─── Option Button (Yes/No/Occasionally) ─────────────────────────────────────
const OptionBtn = ({ label, selected, onClick, variant = 'default' }) => {
  const colors = {
    default: selected ? 'bg-primary text-white border-primary' : 'bg-white text-text-primary border-gray-200 hover:border-primary/40',
    danger: selected ? 'bg-red-600 text-white border-red-600' : 'bg-white text-text-primary border-gray-200 hover:border-red-300',
    success: selected ? 'bg-green-600 text-white border-green-600' : 'bg-white text-text-primary border-gray-200 hover:border-green-300',
    amber: selected ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-text-primary border-gray-200 hover:border-amber-300',
  };
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 py-3 text-sm font-bold border-2 transition-all duration-200 active:scale-95 ${colors[variant]}`}
    >
      {label}
    </button>
  );
};

// ─── Main Register Component ──────────────────────────────────────────────────
export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  // Main flow state: 'select' | 'requester' | 'screening' | 'screened' | 'donor-identity' | 'donor-profile'
  const [phase, setPhase] = useState('select');
  const [track, setTrack] = useState(''); // 'donor' | 'requester'

  // Requester form
  const [requesterForm, setRequesterForm] = useState({ name: '', phone: '' });
  const [requesterErrors, setRequesterErrors] = useState({});

  // Eligibility screening form
  const [screening, setScreening] = useState({
    ageConfirmed: null,
    medications: null,
    medicationDetails: '',
    height: '',
    weight: '',
    smoking: null,
    alcohol: null,
  });
  const [screeningErrors, setScreeningErrors] = useState({});
  const [eligibilityResult, setEligibilityResult] = useState(null);

  // Donor identity + profile form
  const [donorForm, setDonorForm] = useState({ name: '', phone: '', bloodGroup: '', district: '', lastDonationDate: '' });
  const [donorErrors, setDonorErrors] = useState({});

  const slideRight = { initial: { opacity: 0, x: 30 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -30 }, transition: { duration: 0.28 } };
  const slideLeft = { initial: { opacity: 0, x: -30 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: 30 }, transition: { duration: 0.28 } };

  // ── Requester Validation ──────────────────────────────────────────────
  const validateRequester = () => {
    const errs = {};
    if (!requesterForm.name.trim()) errs.name = 'Please enter your full name';
    if (!requesterForm.phone.trim()) errs.phone = 'Phone number is required';
    else if (!/^[6-9]\d{9}$/.test(requesterForm.phone.trim())) errs.phone = 'Enter a valid 10-digit Indian mobile number';
    setRequesterErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Requester Submit ──────────────────────────────────────────────────
  const handleRequesterSubmit = async (e) => {
    e.preventDefault();
    if (!validateRequester()) return;
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', {
        name: requesterForm.name.trim(),
        phone: requesterForm.phone.trim(),
      });
      login(data.user, data.token);
      toast.success(`Logged in successfully as ${data.user.role === 'donor' ? 'DONOR' : 'REQUESTER'}`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Screening Validation ──────────────────────────────────────────────
  const validateScreening = () => {
    const errs = {};
    if (screening.ageConfirmed === null) errs.age = 'Please confirm your age';
    if (!screening.height || isNaN(screening.height) || Number(screening.height) < 50 || Number(screening.height) > 250)
      errs.height = 'Enter a valid height in cm (50-250)';
    if (!screening.weight || isNaN(screening.weight) || Number(screening.weight) < 10 || Number(screening.weight) > 300)
      errs.weight = 'Enter a valid weight in kg';
    if (screening.smoking === null) errs.smoking = 'Please answer the smoking question';
    if (screening.alcohol === null) errs.alcohol = 'Please answer the alcohol question';
    setScreeningErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Run Eligibility Check ─────────────────────────────────────────────
  const handleRunEligibilityCheck = (e) => {
    e.preventDefault();
    if (!validateScreening()) return;
    const result = checkEligibility(screening);
    setEligibilityResult(result);
    setPhase('screened');
  };

  // ── Donor Identity Validation ─────────────────────────────────────────
  const validateDonorIdentity = () => {
    const errs = {};
    if (!donorForm.name.trim()) errs.name = 'Please enter your full name';
    if (!donorForm.phone.trim()) errs.phone = 'Phone number is required';
    else if (!/^[6-9]\d{9}$/.test(donorForm.phone.trim())) errs.phone = 'Enter a valid 10-digit Indian mobile number';
    setDonorErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Donor Profile Submit ───────────────────────────────────────────────
  const handleDonorSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const eligibilityPayload = {
        ageConfirmed: screening.ageConfirmed,
        medications: screening.medications,
        medicationDetails: screening.medicationDetails || null,
        height: Number(screening.height),
        weight: Number(screening.weight),
        smoking: screening.smoking,
        alcohol: screening.alcohol,
        eligibilityStatus: eligibilityResult?.passed ? 'eligible' : 'ineligible',
        screenedAt: new Date().toISOString(),
      };
      const payload = {
        name: donorForm.name.trim(),
        phone: donorForm.phone.trim(),
        bloodGroup: donorForm.bloodGroup || undefined,
        district: donorForm.district || undefined,
        lastDonationDate: donorForm.lastDonationDate || undefined,
        donorEligibility: eligibilityPayload,
      };
      const { data } = await api.post('/auth/register', payload);
      login(data.user, data.token);
      toast.success(`Logged in successfully as ${data.user.role === 'donor' ? 'DONOR' : 'REQUESTER'}`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Donor Quick Submit (skip profile step) ─────────────────────────────
  const handleDonorSkip = async () => {
    setLoading(true);
    try {
      const eligibilityPayload = {
        ageConfirmed: screening.ageConfirmed,
        medications: screening.medications,
        medicationDetails: screening.medicationDetails || null,
        height: Number(screening.height),
        weight: Number(screening.weight),
        smoking: screening.smoking,
        alcohol: screening.alcohol,
        eligibilityStatus: eligibilityResult?.passed ? 'eligible' : 'ineligible',
        screenedAt: new Date().toISOString(),
      };
      const { data } = await api.post('/auth/register', {
        name: donorForm.name.trim(),
        phone: donorForm.phone.trim(),
        donorEligibility: eligibilityPayload,
      });
      login(data.user, data.token);
      toast.success(`Logged in successfully as ${data.user.role === 'donor' ? 'DONOR' : 'REQUESTER'}`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      <LeftPanel track={track} />

      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 overflow-y-auto">
        <div className="w-full max-w-md">

          {/* Mobile Logo */}
          <div className="flex items-center justify-between mb-6 lg:hidden">
            <Link to="/" className="flex items-center gap-2 font-black text-lg text-text-primary shrink-0">
              <Droplets size={24} className="text-primary shrink-0" fill="currentColor" />
              <span>RED<span className="text-primary">CONNECT</span></span>
            </Link>
            <Link to="/" className="text-text-muted hover:text-primary transition-colors">
              <Home size={20} />
            </Link>
          </div>

          {/* Desktop home icon */}
          <div className="hidden lg:flex justify-end mb-2">
            <Link to="/" className="text-text-muted hover:text-primary transition-colors p-1">
              <Home size={20} />
            </Link>
          </div>

          <AnimatePresence mode="wait">

            {/* ════ PHASE: SELECT TRACK ════════════════════════════════════════ */}
            {phase === 'select' && (
              <motion.div key="select" {...slideRight}>
                <motion.div
                  initial={{ opacity: 0, y: -15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45 }}
                  className="mb-8"
                >
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-primary-50 border-l-4 border-primary mb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">Registration</span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-black text-text-primary tracking-tight leading-none">
                    HOW CAN WE <span className="text-primary">HELP YOU?</span>
                  </h2>
                  <p className="text-text-secondary text-sm mt-3.5 leading-relaxed">
                    Choose how you'd like to join the RED CONNECT community.
                  </p>
                </motion.div>

                <div className="space-y-4">
                  {/* Donor Card */}
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    onClick={() => { setTrack('donor'); setPhase('screening'); }}
                    className="w-full text-left p-6 border-2 border-gray-200 bg-white hover:border-primary hover:bg-primary-50 transition-all duration-200 group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                          <Heart size={22} className="text-primary" fill="currentColor" />
                        </div>
                        <div>
                          <p className="font-black text-lg text-text-primary">Register as Donor</p>
                          <p className="text-text-secondary text-sm mt-0.5 leading-snug">
                            Donate blood and save lives. Includes eligibility screening.
                          </p>
                        </div>
                      </div>
                      <ArrowRight size={20} className="text-text-muted group-hover:text-primary transition-colors shrink-0 mt-1" />
                    </div>
                  </motion.button>

                  {/* Requester Card */}
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    onClick={() => { setTrack('requester'); setPhase('requester'); }}
                    className="w-full text-left p-6 border-2 border-gray-200 bg-white hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 flex items-center justify-center shrink-0 group-hover:bg-gray-200 transition-colors">
                          <Activity size={22} className="text-text-secondary" />
                        </div>
                        <div>
                          <p className="font-black text-lg text-text-primary">Register as Requester</p>
                          <p className="text-text-secondary text-sm mt-0.5 leading-snug">
                            Request blood for yourself or someone in need. Quick registration.
                          </p>
                        </div>
                      </div>
                      <ArrowRight size={20} className="text-text-muted group-hover:text-text-secondary transition-colors shrink-0 mt-1" />
                    </div>
                  </motion.button>
                </div>

                <p className="mt-6 text-sm text-text-muted text-center">
                  Already registered?{' '}
                  <Link to="/login" className="text-primary font-bold hover:underline">Sign In</Link>
                </p>
              </motion.div>
            )}

            {/* ════ PHASE: REQUESTER FLOW ══════════════════════════════════════ */}
            {phase === 'requester' && (
              <motion.div key="requester" {...slideRight}>
                <div className="mb-6">
                  <button onClick={() => setPhase('select')} className="flex items-center gap-1 text-text-muted hover:text-primary text-sm font-semibold mb-4 transition-colors">
                    <ChevronLeft size={16} /> Back
                  </button>
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-gray-50 border-l-4 border-gray-400 mb-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Blood Requester</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-text-primary">REQUEST BLOOD <span className="text-primary">FAST.</span></h2>
                  <p className="text-text-secondary text-sm mt-2 leading-relaxed">
                    Simple registration for blood requesters. Just your name and phone number.
                  </p>
                </div>

                <form onSubmit={handleRequesterSubmit} className="space-y-5">
                  <div>
                    <label className="label">Full Name</label>
                    <input
                      type="text"
                      value={requesterForm.name}
                      onChange={(e) => { setRequesterForm(p => ({ ...p, name: e.target.value })); if (requesterErrors.name) setRequesterErrors(p => ({ ...p, name: '' })); }}
                      className={`input text-base py-4 ${requesterErrors.name ? 'border-red-400' : ''}`}
                      placeholder="Your full name"
                      autoFocus
                    />
                    {requesterErrors.name && <p className="text-red-500 text-xs mt-1.5 font-medium">{requesterErrors.name}</p>}
                  </div>
                  <div>
                    <label className="label">Mobile Number</label>
                    <div className="flex gap-0">
                      <div className="flex items-center px-3 py-4 bg-gray-50 border border-r-0 border-gray-200 text-sm font-semibold text-text-secondary shrink-0">
                        🇮🇳 +91
                      </div>
                      <input
                        type="tel"
                        value={requesterForm.phone}
                        onChange={(e) => { setRequesterForm(p => ({ ...p, phone: e.target.value })); if (requesterErrors.phone) setRequesterErrors(p => ({ ...p, phone: '' })); }}
                        className={`input text-base py-4 flex-1 ${requesterErrors.phone ? 'border-red-400' : ''}`}
                        placeholder="9876543210"
                        maxLength={10}
                        inputMode="numeric"
                      />
                    </div>
                    {requesterErrors.phone && <p className="text-red-500 text-xs mt-1.5 font-medium">{requesterErrors.phone}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full py-4 text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creating account...
                      </span>
                    ) : (
                      <><CheckCircle2 size={16} /> Complete Registration</>
                    )}
                  </button>
                </form>
                <p className="mt-5 text-sm text-text-muted text-center">
                  Already registered? <Link to="/login" className="text-primary font-bold hover:underline">Sign In</Link>
                </p>
              </motion.div>
            )}

            {/* ════ PHASE: ELIGIBILITY SCREENING FORM ═════════════════════════ */}
            {phase === 'screening' && (
              <motion.div key="screening" {...slideRight}>
                <div className="mb-5">
                  <button onClick={() => setPhase('select')} className="flex items-center gap-1 text-text-muted hover:text-primary text-sm font-semibold mb-4 transition-colors">
                    <ChevronLeft size={16} /> Back
                  </button>
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-primary-50 border-l-4 border-primary mb-3">
                    <ShieldCheck size={12} className="text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">Donor Eligibility Screening</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-text-primary">HEALTH <span className="text-primary">PRE-SCREENING</span></h2>
                  <p className="text-text-secondary text-sm mt-2 leading-relaxed">
                    Answer a few health questions to check your preliminary eligibility as a blood donor.
                  </p>
                  {/* Disclaimer banner */}
                  <div className="mt-3 bg-amber-50 border border-amber-200 px-3.5 py-3 flex items-start gap-2.5">
                    <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-800 leading-relaxed font-medium">
                      This is only a preliminary digital eligibility check. Final approval will happen during physical verification by the <strong>DYFI Mokeri East MC blood donation team</strong>.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleRunEligibilityCheck} className="space-y-6">

                  {/* Question 1: Age */}
                  <div className="bg-white border border-gray-200 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 bg-primary text-white text-xs font-black flex items-center justify-center shrink-0">1</div>
                      <p className="font-bold text-sm text-text-primary">Are you 18 years or older?</p>
                    </div>
                    <div className="flex gap-2">
                      <OptionBtn label="Yes, I am 18+" selected={screening.ageConfirmed === true} onClick={() => setScreening(p => ({ ...p, ageConfirmed: true }))} variant="success" />
                      <OptionBtn label="No, I'm under 18" selected={screening.ageConfirmed === false} onClick={() => setScreening(p => ({ ...p, ageConfirmed: false }))} variant="danger" />
                    </div>
                    {screeningErrors.age && <p className="text-red-500 text-xs mt-2 font-medium">{screeningErrors.age}</p>}
                  </div>

                  {/* Question 2: Medications */}
                  <div className="bg-white border border-gray-200 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 bg-primary text-white text-xs font-black flex items-center justify-center shrink-0">2</div>
                      <div className="flex items-center gap-2">
                        <Syringe size={14} className="text-text-muted" />
                        <p className="font-bold text-sm text-text-primary">Are you currently taking any medications?</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mb-3">
                      <OptionBtn label="Yes" selected={screening.medications === true} onClick={() => setScreening(p => ({ ...p, medications: true }))} />
                      <OptionBtn label="No" selected={screening.medications === false} onClick={() => setScreening(p => ({ ...p, medications: false }))} variant="success" />
                    </div>
                    {screening.medications === true && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} transition={{ duration: 0.2 }}>
                        <input
                          type="text"
                          value={screening.medicationDetails}
                          onChange={(e) => setScreening(p => ({ ...p, medicationDetails: e.target.value }))}
                          className="input text-sm py-2.5 w-full mt-1"
                          placeholder="Optional: list medications (e.g. blood thinners, antibiotics...)"
                        />
                        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 mt-2 font-medium">
                          Certain medications may affect eligibility. The DYFI team will review this during physical screening.
                        </p>
                      </motion.div>
                    )}
                  </div>

                  {/* Questions 3 & 4: Height & Weight */}
                  <div className="bg-white border border-gray-200 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 bg-primary text-white text-xs font-black flex items-center justify-center shrink-0">3</div>
                      <div className="flex items-center gap-2">
                        <Scale size={14} className="text-text-muted" />
                        <p className="font-bold text-sm text-text-primary">Height & Weight</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold text-text-secondary uppercase tracking-wide block mb-1.5">Height (cm)</label>
                        <input
                          type="number"
                          value={screening.height}
                          onChange={(e) => setScreening(p => ({ ...p, height: e.target.value }))}
                          className={`input text-sm py-2.5 w-full ${screeningErrors.height ? 'border-red-400' : ''}`}
                          placeholder="e.g. 170"
                          min="50" max="250"
                          inputMode="numeric"
                        />
                        {screeningErrors.height && <p className="text-red-500 text-xs mt-1">{screeningErrors.height}</p>}
                      </div>
                      <div>
                        <label className="text-xs font-bold text-text-secondary uppercase tracking-wide block mb-1.5">Weight (kg)</label>
                        <input
                          type="number"
                          value={screening.weight}
                          onChange={(e) => setScreening(p => ({ ...p, weight: e.target.value }))}
                          className={`input text-sm py-2.5 w-full ${screeningErrors.weight ? 'border-red-400' : ''}`}
                          placeholder="e.g. 65"
                          min="10" max="300"
                          inputMode="numeric"
                        />
                        {screeningErrors.weight && <p className="text-red-500 text-xs mt-1">{screeningErrors.weight}</p>}
                      </div>
                    </div>
                    <p className="text-xs text-text-muted mt-2">Minimum weight requirement: <strong>50 kg</strong></p>
                  </div>

                  {/* Question 5: Smoking */}
                  <div className="bg-white border border-gray-200 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 bg-primary text-white text-xs font-black flex items-center justify-center shrink-0">4</div>
                      <div className="flex items-center gap-2">
                        <Cigarette size={14} className="text-text-muted" />
                        <p className="font-bold text-sm text-text-primary">Do you smoke?</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <OptionBtn label="Yes" selected={screening.smoking === 'Yes'} onClick={() => setScreening(p => ({ ...p, smoking: 'Yes' }))} variant="danger" />
                      <OptionBtn label="No" selected={screening.smoking === 'No'} onClick={() => setScreening(p => ({ ...p, smoking: 'No' }))} variant="success" />
                      <OptionBtn label="Occasionally" selected={screening.smoking === 'Occasionally'} onClick={() => setScreening(p => ({ ...p, smoking: 'Occasionally' }))} variant="amber" />
                    </div>
                    {screeningErrors.smoking && <p className="text-red-500 text-xs mt-2 font-medium">{screeningErrors.smoking}</p>}
                    {screening.smoking === 'Yes' && (
                      <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 mt-2 font-medium">
                        Regular smoking may affect blood quality. The DYFI team will evaluate this during physical screening.
                      </p>
                    )}
                  </div>

                  {/* Question 6: Alcohol */}
                  <div className="bg-white border border-gray-200 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 bg-primary text-white text-xs font-black flex items-center justify-center shrink-0">5</div>
                      <div className="flex items-center gap-2">
                        <Wine size={14} className="text-text-muted" />
                        <p className="font-bold text-sm text-text-primary">Do you consume alcohol?</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <OptionBtn label="Yes" selected={screening.alcohol === 'Yes'} onClick={() => setScreening(p => ({ ...p, alcohol: 'Yes' }))} variant="danger" />
                      <OptionBtn label="No" selected={screening.alcohol === 'No'} onClick={() => setScreening(p => ({ ...p, alcohol: 'No' }))} variant="success" />
                      <OptionBtn label="Occasionally" selected={screening.alcohol === 'Occasionally'} onClick={() => setScreening(p => ({ ...p, alcohol: 'Occasionally' }))} variant="amber" />
                    </div>
                    {screeningErrors.alcohol && <p className="text-red-500 text-xs mt-2 font-medium">{screeningErrors.alcohol}</p>}
                    {screening.alcohol === 'Yes' && (
                      <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 mt-2 font-medium">
                        Alcohol in your system may disqualify you temporarily. Refrain from drinking 24 hours before donation.
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="btn-primary w-full py-4 text-sm flex items-center justify-center gap-2"
                  >
                    <ShieldCheck size={16} /> Check My Eligibility
                  </button>
                </form>
              </motion.div>
            )}

            {/* ════ PHASE: SCREENED RESULT ═════════════════════════════════════ */}
            {phase === 'screened' && eligibilityResult && (
              <motion.div key="screened" {...slideRight}>

                {eligibilityResult.passed ? (
                  /* ── PASS SCREEN ── */
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      className="w-20 h-20 bg-green-100 border-4 border-green-500 flex items-center justify-center mx-auto mb-6"
                      style={{ borderRadius: '0' }}
                    >
                      <ShieldCheck size={40} className="text-green-600" />
                    </motion.div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-200 mb-4">
                      <span className="text-xs font-black uppercase tracking-widest text-green-700">Eligibility Passed</span>
                    </div>
                    <h2 className="text-2xl font-black text-text-primary mb-3">YOU ARE PRELIMINARILY <span className="text-green-600">ELIGIBLE!</span></h2>
                    <p className="text-text-secondary text-sm leading-relaxed mb-4">
                      You are eligible for preliminary blood donor registration.
                    </p>
                    <div className="bg-amber-50 border border-amber-200 px-4 py-3 text-left mb-6">
                      <div className="flex items-start gap-2">
                        <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-800 leading-relaxed font-medium">
                          Final eligibility will be verified physically by the <strong>DYFI Mokeri East MC blood donation team</strong> during the real-world screening process.
                        </p>
                      </div>
                    </div>

                    {/* Quick Screening Summary */}
                    <div className="bg-gray-50 border border-gray-200 p-4 text-left mb-6">
                      <p className="text-xs font-black uppercase tracking-widest text-text-muted mb-3">Screening Summary</p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {[
                          { label: 'Age', value: screening.ageConfirmed ? '18+' : 'Under 18' },
                          { label: 'Weight', value: `${screening.weight} kg` },
                          { label: 'Height', value: `${screening.height} cm` },
                          { label: 'Smoking', value: screening.smoking },
                          { label: 'Alcohol', value: screening.alcohol },
                          { label: 'Medications', value: screening.medications ? 'Yes' : 'No' },
                        ].map(({ label, value }) => (
                          <div key={label} className="flex justify-between gap-2">
                            <span className="text-text-muted font-medium">{label}:</span>
                            <span className="font-bold text-text-primary">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => setPhase('donor-identity')}
                      className="btn-primary w-full py-4 text-sm flex items-center justify-center gap-2"
                    >
                      Continue Registration <ChevronRight size={16} />
                    </button>
                  </div>

                ) : (
                  /* ── FAIL SCREEN ── */
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      className="w-20 h-20 bg-red-100 border-4 border-red-500 flex items-center justify-center mx-auto mb-6"
                      style={{ borderRadius: '0' }}
                    >
                      <AlertTriangle size={40} className="text-red-600" />
                    </motion.div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 border border-red-200 mb-4">
                      <span className="text-xs font-black uppercase tracking-widest text-red-700">Currently Not Eligible</span>
                    </div>
                    <h2 className="text-2xl font-black text-text-primary mb-3">PRELIMINARY ELIGIBILITY <span className="text-red-600">NOT MET</span></h2>
                    <p className="text-text-secondary text-sm leading-relaxed mb-4">
                      Based on the provided information, you may not currently meet the preliminary donor eligibility requirements.
                    </p>

                    {/* Reason breakdown */}
                    <div className="bg-red-50 border border-red-200 px-4 py-4 text-left mb-4">
                      <p className="text-xs font-black uppercase tracking-widest text-red-700 mb-3">Reasons</p>
                      <ul className="space-y-2">
                        {eligibilityResult.reasons.map((reason, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs text-red-800">
                            <span className="w-4 h-4 bg-red-600 text-white flex items-center justify-center shrink-0 text-[10px] font-black mt-0.5">!</span>
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 px-4 py-3 text-left mb-6">
                      <p className="text-xs text-amber-800 leading-relaxed font-medium">
                        Please consult the DYFI Mokeri East MC coordination team for further assistance. Contact: <strong>Rahul Tacholi – 9946709455</strong>
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => { setScreening({ ageConfirmed: null, medications: null, medicationDetails: '', height: '', weight: '', smoking: null, alcohol: null }); setScreeningErrors({}); setEligibilityResult(null); setPhase('screening'); }}
                        className="flex-1 border-2 border-gray-300 bg-white text-text-primary font-bold py-3.5 text-sm flex items-center justify-center gap-2 hover:border-gray-400 transition-colors"
                      >
                        <RotateCcw size={14} /> Retry Screening
                      </button>
                      <button
                        onClick={() => setPhase('select')}
                        className="flex-1 border-2 border-gray-300 bg-white text-text-muted font-bold py-3.5 text-sm hover:border-gray-400 transition-colors"
                      >
                        Back
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* ════ PHASE: DONOR IDENTITY ═══════════════════════════════════════ */}
            {phase === 'donor-identity' && (
              <motion.div key="donor-identity" {...slideRight}>
                <StepIndicator step={1} total={2} labels={['Identity', 'Donor Profile']} />
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <User size={14} className="text-primary" />
                    <span className="text-xs font-bold uppercase tracking-widest text-text-muted">Step 1: Identity</span>
                  </div>
                  <h3 className="text-xl font-bold text-text-primary">Your Identity</h3>
                  <p className="text-text-muted text-sm mt-1">Your name and phone — your login credentials.</p>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); if (validateDonorIdentity()) setPhase('donor-profile'); }} className="space-y-5">
                  <div>
                    <label className="label">Full Name</label>
                    <input
                      type="text"
                      value={donorForm.name}
                      onChange={(e) => { setDonorForm(p => ({ ...p, name: e.target.value })); if (donorErrors.name) setDonorErrors(p => ({ ...p, name: '' })); }}
                      className={`input text-base py-4 ${donorErrors.name ? 'border-red-400' : ''}`}
                      placeholder="Your full name"
                      autoFocus
                    />
                    {donorErrors.name && <p className="text-red-500 text-xs mt-1.5 font-medium">{donorErrors.name}</p>}
                  </div>
                  <div>
                    <label className="label">Mobile Number</label>
                    <div className="flex gap-0">
                      <div className="flex items-center px-3 py-4 bg-gray-50 border border-r-0 border-gray-200 text-sm font-semibold text-text-secondary shrink-0">
                        🇮🇳 +91
                      </div>
                      <input
                        type="tel"
                        value={donorForm.phone}
                        onChange={(e) => { setDonorForm(p => ({ ...p, phone: e.target.value })); if (donorErrors.phone) setDonorErrors(p => ({ ...p, phone: '' })); }}
                        className={`input text-base py-4 flex-1 ${donorErrors.phone ? 'border-red-400' : ''}`}
                        placeholder="9876543210"
                        maxLength={10}
                        inputMode="numeric"
                      />
                    </div>
                    {donorErrors.phone && <p className="text-red-500 text-xs mt-1.5 font-medium">{donorErrors.phone}</p>}
                  </div>

                  <div className="flex gap-3 pt-1">
                    <button type="button" onClick={() => setPhase('screened')} className="btn-ghost border border-gray-200 px-4 py-3 flex items-center gap-1">
                      <ChevronLeft size={14} /> Back
                    </button>
                    <button type="submit" className="btn-primary flex-1 py-4 text-sm flex items-center justify-center gap-2">
                      Continue to Profile <ChevronRight size={16} />
                    </button>
                  </div>
                </form>

                <p className="mt-5 text-sm text-text-muted text-center">
                  Already registered? <Link to="/login" className="text-primary font-bold hover:underline">Sign In</Link>
                </p>
              </motion.div>
            )}

            {/* ════ PHASE: DONOR PROFILE ════════════════════════════════════════ */}
            {phase === 'donor-profile' && (
              <motion.div key="donor-profile" {...slideRight}>
                <StepIndicator step={2} total={2} labels={['Identity', 'Donor Profile']} />
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart size={14} className="text-primary" fill="currentColor" />
                    <span className="text-xs font-bold uppercase tracking-widest text-text-muted">Step 2: Donor Profile</span>
                  </div>
                  <h3 className="text-xl font-bold text-text-primary">Donor Profile</h3>
                  <p className="text-text-muted text-sm mt-1">Help us match you with the right requests. You can update this later.</p>
                </div>

                <form onSubmit={handleDonorSubmit} className="space-y-5">
                  {/* Blood Group */}
                  <div>
                    <label className="label mb-2">Blood Group</label>
                    <div className="grid grid-cols-4 gap-2">
                      {BLOOD_GROUPS.map((bg) => (
                        <BloodGroupTile
                          key={bg}
                          group={bg}
                          selected={donorForm.bloodGroup === bg}
                          onSelect={(val) => setDonorForm(p => ({ ...p, bloodGroup: p.bloodGroup === val ? '' : val }))}
                        />
                      ))}
                    </div>
                  </div>

                  {/* District */}
                  <div>
                    <label className="label">District</label>
                    <select
                      value={donorForm.district}
                      onChange={(e) => setDonorForm(p => ({ ...p, district: e.target.value }))}
                      className="select py-4 text-base"
                    >
                      <option value="">Select Your District</option>
                      {KERALA_DISTRICTS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>

                  {/* Last Donation Date */}
                  <div>
                    <label className="label">
                      Last Donation Date{' '}
                      <span className="text-text-muted font-normal normal-case">(if donated before)</span>
                    </label>
                    <input
                      type="date"
                      value={donorForm.lastDonationDate}
                      onChange={(e) => setDonorForm(p => ({ ...p, lastDonationDate: e.target.value }))}
                      className="input py-4"
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  {/* Eligibility info */}
                  <div className="bg-primary/5 border border-primary/15 px-4 py-3 flex items-start gap-3">
                    <div className="w-1 h-full bg-primary shrink-0 self-stretch min-h-[2.5rem]" />
                    <div>
                      <p className="text-xs font-bold text-primary">Eligibility Rule</p>
                      <p className="text-xs text-text-secondary mt-0.5">
                        A 90-day gap is required between donations. Your eligibility is calculated automatically.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 pt-1">
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary w-full py-4 text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Creating account...
                        </span>
                      ) : (
                        <><CheckCircle2 size={16} /> Complete Donor Registration</>
                      )}
                    </button>
                    <div className="flex gap-3">
                      <button type="button" onClick={() => setPhase('donor-identity')} className="btn-ghost border border-gray-200 flex-1 py-3 flex items-center justify-center gap-2">
                        <ChevronLeft size={14} /> Back
                      </button>
                      <button
                        type="button"
                        onClick={handleDonorSkip}
                        disabled={loading}
                        className="btn-ghost border border-gray-200 flex-1 py-3 flex items-center justify-center gap-2 text-text-muted disabled:opacity-60"
                      >
                        Skip for now <SkipForward size={13} />
                      </button>
                    </div>
                  </div>
                </form>

                <p className="mt-5 text-sm text-text-muted text-center">
                  Already registered? <Link to="/login" className="text-primary font-bold hover:underline">Sign In</Link>
                </p>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
