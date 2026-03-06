import { useState, useEffect, useContext } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { AuthContext } from '../../context/AuthContext.jsx';
import { Calendar, Edit3, Trash2, Plus, X, Search, Truck } from 'lucide-react';

const CATEGORIES     = ['Parts Supplier', 'Equipment Supplier', 'Service Partner', 'Transport', 'Contractor'];
const PAYMENT_TERMS  = ['Immediate', '7 Days', '15 Days', '30 Days', '45 Days'];
const STATUSES       = ['Active', 'Inactive', 'Blacklisted'];

const STATUS_COLORS = {
  Active:      'bg-emerald-50 text-emerald-700 border border-emerald-200',
  Inactive:    'bg-slate-100 text-slate-500',
  Blacklisted: 'bg-red-50 text-red-600 border border-red-200',
};

const defaultForm = {
  vendorName:    '',
  contactPerson: '',
  category:      'Parts Supplier',
  email:         '',
  phone:         '',
  whatsapp:      '',
  gstNo:         '',
  address:       '',
  paymentTerms:  '30 Days',
  status:        'Active',
};

const VendorsPage = () => {
  const [vendors, setVendors]                 = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [showModal, setShowModal]             = useState(false);
  const [editingId, setEditingId]             = useState(null);
  const [formData, setFormData]               = useState(defaultForm);
  const [search, setSearch]                   = useState('');
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const { user } = useContext(AuthContext);

  const fetchVendors = async () => {
    try {
      const { data } = await axiosInstance.get('/api/vendors');
      setVendors(data);
    } catch { /* toast.error('Failed to load vendors'); */ } // suppressed for Vercel deploy
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchVendors();
    const t = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const filtered = vendors.filter(v =>
    v.vendorName?.toLowerCase().includes(search.toLowerCase()) ||
    v.category?.toLowerCase().includes(search.toLowerCase()) ||
    v.contactPerson?.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd  = () => { setEditingId(null); setFormData(defaultForm); setShowModal(true); };
  const openEdit = (v) => {
    setEditingId(v._id);
    setFormData({
      vendorName:    v.vendorName || '',
      contactPerson: v.contactPerson || '',
      category:      v.category || 'Parts Supplier',
      email:         v.email || '',
      phone:         v.phone || '',
      whatsapp:      v.whatsapp || '',
      gstNo:         v.gstNo || '',
      address:       v.address || '',
      paymentTerms:  v.paymentTerms || '30 Days',
      status:        v.status || 'Active',
    });
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditingId(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axiosInstance.put(`/api/vendors/${editingId}`, formData);
        toast.success('Vendor updated!');
      } else {
        await axiosInstance.post('/api/vendors', formData);
        toast.success('Vendor added!');
      }
      closeModal(); fetchVendors();
    } catch { toast.error('Failed to save vendor'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this vendor?')) return;
    try {
      await axiosInstance.delete(`/api/vendors/${id}`);
      toast.success('Vendor deleted'); fetchVendors();
    } catch { toast.error('Failed to delete'); }
  };

  const set = (field, val) => setFormData(f => ({ ...f, [field]: val }));
  const inputCls = 'w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00d0e6] bg-white text-slate-700';

  const total        = vendors.length;
  const active       = vendors.filter(v => v.status === 'Active').length;
  const partsSups    = vendors.filter(v => v.category === 'Parts Supplier').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start bg-white p-6 rounded-[20px] shadow-sm">
        <div>
          <h2 className="text-[28px] font-bold text-slate-800 tracking-tight leading-none mb-2">Vendor Management</h2>
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
          { label: 'TOTAL VENDORS',   value: total },
          { label: 'ACTIVE',          value: active },
          { label: 'PARTS SUPPLIERS', value: partsSups },
        ].map(k => (
          <div key={k.label} className="bg-white rounded-[20px] shadow-sm p-6">
            <div className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-1">{k.label}</div>
            <div className="text-4xl font-black text-slate-800">{k.value}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-[20px] shadow-sm p-6 pb-2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[18px] font-bold text-slate-800">Vendor Management</h3>
          <button onClick={openAdd} className="bg-[#00d0e6] hover:bg-[#00bad0] text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-sm transition-colors flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> Add Vendor
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00d0e6] bg-slate-50 text-slate-700"
            placeholder="Search vendors..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto pb-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-100 text-[11px] uppercase tracking-widest text-slate-500 font-black">
                {['Vendor Name','Contact Person','Category','Phone','Email','GST No.','Status','Actions'].map(h => <th key={h} className="py-4 px-3">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-[13px] text-slate-600">
              {loading ? (
                <tr><td colSpan="8" className="p-4"><Skeleton height={40} count={5} /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="8" className="text-center py-16 text-slate-400">
                  <div className="flex flex-col items-center gap-3">
                    <Truck className="w-10 h-10 text-slate-200" />
                    <span className="font-medium text-sm">No vendors found.</span>
                  </div>
                </td></tr>
              ) : filtered.map(v => (
                <tr key={v._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-3 font-bold text-slate-800">{v.vendorName}</td>
                  <td className="py-4 px-3">{v.contactPerson}</td>
                  <td className="py-4 px-3">{v.category}</td>
                  <td className="py-4 px-3">{v.phone}</td>
                  <td className="py-4 px-3 text-slate-500">{v.email}</td>
                  <td className="py-4 px-3 font-mono text-xs text-slate-500">{v.gstNo}</td>
                  <td className="py-4 px-3">
                    <span className={`px-3 py-1 rounded-md text-[11px] font-black uppercase tracking-wider ${STATUS_COLORS[v.status] || 'bg-slate-100 text-slate-500'}`}>{v.status}</span>
                  </td>
                  <td className="py-4 px-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(v)} className="p-1.5 text-slate-400 bg-slate-50 border border-slate-100 rounded hover:text-indigo-500 hover:bg-indigo-50 transition-colors"><Edit3 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(v._id)} className="p-1.5 text-slate-400 bg-slate-50 border border-slate-100 rounded hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
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
                <Truck className="w-5 h-5 text-[#00d0e6]" />
                <h3 className="text-white font-bold text-lg">{editingId ? 'Edit Vendor' : 'Add/Edit Vendor'}</h3>
              </div>
              <button onClick={closeModal} className="text-slate-400 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-7 space-y-5">
              <div>
                <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Vendor Name <span className="text-[#00d0e6]">*</span></label>
                <input className={inputCls} placeholder="Vendor / company name" value={formData.vendorName} onChange={e => set('vendorName', e.target.value)} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Contact Person</label>
                  <input className={inputCls} placeholder="Contact person" value={formData.contactPerson} onChange={e => set('contactPerson', e.target.value)} />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Category</label>
                  <select className={inputCls} value={formData.category} onChange={e => set('category', e.target.value)}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Email</label>
                  <input type="email" className={inputCls} placeholder="Email address" value={formData.email} onChange={e => set('email', e.target.value)} />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Phone</label>
                  <input className={inputCls} placeholder="Phone number" value={formData.phone} onChange={e => set('phone', e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">WhatsApp</label>
                  <input className={inputCls} placeholder="WhatsApp number" value={formData.whatsapp} onChange={e => set('whatsapp', e.target.value)} />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">GST No.</label>
                  <input className={inputCls} placeholder="GST number" value={formData.gstNo} onChange={e => set('gstNo', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Address</label>
                <textarea className={`${inputCls} resize-none`} rows={2} placeholder="Full address" value={formData.address} onChange={e => set('address', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Payment Terms</label>
                  <select className={inputCls} value={formData.paymentTerms} onChange={e => set('paymentTerms', e.target.value)}>
                    {PAYMENT_TERMS.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Status</label>
                  <select className={inputCls} value={formData.status} onChange={e => set('status', e.target.value)}>
                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                <button type="button" onClick={closeModal} className="px-5 py-2.5 rounded-full text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors border border-slate-200">Cancel</button>
                <button type="submit" className="bg-[#00d0e6] hover:bg-[#00bad0] text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-sm transition-colors">Save Vendor</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorsPage;