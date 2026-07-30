import React, { useState, useRef } from 'react';
import { useCRM } from '../../context/CRMContext';
import {
  FileCode, Plus, Copy, Trash2, Edit3, Eye, Upload, Send, Sparkles, Check,
  Search, Filter, Smartphone, Monitor, AlertCircle, Code, Layers, FileText,
  CheckCircle2, RefreshCw, X, Tag
} from 'lucide-react';
import { MessageTemplate, MessageChannel } from '../../types';

// Starter HTML Templates Library
const STARTER_HTML_TEMPLATES = [
  {
    id: 'starter-welcome',
    name: 'Welcome & Onboarding (Responsive)',
    category: 'ONBOARDING' as const,
    subject: 'Welcome to {{tenant.name}}, {{contact.firstName}}!',
    description: 'Modern welcome email with hero banner, feature bullet points, and CTA button.',
    body: `<div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
  <div style="background-color: #4f46e5; padding: 32px 24px; text-align: center; color: #ffffff;">
    <h1 style="margin: 0; font-size: 24px; font-weight: bold;">Welcome aboard, {{contact.firstName}}!</h1>
    <p style="margin-top: 8px; font-size: 14px; opacity: 0.9;">We're excited to partner with {{contact.company}}</p>
  </div>
  <div style="padding: 28px 24px; color: #334155; line-height: 1.6;">
    <p style="font-size: 16px;">Hi {{contact.firstName}},</p>
    <p>Thank you for joining {{tenant.name}}. Our team is here to help {{contact.company}} achieve seamless operations and maximum growth.</p>
    <div style="background-color: #f8fafc; border-left: 4px solid #4f46e5; padding: 16px; margin: 20px 0; border-radius: 4px;">
      <strong>Account Manager:</strong> {{user.name}} (<a href="mailto:{{user.email}}" style="color: #4f46e5;">{{user.email}}</a>)
    </div>
    <div style="text-align: center; margin: 28px 0;">
      <a href="https://acmecloud.com/onboarding" style="background-color: #4f46e5; color: #ffffff; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">Get Started Now &rarr;</a>
    </div>
    <p style="font-size: 13px; color: #64748b;">Best regards,<br>The {{tenant.name}} Team</p>
  </div>
</div>`,
  },
  {
    id: 'starter-newsletter',
    name: 'Product Update & Newsletter',
    category: 'NEWSLETTER' as const,
    subject: 'What is new in {{tenant.name}} for {{contact.company}}',
    description: '2-column layout with feature update cards and release highlights.',
    body: `<div style="max-width: 600px; margin: 0 auto; font-family: Helvetica, sans-serif; background-color: #f8fafc; padding: 20px;">
  <div style="background-color: #ffffff; border-radius: 16px; padding: 24px; border: 1px solid #cbd5e1;">
    <h2 style="color: #0f172a; margin-top: 0;">🚀 {{tenant.name}} Q3 Product Highlights</h2>
    <p style="color: #475569; font-size: 14px;">Hello {{contact.firstName}} {{contact.lastName}},</p>
    <p style="color: #475569; font-size: 14px;">Here are the top AI features and performance improvements shipped this month for teams like {{contact.company}}:</p>

    <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 12px; background: #faf5ff;">
      <h3 style="color: #7e22ce; margin: 0 0 8px 0; font-size: 16px;">✨ Brevo SDK & Automated Multi-Channel Mailers</h3>
      <p style="margin: 0; color: #581c87; font-size: 13px;">High-deliverability email engines with real-time template personalization and instant metrics.</p>
    </div>

    <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 12px; background: #f0fdf4;">
      <h3 style="color: #15803d; margin: 0 0 8px 0; font-size: 16px;">⚡ Meta & TikTok Lead Ad Webhook Ingestion</h3>
      <p style="margin: 0; color: #166534; font-size: 13px;">Ingest prospects instantly from social lead forms directly into your CRM pipelines.</p>
    </div>

    <div style="text-align: center; margin-top: 24px;">
      <a href="https://acmecloud.com/updates" style="background-color: #0f172a; color: #ffffff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: bold;">View Full Changelog</a>
    </div>
  </div>
</div>`,
  },
  {
    id: 'starter-proposal',
    name: 'Deal Proposal Follow-up',
    category: 'FOLLOW_UP' as const,
    subject: 'Following up on {{deal.title}} for {{contact.company}}',
    description: 'Personalized letter style template linking deal terms and proposal details.',
    body: `<div style="max-width: 600px; margin: 0 auto; font-family: Georgia, serif; color: #1e293b; line-height: 1.7; padding: 24px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px;">
  <p style="font-size: 16px;">Dear {{contact.firstName}},</p>

  <p>I hope this email finds you well. I wanted to follow up on our recent discussion regarding <strong>{{deal.title}}</strong> for {{contact.company}}.</p>

  <div style="background-color: #f1f5f9; padding: 16px; border-radius: 8px; margin: 20px 0; font-family: sans-serif; font-size: 13px;">
    <div style="margin-bottom: 6px;"><strong>Opportunity:</strong> {{deal.title}}</div>
    <div style="margin-bottom: 6px;"><strong>Projected Value:</strong> $ {{deal.amount}}</div>
    <div><strong>Target Close Date:</strong> {{deal.expectedCloseDate}}</div>
  </div>

  <p>Please review the attached contract proposal when convenient. If you have any questions or require revisions to the scope, feel free to reply directly to this email.</p>

  <p style="margin-top: 30px;">Warm regards,</p>
  <p><strong>{{user.name}}</strong><br><span style="color: #64748b; font-size: 13px;">{{tenant.name}}</span><br><a href="mailto:{{user.email}}" style="color: #4f46e5;">{{user.email}}</a></p>
</div>`,
  },
  {
    id: 'starter-invoice',
    name: 'Order Confirmation & Receipt',
    category: 'TRANSACTIONAL' as const,
    subject: 'Order Receipt #{{order.number}} - {{tenant.name}}',
    description: 'Clean invoice layout with customer summary and itemized cost calculations.',
    body: `<div style="max-width: 600px; margin: 0 auto; font-family: sans-serif; color: #0f172a; padding: 24px; border: 1px solid #cbd5e1; border-radius: 12px; background: #ffffff;">
  <div style="display: flex; justify-content: space-between; border-b: 2px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 20px;">
    <h2 style="margin: 0; color: #4f46e5;">{{tenant.name}}</h2>
    <span style="font-size: 14px; font-weight: bold; color: #64748b;">RECEIPT #{{order.number}}</span>
  </div>

  <p style="font-size: 14px;">Billed To: <strong>{{contact.firstName}} {{contact.lastName}}</strong> ({{contact.company}})</p>
  <p style="font-size: 14px;">Email: {{contact.email}} | Phone: {{contact.phone}}</p>

  <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px;">
    <thead>
      <tr style="background: #f8fafc; border-bottom: 2px solid #cbd5e1; text-align: left;">
        <th style="padding: 8px;">Description</th>
        <th style="padding: 8px; text-align: right;">Total</th>
      </tr>
    </thead>
    <tbody>
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 8px;">Order Reference #{{order.number}} - {{deal.title}}</td>
        <td style="padding: 8px; text-align: right;">$ {{order.total}}</td>
      </tr>
    </tbody>
  </table>

  <div style="text-align: right; font-size: 16px; font-weight: bold; color: #16a34a; margin-top: 16px;">
    Total Paid: $ {{order.total}}
  </div>

  <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-top: 32px;">Thank you for your business!</p>
</div>`,
  }
];

