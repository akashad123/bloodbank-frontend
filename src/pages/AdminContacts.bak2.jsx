import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, PhoneCall } from 'lucide-react';
import { PageHeader, LoadingSpinner } from '../components/UI';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function AdminContacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ isOpen: false, data: null });
  const [saving, setSaving] = useState(false);

  const fetchContacts = async () => {
    try {
      const { data } = await api.get('/contacts/all');
      setContacts(data.contacts);
    } catch (err) {
      toast.error('Failed to fetch emergency contacts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  const handleToggleActive = async (contact) => {
    try {
      await api.put(`/contacts/${contact._id}`, { isActive: !contact.isActive });
      toast.success(`Contact marked as ${!contact.isActive ? 'Active' : 'Inactive'}`);
      fetchContacts();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) return;
    try {
      await api.delete(`/contacts/${id}`);
      toast.success('Contact deleted successfully');
      fetchContacts();
    } catch (err) {
      toast.error('Failed to delete contact');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = {
      name: formData.get('name'),
      phone: formData.get('phone'),
      isActive: formData.get('isActive') === 'on',
      displayOrder: parseInt(formData.get('displayOrder') || '0', 10),
    };

    try {
      if (modal.data) {
        await api.put(`/contacts/${modal.data._id}`, payload);
        toast.success('Contact updated successfully');
      } else {
        await api.post('/contacts', payload);
        toast.success('Contact added successfully');
      }
      setModal({ isOpen: false, data: null });
      fetchContacts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save contact');
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  if (loading) return <LoadingSpinner message="Loading contacts..." />;

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      <PageHeader
        eyebrow="Settings"
        title="Emergency Contacts"
        subtitle="Manage the global emergency contacts displayed on blood requests."
        right={
          <button
            onClick={() => setModal({ isOpen: true, data: null })}
            className="bg-black text-white px-5 py-2.5 font-bold uppercase tracking-wider text-xs flex items-center gap-2 hover:bg-gray-800 transition-colors"
            style={{ borderRadius: '0' }}
          >
            <Plus size={16} /> Add Contact
          </button>
        }
      />

      <div className="max-w-7xl mx-auto px-6 mt-8">
        <div className="bg-white border border-gray-200 shadow-sm overflow-hidden" style={{ borderRadius: '0' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase font-black text-text-primary tracking-wider">
                <tr>
                  <th className="px-6 py-4">Display Order</th>
                  <th className="px-6 py-4">Contact</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Last Updated By</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(!contacts || contacts.length === 0) ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-text-muted font-medium">
                      No emergency contacts found.
                    </td>
                  </tr>
                ) : (
                  contacts.map((c) => (
                    <tr key={c._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 font-black text-gray-400">#{c.displayOrder}</td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-text-primary text-base">{c.name}</div>
                        <div className="flex items-center gap-1.5 text-text-secondary mt-1">
                          <PhoneCall size={12} className="text-primary" /> {c.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleToggleActive(c)}
                          className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                            c.isActive ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-gray-100 text-gray-500 border border-gray-200'
                          }`}
                        >
                          {c.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-xs text-text-secondary">
                        {c.updatedBy?.name || 'Unknown'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setModal({ isOpen: true, data: c })}
                            className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(c._id)}
                            className="p-2 text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md shadow-2xl" style={{ borderRadius: '0', border: '1px solid rgba(0,0,0,0.1)' }}>
            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50">
              <h2 className="font-black text-lg text-text-primary uppercase tracking-wider">
                {modal.data ? 'Edit Contact' : 'Add Contact'}
              </h2>
              <button onClick={() => setModal({ isOpen: false, data: null })} className="text-text-muted hover:text-text-primary">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-text-secondary mb-2">
                  Full Name <span className="text-primary">*</span>
                </label>
                <input
                  name="name"
                  type="text"
                  defaultValue={modal.data?.name}
                  required
                  placeholder="e.g. Rahul Tacholi"
                  className="w-full border border-gray-200 p-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  style={{ borderRadius: '0' }}
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-text-secondary mb-2">
                  Mobile Number <span className="text-primary">*</span>
                </label>
                <input
                  name="phone"
                  type="text"
                  defaultValue={modal.data?.phone}
                  required
                  pattern="[0-9]{10}"
                  placeholder="10-digit mobile number"
                  title="Mobile number must be exactly 10 digits"
                  className="w-full border border-gray-200 p-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  style={{ borderRadius: '0' }}
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-black uppercase tracking-widest text-text-secondary mb-2">
                    Display Order
                  </label>
                  <input
                    name="displayOrder"
                    type="number"
                    defaultValue={modal.data?.displayOrder ?? 0}
                    className="w-full border border-gray-200 p-3 text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    style={{ borderRadius: '0' }}
                  />
                </div>
                
                <div className="flex-1 flex items-center pt-6">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      name="isActive"
                      type="checkbox"
                      defaultChecked={modal.data ? modal.data.isActive : true}
                      className="w-5 h-5 accent-primary cursor-pointer"
                    />
                    <span className="text-sm font-bold text-text-primary">Active</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModal({ isOpen: false, data: null })}
                  className="px-5 py-2.5 text-xs font-black uppercase tracking-wider text-text-secondary hover:bg-gray-100 transition-colors"
                  style={{ borderRadius: '0' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-primary text-white px-6 py-2.5 text-xs font-black uppercase tracking-wider hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center gap-2"
                  style={{ borderRadius: '0' }}
                >
                  {saving ? 'Saving...' : <><Save size={16} /> Save</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
