import { useState, useEffect, useContext } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { AuthContext } from '../../context/AuthContext.jsx';
import { Calendar, Edit3, Trash2, Plus, X, Layers } from 'lucide-react';

const PRODUCTS = ['ECOMax-HE', 'ECOMax-CT', 'ECOMax-HT', 'ECOMax-SE', 'Others'];
const STAGES   = ['Prospect', 'Qualified', 'Demo Scheduled', 'Proposal Sent', 'Negotiation', 'Won', 'Lost'];
const SOURCES  = ['Website', 'Referral', 'Cold Call', 'Exhibition', 'LinkedIn', 'Email Campaign', 'Other'];

const STATUS_COLORS = {
  Prospect:         'bg-slate-100 text-slate-500',
  Qualified:        'bg-blue-50 text-blue-600 border border-blue-200',
  'Demo Scheduled': 'bg-purple-50 text-purple-600 border border-purple-200',
  'Proposal Sent':  'bg-yellow-50 text-yellow-600 border border-yellow-200',
  Negotiation:      'bg-orange-50 text-orange-600 border border-orange-200',
  Won:              'bg-emerald-50 text-emerald-600 border border-emerald-200',
  Lost:             'bg-red-50 text-red-600 border border-red-200',
};

const defaultForm = {
  date:          new Date().toISOString().split('T')[0],
  companyName:   '',
  contactPerson: '',
  phone:         '',
  email:         '',
  product:       'ECOMax-HE',
  source:        'Website',
  stage:         'Prospect',
  estimatedValue: 0,
  nextFollowUp:  '',
  remarks:       '',
};

