import { useState, useEffect, useContext } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { AuthContext } from '../../context/AuthContext.jsx';
import { Calendar, Edit3, Trash2, FileText, Send, X, Plus, FileDown, Search, Download } from 'lucide-react';

const PRODUCTS = ['ECOMax-HE', 'ECOMax-CT', 'ECOMax-HT', 'ECOMax-SE', 'Others'];
const GST_RATE = 0.18;

const APPROVAL_COLORS = {
  Draft:            'bg-slate-100 text-slate-500',
  'Pending Approval': 'bg-amber-50 text-amber-600 border border-amber-200',
  Approved:         'bg-emerald-50 text-emerald-600 border border-emerald-200',
  Rejected:         'bg-red-50 text-red-600 border border-red-200',
};

const emptyItem = () => ({ description: '', product: 'ECOMax-HE', qty: 1, unitPrice: 0, discount: 0, total: 0 });

const defaultForm = {
  invoiceDate: new Date().toISOString().split('T')[0],
  customer: '',
  referenceProforma: '',
  paymentTerms: '30 Days',
  dueDate: '',
  items: [emptyItem()],
  approvalStatus: 'Draft',
};

const SalesInvoicesPage = () => {
  const [invoices, setInvoices]         = useState([]);
  const [proformas, setProformas]       = useState([]);
  const [loading, setLoading]           = useState(true);
  const [showModal, setShowModal]       = useState(false);
  const [editingId, setEditingId]       = useState(null);
  const [formData, setFormData]         = useState(defaultForm);
  const [search, setSearch]             = useState('');
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const { user } = useContext(AuthContext);

  const fetchAll = async () => {
    try {
      const [invRes, piRes] = await Promise.all([
        axiosInstance.get('/api/sales-invoices'),
        axiosInstance.get('/api/proformas'),
      ]);
      setInvoices(invRes.data);
      setProformas(piRes.data);
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

  // ── Item helpers ──────────────────────────────────────────
  const calcItemTotal = (item) => {
    const base = Number(item.qty) * Number(item.unitPrice);
    return Math.round(base - base * (Number(item.discount) / 100));
  };

  const handleItemChange = (idx, field, val) => {
    const items = [...formData.items];
    items[idx] = { ...items[idx], [field]: val };
    items[idx].total = calcItemTotal(items[idx]);
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
  const openAddModal  = () => { setEditingId(null); setFormData(defaultForm); setShowModal(true); };
  const openEditModal = (inv) => {
    setEditingId(inv._id);
    setFormData({
      invoiceDate:       inv.invoiceDate ? new Date(inv.invoiceDate).toISOString().split('T')[0] : defaultForm.invoiceDate,
      customer:          inv.customer || '',
      referenceProforma: inv.referenceProforma || '',
      paymentTerms:      inv.paymentTerms || '30 Days',
      dueDate:           inv.dueDate ? new Date(inv.dueDate).toISOString().split('T')[0] : '',
      items:             inv.lineItems?.length ? inv.lineItems : [emptyItem()],
      approvalStatus:    inv.approvalStatus || 'Draft',
    });
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditingId(null); };

  // ── Submit ────────────────────────────────────────────────
  const handleSubmit = async (e, sendForApproval = false) => {
    if (e) e.preventDefault();
    const payload = {
      ...formData,
      lineItems: formData.items,
      subtotal, tax,
      total:    grandTotal,
      approvalStatus: sendForApproval ? 'Pending Approval' : formData.approvalStatus,
    };
    try {
      if (editingId) {
        await axiosInstance.put(`/api/sales-invoices/${editingId}`, payload);
        toast.success(sendForApproval ? 'Sent for approval!' : 'Invoice updated!');
      } else {
        await axiosInstance.post('/api/sales-invoices', payload);
        toast.success(sendForApproval ? 'Invoice created & sent for approval!' : 'Invoice created!');
      }
      closeModal();
      fetchAll();
    } catch {
      toast.error('Failed to save invoice');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this invoice?')) return;
    try {
      await axiosInstance.delete(`/api/sales-invoices/${id}`);
      toast.success('Invoice deleted');
      fetchAll();
    } catch {
      toast.error('Failed to delete');
    }
  };

  // ── Stats ─────────────────────────────────────────────────
  const totalInv   = invoices.length;
  const pendingCnt = invoices.filter(i => i.approvalStatus === 'Pending Approval').length;
  const apprvdCnt  = invoices.filter(i => i.approvalStatus === 'Approved').length;
  const rejCnt     = invoices.filter(i => i.approvalStatus === 'Rejected').length;

  const filtered = invoices.filter(i =>
    i.customer?.toLowerCase().includes(search.toLowerCase()) ||
    i.invoiceNo?.toLowerCase().includes(search.toLowerCase())
  );

  const inputCls = 'w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00d0e6] bg-white text-slate-700';
  const thCls    = 'py-2 px-2 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200';
  const tdCls    = 'py-2 px-1';

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex justify-between items-start bg-white p-6 rounded-[20px] shadow-sm">
        <div>
          <h2 className="text-[28px] font-bold text-slate-800 tracking-tight leading-none mb-2">Sales Invoices</h2>
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
        <div className="bg-white p-6 rounded-[20px] shadow-sm">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">TOTAL INVOICES</p>
          <h3 className="text-4xl font-black text-slate-800">{totalInv}</h3>
        </div>
        <div className="bg-white p-6 rounded-[20px] shadow-sm">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">PENDING APPROVAL</p>
          <h3 className="text-4xl font-black text-amber-500">{pendingCnt}</h3>
        </div>
        <div className="bg-white p-6 rounded-[20px] shadow-sm">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">APPROVED</p>
          <h3 className="text-4xl font-black text-emerald-500">{apprvdCnt}</h3>
        </div>
        <div className="bg-white p-6 rounded-[20px] shadow-sm">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">REJECTED</p>
          <h3 className="text-4xl font-black text-red-500">{rejCnt}</h3>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[20px] shadow-sm p-6 pb-2">
        {/* Action bar */}
        <div className="flex items-center gap-3 mb-5">
          <button onClick={openAddModal} className="bg-[#00d0e6] hover:bg-[#00bad0] text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-sm transition-colors flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> New Invoice
          </button>
          <button className="border border-slate-200 text-slate-600 px-5 py-2.5 rounded-full text-sm font-bold hover:bg-slate-50 transition-colors flex items-center gap-1.5">
            <Download className="w-4 h-4" /> Export
          </button>
        </div>

        <h3 className="text-[18px] font-bold text-slate-800 mb-4">Sales Invoices</h3>

        {/* Search */}
        <div className="relative mb-5">
          <Search className="w-4 h-4 absolute left-4 top-3.5 text-slate-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search invoices..." className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00d0e6] transition-all font-medium text-slate-700" />
        </div>

        <div className="overflow-x-auto pb-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-100 text-[11px] uppercase tracking-widest text-slate-500 font-black">
                {['Invoice No.','Date','Customer','Proforma Ref','Total (₹)','Due Date','Approval Status','Actions'].map(h => (
                  <th key={h} className="py-4 px-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-[13px] text-slate-600">
              {loading ? (
                <tr><td colSpan="8" className="p-4"><Skeleton height={40} count={5} /></td></tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-16 text-slate-400">
                    <div className="flex flex-col items-center gap-3">
                      <FileText className="w-10 h-10 text-slate-200" />
                      <span className="font-medium text-sm">No invoices yet. Click "+ New Invoice" to create one.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map(inv => (
                  <tr key={inv._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-3 font-black text-slate-800">{inv.invoiceNo}</td>
                    <td className="py-4 px-3">{inv.invoiceDate ? new Date(inv.invoiceDate).toLocaleDateString('en-GB') : '-'}</td>
                    <td className="py-4 px-3 font-semibold text-slate-800">{inv.customer}</td>
                    <td className="py-4 px-3">{inv.referenceProforma || '-'}</td>
                    <td className="py-4 px-3 font-semibold">{inv.total ? fmt(inv.total) : '-'}</td>
                    <td className="py-4 px-3">{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('en-GB') : '-'}</td>
                    <td className="py-4 px-3">
                      <span className={`px-3 py-1 rounded-md text-[11px] font-black uppercase tracking-wider ${APPROVAL_COLORS[inv.approvalStatus] || ''}`}>
                        {inv.approvalStatus?.toLowerCase() === 'pending approval' ? 'pending' : inv.approvalStatus}
                      </span>
                    </td>
                    <td className="py-4 px-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEditModal(inv)} className="p-1.5 text-slate-400 bg-slate-50 border border-slate-100 rounded hover:text-indigo-500 hover:bg-indigo-50 transition-colors"><Edit3 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(inv._id)} className="p-1.5 text-slate-400 bg-slate-50 border border-slate-100 rounded hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                        <button className="p-1.5 text-slate-400 bg-slate-50 border border-slate-100 rounded hover:text-[#00d0e6] transition-colors"><FileText className="w-3.5 h-3.5" /></button>
                        <button className="p-1.5 text-slate-400 bg-slate-50 border border-slate-100 rounded hover:text-emerald-500 transition-colors"><Send className="w-3.5 h-3.5" /></button>
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

      {/* ── Sales Invoice Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]">

            {/* Dark navy header */}
            <div className="bg-[#1a2a4a] px-6 py-4 flex justify-between items-center flex-shrink-0">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-white opacity-80" />
                <h3 className="text-white font-bold text-[17px]">Sales Invoice</h3>
              </div>
              <button onClick={closeModal} className="text-white/70 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-6 space-y-5">

              {/* Row 1: Invoice No | Invoice Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1">Invoice No.*</label>
                  <input type="text" className={inputCls} placeholder="Auto-generated" readOnly
                    value={editingId ? (formData.invoiceNo || '') : 'Auto-generated'} />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1">Invoice Date*</label>
                  <input required type="date" className={inputCls} value={formData.invoiceDate}
                    onChange={e => setFormData({...formData, invoiceDate: e.target.value})} />
                </div>
              </div>

              {/* Row 2: Customer | Reference Proforma */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1">Customer*</label>
                  <input required type="text" className={inputCls} placeholder="Select Customer"
                    value={formData.customer} onChange={e => setFormData({...formData, customer: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1">Reference Proforma</label>
                  <select className={inputCls} value={formData.referenceProforma}
                    onChange={e => setFormData({...formData, referenceProforma: e.target.value})}>
                    <option value="">Select Proforma</option>
                    {proformas.map(p => (
                      <option key={p._id} value={p.invoiceNo}>{p.invoiceNo} – {p.customer}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Row 3: Payment Terms | Due Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1">Payment Terms</label>
                  <input type="text" className={inputCls} value={formData.paymentTerms}
                    onChange={e => setFormData({...formData, paymentTerms: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1">Due Date</label>
                  <input type="date" className={inputCls} value={formData.dueDate}
                    onChange={e => setFormData({...formData, dueDate: e.target.value})} />
                </div>
              </div>

              {/* Invoice Items Table */}
              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-2">Invoice Items</label>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className={thCls} style={{width:'26%'}}>Item Description</th>
                        <th className={thCls} style={{width:'16%'}}>Product</th>
                        <th className={thCls} style={{width:'9%'}}>Qty</th>
                        <th className={thCls} style={{width:'17%'}}>Unit Price (₹)</th>
                        <th className={thCls} style={{width:'10%'}}>Discount %</th>
                        <th className={thCls} style={{width:'14%'}}>Total (₹)</th>
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
                            <select className={`${inputCls} text-xs`} value={item.product}
                              onChange={e => handleItemChange(idx, 'product', e.target.value)}>
                              {PRODUCTS.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                          </td>
                          <td className={tdCls}>
                            <input type="number" min="1" className={`${inputCls} text-xs`} value={item.qty}
                              onChange={e => handleItemChange(idx, 'qty', e.target.value)} />
                          </td>
                          <td className={tdCls}>
                            <input type="number" min="0" className={`${inputCls} text-xs`} value={item.unitPrice}
                              onChange={e => handleItemChange(idx, 'unitPrice', e.target.value)} />
                          </td>
                          <td className={tdCls}>
                            <input type="number" min="0" max="100" className={`${inputCls} text-xs`} value={item.discount}
                              onChange={e => handleItemChange(idx, 'discount', e.target.value)} />
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
                  <span>Total:</span>
                  <span>{fmt(grandTotal)}</span>
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 sticky bottom-0 bg-white pb-2 flex-wrap">
                <button type="button" onClick={closeModal}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-600 border border-slate-200 rounded-md hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button type="submit"
                  className="px-5 py-2.5 bg-[#00d0e6] hover:bg-[#00bad0] text-white text-sm font-bold rounded-md shadow-sm transition-colors">
                  Save Invoice
                </button>
                <button type="button" onClick={() => handleSubmit(null, true)}
                  className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-bold rounded-md shadow-sm transition-colors flex items-center gap-2">
                  <Send className="w-4 h-4" /> Send for Approval
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

export default SalesInvoicesPage;
