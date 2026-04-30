import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Phone, MapPin, Clock, Trash2, Edit } from 'lucide-react';
import { BloodGroupBadge, StatusBadge, UrgencyBadge, LoadingSpinner } from '../components/UI';
import { useAuth } from '../contexts/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { formatDate, timeAgo } from '../utils/constants';

export default function RequestDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/requests/${id}`)
      .then(({ data }) => setRequest(data.request))
      .catch(() => toast.error('Request not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('Delete this request?')) return;
    try {
      await api.delete(`/requests/${id}`);
      toast.success('Request deleted');
      navigate('/requests');
    } catch { toast.error('Could not delete request'); }
  };

  if (loading) return <><LoadingSpinner /></>;
  if (!request) return <><div className="p-8 text-center text-text-muted">Request not found</div></>;

  const isOwner = request.createdBy?._id === user?._id;
  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen bg-bg">
      
      <div className={`page-header ${request.urgency === 'emergency' ? 'bg-red-900' : 'bg-text-primary'}`}>
        <div className="max-w-4xl mx-auto flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <UrgencyBadge urgency={request.urgency} />
              <StatusBadge status={request.status} />
            </div>
            <h1 className="text-3xl font-black">{request.bloodGroup} Blood Needed</h1>
            <p className="text-gray-400 mt-1">{request.hospital} · {request.district}</p>
          </div>
          <BloodGroupBadge group={request.bloodGroup} size="lg" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 grid md:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="md:col-span-2 space-y-4">
          <div className="card">
            <h2 className="font-black text-lg mb-4 border-b border-bg-darker pb-3">Request Details</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Blood Group', value: request.bloodGroup },
                { label: 'Units Required', value: `${request.units} unit(s)` },
                { label: 'Hospital', value: request.hospital },
                { label: 'District', value: request.district },
                { label: 'Urgency', value: request.urgency.charAt(0).toUpperCase() + request.urgency.slice(1) },
                { label: 'Status', value: request.status.charAt(0).toUpperCase() + request.status.slice(1) },
                { label: 'Posted', value: timeAgo(request.createdAt) },
                { label: 'By', value: request.createdBy?.name || 'Unknown' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs font-bold uppercase tracking-wide text-text-muted">{label}</p>
                  <p className="font-semibold text-sm mt-0.5">{value}</p>
                </div>
              ))}
            </div>
            {request.additionalInfo && (
              <div className="mt-4 pt-4 border-t border-bg-darker">
                <p className="text-xs font-bold uppercase tracking-wide text-text-muted mb-1">Additional Info</p>
                <p className="text-sm text-text-secondary">{request.additionalInfo}</p>
              </div>
            )}
          </div>

          {/* Matched Donors (admin view) */}
          {isAdmin && request.matchedDonors?.length > 0 && (
            <div className="card">
              <h2 className="font-black text-lg mb-4 border-b border-bg-darker pb-3">
                Matched Donors ({request.matchedDonors.length})
              </h2>
              <div className="space-y-3">
                {request.matchedDonors.map((donor) => (
                  <div key={donor._id} className="flex items-center justify-between bg-bg p-3">
                    <div className="flex items-center gap-3">
                      <BloodGroupBadge group={donor.bloodGroup} size="sm" />
                      <div>
                        <p className="font-semibold text-sm">{donor.name}</p>
                        <p className="text-xs text-text-muted">{donor.district}</p>
                      </div>
                    </div>
                    <a href={`tel:${donor.phone}`} className="flex items-center gap-1 text-primary text-xs font-semibold">
                      <Phone size={14} /> {donor.phone}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Contact & Actions Sidebar */}
        <div className="space-y-4">
          <div className="card border-l-4 border-l-primary">
            <h3 className="font-black text-base mb-3">Contact</h3>
            <p className="font-semibold text-sm">{request.contactName}</p>
            <a
              href={`tel:${request.contactPhone}`}
              className="flex items-center gap-2 text-primary font-bold text-sm mt-2 hover:underline"
            >
              <Phone size={16} /> {request.contactPhone}
            </a>
          </div>

          {/* Admin note */}
          {request.adminNote && (
            <div className="card bg-yellow-50 border-yellow-200">
              <p className="text-xs font-bold uppercase tracking-wide text-yellow-700 mb-1">Admin Note</p>
              <p className="text-sm text-yellow-800">{request.adminNote}</p>
            </div>
          )}

          {/* Owner actions */}
          {isOwner && request.status === 'pending' && (
            <div className="space-y-2">
              <Link to={`/requests/${id}/edit`} className="btn-outline w-full py-3 flex items-center justify-center gap-2 text-sm">
                <Edit size={16} /> Edit Request
              </Link>
              <button onClick={handleDelete} className="btn-danger w-full py-3 flex items-center justify-center gap-2 text-sm">
                <Trash2 size={16} /> Delete Request
              </button>
            </div>
          )}

          {/* Admin: mark fulfilled */}
          {isAdmin && request.status === 'approved' && (
            <button
              onClick={async () => {
                try {
                  await api.put(`/requests/${id}/status`, { status: 'fulfilled' });
                  toast.success('Marked as fulfilled');
                  setRequest({ ...request, status: 'fulfilled' });
                } catch { toast.error('Failed to update'); }
              }}
              className="btn-primary w-full py-3 text-sm"
            >
              ✅ Mark as Fulfilled
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
