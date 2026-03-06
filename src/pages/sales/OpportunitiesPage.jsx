import { useState, useEffect, useContext } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { AuthContext } from '../../context/AuthContext.jsx';
import { Calendar, Edit3, Trash2, Plus, X, ArrowRight, Target } from 'lucide-react';

const PRODUCTS = ['ECOMax-HE', 'ECOMax-CT', 'ECOMax-HT', 'ECOMax-SE', 'Others'];
const STAGES   = ['Qualification', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];

const STAGE_COLORS = {
  Qualification: 'bg-blue-50 text-blue-600 border border-blue-200',
  Proposal:      'bg-yellow-50 text-yellow-700 border border-yellow-200',
  Negotiation:   'bg-orange-50 text-orange-600 border border-orange-200',
  'Closed Won':  'bg-emerald-50 text-emerald-700 border border-emerald-200',
  'Closed Lost': 'bg-red-50 text-red-600 border border-red-200',
};

const defaultForm = {
  opportunityName: '',
  client:          '',
  product:         'ECOMax-HE',
  value:           0,
  stage:           'Qualification',
  probability:     50,
  closeDate:       '',
  notes:           '',
};

const OpportunitiesPage = () => {
  const [items, setItems]                     = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [showModal, setShowModal]             = useState(false);
  const [editingId, setEditingId]             = useState(null);
  const [formData, setFormData]               = useState(defaultForm);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const { user } = useContext(AuthContext);

  const fetchItems = async () => {
    try {
      const { data } = await axiosInstance.get('/api/opportunities');
      setItems(data);
    } catch { /* toast.error('Failed to load opportunities'); */ } // suppressed for Vercel deploy
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
      opportunityName: item.opportunityName || '',
      client:          item.client || '',
      product:         item.product || 'ECOMax-HE',
      value:           item.value || 0,
      stage:           item.stage || 'Qualification',
      probability:     item.probability || 50,
      closeDate:       item.closeDate ? new Date(item.closeDate).toISOString().split('T')[0] : '',
      notes:           item.notes || '',
    });
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditingId(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axiosInstance.put(`/api/opportunities/${editingId}`, formData);
        toast.success('Opportunity updated!');
      } else {
        await axiosInstance.post('/api/opportunities', formData);
        toast.success('Opportunity created!');
      }
      closeModal(); fetchItems();
    } catch { toast.error('Failed to save'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this opportunity?')) return;
    try {
      await axiosInstance.delete(`/api/opportunities/${id}`);
      toast.success('Deleted'); fetchItems();
    } catch { toast.error('Failed to delete'); }
  };

  const set = (field, val) => setFormData(f => ({ ...f, [field]: val }));
  const fmt = (n) => {
    const num = Number(n);
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
    return `₹${num.toLocaleString('en-IN')}`;
  };
  const inputCls = 'w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00d0e6] bg-white text-slate-700';

  const total      = items.length;
  const pipeline   = items.filter(i => !['Closed Won','Closed Lost'].includes(i.stage)).reduce((s, i) => s + Number(i.value || 0), 0);
  const avgDeal    = total > 0 ? items.reduce((s, i) => s + Number(i.value || 0), 0) / total : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start bg-white p-6 rounded-[20px] shadow-sm">
        <div>
          <h2 className="text-[28px] font-bold text-slate-800 tracking-tight leading-none mb-2">Opportunities</h2>
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
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'TOTAL OPPORTUNITIES', value: total },
          { label: 'PIPELINE VALUE',      value: fmt(pipeline) },
          { label: 'AVG DEAL SIZE',       value: fmt(avgDeal) },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-[20px] shadow-sm p-6">
            <div className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1">{k.label}</div>
            <div className="text-4xl font-black text-slate-800">{k.value}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-[20px] shadow-sm p-6 pb-2">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[18px] font-bold text-slate-800">Opportunities Pipeline</h3>
          <button onClick={openAdd} className="bg-[#00d0e6] hover:bg-[#00bad0] text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-sm transition-colors flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> New Opportunity
          </button>
        </div>
        <div className="overflow-x-auto pb-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-100 text-[11px] uppercase tracking-widest text-slate-500 font-black">
                {['Opportunity','Client','Product','Value (₹)','Stage','Probability','Close Date','Actions'].map(h => <th key={h} className="py-4 px-3">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-[13px] text-slate-600">
              {loading ? (
                <tr><td colSpan="8" className="p-4"><Skeleton height={40} count={5} /></td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan="8" className="text-center py-16 text-slate-400">
                  <div className="flex flex-col items-center gap-3">
                    <Target className="w-10 h-10 text-slate-200" />
                    <span className="font-medium text-sm">No opportunities yet.</span>
                  </div>
                </td></tr>
              ) : items.map(item => (
                <tr key={item._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-3 font-semibold text-slate-800">{item.opportunityName}</td>
                  <td className="py-4 px-3">{item.client}</td>
                  <td className="py-4 px-3">{item.product}</td>
                  <td className="py-4 px-3 font-semibold">{item.value ? `₹${Number(item.value).toLocaleString('en-IN')}` : '-'}</td>
                  <td className="py-4 px-3">
                    <span className={`px-3 py-1 rounded-md text-[11px] font-black uppercase tracking-wider ${STAGE_COLORS[item.stage] || 'bg-slate-100 text-slate-500'}`}>{item.stage}</span>
                  </td>
                  <td className="py-4 px-3">{item.probability}%</td>
                  <td className="py-4 px-3">{item.closeDate ? new Date(item.closeDate).toLocaleDateString('en-CA') : '-'}</td>
                  <td className="py-4 px-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(item)} className="p-1.5 text-slate-400 bg-slate-50 border border-slate-100 rounded hover:text-indigo-500 hover:bg-indigo-50 transition-colors"><Edit3 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(item._id)} className="p-1.5 text-slate-400 bg-slate-50 border border-slate-100 rounded hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      <button className="p-1.5 text-slate-400 bg-slate-50 border border-slate-100 rounded hover:text-[#00d0e6] hover:bg-cyan-50 transition-colors"><ArrowRight className="w-3.5 h-3.5" /></button>
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
                <Target className="w-5 h-5 text-[#00d0e6]" />
                <h3 className="text-white font-bold text-lg">{editingId ? 'Edit Opportunity' : 'New Opportunity'}</h3>
              </div>
              <button onClick={closeModal} className="text-slate-400 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-7 space-y-5">
              <div>
                <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Opportunity Name <span className="text-[#00d0e6]">*</span></label>
                <input className={inputCls} placeholder="e.g. HE Project - GMR Goa" value={formData.opportunityName} onChange={e => set('opportunityName', e.target.value)} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Client <span className="text-[#00d0e6]">*</span></label>
                  <input className={inputCls} placeholder="Client / Company" value={formData.client} onChange={e => set('client', e.target.value)} required />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Product</label>
                  <select className={inputCls} value={formData.product} onChange={e => set('product', e.target.value)}>
                    {PRODUCTS.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Value (₹)</label>
                  <input type="number" className={inputCls} value={formData.value} onChange={e => set('value', e.target.value)} />
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
                  <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Probability (%)</label>
                  <input type="number" min="0" max="100" className={inputCls} value={formData.probability} onChange={e => set('probability', e.target.value)} />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Expected Close Date</label>
                  <input type="date" className={inputCls} value={formData.closeDate} onChange={e => set('closeDate', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Notes</label>
                <textarea className={`${inputCls} resize-none`} rows={3} placeholder="Notes..." value={formData.notes} onChange={e => set('notes', e.target.value)} />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                <button type="button" onClick={closeModal} className="px-5 py-2.5 rounded-full text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors border border-slate-200">Cancel</button>
                <button type="submit" className="bg-[#00d0e6] hover:bg-[#00bad0] text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-sm transition-colors">Save Opportunity</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OpportunitiesPage;