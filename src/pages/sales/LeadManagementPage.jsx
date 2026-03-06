import { useState, useEffect, useContext } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { AuthContext } from '../../context/AuthContext.jsx';
import { Calendar, Edit3, Trash2, Plus, X, Search, RefreshCw, Users } from 'lucide-react';

const PRODUCTS = ['ECOMax-HE', 'ECOMax-CT', 'ECOMax-HT', 'ECOMax-SE', 'Others'];
const SOURCES  = ['Website', 'Referral', 'Cold Call', 'Exhibition', 'LinkedIn', 'Email Campaign', 'Other'];
const STATUSES = ['Lead', 'Proposal', 'Won', 'Lost', 'Hold-Active'];

const STATUS_COLORS = {
  Lead:          'bg-slate-100 text-slate-600 border border-slate-200',
  Proposal:      'bg-yellow-50 text-yellow-700 border border-yellow-200',
  Won:           'bg-emerald-50 text-emerald-700 border border-emerald-200',
  Lost:          'bg-red-50 text-red-600 border border-red-200',
  'Hold-Active': 'bg-blue-50 text-blue-600 border border-blue-200',
};

const scoreColor = (score) => {
  if (score >= 80) return 'text-emerald-600 font-black';
  if (score >= 60) return 'text-yellow-600 font-black';
  return 'text-red-500 font-black';
};

const defaultForm = {
  enquiryDate:    new Date().toISOString().split('T')[0],
  companyName:    '',
  contactPerson:  '',
  designation:    '',
  email:          '',
  phone:          '',
  whatsapp:       '',
  product:        'ECOMax-HE',
  enquiryValue:   0,
  source:         'Website',
  leadScore:      50,
  location:       '',
  status:         'Lead',
  notes:          '',
};

