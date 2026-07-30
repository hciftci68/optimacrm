export type UserRole = 'OWNER' | 'ADMIN' | 'SALES_REP' | 'READ_ONLY';

export interface Tenant {
  id: string;
  name: string;
  plan: 'STARTER' | 'GROWTH' | 'SCALE';
  maxUsers: number;
  maxContacts: number;
  monthlyMessageQuota: number;
  usedMessagesThisMonth: number;
  currency: string;
  trialEndsAt?: string;
  createdAt: string;
}

export interface User {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  password?: string;
  teamId?: string;
  departmentId?: string;
  position?: 'HEAD' | 'DEPARTMENT_MANAGER' | 'TEAM_LEAD' | 'STAFF';
  reportsToUserId?: string;
  active: boolean;
}

export interface Team {
  id: string;
  tenantId: string;
  name: string;
  leadUserId: string;
  memberUserIds: string[];
}

export interface Territory {
  id: string;
  tenantId: string;
  name: string;
  regionCode: string; // e.g., 'US-EAST', 'EU-CENTRAL', 'APAC'
  assignedTeamId: string;
}

export interface LocationCountry {
  id: string;
  tenantId?: string;
  code: string;
  name: string;
}

export interface LocationCity {
  id: string;
  tenantId?: string;
  countryId: string;
  countryName?: string;
  name: string;
}

export interface LocationDistrict {
  id: string;
  tenantId?: string;
  cityId: string;
  cityName?: string;
  countryId?: string;
  name: string;
}

export interface Account {
  id: string;
  tenantId: string;
  name: string;
  domain: string;
  industry: string;
  employeeCount: number;
  annualRevenue: number;
  phone: string;
  address: string;
  addressLine?: string;
  district?: string;
  city?: string;
  country?: string;
  tags: string[];
  ownerId: string;
  customFields?: Record<string, string | number | boolean>;
  createdAt: string;
  updatedAt: string;
}

export interface ContactConsent {
  emailOptIn: boolean;
  smsOptIn: boolean;
  whatsAppOptIn: boolean;
  unsubscribedAt?: string;
}

