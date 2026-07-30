import React, { useState, useMemo } from 'react';
import { useCRM } from '../../context/CRMContext';
import { MessageTemplate, MessageChannel, Contact, Deal } from '../../types';
import { renderTemplatePlaceholders } from '../../utils/templateUtils';
import {
  FileCode, Search, Filter, CheckCircle2, Sparkles, X, Mail, Phone, MessageSquare,
  Globe, Tag, Eye, ArrowRight, Layers
} from 'lucide-react';

export { renderTemplatePlaceholders };

export interface TemplateChooserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: MessageTemplate, renderedBody: string, renderedSubject: string) => void;
  targetChannel?: MessageChannel;
  contact?: Contact | null;
  deal?: Deal | null;
  title?: string;
}

export const TemplateChooserModal: React.FC<TemplateChooserModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
  targetChannel,
  contact,
  deal,
  title = 'Choose Designed Message Template',
}) => {
  const { templates, currentUser, currentTenant } = useCRM();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<string>(targetChannel || 'ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(templates[0]?.id || null);

  const filteredTemplates = useMemo(() => {
    return templates.filter((tmpl) => {
      // Channel match
      if (selectedChannel !== 'ALL' && tmpl.channel !== selectedChannel) {
        return false;
      }
      // Category match
      if (selectedCategory !== 'ALL' && tmpl.category !== selectedCategory) {
        return false;
      }
      // Search match
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = tmpl.name.toLowerCase().includes(query);
        const matchesSubject = tmpl.subject?.toLowerCase().includes(query);
        const matchesBody = tmpl.body.toLowerCase().includes(query);
        const matchesCat = tmpl.category?.toLowerCase().includes(query);
        if (!matchesName && !matchesSubject && !matchesBody && !matchesCat) {
          return false;
        }
      }
      return true;
    });
  }, [templates, selectedChannel, selectedCategory, searchQuery]);

  const activePreviewTemplate = useMemo(() => {
    return templates.find((t) => t.id === previewTemplateId) || filteredTemplates[0] || templates[0];
  }, [templates, previewTemplateId, filteredTemplates]);

  if (!isOpen) return null;

  const handleConfirmSelect = (tmpl: MessageTemplate) => {
    const renderedBody = renderTemplatePlaceholders(
      tmpl.body,
      contact,
      deal,
      currentUser?.name,
      currentTenant?.name
    );
    const renderedSubject = renderTemplatePlaceholders(
      tmpl.subject || tmpl.name,
      contact,
      deal,
      currentUser?.name,
      currentTenant?.name
    );
    onSelectTemplate(tmpl, renderedBody, renderedSubject);
    onClose();
  };

  const getChannelBadge = (ch: MessageChannel) => {
    switch (ch) {
      case 'EMAIL':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800 dark:bg-blue-950 dark:text-blue-300">
            <Mail className="h-3 w-3" /> EMAIL
          </span>
        );
      case 'SMS':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-800 dark:bg-purple-950 dark:text-purple-300">
            <Phone className="h-3 w-3" /> SMS
          </span>
        );
      case 'WHATSAPP':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            <MessageSquare className="h-3 w-3" /> WHATSAPP
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <Globe className="h-3 w-3" /> {ch}
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="flex h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200/80 px-6 py-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                {title}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Select from {templates.length} designed pre-approved email, SMS, and WhatsApp templates with dynamic field mapping.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50/70 px-6 py-3 dark:border-slate-800 dark:bg-slate-800/40">
          <div className="flex flex-1 items-center gap-2 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates by title, subject or content..."
                className="w-full rounded-xl border border-slate-200/80 bg-white py-1.5 pl-9 pr-3 text-xs text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <Filter className="h-3.5 w-3.5" /> Channel:
            </div>
            <select
              value={selectedChannel}
              onChange={(e) => setSelectedChannel(e.target.value)}
              className="rounded-xl border border-slate-200/80 bg-white px-2.5 py-1 text-xs font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <option value="ALL">All Channels</option>
              <option value="EMAIL">Email</option>
              <option value="SMS">SMS</option>
              <option value="WHATSAPP">WhatsApp</option>
              <option value="FACEBOOK">Facebook</option>
              <option value="INSTAGRAM">Instagram</option>
            </select>

            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 ml-2">
              <Layers className="h-3.5 w-3.5" /> Category:
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-xl border border-slate-200/80 bg-white px-2.5 py-1 text-xs font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <option value="ALL">All Categories</option>
              <option value="PROMOTIONAL">Promotional</option>
              <option value="TRANSACTIONAL">Transactional</option>
              <option value="ONBOARDING">Onboarding</option>
              <option value="NEWSLETTER">Newsletter</option>
              <option value="FOLLOW_UP">Follow Up</option>
              <option value="CUSTOM">Custom</option>
            </select>
          </div>
        </div>

        {/* Modal Split View */}
        <div className="grid flex-1 grid-cols-1 overflow-hidden md:grid-cols-12">
          {/* Template List Column */}
          <div className="md:col-span-5 border-r border-slate-200/80 flex flex-col overflow-y-auto dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
            {filteredTemplates.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No message templates match your filter criteria.
              </div>
            ) : (
              filteredTemplates.map((tmpl) => {
                const isSelected = activePreviewTemplate?.id === tmpl.id;
                return (
                  <div
                    key={tmpl.id}
                    onClick={() => setPreviewTemplateId(tmpl.id)}
                    className={`cursor-pointer p-4 transition-colors ${
                      isSelected
                        ? 'bg-indigo-50/80 dark:bg-indigo-950/40 border-l-4 border-indigo-600'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        {getChannelBadge(tmpl.channel)}
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                          {tmpl.category || 'CUSTOM'}
                        </span>
                      </div>
                      <span className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" /> {tmpl.status}
                      </span>
                    </div>

                    <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">
                      {tmpl.name}
                    </h4>

                    {tmpl.subject && (
                      <div className="text-[11px] text-slate-500 font-medium truncate mt-0.5 dark:text-slate-400">
                        Subject: {tmpl.subject}
                      </div>
                    )}

                    <p className="mt-1 text-xs text-slate-400 line-clamp-2">
                      {tmpl.body.replace(/<[^>]*>?/gm, '')}
                    </p>

                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[10px] text-indigo-600 font-semibold dark:text-indigo-400">
                        Click to preview
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleConfirmSelect(tmpl);
                        }}
                        className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1 text-xs font-bold text-white hover:bg-indigo-700 shadow-2xs"
                      >
                        Use Template <ArrowRight className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Template Live Preview Column */}
          <div className="md:col-span-7 flex flex-col overflow-y-auto bg-slate-50/50 p-6 dark:bg-slate-950/40 space-y-4">
            {activePreviewTemplate ? (
              <>
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-3 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-indigo-600" />
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      Live Preview & Variable Binding
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    {getChannelBadge(activePreviewTemplate.channel)}
                    <button
                      onClick={() => handleConfirmSelect(activePreviewTemplate)}
                      className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 shadow-xs transition-all"
                    >
                      <Sparkles className="h-3.5 w-3.5" /> Use This Template
                    </button>
                  </div>
                </div>

                {/* Subject Header if exists */}
                {activePreviewTemplate.subject && (
                  <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 dark:border-slate-800 dark:bg-slate-900 space-y-1 shadow-2xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Rendered Subject Line:
                    </span>
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {renderTemplatePlaceholders(
                        activePreviewTemplate.subject,
                        contact,
                        deal,
                        currentUser?.name,
                        currentTenant?.name
                      )}
                    </p>
                  </div>
                )}

                {/* Body Render Box */}
                <div className="flex-1 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Rendered Message Body ({contact ? `For ${contact.firstName} ${contact.lastName}` : 'Sample Context'}):
                    </span>
                    <span className="text-[10px] font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-md">
                      Variables Merged
                    </span>
                  </div>

                  {activePreviewTemplate.body.includes('<div') || activePreviewTemplate.body.includes('<p') ? (
                    <div
                      className="text-xs text-slate-800 dark:text-slate-200 max-h-[300px] overflow-y-auto leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: renderTemplatePlaceholders(
                          activePreviewTemplate.body,
                          contact,
                          deal,
                          currentUser?.name,
                          currentTenant?.name
                        ),
                      }}
                    />
                  ) : (
                    <div className="text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap max-h-[300px] overflow-y-auto leading-relaxed font-sans">
                      {renderTemplatePlaceholders(
                        activePreviewTemplate.body,
                        contact,
                        deal,
                        currentUser?.name,
                        currentTenant?.name
                      )}
                    </div>
                  )}
                </div>

                {/* Variable Mapping Legend */}
                <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-3.5 text-xs text-indigo-900 dark:border-indigo-900/50 dark:bg-indigo-950/30 dark:text-indigo-300 space-y-1.5">
                  <span className="font-bold text-[11px] flex items-center gap-1.5">
                    <Tag className="h-3.5 w-3.5 text-indigo-600" /> Automatically Mapped Dynamic Tags
                  </span>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] font-mono opacity-90">
                    <div>{`{{contact.firstName}}`} &rarr; {contact?.firstName || 'Valued'}</div>
                    <div>{`{{contact.company}}`} &rarr; {contact?.accountName || 'Acme Inc'}</div>
                    <div>{`{{user.name}}`} &rarr; {currentUser?.name || 'Sales Manager'}</div>
                    <div>{`{{tenant.name}}`} &rarr; {currentTenant?.name || 'Acme Cloud'}</div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center text-xs text-slate-400">
                Select a template from the list to preview content.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
