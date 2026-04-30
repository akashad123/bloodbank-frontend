import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ToggleLeft, ToggleRight, Phone } from 'lucide-react';
import { BloodGroupBadge, LoadingSpinner, EmptyState } from '../components/UI';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { BLOOD_GROUPS, formatDate } from '../utils/constants';

export default function AdminUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ bloodGroup: '', eligibleOnly: '' });
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20, ...filters });
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
    <div className="min-h-screen bg-bg">
      
      <div className="page-header">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Admin</p>
            <h1 className="text-3xl font-black">Donors in {user?.district}</h1>
            <p className="text-gray-400 text-sm">{total} registered donors</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Filters */}
        <div className="card mb-6 flex flex-wrap gap-4 items-end">
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
          <button
            onClick={() => { setFilters({ bloodGroup: '', eligibleOnly: '' }); setPage(1); }}
            className="btn-ghost border border-bg-darker px-4 py-3"
          >
            Clear
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <LoadingSpinner />
        ) : users.length === 0 ? (
          <EmptyState icon="👥" title="No Donors Found" description="No donors match your filter in this district." />
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full bg-white border border-bg-darker">
                <thead>
                  <tr className="bg-text-primary text-white text-xs uppercase tracking-wide">
                    {['Blood Group', 'Name', 'Phone', 'Last Donation', 'Eligible', 'Available', 'Actions'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left font-bold">{h}</th>
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
                      className="border-b border-bg-darker hover:bg-bg transition-colors"
                    >
                      <td className="px-4 py-3">
                        <BloodGroupBadge group={u.bloodGroup} size="sm" />
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-sm">{u.name}</p>
                        <p className="text-xs text-text-muted">{u.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        <a href={`tel:${u.phone}`} className="text-sm text-primary font-medium flex items-center gap-1 hover:underline">
                          <Phone size={12} /> {u.phone}
                        </a>
                      </td>
                      <td className="px-4 py-3 text-sm text-text-muted">
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
                          className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 border transition-colors ${
                            u.availabilityStatus
                              ? 'border-red-300 text-red-600 hover:bg-red-50'
                              : 'border-green-300 text-green-600 hover:bg-green-50'
                          }`}
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

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {users.map((u) => (
                <div key={u._id} className="card">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <BloodGroupBadge group={u.bloodGroup} size="sm" />
                      <div>
                        <p className="font-semibold text-sm">{u.name}</p>
                        <p className="text-xs text-text-muted">{u.phone}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => toggleUser(u._id)}
                      className={`text-xs font-bold px-3 py-1.5 border ${
                        u.availabilityStatus ? 'border-red-300 text-red-600' : 'border-green-300 text-green-600'
                      }`}
                    >
                      {u.availabilityStatus ? 'Disable' : 'Enable'}
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <span className={`badge ${u.isEligible ? 'badge-approved' : 'badge-pending'}`}>
                      {u.isEligible ? 'Eligible' : 'Not Eligible'}
                    </span>
                    <span className={`badge ${u.availabilityStatus ? 'badge-approved' : 'badge-rejected'}`}>
                      {u.availabilityStatus ? 'Active' : 'Paused'}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted mt-2">Last donation: {formatDate(u.lastDonationDate)}</p>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="btn-ghost border border-bg-darker disabled:opacity-40 px-4 py-2">← Prev</button>
                <span className="text-sm text-text-muted px-4">{page} / {pages}</span>
                <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages} className="btn-ghost border border-bg-darker disabled:opacity-40 px-4 py-2">Next →</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
