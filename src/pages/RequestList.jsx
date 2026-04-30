import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { BloodGroupBadge, UrgencyBadge, StatusBadge, LoadingSpinner, EmptyState } from '../components/UI';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { timeAgo, BLOOD_GROUPS } from '../utils/constants';

export default function RequestList() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ bloodGroup: '', urgency: '' });
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      // Strip empty filter values so they don't pollute the query string
      const activeFilters = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v !== '')
      );
      const params = new URLSearchParams({ page, limit: 15, ...activeFilters });
      const { data } = await api.get(`/requests/my?${params}`);
      console.log('[RequestList] API response:', data);
      setRequests(data.requests ?? []);
      setPages(data.pages ?? 1);
    } catch (err) {
      console.error('[RequestList] fetch error:', err.response?.data || err.message);
      toast.error(err.response?.data?.message || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRequests(); }, [filters, page]);

  return (
    <div className="min-h-screen bg-bg">
      
      <div className="page-header">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Blood Requests</p>
            <h1 className="text-3xl font-black">My Requests</h1>
            <p className="text-gray-400 text-sm">All your created requests</p>
          </div>
          <Link to="/requests/new" className="btn-primary flex items-center gap-2">
            <Plus size={16} /> New Request
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Filters */}
        <div className="card mb-6 flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-48">
            <label className="label">Blood Group</label>
            <select value={filters.bloodGroup} onChange={(e) => setFilters({ ...filters, bloodGroup: e.target.value })} className="select">
              <option value="">All Groups</option>
              {BLOOD_GROUPS.map((bg) => <option key={bg} value={bg}>{bg}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-48">
            <label className="label">Urgency</label>
            <select value={filters.urgency} onChange={(e) => setFilters({ ...filters, urgency: e.target.value })} className="select">
              <option value="">All</option>
              <option value="emergency">Emergency</option>
              <option value="normal">Normal</option>
            </select>
          </div>
          <button onClick={() => setFilters({ bloodGroup: '', urgency: '' })} className="btn-ghost border border-bg-darker px-4 py-3">
            Clear
          </button>
        </div>

        {loading ? <LoadingSpinner message="Fetching requests..." /> : requests.length === 0 ? (
          <EmptyState
            icon="🩸"
            title="No Requests Found"
            description="You haven't created any blood requests yet."
            action={<Link to="/requests/new" className="btn-primary">Create Request</Link>}
          />
        ) : (
          <>
            <div className="space-y-3">
              {requests.map((req) => (
                <motion.div
                  key={req._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`card w-full overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer hover:border-primary transition-colors ${req.urgency === 'emergency' ? 'border-l-4 border-l-red-600' : ''}`}
                  onClick={() => navigate(`/requests/${req._id}`)}
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0 w-full">
                    <BloodGroupBadge group={req.bloodGroup} size="md" />
                    <div className="flex-1 min-w-0 flex flex-col gap-1">
                      <p className="font-bold text-sm md:text-base break-words">{req.hospital}</p>
                      <div className="flex flex-wrap gap-2 mb-1">
                        <UrgencyBadge urgency={req.urgency} />
                        <StatusBadge status={req.status} />
                      </div>
                      <p className="text-xs text-gray-500">{req.district}</p>
                      <p className="text-xs text-text-muted whitespace-nowrap overflow-hidden text-ellipsis">
                        {req.units} unit(s) needed &bull; {timeAgo(req.createdAt)}
                      </p>
                      <p className="text-xs text-text-muted break-all">
                        Contact: {req.contactName} &bull; {req.contactPhone}
                      </p>
                    </div>
                  </div>
                </motion.div>
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
