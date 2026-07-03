import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ToggleLeft, ToggleRight, Phone, ShieldCheck, AlertTriangle } from 'lucide-react';
import { BloodGroupBadge, LoadingSpinner, EmptyState } from '../components/UI';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { BLOOD_GROUPS, formatDate } from '../utils/constants';

/* ── Shared admin card border style ── */
const adminCard = {
  border: '1px solid rgba(0,0,0,0.12)',
  boxShadow: '0 1px 6px rgba(0,0,0,0.06), 0 0 0 0.5px rgba(0,0,0,0.04)',
};

const DonorStatusBadge = ({ status }) => {
  const map = {
    'Eligible to Donate':    { text: 'Eligible to Donate',  class: 'bg-green-50 border-green-200 text-green-700' },
    'Waiting Period Active': { text: 'Waiting Period',      class: 'bg-amber-50 border-amber-250 text-amber-800' },
    'Eligibility Unknown':   { text: 'Eligibility Unknown',   class: 'bg-blue-50 border-blue-200 text-blue-700' },
    'Pending Screening':     { text: 'Pending Screening',     class: 'bg-gray-50 border-gray-200 text-text-muted' },
    'Screening Failed':      { text: 'Screening Failed',      class: 'bg-red-50 border-red-200 text-red-700' }
  };
  const cfg = map[status] || { text: status || 'Pending Screening', class: 'bg-gray-50 border-gray-200 text-text-muted' };
  return (
    <span className={`inline-flex items-center px-2 py-1 text-[11px] font-black border uppercase tracking-wider ${cfg.class}`} style={{ borderRadius: 0 }}>
      {cfg.text}
    </span>
  );
};

