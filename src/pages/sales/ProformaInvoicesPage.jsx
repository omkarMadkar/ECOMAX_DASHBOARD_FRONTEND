import { useState, useEffect, useContext } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { AuthContext } from '../../context/AuthContext.jsx';
import { Calendar, Edit3, Trash2, FileText, Copy, X, Plus, FileDown } from 'lucide-react';

const STATUS_COLORS = {
  Draft:     'bg-yellow-50 text-yellow-600 border border-yellow-200',
  Sent:      'bg-blue-50 text-blue-600 border border-blue-200',
  Approved:  'bg-emerald-50 text-emerald-600 border border-emerald-200',
  Cancelled: 'bg-red-50 text-red-600 border border-red-200',
};

const GST_RATE = 0.18;
const emptyItem = () => ({ description: '', qty: 1, unitPrice: 0, total: 0 });

const defaultForm = {
  invoiceDate: new Date().toISOString().split('T')[0],
  customer: '',
  referenceQuote: '',
  items: [emptyItem()],
  paymentTerms: '50% Advance, 50% before dispatch',
  status: 'Draft',
};

const ProformaInvoicesPage = () => {
  const [proformas, setProformas]         = useState([]);
  const [quotations, setQuotations]       = useState([]);
  const [loading, setLoading]             = useState(true);
  const [showModal, setShowModal]         = useState(false);
  const [editingId, setEditingId]         = useState(null);
  const [formData, setFormData]           = useState(defaultForm);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const { user } = useContext(AuthContext);

  const fetchAll = async () => {
    try {
      const [pRes, qRes] = await Promise.all([
        axiosInstance.get('/api/proformas'),
        axiosInstance.get('/api/quotations'),
      ]);
      setProformas(pRes.data);
      setQuotations(qRes.data);
    } catch {
      // toast.error('Failed to load data'); // suppressed for Vercel deploy
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    const interval = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // ── Line-item helpers ─────────────────────────────────────
  const calcTotal = (item) => Math.round(Number(item.qty) * Number(item.unitPrice));

  const handleItemChange = (idx, field, value) => {
    const items = [...formData.items];
    items[idx] = { ...items[idx], [field]: value };
    items[idx].total = calcTotal(items[idx]);
    setFormData({ ...formData, items });
  };

  const addItem    = () => setFormData({ ...formData, items: [...formData.items, emptyItem()] });
  const removeItem = (idx) => {
    if (formData.items.length === 1) return;
    setFormData({ ...formData, items: formData.items.filter((_, i) => i !== idx) });
  };

  // ── Totals ────────────────────────────────────────────────
  const subtotal   = formData.items.reduce((s, it) => s + Number(it.total || 0), 0);
  const tax        = Math.round(subtotal * GST_RATE);
  const grandTotal = subtotal + tax;
  const fmt        = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

  // ── Modal helpers ─────────────────────────────────────────
  const openAddModal = () => { setEditingId(null); setFormData(defaultForm); setShowModal(true); };
  const openEditModal = (p) => {
    setEditingId(p._id);
    setFormData({
      invoiceDate:     p.invoiceDate ? new Date(p.invoiceDate).toISOString().split('T')[0] : defaultForm.invoiceDate,
      customer:        p.customer || '',
      referenceQuote:  p.referenceQuote || '',
      items:           p.lineItems?.length ? p.lineItems : [emptyItem()],
      paymentTerms:    p.paymentTerms || defaultForm.paymentTerms,
      status:          p.status || 'Draft',
    });
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditingId(null); };

  // ── Submit ────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...formData, lineItems: formData.items, subtotal, tax, total: grandTotal };
    try {
      if (editingId) {
        await axiosInstance.put(`/api/proformas/${editingId}`, payload);
        toast.success('Proforma updated!');
      } else {
        await axiosInstance.post('/api/proformas', payload);
        toast.success('Proforma created!');
      }
      closeModal();
      fetchAll();
    } catch {
      toast.error('Failed to save proforma');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this proforma invoice?')) return;
    try {
      await axiosInstance.delete(`/api/proformas/${id}`);
      toast.success('Proforma deleted');
      fetchAll();
    } catch {
      toast.error('Failed to delete');
    }
  };

  // ── Stats ─────────────────────────────────────────────────
  const totalP    = proformas.length;
  const draftCnt  = proformas.filter(p => p.status === 'Draft').length;
  const sentCnt   = proformas.filter(p => p.status === 'Sent').length;
  const apprvdCnt = proformas.filter(p => p.status === 'Approved').length;

  const inputCls = 'w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00d0e6] bg-white text-slate-700';
  const thCls    = 'py-2 px-2 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200';
  const tdCls    = 'py-2 px-1';

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex justify-between items-start bg-white p-6 rounded-[20px] shadow-sm">
        <div>
          <h2 className="text-[28px] font-bold text-slate-800 tracking-tight leading-none mb-2">Proforma Invoices</h2>
          <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
            <Calendar className="w-4 h-4" />
            <span>{currentDateTime.toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' })} - {currentDateTime.toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit', second:'2-digit' })}</span>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-slate-50 py-2 px-4 rounded-full border border-slate-100">
          <div className="w-10 h-10 rounded-full bg-[#0d4a6f] text-white flex items-center justify-center font-bold text-sm">
            {user?.name ? user.name.substring(0, 2).toUpperCase() : 'SA'}
          </div>
          <div className="text-right leading-tight pr-2">
            <div className="text-sm font-bold text-slate-800">Sales Manager</div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Sales Director</div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {[['TOTAL PROFORMA', totalP], ['DRAFT', draftCnt], ['SENT', sentCnt], ['APPROVED', apprvdCnt]].map(([label, val]) => (
          <div key={label} className="bg-white p-6 rounded-[20px] shadow-sm">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">{label}</p>
            <h3 className="text-4xl font-black text-slate-800">{val}</h3>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-[20px] shadow-sm p-6 pb-2">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[18px] font-bold text-slate-800">Proforma Invoices</h3>
          <button onClick={openAddModal} className="bg-[#00d0e6] hover:bg-[#00bad0] text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-sm transition-colors flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> New Proforma
          </button>
        </div>
        <div className="overflow-x-auto pb-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-100 text-[11px] uppercase tracking-widest text-slate-500 font-black">
                {['Invoice No.','Date','Customer','Total (₹)','Status','Actions'].map(h => (
                  <th key={h} className="py-4 px-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-[13px] text-slate-600">
              {loading ? (
                <tr><td colSpan="6" className="p-4"><Skeleton height={40} count={5} /></td></tr>
              ) : proformas.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-16 text-slate-400">
                    <div className="flex flex-col items-center gap-3">
                      <FileText className="w-10 h-10 text-slate-200" />
                      <span className="font-medium text-sm">No proforma invoices yet. Click "+ New Proforma" to create one.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                proformas.map(p => (
                  <tr key={p._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-3 font-black text-slate-800">{p.invoiceNo}</td>
                    <td className="py-4 px-3">{p.invoiceDate ? new Date(p.invoiceDate).toLocaleDateString('en-GB') : '-'}</td>
                    <td className="py-4 px-3 font-semibold text-slate-800">{p.customer}</td>
                    <td className="py-4 px-3 font-semibold">{p.total ? fmt(p.total) : '-'}</td>
                    <td className="py-4 px-3">
                      <span className={`px-3 py-1 rounded-md text-[11px] font-black uppercase tracking-wider ${STATUS_COLORS[p.status] || ''}`}>{p.status}</span>
                    </td>
                    <td className="py-4 px-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEditModal(p)} className="p-1.5 text-slate-400 bg-slate-50 border border-slate-100 rounded hover:text-indigo-500 hover:bg-indigo-50 transition-colors"><Edit3 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(p._id)} className="p-1.5 text-slate-400 bg-slate-50 border border-slate-100 rounded hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                        <button className="p-1.5 text-slate-400 bg-slate-50 border border-slate-100 rounded hover:text-[#00d0e6] transition-colors"><FileText className="w-3.5 h-3.5" /></button>
                        <button className="p-1.5 text-slate-400 bg-slate-50 border border-slate-100 rounded hover:text-emerald-500 transition-colors"><Copy className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-slate-400 py-4">© 2026 CALYONIX TECHNOLOGIES. All rights reserved. &nbsp;✉ support@calyonix.com</div>

      {/* ── Proforma Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[92vh]">

            {/* Modal Header - dark navy */}
            <div className="bg-[#1a2a4a] px-6 py-4 flex justify-between items-center flex-shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-white opacity-80" />
                <h3 className="text-white font-bold text-[17px]">Proforma Invoice</h3>
              </div>
              <button onClick={closeModal} className="text-white/70 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-6 space-y-5">

              {/* Row 1: Invoice No | Invoice Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1">Invoice No.*</label>
                  <input type="text" className={inputCls} placeholder="Auto-generated" readOnly
                    value={editingId ? formData.invoiceNo || '' : 'Auto-generated'} />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1">Invoice Date*</label>
                  <input required type="date" className={inputCls} value={formData.invoiceDate}
                    onChange={e => setFormData({...formData, invoiceDate: e.target.value})} />
                </div>
              </div>

              {/* Row 2: Customer | Reference Quote */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1">Customer*</label>
                  <input required type="text" className={inputCls} placeholder="Select Customer" value={formData.customer}
                    onChange={e => setFormData({...formData, customer: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1">Reference Quote</label>
                  <select className={inputCls} value={formData.referenceQuote}
                    onChange={e => setFormData({...formData, referenceQuote: e.target.value})}>
                    <option value="">Select Quote</option>
                    {quotations.map(q => (
                      <option key={q._id} value={q.quoteNo}>{q.quoteNo} – {q.customer}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-2">Items</label>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className={thCls} style={{width:'40%'}}>Item Description</th>
                        <th className={thCls} style={{width:'12%'}}>Qty</th>
                        <th className={thCls} style={{width:'22%'}}>Unit Price (₹)</th>
                        <th className={thCls} style={{width:'18%'}}>Total (₹)</th>
                        <th className={thCls} style={{width:'8%'}}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.items.map((item, idx) => (
                        <tr key={idx} className="border-t border-slate-100">
                          <td className={tdCls}>
                            <input type="text" className={`${inputCls} text-xs`} value={item.description} placeholder="ECOMax-HE Unit"
                              onChange={e => handleItemChange(idx, 'description', e.target.value)} />
                          </td>
                          <td className={tdCls}>
                            <input type="number" min="1" className={`${inputCls} text-xs`} value={item.qty}
                              onChange={e => handleItemChange(idx, 'qty', e.target.value)} />
                          </td>
                          <td className={tdCls}>
                            <input type="number" min="0" className={`${inputCls} text-xs`} value={item.unitPrice}
                              onChange={e => handleItemChange(idx, 'unitPrice', e.target.value)} />
                          </td>
                          <td className={`${tdCls} font-semibold text-slate-800 text-sm pl-2`}>
                            {Number(item.total).toLocaleString('en-IN')}
                          </td>
                          <td className={tdCls}>
                            <button type="button" onClick={() => removeItem(idx)}
                              className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button type="button" onClick={addItem}
                  className="mt-2 px-4 py-2 border border-slate-300 text-slate-600 text-sm rounded-md hover:bg-slate-50 flex items-center gap-1 transition-colors">
                  <Plus className="w-4 h-4" /> Add Item
                </button>
              </div>

              {/* Totals */}
              <div className="border-t border-slate-100 pt-4 space-y-2">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Subtotal:</span>
                  <span className="font-semibold">{fmt(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600">
                  <span>Tax (GST 18%):</span>
                  <span className="font-semibold">{fmt(tax)}</span>
                </div>
                <div className="flex justify-between text-[15px] font-black text-slate-800 pt-1 border-t border-slate-100">
                  <span>Grand Total:</span>
                  <span>{fmt(grandTotal)}</span>
                </div>
              </div>

              {/* Payment Terms */}
              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-1">Payment Terms</label>
                <textarea rows={3} className={`${inputCls} resize-none text-sm`}
                  value={formData.paymentTerms}
                  onChange={e => setFormData({...formData, paymentTerms: e.target.value})} />
              </div>

              {/* Status */}
              <div>
                <label className="block text-[13px] font-semibold text-slate-700 mb-1">Status</label>
                <select className={`${inputCls} w-40`} value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value})}>
                  {['Draft','Sent','Approved','Cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Footer Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 sticky bottom-0 bg-white pb-2">
                <button type="button" onClick={closeModal}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-600 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button type="submit"
                  className="px-5 py-2.5 bg-[#00d0e6] hover:bg-[#00bad0] text-white text-sm font-bold rounded-md shadow-sm transition-colors">
                  {editingId ? 'Update Proforma' : 'Save Proforma'}
                </button>
                <button type="button"
                  className="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-bold rounded-md shadow-sm transition-colors flex items-center gap-2">
                  <FileDown className="w-4 h-4" /> Download PDF
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProformaInvoicesPage;