const PreSalesMasterPage = () => {
  const [items, setItems]                     = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [showModal, setShowModal]             = useState(false);
  const [editingId, setEditingId]             = useState(null);
  const [formData, setFormData]               = useState(defaultForm);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const { user } = useContext(AuthContext);

  const fetchItems = async () => {
    try {
      const { data } = await axiosInstance.get('/api/presales');
      setItems(data);
    } catch { /* toast.error('Failed to load pre-sales data'); */ } // suppressed for Vercel deploy
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchItems();
    const t = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const openAdd  = () => { setEditingId(null); setFormData(defaultForm); setShowModal(true); };
  const openEdit = (item) => {
    setEditingId(item._id);
    setFormData({
      date:           item.date ? new Date(item.date).toISOString().split('T')[0] : defaultForm.date,
      companyName:    item.companyName || '',
      contactPerson:  item.contactPerson || '',
      phone:          item.phone || '',
      email:          item.email || '',
      product:        item.product || 'ECOMax-HE',
      source:         item.source || 'Website',
      stage:          item.stage || 'Prospect',
      estimatedValue: item.estimatedValue || 0,
      nextFollowUp:   item.nextFollowUp ? new Date(item.nextFollowUp).toISOString().split('T')[0] : '',
      remarks:        item.remarks || '',
    });
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditingId(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axiosInstance.put(`/api/presales/${editingId}`, formData);
        toast.success('Record updated!');
      } else {
        await axiosInstance.post('/api/presales', formData);
        toast.success('Record created!');
      }
      closeModal(); fetchItems();
    } catch { toast.error('Failed to save'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this record?')) return;
    try {
      await axiosInstance.delete(`/api/presales/${id}`);
      toast.success('Deleted'); fetchItems();
    } catch { toast.error('Failed to delete'); }
  };

  const set = (field, val) => setFormData(f => ({ ...f, [field]: val }));
  const inputCls = 'w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00d0e6] bg-white text-slate-700';

  // KPIs
  const total      = items.length;
  const active     = items.filter(i => !['Won','Lost'].includes(i.stage)).length;
  const won        = items.filter(i => i.stage === 'Won').length;
  const totalValue = items.reduce((s, i) => s + Number(i.estimatedValue || 0), 0);
  const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start bg-white p-6 rounded-[20px] shadow-sm">
        <div>
          <h2 className="text-[28px] font-bold text-slate-800 tracking-tight leading-none mb-2">Pre-sales Master</h2>
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
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'TOTAL RECORDS', value: total, color: 'text-slate-800' },
          { label: 'ACTIVE',        value: active, color: 'text-blue-600' },
          { label: 'WON',           value: won,    color: 'text-emerald-600' },
          { label: 'PIPELINE VALUE',value: fmt(totalValue), color: 'text-slate-800' },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-[20px] shadow-sm p-6">
            <div className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1">{k.label}</div>
            <div className={`text-4xl font-black ${k.color}`}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-[20px] shadow-sm p-6 pb-2">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[18px] font-bold text-slate-800">Pre-sales Master</h3>
          <button onClick={openAdd} className="bg-[#00d0e6] hover:bg-[#00bad0] text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-sm transition-colors flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> Add Record
          </button>
        </div>
        <div className="overflow-x-auto pb-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-100 text-[11px] uppercase tracking-widest text-slate-500 font-black">
                {['Date','Company','Contact','Product','Est. Value','Stage','Next Follow-up','Actions'].map(h => <th key={h} className="py-4 px-3">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-[13px] text-slate-600">
              {loading ? (
                <tr><td colSpan="8" className="p-4"><Skeleton height={40} count={5} /></td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan="8" className="text-center py-16 text-slate-400">
                  <div className="flex flex-col items-center gap-3">
                    <Layers className="w-10 h-10 text-slate-200" />
                    <span className="font-medium text-sm">No pre-sales records yet.</span>
                  </div>
                </td></tr>
              ) : items.map(item => (
                <tr key={item._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-3">{item.date ? new Date(item.date).toLocaleDateString('en-GB') : '-'}</td>
                  <td className="py-4 px-3 font-semibold text-slate-800">{item.companyName}</td>
                  <td className="py-4 px-3">{item.contactPerson}</td>
                  <td className="py-4 px-3">{item.product}</td>
                  <td className="py-4 px-3 font-semibold">{item.estimatedValue ? fmt(item.estimatedValue) : '-'}</td>
                  <td className="py-4 px-3">
                    <span className={`px-3 py-1 rounded-md text-[11px] font-black uppercase tracking-wider ${STATUS_COLORS[item.stage] || 'bg-slate-100 text-slate-500'}`}>{item.stage}</span>
                  </td>
                  <td className="py-4 px-3">{item.nextFollowUp ? new Date(item.nextFollowUp).toLocaleDateString('en-GB') : '-'}</td>
                  <td className="py-4 px-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(item)} className="p-1.5 text-slate-400 bg-slate-50 border border-slate-100 rounded hover:text-indigo-500 hover:bg-indigo-50 transition-colors"><Edit3 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(item._id)} className="p-1.5 text-slate-400 bg-slate-50 border border-slate-100 rounded hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
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
                <Layers className="w-5 h-5 text-[#00d0e6]" />
                <h3 className="text-white font-bold text-lg">{editingId ? 'Edit Record' : 'Add Pre-sales Record'}</h3>
              </div>
              <button onClick={closeModal} className="text-slate-400 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-7 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Date</label>
                  <input type="date" className={inputCls} value={formData.date} onChange={e => set('date', e.target.value)} />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Company Name <span className="text-[#00d0e6]">*</span></label>
                  <input className={inputCls} placeholder="Company name" value={formData.companyName} onChange={e => set('companyName', e.target.value)} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Contact Person</label>
                  <input className={inputCls} placeholder="Contact person" value={formData.contactPerson} onChange={e => set('contactPerson', e.target.value)} />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Phone</label>
                  <input className={inputCls} placeholder="Phone number" value={formData.phone} onChange={e => set('phone', e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Email</label>
                  <input type="email" className={inputCls} placeholder="Email address" value={formData.email} onChange={e => set('email', e.target.value)} />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Product Interest</label>
                  <select className={inputCls} value={formData.product} onChange={e => set('product', e.target.value)}>
                    {PRODUCTS.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Source</label>
                  <select className={inputCls} value={formData.source} onChange={e => set('source', e.target.value)}>
                    {SOURCES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Stage</label>
                  <select className={inputCls} value={formData.stage} onChange={e => set('stage', e.target.value)}>
                    {STAGES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Estimated Value (₹)</label>
                  <input type="number" className={inputCls} value={formData.estimatedValue} onChange={e => set('estimatedValue', e.target.value)} />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Next Follow-up</label>
                  <input type="date" className={inputCls} value={formData.nextFollowUp} onChange={e => set('nextFollowUp', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Remarks</label>
                <textarea className={`${inputCls} resize-none`} rows={3} placeholder="Notes or remarks..." value={formData.remarks} onChange={e => set('remarks', e.target.value)} />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                <button type="button" onClick={closeModal} className="px-5 py-2.5 rounded-full text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors border border-slate-200">Cancel</button>
                <button type="submit" className="bg-[#00d0e6] hover:bg-[#00bad0] text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-sm transition-colors">Save Record</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PreSalesMasterPage;