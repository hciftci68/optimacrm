import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import {
  Plus, CheckSquare, Calendar, AlertCircle, Clock, User, X, Edit2, Trash2,
  FileText, Send, UserCheck, CheckCircle, Ban, MessageSquare, History, AlertTriangle, ChevronRight
} from 'lucide-react';
import { Task, TaskStatus } from '../../types';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';

interface TasksViewProps {
  onSelectContact: (id: string) => void;
  onSelectDeal: (id: string) => void;
}

export const TasksView: React.FC<TasksViewProps> = ({ onSelectContact, onSelectDeal }) => {
  const {
    tasks,
    contacts,
    deals,
    cases,
    users,
    currentUser,
    addTask,
    updateTask,
    deleteTask,
    addTaskWorkLog,
    reassignTask,
    cancelTask,
    updateTaskStatus,
    t
  } = useCRM();

  const [filterTab, setFilterTab] = useState<'ALL' | 'NEW' | 'RUNNING' | 'COMPLETED' | 'CANCELLED' | 'TODAY' | 'OVERDUE'>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [detailTask, setDetailTask] = useState<Task | null>(null);
  const [pendingDeleteTask, setPendingDeleteTask] = useState<Task | null>(null);

  // Work Log input inside modal
  const [workLogNote, setWorkLogNote] = useState('');
  const [reassignUserId, setReassignUserId] = useState('');

  // Add / Edit Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('2026-07-26');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [assigneeId, setAssigneeId] = useState(currentUser?.id || 'usr-1');
  const [linkedContactId, setLinkedContactId] = useState('');
  const [linkedDealId, setLinkedDealId] = useState('');
  const [linkedCaseId, setLinkedCaseId] = useState('');

  const todayStr = '2026-07-26';

  const isAdmin = currentUser?.role === 'ADMIN' || currentUser?.position === 'HEAD';

  // Active task object for Detail View (live sync with context)
  const activeDetailTask = detailTask ? tasks.find((t) => t.id === detailTask.id) || detailTask : null;

  const filteredTasks = tasks.filter((task) => {
    // Hide deleted tasks unless explicit admin view
    if (task.status === 'DELETED') return false;

    if (filterTab === 'NEW') return task.status === 'NEW' || task.status === 'OPEN';
    if (filterTab === 'RUNNING') return task.status === 'RUNNING';
    if (filterTab === 'COMPLETED') return task.status === 'COMPLETED' || task.status === 'DONE';
    if (filterTab === 'CANCELLED') return task.status === 'CANCELLED';
    if (filterTab === 'TODAY') return task.dueDate === todayStr;
    if (filterTab === 'OVERDUE') return task.dueDate < todayStr && task.status !== 'COMPLETED' && task.status !== 'DONE';

    return true;
  });

  const handleOpenAdd = () => {
    setEditingTask(null);
    setTitle('');
    setDescription('');
    setDueDate('2026-07-26');
    setPriority('MEDIUM');
    setAssigneeId(currentUser?.id || users[0]?.id || 'usr-1');
    setLinkedContactId('');
    setLinkedDealId('');
    setLinkedCaseId('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (task: Task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || '');
    setDueDate(task.dueDate || '2026-07-26');
    setPriority(task.priority || 'MEDIUM');
    setAssigneeId(task.assigneeId || 'usr-1');
    setLinkedContactId(task.linkedContactId || '');
    setLinkedDealId(task.linkedDealId || '');
    setLinkedCaseId(task.linkedCaseId || '');
    setIsAddModalOpen(true);
  };

  const handleTaskFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingTask) {
      updateTask(editingTask.id, {
        title,
        description,
        dueDate,
        priority,
        assigneeId,
        linkedContactId: linkedContactId || undefined,
        linkedDealId: linkedDealId || undefined,
        linkedCaseId: linkedCaseId || undefined,
      });
    } else {
      addTask({
        title,
        description,
        dueDate,
        status: 'NEW',
        priority,
        creatorId: currentUser?.id,
        assigneeId,
        linkedContactId: linkedContactId || undefined,
        linkedDealId: linkedDealId || undefined,
        linkedCaseId: linkedCaseId || undefined,
        workLogs: [],
      });
    }

    setTitle('');
    setDescription('');
    setIsAddModalOpen(false);
    setEditingTask(null);
  };

  const handleAddWorkLogSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDetailTask || !workLogNote.trim()) return;

    addTaskWorkLog(activeDetailTask.id, workLogNote.trim());
    setWorkLogNote('');
  };

  const handleReassignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDetailTask || !reassignUserId) return;

    reassignTask(activeDetailTask.id, reassignUserId);
    setReassignUserId('');
  };

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'NEW':
      case 'OPEN':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            <Clock className="h-3 w-3" /> YENİ
          </span>
        );
      case 'RUNNING':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" /> DEVAM EDİYOR
          </span>
        );
      case 'COMPLETED':
      case 'DONE':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
            <CheckCircle className="h-3 w-3" /> TAMAMLANDI
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-200 px-2.5 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-400">
            <Ban className="h-3 w-3" /> İPTAL EDİLDİ
          </span>
        );
      case 'DELETED':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-bold text-rose-700 dark:bg-rose-950 dark:text-rose-400">
            SİLİNDİ
          </span>
        );
      default:
        return null;
    }
  };

  // Helper permission checks for task actions
  const canEditTask = (task: Task) => {
    if (isAdmin) return true;
    const isCreator = task.creatorId === currentUser?.id;
    const isNew = task.status === 'NEW' || task.status === 'OPEN';
    const noLogs = !task.workLogs || task.workLogs.length === 0;
    return isCreator && isNew && noLogs;
  };

  const canCancelTask = (task: Task) => {
    if (task.status === 'CANCELLED' || task.status === 'COMPLETED' || task.status === 'DONE') return false;
    if (isAdmin) return true;
    const isCreator = task.creatorId === currentUser?.id;
    const isNew = task.status === 'NEW' || task.status === 'OPEN';
    const noLogs = !task.workLogs || task.workLogs.length === 0;
    return isCreator && isNew && noLogs;
  };

  const canDeleteTask = () => isAdmin;

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <CheckSquare className="h-6 w-6 text-indigo-600" />
            Görev Yaşam Döngüsü & İşlem Kayıtları
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Görev takibi, not girme (work logs), yönlendirme ve statü yaşam döngüsü yönetimi.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition"
        >
          <Plus className="h-4 w-4" /> Yeni Görev Tanımla
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3 dark:border-slate-800">
        {[
          { id: 'ALL', label: 'Tüm Görevler' },
          { id: 'NEW', label: 'Yeni (NEW)' },
          { id: 'RUNNING', label: 'Devam Edenler (RUNNING)' },
          { id: 'COMPLETED', label: 'Tamamlananlar (COMPLETED)' },
          { id: 'CANCELLED', label: 'İptal Edilenler' },
          { id: 'TODAY', label: 'Bugün Günü Gelenler' },
          { id: 'OVERDUE', label: 'Geciken Görevler' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterTab(tab.id as any)}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
              filterTab === tab.id
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tasks List Container */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-xs text-slate-400 dark:border-slate-800 dark:bg-slate-900">
            Seçilen filtre kriterine uygun görev bulunamadı.
          </div>
        ) : (
          filteredTasks.map((task) => {
            const contact = contacts.find((c) => c.id === task.linkedContactId);
            const deal = deals.find((d) => d.id === task.linkedDealId);
            const assignee = users.find((u) => u.id === task.assigneeId);
            const creator = users.find((u) => u.id === task.creatorId);
            const workLogsCount = task.workLogs?.length || 0;

            return (
              <div
                key={task.id}
                className="flex flex-col md:flex-row md:items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs transition-all hover:border-indigo-300 gap-4 dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div className="pt-0.5">{getStatusBadge(task.status)}</div>

                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setDetailTask(task)}
                        className={`text-sm font-bold text-slate-900 text-left hover:text-indigo-600 dark:text-slate-100 dark:hover:text-indigo-400 truncate ${
                          task.status === 'COMPLETED' || task.status === 'DONE'
                            ? 'line-through text-slate-400 dark:text-slate-500'
                            : ''
                        }`}
                      >
                        {task.title}
                      </button>

                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          task.priority === 'HIGH'
                            ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                            : task.priority === 'MEDIUM'
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {task.priority === 'HIGH' ? 'YÜKSEK' : task.priority === 'MEDIUM' ? 'ORTA' : 'DÜŞÜK'}
                      </span>
                    </div>

                    {task.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                        {task.description}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1 font-medium text-slate-600 dark:text-slate-300">
                        <Calendar className="h-3 w-3 text-indigo-500" /> Son Tarih: {task.dueDate}
                      </span>

                      {assignee && (
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3 text-slate-400" /> Atanan: <strong className="text-slate-700 dark:text-slate-200">{assignee.name}</strong>
                        </span>
                      )}

                      {creator && (
                        <span className="text-slate-400">
                          Oluşturan: {creator.name}
                        </span>
                      )}

                      {contact && (
                        <span>
                          İlgili Kişi:{' '}
                          <button
                            onClick={() => onSelectContact(contact.id)}
                            className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                          >
                            {contact.firstName} {contact.lastName}
                          </button>
                        </span>
                      )}

                      {deal && (
                        <span>
                          İlgili Fırsat:{' '}
                          <button
                            onClick={() => onSelectDeal(deal.id)}
                            className="font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                          >
                            {deal.title}
                          </button>
                        </span>
                      )}

                      {workLogsCount > 0 && (
                        <span className="inline-flex items-center gap-1 text-indigo-600 font-bold bg-indigo-50 dark:bg-indigo-950/60 dark:text-indigo-300 px-2 py-0.5 rounded-full text-[10px]">
                          <MessageSquare className="h-3 w-3" /> {workLogsCount} İşlem Kaydı
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center gap-1.5 shrink-0 self-end md:self-center">
                  <button
                    onClick={() => setDetailTask(task)}
                    className="flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    <FileText className="h-3.5 w-3.5 text-indigo-500" /> Detay & Kayıtlar
                  </button>

                  {task.status !== 'COMPLETED' && task.status !== 'DONE' && task.status !== 'CANCELLED' && (
                    <button
                      onClick={() => updateTaskStatus(task.id, 'COMPLETED')}
                      className="rounded-xl bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300"
                      title="Görevi Tamamlandı Olarak İşaretle"
                    >
                      Tamamla
                    </button>
                  )}

                  {canEditTask(task) && (
                    <button
                      onClick={() => handleOpenEdit(task)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950"
                      title="Görevi Düzenle"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  )}

                  {canCancelTask(task) && (
                    <button
                      onClick={() => cancelTask(task.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Görevi İptal Et"
                    >
                      <Ban className="h-4 w-4" />
                    </button>
                  )}

                  {canDeleteTask() && (
                    <button
                      onClick={() => setPendingDeleteTask(task)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950"
                      title="Görevi Sil (Admin)"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* TASK DETAIL & WORK LOG DRAWER / MODAL */}
      {activeDetailTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden dark:border-slate-800 dark:bg-slate-900">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
              <div className="flex items-center gap-3">
                {getStatusBadge(activeDetailTask.status)}
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                  {activeDetailTask.title}
                </h2>
              </div>
              <button
                onClick={() => setDetailTask(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Task Details Info Card */}
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 dark:bg-slate-800/60 dark:border-slate-800 space-y-3">
                {activeDetailTask.description && (
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Görev Açıklaması</span>
                    <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">
                      {activeDetailTask.description}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs border-t border-slate-200/60 pt-3 dark:border-slate-700/60">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Atanan Personel</span>
                    <strong className="text-slate-800 dark:text-slate-200 font-semibold">
                      {users.find((u) => u.id === activeDetailTask.assigneeId)?.name || 'Belirtilmedi'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Görevi Oluşturan</span>
                    <strong className="text-slate-800 dark:text-slate-200 font-semibold">
                      {users.find((u) => u.id === activeDetailTask.creatorId)?.name || 'Sistem'}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Son Tarih</span>
                    <strong className="text-slate-800 dark:text-slate-200 font-semibold">
                      {activeDetailTask.dueDate}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Öncelik</span>
                    <strong className="text-indigo-600 dark:text-indigo-400 font-semibold">
                      {activeDetailTask.priority}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Task Reassign & Status Control Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-indigo-100 bg-indigo-50/50 p-3.5 dark:border-indigo-950/60 dark:bg-indigo-950/30">
                <form onSubmit={handleReassignSubmit} className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-indigo-600" />
                  <span className="text-xs font-semibold text-indigo-950 dark:text-indigo-200">Başkasına Yönlendir:</span>
                  <select
                    value={reassignUserId}
                    onChange={(e) => setReassignUserId(e.target.value)}
                    className="rounded-lg border border-indigo-200 bg-white px-2.5 py-1 text-xs outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    <option value="">Kullanıcı Seçiniz</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="submit"
                    disabled={!reassignUserId}
                    className="rounded-lg bg-indigo-600 px-3 py-1 text-xs font-semibold text-white disabled:opacity-50 hover:bg-indigo-700"
                  >
                    Atamayı Değiştir
                  </button>
                </form>

                <div className="flex items-center gap-2">
                  {activeDetailTask.status !== 'COMPLETED' && activeDetailTask.status !== 'DONE' && (
                    <button
                      onClick={() => updateTaskStatus(activeDetailTask.id, 'COMPLETED')}
                      className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                    >
                      <CheckCircle className="h-3.5 w-3.5" /> Görevi Tamamla
                    </button>
                  )}

                  {canCancelTask(activeDetailTask) && (
                    <button
                      onClick={() => cancelTask(activeDetailTask.id)}
                      className="flex items-center gap-1 rounded-lg bg-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300"
                    >
                      <Ban className="h-3.5 w-3.5" /> Görevi İptal Et
                    </button>
                  )}
                </div>
              </div>

              {/* Work Logs Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <History className="h-4 w-4 text-indigo-600" />
                  İşlem Kayıtları & İlerleme Notları ({activeDetailTask.workLogs?.length || 0})
                </h3>

                {/* Log timeline */}
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {!activeDetailTask.workLogs || activeDetailTask.workLogs.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-400 dark:border-slate-800">
                      Henüz işlem kaydı girilmedi. Aşağıdaki form ile not ekleyebilirsiniz (statü otomatik RUNNING olacaktır).
                    </div>
                  ) : (
                    activeDetailTask.workLogs.map((log) => (
                      <div
                        key={log.id}
                        className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xs dark:border-slate-800 dark:bg-slate-800/80"
                      >
                        <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                          <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 text-indigo-500" /> {log.userName}
                          </span>
                          <span className="text-[10px]">
                            {new Date(log.timestamp).toLocaleString('tr-TR')}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line">
                          {log.note}
                        </p>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Work Log Form */}
                <form onSubmit={handleAddWorkLogSubmit} className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <MessageSquare className="h-4 w-4 text-indigo-600" /> Yeni İşlem Kaydı / İlerleme Notu Ekle
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={workLogNote}
                    onChange={(e) => setWorkLogNote(e.target.value)}
                    placeholder="Görev üzerinde yapılan işlemi veya açıklamayı yazın... (Not kaydedildiğinde statü otomatik olarak DEVAM EDİYOR olur)"
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-slate-400 italic">
                      * Not girildiğinde görev durumu RUNNING olarak güncellenir.
                    </span>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-indigo-700"
                    >
                      <Send className="h-3.5 w-3.5" /> Notu Kaydet (RUNNING Yap)
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT TASK MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {editingTask ? 'Görevi Düzenle' : 'Yeni Görev Tanımla (NEW)'}
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleTaskFormSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Görev Başlığı *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Örn: Teklif sözleşmesi revizyonu tamamlanacak"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Açıklama</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Atanan personel için detaylı görev açıklaması..."
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Son Tarih (Due Date) *</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Öncelik Derecesi</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                  >
                    <option value="LOW font-semibold">Düşük (Low)</option>
                    <option value="MEDIUM">Orta (Medium)</option>
                    <option value="HIGH">Yüksek (High)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Atanacak Personel *</label>
                <select
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                >
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Müşteri Bağlantısı</label>
                  <select
                    value={linkedContactId}
                    onChange={(e) => setLinkedContactId(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                  >
                    <option value="">Yok</option>
                    {contacts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.firstName} {c.lastName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Fırsat Bağlantısı</label>
                  <select
                    value={linkedDealId}
                    onChange={(e) => setLinkedDealId(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                  >
                    <option value="">Yok</option>
                    {deals.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Destek Vakası (Case)</label>
                  <select
                    value={linkedCaseId}
                    onChange={(e) => setLinkedCaseId(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                  >
                    <option value="">Yok</option>
                    {cases.map((cs) => (
                      <option key={cs.id} value={cs.id}>
                        #{cs.caseNumber} - {cs.subject.substring(0, 20)}...
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-4 py-2 font-semibold text-white shadow-md hover:bg-indigo-700"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Task Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(pendingDeleteTask)}
        title="Görev Silme Onayı (Admin)"
        recordType="Görev"
        recordTitle={pendingDeleteTask ? pendingDeleteTask.title : ''}
        summaryItems={
          pendingDeleteTask
            ? [
                { label: 'Son Tarih', value: pendingDeleteTask.dueDate || 'Belirtilmedi' },
                { label: 'Öncelik', value: pendingDeleteTask.priority },
                { label: 'Açıklama', value: pendingDeleteTask.description || 'Açıklama yok' },
              ]
            : []
        }
        onConfirm={() => {
          if (pendingDeleteTask) {
            deleteTask(pendingDeleteTask.id);
            setPendingDeleteTask(null);
          }
        }}
        onCancel={() => setPendingDeleteTask(null)}
      />
    </div>
  );
};
