import React from 'react';
import { UserRole, User } from '../types';
import { LogOut, LayoutDashboard, Users, Calendar, Settings, Activity, Utensils, BarChart2, Sun } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  const isCoach = user.role === UserRole.COACH;
  const navigate = useNavigate();
  const location = useLocation();

  const NavItem = ({ icon: Icon, label, path }: { icon: any, label: string, path: string }) => {
    const active = location.pathname === path;
    return (
      <button
        onClick={() => navigate(path)}
        className={`flex items-center w-full gap-3 px-4 py-3 text-sm font-medium transition-colors rounded-lg ${
          active 
            ? 'bg-titan-800 text-accent-500' 
            : 'text-titan-400 hover:text-titan-50 hover:bg-titan-800'
        }`}
      >
        <Icon size={20} />
        <span>{label}</span>
      </button>
    );
  };

  return (
    <div className="flex min-h-screen bg-titan-950 text-titan-50">
      {/* Sidebar - Desktop */}
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 border-r border-titan-800 bg-titan-900 md:block">
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-2 px-6 h-16 border-b border-titan-800">
            <div className="w-8 h-8 rounded bg-accent-500 flex items-center justify-center font-bold text-titan-900">T</div>
            <span className="text-xl font-bold tracking-tight text-white">TitanFit</span>
          </div>

          <div className="flex-1 px-4 py-6 space-y-1">
            <div className="px-4 mb-2 text-xs font-semibold text-titan-500 uppercase tracking-wider">
              {isCoach ? 'Coach Workspace' : 'Client Portal'}
            </div>

            {isCoach ? (
              <>
                <NavItem icon={LayoutDashboard} label="Dashboard" path="/" />
                <NavItem icon={Users} label="Clients" path="/" />
                <NavItem icon={Calendar} label="Appointments" path="/appointments" />
                <NavItem icon={Settings} label="Settings" path="/settings" />
              </>
            ) : (
              <>
                <NavItem icon={LayoutDashboard} label="Home" path="/" />
                <NavItem icon={Utensils} label="Nutrition" path="/nutrition" />
                <NavItem icon={Activity} label="Workouts" path="/workouts" />
                <NavItem icon={BarChart2} label="Progress" path="/progress" />
                <NavItem icon={Sun} label="Habits" path="/habits" />
              </>
            )}
          </div>

          <div className="p-4 border-t border-titan-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-titan-700 flex items-center justify-center overflow-hidden">
                {user.avatarUrl ? <img src={user.avatarUrl} className="w-full h-full object-cover" /> : user.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                <p className="text-xs text-titan-500 truncate capitalize">{user.role.toLowerCase()}</p>
              </div>
            </div>
            <button 
              onClick={onLogout}
              className="flex items-center justify-center w-full gap-2 px-4 py-2 text-sm font-medium text-titan-300 transition-colors bg-titan-800 rounded-lg hover:bg-titan-700 hover:text-white"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 h-16 bg-titan-900 border-b border-titan-800 md:hidden">
        <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-accent-500 flex items-center justify-center font-bold text-titan-900">T</div>
            <span className="text-lg font-bold">TitanFit</span>
        </div>
        <button onClick={onLogout} className="p-2 text-titan-400">
          <LogOut size={20} />
        </button>
      </div>

      {/* Main Content */}
      <main className="flex-1 md:pl-64 pt-16 md:pt-0">
        <div className="container mx-auto p-4 md:p-8 max-w-7xl">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around h-16 bg-titan-900 border-t border-titan-800 md:hidden">
        {isCoach ? (
             <>
             <button onClick={() => navigate('/')}><LayoutDashboard className="text-accent-500" size={24} /></button>
             <button onClick={() => navigate('/')}><Users className="text-titan-500" size={24} /></button>
             <button onClick={() => navigate('/settings')}><Settings className="text-titan-500" size={24} /></button>
           </>
        ) : (
          <>
            <button onClick={() => navigate('/')}><LayoutDashboard className="text-accent-500" size={24} /></button>
            <button onClick={() => navigate('/nutrition')}><Utensils className="text-titan-500" size={24} /></button>
            <button onClick={() => navigate('/workouts')}><Activity className="text-titan-500" size={24} /></button>
            <button onClick={() => navigate('/habits')}><Sun className="text-titan-500" size={24} /></button>
          </>
        )}
      </div>
    </div>
  );
};

export default Layout;