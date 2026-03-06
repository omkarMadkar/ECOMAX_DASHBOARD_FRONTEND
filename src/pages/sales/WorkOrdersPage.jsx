import { useState, useEffect, useContext } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { AuthContext } from '../../context/AuthContext.jsx';
import { Calendar, Edit3, Trash2, FileText, X, Plus, ClipboardList } from 'lucide-react';

const PRODUCTS = ['ECOMax-HE', 'ECOMax-CT', 'ECOMax-HT', 'ECOMax-SE', 'Others'];
const TECHNICIANS = ['Rahul Kumar', 'Amit Sharma', 'Priya Singh', 'Deepak Verma', 'Suresh Nair'];

const STATUS_COLORS = {
  Draft:       'bg-slate-100 text-slate-500',
  'In Progress': 'bg-blue-50 text-blue-600 border border-blue-200',
  Completed:   'bg-emerald-50 text-emerald-600 border border-emerald-200',
  Cancelled:   'bg-red-50 text-red-600 border border-red-200',
};

const emptyTask = () => ({ description: '', product: 'ECOMax-HE', qty: 1, assignedTo: '' });

const defaultForm = {
  woDate:              new Date().toISOString().split('T')[0],
  customer:            '',
  referenceQuotePO:    '',
  projectName:         '',
  location:            '',
  startDate:           '',
  endDate:             '',
  tasks:               [emptyTask()],
  specialInstructions: '',
  status:              'Draft',
};

