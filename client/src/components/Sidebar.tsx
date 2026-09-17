import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  Users,
  Building2,
  TrendingUp,
  Award,
  Briefcase,
  Megaphone,
  BarChart3,
  Bell,
  Settings,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navigationItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard, badge: null },
  { name: 'My Tasks', path: '/tasks', icon: CheckSquare, badge: 'Priority' },
  { name: 'Leads', path: '/leads', icon: Users, badge: null },
  { name: 'Companies', path: '/companies', icon: Building2, badge: null },
  { name: 'Sales Funnel', path: '/sales-funnel', icon: TrendingUp, badge: null },
  { name: 'Opportunities', path: '/opportunities', icon: Award, badge: 'Urgent' },
  { name: 'CEO Updates', path: '/ceo-updates', icon: Briefcase, badge: null },
  { name: 'Sales Team Updates', path: '/sales-team-updates', icon: Megaphone, badge: null },
  { name: 'Reports', path: '/reports', icon: BarChart3, badge: null },
  { name: 'Notifications', path: '/notifications', icon: Bell, badge: null },
  { name: 'Settings', path: '/settings', icon: Settings, badge: null },
];

export const Sidebar: React.FC = () => {
  const { user } = useAuth();

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800 flex-shrink-0 min-h-screen">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/30">
          SA
        </div>
        <div>
          <h1 className="font-bold text-white text-base leading-tight tracking-tight">Sales & Mgmt</h1>
          <p className="text-xs text-indigo-400 font-medium">Assistant System</p>
        </div>
      </div>

      {/* Role Indicator Banner */}
      <div className="px-5 py-3 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between text-xs">
        <span className="text-slate-400 font-medium">Active Role:</span>
        <span
          className={`px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider text-[10px] ${
            user?.role === 'Admin'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
              : user?.role === 'Assistant'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
              : user?.role === 'Sales'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
          }`}
        >
          {user?.role || 'Assistant'}
        </span>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20 font-semibold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
                }`
              }
            >
              <div className="flex items-center space-x-3">
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* System Status Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40 text-xs text-slate-400">
        <div className="flex items-center justify-between">
          <span className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>API Online</span>
          </span>
          <span className="text-[10px] text-slate-400">v1.0.0</span>
        </div>
      </div>
    </aside>
  );
};
