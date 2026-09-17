import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  Clock,
  Briefcase,
  TrendingUp,
  ArrowUpRight,
  ShieldAlert,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ActionItem {
  id: string;
  type: string;
  title: string;
  subtitle: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  color: string;
  urgency: string;
  action: string;
  link: string;
}

interface Stats {
  totalLeads: number;
  newLeads: number;
  activeFunnel: number;
  followUpsDueToday: number;
  overdueFollowUps: number;
  pendingTasks: number;
  ceoUpdatesPending: number;
}

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState<Stats>({
    totalLeads: 0,
    newLeads: 0,
    activeFunnel: 0,
    followUpsDueToday: 0,
    overdueFollowUps: 0,
    pendingTasks: 0,
    ceoUpdatesPending: 0,
  });

  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, actionRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/dashboard/action-center'),
        ]);

        if (statsRes.data.success) {
          setStats(statsRes.data.stats);
        }
        if (actionRes.data.success) {
          setActionItems(actionRes.data.items);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-500">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-xs font-semibold">Loading Action Center Dashboard...</p>
      </div>
    );
  }

  const todayFormatted = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* 1. Greeting & Date Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Good Morning, {user?.name.split(' ')[0]} 👋
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
              {user?.role} Assistant
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Enter information once and let the system tell you what needs immediate attention today.
          </p>
        </div>
        <div className="flex items-center space-x-3 text-sm text-slate-600 font-medium">
          <span className="px-3 py-1.5 bg-slate-100 rounded-lg border border-slate-200 flex items-center space-x-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <span>{todayFormatted}</span>
          </span>
        </div>
      </div>

      {/* 2. Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {/* Card 1: Total Leads */}
        <div
          onClick={() => navigate('/leads')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md cursor-pointer transition"
        >
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Leads</div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{stats.totalLeads}</div>
          <div className="text-[11px] text-indigo-600 mt-1 font-medium flex items-center">
            <span>View all</span>
            <ArrowUpRight className="w-3 h-3 ml-0.5" />
          </div>
        </div>

        {/* Card 2: New Leads */}
        <div
          onClick={() => navigate('/leads?status=New')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md cursor-pointer transition"
        >
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">New Leads</div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{stats.newLeads}</div>
          <div className="text-[11px] text-slate-400 mt-1 font-medium">Requires initial contact</div>
        </div>

        {/* Card 3: Active Funnel */}
        <div
          onClick={() => navigate('/sales-funnel')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md cursor-pointer transition"
        >
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Funnel</div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{stats.activeFunnel}</div>
          <div className="text-[11px] text-slate-400 mt-1 font-medium">Opportunities in pipeline</div>
        </div>

        {/* Card 4: Follow-ups Due */}
        <div
          onClick={() => navigate('/sales-funnel?filter=dueToday')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-amber-300 hover:shadow-md cursor-pointer transition"
        >
          <div className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Follow-ups Due</div>
          <div className="text-2xl font-bold text-amber-600 mt-2">{stats.followUpsDueToday}</div>
          <div className="text-[11px] text-amber-600 mt-1 font-medium">Due today</div>
        </div>

        {/* Card 5: Overdue Follow-ups */}
        <div
          onClick={() => navigate('/sales-funnel?filter=overdue')}
          className="bg-white p-4 rounded-xl border border-red-200 bg-red-50/30 hover:border-red-300 hover:shadow-md cursor-pointer transition"
        >
          <div className="text-xs font-semibold text-red-600 uppercase tracking-wider">Overdue</div>
          <div className="text-2xl font-bold text-red-600 mt-2">{stats.overdueFollowUps}</div>
          <div className="text-[11px] text-red-600 mt-1 font-medium">Action required</div>
        </div>

        {/* Card 6: Pending Tasks */}
        <div
          onClick={() => navigate('/tasks')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md cursor-pointer transition"
        >
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Tasks</div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{stats.pendingTasks}</div>
          <div className="text-[11px] text-indigo-600 mt-1 font-medium">Personal workload</div>
        </div>

        {/* Card 7: CEO Updates Pending */}
        <div
          onClick={() => navigate('/ceo-updates')}
          className="bg-white p-4 rounded-xl border border-purple-200 bg-purple-50/30 hover:border-purple-300 hover:shadow-md cursor-pointer transition"
        >
          <div className="text-xs font-semibold text-purple-700 uppercase tracking-wider">CEO Updates</div>
          <div className="text-2xl font-bold text-purple-700 mt-2">{stats.ceoUpdatesPending}</div>
          <div className="text-[11px] text-purple-600 mt-1 font-medium">Pending inform</div>
        </div>
      </div>

      {/* 3. Action Center: "NEEDS YOUR ATTENTION" */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight">Needs Your Attention</h2>
              <p className="text-xs text-slate-400">Calculated priority engine action queue</p>
            </div>
          </div>
          <span className="px-2.5 py-1 bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-bold rounded-full">
            {actionItems.length} Urgent Items
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {actionItems.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-2">
              <Sparkles className="w-8 h-8 text-indigo-500 mx-auto opacity-60" />
              <p className="font-semibold text-slate-700 text-base">All clear! No urgent actions required right now.</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Tasks, follow-ups, opportunities, or stale leads requiring attention will automatically appear here.
              </p>
            </div>
          ) : (
            actionItems.map((item) => (
              <div
                key={item.id}
                className="p-5 hover:bg-slate-50/80 transition flex items-center justify-between gap-4"
              >
                <div className="flex items-start space-x-4">
                  {/* Priority Indicator Pill */}
                  <span
                    className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider flex-shrink-0 mt-0.5 ${
                      item.priority === 'Critical'
                        ? 'bg-red-100 text-red-700 border border-red-200'
                        : item.priority === 'High'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {item.priority}
                  </span>

                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-bold text-slate-900 text-sm hover:text-indigo-600 cursor-pointer">
                        {item.title}
                      </h3>
                      <span className="text-xs text-slate-400">• {item.type}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">{item.subtitle}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 flex-shrink-0">
                  <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-md border border-slate-200">
                    {item.urgency}
                  </span>
                  <button
                    onClick={() => navigate(item.link)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-lg transition shadow-xs flex items-center space-x-1"
                  >
                    <span>{item.action}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 4. Secondary Grid: Sales Overview & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sales Funnel Pipeline Summary */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              <span>Sales Funnel Pipeline</span>
            </h3>
            <button
              onClick={() => navigate('/sales-funnel')}
              className="text-xs text-indigo-600 font-semibold hover:underline flex items-center"
            >
              <span>View Full Pipeline</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
              <span className="font-medium text-slate-700">1. New Leads Received</span>
              <span className="font-bold text-slate-900">{stats.newLeads}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
              <span className="font-medium text-slate-700">2. Active Requirements & Quotations</span>
              <span className="font-bold text-slate-900">{stats.activeFunnel}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
              <span className="font-medium text-slate-700">3. Active Negotiations</span>
              <span className="font-bold text-indigo-600">--</span>
            </div>
          </div>
        </div>

        {/* Quick Operational Assistant Shortcuts */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
              <Briefcase className="w-5 h-5 text-indigo-600" />
              <span>Assistant Operational Actions</span>
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/leads')}
              className="p-4 text-left rounded-xl bg-indigo-50/60 hover:bg-indigo-50 border border-indigo-100 text-indigo-900 font-semibold text-xs transition"
            >
              <div className="font-bold text-sm text-indigo-700 mb-1">+ Add New Lead</div>
              <div className="text-[11px] text-indigo-600/80 font-normal">Check duplicates & register lead</div>
            </button>

            <button
              onClick={() => navigate('/tasks')}
              className="p-4 text-left rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-900 font-semibold text-xs transition"
            >
              <div className="font-bold text-sm text-slate-800 mb-1">+ Create Task</div>
              <div className="text-[11px] text-slate-500 font-normal">Track priority deadline task</div>
            </button>

            <button
              onClick={() => navigate('/ceo-updates')}
              className="p-4 text-left rounded-xl bg-purple-50/60 hover:bg-purple-50 border border-purple-100 text-purple-900 font-semibold text-xs transition"
            >
              <div className="font-bold text-sm text-purple-700 mb-1">+ CEO Update Item</div>
              <div className="text-[11px] text-purple-600/80 font-normal">Flag important event for CEO</div>
            </button>

            <button
              onClick={() => navigate('/sales-team-updates')}
              className="p-4 text-left rounded-xl bg-emerald-50/60 hover:bg-emerald-50 border border-emerald-100 text-emerald-900 font-semibold text-xs transition"
            >
              <div className="font-bold text-sm text-emerald-700 mb-1">📢 Sales Update</div>
              <div className="text-[11px] text-emerald-600/80 font-normal">Generate sales team update report</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
