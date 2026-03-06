import { useState, useEffect, useContext } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { AuthContext } from '../../context/AuthContext.jsx';
import { Calendar, Edit3, RefreshCw, Plus, X, ShieldCheck } from 'lucide-react';

const PRODUCTS = ['ECOMax-HE', 'ECOMax-CT', 'ECOMax-HT', 'ECOMax-SE', 'Others'];

const STATUS_COLORS = {
  Active:          'bg-emerald-50 text-emerald-700 border border-emerald-200',
  'Expiring Soon': 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  Expired:         'bg-red-50 text-red-600 border border-red-200',
  Cancelled:       'bg-slate-100 text-slate-500',
};

const DEFAULT_TERMS = `1. Preventive maintenance visits: 2 per year
2. Response time: 24 hours
3. Parts warranty: 90 days
4. Exclusions: Consumables, external damage`;

const defaultForm = {
  client:        '',
  contractNo:    '',
  product:       'ECOMax-HE',
  startDate:     new Date().toISOString().split('T')[0],
  endDate:       new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
  contractValue: '',
  terms:         DEFAULT_TERMS,
  status:        'Active',
};

const AMCClientsPage = () => {
  const [contracts, setContracts]             = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [showModal, setShowModal]             = useState(false);
  const [editingId, setEditingId]             = useState(null);
  const [formData, setFormData]               = useState(defaultForm);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const { user } = useContext(AuthContext);

  // auto-generate contract number
  const genContractNo = () => {
    const year = new Date().getFullYear();
    const rand = Math.floor(Math.random() * 900) + 100;
    return `AMC-${year}-${rand}`;
  };

  const fetchContracts = async () => {
    try {
      const { data } = await axiosInstance.get('/api/amc');
      setContracts(data);
    } catch { /* toast.error('Failed to load AMC contracts'); */ } // suppressed for Vercel deploy
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchContracts();
    const t = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const openAdd  = () => {
    setEditingId(null);
    setFormData({ ...defaultForm, contractNo: genContractNo() });
    setShowModal(true);
  };
  const openEdit = (c) => {
    setEditingId(c._id);
    setFormData({
      client:        c.client || '',
      contractNo:    c.contractNo || '',
      product:       c.product || 'ECOMax-HE',
      startDate:     c.startDate ? new Date(c.startDate).toISOString().split('T')[0] : '',
      endDate:       c.endDate ? new Date(c.endDate).toISOString().split('T')[0] : '',
      contractValue: c.contractValue || '',
      terms:         c.terms || DEFAULT_TERMS,
      status:        c.status || 'Active',
    });
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditingId(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axiosInstance.put(`/api/amc/${editingId}`, formData);
        toast.success('Contract updated!');
      } else {
        await axiosInstance.post('/api/amc', formData);
        toast.success('Contract created!');
      }
      closeModal(); fetchContracts();
    } catch { toast.error('Failed to save contract'); }
  };

  const set = (field, val) => setFormData(f => ({ ...f, [field]: val }));
  const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`;
  const inputCls = 'w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00d0e6] bg-white text-slate-700';

  const active       = contracts.filter(c => c.status === 'Active').length;
  const expiringSoon = contracts.filter(c => c.status === 'Expiring Soon').length;
  const expired      = contracts.filter(c => c.status === 'Expired').length;

  // list of existing clients for dropdown
  const clientNames = [...new Set(contracts.map(c => c.client).filter(Boolean))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start bg-white p-6 rounded-[20px] shadow-sm">
        <div>
          <h2 className="text-[28px] font-bold text-slate-800 tracking-tight leading-none mb-2">AMC Clients</h2>
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
        <div className="bg-white rounded-[20px] shadow-sm p-6">
          <div className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1">ACTIVE AMC</div>
          <div className="text-4xl font-black text-slate-800">{active}</div>
        </div>
        <div className="bg-white rounded-[20px] shadow-sm p-6">
          <div className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1">EXPIRING SOON</div>
          <div className="text-4xl font-black text-yellow-600">{expiringSoon}</div>
        </div>
        <div className="bg-white rounded-[20px] shadow-sm p-6">
          <div className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1">EXPIRED</div>
          <div className="text-4xl font-black text-red-500">{expired}</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[20px] shadow-sm p-6 pb-2">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[18px] font-bold text-slate-800">AMC Contracts</h3>
          <button onClick={openAdd} className="bg-[#00d0e6] hover:bg-[#00bad0] text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-sm transition-colors flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> New Contract
          </button>
        </div>
        <div className="overflow-x-auto pb-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-100 text-[11px] uppercase tracking-widest text-slate-500 font-black">
                {['Client','Contract #','Start Date','End Date','Value (₹)','Status','Actions'].map(h => <th key={h} className="py-4 px-3">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-[13px] text-slate-600">
              {loading ? (
                <tr><td colSpan="7" className="p-4"><Skeleton height={40} count={5} /></td></tr>
              ) : contracts.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-16 text-slate-400">
                  <div className="flex flex-col items-center gap-3">
                    <ShieldCheck className="w-10 h-10 text-slate-200" />
                    <span className="font-medium text-sm">No AMC contracts yet.</span>
                  </div>
                </td></tr>
              ) : contracts.map(c => (
                <tr key={c._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-3 font-semibold text-slate-800">{c.client}</td>
                  <td className="py-4 px-3 font-black text-slate-700">{c.contractNo}</td>
                  <td className="py-4 px-3">{c.startDate ? new Date(c.startDate).toLocaleDateString('en-GB') : '-'}</td>
                  <td className="py-4 px-3">{c.endDate ? new Date(c.endDate).toLocaleDateString('en-GB') : '-'}</td>
                  <td className="py-4 px-3 font-semibold">{c.contractValue ? fmt(c.contractValue) : '-'}</td>
                  <td className="py-4 px-3">
                    <span className={`px-3 py-1 rounded-md text-[11px] font-black uppercase tracking-wider ${STATUS_COLORS[c.status] || 'bg-slate-100 text-slate-500'}`}>{c.status}</span>
                  </td>
                  <td className="py-4 px-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(c)} className="p-1.5 text-slate-400 bg-slate-50 border border-slate-100 rounded hover:text-indigo-500 hover:bg-indigo-50 transition-colors"><Edit3 className="w-3.5 h-3.5" /></button>
                      <button className="p-1.5 text-slate-400 bg-slate-50 border border-slate-100 rounded hover:text-[#00d0e6] hover:bg-cyan-50 transition-colors"><RefreshCw className="w-3.5 h-3.5" /></button>
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
                <ShieldCheck className="w-5 h-5 text-[#00d0e6]" />
                <h3 className="text-white font-bold text-lg">AMC Contract</h3>
              </div>
              <button onClick={closeModal} className="text-slate-400 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-7 space-y-5">
              <div>
                <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Client <span className="text-[#00d0e6]">*</span></label>
                <input className={inputCls} list="client-list" placeholder="Select or type client name" value={formData.client} onChange={e => set('client', e.target.value)} required />
                <datalist id="client-list">
                  {clientNames.map(n => <option key={n} value={n} />)}
                </datalist>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Contract No. <span className="text-[#00d0e6]">*</span></label>
                  <input className={inputCls} value={formData.contractNo} onChange={e => set('contractNo', e.target.value)} required />
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
                  <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Start Date <span className="text-[#00d0e6]">*</span></label>
                  <input type="date" className={inputCls} value={formData.startDate} onChange={e => set('startDate', e.target.value)} required />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">End Date <span className="text-[#00d0e6]">*</span></label>
                  <input type="date" className={inputCls} value={formData.endDate} onChange={e => set('endDate', e.target.value)} required />
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Contract Value (₹) <span className="text-[#00d0e6]">*</span></label>
                <input type="number" className={inputCls} placeholder="Contract value" value={formData.contractValue} onChange={e => set('contractValue', e.target.value)} required />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Terms & Conditions</label>
                <textarea className={`${inputCls} resize-none`} rows={5} value={formData.terms} onChange={e => set('terms', e.target.value)} />
              </div>
              {editingId && (
                <div>
                  <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Status</label>
                  <select className={inputCls} value={formData.status} onChange={e => set('status', e.target.value)}>
                    {Object.keys(STATUS_COLORS).map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              )}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                <button type="button" onClick={closeModal} className="px-5 py-2.5 rounded-full text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors border border-slate-200">Cancel</button>
                <button type="submit" className="bg-[#00d0e6] hover:bg-[#00bad0] text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-sm transition-colors">Save Contract</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AMCClientsPage;