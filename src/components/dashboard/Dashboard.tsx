import React from 'react';
import { useCRM } from '../../context/CRMContext';
import {
  DollarSign, TrendingUp, Award, CheckCircle2, ArrowUpRight, Calendar, Activity as ActivityIcon
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  onNavigateTab: (tab: any) => void;
  onSelectContact: (id: string) => void;
  onSelectDeal: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigateTab, onSelectContact, onSelectDeal }) => {
  const { deals = [], pipeline, tasks = [], activities = [], toggleTaskStatus, t } = useCRM();

  // Metrics Calculations
  const totalPipelineValue = (deals || [])
    .filter((d) => d?.status === 'OPEN')
    .reduce((sum, d) => sum + (d?.amount || 0), 0);

  const weightedForecast = (deals || [])
    .filter((d) => d?.status === 'OPEN')
    .reduce((sum, d) => sum + ((d?.amount || 0) * (d?.probability || 0)) / 100, 0);

  const totalClosedWon = (deals || [])
    .filter((d) => d?.status === 'WON')
    .reduce((sum, d) => sum + (d?.amount || 0), 0);

  const openTasks = (tasks || []).filter((t) => t?.status === 'OPEN');

  // Chart data: Value per stage
  const stages = pipeline?.stages || [];
  const stageData = stages.map((stage) => {
    const stageDeals = (deals || []).filter((d) => d?.stageId === stage.id && d?.status === 'OPEN');
    const value = stageDeals.reduce((sum, d) => sum + (d?.amount || 0), 0);
    return {
      name: stage.name,
      value,
      count: stageDeals.length,
      color: stage.color,
    };
  });

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {t('dashboard')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time pipeline performance and sales operations overview.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Calendar className="h-3.5 w-3.5" />
          <span>Today: {new Date().toLocaleDateString(undefined, { dateStyle: 'full' })}</span>
        </div>
      </div>

      {/* 4 Top Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Metric 1: Total Pipeline Value */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {t('pipelineValue')}
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight dark:text-slate-100">
              ${totalPipelineValue.toLocaleString()}
            </span>
            <span className="flex items-center text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              <ArrowUpRight className="h-3 w-3" /> +14.2%
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Active open opportunities</p>
        </div>

        {/* Metric 2: Weighted Forecast */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {t('weightedForecast')}
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight dark:text-slate-100">
              ${Math.round(weightedForecast).toLocaleString()}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Factored by stage probabilities</p>
        </div>

        {/* Metric 3: Won Deals */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {t('wonDeals')}
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <Award className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight dark:text-slate-100">
              ${totalClosedWon.toLocaleString()}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Closed revenue to date</p>
        </div>

        {/* Metric 4: Open Tasks */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {t('openTasks')}
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight dark:text-slate-100">
              {openTasks.length}
            </span>
            <span className="text-xs text-amber-600 font-medium">due soon</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Requires team attention</p>
        </div>
      </div>

      {/* Main Grid: Pipeline Chart & Tasks Widget */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Chart Column (2 Spans) */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs lg:col-span-2 dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Pipeline Value Distribution by Stage
              </h2>
              <p className="text-[11px] text-slate-400">
                Open deal amounts across active pipeline stages
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('deals')}
              className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
            >
              Manage Board →
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip
                  formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Pipeline Value']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#f8fafc',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {stageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Due Tasks Widget */}
        <div className="flex flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Tasks Due Today
            </h2>
            <button
              onClick={() => onNavigateTab('tasks')}
              className="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
            >
              View All
            </button>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto max-h-64">
            {openTasks.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                🎉 All tasks completed! Great job.
              </div>
            ) : (
              openTasks.slice(0, 5).map((t) => (
                <div
                  key={t.id}
                  className="flex items-start gap-2.5 rounded-xl border border-slate-100 bg-slate-50/60 p-2.5 transition-colors hover:bg-slate-100/60 dark:border-slate-800 dark:bg-slate-800/40"
                >
                  <input
                    type="checkbox"
                    checked={t.status === 'DONE'}
                    onChange={() => toggleTaskStatus(t.id)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-slate-800 truncate dark:text-slate-200">
                      {t.title}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Due: {t.dueDate} • Priority:{' '}
                      <span
                        className={
                          t.priority === 'HIGH'
                            ? 'font-bold text-rose-500'
                            : 'text-amber-500'
                        }
                      >
                        {t.priority}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* 360 Activity Timeline Feed */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ActivityIcon className="h-4 w-4 text-indigo-500" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Recent 360° Activity Stream
            </h2>
          </div>
          <span className="text-xs text-slate-400">Live Audit Log</span>
        </div>

        <div className="space-y-3">
          {activities.slice(0, 5).map((act) => (
            <div
              key={act.id}
              className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50/50 p-3 text-xs dark:border-slate-800/60 dark:bg-slate-800/30"
            >
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-indigo-100 font-bold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                {act.userName.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {act.title}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="mt-0.5 text-slate-600 dark:text-slate-300">{act.description}</p>
                <div className="mt-1 flex gap-2 text-[10px] text-slate-400">
                  <span>By {act.userName}</span>
                  {act.contactId && (
                    <button
                      onClick={() => onSelectContact(act.contactId!)}
                      className="text-indigo-500 hover:underline"
                    >
                      View Contact
                    </button>
                  )}
                  {act.dealId && (
                    <button
                      onClick={() => onSelectDeal(act.dealId!)}
                      className="text-indigo-500 hover:underline"
                    >
                      View Deal
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
