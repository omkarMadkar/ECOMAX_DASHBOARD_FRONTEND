import { useState, useEffect, useContext } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { AuthContext } from '../../context/AuthContext.jsx';
import { Search, Edit3, Trash2, FileText, Calendar, HelpCircle } from 'lucide-react';

const defaultForm = {
  enquiryDate: new Date().toISOString().split('T')[0],
  customerName: '',
  customerType: 'OEM',
  projectName: '',
  location: '',
  product: 'ECOMax-HE',
  contactPerson: '',
  phone: '',
  email: '',
  stage: 'Lead',
  remarks: '',
};

const CUSTOMER_TYPES = ['OEM', 'End User', 'Contractor', 'Consultant', 'Dealer'];
const PRODUCTS = ['ECOMax-HE', 'ECOMax-CT', 'ECOMax-HT', 'ECOMax-SE', 'Others'];
const STAGES = ['Lead', 'Proposal', 'Won', 'Lost', 'Hold-Active'];

const EnquiriesPage = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const { user } = useContext(AuthContext);

  const [formData, setFormData] = useState(defaultForm);

  const fetchEnquiries = async () => {
    try {
      const { data } = await axiosInstance.get('/api/enquiries');
      setEnquiries(data);
    } catch (error) {
      // toast.error('Failed to load enquiries'); // suppressed for Vercel deploy
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
    const interval = setInterval(() => setCurrentDateTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const openAddModal = () => {
    setEditingId(null);
    setFormData(defaultForm);
    setShowModal(true);
  };

  const openEditModal = (enq) => {
    setEditingId(enq._id);
    setFormData({
      enquiryDate: enq.enquiryDate ? new Date(enq.enquiryDate).toISOString().split('T')[0] : defaultForm.enquiryDate,
      customerName: enq.customerName || '',
      customerType: enq.customerType || 'OEM',
      projectName: enq.projectName || '',
      location: enq.location || '',
      product: enq.product || 'ECOMax-HE',
      contactPerson: enq.contactPerson || '',
      phone: enq.phone || '',
      email: enq.email || '',
      stage: enq.stage || 'Lead',
      remarks: enq.remarks || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axiosInstance.put(`/api/enquiries/${editingId}`, formData);
        toast.success('Enquiry updated successfully');
      } else {
        await axiosInstance.post('/api/enquiries', formData);
        toast.success('Enquiry created successfully');
      }
      setShowModal(false);
      setFormData(defaultForm);
      setEditingId(null);
      fetchEnquiries();
    } catch (error) {
      toast.error(editingId ? 'Failed to update enquiry' : 'Failed to create enquiry');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this enquiry?')) return;
    try {
      await axiosInstance.delete(`/api/enquiries/${id}`);
      toast.success('Enquiry deleted');
      fetchEnquiries();
    } catch {
      toast.error('Failed to delete enquiry');
    }
  };

  const getStageColor = (stage) => {
    switch (stage) {
      case 'Lost': return 'bg-red-50 text-red-500';
      case 'Proposal': return 'bg-orange-50 text-orange-500';
      case 'Hold-Active': return 'bg-slate-100 text-slate-600';
      case 'Won': return 'bg-emerald-50 text-emerald-600';
      case 'Lead': return 'bg-blue-50 text-blue-500';
      default: return 'bg-blue-50 text-blue-500';
    }
  };

  const totalEnquiries = enquiries.length;
  const proposalStageCount = enquiries.filter(e => e.stage === 'Proposal').length;
  const wonCount = enquiries.filter(e => e.stage === 'Won').length;

  const filtered = enquiries.filter(e =>
    e.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.projectName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.product?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const inputClass = "w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#00d0e6] focus:border-transparent bg-white text-slate-700";
  const labelClass = "block text-[13px] font-semibold text-slate-700 mb-1";

  return (
    <div className="space-y-6">

      {/* Top Header */}
      <div className="flex justify-between items-start bg-white p-6 rounded-[20px] shadow-sm">
        <div>
          <h2 className="text-[28px] font-bold text-slate-800 tracking-tight leading-none mb-2">Enquiries</h2>
          <div className="flex items-center gap-2 text-sm text-slate-600 font-medium tracking-wide">
            <Calendar className="w-4 h-4" />
            <span>{currentDateTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} - {currentDateTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
          </div>
        </div>
        <div className="flex items-center gap-4 bg-slate-50 py-2 px-4 rounded-full border border-slate-100">
          <div className="w-10 h-10 rounded-full bg-[#0d4a6f] text-white flex items-center justify-center font-bold text-sm tracking-wider">
            {user?.name ? user.name.substring(0, 2).toUpperCase() : 'SA'}
          </div>
          <div className="text-right leading-tight pr-2">
            <div className="text-sm font-bold text-slate-800">Sales Manager</div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Sales Director</div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[20px] shadow-sm flex flex-col justify-center">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">TOTAL ENQUIRIES</p>
          <h3 className="text-4xl font-black text-slate-800">{totalEnquiries}</h3>
        </div>
        <div className="bg-white p-6 rounded-[20px] shadow-sm flex flex-col justify-center">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">PROPOSAL STAGE</p>
          <h3 className="text-4xl font-black text-slate-800">{proposalStageCount}</h3>
        </div>
        <div className="bg-white p-6 rounded-[20px] shadow-sm flex flex-col justify-center">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">WON</p>
          <h3 className="text-4xl font-black text-slate-800">{wonCount}</h3>
        </div>
      </div>

      {/* Enquiry Management Section */}
      <div className="bg-white rounded-[20px] shadow-sm overflow-hidden p-6 pb-2">
        <h3 className="text-[18px] font-bold text-slate-800 mb-3">Enquiry Management</h3>
        <button
          onClick={openAddModal}
          className="bg-[#00d0e6] hover:bg-[#00bad0] text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-sm transition-colors mb-6 flex items-center gap-1.5"
        >
          <span className="text-lg leading-none mb-0.5">+</span> New Enquiry
        </button>

        <div className="relative mb-6">
          <Search className="w-4 h-4 absolute left-4 top-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search enquiries..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#00d0e6] focus:border-transparent transition-all font-medium text-slate-700"
          />
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto pb-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-100 text-[11px] uppercase tracking-widest text-[#0e1726]/80 font-black">
                <th className="py-4 px-2 text-center w-24">Date</th>
                <th className="py-4 px-4 text-center">Customer</th>
                <th className="py-4 px-4 text-center">Project</th>
                <th className="py-4 px-4 text-center">Product</th>
                <th className="py-4 px-4 text-center">Contact</th>
                <th className="py-4 px-4 text-center">Stage</th>
                <th className="py-4 px-4 text-center w-32">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-[13px] font-bold text-slate-600">
              {loading ? (
                <tr><td colSpan="7" className="p-4"><Skeleton height={40} count={5} /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-10 text-slate-500 font-medium">No enquiries found.</td></tr>
              ) : (
                filtered.map((enq) => (
                  <tr key={enq._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-5 px-2 text-center">{new Date(enq.enquiryDate || enq.createdAt).toLocaleDateString('en-GB')}</td>
                    <td className="py-5 px-4 text-center text-slate-900 font-black">{enq.customerName}</td>
                    <td className="py-5 px-4 text-center">{enq.projectName || '-'}</td>
                    <td className="py-5 px-4 text-center">{enq.product}</td>
                    <td className="py-5 px-4 text-center">{enq.contactPerson || '-'}</td>
                    <td className="py-5 px-4 text-center">
                      <span className={`px-3 py-1 rounded-md text-[11px] font-black uppercase tracking-wider ${getStageColor(enq.stage)}`}>
                        {enq.stage}
                      </span>
                    </td>
                    <td className="py-5 px-4">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openEditModal(enq)} className="p-1.5 text-slate-400 bg-slate-50 border border-slate-100 rounded hover:text-indigo-500 hover:bg-indigo-50 transition-colors">
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(enq._id)} className="p-1.5 text-slate-400 bg-slate-50 border border-slate-100 rounded hover:text-red-500 hover:bg-red-50 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-1.5 text-[#00d0e6] bg-[#00d0e6]/10 border border-[#00d0e6]/20 rounded hover:bg-[#00d0e6]/20 transition-colors">
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

      {/* Add/Edit Enquiry Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
            {/* Modal Header - Dark Navy */}
            <div className="bg-[#1a2a4a] px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-white opacity-80" />
                <h3 className="text-white font-bold text-[17px]">{editingId ? 'Edit Enquiry' : 'Add/Edit Enquiry'}</h3>
              </div>
              <button onClick={() => { setShowModal(false); setEditingId(null); }} className="text-white/70 hover:text-white text-2xl leading-none transition-colors">&times;</button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[75vh]">
              {/* Row 1: Enquiry Date | Customer Name */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className={labelClass}>Enquiry Date*</label>
                  <input
                    required
                    type="date"
                    name="enquiryDate"
                    value={formData.enquiryDate}
                    onChange={handleInputChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Customer Name*</label>
                  <input
                    required
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    className={inputClass}
                    placeholder=""
                  />
                </div>
              </div>

              {/* Row 2: Customer Type | Project Name */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className={labelClass}>Customer Type</label>
                  <select name="customerType" value={formData.customerType} onChange={handleInputChange} className={inputClass}>
                    {CUSTOMER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Project Name</label>
                  <input
                    type="text"
                    name="projectName"
                    value={formData.projectName}
                    onChange={handleInputChange}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Row 3: Location | Product */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className={labelClass}>Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Product</label>
                  <select name="product" value={formData.product} onChange={handleInputChange} className={inputClass}>
                    {PRODUCTS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              {/* Row 4: Contact Person | Mobile No. */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className={labelClass}>Contact Person</label>
                  <input
                    type="text"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleInputChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Mobile No.</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Row 5: Email | Enquiry Stage */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className={labelClass}>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Enquiry Stage</label>
                  <select name="stage" value={formData.stage} onChange={handleInputChange} className={inputClass}>
                    {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Row 6: Remarks (full width) */}
              <div className="mb-6">
                <label className={labelClass}>Remarks</label>
                <textarea
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleInputChange}
                  rows={3}
                  className={`${inputClass} resize-none`}
                />
              </div>

              {/* Footer Actions */}
              <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditingId(null); }}
                  className="px-6 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 border border-slate-200 rounded-md transition-colors bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#00d0e6] hover:bg-[#00bad0] text-white text-sm font-bold rounded-md shadow-sm transition-colors"
                >
                  {editingId ? 'Update Enquiry' : 'Save Enquiry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default EnquiriesPage;
