import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { MessageChannel } from '../../types';
import {
  MessageSquare, Mail, Phone, Send, Check, CheckCheck, Clock, FileText, User, Sparkles, AlertCircle
} from 'lucide-react';
import { TemplateChooserModal } from '../common/TemplateChooserModal';

export const OmnichannelInbox: React.FC = () => {
  const {
    threads,
    messages,
    contacts,
    templates,
    currentUser,
    sendMessage,
    t,
  } = useCRM();

  const [activeThreadId, setActiveThreadId] = useState<string>(threads[0]?.id || '');
  const [composerChannel, setComposerChannel] = useState<MessageChannel>('EMAIL');
  const [composerContent, setComposerContent] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

  const activeThread = threads.find((th) => th.id === activeThreadId) || threads[0];
  const activeContact = activeThread ? contacts.find((c) => c.id === activeThread.contactId) : null;
  const threadMessages = activeThread
    ? messages.filter((m) => m.threadId === activeThread.id)
    : [];

  const handleApplyTemplate = (tmplId: string) => {
    setSelectedTemplateId(tmplId);
    const tmpl = templates.find((t) => t.id === tmplId);
    if (tmpl && activeContact) {
      const rendered = tmpl.body
        .replace(/\{\{first_name\}\}/g, activeContact.firstName)
        .replace(/\{\{company\}\}/g, activeContact.accountName || 'your organization')
        .replace(/\{\{user_name\}\}/g, currentUser.name);
      setComposerContent(rendered);
      setComposerChannel(tmpl.channel);
    }
  };

  const handleSendMessageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!composerContent.trim() || !activeThread) return;

    sendMessage(
      activeThread.contactId,
      composerChannel,
      composerContent,
      selectedTemplateId || undefined
    );

    setComposerContent('');
  };

  const getChannelBadge = (ch: MessageChannel) => {
    if (ch === 'EMAIL')
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-950/60 dark:text-blue-400">
          <Mail className="h-3 w-3" /> Email
        </span>
      );
    if (ch === 'SMS')
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-1.5 py-0.5 text-[10px] font-semibold text-purple-700 dark:bg-purple-950/60 dark:text-purple-400">
          <Phone className="h-3 w-3" /> SMS
        </span>
      );
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
        <MessageSquare className="h-3 w-3" /> WhatsApp
      </span>
    );
  };

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-7xl mx-auto h-[calc(100vh-5rem)] flex flex-col">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          {t('inbox')}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Unified conversation thread across Email, SMS, and WhatsApp Cloud channels.
        </p>
      </div>

      {/* Main Split Layout */}
      <div className="flex-1 flex overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        {/* Left Thread List Column */}
        <div className="w-80 border-r border-slate-200 flex flex-col dark:border-slate-800">
          <div className="border-b border-slate-100 p-3 text-xs font-bold text-slate-500 uppercase tracking-wider dark:border-slate-800">
            Conversations ({threads.length})
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
            {threads.map((th) => {
              const isSelected = th.id === activeThreadId;
              return (
                <button
                  key={th.id}
                  onClick={() => setActiveThreadId(th.id)}
                  className={`flex w-full flex-col gap-1 p-3.5 text-left transition-colors ${
                    isSelected
                      ? 'bg-indigo-50/70 dark:bg-indigo-950/40'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                      {th.contactName}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(th.lastMessageTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 truncate dark:text-slate-400">
                    {th.lastMessageSnippet}
                  </p>

                  <div className="mt-1 flex items-center justify-between">
                    {getChannelBadge(th.lastChannel)}
                    {th.unreadCount > 0 && (
                      <span className="rounded-full bg-indigo-600 px-1.5 py-0.5 text-[9px] font-bold text-white">
                        {th.unreadCount} new
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Active Thread Column */}
        {activeThread ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Thread Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-3.5 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 font-bold text-white text-xs">
                  {activeThread.contactName.charAt(0)}
                </div>
                <div>
                  <h2 className="font-bold text-xs text-slate-900 dark:text-slate-100">
                    {activeThread.contactName}
                  </h2>
                  <p className="text-[11px] text-slate-400">
                    {activeThread.contactEmail} • {activeThread.contactPhone}
                  </p>
                </div>
              </div>

              {getChannelBadge(activeThread.lastChannel)}
            </div>

            {/* Conversation Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/40 dark:bg-slate-900/30">
              {threadMessages.map((msg) => {
                const isOutbound = msg.direction === 'OUTBOUND';

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col max-w-lg ${
                      isOutbound ? 'ml-auto items-end' : 'mr-auto items-start'
                    }`}
                  >
                    <div
                      className={`rounded-2xl p-3.5 text-xs shadow-2xs ${
                        isOutbound
                          ? 'bg-indigo-600 text-white rounded-tr-xs'
                          : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>

                    <div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-400 px-1">
                      <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <span>•</span>
                      <span>{msg.channel}</span>
                      {isOutbound && (
                        <span className="flex items-center gap-1 font-bold">
                          {msg.status === 'FAILED' ? (
                            <span className="flex items-center gap-1 text-red-500 bg-red-50 dark:bg-red-950/60 px-1.5 py-0.5 rounded-md text-[9px] font-bold">
                              <AlertCircle className="h-3 w-3" /> Not Delivered / Failed
                            </span>
                          ) : msg.status === 'READ' ? (
                            <span className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400">
                              <CheckCheck className="h-3.5 w-3.5" /> Read
                            </span>
                          ) : msg.status === 'DELIVERED' ? (
                            <span className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400">
                              <CheckCheck className="h-3.5 w-3.5" /> Delivered
                            </span>
                          ) : (
                            <span className="flex items-center gap-0.5 text-indigo-500">
                              <Check className="h-3 w-3" /> Sent
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Message Composer Bar */}
            <form
              onSubmit={handleSendMessageSubmit}
              className="border-t border-slate-200 p-4 space-y-3 bg-white dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-600 dark:text-slate-400">Channel:</span>
                  <select
                    value={composerChannel}
                    onChange={(e) => setComposerChannel(e.target.value as MessageChannel)}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 font-semibold outline-none dark:border-slate-700 dark:bg-slate-800"
                  >
                    <option value="EMAIL">Email</option>
                    <option value="SMS">SMS</option>
                    <option value="WHATSAPP">WhatsApp</option>
                  </select>
                </div>

                {/* Template Selector & Modal Trigger */}
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
                    className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 outline-none dark:border-slate-700 dark:bg-slate-800 text-xs"
                  >
                    <option value="">Quick Select Template...</option>
                    {templates.map((tmpl) => (
                      <option key={tmpl.id} value={tmpl.id}>
                        {tmpl.name} ({tmpl.channel})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                <textarea
                  rows={2}
                  required
                  value={composerContent}
                  onChange={(e) => setComposerContent(e.target.value)}
                  placeholder={`Write ${composerChannel} response to ${activeThread.contactName}...`}
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                />

                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 font-semibold text-white shadow-md hover:bg-indigo-700"
                >
                  <Send className="h-4 w-4" /> Send
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-xs text-slate-400">
            Select a conversation thread on the left.
          </div>
        )}
      </div>

      {/* Template Chooser Modal */}
      <TemplateChooserModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        targetChannel={composerChannel}
        contact={activeContact}
        onSelectTemplate={(tmpl, renderedBody) => {
          setSelectedTemplateId(tmpl.id);
          setComposerChannel(tmpl.channel);
          setComposerContent(renderedBody);
        }}
      />
    </div>
  );
};
