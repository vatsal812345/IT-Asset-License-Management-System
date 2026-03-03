import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ClipboardList, RefreshCcw, History, ShieldCheck, Users, LogOut, User, ChevronDown } from 'lucide-react';
import { NotificationBell } from './NotificationPanel';
import NotificationPanel from './NotificationPanel';
import { useAuth } from '../context/AuthContext';

const SidebarItem = ({ to, icon: Icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center space-x-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
        isActive
          ? 'bg-brand-primary text-white shadow-premium shadow-indigo-200/50 scale-[1.02]'
          : 'text-slate-500 hover:bg-indigo-50 hover:text-brand-primary hover:translate-x-1'
      }`
    }
  >
    <Icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110`} />
    <span className="text-sm tracking-wide font-extrabold">{label}</span>
  </NavLink>
);

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'AD';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-100 hidden md:flex flex-col z-20">
        <div className="p-8">
          <div className="flex items-center space-x-3">
            <div className="bg-brand-primary p-2.5 rounded-xl shadow-lg shadow-indigo-100 rotate-3 group-hover:rotate-0 transition-transform duration-500">
              <Package className="w-6 h-6 text-white" />
            </div>
            <span className ="text-2xl font-black text-slate-900 tracking-tight" >ITAM</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-4 overflow-y-auto ">
          <SidebarItem to="/" icon={LayoutDashboard} label="Dashboard" />
          <SidebarItem to="/assets" icon={Package} label="Assets" />
          <SidebarItem to="/employees" icon={Users} label="Employees" />
          <SidebarItem to="/assignments" icon={ClipboardList} label="Assignments" />
          <SidebarItem to="/licenses" icon={ShieldCheck} label="Licenses" />
          <SidebarItem to="/return-asset" icon={RefreshCcw} label="Return Asset" />
          <SidebarItem to="/history" icon={History} label="Assignment History" />
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Header Bar */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-8 shrink-0 z-10">
          <div className="flex items-center">
            <h2 className="text-slate-400 font-medium text-sm">Welcome back, <span className="text-slate-900 font-bold">{user?.name || 'Admin'}</span></h2>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <NotificationBell />
              <NotificationPanel />
            </div>
            <div className="h-10 w-px bg-slate-100 mx-2"></div>
            
            {/* User Dropdown */}
            <div className="relative">
              <div 
                className="flex items-center space-x-3 pl-2 cursor-pointer group"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <div className="w-10 h-10 rounded-full bg-indigo-50 border-2 border-transparent group-hover:border-brand-primary overflow-hidden flex items-center justify-center text-brand-primary font-bold transition-all duration-300">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    getInitials(user?.name)
                  )}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-bold text-slate-900 leading-none">{user?.name || 'Admin'}</p>
                  <p className="text-[10px] font-semibold text-slate-400 mt-1 uppercase tracking-wider">{user?.role || 'Administrator'}</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </div>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)}></div>
                  <div className="absolute right-0 mt-4 w-56 bg-white rounded-2xl shadow-premium border border-slate-100 py-2 z-50 animate-fadeInUp">
                    <NavLink 
                      to="/profile" 
                      className="flex items-center space-x-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      <span className="text-sm font-semibold">My Profile</span>
                    </NavLink>
                    <div className="h-px bg-slate-50 my-2 mx-4"></div>
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm font-semibold">Sign Out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-gray-50/50">
            <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
