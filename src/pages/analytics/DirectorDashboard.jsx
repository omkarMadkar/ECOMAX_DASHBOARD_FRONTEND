import { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import toast from 'react-hot-toast';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { TrendingUp, ShoppingCart, Activity, Users, FileBarChart } from 'lucide-react';

const DirectorDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axiosInstance.get('/api/analytics/overview');
        setData(response.data);
      } catch (error) {
        // toast.error('Failed to aggregate metrics'); // suppressed for Vercel deploy
        console.error('Failed to fetch analytics', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-4">
          <div className="w-1/3"><Skeleton height={30} /></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200"><Skeleton height={80} /></div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200"><Skeleton height={80} /></div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200"><Skeleton height={80} /></div>
          <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200"><Skeleton height={80} /></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 lg:col-span-2"><Skeleton height={300} /></div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200"><Skeleton height={300} /></div>
        </div>
      </div>
    );
  }

  if (!data) return <p className="text-center text-slate-500 py-10">Analytics data currently unavailable.</p>;

  const COLORS = ['#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#0ea5e9']; // Purple, Emerald, Amber, Rose, Sky

  return (
    <div className="space-y-6">
      
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <FileBarChart className="w-6 h-6 text-purple-600" /> Executive Analytics
          </h2>
          <p className="text-sm text-slate-500 mt-1">High-level systemic performance and real-time operational aggregates.</p>
        </div>
      </div>

      {/* KPI Statistic Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Revenue Card */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wide">Gross Revenue</h3>
            <div className="p-2 bg-purple-50 rounded-lg text-purple-600"><TrendingUp className="w-5 h-5" /></div>
          </div>
          <p className="text-3xl font-extrabold text-slate-800 mb-1 tracking-tight">
            ${data.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <div className="w-full h-1 absolute bottom-0 left-0 bg-purple-500"></div>
        </div>

        {/* Orders Card */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wide">Sales Volume</h3>
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><ShoppingCart className="w-5 h-5" /></div>
          </div>
          <p className="text-3xl font-extrabold text-slate-800 mb-1 tracking-tight">{data.totalOrders}</p>
          <div className="w-full h-1 absolute bottom-0 left-0 bg-emerald-500"></div>
        </div>

        {/* Service Tickets Card */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wide">Pending Service</h3>
            <div className="p-2 bg-amber-50 rounded-lg text-amber-600"><Activity className="w-5 h-5" /></div>
          </div>
          <p className="text-3xl font-extrabold text-slate-800 mb-1 tracking-tight">{data.openTickets}</p>
          <div className="w-full h-1 absolute bottom-0 left-0 bg-amber-500"></div>
        </div>

        {/* Users Card */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-slate-500 text-sm font-bold uppercase tracking-wide">Organizational Accounts</h3>
            <div className="p-2 bg-sky-50 rounded-lg text-sky-600"><Users className="w-5 h-5" /></div>
          </div>
          <p className="text-3xl font-extrabold text-slate-800 mb-1 tracking-tight">{data.totalUsers}</p>
          <div className="w-full h-1 absolute bottom-0 left-0 bg-sky-500"></div>
        </div>
      </div>

      {/* Charting Grid Rows */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Revenue Line Chart - spans 2 columns on large screens */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 lg:col-span-2">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Revenue Trajectory</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.monthlyRevenueData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 12}}
                  tickFormatter={(value) => `$${value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value}`}
                />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#8b5cf6" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff' }} 
                  activeDot={{ r: 6 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Service Pie Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
           <h3 className="text-lg font-bold text-slate-800 mb-6">Service Ticket Density</h3>
           <div className="h-72 w-full flex justify-center items-center">
             {data.serviceStatusStats.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie
                     data={data.serviceStatusStats}
                     cx="50%"
                     cy="45%"
                     innerRadius={60}
                     outerRadius={80}
                     paddingAngle={3}
                     dataKey="value"
                   >
                     {data.serviceStatusStats.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                     ))}
                   </Pie>
                   <RechartsTooltip 
                     formatter={(value) => [value, 'Tickets']}
                     contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                   />
                   <Legend verticalAlign="bottom" height={36} iconType="circle" />
                 </PieChart>
               </ResponsiveContainer>
             ) : (
               <p className="text-slate-400 text-sm">No ticket data available to plot.</p>
             )}
           </div>
        </div>

      </div>

    </div>
  );
};

export default DirectorDashboard;
