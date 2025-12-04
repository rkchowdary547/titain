import React, { useMemo, useState } from 'react';
import { ClientProfile } from '../types';
import { Users, AlertTriangle, Search, Calendar, ChevronRight, Activity } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import CreateClientModal from './CreateClientModal';

interface DashboardProps {
  clients: ClientProfile[];
  onCreateClient: (client: ClientProfile) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ clients, onCreateClient }) => {
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'flagged' | 'expiring'>('all');

  const stats = useMemo(() => {
    const now = new Date();
    return {
      total: clients.length,
      flagged: clients.filter(c => c.status === 'flagged').length,
      expiring: clients.filter(c => {
        const end = new Date(c.subscriptionEndDate);
        const days = Math.ceil((end.getTime() - now.getTime()) / (1000 * 3600 * 24));
        return days <= 10 && days >= 0;
      }).length
    };
  }, [clients]);

  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      const matchesSearch = 
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        client.username.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!matchesSearch) return false;

      if (filter === 'flagged') return client.status === 'flagged';
      if (filter === 'expiring') {
         const days = Math.ceil((new Date(client.subscriptionEndDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
         return days <= 10 && days >= 0;
      }
      return true;
    });
  }, [clients, searchQuery, filter]);

  // Mock data for the sparkline chart
  const activityData = [
    { day: 'Mon', value: 24 },
    { day: 'Tue', value: 45 },
    { day: 'Wed', value: 32 },
    { day: 'Thu', value: 58 },
    { day: 'Fri', value: 65 },
    { day: 'Sat', value: 45 },
    { day: 'Sun', value: 70 },
  ];

  const MetricCard = ({ 
    title, 
    value, 
    subtext, 
    icon: Icon, 
    colorClass, 
    active, 
    onClick 
  }: any) => (
    <button 
      onClick={onClick}
      className={`relative p-6 border rounded-xl text-left transition-all duration-200 w-full ${
        active 
          ? 'bg-titan-800 border-accent-500 ring-1 ring-accent-500 shadow-lg' 
          : 'bg-titan-900 border-titan-800 hover:bg-titan-800'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-sm font-medium ${active ? 'text-white' : 'text-titan-400'}`}>{title}</h3>
        <Icon size={20} className={colorClass} />
      </div>
      <div className="text-3xl font-bold text-white">{value}</div>
      <p className="mt-2 text-xs text-titan-500">{subtext}</p>
    </button>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Coach Dashboard</h1>
          <p className="text-titan-400">Overview of client progress and alerts.</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 font-medium text-white transition-colors bg-accent-600 rounded-lg hover:bg-accent-500 shadow-lg shadow-accent-600/20"
        >
          <Users size={18} />
          Add New Client
        </button>
      </header>

      {/* Interactive Metrics Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricCard 
          title="Total Clients" 
          value={stats.total} 
          subtext="Active subscriptions"
          icon={Users}
          colorClass="text-titan-400"
          active={filter === 'all'}
          onClick={() => setFilter('all')}
        />
        <MetricCard 
          title="Compliance Alerts" 
          value={stats.flagged} 
          subtext="Missed check-ins or weight regressions"
          icon={AlertTriangle}
          colorClass="text-rose-500"
          active={filter === 'flagged'}
          onClick={() => setFilter(filter === 'flagged' ? 'all' : 'flagged')}
        />
        <MetricCard 
          title="Expiring Soon" 
          value={stats.expiring} 
          subtext="Renewals due in < 10 days"
          icon={Calendar}
          colorClass="text-amber-500"
          active={filter === 'expiring'}
          onClick={() => setFilter(filter === 'expiring' ? 'all' : 'expiring')}
        />
      </div>

      {/* Client List */}
      <div className="border rounded-xl bg-titan-900 border-titan-800 overflow-hidden flex flex-col min-h-[500px]">
        <div className="flex flex-col md:flex-row items-center justify-between p-6 border-b border-titan-800 gap-4">
          <div className="flex items-center gap-2">
             <h2 className="text-lg font-semibold text-white">
               {filter === 'all' ? 'All Clients' : filter === 'flagged' ? 'Flagged for Review' : 'Expiring Subscriptions'}
             </h2>
             <span className="bg-titan-800 text-titan-400 px-2 py-0.5 rounded-full text-xs">{filteredClients.length}</span>
          </div>
          
          <div className="relative w-full md:w-64">
            <Search className="absolute top-1/2 left-3 w-4 h-4 -translate-y-1/2 text-titan-500" />
            <input 
              type="text" 
              placeholder="Search by name or username..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-titan-950 border border-titan-700 rounded-lg text-white focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left">
            <thead className="text-xs font-semibold text-titan-500 uppercase bg-titan-950/50">
              <tr>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Activity Trend</th>
                <th className="px-6 py-4">Subscription</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-titan-800">
              {filteredClients.length > 0 ? (
                filteredClients.map(client => (
                  <tr 
                    key={client.id} 
                    className="hover:bg-titan-800/50 transition-colors cursor-pointer group"
                    onClick={() => navigate(`/client/${client.id}`)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-titan-800 overflow-hidden ring-2 ring-titan-800 group-hover:ring-accent-500/50 transition-all">
                           <img src={client.avatarUrl} alt={client.name} className="w-full h-full object-cover"/>
                        </div>
                        <div>
                          <div className="font-medium text-white group-hover:text-accent-500 transition-colors">{client.name}</div>
                          <div className="text-xs text-titan-500">@{client.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        client.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                        client.status === 'flagged' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' :
                        'bg-titan-700 text-titan-400 border-titan-600'
                      }`}>
                        {client.status === 'flagged' && <AlertTriangle size={10} className="mr-1" />}
                        {client.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="w-24 h-10 opacity-70 group-hover:opacity-100 transition-opacity">
                           <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={activityData}>
                                <defs>
                                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                  </linearGradient>
                                </defs>
                                <Area type="monotone" dataKey="value" stroke="#10b981" fillOpacity={1} fill="url(#colorVal)" strokeWidth={2} />
                              </AreaChart>
                           </ResponsiveContainer>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-titan-300">{new Date(client.subscriptionEndDate).toLocaleDateString()}</span>
                        <span className="text-xs text-titan-500">
                           {Math.ceil((new Date(client.subscriptionEndDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24))} days left
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-titan-400 hover:text-accent-500 hover:bg-titan-800 rounded-full transition-all">
                        <ChevronRight size={20} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-titan-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                       <Activity size={32} className="opacity-20" />
                       <p>No clients found matching your filters.</p>
                       {filter !== 'all' && (
                         <button onClick={() => setFilter('all')} className="text-accent-500 hover:underline text-sm">
                           Clear filters
                         </button>
                       )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showCreateModal && (
        <CreateClientModal 
          onClose={() => setShowCreateModal(false)}
          onSave={(client) => {
            onCreateClient(client);
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;