import { useState, useEffect, useContext } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { AuthContext } from '../../context/AuthContext.jsx';
import { Calendar, Edit3, Trash2, FileText, X, Plus, FileDown, ShoppingCart } from 'lucide-react';

const PRODUCTS = ['ECOMax-HE', 'ECOMax-CT', 'ECOMax-HT', 'ECOMax-SE', 'Others'];

const STATUS_COLORS = {
  Draft:     'bg-slate-100 text-slate-500',
  Ordered:   'bg-blue-50 text-blue-600 border border-blue-200',
  Received:  'bg-emerald-50 text-emerald-600 border border-emerald-200',
  Cancelled: 'bg-red-50 text-red-600 border border-red-200',
};

const DEFAULT_TERMS = `1. Delivery schedule as agreed
2. Payment within 30 days of invoice
3. Warranty as per standard terms`;

const emptyItem = () => ({ description: '', product: 'ECOMax-HE', qty: 1, unitPrice: 0, total: 0 });

const defaultForm = {
  poDate:          new Date().toISOString().split('T')[0],
  vendor:          '',
  deliveryDate:    '',
  paymentTerms:    '30 Days',
  shippingAddress: '',
  items:           [emptyItem()],
  terms:           DEFAULT_TERMS,
  status:          'Draft',
};