// Project Field Placeholders for easy insertion
const PROJECT_PLACEHOLDERS = [
  {
    group: '👤 Contact Fields',
    items: [
      { tag: '{{contact.firstName}}', label: 'First Name', sample: 'Arthur' },
      { tag: '{{contact.lastName}}', label: 'Last Name', sample: 'Pendelton' },
      { tag: '{{contact.email}}', label: 'Email Address', sample: 'a.pendelton@apexlogistics.io' },
      { tag: '{{contact.phone}}', label: 'Phone Number', sample: '+1 (555) 234-5678' },
      { tag: '{{contact.company}}', label: 'Company / Account', sample: 'Apex Logistics Corp' },
      { tag: '{{contact.city}}', label: 'City', sample: 'San Francisco' },
      { tag: '{{contact.country}}', label: 'Country', sample: 'United States' },
    ],
  },
  {
    group: '💼 Deal & Opportunity Fields',
    items: [
      { tag: '{{deal.title}}', label: 'Deal Title', sample: 'Apex Logistics Fleet Automation' },
      { tag: '{{deal.amount}}', label: 'Deal Amount', sample: '145000' },
      { tag: '{{deal.stage}}', label: 'Current Stage', sample: 'Negotiation' },
      { tag: '{{deal.expectedCloseDate}}', label: 'Close Date', sample: '2026-08-15' },
    ],
  },
  {
    group: '🧑‍💼 Sender & Tenant Fields',
    items: [
      { tag: '{{user.name}}', label: 'Sender Name', sample: 'Elena Rostova' },
      { tag: '{{user.email}}', label: 'Sender Email', sample: 'hciftci68@gmail.com' },
      { tag: '{{tenant.name}}', label: 'Company / Tenant Name', sample: 'Acme Cloud Services' },
    ],
  },
  {
    group: '📦 Order & Invoice Fields',
    items: [
      { tag: '{{order.number}}', label: 'Order Number', sample: 'ORD-2026-001' },
      { tag: '{{order.total}}', label: 'Order Total ($)', sample: '209214' },
    ],
  },
];

export const EmailTemplateEditor: React.FC = () => {
  const {
    templates,
    contacts,
    deals,
    orders,
    currentTenant,
    currentUser,
    emailIntegrations,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    testEmailProviderConnection,
    t,
  } = useCRM();

  // Filter & Search State
  const [selectedChannel, setSelectedChannel] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal / Editor State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);

  const [formName, setFormName] = useState('');
  const [formChannel, setFormChannel] = useState<MessageChannel>('EMAIL');
  const [formSubject, setFormSubject] = useState('');
  const [formCategory, setFormCategory] = useState<NonNullable<MessageTemplate['category']>>('TRANSACTIONAL');
  const [formDescription, setFormDescription] = useState('');
  const [formBody, setFormBody] = useState('');

  // Preview / Test State
  const [previewTab, setPreviewTab] = useState<'CODE' | 'PREVIEW'>('PREVIEW');
  const [previewDevice, setPreviewDevice] = useState<'DESKTOP' | 'MOBILE'>('DESKTOP');
  const [selectedContactId, setSelectedContactId] = useState<string>(contacts[0]?.id || '');

  // Live Test Send State inside Editor
  const [testRecipientEmail, setTestRecipientEmail] = useState(currentUser.email || 'hciftci_tr@hotmail.com');
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testSendResult, setTestSendResult] = useState<{ success: boolean; message: string } | null>(null);

  // File Upload Ref
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bodyTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Active Target for Field Tag Insertion ('SUBJECT' | 'BODY')
  const [activeInsertField, setActiveInsertField] = useState<'SUBJECT' | 'BODY'>('BODY');

  const filteredTemplates = templates.filter((t) => {
    if (selectedChannel !== 'ALL' && t.channel !== selectedChannel) return false;
    if (selectedCategory !== 'ALL' && t.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.name.toLowerCase().includes(q) ||
        (t.subject || '').toLowerCase().includes(q) ||
        (t.description || '').toLowerCase().includes(q) ||
        t.body.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenCreateModal = () => {
    setEditingTemplate(null);
    setFormName('');
    setFormChannel('EMAIL');
    setFormSubject('');
    setFormCategory('TRANSACTIONAL');
    setFormDescription('');
    setFormBody('');
    setTestSendResult(null);
    setIsEditorOpen(true);
  };

  const handleOpenEditModal = (tmpl: MessageTemplate) => {
    setEditingTemplate(tmpl);
    setFormName(tmpl.name);
    setFormChannel(tmpl.channel);
    setFormSubject(tmpl.subject || '');
    setFormCategory(tmpl.category || 'TRANSACTIONAL');
    setFormDescription(tmpl.description || '');
    setFormBody(tmpl.body);
    setTestSendResult(null);
    setIsEditorOpen(true);
  };

  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formBody.trim()) return;

    if (editingTemplate) {
      updateTemplate(editingTemplate.id, {
        name: formName,
        channel: formChannel,
        subject: formSubject,
        category: formCategory,
        description: formDescription,
        body: formBody,
      });
    } else {
      addTemplate({
        name: formName,
        channel: formChannel,
        subject: formSubject,
        category: formCategory,
        description: formDescription,
        body: formBody,
        status: 'APPROVED',
      });
    }
    setIsEditorOpen(false);
  };

  const handleDuplicate = (id: string) => {
    duplicateTemplate(id);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this email template?')) {
      deleteTemplate(id);
    }
  };

  // Import HTML File Handler
  const handleImportHtmlFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const htmlContent = event.target?.result as string;
      if (htmlContent) {
        setFormBody(htmlContent);
        if (!formName) {
          const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
          setFormName(fileNameWithoutExt.charAt(0).toUpperCase() + fileNameWithoutExt.slice(1));
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Insert Tag Placeholder into active field
  const handleInsertPlaceholder = (tag: string) => {
    if (activeInsertField === 'SUBJECT') {
      setFormSubject((prev) => prev + ' ' + tag);
    } else {
      setFormBody((prev) => prev + ' ' + tag);
    }
  };

  // Load Starter Template
  const handleSelectStarterTemplate = (starterId: string) => {
    const starter = STARTER_HTML_TEMPLATES.find((s) => s.id === starterId);
    if (!starter) return;
    setFormName(starter.name);
    setFormCategory(starter.category);
    setFormSubject(starter.subject);
    setFormDescription(starter.description);
    setFormBody(starter.body);
  };

  // Render HTML preview with sample data replaced
  const getRenderedPreview = () => {
    const contact = contacts.find((c) => c.id === selectedContactId) || contacts[0];
    const deal = deals[0];
    const order = orders[0];

    let renderedSubject = formSubject;
    let renderedBody = formBody;

    const vars: Record<string, string> = {
      'contact.firstName': contact?.firstName || 'Arthur',
      'contact.lastName': contact?.lastName || 'Pendelton',
      'contact.email': contact?.email || 'a.pendelton@apexlogistics.io',
      'contact.phone': contact?.phone || '+1 (555) 234-5678',
      'contact.company': contact?.accountName || 'Apex Logistics Corp',
      'contact.city': 'San Francisco',
      'contact.country': 'United States',
      'deal.title': deal?.title || 'Apex Fleet Automation',
      'deal.amount': deal?.amount ? deal.amount.toLocaleString() : '145,000',
      'deal.stage': 'Negotiation',
      'deal.expectedCloseDate': deal?.expectedCloseDate || '2026-08-15',
      'user.name': currentUser.name || 'Elena Rostova',
      'user.email': currentUser.email || 'hciftci68@gmail.com',
      'tenant.name': currentTenant.name || 'Acme Cloud Services',
      'order.number': order?.orderNumber || 'ORD-2026-001',
      'order.total': order?.totalAmount ? order.totalAmount.toLocaleString() : '209,214',
    };

    Object.entries(vars).forEach(([k, v]) => {
      const regex = new RegExp(`{{\\s*${k.replace('.', '\\.')}\\s*}}`, 'gi');
      renderedSubject = renderedSubject.replace(regex, v);
      renderedBody = renderedBody.replace(regex, v);
    });

    return { renderedSubject, renderedBody };
  };

  // Test send directly from editor
  const handleSendTestEmail = async () => {
    if (!testRecipientEmail) return;
    setIsSendingTest(true);
    setTestSendResult(null);

    const activeIntegration = emailIntegrations.find((e) => e.isDefault) || emailIntegrations[0];
    const { renderedSubject, renderedBody } = getRenderedPreview();

    try {
      const res = await fetch('/api/email/send-single', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config: {
            provider: activeIntegration?.provider || 'BREVO',
            apiKey: activeIntegration?.apiKey || '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',
            fromEmail: activeIntegration?.fromEmail || 'hciftci68@gmail.com',
            fromName: activeIntegration?.fromName || 'CRM Team',
          },
          toEmail: testRecipientEmail,
          toName: 'Test Recipient',
          subject: `[TEST] ${renderedSubject || 'Template Preview Test'}`,
          htmlBody: renderedBody,
        }),
      });

      const data = await res.json();
      setIsSendingTest(false);
      if (res.ok && data.success) {
        setTestSendResult({
          success: true,
          message: `Test email dispatched successfully! (Msg ID: ${data.messageId})`,
        });
      } else {
        setTestSendResult({
          success: false,
          message: data.error || 'Failed to send test email. Check email provider configuration.',
        });
      }
    } catch (err: any) {
      setIsSendingTest(false);
      setTestSendResult({
        success: false,
        message: err?.message || 'Network error sending test email',
      });
    }
  };

  const { renderedSubject, renderedBody } = getRenderedPreview();

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-5">
      {/* Hidden File Input for HTML Upload */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".html,.htm,.txt"
        onChange={handleImportHtmlFile}
        className="hidden"
      />

      {/* Header & Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
            <FileCode className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Email & Message Template Studio
              <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                {filteredTemplates.length} Templates
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Build responsive HTML email templates, insert CRM placeholders, duplicate designs, and test live deliverability.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 shadow-2xs transition-all"
          >
            <Upload className="h-3.5 w-3.5 text-slate-500" />
            Import HTML File
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 shadow-xs transition-all"
          >
            <Plus className="h-4 w-4" />
            New Email Template
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates by name, subject, body..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-100"
          />
        </div>

        <div>
          <select
            value={selectedChannel}
            onChange={(e) => setSelectedChannel(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-medium text-slate-800 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-200"
          >
            <option value="ALL">All Channels (EMAIL, SMS, WhatsApp)</option>
            <option value="EMAIL">Email</option>
            <option value="SMS">SMS</option>
            <option value="WHATSAPP">WhatsApp</option>
          </select>
        </div>

        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-xs font-medium text-slate-800 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-200"
          >
            <option value="ALL">All Categories</option>
            <option value="TRANSACTIONAL">Transactional</option>
            <option value="PROMOTIONAL">Promotional</option>
            <option value="ONBOARDING">Onboarding</option>
            <option value="NEWSLETTER">Newsletter</option>
            <option value="FOLLOW_UP">Follow Up</option>
            <option value="CUSTOM">Custom</option>
          </select>
        </div>
      </div>

      {/* Templates Grid Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.map((tmpl) => (
          <div
            key={tmpl.id}
            className="group flex flex-col justify-between rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:border-indigo-500/50 transition-all space-y-3"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  {tmpl.channel}
                </span>
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {tmpl.category || 'GENERAL'}
                </span>
              </div>

              <div>
                <h3 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 dark:text-slate-100 dark:group-hover:text-indigo-400 transition-colors">
                  {tmpl.name}
                </h3>
                {tmpl.subject && (
                  <p className="text-xs font-medium text-slate-600 dark:text-slate-300 truncate mt-0.5">
                    Subject: {tmpl.subject}
                  </p>
                )}
                {tmpl.description && (
                  <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                    {tmpl.description}
                  </p>
                )}
              </div>

              {/* Code Snippet Preview Box */}
              <div className="rounded-lg bg-slate-900/90 p-2 text-[10px] font-mono text-slate-300 line-clamp-3 overflow-hidden border border-slate-800">
                {tmpl.body}
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-medium text-slate-400">
                {tmpl.updatedAt ? new Date(tmpl.updatedAt).toLocaleDateString() : 'Approved'}
              </span>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleDuplicate(tmpl.id)}
                  title="Duplicate / Copy Template"
                  className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-indigo-400"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>

                <button
                  onClick={() => handleOpenEditModal(tmpl)}
                  title="Edit Template"
                  className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-indigo-400"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                </button>

                <button
                  onClick={() => handleDelete(tmpl.id)}
                  title="Delete Template"
                  className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600 dark:text-slate-400 dark:hover:bg-rose-950/50 dark:hover:text-rose-400"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredTemplates.length === 0 && (
          <div className="col-span-full py-10 text-center text-xs text-slate-400">
            No email templates match your current search/filter.
          </div>
        )}
      </div>

      {/* FULL-FEATURED TEMPLATE EDITOR MODAL */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 backdrop-blur-xs">
          <div className="flex max-h-[92vh] w-full max-w-5xl flex-col rounded-2xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2.5">
                <FileCode className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  {editingTemplate ? 'Edit Email Template' : 'Create New Email Template'}
                </h3>
              </div>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body Grid (Editor + Live Preview) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 overflow-y-auto flex-1 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800">
              {/* Left Column: Form Controls & Field Inserter (7 cols) */}
              <div className="lg:col-span-7 p-6 space-y-4">
                {/* Starter Template Library Selector */}
                <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-3 dark:border-indigo-900/50 dark:bg-indigo-950/30 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-indigo-900 dark:text-indigo-200">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="h-4 w-4 text-indigo-600" />
                      Starter HTML Gallery
                    </span>
                    <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-normal">
                      Click to load a pre-built responsive HTML layout
                    </span>
                  </div>
                  <select
                    onChange={(e) => {
                      if (e.target.value) handleSelectStarterTemplate(e.target.value);
                    }}
                    defaultValue=""
                    className="w-full rounded-lg border border-indigo-300 bg-white px-3 py-1.5 text-xs text-indigo-950 dark:border-indigo-800 dark:bg-slate-900 dark:text-indigo-200 font-medium"
                  >
                    <option value="" disabled>-- Choose a starter HTML template --</option>
                    {STARTER_HTML_TEMPLATES.map((tmpl) => (
                      <option key={tmpl.id} value={tmpl.id}>
                        {tmpl.name} ({tmpl.category})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Template Name *
                    </label>
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Q3 Executive Welcome Email"
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Category
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as any)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    >
                      <option value="TRANSACTIONAL">Transactional</option>
                      <option value="PROMOTIONAL">Promotional</option>
                      <option value="ONBOARDING">Onboarding</option>
                      <option value="NEWSLETTER">Newsletter</option>
                      <option value="FOLLOW_UP">Follow Up</option>
                      <option value="CUSTOM">Custom</option>
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Subject Line (Supports Placeholders)
                    </label>
                    <button
                      type="button"
                      onClick={() => setActiveInsertField('SUBJECT')}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        activeInsertField === 'SUBJECT'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      Target for insertion
                    </button>
                  </div>
                  <input
                    type="text"
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    onFocus={() => setActiveInsertField('SUBJECT')}
                    placeholder="e.g. Welcome to {{tenant.name}}, {{contact.firstName}}!"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>

                {/* PROJECT FIELDS PLACEHOLDER SELECTOR CHIPS */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                      <Tag className="h-3.5 w-3.5 text-indigo-600" />
                      Insert Project CRM Field Placeholders:
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Inserting into: <strong className="text-indigo-600">{activeInsertField}</strong>
                    </span>
                  </div>

                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                    {PROJECT_PLACEHOLDERS.map((group, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {group.group}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {group.items.map((item, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => handleInsertPlaceholder(item.tag)}
                              title={`Sample: ${item.sample}`}
                              className="rounded-lg bg-white px-2 py-1 text-[11px] font-mono font-semibold text-indigo-700 border border-indigo-200 hover:bg-indigo-100 dark:bg-slate-900 dark:border-indigo-900 dark:text-indigo-300 dark:hover:bg-indigo-950 transition-colors shadow-2xs"
                            >
                              {item.tag}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Body Content Editor & HTML Code */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Email Body Content (HTML / Plain Text)
                    </label>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1"
                    >
                      <Upload className="h-3 w-3" /> Load HTML File
                    </button>
                  </div>

                  <textarea
                    ref={bodyTextareaRef}
                    rows={12}
                    value={formBody}
                    onChange={(e) => setFormBody(e.target.value)}
                    onFocus={() => setActiveInsertField('BODY')}
                    placeholder="Enter or paste HTML code here..."
                    className="w-full rounded-xl border border-slate-300 p-3 font-mono text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Right Column: Live Rendered Preview & Test Dispatch (5 cols) */}
              <div className="lg:col-span-5 p-6 space-y-4 bg-slate-50 dark:bg-slate-900/40">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Eye className="h-4 w-4 text-indigo-600" />
                    Live Render Preview
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPreviewDevice('DESKTOP')}
                      className={`p-1.5 rounded-lg text-xs ${
                        previewDevice === 'DESKTOP'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      <Monitor className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setPreviewDevice('MOBILE')}
                      className={`p-1.5 rounded-lg text-xs ${
                        previewDevice === 'MOBILE'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      <Smartphone className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Sample Recipient Selector */}
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-500">
                    Test Recipient Sample Context
                  </label>
                  <select
                    value={selectedContactId}
                    onChange={(e) => setSelectedContactId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                  >
                    {contacts.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.firstName} {c.lastName} ({c.accountName || c.email})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Rendered Subject */}
                <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 space-y-1 shadow-2xs">
                  <div className="text-[10px] font-bold text-slate-400">SUBJECT LINE:</div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {renderedSubject || '(No subject entered)'}
                  </div>
                </div>

                {/* Rendered HTML Canvas Frame */}
                <div
                  className={`mx-auto transition-all overflow-hidden rounded-xl border border-slate-300 bg-white dark:border-slate-700 shadow-md ${
                    previewDevice === 'MOBILE' ? 'max-w-[320px]' : 'w-full'
                  }`}
                >
                  <div className="bg-slate-200 dark:bg-slate-800 px-3 py-1 text-[10px] font-mono text-slate-600 dark:text-slate-300 border-b border-slate-300 dark:border-slate-700 flex items-center justify-between">
                    <span>HTML Preview ({previewDevice})</span>
                    <span>100%</span>
                  </div>
                  <div
                    className="p-3 max-h-[320px] overflow-y-auto text-xs"
                    dangerouslySetInnerHTML={{ __html: renderedBody || '<p style="color:#94a3b8;">Body preview will render here...</p>' }}
                  />
                </div>

                {/* Direct Live Test Send Action */}
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 dark:border-emerald-950 dark:bg-emerald-950/30 space-y-2">
                  <div className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                    <Send className="h-3.5 w-3.5 text-emerald-600" />
                    Test Dispatch via Connected Provider
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="email"
                      value={testRecipientEmail}
                      onChange={(e) => setTestRecipientEmail(e.target.value)}
                      placeholder="Enter recipient email"
                      className="flex-1 rounded-lg border border-emerald-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 dark:border-emerald-800 dark:bg-slate-900 dark:text-slate-100"
                    />
                    <button
                      disabled={isSendingTest}
                      onClick={handleSendTestEmail}
                      className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {isSendingTest ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                      Send Test
                    </button>
                  </div>

                  {testSendResult && (
                    <div
                      className={`p-2 rounded-lg text-[11px] font-medium ${
                        testSendResult.success
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200'
                      }`}
                    >
                      {testSendResult.message}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Cancel
              </button>

              <button
                onClick={handleSaveTemplate}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 shadow-xs"
              >
                <Check className="h-4 w-4" />
                {editingTemplate ? 'Save Changes' : 'Save Template'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