const WorkOrdersPage = () => {
  const [orders, setOrders]                   = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [showModal, setShowModal]             = useState(false);
  const [editingId, setEditingId]             = useState(null);
  const [formData, setFormData]               = useState(defaultForm);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const { user } = useContext(AuthContext);

  const fetchOrders = async () => {
    try {
      const { data } = await axiosInstance.get('/api/work-orders');
      setOrders(data);
    } catch {
      // toast.error('Failed to load work orders'); // suppressed for Vercel deploy
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // ── Task helpers ──────────────────────────────────────────
  const handleTaskChange = (idx, field, val) => {
    const tasks = [...formData.tasks];
    tasks[idx] = { ...tasks[idx], [field]: val };
    setFormData({ ...formData, tasks });
  };

  const addTask    = () => setFormData({ ...formData, tasks: [...formData.tasks, emptyTask()] });
  const removeTask = (idx) => {
    if (formData.tasks.length === 1) return;
    setFormData({ ...formData, tasks: formData.tasks.filter((_, i) => i !== idx) });
  };

  // ── Modal helpers ─────────────────────────────────────────
  const openAddModal  = () => { setEditingId(null); setFormData(defaultForm); setShowModal(true); };
  const openEditModal = (o) => {
    setEditingId(o._id);
    setFormData({
      woDate:              o.woDate ? new Date(o.woDate).toISOString().split('T')[0] : defaultForm.woDate,
      customer:            o.customer || '',
      referenceQuotePO:    o.referenceQuotePO || '',
      projectName:         o.projectName || '',
      location:            o.location || '',
      startDate:           o.startDate ? new Date(o.startDate).toISOString().split('T')[0] : '',
      endDate:             o.endDate ? new Date(o.endDate).toISOString().split('T')[0] : '',
      tasks:               o.tasks?.length ? o.tasks : [emptyTask()],
      specialInstructions: o.specialInstructions || '',
      status:              o.status || 'Draft',
    });
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditingId(null); };

  // ── Submit ────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axiosInstance.put(`/api/work-orders/${editingId}`, formData);
        toast.success('Work order updated!');
      } else {
        await axiosInstance.post('/api/work-orders', formData);
        toast.success('Work order created!');
      }
      closeModal();
      fetchOrders();
    } catch {
      toast.error('Failed to save work order');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this work order?')) return;
    try {
      await axiosInstance.delete(`/api/work-orders/${id}`);
      toast.success('Work order deleted');
      fetchOrders();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const inputCls = 'w-full px-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00d0e6] bg-white text-slate-700';

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex justify-between items-start bg-white p-6 rounded-[20px] shadow-sm">
        <div>
          <h2 className="text-[28px] font-bold text-slate-800 tracking-tight leading-none mb-2">Work Orders</h2>
          <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
            <Calendar className="w-4 h-4" />
            <span>
              {currentDateTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              {' - '}
              {currentDateTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
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
          <h3 className="text-[18px] font-bold text-slate-800">Work Orders</h3>
          <button
            onClick={openAddModal}
            className="bg-[#00d0e6] hover:bg-[#00bad0] text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> New Work Order
          </button>
        </div>

        <div className="overflow-x-auto pb-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-100 text-[11px] uppercase tracking-widest text-slate-500 font-black">
                {['WO No.', 'Date', 'Customer', 'Project', 'Status', 'Actions'].map(h => (
                  <th key={h} className="py-4 px-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-[13px] text-slate-600">
              {loading ? (
                <tr><td colSpan="6" className="p-4"><Skeleton height={40} count={5} /></td></tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-16 text-slate-400">
                    <div className="flex flex-col items-center gap-3">
                      <ClipboardList className="w-10 h-10 text-slate-200" />
                      <span className="font-medium text-sm">No work orders yet. Click &quot;+ New Work Order&quot; to create one.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map(o => (
                  <tr key={o._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-3 font-black text-slate-800">{o.woNo}</td>
                    <td className="py-4 px-3">{o.woDate ? new Date(o.woDate).toLocaleDateString('en-GB') : '-'}</td>
                    <td className="py-4 px-3 font-semibold text-slate-800">{o.customer}</td>
                    <td className="py-4 px-3">{o.projectName || '-'}</td>
                    <td className="py-4 px-3">
                      <span className={`px-3 py-1 rounded-md text-[11px] font-black uppercase tracking-wider ${STATUS_COLORS[o.status] || ''}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="py-4 px-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(o)}
                          className="p-1.5 text-slate-400 bg-slate-50 border border-slate-100 rounded hover:text-indigo-500 hover:bg-indigo-50 transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(o._id)}
                          className="p-1.5 text-slate-400 bg-slate-50 border border-slate-100 rounded hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-1.5 text-slate-400 bg-slate-50 border border-slate-100 rounded hover:text-emerald-500 hover:bg-emerald-50 transition-colors">
                          <FileText className="w-3.5 h-3.5" />
                        </button>
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
      <p className="text-center text-xs text-slate-400 pb-4">
        © 2026 CALYONIX TECHNOLOGIES. All rights reserved. &nbsp;✉&nbsp;
        <a href="mailto:support@calyonix.com" className="hover:text-[#00d0e6] transition-colors">support@calyonix.com</a>
      </p>

      {/* ── Modal ──────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">

            {/* Modal Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-7 py-5 rounded-t-2xl" style={{ background: '#1a2a4a' }}>
              <div className="flex items-center gap-3">
                <ClipboardList className="w-5 h-5 text-[#00d0e6]" />
                <h3 className="text-white font-bold text-lg tracking-tight">Work Order</h3>
              </div>
              <button onClick={closeModal} className="text-slate-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-7 space-y-5">

              {/* Row 1: WO No + WO Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">WO No. <span className="text-[#00d0e6]">*</span></label>
                  <input
                    className={`${inputCls} bg-slate-50 text-slate-400`}
                    value={editingId ? formData.woNo || 'WO-YYYY-001' : 'Auto-generated'}
                    readOnly
                    placeholder="Auto-generated"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">WO Date <span className="text-[#00d0e6]">*</span></label>
                  <input
                    type="date"
                    className={inputCls}
                    value={formData.woDate}
                    onChange={e => setFormData({ ...formData, woDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Row 2: Customer + Reference Quote/PO */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Customer <span className="text-[#00d0e6]">*</span></label>
                  <input
                    className={inputCls}
                    placeholder="Enter customer name"
                    value={formData.customer}
                    onChange={e => setFormData({ ...formData, customer: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Reference Quote/PO</label>
                  <input
                    className={inputCls}
                    placeholder="e.g. Q-2024-001 or PO-2024-001"
                    value={formData.referenceQuotePO}
                    onChange={e => setFormData({ ...formData, referenceQuotePO: e.target.value })}
                  />
                </div>
              </div>

              {/* Row 3: Project Name + Location */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Project Name</label>
                  <input
                    className={inputCls}
                    placeholder="Enter project name"
                    value={formData.projectName}
                    onChange={e => setFormData({ ...formData, projectName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Location</label>
                  <input
                    className={inputCls}
                    placeholder="Enter location"
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
              </div>

              {/* Row 4: Start Date + End Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Start Date</label>
                  <input
                    type="date"
                    className={inputCls}
                    value={formData.startDate}
                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">End Date</label>
                  <input
                    type="date"
                    className={inputCls}
                    value={formData.endDate}
                    onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>

              {/* Scope of Work */}
              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-3">Scope of Work</label>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-[13px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="text-left py-2.5 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Task Description</th>
                        <th className="text-left py-2.5 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Product</th>
                        <th className="text-left py-2.5 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider w-16">Qty</th>
                        <th className="text-left py-2.5 px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Assigned To</th>
                        <th className="w-8"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {formData.tasks.map((task, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-2 px-2">
                            <input
                              className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-[#00d0e6]"
                              placeholder="Task description"
                              value={task.description}
                              onChange={e => handleTaskChange(idx, 'description', e.target.value)}
                            />
                          </td>
                          <td className="py-2 px-2">
                            <select
                              className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-[#00d0e6] bg-white"
                              value={task.product}
                              onChange={e => handleTaskChange(idx, 'product', e.target.value)}
                            >
                              {PRODUCTS.map(p => <option key={p}>{p}</option>)}
                            </select>
                          </td>
                          <td className="py-2 px-2">
                            <input
                              type="number"
                              min="1"
                              className="w-16 px-2 py-1.5 text-sm border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-[#00d0e6] text-center"
                              value={task.qty}
                              onChange={e => handleTaskChange(idx, 'qty', e.target.value)}
                            />
                          </td>
                          <td className="py-2 px-2">
                            <select
                              className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-[#00d0e6] bg-white"
                              value={task.assignedTo}
                              onChange={e => handleTaskChange(idx, 'assignedTo', e.target.value)}
                            >
                              <option value="">Select Technician</option>
                              {TECHNICIANS.map(t => <option key={t}>{t}</option>)}
                            </select>
                          </td>
                          <td className="py-2 px-1">
                            <button
                              type="button"
                              onClick={() => removeTask(idx)}
                              className="p-1 text-slate-300 hover:text-red-400 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button
                  type="button"
                  onClick={addTask}
                  className="mt-3 flex items-center gap-1.5 text-sm font-semibold text-[#00d0e6] hover:text-[#00bad0] transition-colors bg-[#00d0e6]/5 hover:bg-[#00d0e6]/10 px-4 py-2 rounded-lg border border-[#00d0e6]/20"
                >
                  <Plus className="w-4 h-4" /> Add Task
                </button>
              </div>

              {/* Special Instructions */}
              <div>
                <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Special Instructions</label>
                <textarea
                  className={`${inputCls} resize-none`}
                  rows={3}
                  placeholder="Any special instructions or notes..."
                  value={formData.specialInstructions}
                  onChange={e => setFormData({ ...formData, specialInstructions: e.target.value })}
                />
              </div>

              {/* Status (edit mode) */}
              {editingId && (
                <div>
                  <label className="block text-[13px] font-semibold text-slate-600 mb-1.5">Status</label>
                  <select
                    className={inputCls}
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                  >
                    {Object.keys(STATUS_COLORS).map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-5 py-2.5 rounded-full text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors border border-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#00d0e6] hover:bg-[#00bad0] text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-sm transition-colors"
                >
                  Save Work Order
                </button>
                <button
                  type="button"
                  className="bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <FileText className="w-4 h-4" /> Download PDF
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkOrdersPage;