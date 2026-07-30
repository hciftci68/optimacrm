import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import {
  X, Mail, Phone, Building, Tag, Send, Plus, Calendar, Kanban, Activity as ActivityIcon, Sparkles
} from 'lucide-react';
import { MessageChannel } from '../../types';
import { TemplateChooserModal } from '../common/TemplateChooserModal';

interface ContactDetailModalProps {
  contactId: string | null;
  onClose: () => void;
  onNavigateTab: (tab: any) => void;
}

export const ContactDetailModal: React.FC<ContactDetailModalProps> = ({
  contactId,
  onClose,
  onNavigateTab,
}) => {
  const {
    contacts,
    deals,
    activities,
    sendMessage,
    addTask,
    addActivity,
    currentUser,
    templates,
    t,
  } = useCRM();

  const [activeSubTab, setActiveSubTab] = useState<'timeline' | 'message' | 'task'>('timeline');

  // Quick Message state
  const [msgChannel, setMsgChannel] = useState<MessageChannel>('EMAIL');
  const [msgContent, setMsgContent] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

  // Quick Task state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('2026-07-28');

  // Quick Note state
  const [noteText, setNoteText] = useState('');

  if (!contactId) return null;

  const contact = contacts.find((c) => c.id === contactId);
  if (!contact) return null;

  const linkedDeals = deals.filter((d) => d.contactId === contactId);
  const contactActivities = activities.filter((a) => a.contactId === contactId);

  const handleApplyTemplate = (tmplId: string) => {
    setSelectedTemplateId(tmplId);
    const tmpl = templates.find((t) => t.id === tmplId);
    if (tmpl) {
      const rendered = tmpl.body
        .replace(/{{first_name}}/g, contact.firstName)
        .replace(/{{company}}/g, contact.accountName || 'your organization')
        .replace(/{{user_name}}/g, currentUser.name);
      setMsgContent(rendered);
      setMsgChannel(tmpl.channel);
    }
  };

  const handleSendMessageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgContent.trim()) return;

    sendMessage(contactId, msgChannel, msgContent, selectedTemplateId || undefined);
    setMsgContent('');
    setActiveSubTab('timeline');
  };

  const handleAddTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    addTask({
      title: taskTitle,
      dueDate: taskDueDate,
      status: 'OPEN',
      priority: 'MEDIUM',
      assigneeId: currentUser.id,
      linkedContactId: contactId,
      reminderScheduled: true,
    });

    setTaskTitle('');
    setActiveSubTab('timeline');
  };

  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    addActivity({
      type: 'NOTE',
      title: 'Note Added',
      description: noteText,
      contactId,
      userId: currentUser.id,
      userName: currentUser.name,
    });

    setNoteText('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="flex h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 font-bold text-white text-base">
              {contact.firstName.charAt(0)}{contact.lastName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {contact.firstName} {contact.lastName}
                </h2>
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
                  {contact.leadStatus}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {contact.jobTitle} {contact.accountName ? `at ${contact.accountName}` : ''}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body: Two Columns */}
        <div className="grid flex-1 grid-cols-1 overflow-hidden md:grid-cols-3">
          {/* Left Metadata Column */}
          <div className="border-b border-slate-200 bg-slate-50/60 p-5 space-y-5 md:border-b-0 md:border-r dark:border-slate-800 dark:bg-slate-900/50">
            {/* Quick Contact Actions */}
            <div className="space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Contact Details
              </div>
              <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-slate-400" />
                  <span className="truncate">{contact.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  <span>{contact.phone}</span>
                </div>
                {contact.accountName && (
                  <div className="flex items-center gap-2">
                    <Building className="h-3.5 w-3.5 text-slate-400" />
                    <span>{contact.accountName}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Tags */}
            <div>
              <div className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Tag className="h-3 w-3" /> Tags
              </div>
              <div className="flex flex-wrap gap-1">
                {(contact.tags || []).map((tg) => (
                  <span
                    key={tg}
                    className="rounded-md bg-white border border-slate-200 px-2 py-0.5 text-[10px] text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    {tg}
                  </span>
                ))}
              </div>
            </div>

            {/* Linked Deals */}
            <div>
              <div className="mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Kanban className="h-3 w-3" /> Linked Deals ({linkedDeals.length})
              </div>
              <div className="space-y-2">
                {linkedDeals.length === 0 ? (
                  <div className="text-[11px] text-slate-400 italic">No active deals linked</div>
                ) : (
                  linkedDeals.map((d) => (
                    <div
                      key={d.id}
                      className="rounded-xl border border-slate-200 bg-white p-2.5 text-xs dark:border-slate-800 dark:bg-slate-800"
                    >
                      <div className="font-bold text-slate-900 truncate dark:text-slate-100">
                        {d.title}
                      </div>
                      <div className="mt-1 flex justify-between text-[10px] text-slate-500">
                        <span>${d.amount.toLocaleString()} {d.currency}</span>
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400">{d.status}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Audit Metadata */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1 text-[10px] text-slate-400">
              <div className="font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Sistem Denetim Bilgileri (DB Audit)</div>
              <div><span className="font-semibold text-slate-600 dark:text-slate-300">Oluşturan:</span> {(contact as any).createdUser || 'Sistem / Admin'}</div>
              <div><span className="font-semibold text-slate-600 dark:text-slate-300">Oluşturulma:</span> {(contact as any).createdDateTime || contact.createdAt || '—'}</div>
              <div><span className="font-semibold text-slate-600 dark:text-slate-300">Son Güncelleyen:</span> {(contact as any).lastModifiedUser || '—'}</div>
              <div><span className="font-semibold text-slate-600 dark:text-slate-300">Son Güncelleme:</span> {(contact as any).lastModifiedDateTime || contact.updatedAt || '—'}</div>
            </div>
          </div>

          {/* Right Main Feed Column */}
          <div className="flex flex-col md:col-span-2 overflow-hidden p-5">
            {/* Sub-tab Selectors */}
            <div className="flex border-b border-slate-200 pb-3 gap-2 dark:border-slate-800">
              <button
                onClick={() => setActiveSubTab('timeline')}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold ${
                  activeSubTab === 'timeline'
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <ActivityIcon className="h-3.5 w-3.5" /> {t('activityTimeline')}
              </button>
              <button
                onClick={() => setActiveSubTab('message')}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold ${
                  activeSubTab === 'message'
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Send className="h-3.5 w-3.5" /> {t('sendMessage')}
              </button>
              <button
                onClick={() => setActiveSubTab('task')}
                className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold ${
                  activeSubTab === 'task'
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Plus className="h-3.5 w-3.5" /> {t('addTask')}
              </button>
            </div>

            {/* Sub-tab 1: Activity Timeline Feed */}
            {activeSubTab === 'timeline' && (
              <div className="flex-1 flex flex-col overflow-hidden pt-4">
                {/* Note Logger Input Box */}
                <form onSubmit={handleAddNoteSubmit} className="mb-4 flex gap-2">
                  <input
                    type="text"
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Log a quick meeting note or phone call detail..."
                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                  />
                  <button
                    type="submit"
                    className="rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
                  >
                    Log Note
                  </button>
                </form>

                <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                  {contactActivities.length === 0 ? (
                    <div className="py-12 text-center text-xs text-slate-400">
                      No activity history recorded for this contact yet.
                    </div>
                  ) : (
                    contactActivities.map((act) => (
                      <div
                        key={act.id}
                        className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-xs dark:border-slate-800 dark:bg-slate-800/40"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 dark:text-slate-100">
                            {act.title}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(act.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="mt-1 text-slate-600 dark:text-slate-300">{act.description}</p>
                        <div className="mt-1 text-[10px] text-slate-400">Log by {act.userName}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Sub-tab 2: Send Message */}
            {activeSubTab === 'message' && (
              <form onSubmit={handleSendMessageSubmit} className="flex-1 flex flex-col pt-4 space-y-3 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">{t('channel')}:</span>
                    <select
                      value={msgChannel}
                      onChange={(e) => setMsgChannel(e.target.value as MessageChannel)}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold outline-none dark:border-slate-700 dark:bg-slate-800"
                    >
                      <option value="EMAIL">Email</option>
                      <option value="SMS">SMS</option>
                      <option value="WHATSAPP">WhatsApp</option>
                    </select>
                  </div>

                  {/* Template Picker & Modal Trigger */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsTemplateModalOpen(true)}
                      className="flex items-center gap-1.5 rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700 border border-indigo-200 hover:bg-indigo-100 dark:bg-indigo-950 dark:border-indigo-800 dark:text-indigo-300 transition-colors shadow-2xs"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                      Choose Designed Template
                    </button>

                    <select
                      value={selectedTemplateId}
                      onChange={(e) => handleApplyTemplate(e.target.value)}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs outline-none dark:border-slate-700 dark:bg-slate-800"
                    >
                      <option value="">Quick Select...</option>
                      {templates.map((tmpl) => (
                        <option key={tmpl.id} value={tmpl.id}>
                          {tmpl.name} ({tmpl.channel})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <textarea
                  rows={6}
                  required
                  value={msgContent}
                  onChange={(e) => setMsgContent(e.target.value)}
                  placeholder={`Write ${msgChannel} message to ${contact.firstName}...`}
                  className="w-full flex-1 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                />

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700 shadow-xs"
                  >
                    <Send className="h-3.5 w-3.5" /> Dispatch Message
                  </button>
                </div>
              </form>
            )}

            {/* Sub-tab 3: Add Task */}
            {activeSubTab === 'task' && (
              <form onSubmit={handleAddTaskSubmit} className="pt-4 space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Task Title *</label>
                  <input
                    type="text"
                    required
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="e.g., Send follow-up proposal deck..."
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Due Date *</label>
                  <input
                    type="date"
                    required
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="rounded-xl bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700"
                  >
                    {t('addTask')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Template Chooser Modal */}
      <TemplateChooserModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        targetChannel={msgChannel}
        contact={contact}
        title={`Select Template for ${contact.firstName} ${contact.lastName}`}
        onSelectTemplate={(tmpl, renderedBody) => {
          setSelectedTemplateId(tmpl.id);
          setMsgChannel(tmpl.channel);
          setMsgContent(renderedBody);
        }}
      />
    </div>
  );
};