const PurchaseOrdersPage = () => {
  const [orders, setOrders]               = useState([]);
  const [loading, setLoading]             = useState(true);
  const [showModal, setShowModal]         = useState(false);
  const [editingId, setEditingId]         = useState(null);
  const [formData, setFormData]           = useState(defaultForm);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const { user } = useContext(AuthContext);

  const fetchOrders = async () => {
    try {
      const { data } = await axiosInstance.get('/api/purchase-orders');
      setOrders(data);
    } catch {
      // toast.error('Failed to load purchase orders'); // suppressed for Vercel deploy
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // ── Item helpers ──────────────────────────────────────────
  const calcTotal = (item) => Math.round(Number(item.qty) * Number(item.unitPrice));

  const handleItemChange = (idx, field, val) => {
    const items = [...formData.items];
    items[idx] = { ...items[idx], [field]: val };
    items[idx].total = calcTotal(items[idx]);
    setFormData({ ...formData, items });
  };

  const addItem    = () => setFormData({ ...formData, items: [...formData.items, emptyItem()] });
  const removeItem = (idx) => {
    if (formData.items.length === 1) return;
    setFormData({ ...formData, items: formData.items.filter((_, i) => i !== idx) });
  };

  // ── Totals ────────────────────────────────────────────────
  const poTotal = formData.items.reduce((s, it) => s + Number(it.total || 0), 0);
  const fmt     = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

  // ── Modal helpers ─────────────────────────────────────────
  const openAddModal  = () => { setEditingId(null); setFormData(defaultForm); setShowModal(true); };
  const openEditModal = (o) => {
    setEditingId(o._id);
    setFormData({
      poDate:          o.poDate ? new Date(o.poDate).toISOString().split('T')[0] : defaultForm.poDate,
      vendor:          o.vendor || '',
      deliveryDate:    o.deliveryDate ? new Date(o.deliveryDate).toISOString().split('T')[0] : '',
      paymentTerms:    o.paymentTerms || '30 Days',
      shippingAddress: o.shippingAddress || '',
      items:           o.lineItems?.length ? o.lineItems : [emptyItem()],
      terms:           o.terms || DEFAULT_TERMS,
      status:          o.status || 'Draft',
    });
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditingId(null); };

  // ── Submit ────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...formData, lineItems: formData.items, total: poTotal };
    try {
      if (editingId) {
        await axiosInstance.put(`/api/purchase-orders/${editingId}`, payload);
        toast.success('Purchase order updated!');
      } else {
        await axiosInstance.post('/api/purchase-orders', payload);
        toast.success('Purchase order created!');
      }
      closeModal();
      fetchOrders();
    } catch {
      toast.error('Failed to save purchase order');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this purchase order?')) return;
    try {
      await axiosInstance.delete(`/api/purchase-orders/${id}`);
      toast.success('Purchase order deleted');
      fetchOrders();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const inputCls = 'w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00d0e6] bg-white text-slate-700';
  const thCls    = 'py-2 px-2 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200';
  const tdCls    = 'py-2 px-1';

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex justify-between items-start bg-white p-6 rounded-[20px] shadow-sm">
        <div>
          <h2 className="text-[28px] font-bold text-slate-800 tracking-tight leading-none mb-2">Purchase Orders</h2>
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

      {/* Table Section */}
      <div className="bg-white rounded-[20px] shadow-sm p-6 pb-2">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[18px] font-bold text-slate-800">Purchase Orders</h3>
          <button onClick={openAddModal} className="bg-[#00d0e6] hover:bg-[#00bad0] text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-sm transition-colors flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> New PO
          </button>
        </div>

        <div className="overflow-x-auto pb-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-100 text-[11px] uppercase tracking-widest text-slate-500 font-black">
                {['PO No.','Date','Vendor','Total (₹)','Delivery Date','Status','Actions'].map(h => (
                  <th key={h} className="py-4 px-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-[13px] text-slate-600">
              {loading ? (
                <tr><td colSpan="7" className="p-4"><Skeleton height={40} count={5} /></td></tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-16 text-slate-400">
                    <div className="flex flex-col items-center gap-3">
                      <ShoppingCart className="w-10 h-10 text-slate-200" />
                      <span className="font-medium text-sm">No purchase orders yet. Click "+ New PO" to create one.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map(o => (
                  <tr key={o._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-3 font-black text-slate-800">{o.poNo}</td>
                    <td className="py-4 px-3">{o.poDate ? new Date(o.poDate).toLocaleDateString('en-GB') : '-'}</td>
                    <td className="py-4 px-3 font-semibold text-slate-800">{o.vendor}</td>
                    <td className="py-4 px-3 font-semibold">{o.total ? fmt(o.total) : '-'}</td>
                    <td className="py-4 px-3">{o.deliveryDate ? new Date(o.deliveryDate).toLocaleDateString('en-GB') : '-'}</td>
                    <td className="py-4 px-3">
                      <span className={`px-3 py-1 rounded-md text-[11px] font-black uppercase tracking-wider ${STATUS_COLORS[o.status] || ''}`}>{o.status}</span>
                    </td>
                    <td className="py-4 px-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEditModal(o)} className="p-1.5 text-slate-400 bg-slate-50 border border-slate-100 rounded hover:text-indigo-500 hover:bg-indigo-50 transition-colors"><Edit3 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleDelete(o._id)} className="p-1.5 text-slate-400 bg-slate-50 border border-slate-100 rounded hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                        <button className="p-1.5 text-slate-400 bg-slate-50 border border-slate-100 rounded hover:text-[#00d0e6] transition-colors"><FileText className="w-3.5 h-3.5" /></button>
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

      {/* ── Purchase Order Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]">

            {/* Dark navy header */}
            <div className="bg-[#1a2a4a] px-6 py-4 flex justify-between items-center flex-shrink-0">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-white opacity-80" />
                <h3 className="text-white font-bold text-[17px]">Purchase Order</h3>
              </div>
              <button onClick={closeModal} className="text-white/70 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-6 space-y-5">

              {/* Row 1: PO No | PO Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1">PO No.*</label>
                  <input type="text" className={inputCls} placeholder="Auto-generated" readOnly
                    value={editingId ? (formData.poNo || '') : 'Auto-generated'} />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1">PO Date*</label>
                  <input required type="date" className={inputCls} value={formData.poDate}
                    onChange={e => setFormData({...formData, poDate: e.target.value})} />
                </div>
              </div>

              {/* Row 2: Vendor | Delivery Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1">Vendor*</label>
                  <input required type="text" className={inputCls} placeholder="Select Vendor"
                    value={formData.vendor} onChange={e => setFormData({...formData, vendor: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1">Delivery Date*</label>
                  <input required type="date" className={inputCls} value={formData.deliveryDate}
                    onChange={e => setFormData({...formData, deliveryDate: e.target.value})} />
                </div>
              </div>

              {/* Row 3: Payment Terms | Shipping Address */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1">Payment Terms</label>
                  <input type="text" className={inputCls} value={formData.paymentTerms}
                    onChange={e => setFormData({...formData, paymentTerms: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1">Shipping Address</label>
                  <input type="text" className={inputCls} value={formData.shippingAddress}
                    onChange={e => setFormData({...formData, shippingAddress: e.target.value})} />
                </div>
              </div>

              {/* Items Table */}
              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-2">Items</label>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className={thCls} style={{width:'32%'}}>Item Description</th>
                        <th className={thCls} style={{width:'18%'}}>Product</th>
                        <th className={thCls} style={{width:'12%'}}>Qty</th>
                        <th className={thCls} style={{width:'20%'}}>Unit Price (₹)</th>
                        <th className={thCls} style={{width:'12%'}}>Total (₹)</th>
                        <th className={thCls} style={{width:'6%'}}></th>
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

              {/* Total PO Value */}
              <div className="border-t border-slate-100 pt-4">
                <div className="flex justify-between text-[15px] font-black text-slate-800">
                  <span>Total PO Value:</span>
                  <span>{fmt(poTotal)}</span>
                </div>
              </div>

              {/* Terms & Conditions */}
              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-1">Terms &amp; Conditions</label>
                <textarea rows={4} className={`${inputCls} resize-none text-xs leading-relaxed`}
                  value={formData.terms} onChange={e => setFormData({...formData, terms: e.target.value})} />
              </div>

              {/* Status */}
              <div>
                <label className="block text-[13px] font-semibold text-slate-700 mb-1">Status</label>
                <select className={`${inputCls} w-40`} value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value})}>
                  {['Draft','Ordered','Received','Cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
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
                  {editingId ? 'Update PO' : 'Save PO'}
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

export default PurchaseOrdersPage;
