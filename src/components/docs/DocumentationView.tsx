import React, { useState } from 'react';
import {
  BookOpen, ShieldCheck, Code2, Cpu, CheckCircle2, ChevronRight,
  Layers, Terminal, Database, Server, Key, Lock, Share2, Workflow, MessageSquare, BarChart3, Users, Download, FileText
} from 'lucide-react';
import { generateDocumentationPdf } from '../../utils/exportPdf';

export const DocumentationView: React.FC = () => {
  const [activeDoc, setActiveDoc] = useState<'user' | 'admin' | 'developer' | 'architect'>('user');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleDownloadPdf = () => {
    setIsGeneratingPdf(true);
    setTimeout(() => {
      generateDocumentationPdf();
      setIsGeneratingPdf(false);
    }, 200);
  };

  return (
    <div className="flex h-full flex-col bg-slate-50 p-6 dark:bg-slate-950">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            Compact SMB CRM - System Documentation
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Comprehensive operational, administrative, technical, and architectural guides.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Download PDF Button */}
          <button
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 active:scale-95 transition-all"
          >
            {isGeneratingPdf ? (
              <span className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Generating PDF...
              </span>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Download PDF Manual
              </>
            )}
          </button>

          {/* Tab switcher */}
          <div className="flex rounded-xl bg-slate-200/80 p-1 dark:bg-slate-800">
            <button
              onClick={() => setActiveDoc('user')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                activeDoc === 'user'
                  ? 'bg-white text-indigo-600 shadow-xs dark:bg-slate-900 dark:text-indigo-400'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              User Guide
            </button>
            <button
              onClick={() => setActiveDoc('admin')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                activeDoc === 'admin'
                  ? 'bg-white text-indigo-600 shadow-xs dark:bg-slate-900 dark:text-indigo-400'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Admin Guide
            </button>
            <button
              onClick={() => setActiveDoc('developer')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                activeDoc === 'developer'
                  ? 'bg-white text-indigo-600 shadow-xs dark:bg-slate-900 dark:text-indigo-400'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <Code2 className="h-3.5 w-3.5" />
              Developer Docs
            </button>
            <button
              onClick={() => setActiveDoc('architect')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                activeDoc === 'architect'
                  ? 'bg-white text-indigo-600 shadow-xs dark:bg-slate-900 dark:text-indigo-400'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <Cpu className="h-3.5 w-3.5" />
              Architect Docs
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-sm space-y-6">
        {activeDoc === 'user' && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-4 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Users className="h-5 w-5 text-indigo-600" /> 1. End-User Operational Manual
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Day-to-day guide for sales reps, account managers, and support agents using Compact SMB CRM.
                </p>
              </div>

              <button
                onClick={handleDownloadPdf}
                disabled={isGeneratingPdf}
                className="flex items-center gap-1.5 self-start sm:self-auto rounded-lg border border-indigo-200 bg-indigo-50/80 px-3 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-900/50 dark:bg-indigo-950/50 dark:text-indigo-300 transition-all shrink-0"
              >
                <Download className="h-3.5 w-3.5" />
                Export as PDF
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-indigo-500" /> Contacts & Accounts
                </h3>
                <ul className="text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
                  <li>• <strong>Lead Creation:</strong> Add contacts manually or import via CSV files.</li>
                  <li>• <strong>Consent Management:</strong> Enforce explicit opt-in for Email, SMS, and WhatsApp per contact.</li>
                  <li>• <strong>AI Lead Scoring:</strong> Automated scoring based on job titles, activities, and interaction recency.</li>
                  <li>• <strong>Timeline History:</strong> View logged calls, notes, emails, and WhatsApp threads in one feed.</li>
                </ul>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-indigo-500" /> Sales Pipeline & Deals
                </h3>
                <ul className="text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
                  <li>• <strong>Drag-and-Drop Kanban:</strong> Drag deals across stages (Qualification → Proposal → Closed Won).</li>
                  <li>• <strong>Deal Split Accounting:</strong> Assign primary & secondary owner revenue splits.</li>
                  <li>• <strong>Stage Probability & Forecasting:</strong> Automatic deal weighting for expected revenue calculations.</li>
                </ul>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-indigo-500" /> Omnichannel Inbox & Messaging
                </h3>
                <ul className="text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
                  <li>• <strong>Unified Inbox:</strong> Reply to Email, SMS, and WhatsApp messages from a single interface.</li>
                  <li>• <strong>24-Hour WhatsApp Rule:</strong> Session messages are free within 24h; bulk broadcasts require Meta-approved templates.</li>
                  <li>• <strong>Canned Responses:</strong> Use quick shortcuts (`/pricing`, `/demo`) for fast customer replies.</li>
                </ul>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-indigo-500" /> Progressive Web App (PWA) & Offline
                </h3>
                <ul className="text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
                  <li>• <strong>1-Click Desktop & Mobile Install:</strong> Click "Install App" in the top bar to install as a native desktop/mobile application.</li>
                  <li>• <strong>Offline Resilience:</strong> Full app shell, contacts, and deal pipelines remain accessible when offline.</li>
                  <li>• <strong>Offline Queueing:</strong> Changes made while offline are stored locally and replayed automatically upon reconnecting.</li>
                  <li>• <strong>Push Notifications:</strong> Receive immediate lead ad and deal stage notifications.</li>
                </ul>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-center gap-2">
                  <ChevronRight className="h-4 w-4 text-indigo-500" /> Support Cases & SLAs
                </h3>
                <ul className="text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
                  <li>• <strong>Ticketing System:</strong> Log customer issues with priority levels (URGENT, HIGH, MEDIUM, LOW).</li>
                  <li>• <strong>SLA Timer:</strong> Real-time countdown clock tracking response time limits before breach warnings.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeDoc === 'admin' && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-4 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-indigo-600" /> 2. SaaS Tenant Administrator Guide
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Administrative setup, subscription billing, provider integrations, and security policy control.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800 space-y-2">
                <h3 className="font-bold text-slate-900 dark:text-slate-100">Multi-Tenant Billing & Plan Metering</h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Administrators can manage plan tiers (FREE, GROWTH, SCALE) with strict quota enforcement for monthly messages, maximum active users, and contact limits.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800 space-y-2">
                <h3 className="font-bold text-slate-900 dark:text-slate-100">Email Provider Integrations</h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Connect third-party transactional email services including <strong>SendGrid, Mailgun, Resend, AWS SES, and Postmark</strong>. Test connection endpoints directly in settings with instant dispatch verification.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800 space-y-2">
                <h3 className="font-bold text-slate-900 dark:text-slate-100">Social Media & Lead Ad Webhook Setup</h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Authenticate Meta (Facebook/Instagram), TikTok Ads, and LinkedIn pages. Configure the auto-lead ingest webhook endpoint:
                </p>
                <div className="p-2 rounded bg-slate-100 dark:bg-slate-950 font-mono text-[11px] text-indigo-600 dark:text-indigo-400">
                  POST /api/webhooks/social-leads
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800 space-y-2">
                <h3 className="font-bold text-slate-900 dark:text-slate-100">Role-Based Access Control (RBAC)</h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Enforce strict role scoping: <strong>OWNER</strong> (Full SaaS admin), <strong>ADMIN</strong> (Tenant operations & user management), <strong>SALES_REP</strong> (CRM pipeline & communication), and <strong>READ_ONLY</strong> (Auditor view).
                </p>
              </div>
            </div>
          </div>
        )}

        {activeDoc === 'developer' && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-4 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Code2 className="h-5 w-5 text-indigo-600" /> 3. Developer Integration & API Reference
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                RESTful endpoints, real-time Firestore sync, webhook payload formats, and local setup guide.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800 space-y-2">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Terminal className="h-4 w-4 text-emerald-600" /> REST API Endpoints (Express / Node.js)
                </h3>
                <div className="space-y-2">
                  <div className="p-3 rounded-lg bg-slate-900 text-slate-100 font-mono text-[11px]">
                    <div className="text-emerald-400 font-bold">POST /api/webhooks/social-leads</div>
                    <div className="text-slate-400 mt-1">Payload: &#123; "platform": "META", "firstName": "Jane", "lastName": "Doe", "email": "jane@company.com", "phone": "+15550001122" &#125;</div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-900 text-slate-100 font-mono text-[11px]">
                    <div className="text-blue-400 font-bold">POST /api/integrations/test-email</div>
                    <div className="text-slate-400 mt-1">Payload: &#123; "provider": "SENDGRID", "fromEmail": "outreach@acmecloud.com", "toEmail": "recipient@test.com" &#125;</div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800 space-y-2">
                <h3 className="font-bold text-slate-900 dark:text-slate-100">Firestore Real-time State Synchronization</h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Managed via `subscribeCollection` in `src/context/CRMContext.tsx`. Automatically subscribes to Firestore collections (`contacts`, `deals`, `campaigns`, `socialIntegrations`, `emailIntegrations`) and gracefully falls back to structured initial state when working offline.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800 space-y-2">
                <h3 className="font-bold text-slate-900 dark:text-slate-100">Progressive Web App Architecture & Service Worker</h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Includes full Service Worker implementation (<code>/sw.js</code>) and Web App Manifest (<code>/public/manifest.json</code>) with standalone display mode, 192px/512px maskable icons, offline caching strategy (Stale-While-Revalidate for static assets, Network-First with JSON fallback for <code>/api/*</code>), and Web Push Notification listener.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800 space-y-2">
                <h3 className="font-bold text-slate-900 dark:text-slate-100">Project Script Commands</h3>
                <div className="p-3 rounded-lg bg-slate-900 text-slate-100 font-mono text-[11px] space-y-1">
                  <div>npm run dev <span className="text-slate-500"># Launches tsx server.ts with Vite middleware on port 3000</span></div>
                  <div>npm run build <span className="text-slate-500"># Bundles Vite SPA and compiles CJS server.cjs via esbuild</span></div>
                  <div>npm run lint <span className="text-slate-500"># Executes strict TypeScript type validation</span></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeDoc === 'architect' && (
          <div className="space-y-6">
            <div className="border-b border-slate-200 pb-4 dark:border-slate-800">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Cpu className="h-5 w-5 text-indigo-600" /> 4. High-Level Architecture & System Blueprint
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Full-stack design pattern, multi-tenant isolation, resilience models, and data security.
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800 space-y-2">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Layers className="h-4 w-4 text-indigo-600" /> Component Topology
                </h3>
                <p className="text-slate-600 dark:text-slate-300">
                  <strong>Client Tier:</strong> Single-Page Application built with React 18, Tailwind CSS, Lucide icons, and React Context (`CRMContext`).
                  <br />
                  <strong>Server Tier:</strong> Express backend running on Node.js container host, proxying webhooks and provider dispatch routes on port 3000.
                  <br />
                  <strong>Database Tier:</strong> Cloud Firestore database (`ai-studio-compactsmbcrm-...`) storing tenant scoped collections.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800 space-y-2">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-amber-600" /> Multi-Tenant Data Isolation Strategy
                </h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Every record in Firestore contains a mandatory `tenantId` property. Security rules and client filters scope query results strictly to `currentTenantId`, preventing cross-tenant data leaks in multi-organization SaaS deployments.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 p-4 dark:border-slate-800 space-y-2">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Workflow className="h-4 w-4 text-emerald-600" /> Offline Action Sync & Resilience Queue
                </h3>
                <p className="text-slate-600 dark:text-slate-300">
                  When network disconnects occur (`isOffline = true`), user modifications are enqueued into `offlineQueue`. When network connectivity resumes, the queue automatically replays actions against the backend and Firestore.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
