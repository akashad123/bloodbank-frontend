import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Droplets, Phone, User, ChevronRight, ChevronLeft,
  CheckCircle2, Home,
  ShieldCheck, AlertTriangle, Syringe, Scale, Cigarette,
  Wine, RotateCcw, Heart
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
const LeftPanel = () => (
  <div className="hidden lg:flex lg:w-5/12 xl:w-[42%] bg-primary flex-col justify-between p-10 xl:p-14 relative overflow-hidden">
    <div className="absolute -top-24 -right-24 w-72 h-72 bg-white/5 pointer-events-none" />
    <div className="absolute bottom-20 -left-16 w-56 h-56 bg-white/5 pointer-events-none" />
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
          Join RedConnect
        </span>
      </div>
      <h1 className="text-4xl xl:text-5xl font-black text-white leading-tight mb-4">
        BE THE<br /><span className="text-white/70">LIFELINE.</span>
      </h1>
      <p className="text-white/60 text-base max-w-xs leading-relaxed">
        Join the RED CONNECT blood donation network serving 14 districts of Kerala.
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
  if (screening.alcohol === 'Yes')
    reasons.push('Alcohol in system may disqualify you temporarily.');
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

  // Flow state: 'basic' | 'screening'
  const [phase, setPhase] = useState('basic');

  // Basic Details Form
  const [basicForm, setBasicForm] = useState({ name: '', phone: '', district: '', bloodGroup: '' });
  const [basicErrors, setBasicErrors] = useState({});

  // Eligibility screening form
  const [screening, setScreening] = useState({
    ageConfirmed: null,
    medications: null,
    medicationDetails: '',
    height: '',
    weight: '',
    smoking: null,
    alcohol: null,
    lastDonationDate: '',
    neverDonated: false,
  });
  const [screeningErrors, setScreeningErrors] = useState({});

  const slideRight = { initial: { opacity: 0, x: 30 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -30 }, transition: { duration: 0.28 } };
  const slideLeft = { initial: { opacity: 0, x: -30 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: 30 }, transition: { duration: 0.28 } };

  // ── Basic Validation ──────────────────────────────────────────────
  const validateBasic = () => {
    const errs = {};
    if (!basicForm.name.trim()) errs.name = 'Please enter your full name';
    if (!basicForm.phone.trim()) errs.phone = 'Phone number is required';
    else if (!/^[6-9]\d{9}$/.test(basicForm.phone.trim())) errs.phone = 'Enter a valid 10-digit Indian mobile number';
    if (!basicForm.district) errs.district = 'Please select a district';
    if (!basicForm.bloodGroup) errs.bloodGroup = 'Please select your blood group';
    
    setBasicErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleBasicSubmit = (e) => {
    e.preventDefault();
    if (validateBasic()) setPhase('screening');
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
    if (!screening.neverDonated && !screening.lastDonationDate) {
      errs.lastDonationDate = 'Please select your last donation date or check Never Donated';
    }
    setScreeningErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Final Submit ───────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateScreening()) return;

    setLoading(true);
    const result = checkEligibility(screening);

    try {
      const eligibilityPayload = {
        ageConfirmed: screening.ageConfirmed,
        medications: screening.medications,
        medicationDetails: screening.medicationDetails || null,
        height: Number(screening.height),
        weight: Number(screening.weight),
        smoking: screening.smoking,
        alcohol: screening.alcohol,
        eligibilityStatus: result.passed ? 'eligible' : 'ineligible',
        screenedAt: new Date().toISOString(),
      };
      const payload = {
        name: basicForm.name.trim(),
        phone: basicForm.phone.trim(),
        bloodGroup: basicForm.bloodGroup,
        district: basicForm.district,
        lastDonationDate: screening.neverDonated ? null : screening.lastDonationDate,
        donorEligibility: eligibilityPayload,
      };
      
      const { data } = await api.post('/auth/register', payload);
      login(data.user, data.token);
      toast.success('Registration completed successfully!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      <LeftPanel />

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

            {/* ════ PHASE: BASIC DETAILS ═══════════════════════════════════════ */}
            {phase === 'basic' && (
              <motion.div key="basic" {...slideRight}>
                <StepIndicator step={1} total={2} labels={['Basic Info', 'Health Screening']} />
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <User size={14} className="text-primary" />
                    <span className="text-xs font-bold uppercase tracking-widest text-text-muted">Step 1</span>
                  </div>
                  <h3 className="text-xl font-bold text-text-primary">Registration Details</h3>
                  <p className="text-text-muted text-sm mt-1">Please provide your basic information.</p>
                </div>

                <form onSubmit={handleBasicSubmit} className="space-y-5">
                  <div>
                    <label className="label">Full Name</label>
                    <input
                      type="text"
                      value={basicForm.name}
                      onChange={(e) => { setBasicForm(p => ({ ...p, name: e.target.value })); if (basicErrors.name) setBasicErrors(p => ({ ...p, name: '' })); }}
                      className={`input text-base py-4 ${basicErrors.name ? 'border-red-400' : ''}`}
                      placeholder="Your full name"
                      autoFocus
                    />
                    {basicErrors.name && <p className="text-red-500 text-xs mt-1.5 font-medium">{basicErrors.name}</p>}
                  </div>
                  <div>
                    <label className="label">Mobile Number</label>
                    <div className="flex gap-0">
                      <div className="flex items-center px-3 py-4 bg-gray-50 border border-r-0 border-gray-200 text-sm font-semibold text-text-secondary shrink-0">
                        🇮🇳 +91
                      </div>
                      <input
                        type="tel"
                        value={basicForm.phone}
                        onChange={(e) => { setBasicForm(p => ({ ...p, phone: e.target.value })); if (basicErrors.phone) setBasicErrors(p => ({ ...p, phone: '' })); }}
                        className={`input text-base py-4 flex-1 ${basicErrors.phone ? 'border-red-400' : ''}`}
                        placeholder="9876543210"
                        maxLength={10}
                        inputMode="numeric"
                      />
                    </div>
                    {basicErrors.phone && <p className="text-red-500 text-xs mt-1.5 font-medium">{basicErrors.phone}</p>}
                  </div>

                  <div>
                    <label className="label">District in Kerala</label>
                    <select
                      value={basicForm.district}
                      onChange={(e) => { setBasicForm(p => ({ ...p, district: e.target.value })); if (basicErrors.district) setBasicErrors(p => ({ ...p, district: '' })); }}
                      className={`select py-4 text-base ${basicErrors.district ? 'border-red-400' : ''} ${!basicForm.district ? 'text-text-muted' : 'text-text-primary'}`}
                    >
                      <option value="" disabled>Select District</option>
                      {KERALA_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    {basicErrors.district && <p className="text-red-500 text-xs mt-1.5 font-medium">{basicErrors.district}</p>}
                  </div>

                  <div>
                    <label className="label flex items-center justify-between">
                      Blood Group
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {BLOOD_GROUPS.map((group) => (
                        <BloodGroupTile
                          key={group}
                          group={group}
                          selected={basicForm.bloodGroup === group}
                          onSelect={(g) => { setBasicForm(p => ({ ...p, bloodGroup: g })); if (basicErrors.bloodGroup) setBasicErrors(p => ({ ...p, bloodGroup: '' })); }}
                        />
                      ))}
                    </div>
                    {basicErrors.bloodGroup && <p className="text-red-500 text-xs mt-1.5 font-medium">{basicErrors.bloodGroup}</p>}
                  </div>

                  <button
                    type="submit"
                    className="btn-primary w-full py-4 text-sm flex items-center justify-center gap-2"
                  >
                    Continue to Screening <ChevronRight size={16} />
                  </button>
                </form>
                <p className="mt-5 text-sm text-text-muted text-center">
                  Already registered? <Link to="/login" className="text-primary font-bold hover:underline">Sign In</Link>
                </p>
              </motion.div>
            )}

            {/* ════ PHASE: ELIGIBILITY SCREENING FORM ═════════════════════════ */}
            {phase === 'screening' && (
              <motion.div key="screening" {...slideLeft}>
                <StepIndicator step={2} total={2} labels={['Basic Info', 'Health Screening']} />
                
                <div className="mb-5">
                  <button onClick={() => setPhase('basic')} className="flex items-center gap-1 text-text-muted hover:text-primary text-sm font-semibold mb-4 transition-colors">
                    <ChevronLeft size={16} /> Back
                  </button>
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-primary-50 border-l-4 border-primary mb-3">
                    <ShieldCheck size={12} className="text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">Donor Eligibility Screening</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-text-primary">HEALTH <span className="text-primary">PRE-SCREENING</span></h2>
                  <p className="text-text-secondary text-sm mt-2 leading-relaxed">
                    Answer a few health questions to check your preliminary eligibility as a blood donor. Even if not eligible, you can still use the platform to request blood.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">

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
                      </motion.div>
                    )}
                  </div>

                  {/* Questions 3: Height & Weight */}
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

                  {/* Question 4: Smoking */}
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
                  </div>

                  {/* Question 5: Alcohol */}
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
                  </div>

                  {/* Question 6: Last Donation */}
                  <div className="bg-white border border-gray-200 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 bg-primary text-white text-xs font-black flex items-center justify-center shrink-0">6</div>
                      <div className="flex items-center gap-2">
                        <Heart size={14} className="text-text-muted" />
                        <p className="font-bold text-sm text-text-primary">Last Blood Donation Date</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3">
                      <input
                        type="date"
                        value={screening.lastDonationDate}
                        onChange={(e) => {
                          setScreening(p => ({ ...p, lastDonationDate: e.target.value, neverDonated: false }));
                          if (screeningErrors.lastDonationDate) setScreeningErrors(p => ({ ...p, lastDonationDate: '' }));
                        }}
                        disabled={screening.neverDonated}
                        className={`input text-sm py-2.5 w-full ${screeningErrors.lastDonationDate ? 'border-red-400' : ''}`}
                        max={new Date().toISOString().split('T')[0]}
                      />
                      <label className="flex items-center gap-2 cursor-pointer border p-3 bg-gray-50 border-gray-200">
                        <input
                          type="checkbox"
                          checked={screening.neverDonated}
                          onChange={(e) => {
                            setScreening(p => ({ ...p, neverDonated: e.target.checked, lastDonationDate: '' }));
                            if (screeningErrors.lastDonationDate) setScreeningErrors(p => ({ ...p, lastDonationDate: '' }));
                          }}
                          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                        />
                        <span className="text-sm font-bold text-text-primary">I have never donated blood</span>
                      </label>
                    </div>
                    {screeningErrors.lastDonationDate && <p className="text-red-500 text-xs mt-2 font-medium">{screeningErrors.lastDonationDate}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary w-full py-4 text-sm flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Submitting...
                      </span>
                    ) : (
                      <><ShieldCheck size={16} /> Complete Registration</>
                    )}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
