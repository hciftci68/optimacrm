import nodemailer from 'nodemailer';
import { BrevoClient, BrevoError } from '@getbrevo/brevo';

export interface EmailProviderConfig {
  provider: 'SMTP' | 'SENDGRID' | 'RESEND' | 'POSTMARK' | 'MAILGUN' | 'AWS_SES' | 'BREVO' | 'DEMO';
  apiKey?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  smtpSecure?: boolean;
  fromEmail: string;
  fromName: string;
}

export interface EmailRecipient {
  email: string;
  name?: string;
  variables?: Record<string, string>;
}

export interface SingleEmailRequest {
  config: EmailProviderConfig;
  toEmail: string;
  toName?: string;
  subject: string;
  htmlBody?: string;
  textBody?: string;
  replyTo?: string;
}

export interface BulkEmailRequest {
  config: EmailProviderConfig;
  recipients: EmailRecipient[];
  subject: string;
  htmlTemplate?: string;
  htmlBody?: string;
  sendDelayMs?: number; // Delay between emails in ms (e.g. 200ms)
}

export interface EmailDeliveryResult {
  recipientEmail: string;
  success: boolean;
  messageId?: string;
  statusCode?: number;
  error?: string;
  sentAt: string;
  latencyMs: number;
}

// 1. Send via SMTP (Nodemailer)
async function sendViaSmtp(
  config: EmailProviderConfig,
  toEmail: string,
  toName: string | undefined,
  subject: string,
  html: string,
  text?: string
): Promise<EmailDeliveryResult> {
  const startTime = Date.now();
  try {
    const transporter = nodemailer.createTransport({
      host: config.smtpHost || 'smtp.gmail.com',
      port: Number(config.smtpPort) || 587,
      secure: config.smtpSecure ?? (Number(config.smtpPort) === 465),
      auth: {
        user: config.smtpUser || '',
        pass: config.smtpPass || '',
      },
      tls: {
        rejectUnauthorized: false, // Prevents self-signed cert issues during testing
      },
    });

    const info = await transporter.sendMail({
      from: `"${config.fromName}" <${config.fromEmail}>`,
      to: toName ? `"${toName}" <${toEmail}>` : toEmail,
      subject,
      html,
      text: text || html.replace(/<[^>]*>?/gm, ''),
    });

    return {
      recipientEmail: toEmail,
      success: true,
      messageId: info.messageId,
      statusCode: 200,
      sentAt: new Date().toISOString(),
      latencyMs: Date.now() - startTime,
    };
  } catch (err: any) {
    return {
      recipientEmail: toEmail,
      success: false,
      error: err?.message || 'SMTP Email dispatch failed',
      statusCode: 500,
      sentAt: new Date().toISOString(),
      latencyMs: Date.now() - startTime,
    };
  }
}

// 2. Send via SendGrid API
async function sendViaSendGrid(
  config: EmailProviderConfig,
  toEmail: string,
  toName: string | undefined,
  subject: string,
  html: string
): Promise<EmailDeliveryResult> {
  const startTime = Date.now();
  if (!config.apiKey) {
    return {
      recipientEmail: toEmail,
      success: false,
      error: 'SendGrid API Key is missing',
      statusCode: 400,
      sentAt: new Date().toISOString(),
      latencyMs: Date.now() - startTime,
    };
  }

  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: toEmail, name: toName }],
          },
        ],
        from: { email: config.fromEmail, name: config.fromName },
        subject,
        content: [
          {
            type: 'text/html',
            value: html,
          },
        ],
      }),
    });

    if (response.status === 202 || response.status === 200) {
      return {
        recipientEmail: toEmail,
        success: true,
        messageId: `sg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        statusCode: response.status,
        sentAt: new Date().toISOString(),
        latencyMs: Date.now() - startTime,
      };
    } else {
      const errorText = await response.text();
      return {
        recipientEmail: toEmail,
        success: false,
        error: `SendGrid API Error (${response.status}): ${errorText}`,
        statusCode: response.status,
        sentAt: new Date().toISOString(),
        latencyMs: Date.now() - startTime,
      };
    }
  } catch (err: any) {
    return {
      recipientEmail: toEmail,
      success: false,
      error: err?.message || 'SendGrid fetch request failed',
      sentAt: new Date().toISOString(),
      latencyMs: Date.now() - startTime,
    };
  }
}

// 3. Send via Resend API
async function sendViaResend(
  config: EmailProviderConfig,
  toEmail: string,
  toName: string | undefined,
  subject: string,
  html: string
): Promise<EmailDeliveryResult> {
  const startTime = Date.now();
  if (!config.apiKey) {
    return {
      recipientEmail: toEmail,
      success: false,
      error: 'Resend API Key is missing',
      statusCode: 400,
      sentAt: new Date().toISOString(),
      latencyMs: Date.now() - startTime,
    };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${config.fromName} <${config.fromEmail}>`,
        to: [toEmail],
        subject,
        html,
      }),
    });

    const data = await response.json();
    if (response.ok) {
      return {
        recipientEmail: toEmail,
        success: true,
        messageId: data.id || `resend_${Date.now()}`,
        statusCode: response.status,
        sentAt: new Date().toISOString(),
        latencyMs: Date.now() - startTime,
      };
    } else {
      return {
        recipientEmail: toEmail,
        success: false,
        error: data.message || `Resend Error (${response.status})`,
        statusCode: response.status,
        sentAt: new Date().toISOString(),
        latencyMs: Date.now() - startTime,
      };
    }
  } catch (err: any) {
    return {
      recipientEmail: toEmail,
      success: false,
      error: err?.message || 'Resend API call failed',
      sentAt: new Date().toISOString(),
      latencyMs: Date.now() - startTime,
    };
  }
}

