import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import {
  Building2, Shield, Key, Webhook, Plus, Share2, Mail, CheckCircle2,
  AlertCircle, Globe, Send, RefreshCw, Copy, Check, Sparkles, ExternalLink,
  FileCode, Layers, Settings, Users, Server, Radio, SlidersHorizontal
} from 'lucide-react';
import { EmailProviderType } from '../../types';
import { LocationSettingsView } from './LocationSettingsView';
import { EmailTestingStudio } from './EmailTestingStudio';
import { EmailTemplateEditor } from './EmailTemplateEditor';

type AdminTabCategory = 'OVERVIEW' | 'EMAIL_STUDIO' | 'INTEGRATIONS' | 'ORGANIZATION_SECURITY';
type EmailStudioSubTab = 'TEMPLATES' | 'TESTING_STUDIO' | 'PROVIDERS';

export const TenantSettings: React.FC = () => {
  const {
    currentTenant,
    users,
    apiKeys,
    webhooks,
    socialIntegrations,
    emailIntegrations,
    addApiKey,
    addWebhook,
    upgradePlan,
    connectSocialAccount,
    disconnectSocialAccount,
    saveEmailProvider,
    testEmailProviderConnection,
    t,
  } = useCRM();

  // Navigation Group State
  const [activeTab, setActiveTab] = useState<AdminTabCategory>('EMAIL_STUDIO');
  const [activeEmailSubTab, setActiveEmailSubTab] = useState<EmailStudioSubTab>('TEMPLATES');

  // Modals & Forms State
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [createdSecret, setCreatedSecret] = useState<string | null>(null);

  const [isWebhookModalOpen, setIsWebhookModalOpen] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookEvent, setWebhookEvent] = useState<'contact.created' | 'deal.stage_changed' | 'case.created'>('deal.stage_changed');

  // Email Provider Integration Modal
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [selectedEmailProvider, setSelectedEmailProvider] = useState<EmailProviderType>('BREVO');
  const [emailApiKey, setEmailApiKey] = useState('');
  const [fromEmail, setFromEmail] = useState('hciftci68@gmail.com');
  const [fromName, setFromName] = useState('Acme Cloud Team');
  const [testEmailRecipient, setTestEmailRecipient] = useState('hciftci_tr@hotmail.com');
  const [testStatusMessage, setTestStatusMessage] = useState<string | null>(null);
  const [isTestingEmail, setIsTestingEmail] = useState(false);

  // Social Connect Modal
  const [isSocialModalOpen, setIsSocialModalOpen] = useState(false);
  const [socialProvider, setSocialProvider] = useState<'META' | 'TIKTOK' | 'LINKEDIN' | 'TWITTER'>('META');
  const [socialAccountName, setSocialAccountName] = useState('Acme Meta Business Suite');
  const [socialAccountId, setSocialAccountId] = useState('act_982341234');
  const [copiedWebhookUrl, setCopiedWebhookUrl] = useState(false);

  const handleCreateApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName.trim()) return;
    const newKey = addApiKey(keyName);
    setCreatedSecret(newKey.secretKey);
    setKeyName('');
  };

  const handleCreateWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!webhookUrl.trim()) return;
    addWebhook(webhookEvent, webhookUrl);
    setIsWebhookModalOpen(false);
    setWebhookUrl('');
  };

  const handleSaveEmailProvider = (e: React.FormEvent) => {
    e.preventDefault();
    saveEmailProvider({
      provider: selectedEmailProvider,
      apiKey: emailApiKey || 'xkeysib-sample-key',
      fromEmail,
      fromName,
      isDefault: true,
      status: 'CONNECTED',
    });
    setIsEmailModalOpen(false);
    setEmailApiKey('');
  };

  const handleTestEmail = async (providerId: string) => {
    setIsTestingEmail(true);
    setTestStatusMessage(null);
    const res = await testEmailProviderConnection(providerId, testEmailRecipient);
    setIsTestingEmail(false);
    setTestStatusMessage(res.message);
    setTimeout(() => setTestStatusMessage(null), 6000);
  };

  const handleConnectSocial = (e: React.FormEvent) => {
    e.preventDefault();
    connectSocialAccount({
      provider: socialProvider,
      accountName: socialAccountName,
      accountId: socialAccountId,
      status: 'CONNECTED',
      permissions: ['lead_ads', 'page_messaging', 'insights'],
      autoSyncLeads: true,
    });
    setIsSocialModalOpen(false);
  };

  const webhookEndpointUrl = `${window.location.origin}/api/webhooks/social-leads`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedWebhookUrl(true);
    setTimeout(() => setCopiedWebhookUrl(false), 3000);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Settings className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            Admin & System Settings Studio
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage email templates, Brevo/SendGrid integrations, social lead webhooks, API tokens, and location hierarchies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-xl border border-indigo-200 bg-indigo-50/80 px-3 py-1 text-xs font-bold text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/60 dark:text-indigo-300">
            Tenant: {currentTenant.name} ({currentTenant.plan})
          </span>
        </div>
      </div>

      {/* TOP NAVIGATION TABS (Categorized Groups) */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200/80 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('EMAIL_STUDIO')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
            activeTab === 'EMAIL_STUDIO'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800'
          }`}
        >
          <Mail className="h-4 w-4" />
          Email & Message Studio
        </button>

        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
            activeTab === 'OVERVIEW'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800'
          }`}
        >
          <Building2 className="h-4 w-4" />
          Overview & Billing
        </button>

        <button
          onClick={() => setActiveTab('INTEGRATIONS')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
            activeTab === 'INTEGRATIONS'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800'
          }`}
        >
          <Share2 className="h-4 w-4" />
          Integrations & Developer APIs
        </button>

        <button
          onClick={() => setActiveTab('ORGANIZATION_SECURITY')}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
            activeTab === 'ORGANIZATION_SECURITY'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800'
          }`}
        >
          <Shield className="h-4 w-4" />
          Organization & Security
        </button>
      </div>

      {/* CATEGORY 1: EMAIL & MESSAGE STUDIO */}
      {activeTab === 'EMAIL_STUDIO' && (
        <div className="space-y-5">
          {/* Email Studio Sub-Tab Pill Bar */}
          <div className="flex items-center gap-2 rounded-2xl bg-slate-100 p-1.5 dark:bg-slate-800/80 w-fit">
            <button
              onClick={() => setActiveEmailSubTab('TEMPLATES')}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                activeEmailSubTab === 'TEMPLATES'
                  ? 'bg-white text-indigo-600 shadow-2xs dark:bg-slate-900 dark:text-indigo-400'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
              }`}
            >
              <FileCode className="h-3.5 w-3.5" />
              Template Editor & CRUD
            </button>

            <button
              onClick={() => setActiveEmailSubTab('TESTING_STUDIO')}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                activeEmailSubTab === 'TESTING_STUDIO'
                  ? 'bg-white text-indigo-600 shadow-2xs dark:bg-slate-900 dark:text-indigo-400'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
              }`}
            >
              <Radio className="h-3.5 w-3.5" />
              Live Testing Studio (Single & Bulk)
            </button>

            <button
              onClick={() => setActiveEmailSubTab('PROVIDERS')}
              className={`flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                activeEmailSubTab === 'PROVIDERS'
                  ? 'bg-white text-indigo-600 shadow-2xs dark:bg-slate-900 dark:text-indigo-400'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
              }`}
            >
              <Server className="h-3.5 w-3.5" />
              Service Providers ({emailIntegrations.length})
            </button>
          </div>

          {/* Sub-Tab 1: Email Templates Editor */}
          {activeEmailSubTab === 'TEMPLATES' && (
            <EmailTemplateEditor />
          )}

          {/* Sub-Tab 2: Live Testing Studio */}
          {activeEmailSubTab === 'TESTING_STUDIO' && (
            <EmailTestingStudio />
          )}

          {/* Sub-Tab 3: Email Service Providers */}
          {activeEmailSubTab === 'PROVIDERS' && (
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                    <Server className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      Email Service Providers (Brevo SDK, SendGrid, Resend, AWS SES)
                    </h2>
                    <p className="text-xs text-slate-400">
                      Configure high-deliverability API credentials and default sender signatures.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsEmailModalOpen(true)}
                  className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 shadow-xs transition-all"
                >
                  <Plus className="h-4 w-4" /> Connect Provider
                </button>
              </div>

              {testStatusMessage && (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span>{testStatusMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {emailIntegrations.map((prov) => (
                  <div key={prov.id} className="flex flex-col justify-between rounded-xl border border-slate-200/80 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40 space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-indigo-100 px-2.5 py-0.5 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                          {prov.provider}
                        </span>
                        {prov.isDefault && (
                          <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                            DEFAULT PROVIDER
                          </span>
                        )}
                      </div>
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                        <CheckCircle2 className="h-3.5 w-3.5" /> {prov.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                      <div>From Name: <strong>{prov.fromName}</strong></div>
                      <div>Sender Email: <strong className="text-indigo-600 dark:text-indigo-400">{prov.fromEmail}</strong></div>
                      <div className="font-mono text-[11px] text-slate-400">API Key: {prov.apiKeyMasked || '••••••••••••••••'}</div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-200/60 dark:border-slate-700/60">
                      <div className="flex items-center gap-2 text-xs w-full">
                        <input
                          type="email"
                          value={testEmailRecipient}
                          onChange={(e) => setTestEmailRecipient(e.target.value)}
                          className="flex-1 rounded-lg border border-slate-300 px-2.5 py-1 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                          placeholder="test@domain.com"
                        />
                        <button
                          disabled={isTestingEmail}
                          onClick={() => handleTestEmail(prov.id)}
                          className="flex items-center gap-1 rounded-lg border border-indigo-600 px-3 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 dark:text-indigo-300 dark:hover:bg-indigo-950"
                        >
                          {isTestingEmail ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                          Test
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* CATEGORY 2: OVERVIEW & BILLING */}
      {activeTab === 'OVERVIEW' && (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  {currentTenant.name}
                </h2>
                <p className="text-xs text-slate-500">
                  Current Plan Level: <strong className="text-indigo-600 dark:text-indigo-400">{currentTenant.plan}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => upgradePlan('GROWTH')}
                className="rounded-xl border border-indigo-600 px-4 py-2 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-indigo-950/50 transition-all"
              >
                Upgrade Growth
              </button>
              <button
                onClick={() => upgradePlan('SCALE')}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 shadow-xs transition-all"
              >
                Upgrade Scale
              </button>
            </div>
          </div>

          {/* Quota Progress Metering */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 border-t border-slate-100 pt-6 dark:border-slate-800">
            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/40 space-y-2 border border-slate-200/60 dark:border-slate-800">
              <div className="flex justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                <span>Monthly Email Quota</span>
                <span>{currentTenant.usedMessagesThisMonth.toLocaleString()} / {currentTenant.monthlyMessageQuota.toLocaleString()}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full"
                  style={{ width: `${Math.min((currentTenant.usedMessagesThisMonth / currentTenant.monthlyMessageQuota) * 100, 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400">Resets on 1st of every month</p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/40 space-y-2 border border-slate-200/60 dark:border-slate-800">
              <div className="flex justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                <span>User Seats Limit</span>
                <span>{users.length} / {currentTenant.maxUsers}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${Math.min((users.length / currentTenant.maxUsers) * 100, 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400">Active team members</p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/40 space-y-2 border border-slate-200/60 dark:border-slate-800">
              <div className="flex justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                <span>Max Contacts</span>
                <span>15 / {currentTenant.maxContacts.toLocaleString()}</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${Math.min((15 / currentTenant.maxContacts) * 100, 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400">Database capacity</p>
            </div>
          </div>
        </div>
      )}

      {/* CATEGORY 3: INTEGRATIONS & DEVELOPER APIS */}
      {activeTab === 'INTEGRATIONS' && (
        <div className="space-y-6">
          {/* Social Media Accounts & Lead Ad Webhook Integration */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                  <Share2 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    Social Channels & Lead Ads Ingestion (Meta, TikTok, LinkedIn)
                  </h2>
                  <p className="text-xs text-slate-400">
                    Manage connected social channels and copy the lead ads webhook endpoint.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsSocialModalOpen(true)}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 shadow-xs transition-all"
              >
                <Plus className="h-4 w-4" /> Connect Channel
              </button>
            </div>

            {/* Lead Webhook Ingestion URL Banner */}
            <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4 dark:border-blue-900/50 dark:bg-blue-950/40 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-900 dark:text-blue-200">
                  <Globe className="h-4 w-4 text-blue-600" />
                  Meta / TikTok Lead Ads Webhook Live Endpoint
                </div>
                <button
                  onClick={() => copyToClipboard(webhookEndpointUrl)}
                  className="flex items-center gap-1 rounded-lg bg-white px-3 py-1 text-xs font-bold text-blue-700 border border-blue-200 shadow-2xs dark:bg-slate-900 dark:border-slate-700 dark:text-blue-300 hover:bg-blue-50"
                >
                  {copiedWebhookUrl ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  {copiedWebhookUrl ? 'Copied!' : 'Copy Webhook URL'}
                </button>
              </div>
              <div className="font-mono text-xs text-blue-800 dark:text-blue-300 break-all bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-lg border border-blue-100 dark:border-slate-800">
                {webhookEndpointUrl}
              </div>
              <p className="text-[11px] text-blue-700 dark:text-blue-400">
                Paste this callback URL into Meta Business Suite or TikTok Lead Form Webhook settings to sync prospective leads into CRM pipelines automatically.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {socialIntegrations.map((acc) => (
                <div key={acc.id} className="flex flex-col justify-between rounded-xl border border-slate-200/80 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40 space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                      {acc.provider}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Connected
                    </span>
                  </div>

                  <div>
                    <div className="font-bold text-xs text-slate-900 dark:text-slate-100">{acc.accountName}</div>
                    <div className="text-[11px] text-slate-400">ID: {acc.accountId}</div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {(acc.permissions || []).map((perm, i) => (
                      <span key={i} className="rounded bg-slate-200 px-1.5 py-0.2 text-[9px] text-slate-700 dark:bg-slate-700 dark:text-slate-300 font-medium">
                        {perm}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                    <span className="text-[10px] text-slate-400">Auto-Sync: Active</span>
                    <button
                      onClick={() => disconnectSocialAccount(acc.id)}
                      className="text-[11px] font-semibold text-rose-600 hover:underline"
                    >
                      Disconnect
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Developer API Keys & Webhooks */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* API Keys */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Key className="h-4 w-4 text-indigo-600" />
                  <h2 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    API Access Tokens
                  </h2>
                </div>
                <button
                  onClick={() => { setIsApiKeyModalOpen(true); setCreatedSecret(null); }}
                  className="flex items-center gap-1.5 rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-400"
                >
                  <Plus className="h-3.5 w-3.5" /> Generate
                </button>
              </div>

              <div className="space-y-2">
                {apiKeys.map((key) => (
                  <div key={key.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-800/40">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100">{key.name}</div>
                      <div className="font-mono text-[10px] text-slate-400">{key.keyPrefix}••••••••</div>
                    </div>
                    <span className="text-[10px] text-slate-400">{new Date(key.createdAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Webhook Subscriptions */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Webhook className="h-4 w-4 text-indigo-600" />
                  <h2 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    Outbound Webhooks
                  </h2>
                </div>
                <button
                  onClick={() => setIsWebhookModalOpen(true)}
                  className="flex items-center gap-1.5 rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-400"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Target
                </button>
              </div>

              <div className="space-y-2">
                {webhooks.map((wh) => (
                  <div key={wh.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-800/40">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100">{wh.event}</div>
                      <div className="font-mono text-[10px] text-slate-400 truncate max-w-[200px]">{wh.targetUrl}</div>
                    </div>
                    <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      Enabled
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CATEGORY 4: ORGANIZATION & SECURITY */}
      {activeTab === 'ORGANIZATION_SECURITY' && (
        <div className="space-y-6">
          {/* Location Management Section (Country > City > District) */}
          <LocationSettingsView />

          {/* User Roles Permission Matrix */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-indigo-600" />
              <h2 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                User Roles & Permission Scoping Matrix
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-800/50">
                  <tr>
                    <th className="px-3 py-2 font-semibold">Permission Scope</th>
                    <th className="px-3 py-2 font-semibold text-center">Owner</th>
                    <th className="px-3 py-2 font-semibold text-center">Admin</th>
                    <th className="px-3 py-2 font-semibold text-center">Sales Rep</th>
                    <th className="px-3 py-2 font-semibold text-center">Read Only</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 dark:divide-slate-800 dark:text-slate-300">
                  <tr>
                    <td className="px-3 py-2">View Contacts, Accounts & Deals</td>
                    <td className="text-center text-emerald-600 font-bold">✓</td>
                    <td className="text-center text-emerald-600 font-bold">✓</td>
                    <td className="text-center text-emerald-600 font-bold">✓</td>
                    <td className="text-center text-emerald-600 font-bold">✓</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2">Create & Edit Deals/Contacts</td>
                    <td className="text-center text-emerald-600 font-bold">✓</td>
                    <td className="text-center text-emerald-600 font-bold">✓</td>
                    <td className="text-center text-emerald-600 font-bold">✓</td>
                    <td className="text-center text-rose-500">✕</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2">Dispatch Omnichannel Messages & Social Campaigns</td>
                    <td className="text-center text-emerald-600 font-bold">✓</td>
                    <td className="text-center text-emerald-600 font-bold">✓</td>
                    <td className="text-center text-emerald-600 font-bold">✓</td>
                    <td className="text-center text-rose-500">✕</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2">Export CSV & Tenant Admin Settings</td>
                    <td className="text-center text-emerald-600 font-bold">✓</td>
                    <td className="text-center text-emerald-600 font-bold">✓</td>
                    <td className="text-center text-rose-500">✕</td>
                    <td className="text-center text-rose-500">✕</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Connect Email Service Provider */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-slate-100">
              Connect Email Provider
            </h2>
            <form onSubmit={handleSaveEmailProvider} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Select Service Provider
                </label>
                <select
                  value={selectedEmailProvider}
                  onChange={(e) => setSelectedEmailProvider(e.target.value as EmailProviderType)}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                >
                  <option value="BREVO">Brevo (Sendinblue)</option>
                  <option value="SENDGRID">SendGrid</option>
                  <option value="MAILGUN">Mailgun</option>
                  <option value="RESEND">Resend</option>
                  <option value="AWS_SES">AWS SES</option>
                  <option value="POSTMARK">Postmark</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  API Key / Access Token
                </label>
                <input
                  type="password"
                  required
                  placeholder="xkeysib-xxxxxxxxxxxxxxxxxx"
                  value={emailApiKey}
                  onChange={(e) => setEmailApiKey(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Sender Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fromName}
                    onChange={(e) => setFromName(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Sender Email
                  </label>
                  <input
                    type="email"
                    required
                    value={fromEmail}
                    onChange={(e) => setFromEmail(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEmailModalOpen(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
                >
                  Connect & Set Default
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Connect Social Media Account */}
      {isSocialModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-slate-100">
              Connect Social Media Channel
            </h2>
            <form onSubmit={handleConnectSocial} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Social Platform
                </label>
                <select
                  value={socialProvider}
                  onChange={(e) => setSocialProvider(e.target.value as any)}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                >
                  <option value="META">Meta (Facebook & Instagram Lead Ads)</option>
                  <option value="TIKTOK">TikTok Business Center</option>
                  <option value="LINKEDIN">LinkedIn Campaign Manager</option>
                  <option value="TWITTER">Twitter/X Professional Ads</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Page or Business Account Name
                </label>
                <input
                  type="text"
                  required
                  value={socialAccountName}
                  onChange={(e) => setSocialAccountName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Ad Account ID / Page ID
                </label>
                <input
                  type="text"
                  required
                  value={socialAccountId}
                  onChange={(e) => setSocialAccountId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsSocialModalOpen(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
                >
                  Connect & Sync
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Generate API Key */}
      {isApiKeyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-slate-100">
              Generate Developer API Key
            </h2>
            {createdSecret ? (
              <div className="space-y-4">
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300">
                  Save this key now. It will not be displayed again!
                </div>
                <div className="font-mono text-xs break-all rounded-xl bg-slate-100 p-3 dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                  {createdSecret}
                </div>
                <button
                  onClick={() => setIsApiKeyModalOpen(false)}
                  className="w-full rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateApiKey} className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Token Name / Integration Purpose
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Zapier Lead Hook"
                    value={keyName}
                    onChange={(e) => setKeyName(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsApiKeyModalOpen(false)}
                    className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
                  >
                    Generate Secret Key
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal: Add Webhook */}
      {isWebhookModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-slate-100">
              Add Outbound Webhook Subscription
            </h2>
            <form onSubmit={handleCreateWebhook} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Event Trigger
                </label>
                <select
                  value={webhookEvent}
                  onChange={(e) => setWebhookEvent(e.target.value as any)}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                >
                  <option value="deal.stage_changed">deal.stage_changed</option>
                  <option value="contact.created">contact.created</option>
                  <option value="case.created">case.created</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Target Endpoint URL
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://api.yourdomain.com/webhooks"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsWebhookModalOpen(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
                >
                  Save Subscription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
