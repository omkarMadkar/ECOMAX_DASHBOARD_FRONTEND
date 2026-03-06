import { useState, useEffect, useContext } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import toast from 'react-hot-toast';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { AuthContext } from '../../context/AuthContext.jsx';
import { Plus, Search, ShieldCheck, Edit2, Trash2, AlertCircle } from 'lucide-react';

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Delete Confirmation State
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState(null);

  const { user: currentUser } = useContext(AuthContext);

  // Form State
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    email: '',
    password: '',
    role: 'sales'
  });

  const fetchUsers = async () => {
    try {
      const { data } = await axiosInstance.get('/api/users');
      setUsers(data);
    } catch (error) {
      // toast.error('Failed to load user directory'); // suppressed for Vercel deploy
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setFormData({ id: null, name: '', email: '', password: '', role: 'sales' });
    setShowModal(true);
  };

  const openEditModal = (userData) => {
    setIsEditing(true);
    setFormData({ 
      id: userData._id, 
      name: userData.name, 
      email: userData.email, 
      password: '', // require new input for password updates optionally
      role: userData.role 
    });
    setShowModal(true);
  };

  const handleDeleteTrigger = (userId) => {
    setDeleteConfirmDialog(userId);
  };

  const executeDelete = async () => {
    try {
      await axiosInstance.delete(`/api/users/${deleteConfirmDialog}`);
      setDeleteConfirmDialog(null);
      toast.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
      console.error('Failed to delete user:', error.response?.data?.message || error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        // Prepare payload, omitting password if blank to not override with empty string
        const payload = { name: formData.name, email: formData.email, role: formData.role };
        if (formData.password) payload.password = formData.password;
        
        await axiosInstance.put(`/api/users/${formData.id}`, payload);
        toast.success('User profile updated');
      } else {
        await axiosInstance.post('/api/users', { 
           name: formData.name, 
           email: formData.email, 
           password: formData.password, 
           role: formData.role 
        });
        toast.success('User enlisted into system successfully');
      }
      setShowModal(false);
      fetchUsers(); // refresh table
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save user profile');
      console.error('Operation failed', error.response?.data?.message || error.message);
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'director': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'service': return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'sales': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-indigo-600" /> User Management
          </h2>
          <p className="text-sm text-slate-500 mt-1">Configure systemic RBAC roles and internal profiles.</p>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={openCreateModal}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add User
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
              placeholder="Search by name or email address..." 
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all bg-white"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                <th className="p-4 pl-6 w-1/3">Profile Context</th>
                <th className="p-4 w-1/4">System Role</th>
                <th className="p-4 w-1/4">Enrolled Date</th>
                <th className="p-4 w-1/6 text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
               {loading ? (
                <tr>
                  <td colSpan="4" className="p-4"><Skeleton height={40} count={5} /></td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center py-10 text-slate-500">No organizational profiles loaded.</td>
                </tr>
              ) : (
                users.map((dbUser) => (
                  <tr key={dbUser._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-600">
                          {dbUser.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{dbUser.name}</p>
                          <p className="text-slate-500 text-xs mt-0.5 truncate">{dbUser.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-semibold uppercase tracking-wider border ${getRoleBadgeColor(dbUser.role)}`}>
                        {dbUser.role}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500 text-xs">
                      {new Date(dbUser.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="p-4 text-right pr-6">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => openEditModal(dbUser)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                          title="Edit User"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteTrigger(dbUser._id)}
                          className={`p-1.5 rounded transition-colors ${dbUser._id === currentUser?._id ? 'text-slate-300 cursor-not-allowed' : 'text-slate-400 hover:text-red-600 hover:bg-red-50'}`}
                          title="Delete User"
                          disabled={dbUser._id === currentUser?._id}
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* User Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">{isEditing ? 'Modify Profile' : 'System Enrollment'}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Full Name</label>
                <input required name="name" value={formData.name} onChange={handleInputChange} type="text" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Ex. Bruce Wayne" />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Corporate Email</label>
                <input required name="email" value={formData.email} onChange={handleInputChange} type="email" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="bruce@ecomax.com" />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">
                  {isEditing ? 'Password (Leave blank to keep existing)' : 'Initial Password'}
                </label>
                <input required={!isEditing} name="password" value={formData.password} onChange={handleInputChange} type="password" minLength="6" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="••••••••" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Assign Role</label>
                <select name="role" value={formData.role} onChange={handleInputChange} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer">
                  <option value="sales">Sales Associate</option>
                  <option value="service">Service Technician</option>
                  <option value="admin">System Administrator</option>
                  <option value="director">Corporate Director</option>
                </select>
              </div>
              
              <div className="pt-4 flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded-lg shadow-sm hover:bg-indigo-700 transition-colors">
                  {isEditing ? 'Confirm Changes' : 'Execute Enrollment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmDialog && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden p-6 text-center animate-in fade-in zoom-in duration-200">
             <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <AlertCircle className="h-6 w-6 text-red-600" />
             </div>
             <h3 className="text-lg font-bold text-slate-900 mb-2">Eliminate Record</h3>
             <p className="text-sm text-slate-500 mb-6">Are you absolutely certain? This destructive operation cannot be safely unrolled from the system.</p>
             
             <div className="flex justify-center gap-3">
               <button onClick={() => setDeleteConfirmDialog(null)} className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors w-full">Cancel</button>
               <button onClick={executeDelete} className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm w-full">Confirm Delete</button>
             </div>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default AdminPage;
