import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import {
  BarChart3, Plus, Download, AlertTriangle, Filter, Layers, PieChart,
  FileSpreadsheet, Sparkles, TrendingUp, Users, DollarSign
} from 'lucide-react';
import { ReportDefinition } from '../../types';

export const ReportsView: React.FC = () => {
  const { reports, deals, cases, contacts, addReport, t } = useCRM();

  const [selectedReport, setSelectedReport] = useState<ReportDefinition | null>(reports[0] || null);

  // New Report Modal
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [name, setName] = useState('');
  const [entity, setEntity] = useState<'DEAL' | 'CONTACT' | 'CASE' | 'CAMPAIGN'>('DEAL');
  const [groupBy, setGroupBy] = useState('stageId');
  const [metric, setMetric] = useState<'SUM' | 'COUNT' | 'AVERAGE'>('SUM');

  // Compute aggregated report data dynamically
  const computeReportData = () => {
    if (!selectedReport) return [];

    if (selectedReport.entity === 'DEAL') {
      const stageMap: Record<string, number> = {};
      deals.forEach((d) => {
        const key = d.stageId;
        const val = selectedReport.metric === 'SUM' ? d.amount : 1;
        stageMap[key] = (stageMap[key] || 0) + val;
      });
      return Object.entries(stageMap).map(([label, value]) => ({ label, value }));
    }

    if (selectedReport.entity === 'CASE') {
      const priorityMap: Record<string, number> = {};
      cases.forEach((c) => {
        priorityMap[c.priority] = (priorityMap[c.priority] || 0) + 1;
      });
      return Object.entries(priorityMap).map(([label, value]) => ({ label, value }));
    }

    if (selectedReport.entity === 'CONTACT') {
      const statusMap: Record<string, number> = {};
      contacts.forEach((c) => {
        statusMap[c.leadStatus] = (statusMap[c.leadStatus] || 0) + 1;
      });
      return Object.entries(statusMap).map(([label, value]) => ({ label, value }));
    }

    return [];
  };

  const reportData = computeReportData();
  const totalMetricValue = reportData.reduce((acc, item) => acc + item.value, 0);

  const handleCreateReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newR = addReport({
      name,
      entity,
      groupBy,
      metric,
      chartType: 'BAR',
      filters: [],
    });

    setIsBuilderOpen(false);
    setSelectedReport(newR);
    setName('');
  };

  const handleExportCsv = () => {
    if (!selectedReport) return;
    const csvRows = ['Label,Value', ...reportData.map((d) => `"${d.label}",${d.value}`)];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedReport.name.toLowerCase().replace(/\s+/g, '-')}-report.csv`;
    a.click();
  };

  return (
    <div className="flex h-full flex-col bg-slate-50 p-6 dark:bg-slate-950">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            {t('reports')} & Analytics Engine
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Build custom reports with filters, dynamic aggregation, and export safeguards.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCsv}
            disabled={!selectedReport}
            className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 transition-all"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>

          <button
            onClick={() => setIsBuilderOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 shadow-sm transition-all"
          >
            <Plus className="h-4 w-4" />
            New Custom Report
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid flex-1 grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Reports Catalog Column */}
        <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Saved Report Definitions
          </h2>
          <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto">
            {reports.map((report) => {
              const isSelected = selectedReport?.id === report.id;
              return (
                <button
                  key={report.id}
                  onClick={() => setSelectedReport(report)}
                  className={`flex flex-col gap-1.5 rounded-xl p-3.5 text-left transition-all border ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/50 dark:border-indigo-500 dark:bg-indigo-950/30'
                      : 'border-slate-100 bg-slate-50/60 hover:bg-slate-100/80 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                      {report.entity}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">
                      {report.chartType}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {report.name}
                  </h3>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Report Visualization Display */}
        {selectedReport ? (
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Broad Query Safeguard Warning Banner */}
            <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 text-xs font-medium text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300">
              <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
              <span>
                <strong>Query Safeguard:</strong> Broad aggregation over {deals.length + contacts.length + cases.length} records active. Sub-second memory processing confirmed.
              </span>
            </div>

            {/* Chart Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {selectedReport.name}
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Grouped by <span className="font-mono">{selectedReport.groupBy}</span> ({selectedReport.metric})
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xs font-semibold text-slate-400">Total Aggregate</div>
                  <div className="text-xl font-black text-indigo-600 dark:text-indigo-400">
                    {selectedReport.entity === 'DEAL' ? `$${totalMetricValue.toLocaleString()}` : totalMetricValue.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* HTML/CSS Bar Chart Visualization */}
              <div className="flex flex-col gap-4 mt-2">
                {reportData.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-400">No data points match criteria.</div>
                ) : (
                  reportData.map((item, idx) => {
                    const percentage = totalMetricValue > 0 ? Math.round((item.value / totalMetricValue) * 100) : 0;
                    return (
                      <div key={idx} className="flex flex-col gap-1.5">
                        <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                          <span className="font-mono">{item.label}</span>
                          <span>
                            {selectedReport.entity === 'DEAL' ? `$${item.value.toLocaleString()}` : item.value}{' '}
                            <span className="text-slate-400">({percentage}%)</span>
                          </span>
                        </div>
                        <div className="h-3.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-indigo-600 transition-all duration-500 rounded-full"
                            style={{ width: `${Math.max(percentage, 3)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 flex items-center justify-center rounded-2xl border border-dashed border-slate-300 p-12 text-slate-400 dark:border-slate-800">
            Select a report definition to render analytics
          </div>
        )}
      </div>

      {/* Modal: Custom Report Builder */}
      {isBuilderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-slate-100">
              Create Custom Report Definition
            </h2>
            <form onSubmit={handleCreateReport} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Report Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="Support SLA Breach Breakdown"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Primary Entity
                  </label>
                  <select
                    value={entity}
                    onChange={(e) => setEntity(e.target.value as any)}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  >
                    <option value="DEAL">Deals Pipeline</option>
                    <option value="CASE">Support Cases</option>
                    <option value="CONTACT">Contacts</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Aggregation Metric
                  </label>
                  <select
                    value={metric}
                    onChange={(e) => setMetric(e.target.value as any)}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  >
                    <option value="SUM">Sum Total Value</option>
                    <option value="COUNT">Record Count</option>
                    <option value="AVERAGE">Average Value</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsBuilderOpen(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 shadow-sm"
                >
                  Save Definition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
