import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, Plus, Search, Edit2, Trash2, X, AlertTriangle,
  CheckCircle, XCircle, Phone, MapPin, Mail, Clock,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { LoadingSpinner } from '../components/UI';
import {
  fetchAdminHospitals,
  createHospital,
  updateHospital,
  deleteHospital,
} from '../api/hospitals';

// ── Animation variants ───────────────────────────────────────────────────────
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.25 } } };
const modalAnim = { hidden: { opacity: 0, scale: 0.96, y: 12 }, show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.2 } } };

// ── Shared admin card style ──────────────────────────────────────────────────
const adminCard = {
  border: '1px solid rgba(0,0,0,0.12)',
  boxShadow: '0 1px 6px rgba(0,0,0,0.06), 0 0 0 0.5px rgba(0,0,0,0.04)',
};

// ── Empty form state ─────────────────────────────────────────────────────────
const EMPTY_FORM = { name: '', address: '', phone: '', email: '', status: 'active' };

// ─── Status Badge ────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) =>
  status === 'active' ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-green-50 border border-green-200 text-green-700">
      <CheckCircle size={10} /> Active
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-gray-100 border border-gray-300 text-gray-600">
      <XCircle size={10} /> Inactive
    </span>
  );

// ─── Hospital Form Modal ─────────────────────────────────────────────────────
const HospitalFormModal = ({ title, form, district, onChange, onSubmit, onClose, submitting }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.55)' }}>
    <motion.div
      variants={modalAnim} initial="hidden" animate="show"
      className="w-full max-w-lg bg-white shadow-2xl overflow-y-auto"
      style={{ maxHeight: '92vh', borderRadius: 0 }}
    >
      {/* Modal header */}
      <div className="flex items-center justify-between px-6 py-4 text-white" style={{ background: 'linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 100%)', borderBottom: '3px solid #B03030' }}>
        <div className="flex items-center gap-2">
          <Building2 size={18} />
          <h2 className="font-black text-base uppercase tracking-wider">{title}</h2>
        </div>
        <button onClick={onClose} className="p-1 hover:opacity-70 transition-opacity">
          <X size={20} />
        </button>
      </div>

      <form onSubmit={onSubmit} className="p-6 space-y-5">
        {/* Hospital Name */}
        <div>
          <label className="label">Hospital Name <span className="text-red-500">*</span></label>
          <input
            name="name" value={form.name} onChange={onChange}
            className="input" placeholder="e.g. Government Medical College Thrissur"
            required
          />
        </div>

        {/* District — locked */}
        <div>
          <label className="label">District</label>
          <input
            value={district} disabled
            className="input bg-gray-50 text-text-muted cursor-not-allowed"
          />
          <p className="text-[11px] text-text-muted mt-1">District is auto-filled and cannot be changed.</p>
        </div>

        {/* Address */}
        <div>
          <label className="label">Address <span className="text-red-500">*</span></label>
          <textarea
            name="address" value={form.address} onChange={onChange}
            className="input h-20 resize-none" placeholder="Full address of the hospital"
            required
          />
        </div>

        {/* Phone */}
        <div>
          <label className="label">Contact Number <span className="text-red-500">*</span></label>
          <input
            name="phone" value={form.phone} onChange={onChange}
            type="tel" className="input" placeholder="e.g. 04872230501"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label className="label">Email <span className="text-text-muted font-normal normal-case">(optional)</span></label>
          <input
            name="email" value={form.email} onChange={onChange}
            type="email" className="input" placeholder="hospital@example.com"
          />
        </div>

        {/* Status */}
        <div>
          <label className="label">Status</label>
          <div className="grid grid-cols-2 gap-3">
            {['active', 'inactive'].map((s) => (
              <button
                key={s} type="button"
                onClick={() => onChange({ target: { name: 'status', value: s } })}
                className={`py-2.5 font-bold text-sm uppercase tracking-wide border-2 transition-all ${
                  form.status === s
                    ? s === 'active'
                      ? 'bg-green-600 text-white border-green-600'
                      : 'bg-gray-700 text-white border-gray-700'
                    : 'bg-white text-text-secondary border-gray-200 hover:border-gray-300'
                }`}
              >
                {s === 'active' ? '✓ Active' : '✗ Inactive'}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-ghost border border-gray-200 px-6 py-3 bg-white">
            Cancel
          </button>
          <button type="submit" disabled={submitting} className="btn-primary flex-1 disabled:opacity-60">
            {submitting ? 'Saving…' : 'Save Hospital'}
          </button>
        </div>
      </form>
    </motion.div>
  </div>
);

// ─── Delete Confirm Modal ────────────────────────────────────────────────────
const DeleteModal = ({ hospital, onConfirm, onClose, submitting }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.55)' }}>
    <motion.div
      variants={modalAnim} initial="hidden" animate="show"
      className="w-full max-w-sm bg-white shadow-2xl"
      style={{ borderRadius: 0 }}
    >
      <div className="px-6 py-5 text-center space-y-4">
        <div className="w-12 h-12 bg-red-50 border border-red-200 flex items-center justify-center mx-auto">
          <Trash2 size={22} style={{ color: '#B03030' }} />
        </div>
        <div>
          <h3 className="text-lg font-black text-text-primary">Delete Hospital?</h3>
          <p className="text-sm text-text-secondary mt-1">
            Are you sure you want to delete <strong>"{hospital?.name}"</strong>?
            This action will remove it from all dropdowns and cannot be undone.
          </p>
        </div>
        <div className="flex gap-3 pt-1">
          <button onClick={onClose} className="flex-1 btn-ghost border border-gray-200 py-3 bg-white">
            Cancel
          </button>
          <button
            onClick={onConfirm} disabled={submitting}
            className="flex-1 py-3 font-bold text-sm uppercase tracking-wider text-white transition-all disabled:opacity-60"
            style={{ background: '#B03030' }}
          >
            {submitting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </motion.div>
  </div>
);

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function AdminHospitals() {
  const { user } = useAuth();

  // ── Data state ──────────────────────────────────────────────────
  const [hospitals, setHospitals]   = useState([]);
  const [loading, setLoading]       = useState(true);

  // ── UI state ────────────────────────────────────────────────────
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'inactive'

  // ── Modal state ──────────────────────────────────────────────────
  const [showAdd, setShowAdd]       = useState(false);
  const [editTarget, setEditTarget] = useState(null);  // hospital object or null
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm]             = useState(EMPTY_FORM);

  // ── Load hospitals ───────────────────────────────────────────────
  const loadHospitals = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await fetchAdminHospitals();
      setHospitals(data.hospitals);
    } catch {
      toast.error('Failed to load hospitals');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadHospitals(); }, [loadHospitals]);

  // ── Filtered list ────────────────────────────────────────────────
  const filtered = hospitals.filter((h) => {
    const matchSearch = h.name.toLowerCase().includes(search.toLowerCase()) ||
      h.address.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || h.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // ── Form helpers ─────────────────────────────────────────────────
  const handleFormChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setShowAdd(true);
  };

  const openEdit = (hospital) => {
    setForm({
      name:    hospital.name,
      address: hospital.address,
      phone:   hospital.phone,
      email:   hospital.email || '',
      status:  hospital.status,
    });
    setEditTarget(hospital);
  };

  // ── Submit Add ───────────────────────────────────────────────────
  const handleAdd = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createHospital(form);
      toast.success(`"${form.name}" added successfully`);
      setShowAdd(false);
      loadHospitals();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add hospital');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Submit Edit ──────────────────────────────────────────────────
  const handleEdit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await updateHospital(editTarget._id, form);
      toast.success(`"${form.name}" updated successfully`);
      setEditTarget(null);
      loadHospitals();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update hospital');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Confirm Delete ───────────────────────────────────────────────
  const handleDelete = async () => {
    setSubmitting(true);
    try {
      const { data } = await deleteHospital(deleteTarget._id);
      toast.success(data.message || 'Hospital deleted');
      setDeleteTarget(null);
      loadHospitals();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete hospital');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ background: '#F7F7F8' }}>

      {/* ── Admin Header ── */}
      <div
        className="text-white px-6 py-8 mb-8"
        style={{ background: 'linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 100%)', borderBottom: '3px solid #B03030' }}
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span
                className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1"
                style={{ background: 'rgba(176,48,48,0.25)', border: '1px solid rgba(176,48,48,0.50)', color: '#EAA8A8' }}
              >
                Admin Panel
              </span>
              <span
                className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#AAAAAA' }}
              >
                {user?.district}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white mb-1 flex items-center gap-3">
              <Building2 size={32} />
              Hospital Management
            </h1>
            <p className="text-gray-400 font-medium text-sm">
              Manage hospitals in {user?.district} district
            </p>
          </div>

          {/* Add button in header */}
          <button
            onClick={openAdd}
            className="flex items-center gap-2 px-5 py-3 font-black text-sm uppercase tracking-wider transition-all hover:opacity-80 self-start md:self-auto"
            style={{ background: '#B03030', color: '#FFFFFF' }}
          >
            <Plus size={18} />
            Add Hospital
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 space-y-6">

        {/* ── Search + Filter bar ── */}
        <motion.div variants={fadeUp} initial="hidden" animate="show" className="bg-white p-4 flex flex-col sm:flex-row gap-3" style={adminCard}>
          {/* Search */}
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search hospitals by name or address…"
              className="input pl-9 py-2.5 text-sm"
            />
          </div>
          {/* Status filter */}
          <div className="flex gap-1">
            {[
              { key: 'all',      label: 'All' },
              { key: 'active',   label: 'Active' },
              { key: 'inactive', label: 'Inactive' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setStatusFilter(key)}
                className="px-4 py-2.5 text-xs font-black uppercase tracking-wider transition-all"
                style={
                  statusFilter === key
                    ? { background: '#1A1A1A', color: '#FFFFFF' }
                    : { background: '#F3F3F3', color: '#555555', border: '1px solid #E0E0E0' }
                }
              >
                {label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── Count summary ── */}
        <div className="flex items-center gap-3 text-sm text-text-secondary">
          <Building2 size={14} />
          <span>
            Showing <strong className="text-text-primary">{filtered.length}</strong> of{' '}
            <strong className="text-text-primary">{hospitals.length}</strong> hospitals in{' '}
            <strong className="text-text-primary">{user?.district}</strong>
          </span>
        </div>

        {/* ── Hospitals list ── */}
        {loading ? (
          <LoadingSpinner message="Loading hospitals…" />
        ) : filtered.length === 0 ? (
          <motion.div variants={fadeUp} initial="hidden" animate="show" className="bg-white p-12 text-center" style={adminCard}>
            <Building2 size={40} className="mx-auto mb-3" style={{ color: '#CCCCCC' }} />
            <p className="font-bold text-text-primary">
              {hospitals.length === 0 ? 'No hospitals yet' : 'No hospitals match your search'}
            </p>
            <p className="text-sm text-text-secondary mt-1">
              {hospitals.length === 0
                ? `Add hospitals in ${user?.district} district to get started.`
                : 'Try adjusting your search or filter.'}
            </p>
            {hospitals.length === 0 && (
              <button onClick={openAdd} className="btn-primary mt-4 inline-flex items-center gap-2">
                <Plus size={16} /> Add First Hospital
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div
            variants={{ show: { transition: { staggerChildren: 0.05 } } }}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 lg:grid-cols-2 gap-4"
          >
            {filtered.map((hospital) => (
              <motion.div
                key={hospital._id}
                variants={fadeUp}
                className="bg-white p-5 flex flex-col gap-4"
                style={{
                  ...adminCard,
                  borderLeft: hospital.status === 'active' ? '3px solid #B03030' : '3px solid #999999',
                }}
              >
                {/* Top row: name + status */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-black text-base text-text-primary truncate">
                        {hospital.name}
                      </h3>
                      <StatusBadge status={hospital.status} />
                    </div>
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mt-0.5">
                      {hospital.district}
                    </p>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-1.5">
                  <div className="flex items-start gap-2 text-xs text-text-secondary">
                    <MapPin size={13} className="mt-0.5 shrink-0 text-text-muted" />
                    <span>{hospital.address}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-secondary">
                    <Phone size={13} className="shrink-0 text-text-muted" />
                    <span>{hospital.phone}</span>
                  </div>
                  {hospital.email && (
                    <div className="flex items-center gap-2 text-xs text-text-secondary">
                      <Mail size={13} className="shrink-0 text-text-muted" />
                      <span>{hospital.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-text-muted">
                    <Clock size={13} className="shrink-0" />
                    <span>
                      Added {new Date(hospital.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {hospital.createdBy?.name ? ` by ${hospital.createdBy.name}` : ''}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
                  <button
                    onClick={() => openEdit(hospital)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-black uppercase tracking-wider transition-all"
                    style={{ background: '#F3F3F3', color: '#333333', border: '1px solid #E0E0E0' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#E8E8E8'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#F3F3F3'; }}
                  >
                    <Edit2 size={13} /> Edit
                  </button>
                  <button
                    onClick={() => setDeleteTarget(hospital)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-black uppercase tracking-wider transition-all"
                    style={{ background: '#FFF5F5', color: '#B03030', border: '1px solid rgba(176,48,48,0.25)' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#FDEAEA'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#FFF5F5'; }}
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* ── Modals ── */}
      <AnimatePresence>
        {showAdd && (
          <HospitalFormModal
            title="Add New Hospital"
            form={form}
            district={user?.district}
            onChange={handleFormChange}
            onSubmit={handleAdd}
            onClose={() => setShowAdd(false)}
            submitting={submitting}
          />
        )}
        {editTarget && (
          <HospitalFormModal
            title="Edit Hospital"
            form={form}
            district={user?.district}
            onChange={handleFormChange}
            onSubmit={handleEdit}
            onClose={() => setEditTarget(null)}
            submitting={submitting}
          />
        )}
        {deleteTarget && (
          <DeleteModal
            hospital={deleteTarget}
            onConfirm={handleDelete}
            onClose={() => setDeleteTarget(null)}
            submitting={submitting}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
