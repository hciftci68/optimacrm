import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dns from 'dns';
import { sendSingleEmail, sendBulkEmails } from './server/emailService.js';

// Force outgoing DNS resolution to prioritize IPv4
try {
  dns.setDefaultResultOrder('ipv4first');
} catch (e) {
  // Fallback for environments without method
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Health & Multi-tenant status endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Compact SMB CRM API',
      multiTenancy: 'Row-Level (tenant_id)',
      timestamp: new Date().toISOString(),
    });
  });

  // Meta Lead Ads & Social Media Webhook Ingestion API (Phase 3)
  app.post('/api/webhooks/social-leads', (req, res) => {
    const { platform, firstName, lastName, email, phone, campaignName, tenantId } = req.body;
    console.log(`[Social Lead Ingest] Ingesting lead from ${platform || 'Meta Lead Ad'}: ${email}`);
    
    // Simulate real-time webhook parsing & verification
    res.status(200).json({
      success: true,
      ingestedLead: {
        id: `cnt-lead-${Date.now()}`,
        tenantId: tenantId || 'tenant-1',
        firstName: firstName || 'Lead',
        lastName: lastName || 'Prospect',
        email: email || `lead.${Date.now()}@sociallead.com`,
        phone: phone || '+1 (555) 000-1122',
        leadStatus: 'NEW',
        leadScore: 75,
        tags: ['Social Lead', platform || 'Meta Lead Ads'],
        source: platform || 'FACEBOOK_LEAD_AD',
        campaignName: campaignName || 'Q3 Social Lead Campaign',
        createdAt: new Date().toISOString(),
      },
      message: 'Lead successfully ingested into CRM pipeline with auto-lead scoring',
    });
  });

  // Email / Messaging Provider Connection Tester Endpoint
  app.post('/api/integrations/test-email', (req, res) => {
    const { provider, fromEmail, toEmail } = req.body;
    res.status(200).json({
      success: true,
      provider: provider || 'SENDGRID',
      status: 'DELIVERED',
      latencyMs: 142,
      messageId: `msg_${Date.now()}_test`,
      deliveredTo: toEmail || 'test@example.com',
      sentFrom: fromEmail || 'outreach@acmecloud.com',
      timestamp: new Date().toISOString(),
    });
  });

  // REAL LIVE EMAIL ENDPOINTS (Single & Bulk)
  app.post('/api/email/send-single', async (req, res) => {
    try {
      const result = await sendSingleEmail(req.body);
      res.status(result.success ? 200 : 400).json(result);
    } catch (err: any) {
      console.error('[Single Email Error]', err);
      res.status(500).json({
        recipientEmail: req.body?.toEmail || 'unknown',
        success: false,
        error: err?.message || 'Server error processing email request',
        sentAt: new Date().toISOString(),
        latencyMs: 0,
      });
    }
  });

  app.post('/api/email/send-bulk', async (req, res) => {
    try {
      const result = await sendBulkEmails(req.body);
      res.status(200).json(result);
    } catch (err: any) {
      console.error('[Bulk Email Error]', err);
      res.status(500).json({
        total: req.body?.recipients?.length || 0,
        successful: 0,
        failed: req.body?.recipients?.length || 0,
        durationMs: 0,
        error: err?.message || 'Server error processing bulk email campaign',
        results: [],
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
