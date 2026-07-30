import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import {
  Workflow, Plus, Zap, CheckCircle2, AlertCircle, Play, ShieldAlert,
  Database, ListFilter, PlayCircle, ToggleLeft, ToggleRight, Sparkles, Mail, MessageSquare, FileText,
  Activity, Search, RefreshCw, ArrowRight, Check, X, Clock, Send, Eye, ShieldCheck, Terminal, Trash2
} from 'lucide-react';
import { TemplateChooserModal } from '../common/TemplateChooserModal';
import { MessageTemplate, AutomationLog, AutomationRule } from '../../types';

export const AutomationView: React.FC = () => {
  const {
    automations, automationLogs, customFields, addAutomation, deleteAutomation,
    toggleAutomation, triggerWorkflows, contacts, deals, cases,
    addCustomField, deleteCustomField, templates, t
  } = useCRM();

  const [activeTab, setActiveTab] = useState<'workflows' | 'customFields' | 'logs'>('workflows');

  // Modal: New Automation
  const [isNewAutoOpen, setIsNewAutoOpen] = useState(false);
  const [autoName, setAutoName] = useState('');
  const [trigger, setTrigger] = useState<'CONTACT_CREATED' | 'DEAL_STAGE_CHANGED' | 'CASE_CREATED'>('CONTACT_CREATED');
  const [actionType, setActionType] = useState<'SEND_EMAIL' | 'SEND_MESSAGE' | 'CREATE_TASK' | 'SEND_NOTIFICATION'>('SEND_EMAIL');
  const [taskTitle, setTaskTitle] = useState('Automated Follow-up Task');

  // Template Action Selection
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(templates[0]?.id || '');
  const [selectedTemplateName, setSelectedTemplateName] = useState<string>(templates[0]?.name || '');
  const [selectedTemplateSubject, setSelectedTemplateSubject] = useState<string>(templates[0]?.subject || '');
  const [selectedTemplateBody, setSelectedTemplateBody] = useState<string>(templates[0]?.body || '');
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

  // Modal: New Custom Field
  const [isNewFieldOpen, setIsNewFieldOpen] = useState(false);
  const [fieldName, setFieldName] = useState('');
  const [entityType, setEntityType] = useState<'CONTACT' | 'DEAL' | 'ACCOUNT' | 'CASE'>('CONTACT');
  const [fieldType, setFieldType] = useState<'TEXT' | 'NUMBER' | 'DATE' | 'DROPDOWN' | 'CHECKBOX'>('TEXT');

  // Monitoring & Process Flow Modal State
  const [selectedLogForFlow, setSelectedLogForFlow] = useState<AutomationLog | null>(null);
  const [testWorkflowRule, setTestWorkflowRule] = useState<AutomationRule | null>(null);
  const [testTargetContactId, setTestTargetContactId] = useState<string>(contacts[0]?.id || '');
  const [isTestingInProgress, setIsTestingInProgress] = useState(false);
  const [testResultFeedback, setTestResultFeedback] = useState<{ success: boolean; message: string } | null>(null);

  // Logs Filter State
  const [logFilter, setLogFilter] = useState<'ALL' | 'SUCCESS' | 'FAILED'>('ALL');
  const [logSearch, setLogSearch] = useState('');

  // Stats Calculations
  const totalWorkflows = automations.length;
  const activeWorkflowsCount = automations.filter((a) => a.enabled).length;
  const totalRuns = automations.reduce((acc, a) => acc + (a.runCount || 0), 0);
  const totalLogsCount = automationLogs.length;
  const successfulLogsCount = automationLogs.filter((l) => l.status === 'SUCCESS').length;
  const failedLogsCount = automationLogs.filter((l) => l.status === 'FAILED').length;
  const successRate = totalLogsCount > 0 ? Math.round((successfulLogsCount / totalLogsCount) * 100) : 100;

  const handleSelectTemplate = (tmpl: MessageTemplate, renderedBody: string, renderedSubject: string) => {
    setSelectedTemplateId(tmpl.id);
    setSelectedTemplateName(tmpl.name);
    setSelectedTemplateSubject(renderedSubject || tmpl.subject || tmpl.name);
    setSelectedTemplateBody(renderedBody || tmpl.body);
  };

  const handleCreateAutomation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!autoName.trim()) return;

    addAutomation({
      name: autoName,
      trigger,
      actionType: actionType as any,
      actionPayload: {
        taskTitle: actionType === 'CREATE_TASK' ? taskTitle : selectedTemplateName,
        templateId: selectedTemplateId,
        templateName: selectedTemplateName,
        subject: selectedTemplateSubject,
        body: selectedTemplateBody,
        priority: 'HIGH',
      },
      enabled: true,
    });

    setIsNewAutoOpen(false);
    setAutoName('');
  };

  const handleCreateCustomField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fieldName.trim()) return;

    addCustomField({
      name: fieldName,
      key: fieldName.toLowerCase().replace(/\s+/g, '_'),
      entityType,
      type: fieldType,
      required: false,
    });

    setIsNewFieldOpen(false);
    setFieldName('');
  };

  // Run Manual Test Simulation
  const handleExecuteTestRun = async () => {
    if (!testWorkflowRule) return;
    setIsTestingInProgress(true);
    setTestResultFeedback(null);

    const targetContact = contacts.find((c) => c.id === testTargetContactId) || contacts[0];

    try {
      await triggerWorkflows(
        testWorkflowRule.trigger,
        'CONTACT',
        targetContact,
        testWorkflowRule.id
      );

      setTestResultFeedback({
        success: true,
        message: `Workflow "${testWorkflowRule.name}" executed successfully for ${targetContact.firstName} ${targetContact.lastName}! Log updated in real time.`,
      });
    } catch (err: any) {
      setTestResultFeedback({
        success: false,
        message: `Execution failed: ${err?.message || 'Error running test workflow'}`,
      });
    } finally {
      setIsTestingInProgress(false);
    }
  };

  const filteredLogs = automationLogs.filter((log) => {
    if (logFilter === 'SUCCESS' && log.status !== 'SUCCESS') return false;
    if (logFilter === 'FAILED' && log.status !== 'FAILED') return false;
    if (logSearch.trim()) {
      const q = logSearch.toLowerCase();
      return (
        log.automationName.toLowerCase().includes(q) ||
        log.triggeredByEntity.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q) ||
        (log.recipient && log.recipient.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="flex h-full flex-col bg-slate-50 p-6 dark:bg-slate-950 overflow-y-auto">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Workflow className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            {t('automation')} & Process Flow Engine
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Configure, activate, and monitor real-time event workflows and custom metadata schemas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex rounded-xl bg-slate-200/80 p-1 dark:bg-slate-800">
            <button
              onClick={() => setActiveTab('workflows')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                activeTab === 'workflows'
                  ? 'bg-white text-indigo-600 shadow-xs dark:bg-slate-900 dark:text-indigo-400'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              Workflows ({automations.length})
            </button>
            <button
              onClick={() => setActiveTab('customFields')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                activeTab === 'customFields'
                  ? 'bg-white text-indigo-600 shadow-xs dark:bg-slate-900 dark:text-indigo-400'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              Custom Fields ({customFields.length})
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                activeTab === 'logs'
                  ? 'bg-white text-indigo-600 shadow-xs dark:bg-slate-900 dark:text-indigo-400'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              Audit & Execution Logs ({automationLogs.length})
            </button>
          </div>

          {activeTab === 'workflows' && (
            <button
              onClick={() => setIsNewAutoOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 shadow-xs transition-all"
            >
              <Plus className="h-4 w-4" />
              New Workflow
            </button>
          )}

          {activeTab === 'customFields' && (
            <button
              onClick={() => setIsNewFieldOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 shadow-xs transition-all"
            >
              <Plus className="h-4 w-4" />
              Add Custom Field
            </button>
          )}
        </div>
      </div>

      {/* Overview Telemetry KPI Bar */}
      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Total Workflows</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">{totalWorkflows}</span>
            <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">({activeWorkflowsCount} Active)</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Total Executions</div>
          <div className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">{totalRuns}</div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Execution Success Rate</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{successRate}%</span>
            <span className="text-xs text-slate-400">({successfulLogsCount} / {totalLogsCount})</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Failed Dispatches</div>
          <div className="mt-1 text-2xl font-bold text-rose-600 dark:text-rose-400">{failedLogsCount}</div>
        </div>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'workflows' && (
        <div className="flex flex-col gap-4">
          {/* Safeguard banner */}
          <div className="flex items-center gap-2.5 rounded-2xl border border-indigo-200 bg-indigo-50/70 p-3.5 text-xs text-indigo-900 dark:border-indigo-900/50 dark:bg-indigo-950/40 dark:text-indigo-300">
            <ShieldAlert className="h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
            <span>
              <strong>Real-Time Event Engine Active:</strong> Contact created events, case tickets, and deal stage shifts automatically evaluate active workflows and dispatch outbound emails/messages.
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {automations.map((auto) => (
              <div
                key={auto.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 flex items-center gap-1">
                      <Zap className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                      {auto.trigger}
                    </span>

                    {/* Activation Toggle Switch */}
                    <button
                      type="button"
                      onClick={() => toggleAutomation(auto.id)}
                      className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold transition-colors ${
                        auto.enabled
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {auto.enabled ? (
                        <>
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          ACTIVE
                        </>
                      ) : (
                        <>
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                          DISABLED
                        </>
                      )}
                    </button>
                  </div>

                  <h3 className="mt-3 text-sm font-bold text-slate-900 dark:text-slate-100">
                    {auto.name}
                  </h3>

                  <div className="mt-2 text-xs text-slate-600 dark:text-slate-400 space-y-1">
                    <div>
                      Action: <strong className="font-mono text-indigo-600 dark:text-indigo-400">{auto.actionType}</strong>
                    </div>
                    {auto.actionPayload?.subject && (
                      <div className="text-[11px] text-slate-500 truncate">
                        Subject: <em>"{auto.actionPayload.subject}"</em>
                      </div>
                    )}
                    {auto.lastRunAt && (
                      <div className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Last Run: {new Date(auto.lastRunAt).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 border-t border-slate-100 pt-3 flex items-center justify-between text-[11px] text-slate-500 dark:border-slate-800">
                  <span className="font-medium">Executions: <strong>{auto.runCount || 0}</strong></span>

                  <div className="flex items-center gap-2">
                    {/* Manual Test Run Button */}
                    <button
                      onClick={() => {
                        setTestWorkflowRule(auto);
                        setTestResultFeedback(null);
                      }}
                      className="flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                    >
                      <Play className="h-3 w-3 text-indigo-600" /> Test Run
                    </button>

                    <button
                      onClick={() => deleteAutomation(auto.id)}
                      className="rounded-lg bg-rose-50 px-2 py-1 text-[11px] font-bold text-rose-600 hover:bg-rose-100 dark:bg-rose-950/60 dark:text-rose-400"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'customFields' && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {customFields.map((field) => (
            <div
              key={field.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                    {field.entityType}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-slate-400">
                      {field.type}
                    </span>
                    <button
                      onClick={() => deleteCustomField(field.id)}
                      className="rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-600 hover:bg-rose-100 dark:bg-rose-950/60 dark:text-rose-400"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <h3 className="mt-3 text-sm font-bold text-slate-900 dark:text-slate-100">
                  {field.name}
                </h3>
                <div className="mt-1 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                  Key: {field.key}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Terminal className="h-4 w-4 text-indigo-600" />
                Workflow Audit Logs & Real-Time Flow Telemetry
              </h2>
              <p className="text-xs text-slate-500">
                Click on any log record to open the step-by-step visual execution flow diagram.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs text-slate-900 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>

              <select
                value={logFilter}
                onChange={(e) => setLogFilter(e.target.value as any)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="ALL">All Statuses</option>
                <option value="SUCCESS">Success Only</option>
                <option value="FAILED">Failed Only</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            {filteredLogs.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No matching workflow execution logs found.
              </div>
            ) : (
              filteredLogs.map((log) => (
                <div
                  key={log.id}
                  onClick={() => setSelectedLogForFlow(log)}
                  className="group flex cursor-pointer items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/60 p-3.5 text-xs hover:border-indigo-300 hover:bg-indigo-50/40 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:border-indigo-800 dark:hover:bg-indigo-950/20 transition-all"
                >
                  <div className="flex items-center gap-3">
                    {log.status === 'SUCCESS' ? (
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                    ) : (
                      <AlertCircle className="h-5 w-5 shrink-0 text-rose-500" />
                    )}

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-slate-100">
                          {log.automationName}
                        </span>
                        <span className="rounded bg-slate-200/80 px-1.5 py-0.5 text-[9px] font-bold text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                          {log.triggerType || 'TRIGGER'}
                        </span>
                        {log.actionType && (
                          <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[9px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                            {log.actionType}
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 text-[11px] text-slate-600 dark:text-slate-300">
                        Target: <strong>{log.triggeredByEntity}</strong> {log.recipient ? `(${log.recipient})` : ''}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {log.details}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-slate-400">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <button className="flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-[10px] font-bold text-indigo-600 border border-slate-200 group-hover:bg-indigo-600 group-hover:text-white dark:bg-slate-800 dark:border-slate-700 transition-all">
                      <Eye className="h-3 w-3" /> Inspect Flow
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Workflow Process Flow Visualizer Modal */}
      {selectedLogForFlow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div>
                <span className="rounded bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  Process Flow Inspector
                </span>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
                  {selectedLogForFlow.automationName}
                </h2>
                <p className="text-xs text-slate-500">
                  Execution ID: {selectedLogForFlow.id} • {new Date(selectedLogForFlow.timestamp).toLocaleString()}
                </p>
              </div>

              <button
                onClick={() => setSelectedLogForFlow(null)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Visual Process Diagram */}
            <div className="my-6 space-y-3">
              <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Execution Pipeline Nodes
              </div>

              {selectedLogForFlow.steps && selectedLogForFlow.steps.length > 0 ? (
                selectedLogForFlow.steps.map((step, idx) => (
                  <div key={idx} className="relative flex items-start gap-3 pl-2">
                    {/* Vertical Connector Line */}
                    {idx < (selectedLogForFlow.steps?.length || 0) - 1 && (
                      <div className="absolute left-5 top-8 bottom-0 w-0.5 bg-indigo-200 dark:bg-indigo-900" />
                    )}

                    <div className={`z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      step.status === 'SUCCESS'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                    }`}>
                      {step.status === 'SUCCESS' ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                    </div>

                    <div className="flex-1 rounded-xl border border-slate-200/80 bg-slate-50/80 p-3 text-xs dark:border-slate-800 dark:bg-slate-800/40">
                      <div className="flex items-center justify-between font-bold text-slate-900 dark:text-slate-100">
                        <span>{step.stepName}</span>
                        <span className="text-[10px] text-slate-400">{new Date(step.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="mt-1 text-[11px] text-slate-600 dark:text-slate-300">{step.details}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-800/50">
                  <div className="font-bold text-slate-900 dark:text-slate-100">Summary Outcome</div>
                  <p className="mt-1">{selectedLogForFlow.details}</p>
                </div>
              )}
            </div>

            {/* Error Details if any */}
            {selectedLogForFlow.errorDetails && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-900 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300 mb-4">
                <strong>Error Trace:</strong> {selectedLogForFlow.errorDetails}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedLogForFlow(null)}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900"
              >
                Close Visualizer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Test Runner Modal */}
      {testWorkflowRule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Play className="h-4 w-4 text-indigo-600" />
                Simulate / Test Run Workflow
              </h2>
              <button
                onClick={() => setTestWorkflowRule(null)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="my-4 space-y-3 text-xs">
              <div className="rounded-xl border border-indigo-100 bg-indigo-50/70 p-3 text-indigo-900 dark:border-indigo-900/50 dark:bg-indigo-950/30 dark:text-indigo-200">
                <div className="font-bold">{testWorkflowRule.name}</div>
                <div className="mt-1 text-[11px]">
                  Trigger: <strong>{testWorkflowRule.trigger}</strong> | Action: <strong>{testWorkflowRule.actionType}</strong>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Select Target Contact for Test Event:
                </label>
                <select
                  value={testTargetContactId}
                  onChange={(e) => setTestTargetContactId(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                >
                  {contacts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.firstName} {c.lastName} ({c.email || c.phone || 'No email'})
                    </option>
                  ))}
                </select>
              </div>

              {testResultFeedback && (
                <div className={`p-3 rounded-xl border text-xs ${
                  testResultFeedback.success
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-200'
                    : 'border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-200'
                }`}>
                  {testResultFeedback.message}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setTestWorkflowRule(null)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleExecuteTestRun}
                disabled={isTestingInProgress}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 shadow-xs transition-all disabled:opacity-50"
              >
                {isTestingInProgress ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Zap className="h-3.5 w-3.5" />
                )}
                Execute Test Trigger
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: New Workflow */}
      {isNewAutoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-slate-100">
              Create Workflow Automation Rule
            </h2>
            <form onSubmit={handleCreateAutomation} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Automation Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Welcome email when contact created"
                  value={autoName}
                  onChange={(e) => setAutoName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Event Trigger
                </label>
                <select
                  value={trigger}
                  onChange={(e) => setTrigger(e.target.value as any)}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 font-semibold"
                >
                  <option value="CONTACT_CREATED">When Contact Created</option>
                  <option value="DEAL_STAGE_CHANGED">When Deal Stage Changes</option>
                  <option value="CASE_CREATED">When Support Case Created</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Automated Action
                </label>
                <select
                  value={actionType}
                  onChange={(e) => setActionType(e.target.value as any)}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 font-semibold"
                >
                  <option value="SEND_EMAIL">Dispatch Designed Email Template</option>
                  <option value="SEND_MESSAGE">Dispatch Designed SMS/WhatsApp Template</option>
                  <option value="CREATE_TASK">Create Follow-up Task</option>
                  <option value="SEND_NOTIFICATION">Send In-App Notification</option>
                </select>
              </div>

              {actionType === 'CREATE_TASK' ? (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Task Title
                  </label>
                  <input
                    type="text"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>
              ) : (actionType === 'SEND_EMAIL' || actionType === 'SEND_MESSAGE') ? (
                <div className="space-y-2 rounded-xl border border-indigo-100 bg-indigo-50/60 p-3.5 dark:border-indigo-900/50 dark:bg-indigo-950/30">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-indigo-900 dark:text-indigo-200">
                      Message Template
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsTemplateModalOpen(true)}
                      className="flex items-center gap-1 rounded-lg bg-indigo-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-indigo-700 shadow-2xs"
                    >
                      <Sparkles className="h-3 w-3" /> Choose Template
                    </button>
                  </div>

                  <div className="rounded-lg bg-white p-2.5 border border-indigo-200/80 text-xs dark:bg-slate-900 dark:border-slate-700 space-y-1">
                    <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-indigo-600" />
                      {selectedTemplateName || 'No template selected'}
                    </div>
                    {selectedTemplateSubject && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Subject: <strong>{selectedTemplateSubject}</strong>
                      </p>
                    )}
                  </div>
                </div>
              ) : null}

              <div className="mt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsNewAutoOpen(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 shadow-xs"
                >
                  Save Workflow
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Template Chooser Modal for Workflows */}
      <TemplateChooserModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        targetChannel={actionType === 'SEND_EMAIL' ? 'EMAIL' : 'SMS'}
        title="Select Workflow Action Template"
        onSelectTemplate={handleSelectTemplate}
      />

      {/* Modal: New Custom Field */}
      {isNewFieldOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-slate-100">
              Define Custom Field Schema
            </h2>
            <form onSubmit={handleCreateCustomField} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Field Display Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="Annual Contract Value (ACV)"
                  value={fieldName}
                  onChange={(e) => setFieldName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Target Entity
                  </label>
                  <select
                    value={entityType}
                    onChange={(e) => setEntityType(e.target.value as any)}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  >
                    <option value="CONTACT">Contact</option>
                    <option value="DEAL">Deal</option>
                    <option value="ACCOUNT">Account</option>
                    <option value="CASE">Case</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Data Type
                  </label>
                  <select
                    value={fieldType}
                    onChange={(e) => setFieldType(e.target.value as any)}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  >
                    <option value="TEXT">Text</option>
                    <option value="NUMBER">Number</option>
                    <option value="DATE">Date</option>
                    <option value="DROPDOWN">Dropdown</option>
                    <option value="CHECKBOX">Checkbox</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsNewFieldOpen(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 shadow-xs"
                >
                  Save Field
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
