import { useState, useEffect, useContext } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { AuthContext } from '../../context/AuthContext.jsx';
import { Plus, Search, FileDown } from 'lucide-react';

const SalesPage = () => {
  const [salesOrders, setSalesOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const { user } = useContext(AuthContext);

  // Form State
  const [formData, setFormData] = useState({
    customerName: '',
    product: '',
    quantity: 1,
    price: 0,
    status: 'Pending'
  });

  const fetchSales = async () => {
    try {
      const { data } = await axiosInstance.get('/api/sales');
      setSalesOrders(data);
    } catch (error) {
      // toast.error('Failed to load sales data'); // suppressed for Vercel deploy
      console.error('Error fetching sales:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post('/api/sales', formData);
      setShowModal(false);
      setFormData({ customerName: '', product: '', quantity: 1, price: 0, status: 'Pending' });
      toast.success('Sales order created successfully');
      fetchSales(); // refresh table
    } catch (error) {
      toast.error('Failed to create sales order');
      console.error('Failed to create sales order');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-100 text-emerald-800 border bg-emerald-100/50 border-emerald-200';
      case 'Processing': return 'bg-blue-100 text-blue-800 border bg-blue-100/50 border-blue-200';
      case 'Cancelled': return 'bg-red-100 text-red-800 border bg-red-100/50 border-red-200';
      default: return 'bg-amber-100 text-amber-800 border bg-amber-100/50 border-amber-200'; // Pending
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Area */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Sales Pipeline</h2>
          <p className="text-sm text-slate-500 mt-1">Manage orders and track revenue</p>
        </div>
        
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm">
            <FileDown className="w-4 h-4" /> Export
          </button>
          <button 
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-semibold hover:bg-teal-700 transition-colors shadow-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> New Order
          </button>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Table Filters / Search */}
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
          <div className="relative w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search orders..." 
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all bg-white"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                <th className="p-4 pl-6">Client</th>
                <th className="p-4">Product</th>
                <th className="p-4">Qty</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-4"><Skeleton height={40} count={5} /></td>
                </tr>
              ) : salesOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-slate-500">No sales orders found.</td>
                </tr>
              ) : (
                salesOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-4 pl-6 font-medium text-slate-800">{order.customerName}</td>
                    <td className="p-4 text-slate-600">{order.product}</td>
                    <td className="p-4 text-slate-600">{order.quantity}</td>
                    <td className="p-4 font-semibold text-slate-700">${order.totalAmount.toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500 text-xs">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Entry Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">Create Sales Order</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Customer Name</label>
                <input required name="customerName" value={formData.customerName} onChange={handleInputChange} type="text" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="e.g. Acme Corp" />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Product / License</label>
                <input required name="product" value={formData.product} onChange={handleInputChange} type="text" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="e.g. Enterprise License" />
              </div>
              
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Quantity</label>
                  <input required name="quantity" value={formData.quantity} onChange={handleInputChange} type="number" min="1" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Unit Price ($)</label>
                  <input required name="price" value={formData.price} onChange={handleInputChange} type="number" min="0" step="0.01" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
              </div>
              
              <div className="pt-4 flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-teal-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-teal-700 transition-colors">Save Order</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default SalesPage;
