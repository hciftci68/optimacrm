import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import {
  Send, Users, CheckCircle2, AlertTriangle, Play, Plus, Filter,
  FileText, Globe, Share2, Eye, MousePointerClick, TrendingUp, DollarSign,
  UserCheck, Heart, MessageCircle, Sparkles, Image as ImageIcon
} from 'lucide-react';
import { Campaign, MessageChannel } from '../../types';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';
import { TemplateChooserModal } from '../common/TemplateChooserModal';

export const CampaignView: React.FC = () => {
  const {
    campaigns, segments, templates, createCampaign, deleteCampaign,
    addSegment, deleteSegment, triggerCampaignSend, simulateSocialLeadIngestion, t
  } = useCRM();

  const [activeSubTab, setActiveSubTab] = useState<'campaigns' | 'segments'>('campaigns');
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(campaigns[0] || null);
  const [pendingDeleteCampaign, setPendingDeleteCampaign] = useState<Campaign | null>(null);

  // New Campaign Modal
  const [isCreateCampaignOpen, setIsCreateCampaignOpen] = useState(false);
  const [name, setName] = useState('');
  const [channel, setChannel] = useState<MessageChannel>('EMAIL');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [segmentId, setSegmentId] = useState(segments[0]?.id || '');
  const [templateId, setTemplateId] = useState('');
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  
  // Social Media Campaign Specifics
  const [postType, setPostType] = useState<'ORGANIC_POST' | 'SPONSORED_AD' | 'LEAD_AD'>('LEAD_AD');
  const [mediaUrl, setMediaUrl] = useState('https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600');
  const [ctaUrl, setCtaUrl] = useState('https://acmecloud.com/request-demo');
  const [budget, setBudget] = useState(1500);
  const [demographics, setDemographics] = useState('US Tech Executives & Operations Leads (Age 25-50)');

  const [sendError, setSendError] = useState<string | null>(null);
  const [ingestSuccess, setIngestSuccess] = useState<string | null>(null);

  // New Segment Modal
  const [isCreateSegmentOpen, setIsCreateSegmentOpen] = useState(false);
  const [segName, setSegName] = useState('');
  const [segRulesField, setSegRulesField] = useState('leadStatus');
  const [segRulesValue, setSegRulesValue] = useState('QUALIFIED');

  const isSocialChannel = ['FACEBOOK', 'INSTAGRAM', 'TIKTOK', 'LINKEDIN', 'TWITTER'].includes(channel);

  const handleCreateCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !body.trim()) return;

    if (channel === 'WHATSAPP' && !templateId) {
      setSendError('WhatsApp bulk campaigns outside 24h window MUST select an approved template.');
      return;
    }

    const newCamp = createCampaign({
      name,
      channel,
      segmentId,
      templateId: templateId || undefined,
      subject: subject || name,
      body,
      hasABTest: false,
      scheduleType: 'NOW',
      contentVariantA: body,
      socialPlatformConfig: isSocialChannel
        ? {
            postType,
            mediaUrls: mediaUrl ? [mediaUrl] : [],
            callToActionUrl: ctaUrl,
            budget,
            targetDemographics: demographics,
          }
        : undefined,
    });

    setIsCreateCampaignOpen(false);
    setSelectedCampaign(newCamp);
    setName('');
    setBody('');
    setSubject('');
    setSendError(null);
  };

  const handleCreateSegment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!segName.trim()) return;

    addSegment({
      name: segName,
      rules: [{ field: segRulesField, operator: 'equals', value: segRulesValue }],
    });

    setIsCreateSegmentOpen(false);
    setSegName('');
  };

  const handleTriggerSend = (campId: string) => {
    setSendError(null);
    const result = triggerCampaignSend(campId);
    if (!result.success) {
      setSendError(result.error || 'Failed to dispatch campaign');
    }
  };

  const handleSimulateLeadIngest = (platform: string) => {
    setIngestSuccess(null);
    const newLead = simulateSocialLeadIngestion(platform);
    setIngestSuccess(`New lead "${newLead.firstName} ${newLead.lastName}" auto-ingested into sales pipeline via ${platform} Lead Ad Webhook!`);
    setTimeout(() => setIngestSuccess(null), 5000);
  };

  return (
    <div className="flex h-full flex-col bg-slate-50 p-6 dark:bg-slate-950">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Send className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            {t('campaigns')} & Omnichannel Bulk Messaging
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Email, SMS, WhatsApp, and Social Media Ad Lead Campaigns (Meta, TikTok, LinkedIn) with automated lead ad sync.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex rounded-xl bg-slate-200/80 p-1 dark:bg-slate-800">
            <button
              onClick={() => setActiveSubTab('campaigns')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                activeSubTab === 'campaigns'
                  ? 'bg-white text-indigo-600 shadow-xs dark:bg-slate-900 dark:text-indigo-400'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              Campaigns ({campaigns.length})
            </button>
            <button
              onClick={() => setActiveSubTab('segments')}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                activeSubTab === 'segments'
                  ? 'bg-white text-indigo-600 shadow-xs dark:bg-slate-900 dark:text-indigo-400'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              Audience Segments ({segments.length})
            </button>
          </div>

          {activeSubTab === 'campaigns' ? (
            <button
              onClick={() => setIsCreateCampaignOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 shadow-xs transition-all"
            >
              <Plus className="h-4 w-4" />
              New Campaign
            </button>
          ) : (
            <button
              onClick={() => setIsCreateSegmentOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 shadow-xs transition-all"
            >
              <Plus className="h-4 w-4" />
              Build Segment
            </button>
          )}
        </div>
      </div>

      {sendError && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300">
          <AlertTriangle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />
          <span>{sendError}</span>
        </div>
      )}

      {ingestSuccess && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
          <Sparkles className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <span>{ingestSuccess}</span>
        </div>
      )}

      {/* Main Grid */}
      {activeSubTab === 'campaigns' ? (
        <div className="grid flex-1 grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Campaign List */}
          <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Active & Social Campaigns
            </h2>
            <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto">
              {campaigns.map((camp) => {
                const isSelected = selectedCampaign?.id === camp.id;
                const isSocial = ['FACEBOOK', 'INSTAGRAM', 'TIKTOK', 'LINKEDIN', 'TWITTER'].includes(camp.channel);
                return (
                  <button
                    key={camp.id}
                    onClick={() => setSelectedCampaign(camp)}
                    className={`flex flex-col gap-2 rounded-xl p-3.5 text-left transition-all border ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 dark:border-indigo-500 dark:bg-indigo-950/30'
                        : 'border-slate-100 bg-slate-50/60 hover:bg-slate-100/80 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                        isSocial
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                      }`}>
                        {camp.channel}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          camp.status === 'SENT'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : camp.status === 'SENDING'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {camp.status}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                      {camp.name}
                    </h3>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                      <span>{isSocial ? `${camp.stats.impressions || 0} Impressions` : `${camp.stats.sent} Sent`}</span>
                      <span>{new Date(camp.createdAt).toLocaleDateString()}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Campaign Analytics Details */}
          {selectedCampaign ? (
            <div className="lg:col-span-2 flex flex-col gap-6 overflow-y-auto">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-indigo-100 px-2.5 py-1 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                        {selectedCampaign.channel}
                      </span>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                        {selectedCampaign.name}
                      </h2>
                    </div>
                    {selectedCampaign.subject && (
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Subject / Headline: "{selectedCampaign.subject}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {['FACEBOOK', 'INSTAGRAM', 'TIKTOK', 'LINKEDIN'].includes(selectedCampaign.channel) && (
                      <button
                        onClick={() => handleSimulateLeadIngest(selectedCampaign.channel)}
                        className="flex items-center gap-1.5 rounded-xl border border-indigo-600 bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-300 shadow-xs"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        Test Lead Webhook Ingest
                      </button>
                    )}

                    {selectedCampaign.status === 'DRAFT' && (
                      <button
                        onClick={() => handleTriggerSend(selectedCampaign.id)}
                        className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 shadow-md transition-all"
                      >
                        <Play className="h-4 w-4" />
                        Launch Campaign
                      </button>
                    )}

                    <button
                      onClick={() => {
                        deleteCampaign(selectedCampaign.id);
                        const remaining = campaigns.filter((c) => c.id !== selectedCampaign.id);
                        setSelectedCampaign(remaining[0] || null);
                      }}
                      className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-400"
                    >
                      Delete Campaign
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-blue-200 bg-blue-50/70 p-3 text-xs text-blue-800 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
                  <span>
                    <strong>Omnichannel Dispatch & Compliance:</strong> Active channel route ({selectedCampaign.channel}). Unsubscribes and opt-out preferences are strictly synced across all CRM modules.
                  </span>
                </div>
              </div>

              {/* Social or Email KPI Cards */}
              {['FACEBOOK', 'INSTAGRAM', 'TIKTOK', 'LINKEDIN', 'TWITTER'].includes(selectedCampaign.channel) ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      <Eye className="h-3.5 w-3.5 text-blue-500" /> Impressions
                    </div>
                    <div className="mt-1 text-2xl font-black text-slate-900 dark:text-slate-100">
                      {(selectedCampaign.stats.impressions || 12400).toLocaleString()}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      <TrendingUp className="h-3.5 w-3.5 text-emerald-500" /> Engagement Rate
                    </div>
                    <div className="mt-1 text-2xl font-black text-emerald-600 dark:text-emerald-400">
                      {selectedCampaign.stats.engagementRate || 4.2}%
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      <UserCheck className="h-3.5 w-3.5 text-indigo-500" /> Leads Ingested
                    </div>
                    <div className="mt-1 text-2xl font-black text-indigo-600 dark:text-indigo-400">
                      {selectedCampaign.stats.leadsGenerated || 48} Leads
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                      <DollarSign className="h-3.5 w-3.5 text-amber-500" /> Spend / Budget
                    </div>
                    <div className="mt-1 text-2xl font-black text-slate-900 dark:text-slate-100">
                      ${selectedCampaign.stats.spend || 650} / ${selectedCampaign.socialPlatformConfig?.budget || 1500}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                    <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Total Sent</div>
                    <div className="mt-1 text-2xl font-black text-slate-900 dark:text-slate-100">
                      {selectedCampaign.stats.sent}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                    <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Open Rate</div>
                    <div className="mt-1 text-2xl font-black text-emerald-600 dark:text-emerald-400">
                      {selectedCampaign.stats.sent > 0
                        ? `${Math.round((selectedCampaign.stats.opened / selectedCampaign.stats.sent) * 100)}%`
                        : '0%'}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                    <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Click Rate</div>
                    <div className="mt-1 text-2xl font-black text-indigo-600 dark:text-indigo-400">
                      {selectedCampaign.stats.sent > 0
                        ? `${Math.round((selectedCampaign.stats.clicked / selectedCampaign.stats.sent) * 100)}%`
                        : '0%'}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
                    <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Reply Rate</div>
                    <div className="mt-1 text-2xl font-black text-purple-600 dark:text-purple-400">
                      {selectedCampaign.stats.sent > 0
                        ? `${Math.round((selectedCampaign.stats.replied / selectedCampaign.stats.sent) * 100)}%`
                        : '0%'}
                    </div>
                  </div>
                </div>
              )}

              {/* Feed / Ad Post Live Mockup Preview */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-2">
                  <Share2 className="h-4 w-4" /> Live Social Feed & Campaign Preview
                </h3>

                <div className="max-w-md mx-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                      AC
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                        Acme Cloud Services
                        <span className="rounded bg-blue-100 px-1.5 py-0.2 text-[9px] text-blue-700 font-bold dark:bg-blue-900 dark:text-blue-300">
                          {selectedCampaign.channel}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400">Sponsored Ad • Public</div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-800 dark:text-slate-200 mb-3 whitespace-pre-wrap">
                    {selectedCampaign.body || selectedCampaign.contentVariantA}
                  </p>

                  {selectedCampaign.socialPlatformConfig?.mediaUrls?.[0] && (
                    <div className="rounded-xl overflow-hidden mb-3 border border-slate-100 dark:border-slate-800">
                      <img
                        src={selectedCampaign.socialPlatformConfig.mediaUrls[0]}
                        alt="Campaign media preview"
                        className="w-full h-48 object-cover"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between rounded-xl bg-slate-100 p-3 text-xs dark:bg-slate-900">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-slate-100">
                        {selectedCampaign.subject || 'Acme Cloud Solutions'}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate max-w-[200px]">
                        {selectedCampaign.socialPlatformConfig?.callToActionUrl || 'https://acmecloud.com'}
                      </div>
                    </div>
                    <button className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-2xs">
                      Sign Up / Demo
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="lg:col-span-2 flex items-center justify-center rounded-2xl border border-dashed border-slate-300 p-12 text-slate-400 dark:border-slate-800">
              Select a campaign to inspect analytics & social feed preview
            </div>
          )}
        </div>
      ) : (
        /* Segments List */
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {segments.map((seg) => (
            <div
              key={seg.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                    {seg.contactCount} Contacts Matched
                  </span>
                  <Filter className="h-4 w-4 text-slate-400" />
                </div>
                <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-slate-100">
                  {seg.name}
                </h3>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {(seg.rules || []).map((rule, idx) => (
                    <span
                      key={idx}
                      className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    >
                      {rule.field} {rule.operator} "{rule.value}"
                    </span>
                  ))}
                </div>
              </div>
              <div className="mt-6 border-t border-slate-100 pt-3 text-[11px] text-slate-400 dark:border-slate-800">
                Created on {new Date(seg.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Create Campaign */}
      {isCreateCampaignOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900 my-8">
            <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-slate-100">
              Create Omnichannel Campaign
            </h2>
            <form onSubmit={handleCreateCampaign} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Campaign Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="Q3 Meta Lead Ad Campaign - Enterprise Cloud"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Channel / Platform
                  </label>
                  <select
                    value={channel}
                    onChange={(e) => setChannel(e.target.value as MessageChannel)}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  >
                    <option value="EMAIL">Email</option>
                    <option value="SMS">SMS</option>
                    <option value="WHATSAPP">WhatsApp</option>
                    <option value="FACEBOOK">Facebook Lead Ads</option>
                    <option value="INSTAGRAM">Instagram Ads / Stories</option>
                    <option value="TIKTOK">TikTok Business Lead Form</option>
                    <option value="LINKEDIN">LinkedIn Sponsored Content</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Target Audience Segment
                  </label>
                  <select
                    value={segmentId}
                    onChange={(e) => setSegmentId(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  >
                    {segments.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.contactCount})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {isSocialChannel && (
                <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 space-y-3 dark:border-blue-900/50 dark:bg-blue-950/30">
                  <h3 className="text-xs font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                    <Globe className="h-4 w-4" /> Social Ad & Lead Capture Settings
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                        Post / Ad Format
                      </label>
                      <select
                        value={postType}
                        onChange={(e) => setPostType(e.target.value as any)}
                        className="mt-1 w-full rounded-xl border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                      >
                        <option value="LEAD_AD">Lead Ad Form (Instant Lead Ingest)</option>
                        <option value="SPONSORED_AD">Sponsored Feed Post</option>
                        <option value="ORGANIC_POST">Organic Page Post</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                        Ad Budget ($)
                      </label>
                      <input
                        type="number"
                        value={budget}
                        onChange={(e) => setBudget(Number(e.target.value))}
                        className="mt-1 w-full rounded-xl border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      Creative Image URL
                    </label>
                    <input
                      type="url"
                      value={mediaUrl}
                      onChange={(e) => setMediaUrl(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      Target Audience Demographics
                    </label>
                    <input
                      type="text"
                      value={demographics}
                      onChange={(e) => setDemographics(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-slate-300 px-2.5 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>
              )}

              {channel === 'WHATSAPP' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Meta-Approved WhatsApp Template
                  </label>
                  <select
                    value={templateId}
                    onChange={(e) => setTemplateId(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  >
                    <option value="">-- Select Template --</option>
                    {templates
                      .filter((t) => t.channel === 'WHATSAPP')
                      .map((tmpl) => (
                        <option key={tmpl.id} value={tmpl.id}>
                          {tmpl.name}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              {/* Choose Designed Template Trigger */}
              <div className="flex items-center justify-between rounded-xl border border-indigo-100 bg-indigo-50/60 p-3 dark:border-indigo-900/50 dark:bg-indigo-950/30">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200">
                    Use Designed Message Template
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsTemplateModalOpen(true)}
                  className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-700 shadow-2xs transition-colors"
                >
                  Choose Template
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Ad Headline / Email Subject
                </label>
                <input
                  type="text"
                  placeholder="Scale your enterprise operations 10x faster"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Ad Copy / Message Body
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Automate sales pipelines, support cases, and lead scoring in one compact platform..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="mt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateCampaignOpen(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 shadow-sm"
                >
                  Create & Launch Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Create Segment */}
      {isCreateSegmentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-slate-100">
              Build Contact Segment Rule
            </h2>
            <form onSubmit={handleCreateSegment} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Segment Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="VIP Qualified Tech Leads"
                  value={segName}
                  onChange={(e) => setSegName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Filter Field
                  </label>
                  <select
                    value={segRulesField}
                    onChange={(e) => setSegRulesField(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  >
                    <option value="leadStatus">Lead Status</option>
                    <option value="leadScore">Lead Score</option>
                    <option value="jobTitle">Job Title</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Equals Value
                  </label>
                  <input
                    type="text"
                    required
                    value={segRulesValue}
                    onChange={(e) => setSegRulesValue(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCreateSegmentOpen(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 shadow-sm"
                >
                  Save Segment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Template Chooser Modal for Campaigns */}
      <TemplateChooserModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        targetChannel={channel}
        title="Select Campaign Message Template"
        onSelectTemplate={(tmpl, renderedBody, renderedSubject) => {
          setTemplateId(tmpl.id);
          setChannel(tmpl.channel);
          setSubject(renderedSubject || tmpl.subject || tmpl.name);
          setBody(renderedBody || tmpl.body);
        }}
      />
    </div>
  );
};
