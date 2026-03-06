import { useState, useEffect, useContext } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { AuthContext } from '../../context/AuthContext.jsx';
import { Calendar, Edit3, Trash2, Plus, X, Video, Phone, UserX } from 'lucide-react';

const PRODUCTS      = ['ECOMax-HE', 'ECOMax-CT', 'ECOMax-HT', 'ECOMax-SE', 'Others'];
const POTENTIALS    = ['High', 'Medium', 'Low'];
const SERVICE_FREQS = ['1 time', '2 times', '3 times', '4 times', '6 times', '8 times', 'On-demand'];

const scoreColor = (score) => {
  if (score >= 85) return 'text-emerald-600 font-black';
  if (score >= 70) return 'text-yellow-600 font-black';
  return 'text-orange-500 font-black';
};

const defaultForm = {
  client:          '',
  product:         'ECOMax-HE',
  contactPerson:   '',
  phone:           '',
  email:           '',
  location:        '',
  serviceFreq:     '4 times',
  annualSpend:     0,
  lastService:     '',
  conversionScore: 70,
  potential:       'Medium',
  notes:           '',
};

const NonAMCPage = () => {
  const [clients, setClients]                 = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [showModal, setShowModal]             = useState(false);
  const [editingId, setEditingId]             = useState(null);
  const [formData, setFormData]               = useState(defaultForm);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const { user } = useContext(AuthContext);

  const fetchClients = async () => {
    try {
      const { data } = await axiosInstance.get('/api/non-amc');
      setClients(data);
    } catch { /* toast.error('Failed to load Non-AMC clients'); */ } // suppressed for Vercel deploy
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchClients();
    const t = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const openAdd  = () => { setEditingId(null); setFormData(defaultForm); setShowModal(true); };
  const openEdit = (c) => {
    setEditingId(c._id);
    setFormData({
      client:          c.client || '',
      product:         c.product || 'ECOMax-HE',
      contactPerson:   c.contactPerson || '',
      phone:           c.phone || '',
      email:           c.email || '',
      location:        c.location || '',
      serviceFreq:     c.serviceFreq || '4 times',
      annualSpend:     c.annualSpend || 0,
      lastService:     c.lastService ? new Date(c.lastService).toISOString().split('T')[0] : '',
      conversionScore: c.conversionScore || 70,
      potential:       c.potential || 'Medium',
      notes:           c.notes || '',
    });
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditingId(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axiosInstance.put(`/api/non-amc/${editingId}`, formData);
        toast.success('Client updated!');
      } else {
        await axiosInstance.post('/api/non-amc', formData);
        toast.success('Client added!');
      }
      closeModal(); fetchClients();
    } catch { toast.error('Failed to save'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this client?')) return;
    try {
      await axiosInstance.delete(`/api/non-amc/${id}`);
      toast.success('Deleted'); fetchClients();
    } catch { toast.error('Failed to delete'); }
  };

  const set = (field, val) => setFormData(f => ({ ...f, [field]: val }));
  const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`;
  const inputCls = 'w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00d0e6] bg-white text-slate-700';

  const total    = clients.length;
  const highPot  = clients.filter(c => c.potential === 'High').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start bg-white p-6 rounded-[20px] shadow-sm">
        <div>
          <h2 className="text-[28px] font-bold text-slate-800 tracking-tight leading-none mb-2">Non-AMC Clients</h2>
          <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
            <Calendar className="w-4 h-4" />
            <span>{currentDateTime.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'})} - {currentDateTime.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit',second:'2-digit'})}</span>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-slate-50 py-2 px-4 rounded-full border border-slate-100">
          <div className="w-10 h-10 rounded-full bg-[#0d4a6f] text-white flex items-center justify-center font-bold text-sm">
            {user?.name ? user.name.substring(0,2).toUpperCase() : 'SA'}
          </div>
          <div className="text-right leading-tight pr-2">
            <div className="text-sm font-bold text-slate-800">Sales Manager</div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Sales Director</div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-[20px] shadow-sm p-6">
          <div className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1">TOTAL CLIENTS</div>
          <div className="text-4xl font-black text-slate-800">{total}</div>
        </div>
        <div className="bg-white rounded-[20px] shadow-sm p-6">
          <div className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1">HIGH POTENTIAL</div>
          <div className="text-4xl font-black text-slate-800">{highPot}</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[20px] shadow-sm p-6 pb-2">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[18px] font-bold text-slate-800">Non-AMC Clients</h3>
          <button onClick={openAdd} className="bg-[#00d0e6] hover:bg-[#00bad0] text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-sm transition-colors flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> Add Client
          </button>
        </div>
        <div className="overflow-x-auto pb-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-100 text-[11px] uppercase tracking-widest text-slate-500 font-black">
                {['Client','Product','Service Freq','Annual Spend','Last Service','Score','Actions'].map(h => <th key={h} className="py-4 px-3">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-[13px] text-slate-600">
              {loading ? (
                <tr><td colSpan="7" className="p-4"><Skeleton height={40} count={5} /></td></tr>
              ) : clients.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-16 text-slate-400">
                  <div className="flex flex-col items-center gap-3">
                    <UserX className="w-10 h-10 text-slate-200" />
                    <span className="font-medium text-sm">No Non-AMC clients yet.</span>
                  </div>
                </td></tr>
              ) : clients.map(c => (
                <tr key={c._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-3 font-semibold text-slate-800">{c.client}</td>
                  <td className="py-4 px-3">{c.product}</td>
                  <td className="py-4 px-3">{c.serviceFreq}</td>
                  <td className="py-4 px-3 font-semibold">{c.annualSpend ? fmt(c.annualSpend) : '-'}</td>
                  <td className="py-4 px-3">{c.lastService ? new Date(c.lastService).toLocaleDateString('en-CA') : '-'}</td>
                  <td className="py-4 px-3">
                    <span className={scoreColor(c.conversionScore)}>{c.conversionScore}</span>
                  </td>
                  <td className="py-4 px-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(c)} className="p-1.5 text-slate-400 bg-slate-50 border border-slate-100 rounded hover:text-indigo-500 hover:bg-indigo-50 transition-colors"><Edit3 className="w-3.5 h-3.5" /></button>
                      <button className="p-1.5 text-slate-400 bg-slate-50 border border-slate-100 rounded hover:text-[#00d0e6] hover:bg-cyan-50 transition-colors"><Video className="w-3.5 h-3.5" /></button>
                      <button className="p-1.5 text-slate-400 bg-slate-50 border border-slate-100 rounded hover:text-emerald-500 hover:bg-emerald-50 transition-colors"><Phone className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(c._id)} className="p-1.5 text-slate-400 bg-slate-50 border border-slate-100 rounded hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-center text-xs text-slate-400 pb-4">© 2026 CALYONIX TECHNOLOGIES. All rights reserved. &nbsp;✉&nbsp;<a href="mailto:support@calyonix.com" className="hover:text-[#00d0e6]">support@calyonix.com</a></p>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between px-7 py-5 rounded-t-2xl" style={{background:'#1a2a4a'}}>
              <div className="flex items-center gap-3">
                <UserX className="w-5 h-5 text-[#00d0e6]" />
                <h3 className="text-white font-bold text-lg">{editingId ? 'Edit Client' : 'Add Non-AMC Client'}</h3>
              </div>
              <button onClick={closeModal} className="text-slate-400 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-7 space-y-5">
              <div>
                <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Client Name <span className="text-[#00d0e6]">*</span></label>
                <input className={inputCls} placeholder="Company / client name" value={formData.client} onChange={e => set('client', e.target.value)} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Product</label>
                  <select className={inputCls} value={formData.product} onChange={e => set('product', e.target.value)}>
                    {PRODUCTS.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Contact Person</label>
                  <input className={inputCls} placeholder="Contact person" value={formData.contactPerson} onChange={e => set('contactPerson', e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Phone</label>
                  <input className={inputCls} placeholder="Phone" value={formData.phone} onChange={e => set('phone', e.target.value)} />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Email</label>
                  <input type="email" className={inputCls} placeholder="Email" value={formData.email} onChange={e => set('email', e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Service Frequency</label>
                  <select className={inputCls} value={formData.serviceFreq} onChange={e => set('serviceFreq', e.target.value)}>
                    {SERVICE_FREQS.map(f => <option key={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Annual Spend (₹)</label>
                  <input type="number" className={inputCls} value={formData.annualSpend} onChange={e => set('annualSpend', e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Last Service Date</label>
                  <input type="date" className={inputCls} value={formData.lastService} onChange={e => set('lastService', e.target.value)} />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Conversion Score (0-100)</label>
                  <input type="number" min="0" max="100" className={inputCls} value={formData.conversionScore} onChange={e => set('conversionScore', e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Potential</label>
                  <select className={inputCls} value={formData.potential} onChange={e => set('potential', e.target.value)}>
                    {POTENTIALS.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Location</label>
                  <input className={inputCls} placeholder="City / location" value={formData.location} onChange={e => set('location', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Notes</label>
                <textarea className={`${inputCls} resize-none`} rows={3} placeholder="Additional notes..." value={formData.notes} onChange={e => set('notes', e.target.value)} />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                <button type="button" onClick={closeModal} className="px-5 py-2.5 rounded-full text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors border border-slate-200">Cancel</button>
                <button type="submit" className="bg-[#00d0e6] hover:bg-[#00bad0] text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-sm transition-colors">Save Client</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NonAMCPage;