// 4. Send via Postmark API
async function sendViaPostmark(
  config: EmailProviderConfig,
  toEmail: string,
  toName: string | undefined,
  subject: string,
  html: string
): Promise<EmailDeliveryResult> {
  const startTime = Date.now();
  if (!config.apiKey) {
    return {
      recipientEmail: toEmail,
      success: false,
      error: 'Postmark Server Token is missing',
      statusCode: 400,
      sentAt: new Date().toISOString(),
      latencyMs: Date.now() - startTime,
    };
  }

  try {
    const response = await fetch('https://api.postmarkapp.com/email', {
      method: 'POST',
      headers: {
        'X-Postmark-Server-Token': config.apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        From: `${config.fromName} <${config.fromEmail}>`,
        To: toEmail,
        Subject: subject,
        HtmlBody: html,
      }),
    });

    const data = await response.json();
    if (response.ok && data.ErrorCode === 0) {
      return {
        recipientEmail: toEmail,
        success: true,
        messageId: data.MessageID || `pm_${Date.now()}`,
        statusCode: 200,
        sentAt: new Date().toISOString(),
        latencyMs: Date.now() - startTime,
      };
    } else {
      return {
        recipientEmail: toEmail,
        success: false,
        error: data.Message || `Postmark Error (${data.ErrorCode})`,
        statusCode: response.status,
        sentAt: new Date().toISOString(),
        latencyMs: Date.now() - startTime,
      };
    }
  } catch (err: any) {
    return {
      recipientEmail: toEmail,
      success: false,
      error: err?.message || 'Postmark API call failed',
      sentAt: new Date().toISOString(),
      latencyMs: Date.now() - startTime,
    };
  }
}

