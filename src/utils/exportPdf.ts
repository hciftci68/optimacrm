import jsPDF from 'jspdf';

export function generateDocumentationPdf() {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210 mm
  const pageHeight = doc.internal.pageSize.getHeight(); // 297 mm
  const margin = 14;
  const contentWidth = pageWidth - margin * 2; // 182 mm

  let y = margin;

  // Utility: Page Header & Footer
  const addHeaderFooter = (pageNumber: number, totalPages?: number) => {
    // Header
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.3);
    doc.line(margin, 10, pageWidth - margin, 10);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text('Compact SMB CRM — Multi-Tenant Enterprise System Documentation', margin, 7.5);
    doc.text('Confidential & Operational Manual', pageWidth - margin, 7.5, { align: 'right' });

    // Footer
    doc.line(margin, pageHeight - 11, pageWidth - margin, pageHeight - 11);
    doc.text(`System Version: 2.4.0-Enterprise  •  Generated: ${new Date().toLocaleDateString('en-US', { dateStyle: 'long' })}`, margin, pageHeight - 6);
    
    if (totalPages) {
      doc.text(`Page ${pageNumber} of ${totalPages}`, pageWidth - margin, pageHeight - 6, { align: 'right' });
    } else {
      doc.text(`Page ${pageNumber}`, pageWidth - margin, pageHeight - 6, { align: 'right' });
    }
  };

  // Utility: Page Break Check
  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin - 12) {
      doc.addPage();
      y = margin + 4;
    }
  };

  // Utility: Section Banner
  const addSectionHeader = (title: string, subtitle?: string) => {
    checkPageBreak(25);
    
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(margin, y, contentWidth, 10, 'F');
    
    doc.setFillColor(79, 70, 229); // indigo-600
    doc.rect(margin, y, 3, 10, 'F');

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text(title, margin + 6, y + 6.5);

    y += 14;

    if (subtitle) {
      doc.setFont('Helvetica', 'italic');
      doc.setFontSize(8.5);
      doc.setTextColor(100, 116, 139);
      const splitSubtitle = doc.splitTextToSize(subtitle, contentWidth);
      doc.text(splitSubtitle, margin, y);
      y += splitSubtitle.length * 3.8 + 4;
    }
  };

  // Utility: Subsection Header
  const addSubsectionHeader = (title: string) => {
    checkPageBreak(12);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(79, 70, 229); // indigo-600
    doc.text(`■  ${title}`, margin, y);
    y += 5.5;

    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.line(margin, y - 1, margin + contentWidth, y - 1);
    y += 2;
  };

  // Utility: Paragraph
  const addParagraph = (text: string, boldPrefix?: string) => {
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85); // slate-700

    let fullText = text;
    if (boldPrefix) {
      doc.setFont('Helvetica', 'bold');
      const prefixWidth = doc.getTextWidth(boldPrefix + ' ');
      doc.text(boldPrefix + ' ', margin + 3, y);
      doc.setFont('Helvetica', 'normal');

      const splitText = doc.splitTextToSize(text, contentWidth - 3 - prefixWidth);
      checkPageBreak(splitText.length * 3.8 + 2);
      doc.text(splitText, margin + 3 + prefixWidth, y);
      y += splitText.length * 3.8 + 2;
    } else {
      doc.setFont('Helvetica', 'normal');
      const splitText = doc.splitTextToSize(text, contentWidth);
      checkPageBreak(splitText.length * 3.8 + 2);
      doc.text(splitText, margin, y);
      y += splitText.length * 3.8 + 2;
    }
  };

  // Utility: Bullet Item
  const addBullet = (title: string, desc: string) => {
    doc.setFontSize(8.5);
    checkPageBreak(8);

    doc.setFont('Helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`• ${title}:`, margin + 3, y);

    const titleWidth = doc.getTextWidth(`• ${title}: `);
    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(51, 65, 85);

    const splitDesc = doc.splitTextToSize(desc, contentWidth - 3 - titleWidth);
    doc.text(splitDesc[0], margin + 3 + titleWidth, y);

    if (splitDesc.length > 1) {
      const remainingLines = splitDesc.slice(1);
      checkPageBreak(remainingLines.length * 3.8);
      doc.text(remainingLines, margin + 8, y + 3.8);
      y += splitDesc.length * 3.8 + 1.5;
    } else {
      y += 4.5;
    }
  };

  // Utility: Code Block
  const addCodeBlock = (code: string, title?: string) => {
    const lines = code.split('\n');
    const blockHeight = lines.length * 3.8 + (title ? 8 : 4);
    checkPageBreak(blockHeight + 4);

    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(margin, y, contentWidth, blockHeight, 'F');

    if (title) {
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text(title, margin + 4, y + 4.5);
      doc.setDrawColor(51, 65, 85);
      doc.setLineWidth(0.2);
      doc.line(margin + 4, y + 6, margin + contentWidth - 4, y + 6);
    }

    doc.setFont('Courier', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(56, 189, 248); // sky-400

    const startY = title ? y + 9.5 : y + 3.5;
    lines.forEach((line, idx) => {
      doc.text(line, margin + 4, startY + idx * 3.8);
    });

    y += blockHeight + 4;
  };

  // =========================================================================
  // COVER PAGE / DOCUMENT TITLE BANNER
  // =========================================================================

  // Large Dark Header Banner
  doc.setFillColor(15, 23, 42);
  doc.rect(margin, y, contentWidth, 42, 'F');

  doc.setFillColor(79, 70, 229);
  doc.rect(margin, y, 5, 42, 'F');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text('Compact SMB CRM', margin + 10, y + 15);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10.5);
  doc.setTextColor(199, 210, 254); // indigo-200
  doc.text('Multi-Tenant Enterprise Operating Manual & Architectural Reference Blueprint', margin + 10, y + 24);

  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('Release Version 2.4.0  •  Full System Specifications  •  End-to-End User & Developer Manuals', margin + 10, y + 33);

  y += 50;

  // Executive Summary Box
  doc.setFillColor(248, 250, 252); // slate-50
  doc.rect(margin, y, contentWidth, 32, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.rect(margin, y, contentWidth, 32, 'S');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42);
  doc.text('EXECUTIVE SYSTEM OVERVIEW & ARCHITECTURAL SUMMARY', margin + 4, y + 6);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  const execText = 'Compact SMB CRM is an enterprise-grade multi-tenant Customer Relationship Management platform engineered for small and medium businesses. Built as a high-performance Progressive Web App (PWA) with full offline queue resilience, it integrates omnichannel communications (Email, SMS, WhatsApp), automated lead ad ingestion (Meta, TikTok, LinkedIn), interactive sales pipelines with deal split accounting, support case SLAs, and multi-tenant security isolation.';
  const splitExec = doc.splitTextToSize(execText, contentWidth - 8);
  doc.text(splitExec, margin + 4, y + 12);

  y += 38;

  // Document Table of Contents Box
  addSubsectionHeader('DOCUMENTATION TABLE OF CONTENTS');

  const tocItems = [
    { num: '1.0', title: 'End-User Operational Manual (User Guide)', desc: 'Contacts, Sales Pipelines, Omnichannel Inbox, Support Cases, SLA Timers, PWA Installation' },
    { num: '2.0', title: 'SaaS Tenant Administrator Guide (Admin Guide)', desc: 'Multi-Tenant Subscriptions, Transactional Email Providers, Social Lead Ads, RBAC Matrix, Security' },
    { num: '3.0', title: 'Developer Integration & API Reference', desc: 'REST Webhooks, JSON Payloads, Firestore Real-Time Schemas, Local CLI Setup, Build Pipeline' },
    { num: '4.0', title: 'High-Level Architecture & System Blueprint', desc: 'Full-Stack Topology, Data Partitioning, Offline Action Queue, PWA Service Worker Topology' }
  ];

  tocItems.forEach(item => {
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(79, 70, 229);
    doc.text(`Section ${item.num}`, margin + 2, y);

    doc.setTextColor(15, 23, 42);
    doc.text(item.title, margin + 24, y);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(item.desc, margin + 24, y + 4);

    y += 10;
  });

  y += 4;

  // =========================================================================
  // SECTION 1: END-USER OPERATIONAL MANUAL
  // =========================================================================
  addSectionHeader('1.0 END-USER OPERATIONAL MANUAL (USER GUIDE)', 'Detailed day-to-day workflow instructions for sales representatives, account managers, and support agents.');

  // 1.1 Navigation & Global Controls
  addSubsectionHeader('1.1 Navigation & Workspace Layout');
  addParagraph('The Compact SMB CRM interface is organized into a sticky top navigation header, a collateral left drawer navigation bar, an alert banner for PWA installation/offline status, and a primary interactive workspace.');
  addBullet('Global Search (Cmd/Ctrl + K)', 'Instantly search contacts, company accounts, deals, campaigns, and support cases across the entire active tenant using the top search modal.');
  addBullet('Tenant Organization Switcher', 'Top-left dropdown allowing authorized multi-organization users to toggle between different business tenants without logging out.');
  addBullet('Role Badge & Language Selector', 'Displays current user access level (OWNER, ADMIN, SALES_REP, READ_ONLY) and provides instant multilingual UI switching (English, Spanish, French, German, Turkish, Arabic).');
  addBullet('Offline Mode Simulation Toggle', 'Top header toggle to simulate network disconnection and test offline local data caching and action queueing.');
  y += 3;

  // 1.2 Contacts & Lead Ingestion
  addSubsectionHeader('1.2 Contact Management & Lead Ingestion');
  addParagraph('Contacts represent prospective leads, active customer accounts, and decision-maker profiles.');
  addBullet('Manual Lead Creation', 'Click "+ New Contact" to record First Name, Last Name, Email, Phone, Company, Job Title, and Lead Source (WEB, CSV, META, TIKTOK, LINKEDIN, DIRECT).');
  addBullet('Lead Lifecycle Stages', 'Track leads through defined progression stages: NEW -> CONTACTED -> QUALIFIED -> UNQUALIFIED -> CONVERTED.');
  addBullet('AI Lead Scoring Model', 'Automatic numerical scoring (0-100+) based on weighted parameters: Executive Job Titles (+20 pts), Corporate Domain Email (+15 pts), Recency of Logged Activities (+10 pts per call/meeting), and Explicit Opt-in (+25 pts).');
  addBullet('Compliance & Consent Flags', 'Track explicit opt-in permissions for Email, SMS, and WhatsApp messaging to guarantee compliance with TCPA and GDPR anti-spam regulations.');
  addBullet('CSV Contact Bulk Import', 'Upload structured CSV spreadsheets. Standard headers supported: first_name, last_name, email, phone, company, job_title, lead_source.');
  addBullet('Unified Activity Timeline Feed', 'Select any contact record to inspect a consolidated chronological feed containing logged phone calls, meeting summaries, sent email copies, and received WhatsApp threads.');
  y += 3;

  // 1.3 Sales Pipeline & Deals
  addSubsectionHeader('1.3 Sales Pipeline & Deal Tracking');
  addParagraph('Manage revenue opportunities using interactive Kanban boards with multi-stage stage transitions.');
  addBullet('Kanban Deal Stages', 'Default stages: 1. Qualification (10% win probability), 2. Meeting Scheduled (30%), 3. Proposal Sent (60%), 4. Negotiation (80%), 5. Closed Won (100%), 6. Closed Lost (0%).');
  addBullet('Drag-and-Drop Stage Updates', 'Drag deal cards across columns to automatically update stage status, recalculate weighted deal forecasting, and trigger automated notifications.');
  addBullet('Deal Split Revenue Attribution', 'Assign primary and secondary sales rep owners with customized revenue split percentages (e.g. Primary Owner 70% / Co-Owner 30%) for accurate commission reporting.');
  addBullet('Weighted Revenue Forecasting', 'Expected revenue is calculated automatically as [Deal Amount] × [Stage Win Probability %]. Pipeline metric cards reflect total vs. weighted pipeline values.');
  y += 3;

  // 1.4 Omnichannel Messaging
  addSubsectionHeader('1.4 Omnichannel Communications & Inbox');
  addParagraph('Unify customer engagement across Email, SMS, and WhatsApp from a single centralized inbox.');
  addBullet('Centralized Conversation Threads', 'View incoming messages from all channels in one chronological feed. Filter by channel (Email, SMS, WhatsApp) or unread status.');
  addBullet('WhatsApp 24-Hour Meta Session Rule', 'Free-form messaging is active for 24 hours after a customer initiates contact. When sending outbound messages outside the 24-hour window, the system automatically enforces pre-approved Meta WhatsApp Message Templates.');
  addBullet('Canned Response Shortcuts', 'Type shortcuts into the reply composer for rapid responses: /pricing (Send pricing tier breakdown), /demo (Book meeting calendar link), /support (Escalate ticket link), /discount (Attach 15% discount code).');
  addBullet('Outbound Channel Selection', 'Toggle between Email, SMS, or WhatsApp sending channels directly above the reply input text area.');
  y += 3;

  // 1.5 Support Cases & SLAs
  addSubsectionHeader('1.5 Support Cases & Service Level Agreements (SLAs)');
  addParagraph('Manage post-sales customer support inquiries with SLA tracking.');
  addBullet('Ticket Priority & Response SLAs', 'Support tickets are logged with four severity tiers: URGENT (2-Hour SLA), HIGH (8-Hour SLA), MEDIUM (24-Hour SLA), LOW (48-Hour SLA).');
  addBullet('Real-Time SLA Countdown Timer', 'Each case card displays an active countdown timer. Cases approaching SLA expiration (80% time elapsed) highlight in amber; breached cases flash red with automated admin escalation alerts.');
  addBullet('Resolution Workflow', 'Assign support cases to team members, record internal troubleshooting notes, and mark as RESOLVED with customer satisfaction (CSAT) survey tags.');
  y += 3;

  // 1.6 PWA & Offline Access
  addSubsectionHeader('1.6 Progressive Web App (PWA) & Offline Usage');
  addParagraph('Compact SMB CRM functions as an installable desktop and mobile application with full offline capabilities.');
  addBullet('1-Click PWA Installation', 'Click the "Install App" button in the top navigation header or browser bar to install the application natively on Windows, macOS, Android, or iOS.');
  addBullet('Offline Mode & Offline Action Queue', 'When disconnected from the internet, the CRM remains completely functional. Edits (adding contacts, moving deal stages, logging notes) are stored locally in an IndexedDB/localStorage offline queue and automatically replayed when network connection resumes.');
  addBullet('Web Push Alerts', 'Grant push notification permissions to receive instant desktop/mobile popups for new social lead ad ingestion, deal stage updates, and SLA breach warnings.');
  y += 5;

  // =========================================================================
  // SECTION 2: SAAS TENANT ADMINISTRATOR GUIDE
  // =========================================================================
  addSectionHeader('2.0 SAAS TENANT ADMINISTRATOR GUIDE (ADMIN GUIDE)', 'Administrative controls for subscription management, provider API integrations, role-based security, and tenant audit logs.');

  // 2.1 Billing & Quota Metering
  addSubsectionHeader('2.1 Multi-Tenant Plans & Resource Quota Metering');
  addParagraph('Tenant administrators can monitor subscription tiers and resource utilization metrics.');
  addBullet('FREE Tier', '1 Active User, 5,000 Monthly Messages, 1,000 Total Contacts, 1 Sales Pipeline.');
  addBullet('GROWTH Tier ($49/mo)', '5 Active Users, 50,000 Monthly Messages, 10,000 Total Contacts, 5 Sales Pipelines, Automated Social Lead Webhooks.');
  addBullet('SCALE Tier ($199/mo)', '25 Active Users, 250,000 Monthly Messages, 100,000 Total Contacts, Unlimited Pipelines, Dedicated Webhooks & Priority SLAs.');
  addBullet('Quota Enforcement Behavior', 'When a tenant reaches 80% or 95% of monthly message or contact limits, warning banners appear in Tenant Settings. At 100%, outbound automated dispatches pause until upgraded or reset.');
  y += 3;

  // 2.2 Transactional Email Providers
  addSubsectionHeader('2.2 Transactional Email Service Provider Setup');
  addParagraph('Connect your preferred enterprise transactional email dispatch vendor.');
  addBullet('Supported Providers', 'SendGrid, Mailgun, Resend, AWS SES (Simple Email Service), Postmark, and Custom SMTP.');
  addBullet('Configuration Fields', 'API Key / Auth Token, From Email Address, From Name, Region (for AWS SES, e.g., us-east-1).');
  addBullet('Connection Test Modal', 'Click "Test Connection" in Tenant Settings to dispatch an instant diagnostic payload via POST /api/integrations/test-email and verify API key authorization.');
  y += 3;

  // 2.3 Social Lead Ad Webhooks
  addSubsectionHeader('2.3 Social Media Lead Ad Webhook Setup');
  addParagraph('Automate lead capture from Meta (Facebook/Instagram Lead Ads), TikTok Ads, and LinkedIn Sponsored Content.');
  addBullet('OAuth Page Authorization', 'Click "Connect Account" under Meta, TikTok, or LinkedIn cards to initiate OAuth permissions for lead ad form access.');
  addBullet('Webhook Endpoint URL', 'Configure your social ad accounts or Zapier/Make webhooks to POST to: https://<your-domain>/api/webhooks/social-leads');
  addBullet('Automated Lead Processing', 'Incoming webhook payloads automatically parse lead contact details, calculate AI lead scores, assign default sales reps, and notify reps via Push Notification.');
  y += 3;

  // 2.4 RBAC Matrix
  addSubsectionHeader('2.4 Role-Based Access Control (RBAC) Matrix');
  addParagraph('Enforce security boundaries between team members:');
  addBullet('OWNER', 'Full administrative control over tenant settings, subscription billing, API key generation, provider integrations, and user management.');
  addBullet('ADMIN', 'Full access to CRM data, pipeline management, support case assignment, and user invitations; cannot alter billing or master keys.');
  addBullet('SALES_REP', 'Access to assigned contacts, deals, omnichannel inbox, and support cases; restricted from viewing tenant settings or exporting full contact lists.');
  addBullet('READ_ONLY', 'Auditor view with read access to dashboards and pipelines; cannot create, edit, or delete records.');
  y += 3;

  // 2.5 Security & Webhooks
  addSubsectionHeader('2.5 Security Keys & Outbound Webhooks');
  addBullet('Tenant Live API Keys', 'Generate secret API keys prefixed with ck_live_... for programmatic access to the CRM REST API.');
  addBullet('Outbound Event Subscriptions', 'Subscribe external endpoints to real-time CRM events: lead.created, deal.won, case.created, message.received.');
  y += 5;

  // =========================================================================
  // SECTION 3: DEVELOPER INTEGRATION & API REFERENCE
  // =========================================================================
  addSectionHeader('3.0 DEVELOPER INTEGRATION & API REFERENCE', 'Technical documentation for REST API endpoints, JSON payload structures, database schemas, and local CLI environment setup.');

  // 3.1 REST API Endpoints
  addSubsectionHeader('3.1 RESTful Endpoint Specifications');
  
  addParagraph('Ingests lead form submissions from Meta Lead Ads, TikTok Business Center, LinkedIn Ads, or custom web forms.', 'POST /api/webhooks/social-leads');
  addCodeBlock(
`// Request Headers:
// Content-Type: application/json
// x-tenant-id: tenant_acme_prod

// Request Payload:
{
  "platform": "META",
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane.doe@acme.com",
  "phone": "+15550192834",
  "company": "Acme Enterprises",
  "jobTitle": "VP of Operations",
  "leadSource": "Facebook Lead Ad - Q3 Campaign"
}

// Response (200 OK):
{
  "status": "success",
  "leadId": "contact_982341",
  "leadScore": 75,
  "assignedRepId": "user_sales_01",
  "createdAt": "2026-07-27T04:30:00Z"
}`, 'POST /api/webhooks/social-leads — Specification');

  addParagraph('Dispatches test diagnostic email to verify provider API key validity.', 'POST /api/integrations/test-email');
  addCodeBlock(
`// Request Payload:
{
  "provider": "SENDGRID",
  "fromEmail": "outreach@acmecloud.com",
  "toEmail": "admin@acmecloud.com",
  "subject": "Provider Verification Test"
}

// Response (200 OK):
{
  "status": "delivered",
  "providerResponseId": "sg_msg_88329104",
  "timestamp": "2026-07-27T04:32:10Z"
}`, 'POST /api/integrations/test-email — Specification');

  // 3.2 Data Models & TypeScript Schemas
  addSubsectionHeader('3.2 Database Schemas & TypeScript Types');
  addParagraph('Core data structures stored in Cloud Firestore and typed in /src/types.ts:');
  
  addCodeBlock(
`export interface Contact {
  id: string;
  tenantId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  jobTitle: string;
  leadSource: 'WEB' | 'CSV' | 'META' | 'TIKTOK' | 'LINKEDIN' | 'DIRECT';
  leadStatus: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'UNQUALIFIED' | 'CONVERTED';
  leadScore: number;
  emailOptIn: boolean;
  smsOptIn: boolean;
  whatsappOptIn: boolean;
  createdAt: string;
}

export interface Deal {
  id: string;
  tenantId: string;
  title: string;
  amount: number;
  stage: 'QUALIFICATION' | 'MEETING_SCHEDULED' | 'PROPOSAL_SENT' | 'NEGOTIATION' | 'CLOSED_WON' | 'CLOSED_LOST';
  probability: number;
  closeDate: string;
  primaryOwnerId: string;
  secondaryOwnerId?: string;
  ownerSplitPercent: number; // e.g. 70 = 70% primary, 30% secondary
  contactId: string;
  createdAt: string;
}

export interface SupportCase {
  id: string;
  tenantId: string;
  contactId: string;
  subject: string;
  priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'OPEN' | 'IN_PROGRESS' | 'WAITING_ON_CUSTOMER' | 'RESOLVED';
  slaMinutes: number; // e.g., URGENT = 120 mins
  createdAt: string;
  resolvedAt?: string;
}`, 'TypeScript Interfaces — /src/types.ts');

  // 3.3 Real-time Sync & CLI Commands
  addSubsectionHeader('3.3 Project Script Commands & CLI Tooling');
  addCodeBlock(
`# 1. Start Local Development Server (Express + Vite Middleware on Port 3000)
npm run dev

# 2. Production Build (Bundles Vite SPA + Esbuild CJS Server to /dist/server.cjs)
npm run build

# 3. Launch Production Standalone Server
npm run start

# 4. Run TypeScript Compiler & Linter Verification
npm run lint`, 'CLI Development Commands');

  y += 5;

  // =========================================================================
  // SECTION 4: ARCHITECT BLUEPRINT
  // =========================================================================
  addSectionHeader('4.0 HIGH-LEVEL ARCHITECTURE & SYSTEM BLUEPRINT', 'System design patterns, data isolation, offline resilience, and Progressive Web App topology.');

  // 4.1 Topology
  addSubsectionHeader('4.1 Full-Stack Topology & Container Host');
  addParagraph('Compact SMB CRM follows a full-stack single-port container architecture optimized for Cloud Run container hosting:');
  addBullet('Client Tier', 'Single-Page Application (SPA) built with React 18, Vite, Tailwind CSS, Lucide icons, and React Context (CRMContext.tsx).');
  addBullet('Server Tier', 'Node.js Express backend (server.ts) serving static built assets in production, handling Vite HMR in development, and proxying API endpoints (/api/*) on Port 3000.');
  addBullet('Database Tier', 'Google Cloud Firestore database providing real-time document listener synchronization (onSnapshot) and persistent multi-tenant data storage.');
  y += 3;

  // 4.2 Multi-Tenant Data Isolation
  addSubsectionHeader('4.2 Multi-Tenant Data Isolation Strategy');
  addParagraph('Multi-tenancy is enforced at both the application level and the database security rule layer:');
  addBullet('Document Partitioning', 'Every document stored in Firestore collections (contacts, deals, campaigns, integrators) contains a mandatory tenantId string property.');
  addBullet('Client Scoping', 'CRMContext automatically applies Firestore collection queries filtered by tenantId == currentTenantId.');
  addBullet('Security Rule Boundary', 'Firestore security rules reject write/read requests where request.auth.token.tenantId != resource.data.tenantId.');
  y += 3;

  // 4.3 Offline Action Synchronization Queue
  addSubsectionHeader('4.3 Offline Action Synchronization Queue');
  addParagraph('To ensure business continuity in low-connectivity or offline environments:');
  addBullet('Network Monitoring', 'usePWA hook and CRMContext listen to window online/offline events.');
  addBullet('Action Enqueueing', 'When offline (isOffline == true), user modifications (creating contacts, updating deal stages, logging activity notes) are pushed to an offlineQueue array stored in localStorage.');
  addBullet('Optimistic UI Updates', 'The UI updates instantly using optimistic local state changes, ensuring zero user interaction lag.');
  addBullet('Automatic Replay Sync', 'When the online event fires, the system iterates through offlineQueue, executing sequential REST/Firestore updates to synchronize local state with Cloud Firestore.');
  y += 3;

  // 4.4 Service Worker & PWA Topology
  addSubsectionHeader('4.4 Service Worker & PWA Caching Topology');
  addParagraph('The Service Worker (/public/sw.js) implements a dual caching strategy:');
  addBullet('App Shell Caching', 'Stale-While-Revalidate caching strategy for HTML, JavaScript bundles, CSS stylesheets, and icon assets.');
  addBullet('API Call Caching', 'Network-First strategy with local JSON fallback for /api/* endpoints.');
  addBullet('Web Push Listener', 'Implements self.addEventListener("push", ...) to parse VAPID push notifications and display native OS notification banners.');

  // =========================================================================
  // CALCULATE TOTAL PAGES & ADD FOOTERS TO ALL PAGES
  // =========================================================================
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addHeaderFooter(i, totalPages);
  }

  // Save the complete document PDF
  doc.save('Compact_SMB_CRM_System_Documentation.pdf');
}
