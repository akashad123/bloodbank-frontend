import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Phone, Save, Edit3 } from 'lucide-react';
import { PageHeader, LoadingSpinner } from '../components/UI';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function AdminContacts() {
  const [contacts, setContacts] = useState([
    { name: '', phone: '' },
    { name: '', phone: '' },
    { name: '', phone: '' }
  ]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const { data } = await api.get('/settings/contacts');
        if (data.contacts && data.contacts.length > 0) {
          // Ensure we always display exactly 3 contacts (pad with empty if needed)
          const fetchedContacts = data.contacts;
          const paddedContacts = [
            fetchedContacts[0] || { name: '', phone: '' },
            fetchedContacts[1] || { name: '', phone: '' },
            fetchedContacts[2] || { name: '', phone: '' }
          ];
          setContacts(paddedContacts);
        }
      } catch (err) {
        toast.error('Failed to load contacts');
      } finally {
        setLoading(false);
      }
    };
    fetchContacts();
  }, []);

  const handleChange = (index, field, value) => {
    const updatedContacts = [...contacts];
    updatedContacts[index][field] = value;
    setContacts(updatedContacts);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/settings/contacts', { contacts });
      toast.success('Official contacts updated successfully!');
    } catch (err) {
      toast.error('Failed to update contacts');
    } finally {
      setSaving(false);
    }
  };

  const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

  if (loading) return <LoadingSpinner message="Loading contacts..." />;

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12">
      <PageHeader
        eyebrow="Admin Panel"
        title="Manage Official Contacts"
        subtitle="These contacts will be displayed on all Blood Request pages."
        maxWidth="max-w-3xl"
        right={<Phone size={32} className="text-primary/20" />}
      />

      <div className="max-w-3xl mx-auto px-6 mt-6">
        <motion.div variants={fadeUp} initial="hidden" animate="show" className="bg-white p-8 shadow-sm border border-gray-200" style={{ borderRadius: '0', borderTop: '3px solid #111' }}>
          
          <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
            <Edit3 size={20} className="text-primary" />
            <h2 className="font-black text-xl text-text-primary">Official Blood Bank Contacts</h2>
          </div>

          <div className="space-y-6">
            {contacts.map((contact, index) => (
              <div key={index} className="bg-gray-50 p-5 border border-gray-200" style={{ borderRadius: '0' }}>
                <h3 className="font-bold text-sm text-text-secondary mb-4 uppercase tracking-wider">Contact {index + 1}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-text-muted mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      value={contact.name}
                      onChange={(e) => handleChange(index, 'name', e.target.value)}
                      className="input-field w-full text-sm font-semibold"
                      placeholder="e.g., Rahul Tacholi"
                      style={{ borderRadius: '0' }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black uppercase tracking-wider text-text-muted mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={contact.phone}
                      onChange={(e) => handleChange(index, 'phone', e.target.value)}
                      className="input-field w-full text-sm font-semibold"
                      placeholder="e.g., 9946709455"
                      style={{ borderRadius: '0' }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-black hover:bg-gray-800 text-white font-bold py-3 px-8 text-sm uppercase tracking-wider transition-colors flex items-center gap-2 disabled:opacity-50"
              style={{ borderRadius: '0' }}
            >
              <Save size={16} />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
