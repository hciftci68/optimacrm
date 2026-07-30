import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import {
  Headphones, Plus, Clock, AlertTriangle, CheckCircle2, MessageSquare,
  Lock, Eye, Filter, Sparkles, Send, UserCheck, ShieldAlert, CheckSquare, X
} from 'lucide-react';
import { CaseItem } from '../../types';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';

export const CasesView: React.FC = () => {
  const {
    cases, cannedResponses, users, contacts, tasks, addTask, addCase, updateCaseStatus,
    updateCase, deleteCase, addCaseNote, currentUser, t
  } = useCRM();

  const [selectedCase, setSelectedCase] = useState<CaseItem | null>(cases[0] || null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [pendingDeleteCase, setPendingDeleteCase] = useState<CaseItem | null>(null);

  // Modal: New Case
  const [isNewCaseOpen, setIsNewCaseOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<CaseItem['priority']>('MEDIUM');
  const [contactId, setContactId] = useState(contacts[0]?.id || '');

  // Modal: New Case Task
  const [isCaseTaskModalOpen, setIsCaseTaskModalOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('2026-07-26');
  const [taskPriority, setTaskPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [taskAssigneeId, setTaskAssigneeId] = useState(currentUser?.id || users[0]?.id || '');

  // Case note input
  const [noteContent, setNoteContent] = useState('');
  const [isInternalOnly, setIsInternalOnly] = useState(true);

  const filteredCases = cases.filter((c) => {
    if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
    if (priorityFilter !== 'ALL' && c.priority !== priorityFilter) return false;
    return true;
  });

  const handleCreateCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;

    const newC = addCase({
      subject,
      description,
      status: 'NEW',
      priority,
      contactId,
      assigneeId: users[0]?.id,
      sourceChannel: 'EMAIL',
    });

    setIsNewCaseOpen(false);
    setSelectedCase(newC);
    setSubject('');
    setDescription('');
  };

  const handleCreateCaseTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase || !taskTitle.trim()) return;

    addTask({
      title: taskTitle,
      description: `Task for Case #${selectedCase.caseNumber}: ${selectedCase.subject}`,
      dueDate: taskDueDate,
      status: 'NEW',
      priority: taskPriority,
      creatorId: currentUser?.id,
      assigneeId: taskAssigneeId || currentUser?.id || users[0]?.id || '',
      linkedCaseId: selectedCase.id,
      linkedContactId: selectedCase.contactId,
      workLogs: [],
    });

    setIsCaseTaskModalOpen(false);
    setTaskTitle('');
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCase || !noteContent.trim()) return;

    addCaseNote(selectedCase.id, noteContent, isInternalOnly);
    setNoteContent('');

    // Local refresh
    const updated = cases.find((c) => c.id === selectedCase.id);
    if (updated) setSelectedCase(updated);
  };

  const handleInsertCannedResponse = (responseContent: string) => {
    setNoteContent((prev) => (prev ? `${prev}\n${responseContent}` : responseContent));
  };

  return (
    <div className="flex h-full flex-col bg-slate-50 p-6 dark:bg-slate-950">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Headphones className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            {t('cases')} & SLA Helpdesk Queue
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Monitor support tickets, manage SLA deadlines, and separate staff internal notes from public customer replies.
          </p>
        </div>

        <button
          onClick={() => setIsNewCaseOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 shadow-sm transition-all"
        >
          <Plus className="h-4 w-4" />
          New Case
        </button>
      </div>

      {/* Main Grid View */}
      <div className="grid flex-1 grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Cases List */}
        <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          {/* Filters Bar */}
          <div className="mb-4 flex flex-wrap gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
            >
              <option value="ALL">All Statuses</option>
              <option value="NEW">New</option>
              <option value="OPEN">Open</option>
              <option value="PENDING">Pending</option>
              <option value="RESOLVED">Resolved</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
            >
              <option value="ALL">All Priorities</option>
              <option value="URGENT">Urgent</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto">
            {filteredCases.map((caseItem) => {
              const isSelected = selectedCase?.id === caseItem.id;
              const contact = contacts.find((c) => c.id === caseItem.contactId);
              return (
                <button
                  key={caseItem.id}
                  onClick={() => setSelectedCase(caseItem)}
                  className={`flex flex-col gap-2 rounded-xl p-3.5 text-left transition-all border ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/50 dark:border-indigo-500 dark:bg-indigo-950/30'
                      : 'border-slate-100 bg-slate-50/60 hover:bg-slate-100/80 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold text-slate-500 dark:text-slate-400">
                      {caseItem.caseNumber}
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        caseItem.priority === 'URGENT'
                          ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                          : caseItem.priority === 'HIGH'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                      }`}
                    >
                      {caseItem.priority}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                    {caseItem.subject}
                  </h3>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span>{contact ? `${contact.firstName} ${contact.lastName}` : 'Customer'}</span>
                    <span
                      className={`font-semibold ${
                        caseItem.slaStatus === 'BREACHED'
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      SLA: {caseItem.slaStatus}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Case Detail & Communication Timeline */}
        {selectedCase ? (
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Ticket Summary Banner */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-400">
                      {selectedCase.caseNumber}
                    </span>
                    <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {selectedCase.subject}
                    </h2>
                  </div>
                  <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">
                    {selectedCase.description}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={selectedCase.status}
                    onChange={(e) => updateCaseStatus(selectedCase.id, e.target.value as CaseItem['status'])}
                    className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  >
                    <option value="NEW">NEW</option>
                    <option value="OPEN">OPEN</option>
                    <option value="PENDING">PENDING</option>
                    <option value="RESOLVED">RESOLVED</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>

                  <button
                    onClick={() => setPendingDeleteCase(selectedCase)}
                    className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-400"
                  >
                    Vakayı Sil
                  </button>
                </div>
              </div>

              {/* SLA Deadlines Bar */}
              <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-950">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-500" />
                  <span>
                    <strong>Response Deadline:</strong>{' '}
                    {new Date(selectedCase.slaResponseDeadline).toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-emerald-500" />
                  <span>
                    <strong>Resolution Deadline:</strong>{' '}
                    {new Date(selectedCase.slaResolutionDeadline).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Case Linked Tasks Section */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <CheckSquare className="h-4 w-4 text-indigo-500" /> Vakaya Ait Görevler ({tasks.filter(t => t.linkedCaseId === selectedCase.id && t.status !== 'DELETED').length})
                </div>
                <button
                  onClick={() => {
                    setTaskTitle(`Vaka Takibi: ${selectedCase.subject.substring(0, 30)}`);
                    setIsCaseTaskModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-400 dark:hover:bg-indigo-900/50"
                >
                  <Plus className="h-3.5 w-3.5" /> + Vakaya Görev Ekle
                </button>
              </div>

              {tasks.filter(t => t.linkedCaseId === selectedCase.id && t.status !== 'DELETED').length === 0 ? (
                <p className="text-xs text-slate-400 italic">Bu destek vakasına henüz tanımlanmış bir görev bulunmuyor.</p>
              ) : (
                <div className="space-y-2">
                  {tasks.filter(t => t.linkedCaseId === selectedCase.id && t.status !== 'DELETED').map((tItem) => {
                    const assignee = users.find(u => u.id === tItem.assigneeId);
                    return (
                      <div key={tItem.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/70 p-2.5 text-xs dark:border-slate-800 dark:bg-slate-800/40">
                        <div className="flex items-center gap-2">
                          <span className={`inline-block h-2 w-2 rounded-full ${tItem.status === 'COMPLETED' || tItem.status === 'DONE' ? 'bg-emerald-500' : tItem.status === 'RUNNING' ? 'bg-blue-500' : 'bg-amber-500'}`} />
                          <span className="font-semibold text-slate-900 dark:text-slate-100">{tItem.title}</span>
                          <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                            {tItem.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-slate-500">
                          <span>Atanan: <strong>{assignee?.name || 'Unassigned'}</strong></span>
                          <span>Son T: <strong>{tItem.dueDate}</strong></span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Canned Responses Quick Bar */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-500" /> Insert Canned Macros
              </div>
              <div className="flex flex-wrap gap-2">
                {cannedResponses.map((canned) => (
                  <button
                    key={canned.id}
                    onClick={() => handleInsertCannedResponse(canned.content)}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  >
                    + {canned.title}
                  </button>
                ))}
              </div>
            </div>

            {/* Ticket Activity & Notes Timeline */}
            <div className="flex flex-1 flex-col rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
              <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Audit Trail & Customer Responses
              </h3>

              <div className="flex flex-1 flex-col gap-3 overflow-y-auto max-h-[300px] mb-4">
                {(!selectedCase?.notes || selectedCase.notes.length === 0) ? (
                  <div className="text-xs text-slate-400 italic">No notes or replies added yet.</div>
                ) : (
                  (selectedCase.notes || []).map((note) => (
                    <div
                      key={note.id}
                      className={`rounded-xl p-3 text-xs ${
                        note.isInternalOnly
                          ? 'border border-amber-200 bg-amber-50/60 dark:border-amber-900/40 dark:bg-amber-950/20'
                          : 'border border-indigo-100 bg-indigo-50/50 dark:border-indigo-900/40 dark:bg-indigo-950/20'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                          {note.isInternalOnly ? (
                            <Lock className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                          ) : (
                            <Eye className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
                          )}
                          {note.authorName}{' '}
                          <span className="text-[10px] font-normal text-slate-500">
                            ({note.isInternalOnly ? 'Internal Staff Note' : 'Public Reply'})
                          </span>
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(note.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
                        {note.content}
                      </p>
                    </div>
                  ))
                )}
              </div>

              {/* Add Note/Reply Box */}
              <form onSubmit={handleAddNote} className="flex flex-col gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <input
                      type="radio"
                      name="noteType"
                      checked={isInternalOnly}
                      onChange={() => setIsInternalOnly(true)}
                    />
                    <Lock className="h-3.5 w-3.5 text-amber-500" /> Internal Staff Note
                  </label>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <input
                      type="radio"
                      name="noteType"
                      checked={!isInternalOnly}
                      onChange={() => setIsInternalOnly(false)}
                    />
                    <Eye className="h-3.5 w-3.5 text-indigo-500" /> Public Response
                  </label>
                </div>

                <textarea
                  rows={2}
                  required
                  placeholder={
                    isInternalOnly
                      ? 'Add internal note visible ONLY to support team...'
                      : 'Draft public response sent to customer...'
                  }
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 focus:border-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 shadow-sm"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Submit Note
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 flex items-center justify-center rounded-2xl border border-dashed border-slate-300 p-12 text-slate-400 dark:border-slate-800">
            Select a case to manage resolution & notes
          </div>
        )}
      </div>

      {/* Modal: New Case */}
      {isNewCaseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-slate-100">
              Create Support Case
            </h2>
            <form onSubmit={handleCreateCase} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Subject / Summary
                </label>
                <input
                  type="text"
                  required
                  placeholder="Unable to integrate Webhook endpoint"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Contact
                  </label>
                  <select
                    value={contactId}
                    onChange={(e) => setContactId(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  >
                    {contacts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.firstName} {c.lastName} ({c.accountName || 'No Company'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    SLA Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as CaseItem['priority'])}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  >
                    <option value="LOW">Low (72h SLA)</option>
                    <option value="MEDIUM">Medium (24h SLA)</option>
                    <option value="HIGH">High (4h SLA)</option>
                    <option value="URGENT">Urgent (2h SLA)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Detailed Issue Description
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Customer experienced a 500 internal server error during OAuth callback..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="mt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsNewCaseOpen(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 shadow-sm"
                >
                  Save Case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal: New Case Task */}
      {isCaseTaskModalOpen && selectedCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Vakaya Yeni Görev Ekle (#{selectedCase.caseNumber})
              </h2>
              <button
                onClick={() => setIsCaseTaskModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCaseTask} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Görev Başlığı *</label>
                <input
                  type="text"
                  required
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Son Tarih *</label>
                  <input
                    type="date"
                    required
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Öncelik</label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as any)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                  >
                    <option value="LOW">Düşük</option>
                    <option value="MEDIUM">Orta</option>
                    <option value="HIGH">Yüksek</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Atanacak Personel *</label>
                <select
                  value={taskAssigneeId}
                  onChange={(e) => setTaskAssigneeId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCaseTaskModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-4 py-2 font-semibold text-white shadow-md hover:bg-indigo-700"
                >
                  Görevi Oluştur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Case Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(pendingDeleteCase)}
        title="Destek Talebi (Vaka) Silme Onayı"
        recordType="Destek Talebi"
        recordTitle={pendingDeleteCase ? `${pendingDeleteCase.caseNumber} - ${pendingDeleteCase.subject}` : ''}
        summaryItems={
          pendingDeleteCase
            ? [
                { label: 'Öncelik', value: pendingDeleteCase.priority },
                { label: 'SLA Durumu', value: pendingDeleteCase.slaStatus },
                { label: 'Açıklama', value: pendingDeleteCase.description },
              ]
            : []
        }
        onConfirm={() => {
          if (pendingDeleteCase) {
            deleteCase(pendingDeleteCase.id);
            const remaining = cases.filter((c) => c.id !== pendingDeleteCase.id);
            setSelectedCase(remaining[0] || null);
            setPendingDeleteCase(null);
          }
        }}
        onCancel={() => setPendingDeleteCase(null)}
      />
    </div>
  );
};