export interface Contact {
  id: string;
  tenantId: string;
  firstName: string;
  lastName: string;
  email: string;
  secondaryEmail?: string;
  phone: string;
  workPhone?: string;
  jobTitle: string;
  accountId?: string;
  accountName?: string;
  address?: string;
  addressLine?: string;
  district?: string;
  city?: string;
  country?: string;
  leadStatus: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'UNQUALIFIED';
  leadScore: number; // Rules-based Lead score
  consent: ContactConsent;
  tags: string[];
  ownerId: string;
  customFields?: Record<string, string | number | boolean>;
  isSoftDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PipelineStage {
  id: string;
  name: string;
  order: number;
  probability: number; // 0 to 100
  color: string;
}

export interface Pipeline {
  id: string;
  tenantId: string;
  name: string;
  stages: PipelineStage[];
}

export interface DimensionFieldDef {
  id: string;
  key: string;
  label: string;
  dataType: 'TEXT' | 'NUMBER' | 'SELECT' | 'BOOLEAN';
  options?: string[]; // for SELECT
  unit?: string; // e.g. "cm", "kg", "GB", "Saat", "Ay"
}

export interface ProductGroup {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  type: 'PRODUCT' | 'SERVICE';
  description?: string;
  dimensions: DimensionFieldDef[];
  createdAt: string;
}

export interface ProductCatalogItem {
  id: string;
  tenantId: string;
  sku: string;
  name: string;
  type: 'PRODUCT' | 'SERVICE';
  groupId?: string;
  groupName?: string;
  unitPrice: number;
  currency: string;
  unit: string; // e.g., 'Adet', 'Saat', 'Lisans', 'Ay', 'Proje'
  active: boolean;
  description?: string;
  dimensions?: Record<string, string | number | boolean>;
  customDimensionDefs?: DimensionFieldDef[];
}

export type OrderStatus = 'DRAFT' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'FULFILLED' | 'CANCELLED';

export interface OrderLineItem {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  type: 'PRODUCT' | 'SERVICE';
  unitPrice: number;
  quantity: number;
  discountPercent: number;
  subtotal: number;
  dimensions?: Record<string, string | number | boolean>;
}

export interface Order {
  id: string;
  tenantId: string;
  orderNumber: string; // e.g., ORD-2026-001
  dealId?: string;
  dealTitle?: string;
  contactId: string;
  contactName: string;
  accountId?: string;
  accountName?: string;
  status: OrderStatus;
  lineItems: OrderLineItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  currency: string;
  paymentStatus: 'UNPAID' | 'PARTIAL' | 'PAID';
  paidAmount?: number;
  shippingAddress?: string;
  shippingAddressLine?: string;
  shippingDistrict?: string;
  shippingCity?: string;
  shippingCountry?: string;
  notes?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export type OrgNodeType = 'HEAD' | 'DEPARTMENT' | 'UNIT';

export interface OrgNode {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  type: OrgNodeType;
  parentId?: string; // HQ or parent department
  managerUserId?: string;
  description?: string;
}

export type DataAccessScope = 'OWN' | 'SUBORDINATES' | 'DEPARTMENT' | 'COMPANY';
export type AccessRight = 'NONE' | 'READ' | 'READ_WRITE' | 'FULL';

export interface AuditMetadata {
  createdUser?: string;
  createdDateTime?: string;
  lastModifiedUser?: string;
  lastModifiedDateTime?: string;
}

export interface OrgPermissionRule {
  id: string;
  tenantId: string;
  roleOrPosition: 'HEAD' | 'DEPARTMENT_MANAGER' | 'TEAM_LEAD' | 'STAFF' | 'ADMIN' | 'SALES_REP' | 'READ_ONLY';
  departmentId?: string; // Specific dept or all
  dataScope: DataAccessScope;
  entityPermissions: {
    contacts: AccessRight;
    deals: AccessRight;
    orders: AccessRight;
    cases: AccessRight;
    reports: AccessRight;
  };
  canExportData?: boolean;
  canImportData?: boolean;
}

export interface DealLineItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discountPercent: number;
  subtotal: number;
}

export interface DealProposal {
  id: string;
  version: number;
  title: string;
  amount: number;
  currency: string;
  fileName: string;
  fileType: 'pdf' | 'doc' | 'docx' | 'xls' | 'xlsx' | 'other';
  fileSize?: string;
  fileUrl?: string;
  note?: string;
  createdAt: string;
  createdByName?: string;
}

export interface Deal {
  id: string;
  tenantId: string;
  title: string;
  contactId: string;
  accountId?: string;
  pipelineId: string;
  stageId: string;
  amount: number;
  currency: string;
  probability: number;
  expectedCloseDate: string;
  ownerId: string;
  status: 'OPEN' | 'WON' | 'LOST';
  lostReason?: string;
  lostReasonDetails?: string;
  lineItems?: DealLineItem[];
  proposals?: DealProposal[];
  campaignId?: string;
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus = 'NEW' | 'RUNNING' | 'COMPLETED' | 'CANCELLED' | 'DELETED' | 'OPEN' | 'DONE';

export interface TaskWorkLog {
  id: string;
  userId: string;
  userName: string;
  note: string;
  timestamp: string;
}

export interface Task {
  id: string;
  tenantId: string;
  title: string;
  description?: string;
  dueDate: string;
  status: TaskStatus;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  creatorId?: string;
  assigneeId: string;
  linkedDealId?: string;
  linkedContactId?: string;
  linkedCaseId?: string;
  reminderScheduled?: boolean;
  workLogs?: TaskWorkLog[];
  createdAt: string;
  updatedAt?: string;
}

export type ActivityType =
  | 'NOTE'
  | 'CALL'
  | 'MEETING'
  | 'STAGE_CHANGE'
  | 'EMAIL_SENT'
  | 'SMS_SENT'
  | 'WHATSAPP_SENT'
  | 'TASK_COMPLETED'
  | 'CASE_CREATED'
  | 'CAMPAIGN_SENT';

export interface Activity {
  id: string;
  tenantId: string;
  type: ActivityType;
  title: string;
  description: string;
  contactId?: string;
  dealId?: string;
  caseId?: string;
  userId: string;
  userName: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

export type MessageChannel = 'EMAIL' | 'SMS' | 'WHATSAPP' | 'FACEBOOK' | 'INSTAGRAM' | 'TIKTOK' | 'LINKEDIN' | 'TWITTER';
export type MessageStatus = 'QUEUED' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';

export interface Message {
  id: string;
  tenantId: string;
  threadId: string;
  contactId: string;
  channel: MessageChannel;
  direction: 'INBOUND' | 'OUTBOUND';
  senderName: string;
  senderAddress: string;
  content: string;
  status: MessageStatus;
  templateId?: string;
  timestamp: string;
}

export interface MessageThread {
  id: string;
  tenantId: string;
  contactId: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  lastMessageSnippet: string;
  lastChannel: MessageChannel;
  lastMessageTimestamp: string;
  unreadCount: number;
}

export interface MessageTemplate {
  id: string;
  tenantId: string;
  name: string;
  channel: MessageChannel;
  subject?: string;
  body: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  category?: 'PROMOTIONAL' | 'TRANSACTIONAL' | 'ONBOARDING' | 'NEWSLETTER' | 'FOLLOW_UP' | 'CUSTOM';
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SegmentFilterRule {
  field: string;
  operator: 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'in';
  value: string | number;
}

export interface Segment {
  id: string;
  tenantId: string;
  name: string;
  type: 'STATIC' | 'DYNAMIC';
  rules: SegmentFilterRule[];
  contactCount: number;
  createdAt: string;
}

export interface CampaignRecipient {
  id: string;
  contactId: string;
  contactName: string;
  contactEmail: string;
  variant?: 'A' | 'B';
  status: 'QUEUED' | 'SENT' | 'DELIVERED' | 'OPENED' | 'CLICKED' | 'REPLIED' | 'BOUNCED' | 'UNSUBSCRIBED';
  sentAt?: string;
}

export interface SocialPlatformConfig {
  postType?: 'ORGANIC_POST' | 'SPONSORED_AD' | 'LEAD_AD';
  pageId?: string;
  adAccountId?: string;
  mediaUrls?: string[];
  callToActionUrl?: string;
  budget?: number;
  targetDemographics?: string;
}

export interface CampaignStats {
  totalRecipients: number;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  replied: number;
  unsubscribed: number;
  impressions?: number;
  reach?: number;
  engagementRate?: number;
  leadsGenerated?: number;
  spend?: number;
}

export interface Campaign {
  id: string;
  tenantId: string;
  name: string;
  channel: MessageChannel;
  segmentId: string;
  templateId?: string;
  subject?: string;
  body?: string;
  contentVariantA: string;
  contentVariantB?: string;
  hasABTest: boolean;
  scheduleType: 'NOW' | 'SCHEDULED' | 'RECURRING';
  scheduledAt?: string;
  status: 'DRAFT' | 'SCHEDULED' | 'SENDING' | 'SENT' | 'PAUSED';
  socialPlatformConfig?: SocialPlatformConfig;
  stats: CampaignStats;
  createdAt: string;
}

export type SocialProvider = 'META' | 'TIKTOK' | 'LINKEDIN' | 'TWITTER';

export interface SocialAccountIntegration {
  id: string;
  tenantId: string;
  provider: SocialProvider;
  accountName: string;
  pageOrAccountId: string;
  status: 'CONNECTED' | 'DISCONNECTED' | 'EXPIRED';
  accessTokenMasked: string;
  appId?: string;
  autoSyncLeads: boolean;
  connectedAt: string;
  lastSyncedAt?: string;
}

export type EmailProviderType = 'BREVO' | 'SENDGRID' | 'MAILGUN' | 'RESEND' | 'AWS_SES' | 'POSTMARK' | 'SMTP';

export interface EmailProviderIntegration {
  id: string;
  tenantId: string;
  provider: EmailProviderType;
  apiKeyMasked: string;
  fromEmail: string;
  fromName: string;
  status: 'CONNECTED' | 'DISCONNECTED';
  testedAt?: string;
}

// PROMPT 13: Service Management (Cases & SLA)
export type CasePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type CaseStatus = 'NEW' | 'OPEN' | 'PENDING' | 'RESOLVED' | 'CLOSED';

export interface CaseNote {
  id: string;
  authorId: string;
  authorName: string;
  content: string;
  isInternalOnly: boolean; // Enforced at API level
  createdAt: string;
}

export interface CaseItem {
  id: string;
  tenantId: string;
  caseNumber: string;
  subject: string;
  description: string;
  status: CaseStatus;
  priority: CasePriority;
  contactId: string;
  accountId?: string;
  dealId?: string;
  assigneeId: string;
  sourceChannel: MessageChannel | 'MANUAL';
  slaResponseDeadline: string;
  slaResolutionDeadline: string;
  slaStatus: 'ON_TIME' | 'AT_RISK' | 'BREACHED';
  csatRating?: number; // 1 to 5
  notes: CaseNote[];
  createdAt: string;
  resolvedAt?: string;
}

export interface CannedResponse {
  id: string;
  tenantId: string;
  title: string;
  category: string;
  content: string;
  channel: MessageChannel;
}

// PROMPT 14 & 15: Reports & Dashboard Widgets
export type ReportSource = 'CONTACT' | 'DEAL' | 'CASE' | 'CAMPAIGN';

export interface ReportDefinition {
  id: string;
  tenantId: string;
  title: string;
  source: ReportSource;
  groupByField?: string;
  aggregateFunc?: 'COUNT' | 'SUM' | 'AVG';
  aggregateField?: string;
  columns: string[];
  isPrebuilt?: boolean;
  createdAt: string;
}

export type WidgetType = 'KPI_CARD' | 'BAR_CHART' | 'LINE_CHART' | 'PIE_CHART' | 'TOP_REPS' | 'TABLE';

export interface WidgetConfig {
  id: string;
  title: string;
  type: WidgetType;
  reportId?: string;
  metricKey?: 'pipeline_value' | 'win_rate' | 'avg_deal_size' | 'open_cases' | 'campaign_engagement';
  gridSpan: 1 | 2 | 3 | 4; // Width in layout columns
}

export interface DashboardLayout {
  id: string;
  tenantId: string;
  role: UserRole;
  name: string;
  widgets: WidgetConfig[];
}

// PROMPT 16: Lead Scoring Rule
export interface LeadScoringRule {
  id: string;
  tenantId: string;
  name: string;
  conditionField: string;
  conditionOperator: 'equals' | 'greaterThan' | 'contains';
  conditionValue: string | number;
  pointsDelta: number;
}

// PROMPT 17: Custom Fields & Workflow Automation
export type CustomFieldDataType = 'TEXT' | 'NUMBER' | 'DATE' | 'DROPDOWN' | 'CHECKBOX';

export interface CustomFieldDefinition {
  id: string;
  tenantId: string;
  entityType: 'CONTACT' | 'ACCOUNT' | 'DEAL' | 'CASE';
  key: string;
  label: string;
  dataType: CustomFieldDataType;
  options?: string[]; // for DROPDOWN
  required: boolean;
}

export interface AutomationRule {
  id: string;
  tenantId: string;
  name: string;
  trigger: 'CONTACT_CREATED' | 'DEAL_STAGE_CHANGED' | 'TASK_OVERDUE' | 'CASE_CREATED' | 'TAG_ADDED';
  conditionField?: string;
  conditionValue?: string;
  actionType: 'SEND_EMAIL' | 'SEND_MESSAGE' | 'SEND_MESSAGE_TEMPLATE' | 'CREATE_TASK' | 'ASSIGN_OWNER' | 'ADD_TAG' | 'SEND_NOTIFICATION';
  actionPayload: Record<string, any>;
  enabled: boolean;
  runCount: number;
  lastRunAt?: string;
}

export interface AutomationStepLog {
  stepName: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'SKIPPED';
  details: string;
  timestamp: string;
}

export interface AutomationLog {
  id: string;
  automationId: string;
  automationName: string;
  triggeredByEntity: string;
  triggerType?: string;
  actionType?: string;
  recipient?: string;
  status: 'SUCCESS' | 'LOOP_CAP_EXCEEDED' | 'FAILED';
  details: string;
  errorDetails?: string;
  steps?: AutomationStepLog[];
  latencyMs?: number;
  timestamp: string;
}

// PROMPT 18: Document Management & Product Catalog
export interface DocumentFile {
  id: string;
  tenantId: string;
  name: string;
  sizeBytes: number;
  mimeType: string;
  linkedEntityType: 'CONTACT' | 'ACCOUNT' | 'DEAL' | 'CASE';
  linkedEntityId: string;
  uploaderName: string;
  signedUrl: string;
  isVirusScanned: boolean;
  createdAt: string;
}

// PROMPT 19: Notifications
export interface Notification {
  id: string;
  tenantId: string;
  userId: string;
  title: string;
  message: string;
  type: 'TASK_DUE' | 'DEAL_ASSIGNED' | 'SLA_RISK' | 'MENTION';
  isRead: boolean;
  actionLink?: string;
  createdAt: string;
}

// PROMPT 20: Public API & Webhooks
export interface ApiKey {
  id: string;
  tenantId: string;
  name: string;
  keyPrefix: string;
  secretKey: string;
  createdAt: string;
  lastUsedAt?: string;
}

export interface WebhookSubscription {
  id: string;
  tenantId: string;
  event: 'deal.won' | 'contact.created' | 'case.created' | 'campaign.sent';
  targetUrl: string;
  secretHmac: string;
  enabled: boolean;
}

export interface WebhookLog {
  id: string;
  subscriptionId: string;
  event: string;
  responseStatus: number;
  payloadSnippet: string;
  timestamp: string;
}

export interface OfflineAction {
  id: string;
  type: 'CREATE_TASK' | 'CREATE_NOTE' | 'UPDATE_DEAL_STAGE' | 'SEND_MESSAGE' | 'CREATE_CASE';
  payload: any;
  createdAt: string;
}

export type Language = 'en' | 'tr' | 'de';