export default function AdminUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ bloodGroup: '', eligibleOnly: '', screeningStatus: '' });
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      // Build query params, omitting empty values
      const rawFilters = Object.fromEntries(Object.entries({ page, limit: 20, ...filters }).filter(([, v]) => v !== ''));
      const params = new URLSearchParams(rawFilters);
      const { data } = await api.get(`/admin/users?${params}`);
      setUsers(data.users);
      setPages(data.pages);
      setTotal(data.total);
    } catch { } finally { setLoading(false); }
  }, [filters, page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const toggleUser = async (userId) => {
    try {
      const { data } = await api.put(`/admin/users/${userId}/toggle`);
      toast.success(data.message);
      setUsers((prev) => prev.map((u) =>
        u._id === userId ? { ...u, availabilityStatus: data.user.availabilityStatus } : u
      ));
    } catch { toast.error('Failed to update user'); }
  };

  return (
    <div className="min-h-screen" style={{ background: '#F7F7F8' }}>

      {/* ── Admin Page Header ── */}
      <div
        className="text-white px-6 py-8 mb-0"
        style={{
          background: 'linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 100%)',
          borderBottom: '3px solid #B03030',
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <p
              className="text-[10px] font-black uppercase tracking-widest mb-1"
              style={{ color: '#888888' }}
            >
              Admin
            </p>
            <h1 className="text-3xl font-black text-white">
              Donors in {user?.district}
            </h1>
            <p className="text-sm mt-0.5" style={{ color: '#AAAAAA' }}>
              {total} registered donors
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">

        {/* ── Filters Card ── */}
        <div
          className="bg-white mb-6 p-5 flex flex-wrap gap-4 items-end"
          style={adminCard}
        >
          {/* Filter label row */}
          <div
            className="w-full flex items-center gap-2 pb-3 mb-1"
            style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}
          >
            <span className="w-1 h-4 shrink-0" style={{ background: '#B03030' }} />
            <span className="text-xs font-black uppercase tracking-widest" style={{ color: '#444444' }}>
              Filter Donors
            </span>
          </div>

          <div className="min-w-48">
            <label className="label">Blood Group</label>
            <select
              value={filters.bloodGroup}
              onChange={(e) => setFilters({ ...filters, bloodGroup: e.target.value })}
              className="select"
            >
              <option value="">All Groups</option>
              {BLOOD_GROUPS.map((bg) => <option key={bg} value={bg}>{bg}</option>)}
            </select>
          </div>

          <div className="min-w-48">
            <label className="label">Availability</label>
            <select
              value={filters.eligibleOnly}
              onChange={(e) => setFilters({ ...filters, eligibleOnly: e.target.value })}
              className="select"
            >
              <option value="">All Donors</option>
              <option value="true">Eligible &amp; Available Only</option>
            </select>
          </div>

          <div className="min-w-48">
            <label className="label">Screening Status</label>
            <select
              value={filters.screeningStatus}
              onChange={(e) => setFilters({ ...filters, screeningStatus: e.target.value })}
              className="select"
            >
              <option value="">All Users</option>
              <option value="eligible">Screened — Eligible</option>
              <option value="ineligible">Screened — Ineligible</option>
              <option value="none">Not Screened</option>
            </select>
          </div>

          <button
            onClick={() => { setFilters({ bloodGroup: '', eligibleOnly: '', screeningStatus: '' }); setPage(1); }}
            className="px-4 py-3 text-sm font-semibold transition-all duration-200"
            style={{
              border: '1px solid rgba(0,0,0,0.15)',
              color: '#444444',
              background: '#FAFAFA',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#F0F0F0'}
            onMouseLeave={e => e.currentTarget.style.background = '#FAFAFA'}
          >
            Clear
          </button>
        </div>

        {/* ── Table / Cards ── */}
        {loading ? (
          <LoadingSpinner />
        ) : users.length === 0 ? (
          <EmptyState icon="👥" title="No Donors Found" description="No donors match your filter in this district." />
        ) : (
          <>
            {/* ── Desktop Table ── */}
            <div className="hidden md:block overflow-x-auto" style={adminCard}>
              <table className="w-full bg-white">
                <thead>
                  <tr
                    style={{
                      background: 'linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 100%)',
                      borderBottom: '2px solid #B03030',
                    }}
                  >
                    {['Blood Group', 'Name', 'Phone', 'Donor Status', 'Last Donation', 'Eligible', 'Available', 'Actions'].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-xs font-black uppercase tracking-widest"
                        style={{ color: '#DDDDDD' }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <motion.tr
                      key={u._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="transition-colors duration-150"
                      style={{ borderBottom: '1px solid rgba(0,0,0,0.07)' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#F5F5F5'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td className="px-4 py-3">
                        <BloodGroupBadge group={u.bloodGroup} size="sm" />
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-sm" style={{ color: '#111111' }}>{u.name}</p>
                        <p className="text-xs" style={{ color: '#888888' }}>{u.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <a
                          href={`tel:${u.phone}`}
                          className="text-sm font-medium flex items-center gap-1 hover:underline"
                          style={{ color: '#B03030' }}
                        >
                          <Phone size={12} /> {u.phone}
                        </a>
                      </td>
                      {/* ── Donor Status Badge ── */}
                      <td className="px-4 py-3">
                        <DonorStatusBadge status={u.donorStatus} />
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: '#888888' }}>
                        {formatDate(u.lastDonationDate)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge ${u.isEligible ? 'badge-approved' : 'badge-pending'}`}>
                          {u.isEligible ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge ${u.availabilityStatus ? 'badge-approved' : 'badge-rejected'}`}>
                          {u.availabilityStatus ? 'Active' : 'Paused'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleUser(u._id)}
                          className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 transition-all duration-200"
                          style={{
                            border: u.availabilityStatus
                              ? '1px solid rgba(220,38,38,0.35)'
                              : '1px solid rgba(34,197,94,0.35)',
                            color: u.availabilityStatus ? '#DC2626' : '#16A34A',
                            background: u.availabilityStatus
                              ? 'rgba(220,38,38,0.06)'
                              : 'rgba(34,197,94,0.06)',
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = u.availabilityStatus
                              ? 'rgba(220,38,38,0.12)' : 'rgba(34,197,94,0.12)';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = u.availabilityStatus
                              ? 'rgba(220,38,38,0.06)' : 'rgba(34,197,94,0.06)';
                          }}
                        >
                          {u.availabilityStatus ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                          {u.availabilityStatus ? 'Disable' : 'Enable'}
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── Mobile Cards ── */}
            <div className="md:hidden space-y-3">
              {users.map((u) => (
                <div
                  key={u._id}
                  className="bg-white p-4"
                  style={adminCard}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <BloodGroupBadge group={u.bloodGroup} size="sm" />
                      <div>
                        <p className="font-semibold text-sm" style={{ color: '#111111' }}>{u.name}</p>
                        <p className="text-xs" style={{ color: '#888888' }}>{u.phone}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleUser(u._id)}
                      className="text-xs font-bold px-3 py-1.5 transition-colors duration-200"
                      style={{
                        border: u.availabilityStatus
                          ? '1px solid rgba(220,38,38,0.35)'
                          : '1px solid rgba(34,197,94,0.35)',
                        color: u.availabilityStatus ? '#DC2626' : '#16A34A',
                        background: u.availabilityStatus
                          ? 'rgba(220,38,38,0.06)'
                          : 'rgba(34,197,94,0.06)',
                      }}
                    >
                      {u.availabilityStatus ? 'Disable' : 'Enable'}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {/* Donor Status badge */}
                    <DonorStatusBadge status={u.donorStatus} />
                    <span className={`badge ${u.isEligible ? 'badge-approved' : 'badge-pending'}`}>
                      {u.isEligible ? 'Eligible' : 'Not Eligible'}
                    </span>
                    <span className={`badge ${u.availabilityStatus ? 'badge-approved' : 'badge-rejected'}`}>
                      {u.availabilityStatus ? 'Active' : 'Paused'}
                    </span>
                  </div>
                  <p className="text-xs mt-2" style={{ color: '#AAAAAA' }}>
                    Last donation: {formatDate(u.lastDonationDate)}
                  </p>
                </div>
              ))}
            </div>

            {/* ── Pagination ── */}
            {pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 text-sm font-semibold transition-all duration-200 disabled:opacity-40"
                  style={{
                    border: '1px solid rgba(0,0,0,0.15)',
                    color: '#444444',
                    background: '#FFFFFF',
                  }}
                >
                  ← Prev
                </button>
                <span className="text-sm px-4" style={{ color: '#888888' }}>
                  {page} / {pages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(pages, p + 1))}
                  disabled={page === pages}
                  className="px-4 py-2 text-sm font-semibold transition-all duration-200 disabled:opacity-40"
                  style={{
                    border: '1px solid rgba(0,0,0,0.15)',
                    color: '#444444',
                    background: '#FFFFFF',
                  }}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
