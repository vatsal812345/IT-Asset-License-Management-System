import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, ClipboardList, RefreshCcw, History, ShieldCheck, Users, Building2, LogOut, User, ChevronDown, Menu, X } from 'lucide-react';
import { NotificationBell } from './NotificationPanel';
import NotificationPanel from './NotificationPanel';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';

const SidebarItem = ({ to, icon: Icon, label, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center space-x-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${isActive
        ? 'bg-brand-primary text-white shadow-premium dark:shadow-indigo-900/20 shadow-indigo-200/50 scale-[1.02]'
        : 'text-slate-500 dark:text-slate-400 hover:bg-indigo-50 dark:hover:bg-slate-800 hover:text-brand-primary dark:hover:text-brand-primary hover:translate-x-1'
      }`
    }
  >
    <Icon className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110`} />
    <span className="text-sm tracking-wide font-bold">{label}</span>
  </NavLink>
);

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'AD';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-dark-bg overflow-hidden font-sans relative">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 md:hidden transition-opacity duration-300"
          onClick={closeSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 w-72 bg-white dark:bg-dark-card border-r border-slate-100 dark:border-dark-border flex flex-col z-40 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="p-8 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-brand-primary p-2.5 rounded-xl shadow-lg shadow-indigo-100 rotate-3 group-hover:rotate-0 transition-transform duration-500">
              <Package className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black text-slate-900 dark:text-white tracking-tight" >ITAM</span>
          </div>
          <button onClick={closeSidebar} className="md:hidden p-2 text-slate-500 dark:text-slate-400">
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-4 overflow-y-auto ">
          <SidebarItem to="/" icon={LayoutDashboard} label="Dashboard" onClick={closeSidebar} />
          <SidebarItem to="/assets" icon={Package} label="Assets" onClick={closeSidebar} />
          {user?.role !== 'Employee' && <SidebarItem to="/employees" icon={Users} label="Employees" onClick={closeSidebar} />}
          {['Admin', 'Manager'].includes(user?.role) && <SidebarItem to="/assignments" icon={ClipboardList} label="Assignments" onClick={closeSidebar} />}
          <SidebarItem to="/licenses" icon={ShieldCheck} label="Licenses" onClick={closeSidebar} />
          <SidebarItem to="/vendors" icon={Building2} label="Vendors" onClick={closeSidebar} />
          {['Admin', 'Manager'].includes(user?.role) && <SidebarItem to="/return-asset" icon={RefreshCcw} label="Return Asset" onClick={closeSidebar} />}
          <SidebarItem to="/history" icon={History} label="Assignment History" onClick={closeSidebar} />
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Header Bar */}
        <header className="h-20 bg-white/80 dark:bg-dark-card/80 backdrop-blur-md border-b border-slate-100 dark:border-dark-border flex items-center justify-between px-4 md:px-8 shrink-0 z-10">
          <div className="flex items-center space-x-4">
            <button 
              onClick={toggleSidebar}
              className="md:hidden p-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-slate-400 dark:text-slate-500 font-medium text-xs md:text-sm">
              <span className="hidden sm:inline">Welcome back, </span>
              <span className="text-slate-900 dark:text-white font-bold">{user?.name || 'Admin'}</span>
            </h2>
          </div>
          <div className="flex items-center space-x-2 md:space-x-4">
            <div className="relative">
              <NotificationBell />
              <NotificationPanel />
            </div>
            
            <ThemeToggle />

            <div className="h-8 md:h-10 w-px bg-slate-100 dark:bg-dark-border mx-1 md:mx-2"></div>

            {/* User Dropdown */}
            <div className="relative">
              <div
                className="flex items-center space-x-2 md:space-x-3 pl-1 md:pl-2 cursor-pointer group"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-indigo-50 dark:bg-dark-bg border-2 border-transparent group-hover:border-brand-primary overflow-hidden flex items-center justify-center text-brand-primary font-bold text-xs md:text-base transition-all duration-300 shrink-0">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    getInitials(user?.name)
                  )}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">{user?.name || 'Admin'}</p>
                  <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-wider">{user?.role || 'Administrator'}</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </div>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)}></div>
                  <div className="absolute right-0 mt-4 w-56 bg-white dark:bg-dark-card rounded-2xl shadow-premium border border-slate-100 dark:border-dark-border py-2 z-50 animate-fadeInUp">
                    <NavLink
                      to="/profile"
                      className="flex items-center space-x-3 px-4 py-3 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      <span className="text-sm font-semibold">My Profile</span>
                    </NavLink>
                    <div className="h-px bg-slate-50 dark:bg-dark-border my-2 mx-4"></div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
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

        <main className="flex-1 overflow-y-auto bg-gray-50/50 dark:bg-dark-bg/50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
