import { Contact, Deal } from '../types';

export const renderTemplatePlaceholders = (
  text: string,
  contact?: Contact | null,
  deal?: Deal | null,
  userName?: string,
  tenantName?: string
): string => {
  if (!text) return '';
  let rendered = text;

  // Contact variables
  const firstName = contact?.firstName || 'Valued';
  const lastName = contact?.lastName || 'Customer';
  const email = contact?.email || 'customer@example.com';
  const phone = contact?.phone || '+1-555-0199';
  const company = contact?.accountName || 'Acme Inc';
  const jobTitle = contact?.jobTitle || 'Executive';

  rendered = rendered
    .replace(/\{\{contact\.firstName\}\}/g, firstName)
    .replace(/\{\{contact\.lastName\}\}/g, lastName)
    .replace(/\{\{contact\.email\}\}/g, email)
    .replace(/\{\{contact\.phone\}\}/g, phone)
    .replace(/\{\{contact\.company\}\}/g, company)
    .replace(/\{\{contact\.jobTitle\}\}/g, jobTitle)
    // Legacy fallback variables
    .replace(/\{\{first_name\}\}/g, firstName)
    .replace(/\{\{last_name\}\}/g, lastName)
    .replace(/\{\{company\}\}/g, company)
    .replace(/\{\{user_name\}\}/g, userName || 'Support Team');

  // User / Tenant variables
  rendered = rendered
    .replace(/\{\{user\.name\}\}/g, userName || 'Sales Manager')
    .replace(/\{\{user\.email\}\}/g, 'user@crm.com')
    .replace(/\{\{tenant\.name\}\}/g, tenantName || 'Acme Cloud Solutions');

  // Deal variables
  const dealTitle = deal?.title || 'Enterprise License Deal';
  const dealAmount = deal?.amount ? `$${deal.amount.toLocaleString()}` : '$25,000';
  rendered = rendered
    .replace(/\{\{deal\.title\}\}/g, dealTitle)
    .replace(/\{\{deal\.amount\}\}/g, dealAmount);

  // Order variables
  rendered = rendered
    .replace(/\{\{order\.number\}\}/g, 'ORD-2026-009')
    .replace(/\{\{order\.total\}\}/g, '$1,450.00');

  return rendered;
};
