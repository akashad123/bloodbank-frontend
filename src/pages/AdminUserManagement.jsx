import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Phone, AlertTriangle } from 'lucide-react';
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

export default function AdminUserManagement() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', bloodGroup: '', donorStatus: '', eligibility: '' });
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteModal, setDeleteModal] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const rawFilters = Object.fromEntries(Object.entries({ page, limit: 20, ...filters }).filter(([, v]) => v !== ''));
      const params = new URLSearchParams(rawFilters);
      const { data } = await api.get(`/admin/all-users?${params}`);
      setUsers(data.users);
      setPages(data.pages);
      setTotal(data.total);
    } catch { } finally { setLoading(false); }
  }, [filters, page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // Use a debounced effect for searching
  useEffect(() => {
    const handler = setTimeout(() => {
      setPage(1);
      fetchUsers();
    }, 500);
    return () => clearTimeout(handler);
  }, [filters.search]);

  const handleDeleteUser = async () => {
    if (!deleteModal) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/admin/all-users/${deleteModal._id}`);
      toast.success('User deleted successfully.');
      setDeleteModal(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: '#F7F7F8' }}>

      {/* ── Delete Confirmation Modal ── */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md" style={{ border: '1px solid rgba(0,0,0,0.18)', borderRadius: '0' }}>
            <div className="bg-black text-white px-5 py-4 border-b-4 border-red-700">
              <h2 className="font-black text-lg">Delete User</h2>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-red-50 border border-red-200 p-4">
                <p className="text-sm font-bold text-red-800 flex items-center gap-2">
                  <AlertTriangle size={16} /> Are you sure you want to permanently delete this user?
                </p>
                <p className="text-xs text-red-600 mt-2">This action cannot be undone.</p>
              </div>
              <div className="bg-gray-50 border border-gray-200 p-4 space-y-1">
                <p className="text-sm"><span className="font-bold text-gray-500 uppercase tracking-widest text-xs">Name:</span> {deleteModal.name}</p>
                <p className="text-sm"><span className="font-bold text-gray-500 uppercase tracking-widest text-xs">Mobile:</span> {deleteModal.phone}</p>
              </div>
            </div>
            <div className="px-5 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setDeleteModal(null)}
                className="btn-outline px-4 py-2 text-xs uppercase tracking-wider font-bold"
                style={{ borderRadius: '0' }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                disabled={deleteLoading}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 text-xs uppercase tracking-wider font-bold disabled:opacity-50 transition-colors"
                style={{ borderRadius: '0' }}
              >
                {deleteLoading ? 'Deleting...' : 'Delete User'}
              </button>
            </div>
          </div>
        </div>
      )}

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
              User Management
            </h1>
            <p className="text-sm mt-0.5" style={{ color: '#AAAAAA' }}>
              {total} users in {user?.district}
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
          <div
            className="w-full flex items-center gap-2 pb-3 mb-1"
            style={{ borderBottom: '1px solid rgba(0,0,0,0.08)' }}
          >
            <span className="w-1 h-4 shrink-0" style={{ background: '#B03030' }} />
            <span className="text-xs font-black uppercase tracking-widest" style={{ color: '#444444' }}>
              Filter Users
            </span>
          </div>

          <div className="min-w-48 flex-1">
            <label className="label">Search</label>
            <input
              type="text"
              placeholder="Search by name or mobile..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="input-field w-full"
            />
          </div>

          <div className="min-w-32">
            <label className="label">Blood Group</label>
            <select
              value={filters.bloodGroup}
              onChange={(e) => { setFilters({ ...filters, bloodGroup: e.target.value }); setPage(1); }}
              className="select w-full"
            >
              <option value="">All Groups</option>
              {BLOOD_GROUPS.map((bg) => <option key={bg} value={bg}>{bg}</option>)}
            </select>
          </div>

          <div className="min-w-36">
            <label className="label">Donor Status</label>
            <select
              value={filters.donorStatus}
              onChange={(e) => { setFilters({ ...filters, donorStatus: e.target.value }); setPage(1); }}
              className="select w-full"
            >
              <option value="">All Statuses</option>
              <option value="qualified">Qualified</option>
              <option value="not_qualified">Not Qualified</option>
            </select>
          </div>

          <div className="min-w-36">
            <label className="label">Eligibility</label>
            <select
              value={filters.eligibility}
              onChange={(e) => { setFilters({ ...filters, eligibility: e.target.value }); setPage(1); }}
              className="select w-full"
            >
              <option value="">All</option>
              <option value="eligible">Eligible</option>
              <option value="waiting">Waiting Period</option>
              <option value="not_eligible">Not Eligible</option>
            </select>
          </div>

          <button
            onClick={() => { setFilters({ search: '', bloodGroup: '', donorStatus: '', eligibility: '' }); setPage(1); }}
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
        {loading && users.length === 0 ? (
          <LoadingSpinner />
        ) : users.length === 0 ? (
          <EmptyState icon="👥" title="No Users Found" description="No users match your filter." />
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto" style={adminCard}>
              <table className="w-full bg-white">
                <thead>
                  <tr
                    style={{
                      background: 'linear-gradient(135deg, #1A1A1A 0%, #2D2D2D 100%)',
                      borderBottom: '2px solid #B03030',
                    }}
                  >
                    {['Name', 'Mobile', 'Blood Grp', 'District', 'Donor Status', 'Donation Status', 'Joined', 'Actions'].map((h) => (
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
                        <p className="font-semibold text-sm" style={{ color: '#111111' }}>{u.name}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium" style={{ color: '#444444' }}>{u.phone}</p>
                      </td>
                      <td className="px-4 py-3">
                        {u.bloodGroup ? <BloodGroupBadge group={u.bloodGroup} size="sm" /> : <span className="text-xs text-gray-400">N/A</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-600">{u.district || 'N/A'}</span>
                      </td>
                      <td className="px-4 py-3">
                         <span className={`badge ${u.isQualifiedDonor ? 'badge-approved' : 'badge-pending'}`}>
                          {u.isQualifiedDonor ? 'Qualified' : 'Not Qualified'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {u.isQualifiedDonor ? <DonorStatusBadge status={u.donorStatus} /> : <span className="text-xs text-gray-400">—</span>}
                      </td>
                      <td className="px-4 py-3 text-sm" style={{ color: '#888888' }}>
                        {formatDate(u.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setDeleteModal(u)}
                          className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 transition-all duration-200"
                          style={{
                            border: '1px solid rgba(220,38,38,0.35)',
                            color: '#DC2626',
                            background: 'rgba(220,38,38,0.06)',
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(220,38,38,0.12)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'rgba(220,38,38,0.06)'}
                        >
                          <Trash2 size={14} />
                          Delete
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
                      {u.bloodGroup && <BloodGroupBadge group={u.bloodGroup} size="sm" />}
                      <div>
                        <p className="font-semibold text-sm" style={{ color: '#111111' }}>{u.name}</p>
                        <p className="text-xs" style={{ color: '#888888' }}>{u.phone}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setDeleteModal(u)}
                      className="text-xs font-bold px-3 py-1.5 transition-colors duration-200"
                      style={{
                        border: '1px solid rgba(220,38,38,0.35)',
                        color: '#DC2626',
                        background: 'rgba(220,38,38,0.06)',
                      }}
                    >
                      Delete
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-1">
                     <span className={`badge ${u.isQualifiedDonor ? 'badge-approved' : 'badge-pending'}`}>
                      {u.isQualifiedDonor ? 'Qualified' : 'Not Qualified'}
                    </span>
                    {u.isQualifiedDonor && <DonorStatusBadge status={u.donorStatus} />}
                  </div>
                  <p className="text-xs mt-2" style={{ color: '#AAAAAA' }}>
                    Joined: {formatDate(u.createdAt)}
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
