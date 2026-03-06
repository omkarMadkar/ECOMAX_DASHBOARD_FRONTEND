import { useState, useEffect, useContext } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { AuthContext } from '../../context/AuthContext.jsx';
import { Plus, Search, Filter, MessageSquareWarning } from 'lucide-react';

const ServicePage = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { user } = useContext(AuthContext);

  // Form State
  const [formData, setFormData] = useState({
    customerName: '',
    issue: '',
    description: '',
    assignedTo: '',
    priority: 'Medium',
    status: 'Open'
  });

  const fetchTickets = async () => {
    try {
      const { data } = await axiosInstance.get('/api/service');
      setTickets(data);
    } catch (error) {
      // toast.error('Failed to load tickets'); // suppressed for Vercel deploy
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/api/service', formData);
      setShowModal(false);
      setFormData({ customerName: '', issue: '', description: '', assignedTo: '', priority: 'Medium', status: 'Open' });
      toast.success('Ticket created successfully');
      fetchTickets();
    } catch (error) {
      toast.error('Failed to create ticket');
      console.error('Failed to create ticket', error);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axiosInstance.put(`/api/service/${id}`, { status: newStatus });
      toast.success('Ticket status updated');
      fetchTickets();
    } catch (error) {
      toast.error('Failed to update status');
      console.error('Failed to update status', error);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'text-rose-700 bg-rose-100 ring-rose-600/20';
      case 'Medium': return 'text-amber-700 bg-amber-100 ring-amber-600/20';
      case 'Low': return 'text-sky-700 bg-sky-100 ring-sky-600/20';
      default: return 'text-slate-700 bg-slate-100 ring-slate-600/20';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50';
      case 'In Progress': return 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100';
      case 'Closed': return 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100';
      default: return 'bg-white border-slate-300 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <MessageSquareWarning className="w-6 h-6 text-teal-600" /> Service Desk
          </h2>
          <p className="text-sm text-slate-500 mt-1">Manage technical support and service tickets</p>
        </div>
        
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm">
            <Filter className="w-4 h-4" /> Filter
          </button>
          <button 
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-semibold hover:bg-teal-700 transition-colors shadow-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> New Ticket
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Search Bar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by customer, issue, or assignee..." 
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all bg-white"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                <th className="p-4 pl-6 w-1/4">Customer / Issue</th>
                <th className="p-4 w-1/6">Assigned To</th>
                <th className="p-4 w-1/6">Priority</th>
                <th className="p-4 w-1/6">Status</th>
                <th className="p-4 w-1/6">Date Added</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-4"><Skeleton height={40} count={5} /></td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-10 text-slate-500">No service tickets open.</td>
                </tr>
              ) : (
                tickets.map((ticket) => (
                  <tr key={ticket._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-4 pl-6">
                      <p className="font-semibold text-slate-800">{ticket.customerName}</p>
                      <p className="text-slate-500 text-xs mt-0.5 truncate max-w-xs" title={ticket.description}>
                        {ticket.issue}
                      </p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                          {ticket.assignedTo.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-slate-600 font-medium">{ticket.assignedTo}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="p-4">
                       <select
                        value={ticket.status}
                        onChange={(e) => handleStatusChange(ticket._id, e.target.value)}
                        className={`text-xs font-semibold rounded-md border py-1.5 pl-2 pr-6 focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none cursor-pointer transition-colors ${getStatusColor(ticket.status)}`}
                        style={{ backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.5rem center', backgroundSize: '1em' }}
                      >
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Closed">Closed</option>
                      </select>
                    </td>
                    <td className="p-4 text-slate-500 text-xs">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket Entry Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">Create Service Ticket</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Customer Name</label>
                <input required name="customerName" value={formData.customerName} onChange={handleInputChange} type="text" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="e.g. Wayne Enterprises" />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Issue Title</label>
                <input required name="issue" value={formData.issue} onChange={handleInputChange} type="text" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="e.g. Server down after update" />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Detailed Description</label>
                <textarea required name="description" value={formData.description} onChange={handleInputChange} rows="3" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" placeholder="Provide environment details and steps to reproduce..." />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Assign To</label>
                <input required name="assignedTo" value={formData.assignedTo} onChange={handleInputChange} type="text" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="e.g. L2 Support Team" />
              </div>
              
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Priority</label>
                  <select name="priority" value={formData.priority} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer">
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Initial Status</label>
                  <select name="status" value={formData.status} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer">
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              </div>
              
              <div className="pt-4 flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-teal-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-teal-700 transition-colors">Create Ticket</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default ServicePage;
