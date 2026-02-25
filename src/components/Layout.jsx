import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Package, ClipboardList, RefreshCcw, History, Menu, ShieldCheck, Users } from 'lucide-react';




const SidebarItem = ({ to, icon: Icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
        isActive
          ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
          : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
      }`
    }
  >
    <Icon className="w-5 h-5" />
    <span className="font-medium">{label}</span>
  </NavLink>


);

const Layout = () => {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center space-x-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Package className="w-6 h-6 text-white" />
            </div>
            <span className ="text-xl font-bold text-gray-800 tracking-tight" >ITAM</span>
          </div>
        </div>


        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <SidebarItem to="/" icon={LayoutDashboard} label="Dashboard" />
          <SidebarItem to="/assets" icon={Package} label="Assets" />
          <SidebarItem to="/employees" icon={Users} label="Employees" />
          <SidebarItem to="/assignments" icon={ClipboardList} label="Assignments" />
          <SidebarItem to="/licenses" icon={ShieldCheck} label="Licenses" />
          <SidebarItem to="/return-asset" icon={RefreshCcw} label="Return Asset" />
          <SidebarItem to="/history" icon={History} label="Assignment History" />
        </nav>

        {/* <div className="p-4 border-t border-gray-100">
          <div className="flex items-center space-x-3 px-4 py-2">
            <div className="w-8 h-8 rounded-full bg-linear-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
              JD
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700">John Doe</p>
              <p className="text-xs text-gray-500">Admin</p>
            </div>
          </div>
        </div> */}
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gray-50/50">
          <Outlet />
      </main>
    </div>
  );
};

export default Layout;