// 5. Send via Brevo SDK (@getbrevo/brevo)
async function sendViaBrevo(
  config: EmailProviderConfig,
  toEmail: string,
  toName: string | undefined,
  subject: string,
  html: string
): Promise<EmailDeliveryResult> {
  const startTime = Date.now();
  const apiKey = config.apiKey || process.env.BREVO_API_KEY || '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';
  if (!apiKey) {
    return {
      recipientEmail: toEmail,
      success: false,
      error: 'Brevo API Key is missing',
      statusCode: 400,
      sentAt: new Date().toISOString(),
      latencyMs: Date.now() - startTime,
    };
  }

  try {
    const brevo = new BrevoClient({
      apiKey,
      timeoutInSeconds: 30,
      maxRetries: 3,
    });

    const result = await brevo.transactionalEmails.sendTransacEmail({
      subject: subject,
      htmlContent: html,
      sender: {
        name: config.fromName || 'CRM Team',
        email: config.fromEmail || 'hciftci68@gmail.com',
      },
      to: [
        {
          email: toEmail,
          name: toName || toEmail.split('@')[0],
        },
      ],
    });

    return {
      recipientEmail: toEmail,
      success: true,
      messageId: result.messageId || `brevo_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      statusCode: 201,
      sentAt: new Date().toISOString(),
      latencyMs: Date.now() - startTime,
    };
  } catch (err: any) {
    let statusCode = err?.statusCode || err?.status || 500;
    let errorMessage = err?.message || 'Brevo API call failed';

    if (statusCode === 401 || errorMessage.includes('unrecognised IP') || errorMessage.includes('unauthorized')) {
      statusCode = 401;
      errorMessage = 'Brevo IP Authorization Required: Please add IP address 34.96.39.246 to https://app.brevo.com/security/authorised_ips';
    } else if (statusCode === 429) {
      errorMessage = `Brevo Rate Limited: ${errorMessage}`;
    } else if (err instanceof BrevoError) {
      errorMessage = `Brevo API Error (${statusCode}): ${errorMessage}`;
    }

    return {
      recipientEmail: toEmail,
      success: false,
      error: errorMessage,
      statusCode,
      sentAt: new Date().toISOString(),
      latencyMs: Date.now() - startTime,
    };
  }
}

// 6. Main Single Dispatcher
export async function sendSingleEmail(req: SingleEmailRequest): Promise<EmailDeliveryResult> {
  const { config, toEmail, toName, subject, htmlBody, textBody } = req;
  const finalHtml = htmlBody || `<p>${textBody || 'Test email content'}</p>`;

  // Brevo detection (either explicit BREVO provider or API key matching Brevo format 'xkeysib-')
  if (config.provider === 'BREVO' || (config.apiKey && config.apiKey.startsWith('xkeysib-')) || (!config.apiKey && process.env.BREVO_API_KEY)) {
    return sendViaBrevo(config, toEmail, toName, subject, finalHtml);
  }

  // If provider is SMTP or if SMTP host/user are filled
  if (config.provider === 'SMTP' || (config.smtpHost && config.smtpUser)) {
    return sendViaSmtp(config, toEmail, toName, subject, finalHtml, textBody);
  }

  if (config.provider === 'SENDGRID') {
    return sendViaSendGrid(config, toEmail, toName, subject, finalHtml);
  }

  if (config.provider === 'RESEND') {
    return sendViaResend(config, toEmail, toName, subject, finalHtml);
  }

  if (config.provider === 'POSTMARK') {
    return sendViaPostmark(config, toEmail, toName, subject, finalHtml);
  }

  // Demo / Sandbox mode fallback if no keys configured
  const startTime = Date.now();
  await new Promise((r) => setTimeout(r, 150));
  return {
    recipientEmail: toEmail,
    success: true,
    messageId: `demo_msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    statusCode: 200,
    sentAt: new Date().toISOString(),
    latencyMs: Date.now() - startTime,
  };
}

// Helper: Replace template variables
export function renderTemplate(template?: string, vars: Record<string, string> = {}): string {
  if (!template) return '';
  let output = template;
  Object.entries(vars).forEach(([key, val]) => {
    const reg = new RegExp(`{{\\s*${key}\\s*}}`, 'gi');
    output = output.replace(reg, val || '');
  });
  return output;
}

// 6. Bulk Email Dispatcher
export async function sendBulkEmails(
  req: BulkEmailRequest,
  onProgress?: (result: EmailDeliveryResult, current: number, total: number) => void
): Promise<{
  total: number;
  successful: number;
  failed: number;
  durationMs: number;
  results: EmailDeliveryResult[];
}> {
  const startTime = Date.now();
  const results: EmailDeliveryResult[] = [];
  let successful = 0;
  let failed = 0;

  for (let i = 0; i < req.recipients.length; i++) {
    const recipient = req.recipients[i];
    const vars = {
      firstName: recipient.name?.split(' ')[0] || 'Değerli Müşterimiz',
      name: recipient.name || recipient.email,
      email: recipient.email,
      company: recipient.variables?.company || '',
      ...(recipient.variables || {}),
    };

    const renderedSubject = renderTemplate(req.subject, vars);
    const renderedHtml = renderTemplate(req.htmlTemplate || req.htmlBody || '', vars);

    const singleResult = await sendSingleEmail({
      config: req.config,
      toEmail: recipient.email,
      toName: recipient.name,
      subject: renderedSubject,
      htmlBody: renderedHtml,
    });

    results.push(singleResult);
    if (singleResult.success) {
      successful++;
    } else {
      failed++;
    }

    if (onProgress) {
      onProgress(singleResult, i + 1, req.recipients.length);
    }

    // Delay between sends if specified to avoid rate limits
    if (req.sendDelayMs && i < req.recipients.length - 1) {
      await new Promise((r) => setTimeout(r, req.sendDelayMs));
    }
  }

  return {
    total: req.recipients.length,
    successful,
    failed,
    durationMs: Date.now() - startTime,
    results,
  };
}