const LeadManagementPage = () => {
  const [leads, setLeads]                     = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [showModal, setShowModal]             = useState(false);
  const [editingId, setEditingId]             = useState(null);
  const [formData, setFormData]               = useState(defaultForm);
  const [search, setSearch]                   = useState('');
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const { user } = useContext(AuthContext);

  const fetchLeads = async () => {
    try {
      const { data } = await axiosInstance.get('/api/leads');
      setLeads(data);
    } catch { /* toast.error('Failed to load leads'); */ } // suppressed for Vercel deploy
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchLeads();
    const t = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const filtered = leads.filter(l =>
    l.companyName?.toLowerCase().includes(search.toLowerCase()) ||
    l.contactPerson?.toLowerCase().includes(search.toLowerCase()) ||
    l.product?.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd  = () => { setEditingId(null); setFormData(defaultForm); setShowModal(true); };
  const openEdit = (l) => {
    setEditingId(l._id);
    setFormData({
      enquiryDate:   l.enquiryDate ? new Date(l.enquiryDate).toISOString().split('T')[0] : defaultForm.enquiryDate,
      companyName:   l.companyName || '',
      contactPerson: l.contactPerson || '',
      designation:   l.designation || '',
      email:         l.email || '',
      phone:         l.phone || '',
      whatsapp:      l.whatsapp || '',
      product:       l.product || 'ECOMax-HE',
      enquiryValue:  l.enquiryValue || 0,
      source:        l.source || 'Website',
      leadScore:     l.leadScore || 50,
      location:      l.location || '',
      status:        l.status || 'Lead',
      notes:         l.notes || '',
    });
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditingId(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axiosInstance.put(`/api/leads/${editingId}`, formData);
        toast.success('Lead updated!');
      } else {
        await axiosInstance.post('/api/leads', formData);
        toast.success('Lead created!');
      }
      closeModal(); fetchLeads();
    } catch { toast.error('Failed to save lead'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this lead?')) return;
    try {
      await axiosInstance.delete(`/api/leads/${id}`);
      toast.success('Lead deleted'); fetchLeads();
    } catch { toast.error('Failed to delete'); }
  };

  const set = (field, val) => setFormData(f => ({ ...f, [field]: val }));
  const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`;
  const inputCls = 'w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00d0e6] bg-white text-slate-700';

  // KPIs
  const total    = leads.length;
  const hot      = leads.filter(l => l.leadScore >= 80).length;
  const won      = leads.filter(l => l.status === 'Won').length;
  const lost     = leads.filter(l => l.status === 'Lost').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start bg-white p-6 rounded-[20px] shadow-sm">
        <div>
          <h2 className="text-[28px] font-bold text-slate-800 tracking-tight leading-none mb-2">Lead Management</h2>
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
          { label: 'TOTAL LEADS', value: total,  color: 'text-slate-800' },
          { label: 'HOT LEADS',   value: hot,    color: 'text-slate-800' },
          { label: 'WON',         value: won,    color: 'text-slate-800' },
          { label: 'LOST',        value: lost,   color: 'text-slate-800' },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-[20px] shadow-sm p-6">
            <div className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1">{k.label}</div>
            <div className={`text-4xl font-black ${k.color}`}>{k.value}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-[20px] shadow-sm p-6 pb-2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[18px] font-bold text-slate-800">Lead Management</h3>
          <button onClick={openAdd} className="bg-[#00d0e6] hover:bg-[#00bad0] text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-sm transition-colors flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> Add Lead
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00d0e6] bg-slate-50 text-slate-700"
            placeholder="Search leads..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto pb-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-100 text-[11px] uppercase tracking-widest text-slate-500 font-black">
                {['Enquiry Date','Company','Contact','Product','Value (₹)','Score','Status','Actions'].map(h => <th key={h} className="py-4 px-3">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-[13px] text-slate-600">
              {loading ? (
                <tr><td colSpan="8" className="p-4"><Skeleton height={40} count={5} /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="8" className="text-center py-16 text-slate-400">
                  <div className="flex flex-col items-center gap-3">
                    <Users className="w-10 h-10 text-slate-200" />
                    <span className="font-medium text-sm">No leads found.</span>
                  </div>
                </td></tr>
              ) : filtered.map(l => (
                <tr key={l._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-3">{l.enquiryDate ? new Date(l.enquiryDate).toLocaleDateString('en-GB') : '-'}</td>
                  <td className="py-4 px-3 font-semibold text-slate-800">{l.companyName}</td>
                  <td className="py-4 px-3">{l.contactPerson}</td>
                  <td className="py-4 px-3">{l.product}</td>
                  <td className="py-4 px-3 font-semibold">{l.enquiryValue ? fmt(l.enquiryValue) : '₹0'}</td>
                  <td className="py-4 px-3">
                    <span className={scoreColor(l.leadScore)}>{l.leadScore}</span>
                  </td>
                  <td className="py-4 px-3">
                    <span className={`px-3 py-1 rounded-md text-[11px] font-black uppercase tracking-wider ${STATUS_COLORS[l.status] || 'bg-slate-100 text-slate-500'}`}>{l.status}</span>
                  </td>
                  <td className="py-4 px-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(l)} className="p-1.5 text-slate-400 bg-slate-50 border border-slate-100 rounded hover:text-indigo-500 hover:bg-indigo-50 transition-colors"><Edit3 className="w-3.5 h-3.5" /></button>
                      <button className="p-1.5 text-slate-400 bg-slate-50 border border-slate-100 rounded hover:text-[#00d0e6] hover:bg-cyan-50 transition-colors"><RefreshCw className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(l._id)} className="p-1.5 text-slate-400 bg-slate-50 border border-slate-100 rounded hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
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
                <Users className="w-5 h-5 text-[#00d0e6]" />
                <h3 className="text-white font-bold text-lg">{editingId ? 'Edit Lead' : 'Create New Lead'}</h3>
              </div>
              <button onClick={closeModal} className="text-slate-400 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-7 space-y-5">
              <div>
                <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Company Name <span className="text-[#00d0e6]">*</span></label>
                <input className={inputCls} placeholder="Company name" value={formData.companyName} onChange={e => set('companyName', e.target.value)} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Contact Person <span className="text-[#00d0e6]">*</span></label>
                  <input className={inputCls} placeholder="Contact person" value={formData.contactPerson} onChange={e => set('contactPerson', e.target.value)} required />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Designation</label>
                  <input className={inputCls} placeholder="Designation" value={formData.designation} onChange={e => set('designation', e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Email <span className="text-[#00d0e6]">*</span></label>
                  <input type="email" className={inputCls} placeholder="Email address" value={formData.email} onChange={e => set('email', e.target.value)} required />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Phone <span className="text-[#00d0e6]">*</span></label>
                  <input className={inputCls} placeholder="Phone number" value={formData.phone} onChange={e => set('phone', e.target.value)} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">WhatsApp</label>
                  <input className={inputCls} placeholder="WhatsApp number" value={formData.whatsapp} onChange={e => set('whatsapp', e.target.value)} />
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
                  <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Enquiry Value (₹)</label>
                  <input type="number" className={inputCls} value={formData.enquiryValue} onChange={e => set('enquiryValue', e.target.value)} />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Source</label>
                  <select className={inputCls} value={formData.source} onChange={e => set('source', e.target.value)}>
                    {SOURCES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Lead Score</label>
                  <input type="number" min="0" max="100" className={inputCls} value={formData.leadScore} onChange={e => set('leadScore', e.target.value)} />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Location</label>
                  <input className={inputCls} placeholder="City / Location" value={formData.location} onChange={e => set('location', e.target.value)} />
                </div>
              </div>
              {editingId && (
                <div>
                  <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Status</label>
                  <select className={inputCls} value={formData.status} onChange={e => set('status', e.target.value)}>
                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              )}
              <div>
                <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Notes</label>
                <textarea className={`${inputCls} resize-none`} rows={3} placeholder="Additional notes..." value={formData.notes} onChange={e => set('notes', e.target.value)} />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                <button type="button" onClick={closeModal} className="px-5 py-2.5 rounded-full text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors border border-slate-200">Cancel</button>
                <button type="submit" className="bg-[#00d0e6] hover:bg-[#00bad0] text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-sm transition-colors">Save Lead</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadManagementPage;