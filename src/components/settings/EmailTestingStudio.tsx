import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import {
  Mail, Send, Server, Users, CheckCircle2, XCircle, AlertCircle, RefreshCw,
  Sliders, FileText, Check, ShieldCheck, Zap, Download, Sparkles, Terminal
} from 'lucide-react';
import { EmailProviderType } from '../../types';
import { TemplateChooserModal } from '../common/TemplateChooserModal';

interface DeliveryLog {
  recipientEmail: string;
  success: boolean;
  messageId?: string;
  statusCode?: number;
  error?: string;
  sentAt: string;
  latencyMs: number;
}

export const EmailTestingStudio: React.FC = () => {
  const { contacts, emailIntegrations, saveEmailProvider, t } = useCRM();

  // Active Tab: 'SINGLE' | 'BULK' | 'CONFIG'
  const [activeTab, setActiveTab] = useState<'SINGLE' | 'BULK' | 'CONFIG'>('SINGLE');

  // Template Modal Triggers
  const [isSingleTemplateModalOpen, setIsSingleTemplateModalOpen] = useState(false);
  const [isBulkTemplateModalOpen, setIsBulkTemplateModalOpen] = useState(false);

  // Active Provider Config
  const [providerType, setProviderType] = useState<EmailProviderType>('BREVO');
  const [fromName, setFromName] = useState('Brevo CRM Mailer');
  const [fromEmail, setFromEmail] = useState('hciftci68@gmail.com');
  const [apiKey, setApiKey] = useState('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');
  
  // SMTP Specific
  const [smtpHost, setSmtpHost] = useState('smtp-relay.brevo.com');
  const [smtpPort, setSmtpPort] = useState<number>(587);
  const [smtpUser, setSmtpUser] = useState('hciftci68@gmail.com');
  const [smtpPass, setSmtpPass] = useState('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');
  const [smtpSecure, setSmtpSecure] = useState(false);

  // Connection Test Status
  const [connectionStatus, setConnectionStatus] = useState<{ testing: boolean; message?: string; success?: boolean }>({ testing: false });

  // Single Email State
  const [singleRecipient, setSingleRecipient] = useState('hciftci68@gmail.com');
  const [singleRecipientName, setSingleRecipientName] = useState('Hasan Çiftçi');
  const [singleSubject, setSingleSubject] = useState('CRM Canlı E-Posta Test Mesajı');
  const [singleBody, setSingleBody] = useState(
    `<div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <h2 style="color: #4f46e5; margin-top: 0;">🎉 Tebrikler! CRM E-Posta Servis Testi Başarılı</h2>
      <p style="color: #334155; font-size: 14px;">Bu mesaj, <strong>Compact SMB CRM</strong> mail servis entegrasyonu üzerinden gönderilen canlı bir test e-postasıdır.</p>
      <div style="background-color: #f8fafc; padding: 12px; border-radius: 8px; font-size: 13px; color: #475569; margin: 16px 0;">
        📍 <strong>Gönderim Zamanı:</strong> ${new Date().toLocaleString('tr-TR')}<br/>
        🚀 <strong>Servis Sağlayıcı:</strong> Real Live Dispatcher
      </div>
      <p style="color: #64748b; font-size: 12px;">Saygılarımızla,<br/>CRM Sistem Yönetimi</p>
    </div>`
  );
  const [isSendingSingle, setIsSendingSingle] = useState(false);
  const [singleResult, setSingleResult] = useState<DeliveryLog | null>(null);

  // Bulk Email State
  const [bulkMode, setBulkMode] = useState<'CRM' | 'PASTE'>('CRM');
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>(
    contacts.slice(0, 5).map((c) => c.id)
  );
  const [pastedEmails, setPastedEmails] = useState(
    'ahmet@example.com\nmehmet@example.com\nayse@example.com'
  );
  const [bulkSubject, setBulkSubject] = useState('Sayın {{firstName}}, Özel CRM Kampanya Bildirimi');
  const [bulkTemplate, setBulkTemplate] = useState(
    `<div style="font-family: Helvetica, Arial, sans-serif; padding: 24px; color: #1e293b; max-width: 600px; border: 1px solid #cbd5e1; border-radius: 16px;">
      <h3 style="color: #4f46e5;">Merhaba {{firstName}},</h3>
      <p style="font-size: 14px; line-height: 1.6;"><strong>{{company}}</strong> şirketi için hazırladığımız özel CRM güncellemesini duyurmaktan mutluluk duyuyoruz.</p>
      <p style="font-size: 13px; color: #475569;">E-posta adresiniz ({{email}}) sistemimizde kayıtlıdır.</p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <p style="font-size: 12px; color: #94a3b8;">İletişim izninize istinaden gönderilmiştir.</p>
    </div>`
  );
  const [sendDelayMs, setSendDelayMs] = useState<number>(300);
  const [isSendingBulk, setIsSendingBulk] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<{ current: number; total: number } | null>(null);
  const [bulkLogs, setBulkLogs] = useState<DeliveryLog[]>([]);

  // Presets Quick Load
  const applyPreset = (preset: 'BREVO' | 'GMAIL' | 'SENDGRID' | 'RESEND' | 'POSTMARK') => {
    if (preset === 'BREVO') {
      setProviderType('BREVO');
      setApiKey('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');
      setFromName('Brevo CRM Mailer');
      setFromEmail('hciftci68@gmail.com');
      setSmtpHost('smtp-relay.brevo.com');
      setSmtpPort(587);
    } else if (preset === 'GMAIL') {
      setProviderType('SMTP');
      setSmtpHost('smtp.gmail.com');
      setSmtpPort(587);
      setSmtpSecure(false);
      setFromName('CRM Gmail Outbound');
    } else if (preset === 'SENDGRID') {
      setProviderType('SENDGRID');
      setFromName('CRM SendGrid Outbound');
    } else if (preset === 'RESEND') {
      setProviderType('RESEND');
      setFromName('CRM Resend Outbound');
    } else if (preset === 'POSTMARK') {
      setProviderType('POSTMARK');
      setFromName('CRM Postmark Outbound');
    }
  };

  const getProviderConfig = () => ({
    provider: providerType,
    apiKey,
    smtpHost,
    smtpPort: Number(smtpPort),
    smtpUser,
    smtpPass,
    smtpSecure,
    fromEmail,
    fromName,
  });

  // Connection Test Trigger
  const handleTestConnection = async () => {
    setConnectionStatus({ testing: true });
    try {
      const res = await fetch('/api/email/send-single', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config: getProviderConfig(),
          toEmail: singleRecipient || fromEmail,
          subject: '⚡ CRM Mail Servisi Bağlantı Testi',
          htmlBody: '<p>Bağlantı doğrulama testi e-postası.</p>',
        }),
      });
      const data = await res.json();
      setConnectionStatus({
        testing: false,
        success: data.success,
        message: data.success
          ? `Bağlantı Başarılı! (${data.latencyMs}ms) Mesaj ID: ${data.messageId}`
          : `Hata: ${data.error || 'Bağlantı kurulamadı'}`,
      });
    } catch (err: any) {
      setConnectionStatus({
        testing: false,
        success: false,
        message: `Bağlantı hatası: ${err.message}`,
      });
    }
  };

  // Single Email Send Trigger
  const handleSendSingleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!singleRecipient) {
      alert('Lütfen alıcı e-posta adresini giriniz.');
      return;
    }

    setIsSendingSingle(true);
    setSingleResult(null);

    try {
      const res = await fetch('/api/email/send-single', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config: getProviderConfig(),
          toEmail: singleRecipient,
          toName: singleRecipientName,
          subject: singleSubject,
          htmlBody: singleBody,
        }),
      });

      const data: DeliveryLog = await res.json();
      setSingleResult(data);

      if (data.success) {
        saveEmailProvider({
          provider: providerType,
          apiKey: apiKey || 'active_key',
          fromEmail,
          fromName,
          isDefault: true,
          status: 'CONNECTED',
        });
      }
    } catch (err: any) {
      setSingleResult({
        recipientEmail: singleRecipient,
        success: false,
        error: err?.message || 'Ağ hatası oluştu',
        sentAt: new Date().toISOString(),
        latencyMs: 0,
      });
    } finally {
      setIsSendingSingle(false);
    }
  };

  // Bulk Email Send Trigger
  const handleSendBulkEmail = async () => {
    let recipientList: { email: string; name?: string; variables?: Record<string, string> }[] = [];

    if (bulkMode === 'CRM') {
      const selectedContacts = contacts.filter((c) => selectedContactIds.includes(c.id));
      recipientList = selectedContacts.map((c) => ({
        email: c.email,
        name: `${c.firstName} ${c.lastName}`,
        variables: {
          company: c.accountName || 'Değerli Firmamız',
          phone: c.phone || '',
        },
      }));
    } else {
      const lines = pastedEmails.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
      recipientList = lines.map((line) => {
        const parts = line.split(',');
        const email = parts[0].trim();
        const name = parts[1] ? parts[1].trim() : email.split('@')[0];
        const company = parts[2] ? parts[2].trim() : '';
        return {
          email,
          name,
          variables: { company },
        };
      });
    }

    if (recipientList.length === 0) {
      alert('Lütfen en az bir geçerli alıcı e-posta adresi ekleyin.');
      return;
    }

    setIsSendingBulk(true);
    setBulkLogs([]);
    setBulkProgress({ current: 0, total: recipientList.length });

    try {
      const res = await fetch('/api/email/send-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config: getProviderConfig(),
          recipients: recipientList,
          subject: bulkSubject,
          htmlTemplate: bulkTemplate,
          sendDelayMs,
        }),
      });

      const data = await res.json();
      setBulkLogs(data.results || []);
      setBulkProgress({ current: recipientList.length, total: recipientList.length });
    } catch (err: any) {
      alert(`Toplu gönderim sırasında hata oluştu: ${err.message}`);
    } finally {
      setIsSendingBulk(false);
    }
  };

  const exportLogsToCsv = () => {
    if (bulkLogs.length === 0) return;
    const headers = ['Alıcı', 'Durum', 'Mesaj ID', 'Gecikme (ms)', 'Tarih', 'Hata Detayı'];
    const rows = bulkLogs.map((l) => [
      `"${l.recipientEmail}"`,
      l.success ? 'BAŞARILI' : 'BAŞARISIZ',
      `"${l.messageId || ''}"`,
      l.latencyMs,
      `"${l.sentAt}"`,
      `"${l.error || ''}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `email-delivery-logs-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
            <Mail className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-bold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
              E-Posta Servisleri Canlı Test Stüdyosu
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                <Zap className="h-3 w-3" /> Real Live API
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              SMTP, SendGrid, Resend, Postmark ve Mailgun servisleri ile tekli ve toplu e-posta gönderim testi yapın.
            </p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('SINGLE')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all ${
              activeTab === 'SINGLE'
                ? 'bg-white text-indigo-600 shadow-xs dark:bg-slate-700 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Send className="h-3.5 w-3.5" /> Tekli E-Posta Testi
          </button>
          <button
            onClick={() => setActiveTab('BULK')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all ${
              activeTab === 'BULK'
                ? 'bg-white text-indigo-600 shadow-xs dark:bg-slate-700 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Users className="h-3.5 w-3.5" /> Toplu E-Posta Testi
          </button>
          <button
            onClick={() => setActiveTab('CONFIG')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-all ${
              activeTab === 'CONFIG'
                ? 'bg-white text-indigo-600 shadow-xs dark:bg-slate-700 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Sliders className="h-3.5 w-3.5" /> Servis Ayarları
          </button>
        </div>
      </div>

      {/* QUICK PRESETS BANNER */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-indigo-50/70 p-3 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 text-xs">
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
          <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span>Hızlı Ayar Şablonları:</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => applyPreset('BREVO')}
            className="rounded-lg bg-orange-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-2xs hover:bg-orange-700 flex items-center gap-1"
          >
            ⚡ Brevo API (Aktif Key)
          </button>
          <button
            type="button"
            onClick={() => applyPreset('GMAIL')}
            className="rounded-lg bg-white px-2.5 py-1 text-[11px] font-bold text-slate-700 shadow-2xs hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200"
          >
            Gmail SMTP
          </button>
          <button
            type="button"
            onClick={() => applyPreset('SENDGRID')}
            className="rounded-lg bg-white px-2.5 py-1 text-[11px] font-bold text-blue-600 shadow-2xs hover:bg-slate-50 dark:bg-slate-800 dark:text-blue-400"
          >
            SendGrid API
          </button>
          <button
            type="button"
            onClick={() => applyPreset('RESEND')}
            className="rounded-lg bg-white px-2.5 py-1 text-[11px] font-bold text-emerald-600 shadow-2xs hover:bg-slate-50 dark:bg-slate-800 dark:text-emerald-400"
          >
            Resend API
          </button>
          <button
            type="button"
            onClick={() => applyPreset('POSTMARK')}
            className="rounded-lg bg-white px-2.5 py-1 text-[11px] font-bold text-amber-600 shadow-2xs hover:bg-slate-50 dark:bg-slate-800 dark:text-amber-400"
          >
            Postmark API
          </button>
        </div>
      </div>

      {/* TAB 1: SINGLE EMAIL TEST */}
      {activeTab === 'SINGLE' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form */}
          <form onSubmit={handleSendSingleEmail} className="lg:col-span-7 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Servis Sağlayıcı
                </label>
                <select
                  value={providerType}
                  onChange={(e) => setProviderType(e.target.value as EmailProviderType)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="BREVO">Brevo API (Formerly Sendinblue) - xkeysib-5a19...</option>
                  <option value="SMTP">SMTP (Gmail, Custom, Outlook)</option>
                  <option value="SENDGRID">SendGrid API</option>
                  <option value="RESEND">Resend API</option>
                  <option value="POSTMARK">Postmark API</option>
                  <option value="MAILGUN">Mailgun API</option>
                  <option value="AWS_SES">AWS SES</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Gönderen Adı & Adresi
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={fromName}
                    onChange={(e) => setFromName(e.target.value)}
                    placeholder="Gönderen Adı"
                    className="w-1/2 rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                  <input
                    type="email"
                    value={fromEmail}
                    onChange={(e) => setFromEmail(e.target.value)}
                    placeholder="from@domain.com"
                    className="w-1/2 rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Recipient Input */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Alıcı E-Posta Adresi *
                </label>
                <input
                  type="email"
                  required
                  value={singleRecipient}
                  onChange={(e) => setSingleRecipient(e.target.value)}
                  placeholder="ornek@domain.com"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Alıcı Adı Soyadı
                </label>
                <input
                  type="text"
                  value={singleRecipientName}
                  onChange={(e) => setSingleRecipientName(e.target.value)}
                  placeholder="Ahmet Yılmaz"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            {/* Subject & Template Trigger */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  E-Posta Konusu *
                </label>
                <button
                  type="button"
                  onClick={() => setIsSingleTemplateModalOpen(true)}
                  className="flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700 border border-indigo-200 hover:bg-indigo-100 dark:bg-indigo-950 dark:border-indigo-800 dark:text-indigo-300 shadow-2xs"
                >
                  <Sparkles className="h-3.5 w-3.5 text-indigo-600" /> Tasarlanmış Şablon Seç
                </button>
              </div>
              <input
                type="text"
                required
                value={singleSubject}
                onChange={(e) => setSingleSubject(e.target.value)}
                placeholder="E-posta konu başlığı..."
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            {/* Body */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                E-Posta İçeriği (HTML / Metin)
              </label>
              <textarea
                rows={6}
                value={singleBody}
                onChange={(e) => setSingleBody(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-900 p-3 font-mono text-xs text-emerald-400 focus:border-indigo-500 focus:outline-none"
              />
            </div>

            {/* Submit Action */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={isSendingSingle}
                className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-700 transition-all disabled:opacity-50"
              >
                {isSendingSingle ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" /> E-Posta Gönderiliyor...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" /> 🚀 Gerçek E-Posta Gönder (Canlı Test)
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleTestConnection}
                disabled={connectionStatus.testing}
                className="flex items-center gap-1.5 rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                <Server className="h-3.5 w-3.5" /> Bağlantıyı Test Et
              </button>
            </div>

            {connectionStatus.message && (
              <div
                className={`rounded-xl border p-3 text-xs font-medium ${
                  connectionStatus.success
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300'
                    : 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300'
                }`}
              >
                {connectionStatus.message}
              </div>
            )}
          </form>

          {/* Results & Live Diagnostics */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Terminal className="h-4 w-4 text-indigo-600" /> Canlı Gönderim Raporu & Loglar
              </h3>

              {singleResult ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Durum:</span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        singleResult.success
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      {singleResult.success ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                      {singleResult.success ? 'BAŞARILI (DELIVERED)' : 'BAŞARISIZ (FAILED)'}
                    </span>
                  </div>

                  <div className="rounded-lg bg-slate-900 p-3 font-mono text-[11px] text-slate-300 space-y-1.5 overflow-x-auto">
                    <div><span className="text-slate-500">Alıcı:</span> {singleResult.recipientEmail}</div>
                    <div><span className="text-slate-500">Gecikme:</span> {singleResult.latencyMs} ms</div>
                    {singleResult.messageId && (
                      <div><span className="text-slate-500">Mesaj ID:</span> <span className="text-emerald-400">{singleResult.messageId}</span></div>
                    )}
                    {singleResult.statusCode && (
                      <div><span className="text-slate-500">HTTP Kodu:</span> {singleResult.statusCode}</div>
                    )}
                    <div><span className="text-slate-500">Zaman:</span> {singleResult.sentAt}</div>
                    {singleResult.error && (
                      <div className="mt-2 rounded bg-rose-950/80 p-2 text-rose-300 border border-rose-800">
                        ⚠️ Hata: {singleResult.error}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center text-xs text-slate-400">
                  Henüz test e-postası gönderilmedi. Sol taraftaki formu doldurup gönder butonuna basabilirsiniz.
                </div>
              )}
            </div>

            {/* Provider Warning / Tip */}
            <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3 text-xs text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300 space-y-1">
              <div className="font-bold flex items-center gap-1">
                <AlertCircle className="h-3.5 w-3.5" /> Canlı SMTP İpucu:
              </div>
              <p>
                Gmail SMTP kullanıyorsanız, Google Hesabınızda <strong>Uygulama Şifresi (App Password)</strong> oluşturup şifre alanına giriniz. Normal Gmail şifreniz güvenlik sebebiyle reddedilebilir.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BULK EMAIL TEST */}
      {activeTab === 'BULK' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Campaign Configuration */}
            <div className="lg:col-span-7 space-y-4">
              {/* Recipient Source Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Alıcı Kaynağı Seçimi
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setBulkMode('CRM')}
                    className={`flex-1 rounded-xl border p-2.5 text-xs font-bold transition-all ${
                      bulkMode === 'CRM'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    👥 CRM Müşterileri ({selectedContactIds.length} Seçili)
                  </button>
                  <button
                    type="button"
                    onClick={() => setBulkMode('PASTE')}
                    className={`flex-1 rounded-xl border p-2.5 text-xs font-bold transition-all ${
                      bulkMode === 'PASTE'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    📝 E-Posta Listesi Yapıştır
                  </button>
                </div>
              </div>

              {/* Recipients Detail Input */}
              {bulkMode === 'CRM' ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 max-h-48 overflow-y-auto dark:border-slate-700 dark:bg-slate-800/40 space-y-1.5">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Gönderilecek Kişiler ({selectedContactIds.length}/{contacts.length})
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedContactIds(
                          selectedContactIds.length === contacts.length
                            ? []
                            : contacts.map((c) => c.id)
                        )
                      }
                      className="text-[11px] font-bold text-indigo-600 hover:underline dark:text-indigo-400"
                    >
                      {selectedContactIds.length === contacts.length ? 'Tümünü Kaldır' : 'Tümünü Seç'}
                    </button>
                  </div>
                  {contacts.map((c) => (
                    <label
                      key={c.id}
                      className="flex items-center justify-between p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-800 text-xs cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedContactIds.includes(c.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedContactIds([...selectedContactIds, c.id]);
                            } else {
                              setSelectedContactIds(selectedContactIds.filter((id) => id !== c.id));
                            }
                          }}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {c.firstName} {c.lastName}
                        </span>
                        <span className="text-slate-400">({c.email})</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{c.accountName || 'Bireysel'}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    E-Posta Listesi (Her satıra: eposta, isim, şirket)
                  </label>
                  <textarea
                    rows={4}
                    value={pastedEmails}
                    onChange={(e) => setPastedEmails(e.target.value)}
                    placeholder="ahmet@firma.com, Ahmet Yılmaz, ACME A.Ş."
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 font-mono text-xs focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              )}

              {/* Subject */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Toplu E-Posta Konusu (Dinamik Değişkenli)
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsBulkTemplateModalOpen(true)}
                    className="flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700 border border-indigo-200 hover:bg-indigo-100 dark:bg-indigo-950 dark:border-indigo-800 dark:text-indigo-300 shadow-2xs"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-indigo-600" /> Tasarlanmış Şablon Seç
                  </button>
                </div>
                <input
                  type="text"
                  value={bulkSubject}
                  onChange={(e) => setBulkSubject(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {/* HTML Template */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    E-Posta HTML Şablonu
                  </label>
                  <div className="flex gap-1 text-[10px]">
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-600 font-mono dark:bg-slate-800 dark:text-slate-300">
                      {'{{firstName}}'}
                    </span>
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-600 font-mono dark:bg-slate-800 dark:text-slate-300">
                      {'{{company}}'}
                    </span>
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 text-slate-600 font-mono dark:bg-slate-800 dark:text-slate-300">
                      {'{{email}}'}
                    </span>
                  </div>
                </div>
                <textarea
                  rows={6}
                  value={bulkTemplate}
                  onChange={(e) => setBulkTemplate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-900 p-3 font-mono text-xs text-emerald-400 focus:border-indigo-500 focus:outline-none"
                />
              </div>

              {/* Delay Slider */}
              <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800/40">
                <div className="text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 block">
                    Gönderim Aralığı / Gecikme (Throttle)
                  </span>
                  <span className="text-slate-400">Rate-limit aşımını önlemek için e-postalar arası bekleme.</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={0}
                    max={2000}
                    step={100}
                    value={sendDelayMs}
                    onChange={(e) => setSendDelayMs(Number(e.target.value))}
                    className="w-28 accent-indigo-600"
                  />
                  <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 min-w-[50px]">
                    {sendDelayMs} ms
                  </span>
                </div>
              </div>

              {/* Action */}
              <button
                type="button"
                disabled={isSendingBulk}
                onClick={handleSendBulkEmail}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-xs font-bold text-white shadow-md hover:bg-indigo-700 transition-all disabled:opacity-50"
              >
                {isSendingBulk ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" /> Toplu Gönderim Yapılıyor...
                  </>
                ) : (
                  <>
                    <Users className="h-4 w-4" /> 🚀 Toplu E-Postaları Canlı Gönder
                  </>
                )}
              </button>
            </div>

            {/* Right: Live Progress & Itemized Logs */}
            <div className="lg:col-span-5 space-y-4">
              {/* Progress Summary Card */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Gönderim Durumu
                  </h3>
                  {bulkLogs.length > 0 && (
                    <button
                      onClick={exportLogsToCsv}
                      className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:underline dark:text-indigo-400"
                    >
                      <Download className="h-3 w-3" /> CSV İndir
                    </button>
                  )}
                </div>

                {bulkProgress && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                      <span>İlerleme:</span>
                      <span>{bulkProgress.current} / {bulkProgress.total} (%{Math.round((bulkProgress.current / bulkProgress.total) * 100)})</span>
                    </div>
                    <div className="h-2.5 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        className="h-full bg-indigo-600 transition-all duration-300"
                        style={{ width: `${(bulkProgress.current / bulkProgress.total) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Counters */}
                <div className="grid grid-cols-3 gap-2 text-center pt-2">
                  <div className="rounded-lg bg-emerald-100/70 p-2 dark:bg-emerald-950/50">
                    <div className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                      {bulkLogs.filter((l) => l.success).length}
                    </div>
                    <div className="text-[10px] text-emerald-600">Başarılı</div>
                  </div>
                  <div className="rounded-lg bg-rose-100/70 p-2 dark:bg-rose-950/50">
                    <div className="text-sm font-bold text-rose-700 dark:text-rose-300">
                      {bulkLogs.filter((l) => !l.success).length}
                    </div>
                    <div className="text-[10px] text-rose-600">Başarısız</div>
                  </div>
                  <div className="rounded-lg bg-slate-200/70 p-2 dark:bg-slate-700/50">
                    <div className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      {bulkProgress ? bulkProgress.total - bulkLogs.length : 0}
                    </div>
                    <div className="text-[10px] text-slate-500">Kalan</div>
                  </div>
                </div>
              </div>

              {/* Log Table */}
              <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 space-y-2 max-h-80 overflow-y-auto">
                <h4 className="text-[11px] font-bold text-slate-400 uppercase">Detaylı İletim Günlüğü</h4>
                {bulkLogs.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-400">
                    Henüz toplu gönderim başlatılmadı.
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {bulkLogs.map((log, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-[11px]"
                      >
                        <div className="flex items-center gap-2 truncate pr-2">
                          {log.success ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          ) : (
                            <XCircle className="h-3.5 w-3.5 text-rose-600 shrink-0" />
                          )}
                          <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {log.recipientEmail}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400 shrink-0 font-mono">
                          <span>{log.latencyMs}ms</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CONFIGURATION */}
      {activeTab === 'CONFIG' && (
        <div className="space-y-4 max-w-2xl">
          <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Sliders className="h-4 w-4 text-indigo-600" /> Servis Bağlantı Detayları
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Servis Tipi
              </label>
              <select
                value={providerType}
                onChange={(e) => setProviderType(e.target.value as EmailProviderType)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="BREVO">Brevo API (Formerly Sendinblue)</option>
                <option value="SMTP">SMTP Server (Gmail / Outlook / Custom)</option>
                <option value="SENDGRID">SendGrid API</option>
                <option value="RESEND">Resend API</option>
                <option value="POSTMARK">Postmark API</option>
                <option value="MAILGUN">Mailgun API</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Gönderen E-Posta
              </label>
              <input
                type="email"
                value={fromEmail}
                onChange={(e) => setFromEmail(e.target.value)}
                placeholder="noreply@domain.com"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          {providerType === 'SMTP' ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    SMTP Host *
                  </label>
                  <input
                    type="text"
                    value={smtpHost}
                    onChange={(e) => setSmtpHost(e.target.value)}
                    placeholder="smtp.gmail.com"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-mono focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Port *
                  </label>
                  <input
                    type="number"
                    value={smtpPort}
                    onChange={(e) => setSmtpPort(Number(e.target.value))}
                    placeholder="587"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-mono focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    SMTP Kullanıcı Adı
                  </label>
                  <input
                    type="text"
                    value={smtpUser}
                    onChange={(e) => setSmtpUser(e.target.value)}
                    placeholder="user@gmail.com"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    SMTP Şifre / App Password
                  </label>
                  <input
                    type="password"
                    value={smtpPass}
                    onChange={(e) => setSmtpPass(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                API Key / Server Token *
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="SG.xxxx... veya re_xxxx..."
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-mono focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          )}

          <div className="pt-2">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={connectionStatus.testing}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-700 transition-all"
            >
              <ShieldCheck className="h-4 w-4" /> Kaydet & Bağlantı Doğrulama Testi Yap
            </button>
          </div>
        </div>
      )}

      {/* Single Email Template Chooser Modal */}
      <TemplateChooserModal
        isOpen={isSingleTemplateModalOpen}
        onClose={() => setIsSingleTemplateModalOpen(false)}
        targetChannel="EMAIL"
        title="Tekli E-Posta Testi İçin Şablon Seç"
        onSelectTemplate={(tmpl, renderedBody, renderedSubject) => {
          setSingleSubject(renderedSubject || tmpl.subject || tmpl.name);
          setSingleBody(renderedBody || tmpl.body);
        }}
      />

      {/* Bulk Email Template Chooser Modal */}
      <TemplateChooserModal
        isOpen={isBulkTemplateModalOpen}
        onClose={() => setIsBulkTemplateModalOpen(false)}
        targetChannel="EMAIL"
        title="Toplu E-Posta Gönderimi İçin Şablon Seç"
        onSelectTemplate={(tmpl, renderedBody, renderedSubject) => {
          setBulkSubject(renderedSubject || tmpl.subject || tmpl.name);
          setBulkTemplate(renderedBody || tmpl.body);
        }}
      />
    </div>
  );
};
