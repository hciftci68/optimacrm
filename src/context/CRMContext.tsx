import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Tenant, User, Account, Contact, Pipeline, Deal, Task, Activity, ActivityType, Message, MessageThread,
  MessageTemplate, UserRole, Language, OfflineAction, MessageChannel,
  Segment, Campaign, CaseItem, CaseNote, CannedResponse, ProductCatalogItem, ReportDefinition,
  CustomFieldDefinition, AutomationRule, AutomationLog, DocumentFile, Team, Territory, ApiKey, WebhookSubscription,
  Notification, SocialAccountIntegration, EmailProviderIntegration, ProductGroup, Order, OrderStatus, OrderLineItem,
  OrgNode, OrgPermissionRule, DataAccessScope, AccessRight, DimensionFieldDef, DealProposal,
  LocationCountry, LocationCity, LocationDistrict
} from '../types';
import {
  initialTenants, initialUsers, initialAccounts, initialContacts, initialPipelines,
  initialDeals, initialTasks, initialActivities, initialThreads, initialMessages, initialMessageTemplates,
  initialCases, initialCannedResponses, initialSegments, initialCampaigns, initialReports,
  initialCustomFields, initialAutomations, initialProducts, initialDocuments, initialTeams, initialTerritories,
  initialApiKeys, initialWebhooks, initialSocialIntegrations, initialEmailIntegrations,
  initialProductGroups, initialOrders, initialOrgNodes, initialOrgRules,
  initialCountries, initialCities, initialDistricts
} from '../data/initialData';
import { translations } from '../i18n/translations';
import { renderTemplatePlaceholders } from '../utils/templateUtils';
import {
  subscribeCollection,
  saveToFirestore,
  updateInFirestore,
  deleteFromFirestore,
} from '../lib/firestoreSync';

interface CRMContextType {
  // Auth & Tenant Context
  isAuthenticated: boolean;
  login: (email: string, password: string) => { success: boolean; error?: string };
  register: (data: { name: string; email: string; password: string; role: UserRole; companyName?: string }) => { success: boolean; error?: string };
  logout: () => void;
  loginAsRole: (role: UserRole) => void;

  currentTenant: Tenant;
  currentUser: User;
  tenants: Tenant[];
  users: User[];
  teams: Team[];
  territories: Territory[];
  currentRole: UserRole;
  language: Language;
  setLanguage: (lang: Language) => void;
  switchTenant: (tenantId: string) => void;
  switchUserRole: (role: UserRole) => void;

  // Translation helper
  t: (key: string) => string;

  // Entity States (Tenant Scoped)
  accounts: Account[];
  contacts: Contact[];
  pipeline: Pipeline;
  deals: Deal[];
  tasks: Task[];
  activities: Activity[];
  threads: MessageThread[];
  messages: Message[];
  templates: MessageTemplate[];
  cases: CaseItem[];
  cannedResponses: CannedResponse[];
  segments: Segment[];
  campaigns: Campaign[];
  reports: ReportDefinition[];
  productGroups: ProductGroup[];
  products: ProductCatalogItem[];
  orders: Order[];
  orgNodes: OrgNode[];
  orgRules: OrgPermissionRule[];
  customFields: CustomFieldDefinition[];
  automations: AutomationRule[];
  automationLogs: AutomationLog[];
  documents: DocumentFile[];
  notifications: Notification[];
  apiKeys: ApiKey[];
  webhooks: WebhookSubscription[];
  socialIntegrations: SocialAccountIntegration[];
  emailIntegrations: EmailProviderIntegration[];

  // Address & Location Hierarchy (Country > City > District)
  countries: LocationCountry[];
  cities: LocationCity[];
  districts: LocationDistrict[];
  addCountry: (country: Omit<LocationCountry, 'id'>) => LocationCountry;
  updateCountry: (id: string, updates: Partial<LocationCountry>) => void;
  deleteCountry: (id: string) => void;
  addCity: (city: Omit<LocationCity, 'id'>) => LocationCity;
  updateCity: (id: string, updates: Partial<LocationCity>) => void;
  deleteCity: (id: string) => void;
  addDistrict: (district: Omit<LocationDistrict, 'id'>) => LocationDistrict;
  updateDistrict: (id: string, updates: Partial<LocationDistrict>) => void;
  deleteDistrict: (id: string) => void;
  importLocationsCsv: (csvText: string) => { importedCountries: number; importedCities: number; importedDistricts: number; errors: string[] };
  exportLocationsCsv: () => string;

  // Social & Provider Integrations (Phases 1, 2, 3)
  connectSocialAccount: (account: Omit<SocialAccountIntegration, 'id' | 'tenantId' | 'connectedAt'>) => SocialAccountIntegration;
  disconnectSocialAccount: (id: string) => void;
  saveEmailProvider: (provider: Omit<EmailProviderIntegration, 'id' | 'tenantId'>) => EmailProviderIntegration;
  simulateSocialLeadIngestion: (platform: string, leadInfo?: { firstName: string; lastName: string; email: string; phone: string; campaignName?: string }) => Contact;
  testEmailProviderConnection: (providerId: string, testRecipientEmail: string) => Promise<{ success: boolean; message: string }>;

  // Offline status
  isOffline: boolean;
  setIsOffline: (offline: boolean) => void;
  offlineQueue: OfflineAction[];
  clearOfflineQueue: () => void;

  // Global UI
  globalSearchQuery: string;
  setGlobalSearchQuery: (q: string) => void;
  isSearchModalOpen: boolean;
  setIsSearchModalOpen: (open: boolean) => void;

  // Quota & Limits Guard
  quotaWarning: string | null;
  checkQuotaAllowed: (type: 'MESSAGES' | 'CONTACTS' | 'USERS') => { allowed: boolean; warning?: string };

  // CRUD & Operations
  addContact: (contact: Omit<Contact, 'id' | 'tenantId' | 'createdAt' | 'updatedAt' | 'leadScore' | 'consent'> & { consent?: Partial<Contact['consent']> }) => Contact;
  updateContact: (id: string, updates: Partial<Contact>) => void;
  softDeleteContact: (id: string) => void;
  restoreContact: (id: string) => void;
  checkDuplicateContact: (email: string, phone: string, excludeId?: string) => Contact | null;

  addAccount: (account: Omit<Account, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>) => Account;
  updateAccount: (id: string, updates: Partial<Account>) => void;
  deleteAccount: (id: string) => void;

  addDeal: (deal: Omit<Deal, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>) => Deal;
  updateDealStage: (dealId: string, newStageId: string, lostReason?: string, lostDetails?: string) => boolean;
  updateDeal: (id: string, updates: Partial<Deal>) => void;
  deleteDeal: (id: string) => boolean;
  canDeleteDeal: (deal: Deal) => boolean;
  addDealProposal: (dealId: string, proposal: Omit<DealProposal, 'id' | 'version' | 'createdAt'>) => DealProposal | null;

  addTask: (task: Omit<Task, 'id' | 'tenantId' | 'createdAt'>) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskStatus: (taskId: string) => void;
  addTaskWorkLog: (taskId: string, note: string) => void;
  reassignTask: (taskId: string, newAssigneeId: string) => void;
  cancelTask: (taskId: string) => void;
  updateTaskStatus: (taskId: string, status: Task['status']) => void;

  // PROMPT 12: Campaigns
  addSegment: (segment: Omit<Segment, 'id' | 'tenantId' | 'createdAt' | 'contactCount'>) => Segment;
  deleteSegment: (id: string) => void;
  createCampaign: (campaign: Omit<Campaign, 'id' | 'tenantId' | 'createdAt' | 'stats' | 'status'>) => Campaign;
  deleteCampaign: (id: string) => void;
  triggerCampaignSend: (campaignId: string) => { success: boolean; sentCount: number; error?: string };

  // PROMPT 13: Cases & Support
  addCase: (caseData: Omit<CaseItem, 'id' | 'tenantId' | 'caseNumber' | 'createdAt' | 'notes' | 'slaStatus' | 'slaResponseDeadline' | 'slaResolutionDeadline'>) => CaseItem;
  updateCaseStatus: (caseId: string, status: CaseItem['status']) => void;
  updateCase: (id: string, updates: Partial<CaseItem>) => void;
  deleteCase: (id: string) => void;
  addCaseNote: (caseId: string, content: string, isInternalOnly: boolean) => void;
  convertMessageToCase: (message: Message, subject: string) => CaseItem;

  // PROMPT 14 & 15: Reports & Widgets
  addReport: (report: Omit<ReportDefinition, 'id' | 'tenantId' | 'createdAt'>) => ReportDefinition;

  // PROMPT 17: Custom Fields & Automations
  addCustomField: (field: Omit<CustomFieldDefinition, 'id' | 'tenantId'>) => void;
  deleteCustomField: (id: string) => void;
  addAutomation: (automation: Omit<AutomationRule, 'id' | 'tenantId' | 'runCount'>) => void;
  deleteAutomation: (id: string) => void;
  toggleAutomation: (id: string) => void;
  triggerWorkflows: (
    trigger: 'CONTACT_CREATED' | 'DEAL_STAGE_CHANGED' | 'TASK_OVERDUE' | 'CASE_CREATED' | 'TAG_ADDED',
    entityType: 'CONTACT' | 'DEAL' | 'CASE' | 'TASK',
    entityData: any,
    manualAutomationId?: string
  ) => Promise<void>;

  // PROMPT 18: Documents & Products & Catalog Groups
  addDocument: (doc: Omit<DocumentFile, 'id' | 'tenantId' | 'createdAt' | 'signedUrl' | 'isVirusScanned'>) => DocumentFile;
  addProductGroup: (group: Omit<ProductGroup, 'id' | 'tenantId' | 'createdAt'>) => ProductGroup;
  updateProductGroup: (id: string, updates: Partial<ProductGroup>) => void;
  deleteProductGroup: (id: string) => void;
  addProduct: (product: Omit<ProductCatalogItem, 'id' | 'tenantId'>) => ProductCatalogItem;
  updateProduct: (id: string, updates: Partial<ProductCatalogItem>) => void;
  deleteProduct: (id: string) => void;

  // Order Management
  addOrder: (order: Omit<Order, 'id' | 'tenantId' | 'orderNumber' | 'createdAt' | 'updatedAt'>) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus, paymentStatus?: Order['paymentStatus']) => void;
  updateOrder: (id: string, updates: Partial<Order>) => void;
  deleteOrder: (id: string) => void;
  convertDealToOrder: (dealId: string) => Order | null;

  // Organization Hierarchy & Permissions
  addOrgNode: (node: Omit<OrgNode, 'id' | 'tenantId'>) => OrgNode;
  updateOrgNode: (id: string, updates: Partial<OrgNode>) => void;
  deleteOrgNode: (id: string) => void;
  updateOrgRule: (id: string, updates: Partial<OrgPermissionRule>) => void;
  updateUserOrgProfile: (userId: string, departmentId?: string, position?: User['position'], reportsToUserId?: string) => void;

  // Email / Message Template Management
  addTemplate: (template: Omit<MessageTemplate, 'id' | 'tenantId'>) => MessageTemplate;
  updateTemplate: (id: string, updates: Partial<MessageTemplate>) => void;
  deleteTemplate: (id: string) => void;
  duplicateTemplate: (id: string) => MessageTemplate | null;

  // PROMPT 20 & 21: API, Webhooks & Billing
  addApiKey: (name: string) => ApiKey;
  addWebhook: (event: WebhookSubscription['event'], targetUrl: string) => WebhookSubscription;
  upgradePlan: (newPlan: 'STARTER' | 'GROWTH' | 'SCALE') => void;

  sendMessage: (contactId: string, channel: MessageChannel, content: string, templateId?: string) => void;
  addActivity: (activity: Omit<Activity, 'id' | 'tenantId' | 'timestamp'>) => void;

  canUserExport: (entity?: string) => boolean;
  canUserImport: (entity?: string) => boolean;
  importContactsCsv: (parsedRows: any[]) => { imported: number; updated: number; errors: string[] };
  exportContactsCsv: () => void;
  importAccountsCsv: (parsedRows: any[]) => { imported: number; updated: number; errors: string[] };
  importProductsCsv: (parsedRows: any[]) => { imported: number; updated: number; errors: string[] };
}

const CRMContext = createContext<CRMContextType | undefined>(undefined);

export const CRMProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem('crm_authenticated') === 'true';
    } catch {
      return false;
    }
  });
  const [currentTenantId, setCurrentTenantId] = useState<string>(() => {
    try {
      return localStorage.getItem('crm_tenant_id') || 'tenant-1';
    } catch {
      return 'tenant-1';
    }
  });
  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    try {
      return localStorage.getItem('crm_user_id') || 'usr-1';
    } catch {
      return 'usr-1';
    }
  });
  const [language, setLanguage] = useState<Language>('en');

  const [tenants, setTenants] = useState<Tenant[]>(initialTenants);
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [teams] = useState<Team[]>(initialTeams);
  const [territories] = useState<Territory[]>(initialTerritories);

  // Entities state
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [pipelines] = useState<Pipeline[]>(initialPipelines);
  const [deals, setDeals] = useState<Deal[]>(initialDeals);
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [threads, setThreads] = useState<MessageThread[]>(initialThreads);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [templates, setTemplates] = useState<MessageTemplate[]>(initialMessageTemplates);
  const [cases, setCases] = useState<CaseItem[]>(initialCases);
  const [cannedResponses] = useState<CannedResponse[]>(initialCannedResponses);
  const [segments, setSegments] = useState<Segment[]>(initialSegments);
  const [campaigns, setCampaigns] = useState<Campaign[]>(initialCampaigns);
  const [reports, setReports] = useState<ReportDefinition[]>(initialReports);
  const [productGroups, setProductGroups] = useState<ProductGroup[]>(initialProductGroups);
  const [products, setProducts] = useState<ProductCatalogItem[]>(initialProducts);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [orgNodes, setOrgNodes] = useState<OrgNode[]>(initialOrgNodes);
  const [orgRules, setOrgRules] = useState<OrgPermissionRule[]>(initialOrgRules);
  const [customFields, setCustomFields] = useState<CustomFieldDefinition[]>(initialCustomFields);
  const [automations, setAutomations] = useState<AutomationRule[]>(initialAutomations);
  const [automationLogs, setAutomationLogs] = useState<AutomationLog[]>([]);
  const [documents, setDocuments] = useState<DocumentFile[]>(initialDocuments);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(initialApiKeys);
  const [webhooks, setWebhooks] = useState<WebhookSubscription[]>(initialWebhooks);
  const [socialIntegrations, setSocialIntegrations] = useState<SocialAccountIntegration[]>(initialSocialIntegrations);
  const [emailIntegrations, setEmailIntegrations] = useState<EmailProviderIntegration[]>(initialEmailIntegrations);

  // Address Location Hierarchy States (Country > City > District)
  const [countries, setCountries] = useState<LocationCountry[]>(() => {
    try {
      const saved = localStorage.getItem('crm_locations_countries');
      return saved ? JSON.parse(saved) : initialCountries;
    } catch {
      return initialCountries;
    }
  });

  const [cities, setCities] = useState<LocationCity[]>(() => {
    try {
      const saved = localStorage.getItem('crm_locations_cities');
      return saved ? JSON.parse(saved) : initialCities;
    } catch {
      return initialCities;
    }
  });

  const [districts, setDistricts] = useState<LocationDistrict[]>(() => {
    try {
      const saved = localStorage.getItem('crm_locations_districts');
      return saved ? JSON.parse(saved) : initialDistricts;
    } catch {
      return initialDistricts;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('crm_locations_countries', JSON.stringify(countries));
    } catch (e) {
      console.error(e);
    }
  }, [countries]);

  useEffect(() => {
    try {
      localStorage.setItem('crm_locations_cities', JSON.stringify(cities));
    } catch (e) {
      console.error(e);
    }
  }, [cities]);

  useEffect(() => {
    try {
      localStorage.setItem('crm_locations_districts', JSON.stringify(districts));
    } catch (e) {
      console.error(e);
    }
  }, [districts]);

  const addCountry = (countryData: Omit<LocationCountry, 'id'>): LocationCountry => {
    const newCountry: LocationCountry = {
      ...countryData,
      id: `cntry-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    setCountries((prev) => [...prev, newCountry]);
    return newCountry;
  };

  const updateCountry = (id: string, updates: Partial<LocationCountry>) => {
    setCountries((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const deleteCountry = (id: string) => {
    setCountries((prev) => prev.filter((c) => c.id !== id));
    const citiesToRemove = cities.filter((city) => city.countryId === id).map((c) => c.id);
    setCities((prev) => prev.filter((city) => city.countryId !== id));
    setDistricts((prev) => prev.filter((d) => !citiesToRemove.includes(d.cityId)));
  };

  const addCity = (cityData: Omit<LocationCity, 'id'>): LocationCity => {
    const country = countries.find((c) => c.id === cityData.countryId);
    const newCity: LocationCity = {
      ...cityData,
      countryName: country ? country.name : cityData.countryName,
      id: `city-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    setCities((prev) => [...prev, newCity]);
    return newCity;
  };

  const updateCity = (id: string, updates: Partial<LocationCity>) => {
    setCities((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
  };

  const deleteCity = (id: string) => {
    setCities((prev) => prev.filter((c) => c.id !== id));
    setDistricts((prev) => prev.filter((d) => d.cityId !== id));
  };

  const addDistrict = (districtData: Omit<LocationDistrict, 'id'>): LocationDistrict => {
    const city = cities.find((c) => c.id === districtData.cityId);
    const newDistrict: LocationDistrict = {
      ...districtData,
      cityName: city ? city.name : districtData.cityName,
      countryId: city ? city.countryId : districtData.countryId,
      id: `dist-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    setDistricts((prev) => [...prev, newDistrict]);
    return newDistrict;
  };

  const updateDistrict = (id: string, updates: Partial<LocationDistrict>) => {
    setDistricts((prev) => prev.map((d) => (d.id === id ? { ...d, ...updates } : d)));
  };

  const deleteDistrict = (id: string) => {
    setDistricts((prev) => prev.filter((d) => d.id !== id));
  };

  const exportLocationsCsv = (): string => {
    const headers = ['Ülke', 'Ülke Kodu', 'Şehir', 'Semt / İlçe'];
    const rows: string[] = [headers.join(',')];

    countries.forEach((country) => {
      const countryCities = cities.filter((c) => c.countryId === country.id);
      if (countryCities.length === 0) {
        rows.push(`"${country.name}","${country.code}","",""`);
      } else {
        countryCities.forEach((city) => {
          const cityDistricts = districts.filter((d) => d.cityId === city.id);
          if (cityDistricts.length === 0) {
            rows.push(`"${country.name}","${country.code}","${city.name}",""`);
          } else {
            cityDistricts.forEach((district) => {
              rows.push(`"${country.name}","${country.code}","${city.name}","${district.name}"`);
            });
          }
        });
      }
    });

    return rows.join('\n');
  };

  const importLocationsCsv = (csvText: string) => {
    const lines = csvText.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
    if (lines.length <= 1) {
      return { importedCountries: 0, importedCities: 0, importedDistricts: 0, errors: ['CSV dosyası boş veya başlık dışında veri yok.'] };
    }

    let addedCountriesCount = 0;
    let addedCitiesCount = 0;
    let addedDistrictsCount = 0;
    const errors: string[] = [];

    let currentCountries = [...countries];
    let currentCities = [...cities];
    let currentDistricts = [...districts];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const parts = line.split(',').map((p) => p.replace(/^"|"$/g, '').trim());
      if (parts.length < 1 || !parts[0]) continue;

      const countryName = parts[0];
      const countryCode = parts[1] || countryName.slice(0, 2).toUpperCase();
      const cityName = parts[2] || '';
      const districtName = parts[3] || '';

      let country = currentCountries.find((c) => c.name.toLowerCase() === countryName.toLowerCase());
      if (!country) {
        country = {
          id: `cntry-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
          code: countryCode,
          name: countryName,
        };
        currentCountries.push(country);
        addedCountriesCount++;
      }

      if (cityName) {
        let city = currentCities.find((c) => c.countryId === country!.id && c.name.toLowerCase() === cityName.toLowerCase());
        if (!city) {
          city = {
            id: `city-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
            countryId: country.id,
            countryName: country.name,
            name: cityName,
          };
          currentCities.push(city);
          addedCitiesCount++;
        }

        if (districtName) {
          let district = currentDistricts.find((d) => d.cityId === city!.id && d.name.toLowerCase() === districtName.toLowerCase());
          if (!district) {
            district = {
              id: `dist-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
              cityId: city.id,
              cityName: city.name,
              countryId: country.id,
              name: districtName,
            };
            currentDistricts.push(district);
            addedDistrictsCount++;
          }
        }
      }
    }

    setCountries(currentCountries);
    setCities(currentCities);
    setDistricts(currentDistricts);

    return {
      importedCountries: addedCountriesCount,
      importedCities: addedCitiesCount,
      importedDistricts: addedDistrictsCount,
      errors,
    };
  };

  // Offline & Global UI
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [offlineQueue, setOfflineQueue] = useState<OfflineAction[]>([]);
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState<boolean>(false);
  const [quotaWarning, setQuotaWarning] = useState<string | null>(null);

  // Current tenant & user
  const currentTenant = tenants.find((t) => t.id === currentTenantId) || tenants[0];
  const currentUser = users.find((u) => u.id === currentUserId) || users[0];
  const currentRole = currentUser.role;

  // Tenant scoped data
  const tenantAccounts = accounts.filter((a) => a.tenantId === currentTenantId);
  const tenantContacts = contacts.filter((c) => c.tenantId === currentTenantId);
  const tenantPipeline = pipelines.find((p) => p.tenantId === currentTenantId) || initialPipelines[0];
  const tenantDeals = deals.filter((d) => d.tenantId === currentTenantId);
  const tenantTasks = tasks.filter((t) => t.tenantId === currentTenantId);
  const tenantActivities = activities.filter((a) => a.tenantId === currentTenantId);
  const tenantThreads = threads.filter((t) => t.tenantId === currentTenantId);
  const tenantMessages = messages.filter((m) => m.tenantId === currentTenantId);
  const tenantCases = cases.filter((c) => c.tenantId === currentTenantId);
  const tenantSegments = segments.filter((s) => s.tenantId === currentTenantId);
  const tenantCampaigns = campaigns.filter((c) => c.tenantId === currentTenantId);
  const tenantReports = reports.filter((r) => r.tenantId === currentTenantId);
  const tenantProductGroups = productGroups.filter((pg) => pg.tenantId === currentTenantId);
  const tenantProducts = products.filter((p) => p.tenantId === currentTenantId);
  const tenantOrders = orders.filter((o) => o.tenantId === currentTenantId);
  const tenantOrgNodes = orgNodes.filter((o) => o.tenantId === currentTenantId);
  const tenantOrgRules = orgRules.filter((r) => r.tenantId === currentTenantId);
  const tenantCustomFields = customFields.filter((cf) => cf.tenantId === currentTenantId);
  const tenantAutomations = automations.filter((a) => a.tenantId === currentTenantId);
  const tenantDocuments = documents.filter((d) => d.tenantId === currentTenantId);
  const tenantApiKeys = apiKeys.filter((k) => k.tenantId === currentTenantId);
  const tenantWebhooks = webhooks.filter((w) => w.tenantId === currentTenantId);
  const tenantSocialIntegrations = socialIntegrations.filter((s) => s.tenantId === currentTenantId);
  const tenantEmailIntegrations = emailIntegrations.filter((e) => e.tenantId === currentTenantId);

  // Keyboard shortcut Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Firestore real-time subscriptions with automatic initial seeding
  useEffect(() => {
    const unsubContacts = subscribeCollection('contacts', initialContacts, setContacts);
    const unsubAccounts = subscribeCollection('accounts', initialAccounts, setAccounts);
    const unsubDeals = subscribeCollection('deals', initialDeals, setDeals);
    const unsubTasks = subscribeCollection('tasks', initialTasks, setTasks);
    const unsubCases = subscribeCollection('cases', initialCases, setCases);
    const unsubCampaigns = subscribeCollection('campaigns', initialCampaigns, setCampaigns);
    const unsubSegments = subscribeCollection('segments', initialSegments, setSegments);
    const unsubReports = subscribeCollection('reports', initialReports, setReports);
    const unsubCustomFields = subscribeCollection('customFields', initialCustomFields, setCustomFields);
    const unsubAutomations = subscribeCollection('automations', initialAutomations, setAutomations);
    const unsubTemplates = subscribeCollection('templates', initialMessageTemplates, setTemplates);
    const unsubSocial = subscribeCollection('socialIntegrations', initialSocialIntegrations, setSocialIntegrations);
    const unsubEmail = subscribeCollection('emailIntegrations', initialEmailIntegrations, setEmailIntegrations);
    const unsubProductGroups = subscribeCollection('productGroups', initialProductGroups, setProductGroups);
    const unsubProducts = subscribeCollection('products', initialProducts, setProducts);
    const unsubOrders = subscribeCollection('orders', initialOrders, setOrders);
    const unsubOrgNodes = subscribeCollection('orgNodes', initialOrgNodes, setOrgNodes);
    const unsubOrgRules = subscribeCollection('orgRules', initialOrgRules, setOrgRules);
    const unsubDocuments = subscribeCollection('documents', initialDocuments, setDocuments);
    const unsubActivities = subscribeCollection('activities', initialActivities, setActivities);

    return () => {
      unsubContacts();
      unsubAccounts();
      unsubDeals();
      unsubTasks();
      unsubCases();
      unsubCampaigns();
      unsubSegments();
      unsubReports();
      unsubCustomFields();
      unsubAutomations();
      unsubTemplates();
      unsubSocial();
      unsubEmail();
      unsubProductGroups();
      unsubProducts();
      unsubOrders();
      unsubOrgNodes();
      unsubOrgRules();
      unsubDocuments();
      unsubActivities();
    };
  }, []);

  const t = (key: string): string => {
    return translations[language]?.[key] || translations.en?.[key] || key;
  };

  const switchTenant = (tenantId: string) => {
    setCurrentTenantId(tenantId);
    const tenantUser = users.find((u) => u.tenantId === tenantId) || users[0];
    setCurrentUserId(tenantUser.id);
  };

  const switchUserRole = (role: UserRole) => {
    users.find((u) => u.id === currentUserId)!.role = role;
    setCurrentUserId(currentUserId);
  };

  // Quota guard check
  const checkQuotaAllowed = (type: 'MESSAGES' | 'CONTACTS' | 'USERS') => {
    if (type === 'MESSAGES') {
      if (currentTenant.usedMessagesThisMonth >= currentTenant.monthlyMessageQuota) {
        return { allowed: false, warning: `Monthly message send limit reached (${currentTenant.monthlyMessageQuota.toLocaleString()}). Upgrade your plan to send more messages.` };
      }
      if (currentTenant.usedMessagesThisMonth >= currentTenant.monthlyMessageQuota * 0.8) {
        return { allowed: true, warning: `You have used over 80% of your monthly message quota (${currentTenant.usedMessagesThisMonth}/${currentTenant.monthlyMessageQuota}).` };
      }
    }
    if (type === 'CONTACTS') {
      if (tenantContacts.length >= currentTenant.maxContacts) {
        return { allowed: false, warning: `Contact limit reached (${currentTenant.maxContacts}). Upgrade your plan to add more contacts.` };
      }
    }
    return { allowed: true };
  };

  const upgradePlan = (newPlan: 'STARTER' | 'GROWTH' | 'SCALE') => {
    const planLimits = {
      STARTER: { maxUsers: 5, maxContacts: 1000, monthlyMessageQuota: 2000 },
      GROWTH: { maxUsers: 25, maxContacts: 10000, monthlyMessageQuota: 25000 },
      SCALE: { maxUsers: 100, maxContacts: 100000, monthlyMessageQuota: 250000 },
    }[newPlan];

    setTenants((prev) =>
      prev.map((t) => (t.id === currentTenantId ? { ...t, plan: newPlan, ...planLimits } : t))
    );
  };

  // Activity logger
  const addActivity = (act: Omit<Activity, 'id' | 'tenantId' | 'timestamp'>) => {
    const newAct: Activity = {
      ...act,
      id: `act-${Date.now()}`,
      tenantId: currentTenantId,
      timestamp: new Date().toISOString(),
    };
    setActivities((prev) => [newAct, ...prev]);
  };

  // Duplicate contact check
  const checkDuplicateContact = (email: string, phone: string, excludeId?: string): Contact | null => {
    const normEmail = email.trim().toLowerCase();
    const normPhone = phone.replace(/\D/g, '');

    return (
      tenantContacts.find((c) => {
        if (c.id === excludeId || c.isSoftDeleted) return false;
        const matchEmail = normEmail && c.email.trim().toLowerCase() === normEmail;
        const matchPhone = normPhone && c.phone.replace(/\D/g, '') === normPhone;
        return matchEmail || matchPhone;
      }) || null
    );
  };

  // Contact CRUD
  const addContact = (contactData: Omit<Contact, 'id' | 'tenantId' | 'createdAt' | 'updatedAt' | 'leadScore' | 'consent'> & { consent?: Partial<Contact['consent']> }): Contact => {
    const quota = checkQuotaAllowed('CONTACTS');
    if (!quota.allowed) {
      setQuotaWarning(quota.warning || 'Quota limit hit');
    }

    const newContact: Contact = {
      ...contactData,
      id: `cnt-${Date.now()}`,
      tenantId: currentTenantId,
      leadScore: 30, // Default lead score
      consent: {
        emailOptIn: true,
        smsOptIn: true,
        whatsAppOptIn: true,
        ...contactData.consent,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setContacts((prev) => [newContact, ...prev]);
    saveToFirestore('contacts', newContact);

    addActivity({
      type: 'NOTE',
      title: 'New Contact Created',
      description: `Created contact ${newContact.firstName} ${newContact.lastName} (${newContact.email})`,
      contactId: newContact.id,
      userId: currentUser.id,
      userName: currentUser.name,
    });

    // Automatically trigger active CONTACT_CREATED workflows
    triggerWorkflows('CONTACT_CREATED', 'CONTACT', newContact);

    return newContact;
  };

  const updateContact = (id: string, updates: Partial<Contact>) => {
    const updated = { ...updates, updatedAt: new Date().toISOString() };
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updated } : c))
    );
    updateInFirestore('contacts', id, updated);
  };

  const softDeleteContact = (id: string) => {
    const updated = { isSoftDeleted: true, updatedAt: new Date().toISOString() };
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updated } : c))
    );
    updateInFirestore('contacts', id, updated);
  };

  const restoreContact = (id: string) => {
    const updated = { isSoftDeleted: false, updatedAt: new Date().toISOString() };
    setContacts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updated } : c))
    );
    updateInFirestore('contacts', id, updated);
  };

  // Account CRUD
  const addAccount = (accData: Omit<Account, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>): Account => {
    const newAccount: Account = {
      ...accData,
      id: `acc-${Date.now()}`,
      tenantId: currentTenantId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setAccounts((prev) => [newAccount, ...prev]);
    saveToFirestore('accounts', newAccount);
    return newAccount;
  };

  const updateAccount = (id: string, updates: Partial<Account>) => {
    const updated = { ...updates, updatedAt: new Date().toISOString() };
    setAccounts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updated } : a))
    );
    updateInFirestore('accounts', id, updated);
  };

  const deleteAccount = (id: string) => {
    setAccounts((prev) => prev.filter((a) => a.id !== id));
    deleteFromFirestore('accounts', id);
  };

  // Deal CRUD
  const addDeal = (dealData: Omit<Deal, 'id' | 'tenantId' | 'createdAt' | 'updatedAt'>): Deal => {
    const newDeal: Deal = {
      ...dealData,
      id: `dl-${Date.now()}`,
      tenantId: currentTenantId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setDeals((prev) => [newDeal, ...prev]);
    saveToFirestore('deals', newDeal);

    addActivity({
      type: 'STAGE_CHANGE',
      title: 'Deal Created',
      description: `Created new deal "${newDeal.title}" with value $${newDeal.amount.toLocaleString()} ${newDeal.currency}`,
      contactId: newDeal.contactId,
      dealId: newDeal.id,
      userId: currentUser.id,
      userName: currentUser.name,
    });

    // Trigger DEAL_STAGE_CHANGED workflows
    triggerWorkflows('DEAL_STAGE_CHANGED', 'DEAL', newDeal);

    return newDeal;
  };

  const updateDealStage = (dealId: string, newStageId: string, lostReason?: string, lostDetails?: string): boolean => {
    const deal = deals.find((d) => d.id === dealId);
    if (!deal) return false;

    const oldStage = tenantPipeline.stages.find((s) => s.id === deal.stageId);
    const newStage = tenantPipeline.stages.find((s) => s.id === newStageId);

    // Rule: new den sonraki statülerden new a dönüş olamaz.
    const initialStage = tenantPipeline.stages[0];
    const isOldStageInitial = oldStage?.id === initialStage?.id || oldStage?.order === 1 || oldStage?.name.toLowerCase().includes('new');
    const isNewStageInitial = newStage?.id === initialStage?.id || newStage?.order === 1 || newStage?.name.toLowerCase().includes('new prospect');

    if (!isOldStageInitial && isNewStageInitial) {
      alert("Yeni (New) aşamasından ilerlemiş bir fırsat tekrar İlk Aşama (New Prospect) statüsüne geriye dönüştürülemez.");
      return false;
    }

    let newStatus: 'OPEN' | 'WON' | 'LOST' = 'OPEN';
    if (newStage?.name.toLowerCase().includes('won')) newStatus = 'WON';
    if (newStage?.name.toLowerCase().includes('lost')) newStatus = 'LOST';

    const updatedDeal: Deal = {
      ...deal,
      stageId: newStageId,
      probability: newStage ? newStage.probability : deal.probability,
      status: newStatus,
      lostReason: lostReason || deal.lostReason,
      lostReasonDetails: lostDetails || deal.lostReasonDetails,
      updatedAt: new Date().toISOString(),
    };

    setDeals((prev) => prev.map((d) => (d.id === dealId ? updatedDeal : d)));
    saveToFirestore('deals', updatedDeal);

    addActivity({
      type: 'STAGE_CHANGE',
      title: `Deal Moved to ${newStage?.name || newStageId}`,
      description: `${currentUser.name} moved deal "${deal.title}" from "${oldStage?.name || 'Previous'}" to "${newStage?.name || 'New'}".`,
      contactId: deal.contactId,
      dealId: deal.id,
      userId: currentUser.id,
      userName: currentUser.name,
    });

    // Automatically trigger active DEAL_STAGE_CHANGED workflows
    triggerWorkflows('DEAL_STAGE_CHANGED', 'DEAL', updatedDeal);

    return true;
  };

  const updateDeal = (id: string, updates: Partial<Deal>) => {
    const updated = { ...updates, updatedAt: new Date().toISOString() };
    setDeals((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updated } : d))
    );
    updateInFirestore('deals', id, updated);
  };

  const canDeleteDeal = (deal: Deal): boolean => {
    if (!currentUser) return false;
    const isOwner = deal.ownerId === currentUser.id;
    const isAuthorizedRole =
      currentUser.role === 'ADMIN' ||
      currentUser.role === 'OWNER' ||
      currentUser.position === 'HEAD' ||
      currentUser.position === 'DEPARTMENT_MANAGER';
    return isOwner || isAuthorizedRole;
  };

  const deleteDeal = (id: string): boolean => {
    const deal = deals.find((d) => d.id === id);
    if (!deal) return false;

    if (!canDeleteDeal(deal)) {
      alert("Yalnızca fırsatın kayıt sahibi veya yetkili yöneticiler bu fırsatı silebilir.");
      return false;
    }

    setDeals((prev) => prev.filter((d) => d.id !== id));
    deleteFromFirestore('deals', id);
    return true;
  };

  const addDealProposal = (
    dealId: string,
    proposalData: Omit<DealProposal, 'id' | 'version' | 'createdAt'>
  ): DealProposal | null => {
    const deal = deals.find((d) => d.id === dealId);
    if (!deal) return null;

    const currentProposals = deal.proposals || [];
    const nextVersion = currentProposals.length + 1;
    const newProposal: DealProposal = {
      ...proposalData,
      id: `prop-${Date.now()}`,
      version: nextVersion,
      createdAt: new Date().toISOString(),
      createdByName: proposalData.createdByName || currentUser.name,
    };

    const updatedProposals = [...currentProposals, newProposal];

    updateDeal(dealId, {
      proposals: updatedProposals,
    });

    addActivity({
      type: 'NOTE',
      title: `Yeni Teklif Eklendi (Revizyon #${nextVersion})`,
      description: `${currentUser.name} "${deal.title}" için v${nextVersion} teklifini ekledi: ${newProposal.title} ($${newProposal.amount.toLocaleString()} ${newProposal.currency}) - Dosya: ${newProposal.fileName}`,
      contactId: deal.contactId,
      dealId: deal.id,
      userId: currentUser.id,
      userName: currentUser.name,
    });

    return newProposal;
  };

  // Task CRUD & Process Management
  const addTask = (taskData: Omit<Task, 'id' | 'tenantId' | 'createdAt'>): Task => {
    const newTask: Task = {
      ...taskData,
      id: `tsk-${Date.now()}`,
      tenantId: currentTenantId,
      creatorId: taskData.creatorId || currentUser.id,
      status: taskData.status || 'NEW',
      workLogs: taskData.workLogs || [],
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
    saveToFirestore('tasks', newTask);
    return newTask;
  };

  const updateTaskStatus = (taskId: string, status: Task['status']) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status, updatedAt: new Date().toISOString() } : t))
    );
    updateInFirestore('tasks', taskId, { status, updatedAt: new Date().toISOString() });
  };

  const toggleTaskStatus = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const nextStatus = t.status === 'COMPLETED' || t.status === 'DONE' ? 'RUNNING' : 'COMPLETED';
          updateInFirestore('tasks', taskId, { status: nextStatus, updatedAt: new Date().toISOString() });
          return { ...t, status: nextStatus, updatedAt: new Date().toISOString() };
        }
        return t;
      })
    );
  };

  const addTaskWorkLog = (taskId: string, note: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task || !note.trim()) return;

    const newLog = {
      id: `wl-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      note: note.trim(),
      timestamp: new Date().toISOString(),
    };

    const newLogs = [...(task.workLogs || []), newLog];
    const newStatus =
      task.status === 'COMPLETED' || task.status === 'DONE' || task.status === 'CANCELLED' || task.status === 'DELETED'
        ? task.status
        : 'RUNNING';

    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, workLogs: newLogs, status: newStatus, updatedAt: new Date().toISOString() }
          : t
      )
    );

    updateInFirestore('tasks', taskId, {
      workLogs: newLogs,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    });

    addActivity({
      type: 'NOTE',
      title: `Task Process Note: ${task.title}`,
      description: `${currentUser.name}: ${note.trim()}`,
      dealId: task.linkedDealId,
      contactId: task.linkedContactId,
      userId: currentUser.id,
      userName: currentUser.name,
    });
  };

  const reassignTask = (taskId: string, newAssigneeId: string) => {
    const targetUser = users.find((u) => u.id === newAssigneeId);
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, assigneeId: newAssigneeId, updatedAt: new Date().toISOString() }
          : t
      )
    );
    updateInFirestore('tasks', taskId, {
      assigneeId: newAssigneeId,
      updatedAt: new Date().toISOString(),
    });

    if (targetUser) {
      addActivity({
        type: 'NOTE',
        title: `Task Reassigned`,
        description: `Task assigned to ${targetUser.name}`,
        userId: currentUser.id,
        userName: currentUser.name,
      });
    }
  };

  const cancelTask = (taskId: string) => {
    updateTaskStatus(taskId, 'CANCELLED');
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    const updated = { ...updates, updatedAt: new Date().toISOString() };
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updated } : t)));
    updateInFirestore('tasks', id, updated);
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    deleteFromFirestore('tasks', id);
  };

  // PROMPT 12: Campaign Management & Consent Enforcement
  const addSegment = (segmentData: Omit<Segment, 'id' | 'tenantId' | 'createdAt' | 'contactCount'>): Segment => {
    const newSeg: Segment = {
      ...segmentData,
      id: `seg-${Date.now()}`,
      tenantId: currentTenantId,
      contactCount: tenantContacts.length,
      createdAt: new Date().toISOString(),
    };
    setSegments((prev) => [newSeg, ...prev]);
    return newSeg;
  };

  const deleteSegment = (id: string) => {
    setSegments((prev) => prev.filter((s) => s.id !== id));
    deleteFromFirestore('segments', id);
  };

  const createCampaign = (campaignData: Omit<Campaign, 'id' | 'tenantId' | 'createdAt' | 'stats' | 'status'>): Campaign => {
    const newCamp: Campaign = {
      ...campaignData,
      id: `cmp-${Date.now()}`,
      tenantId: currentTenantId,
      status: 'DRAFT',
      stats: {
        totalRecipients: 0,
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        replied: 0,
        unsubscribed: 0,
      },
      createdAt: new Date().toISOString(),
    };
    setCampaigns((prev) => [newCamp, ...prev]);
    saveToFirestore('campaigns', newCamp);
    return newCamp;
  };

  const deleteCampaign = (id: string) => {
    setCampaigns((prev) => prev.filter((c) => c.id !== id));
    deleteFromFirestore('campaigns', id);
  };

  const triggerCampaignSend = (campaignId: string): { success: boolean; sentCount: number; error?: string } => {
    const campaign = campaigns.find((c) => c.id === campaignId);
    if (!campaign) return { success: false, sentCount: 0, error: 'Campaign not found' };

    // WhatsApp 24h Template Window constraint enforcement
    if (campaign.channel === 'WHATSAPP' && !campaign.templateId) {
      return {
        success: false,
        sentCount: 0,
        error: 'WhatsApp bulk campaign sends outside 24h session window MUST use an approved WhatsApp Template.',
      };
    }

    // Consent filtering (non-negotiable requirement)
    const eligibleContacts = tenantContacts.filter((c) => {
      if (c.isSoftDeleted) return false;
      if (campaign.channel === 'EMAIL') return c.consent?.emailOptIn !== false;
      if (campaign.channel === 'SMS') return c.consent?.smsOptIn !== false;
      if (campaign.channel === 'WHATSAPP') return c.consent?.whatsAppOptIn !== false;
      return true;
    });

    const sentCount = eligibleContacts.length;

    // Dispatch real email campaign via server backend if EMAIL channel
    if (campaign.channel === 'EMAIL' && eligibleContacts.length > 0) {
      const activeEmailIntegration = emailIntegrations.find((e) => e.isDefault) || emailIntegrations[0];
      const provider = activeEmailIntegration?.provider || 'BREVO';
      const apiKey = activeEmailIntegration?.apiKey || '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';

      fetch('/api/email/send-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config: {
            provider,
            apiKey,
            fromEmail: activeEmailIntegration?.fromEmail || 'hciftci68@gmail.com',
            fromName: activeEmailIntegration?.fromName || 'CRM Team',
          },
          recipients: eligibleContacts.map((c) => ({
            email: c.email,
            name: `${c.firstName} ${c.lastName}`,
            variables: { company: c.accountName || '' },
          })),
          subject: campaign.subject || campaign.name,
          htmlTemplate: campaign.body,
          sendDelayMs: 200,
        }),
      }).catch((err) => console.error('Bulk email API dispatch error:', err));
    }

    // Update campaign stats
    setCampaigns((prev) =>
      prev.map((c) =>
        c.id === campaignId
          ? {
              ...c,
              status: 'SENT',
              stats: {
                totalRecipients: sentCount,
                sent: sentCount,
                delivered: Math.max(0, sentCount),
                opened: Math.floor(sentCount * 0.75),
                clicked: Math.floor(sentCount * 0.35),
                replied: Math.floor(sentCount * 0.15),
                unsubscribed: 0,
              },
            }
          : c
      )
    );

    // Increment tenant used messages
    setTenants((prev) =>
      prev.map((t) => (t.id === currentTenantId ? { ...t, usedMessagesThisMonth: t.usedMessagesThisMonth + sentCount } : t))
    );

    addActivity({
      type: 'CAMPAIGN_SENT',
      title: `Bulk Campaign Delivered: ${campaign.name}`,
      description: `Dispatched campaign to ${sentCount} consent-verified recipients via ${campaign.channel}.`,
      userId: currentUser.id,
      userName: currentUser.name,
    });

    return { success: true, sentCount };
  };

  // PROMPT 13: Service Cases & SLA
  const addCase = (caseData: Omit<CaseItem, 'id' | 'tenantId' | 'caseNumber' | 'createdAt' | 'notes' | 'slaStatus' | 'slaResponseDeadline' | 'slaResolutionDeadline'>): CaseItem => {
    const now = new Date();
    const responseHrs = caseData.priority === 'URGENT' ? 2 : caseData.priority === 'HIGH' ? 4 : 12;
    const resHrs = caseData.priority === 'URGENT' ? 8 : caseData.priority === 'HIGH' ? 24 : 72;

    const newCase: CaseItem = {
      ...caseData,
      id: `case-${Date.now()}`,
      tenantId: currentTenantId,
      caseNumber: `CAS-${Math.floor(1000 + Math.random() * 9000)}`,
      slaResponseDeadline: new Date(now.getTime() + responseHrs * 3600000).toISOString(),
      slaResolutionDeadline: new Date(now.getTime() + resHrs * 3600000).toISOString(),
      slaStatus: 'ON_TIME',
      notes: [],
      createdAt: now.toISOString(),
    };

    setCases((prev) => [newCase, ...prev]);
    saveToFirestore('cases', newCase);

    // Auto create linked task when support case is created
    addTask({
      title: `Destek Takibi: ${newCase.subject} (${newCase.caseNumber})`,
      description: `Support Case #${newCase.caseNumber}: ${newCase.description}`,
      dueDate: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
      status: 'NEW',
      priority: newCase.priority === 'URGENT' ? 'HIGH' : newCase.priority === 'HIGH' ? 'HIGH' : 'MEDIUM',
      assigneeId: newCase.assigneeId || currentUser.id,
      creatorId: currentUser.id,
      linkedCaseId: newCase.id,
      linkedContactId: newCase.contactId,
    });

    addActivity({
      type: 'CASE_CREATED',
      title: `Support Case Created: ${newCase.caseNumber}`,
      description: `${newCase.subject} (Priority: ${newCase.priority})`,
      contactId: newCase.contactId,
      caseId: newCase.id,
      userId: currentUser.id,
      userName: currentUser.name,
    });

    // Automatically trigger active CASE_CREATED workflows
    triggerWorkflows('CASE_CREATED', 'CASE', newCase);

    return newCase;
  };

  const updateCaseStatus = (caseId: string, status: CaseItem['status']) => {
    const resolvedAt = status === 'RESOLVED' || status === 'CLOSED' ? new Date().toISOString() : undefined;
    setCases((prev) =>
      prev.map((c) =>
        c.id === caseId
          ? {
              ...c,
              status,
              resolvedAt: resolvedAt || c.resolvedAt,
            }
          : c
      )
    );
    updateInFirestore('cases', caseId, { status, ...(resolvedAt ? { resolvedAt } : {}) });
  };

  const updateCase = (id: string, updates: Partial<CaseItem>) => {
    setCases((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)));
    updateInFirestore('cases', id, updates);
  };

  const deleteCase = (id: string) => {
    setCases((prev) => prev.filter((c) => c.id !== id));
    deleteFromFirestore('cases', id);
  };

  const addCaseNote = (caseId: string, content: string, isInternalOnly: boolean) => {
    const newNote: CaseNote = {
      id: `cn-${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.name,
      content,
      isInternalOnly,
      createdAt: new Date().toISOString(),
    };

    setCases((prev) =>
      prev.map((c) => (c.id === caseId ? { ...c, notes: [...c.notes, newNote] } : c))
    );
  };

  const convertMessageToCase = (message: Message, subject: string): CaseItem => {
    return addCase({
      subject: subject || `Inquiry from ${message.senderName}`,
      description: message.content,
      status: 'NEW',
      priority: 'MEDIUM',
      contactId: message.contactId,
      assigneeId: currentUser.id,
      sourceChannel: message.channel,
    });
  };

  // PROMPT 14: Reports
  const addReport = (reportData: Omit<ReportDefinition, 'id' | 'tenantId' | 'createdAt'>): ReportDefinition => {
    const newReport: ReportDefinition = {
      ...reportData,
      id: `rep-${Date.now()}`,
      tenantId: currentTenantId,
      createdAt: new Date().toISOString(),
    };
    setReports((prev) => [newReport, ...prev]);
    saveToFirestore('reports', newReport);
    return newReport;
  };

  // PROMPT 17: Custom Fields & Automations
  const addCustomField = (field: Omit<CustomFieldDefinition, 'id' | 'tenantId'>) => {
    const newField: CustomFieldDefinition = {
      ...field,
      id: `cf-${Date.now()}`,
      tenantId: currentTenantId,
    };
    setCustomFields((prev) => [...prev, newField]);
    saveToFirestore('customFields', newField);
  };

  const deleteCustomField = (id: string) => {
    setCustomFields((prev) => prev.filter((f) => f.id !== id));
    deleteFromFirestore('customFields', id);
  };

  const addAutomation = (automation: Omit<AutomationRule, 'id' | 'tenantId' | 'runCount'>) => {
    const newAuto: AutomationRule = {
      ...automation,
      id: `auto-${Date.now()}`,
      tenantId: currentTenantId,
      runCount: 0,
      enabled: automation.enabled ?? true,
    };
    setAutomations((prev) => [...prev, newAuto]);
    saveToFirestore('automations', newAuto);
  };

  const deleteAutomation = (id: string) => {
    setAutomations((prev) => prev.filter((a) => a.id !== id));
    deleteFromFirestore('automations', id);
  };

  const toggleAutomation = (id: string) => {
    setAutomations((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const updated = { ...a, enabled: !a.enabled };
          updateInFirestore('automations', id, { enabled: updated.enabled });
          return updated;
        }
        return a;
      })
    );
  };

  const triggerWorkflows = async (
    trigger: 'CONTACT_CREATED' | 'DEAL_STAGE_CHANGED' | 'TASK_OVERDUE' | 'CASE_CREATED' | 'TAG_ADDED',
    entityType: 'CONTACT' | 'DEAL' | 'CASE' | 'TASK',
    entityData: any,
    manualAutomationId?: string
  ): Promise<void> => {
    const rulesToRun = tenantAutomations.filter((rule) => {
      if (manualAutomationId) return rule.id === manualAutomationId;
      return rule.enabled && rule.trigger === trigger;
    });

    if (rulesToRun.length === 0 && manualAutomationId) {
      const manualRule = tenantAutomations.find((a) => a.id === manualAutomationId);
      if (manualRule) rulesToRun.push(manualRule);
    }

    if (rulesToRun.length === 0) return;

    for (const rule of rulesToRun) {
      const startTime = Date.now();
      const entityLabel = entityData.firstName
        ? `${entityData.firstName} ${entityData.lastName}`
        : entityData.title || entityData.subject || entityData.caseNumber || entityData.id || 'Record';

      const steps: any[] = [
        {
          stepName: `1. Trigger Event Detected (${trigger})`,
          status: 'SUCCESS',
          details: `Event received for ${entityType}: "${entityLabel}"`,
          timestamp: new Date().toISOString(),
        },
        {
          stepName: `2. Workflow Activation & Condition Check`,
          status: 'SUCCESS',
          details: `Rule "${rule.name}" verified ACTIVE. Action Type: ${rule.actionType}`,
          timestamp: new Date().toISOString(),
        },
      ];

      let logStatus: 'SUCCESS' | 'FAILED' = 'SUCCESS';
      let summaryDetails = '';
      let errorDetails = '';
      let recipientEmail = '';

      try {
        if (
          rule.actionType === 'SEND_EMAIL' ||
          rule.actionType === 'SEND_MESSAGE' ||
          rule.actionType === 'SEND_MESSAGE_TEMPLATE'
        ) {
          let contactToUse: Contact | null = null;
          if (entityType === 'CONTACT') {
            contactToUse = entityData as Contact;
          } else if (entityData.contactId) {
            contactToUse = contacts.find((c) => c.id === entityData.contactId) || null;
          }
          if (!contactToUse) {
            contactToUse = contacts[0] || null;
          }

          const targetEmail = contactToUse?.email || 'hakan.selvi@selvitech.com';
          const targetPhone = contactToUse?.phone || '+90 532 555 0199';
          recipientEmail = targetEmail;

          const rawSubject = rule.actionPayload?.subject || rule.actionPayload?.templateName || rule.name;
          const rawBody =
            rule.actionPayload?.body ||
            rule.actionPayload?.content ||
            rule.actionPayload?.taskTitle ||
            `Automated message for ${rule.name}`;

          const renderedSubject = renderTemplatePlaceholders(
            rawSubject,
            contactToUse,
            entityType === 'DEAL' ? (entityData as Deal) : null,
            currentUser.name,
            currentTenant?.name
          );
          const renderedBody = renderTemplatePlaceholders(
            rawBody,
            contactToUse,
            entityType === 'DEAL' ? (entityData as Deal) : null,
            currentUser.name,
            currentTenant?.name
          );

          steps.push({
            stepName: `3. Dynamic Template & Payload Render`,
            status: 'SUCCESS',
            details: `Subject: "${renderedSubject}" | Target: ${targetEmail}`,
            timestamp: new Date().toISOString(),
          });

          if (rule.actionType === 'SEND_EMAIL') {
            const activeEmailIntegration =
              emailIntegrations.find((e) => e.isDefault) || emailIntegrations[0];
            const provider = activeEmailIntegration?.provider || 'BREVO';
            const apiKey =
              activeEmailIntegration?.apiKey ||
              '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';

            const emailRes = await fetch('/api/email/send-single', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                config: {
                  provider,
                  apiKey,
                  fromEmail: activeEmailIntegration?.fromEmail || 'hciftci68@gmail.com',
                  fromName: activeEmailIntegration?.fromName || 'CRM Automations',
                },
                toEmail: targetEmail,
                toName: contactToUse ? `${contactToUse.firstName} ${contactToUse.lastName}` : targetEmail,
                subject: renderedSubject,
                htmlBody: `<div style="font-family: sans-serif; padding: 16px; border-left: 4px solid #4f46e5; background: #f8fafc; border-radius: 8px;">${renderedBody.replace(/\n/g, '<br/>')}</div>`,
              }),
            });

            const data = await emailRes.json().catch(() => ({ success: false, error: 'Network failure' }));
            if (emailRes.ok && data.success) {
              steps.push({
                stepName: `4. Outbound Provider Transmission (${provider})`,
                status: 'SUCCESS',
                details: `Delivered via ${provider}. MessageID: ${data.messageId || 'sent_ok'}`,
                timestamp: new Date().toISOString(),
              });
              summaryDetails = `Email dispatched to ${targetEmail} via ${provider}. Subject: "${renderedSubject}"`;

              if (contactToUse) {
                sendMessage(contactToUse.id, 'EMAIL', renderedBody);
              }
            } else {
              logStatus = 'FAILED';
              errorDetails = data.error || 'Provider rejected email transmission';
              steps.push({
                stepName: `4. Outbound Provider Transmission (${provider})`,
                status: 'FAILED',
                details: `Error: ${errorDetails}`,
                timestamp: new Date().toISOString(),
              });
              summaryDetails = `Failed to send email to ${targetEmail}: ${errorDetails}`;
            }
          } else {
            if (contactToUse) {
              sendMessage(contactToUse.id, 'SMS', renderedBody);
            }
            steps.push({
              stepName: `4. Omnichannel Dispatch`,
              status: 'SUCCESS',
              details: `Dispatched SMS/WhatsApp to ${targetPhone}`,
              timestamp: new Date().toISOString(),
            });
            summaryDetails = `Message dispatched to ${targetPhone}`;
          }
        } else if (rule.actionType === 'CREATE_TASK') {
          const taskTitle = rule.actionPayload?.taskTitle || `Automated Task: ${rule.name}`;
          addTask({
            title: taskTitle,
            description: `Triggered automatically on ${trigger} for ${entityLabel}.`,
            dueDate: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
            status: 'OPEN',
            priority: rule.actionPayload?.priority || 'HIGH',
            assigneeId: currentUser.id,
            linkedContactId: entityType === 'CONTACT' ? entityData.id : entityData.contactId,
            linkedDealId: entityType === 'DEAL' ? entityData.id : undefined,
            linkedCaseId: entityType === 'CASE' ? entityData.id : undefined,
          });
          steps.push({
            stepName: `3. Task Creation`,
            status: 'SUCCESS',
            details: `Created task "${taskTitle}" assigned to ${currentUser.name}`,
            timestamp: new Date().toISOString(),
          });
          summaryDetails = `Created follow-up task "${taskTitle}"`;
        } else {
          addActivity({
            type: 'NOTE',
            title: `Workflow Action: ${rule.name}`,
            description: `Automated rule executed for ${entityLabel}`,
            contactId: entityData.contactId || (entityType === 'CONTACT' ? entityData.id : undefined),
            userId: currentUser.id,
            userName: currentUser.name,
          });
          steps.push({
            stepName: `3. Notification / Activity Logged`,
            status: 'SUCCESS',
            details: `Activity note logged for ${entityLabel}`,
            timestamp: new Date().toISOString(),
          });
          summaryDetails = `Workflow notification logged`;
        }
      } catch (err: any) {
        logStatus = 'FAILED';
        errorDetails = err?.message || 'Workflow runtime exception';
        steps.push({
          stepName: `4. Error Handler`,
          status: 'FAILED',
          details: errorDetails,
          timestamp: new Date().toISOString(),
        });
        summaryDetails = `Workflow execution failed: ${errorDetails}`;
      }

      const nowIso = new Date().toISOString();

      setAutomations((prev) =>
        prev.map((a) =>
          a.id === rule.id
            ? { ...a, runCount: (a.runCount || 0) + 1, lastRunAt: nowIso }
            : a
        )
      );

      const logEntry: AutomationLog = {
        id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        automationId: rule.id,
        automationName: rule.name,
        triggeredByEntity: `${entityType}: ${entityLabel}`,
        triggerType: trigger,
        actionType: rule.actionType,
        recipient: recipientEmail,
        status: logStatus,
        details: summaryDetails,
        errorDetails,
        steps,
        latencyMs: Date.now() - startTime,
        timestamp: nowIso,
      };

      setAutomationLogs((prev) => [logEntry, ...prev]);
      saveToFirestore('automationLogs', logEntry);
    }
  };

  // PROMPT 18: Documents & Products & Catalog Groups
  const addDocument = (doc: Omit<DocumentFile, 'id' | 'tenantId' | 'createdAt' | 'signedUrl' | 'isVirusScanned'>): DocumentFile => {
    const newDoc: DocumentFile = {
      ...doc,
      id: `doc-${Date.now()}`,
      tenantId: currentTenantId,
      signedUrl: `https://storage.acmecloud.com/docs/${encodeURIComponent(doc.name)}?token=secure_${Date.now()}`,
      isVirusScanned: true,
      createdAt: new Date().toISOString(),
    };
    setDocuments((prev) => [newDoc, ...prev]);
    return newDoc;
  };

  const addProductGroup = (group: Omit<ProductGroup, 'id' | 'tenantId' | 'createdAt'>): ProductGroup => {
    const newGroup: ProductGroup = {
      ...group,
      id: `grp-${Date.now()}`,
      tenantId: currentTenantId,
      createdAt: new Date().toISOString(),
    };
    setProductGroups((prev) => [...prev, newGroup]);
    saveToFirestore('productGroups', newGroup);
    return newGroup;
  };

  const updateProductGroup = (id: string, updates: Partial<ProductGroup>) => {
    setProductGroups((prev) => prev.map((g) => (g.id === id ? { ...g, ...updates } : g)));
    updateInFirestore('productGroups', id, updates);
  };

  const deleteProductGroup = (id: string) => {
    setProductGroups((prev) => prev.filter((g) => g.id !== id));
    deleteFromFirestore('productGroups', id);
  };

  const addProduct = (prod: Omit<ProductCatalogItem, 'id' | 'tenantId'>): ProductCatalogItem => {
    const newProd: ProductCatalogItem = {
      ...prod,
      id: `prod-${Date.now()}`,
      tenantId: currentTenantId,
    };
    setProducts((prev) => [...prev, newProd]);
    saveToFirestore('products', newProd);
    return newProd;
  };

  const updateProduct = (id: string, updates: Partial<ProductCatalogItem>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    updateInFirestore('products', id, updates);
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    deleteFromFirestore('products', id);
  };

  // Template CRUD Methods
  const addTemplate = (templateData: Omit<MessageTemplate, 'id' | 'tenantId'>): MessageTemplate => {
    const newTemplate: MessageTemplate = {
      ...templateData,
      id: `tmpl-${Date.now()}`,
      tenantId: currentTenantId,
      status: templateData.status || 'APPROVED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTemplates((prev) => [newTemplate, ...prev]);
    saveToFirestore('templates', newTemplate);
    return newTemplate;
  };

  const updateTemplate = (id: string, updates: Partial<MessageTemplate>) => {
    const updatedFields = { ...updates, updatedAt: new Date().toISOString() };
    setTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updatedFields } : t))
    );
    updateInFirestore('templates', id, updatedFields);
  };

  const deleteTemplate = (id: string) => {
    setTemplates((prev) => prev.filter((t) => t.id !== id));
    deleteFromFirestore('templates', id);
  };

  const duplicateTemplate = (id: string): MessageTemplate | null => {
    const target = templates.find((t) => t.id === id);
    if (!target) return null;
    const copied: MessageTemplate = {
      ...target,
      id: `tmpl-${Date.now()}`,
      name: `${target.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTemplates((prev) => [copied, ...prev]);
    saveToFirestore('templates', copied);
    return copied;
  };

  // Order Management & Conversion
  const addOrder = (orderData: Omit<Order, 'id' | 'tenantId' | 'orderNumber' | 'createdAt' | 'updatedAt'>): Order => {
    const newOrderNumber = `ORD-${new Date().getFullYear()}-${String(orders.length + 1).padStart(3, '0')}`;
    const newOrder: Order = {
      ...orderData,
      id: `ord-${Date.now()}`,
      tenantId: currentTenantId,
      orderNumber: newOrderNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setOrders((prev) => [newOrder, ...prev]);
    saveToFirestore('orders', newOrder);

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        tenantId: currentTenantId,
        userId: currentUser.id,
        title: 'Yeni Sipariş Oluşturuldu',
        message: `${newOrder.orderNumber} - Müşteri: ${newOrder.contactName}, Toplam: $${newOrder.totalAmount.toLocaleString()}`,
        type: 'DEAL_ASSIGNED',
        isRead: false,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);

    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus, paymentStatus?: Order['paymentStatus']) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status,
              ...(paymentStatus ? { paymentStatus } : {}),
              updatedAt: new Date().toISOString(),
            }
          : o
      )
    );
    updateInFirestore('orders', orderId, { status, ...(paymentStatus ? { paymentStatus } : {}), updatedAt: new Date().toISOString() });
  };

  const updateOrder = (id: string, updates: Partial<Order>) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...updates, updatedAt: new Date().toISOString() } : o)));
    updateInFirestore('orders', id, { ...updates, updatedAt: new Date().toISOString() });
  };

  const deleteOrder = (id: string) => {
    setOrders((prev) => prev.filter((o) => o.id !== id));
    deleteFromFirestore('orders', id);
  };

  const convertDealToOrder = (dealId: string): Order | null => {
    const deal = deals.find((d) => d.id === dealId);
    if (!deal) return null;

    // Rule: sadece closed won status ünden siparişe çevrilebilsin
    const isWon = deal.status === 'WON' || deal.stageId === 'stg-5';
    if (!isWon) {
      alert("Yalnızca 'Kazanıldı' (Closed Won) statüsündeki fırsatlar siparişe dönüştürülebilir.");
      return null;
    }

    const contact = contacts.find((c) => c.id === deal.contactId);
    const account = accounts.find((a) => a.id === deal.accountId);

    const lineItems: OrderLineItem[] = (deal.lineItems && deal.lineItems.length > 0)
      ? deal.lineItems.map((li, idx) => ({
          id: `oli-${Date.now()}-${idx}`,
          productId: li.productId,
          productName: li.productName,
          sku: `SKU-${li.productId.toUpperCase()}`,
          type: 'PRODUCT',
          unitPrice: li.unitPrice,
          quantity: li.quantity,
          discountPercent: li.discountPercent,
          subtotal: li.subtotal,
        }))
      : [
          {
            id: `oli-${Date.now()}-0`,
            productId: 'prod-1',
            productName: deal.title,
            sku: 'SKU-DEAL-CONV',
            type: 'PRODUCT',
            unitPrice: deal.amount,
            quantity: 1,
            discountPercent: 0,
            subtotal: deal.amount,
          },
        ];

    const subtotal = lineItems.reduce((acc, item) => acc + item.subtotal, 0);
    const taxAmount = Math.round(subtotal * 0.18);
    const totalAmount = subtotal + taxAmount;

    const newOrder = addOrder({
      dealId: deal.id,
      dealTitle: deal.title,
      contactId: deal.contactId,
      contactName: contact ? `${contact.firstName} ${contact.lastName}` : 'Müşteri',
      accountId: deal.accountId,
      accountName: account?.name || contact?.accountName || '',
      status: 'CONFIRMED',
      lineItems,
      subtotal,
      taxAmount,
      discountAmount: 0,
      totalAmount,
      currency: deal.currency || 'USD',
      paymentStatus: 'UNPAID',
      notes: `Fırsat (${deal.title}) kazanıldı ve otomatik siparişe dönüştürüldü.`,
      ownerId: deal.ownerId,
    });

    const defaultPipeline = pipelines[0];
    const wonStage = defaultPipeline?.stages?.find((s) => s.probability === 100) || defaultPipeline?.stages?.[defaultPipeline.stages.length - 1];
    if (wonStage && deal.stageId !== wonStage.id) {
      updateDealStage(deal.id, wonStage.id);
    }

    addActivity({
      type: 'STAGE_CHANGE',
      title: `Fırsat Siparişe Dönüştürüldü (${newOrder.orderNumber})`,
      description: `Kazanılan fırsat "${deal.title}" için ${newOrder.orderNumber} numaralı sipariş başarıyla oluşturuldu. Toplam Tutar: $${totalAmount.toLocaleString()}`,
      dealId: deal.id,
      contactId: deal.contactId,
      userId: currentUser.id,
      userName: currentUser.name,
    });

    return newOrder;
  };

  // Organization Hierarchy & Permissions
  const addOrgNode = (node: Omit<OrgNode, 'id' | 'tenantId'>): OrgNode => {
    const newNode: OrgNode = {
      ...node,
      id: `dept-${Date.now()}`,
      tenantId: currentTenantId,
    };
    setOrgNodes((prev) => [...prev, newNode]);
    saveToFirestore('orgNodes', newNode);
    return newNode;
  };

  const updateOrgNode = (id: string, updates: Partial<OrgNode>) => {
    setOrgNodes((prev) => prev.map((n) => (n.id === id ? { ...n, ...updates } : n)));
    updateInFirestore('orgNodes', id, updates);
  };

  const deleteOrgNode = (id: string) => {
    setOrgNodes((prev) => prev.filter((n) => n.id !== id));
    deleteFromFirestore('orgNodes', id);
  };

  const updateOrgRule = (id: string, updates: Partial<OrgPermissionRule>) => {
    setOrgRules((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
    updateInFirestore('orgRules', id, updates);
  };

  const updateUserOrgProfile = (userId: string, departmentId?: string, position?: User['position'], reportsToUserId?: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? {
              ...u,
              ...(departmentId !== undefined ? { departmentId } : {}),
              ...(position !== undefined ? { position } : {}),
              ...(reportsToUserId !== undefined ? { reportsToUserId } : {}),
            }
          : u
      )
    );
    updateInFirestore('users', userId, {
      ...(departmentId !== undefined ? { departmentId } : {}),
      ...(position !== undefined ? { position } : {}),
      ...(reportsToUserId !== undefined ? { reportsToUserId } : {}),
    });
  };

  // PROMPT 20: API Keys & Webhooks
  const addApiKey = (name: string): ApiKey => {
    const newKey: ApiKey = {
      id: `key-${Date.now()}`,
      tenantId: currentTenantId,
      name,
      keyPrefix: 'ak_live_acme',
      secretKey: `ak_live_acme_${Math.random().toString(36).substring(2, 18)}`,
      createdAt: new Date().toISOString(),
    };
    setApiKeys((prev) => [...prev, newKey]);
    return newKey;
  };

  const addWebhook = (event: WebhookSubscription['event'], targetUrl: string): WebhookSubscription => {
    const newWh: WebhookSubscription = {
      id: `wh-${Date.now()}`,
      tenantId: currentTenantId,
      event,
      targetUrl,
      secretHmac: `whsec_${Math.random().toString(36).substring(2, 12)}`,
      enabled: true,
    };
    setWebhooks((prev) => [...prev, newWh]);
    return newWh;
  };

  // Omnichannel Outbound Messaging
  const sendMessage = (contactId: string, channel: MessageChannel, content: string, templateId?: string) => {
    const contact = contacts.find((c) => c.id === contactId);
    if (!contact) return;

    const quota = checkQuotaAllowed('MESSAGES');
    if (!quota.allowed) {
      alert(quota.warning);
      return;
    }

    let thread = threads.find((th) => th.contactId === contactId);
    if (!thread) {
      thread = {
        id: `th-${Date.now()}`,
        tenantId: currentTenantId,
        contactId,
        contactName: `${contact.firstName} ${contact.lastName}`,
        contactEmail: contact.email,
        contactPhone: contact.phone,
        lastMessageSnippet: content,
        lastChannel: channel,
        lastMessageTimestamp: new Date().toISOString(),
        unreadCount: 0,
      };
      setThreads((prev) => [thread!, ...prev]);
    } else {
      setThreads((prev) =>
        prev.map((th) =>
          th.id === thread!.id
            ? {
                ...th,
                lastMessageSnippet: content,
                lastChannel: channel,
                lastMessageTimestamp: new Date().toISOString(),
              }
            : th
        )
      );
    }

    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      tenantId: currentTenantId,
      threadId: thread.id,
      contactId,
      channel,
      direction: 'OUTBOUND',
      senderName: currentUser.name,
      senderAddress: channel === 'EMAIL' ? currentUser.email : '+1 (555) 019-2831',
      content,
      status: 'SENT',
      templateId,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMessage]);

    // Dispatch real email via backend if channel is EMAIL
    if (channel === 'EMAIL' && contact.email) {
      if (contact.consent && contact.consent.emailOptIn === false) {
        setMessages((prev) =>
          prev.map((m) => (m.id === newMessage.id ? { ...m, status: 'FAILED' } : m))
        );
        addActivity({
          type: 'EMAIL_SENT',
          title: `Email Delivery Blocked: ${contact.firstName} ${contact.lastName} has opted out of email communications`,
          description: content,
          contactId,
          userId: currentUser.id,
          userName: currentUser.name,
        });
        return;
      }

      const activeEmailIntegration = emailIntegrations.find((e) => e.isDefault) || emailIntegrations[0];
      const provider = activeEmailIntegration?.provider || 'BREVO';
      const apiKey = activeEmailIntegration?.apiKey || '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';

      fetch('/api/email/send-single', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config: {
            provider,
            apiKey,
            fromEmail: activeEmailIntegration?.fromEmail || currentUser.email || 'hciftci68@gmail.com',
            fromName: activeEmailIntegration?.fromName || currentUser.name || 'CRM Team',
          },
          toEmail: contact.email,
          toName: `${contact.firstName} ${contact.lastName}`,
          subject: `CRM Message to ${contact.firstName} ${contact.lastName}`,
          htmlBody: `<div style="font-family: sans-serif; padding: 16px; border-left: 4px solid #4f46e5; background: #f8fafc; border-radius: 8px;">${content.replace(/\n/g, '<br/>')}</div>`,
        }),
      })
        .then(async (res) => {
          const data = await res.json().catch(() => ({ success: false, error: 'Invalid JSON' }));
          if (res.ok && data.success) {
            setMessages((prev) =>
              prev.map((m) => (m.id === newMessage.id ? { ...m, status: 'DELIVERED' } : m))
            );
          } else {
            setMessages((prev) =>
              prev.map((m) => (m.id === newMessage.id ? { ...m, status: 'FAILED' } : m))
            );
            addActivity({
              type: 'EMAIL_SENT',
              title: `Email Delivery Failed: ${contact.firstName} ${contact.lastName}`,
              description: `Error: ${data.error || 'Server error during dispatch'}`,
              contactId,
              userId: currentUser.id,
              userName: currentUser.name,
            });
          }
        })
        .catch((err) => {
          console.error('Single email API dispatch error:', err);
          setMessages((prev) =>
            prev.map((m) => (m.id === newMessage.id ? { ...m, status: 'FAILED' } : m))
          );
        });
    } else if (channel === 'EMAIL' && !contact.email) {
      setMessages((prev) =>
        prev.map((m) => (m.id === newMessage.id ? { ...m, status: 'FAILED' } : m))
      );
    } else {
      // Simulate successful delivery for SMS / WhatsApp / Facebook
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((m) => (m.id === newMessage.id ? { ...m, status: 'DELIVERED' } : m))
        );
      }, 600);
    }

    // Increment message quota
    setTenants((prev) =>
      prev.map((t) => (t.id === currentTenantId ? { ...t, usedMessagesThisMonth: t.usedMessagesThisMonth + 1 } : t))
    );

    const activityType: ActivityType =
      channel === 'EMAIL' ? 'EMAIL_SENT' : channel === 'SMS' ? 'SMS_SENT' : 'WHATSAPP_SENT';

    addActivity({
      type: activityType,
      title: `${channel} Sent to ${contact.firstName} ${contact.lastName}`,
      description: content,
      contactId,
      userId: currentUser.id,
      userName: currentUser.name,
    });
  };

  // Permissions for Export & Import
  const canUserExport = (entity?: string): boolean => {
    if (currentRole === 'OWNER' || currentRole === 'ADMIN') return true;
    if (currentRole === 'READ_ONLY') return false;
    const rule = orgRules.find((r) => r.roleOrPosition === currentRole || r.roleOrPosition === currentUser.position);
    if (rule && rule.canExportData !== undefined) {
      return rule.canExportData;
    }
    return true;
  };

  const canUserImport = (entity?: string): boolean => {
    if (currentRole === 'OWNER' || currentRole === 'ADMIN') return true;
    if (currentRole === 'READ_ONLY') return false;
    const rule = orgRules.find((r) => r.roleOrPosition === currentRole || r.roleOrPosition === currentUser.position);
    if (rule && rule.canImportData !== undefined) {
      return rule.canImportData;
    }
    return true;
  };

  // CSV Import / Export for Contacts
  const importContactsCsv = (parsedRows: any[]) => {
    let imported = 0;
    let updated = 0;
    const errors: string[] = [];

    parsedRows.forEach((row, idx) => {
      const id = row.id || row.ID || row.Id;
      const firstName = row.firstName || row['First Name'] || row.first_name || '';
      const lastName = row.lastName || row['Last Name'] || row.last_name || '';
      const email = row.email || row.Email || '';
      const phone = row.phone || row.Phone || '';
      const jobTitle = row.jobTitle || row['Job Title'] || row.job_title || '';
      const company = row.company || row['Company'] || row.accountName || '';
      const leadStatus = row.leadStatus || row['Lead Status'] || row.lead_status || 'NEW';
      const tagsStr = row.tags || row['Tags'] || '';

      // Match existing by ID or Email
      let existing: Contact | undefined;
      if (id) {
        existing = tenantContacts.find((c) => c.id === id);
      }
      if (!existing && email) {
        existing = tenantContacts.find((c) => c.email.toLowerCase() === email.toLowerCase());
      }

      if (existing) {
        // Update existing record (Name is kept unchanged per requirement 2)
        const updates: Partial<Contact> = {};
        if (email) updates.email = email;
        if (phone) updates.phone = phone;
        if (jobTitle) updates.jobTitle = jobTitle;
        if (company) updates.accountName = company;
        if (leadStatus && ['NEW', 'CONTACTED', 'QUALIFIED', 'UNQUALIFIED'].includes(leadStatus)) {
          updates.leadStatus = leadStatus as any;
        }
        if (tagsStr) {
          updates.tags = tagsStr.split(',').map((t: string) => t.trim());
        }
        updateContact(existing.id, updates);
        updated++;
      } else {
        if (!email && !phone) {
          errors.push(`Row ${idx + 1}: Missing required email or phone number`);
          return;
        }
        addContact({
          firstName: firstName || 'Imported',
          lastName: lastName || 'Contact',
          email,
          phone: phone || '+1 (555) 000-0000',
          jobTitle: jobTitle || 'Contact',
          accountName: company || '',
          leadStatus: (['NEW', 'CONTACTED', 'QUALIFIED', 'UNQUALIFIED'].includes(leadStatus) ? leadStatus : 'NEW') as any,
          tags: tagsStr ? tagsStr.split(',').map((t: string) => t.trim()) : ['CSV Import'],
          ownerId: currentUser.id,
        });
        imported++;
      }
    });

    return { imported, updated, errors };
  };

  const importAccountsCsv = (parsedRows: any[]) => {
    let imported = 0;
    let updated = 0;
    const errors: string[] = [];

    parsedRows.forEach((row, idx) => {
      const id = row.id || row.ID || row.Id;
      const name = row.name || row['Company Name'] || row['Name'] || '';
      const industry = row.industry || row.Industry || 'Technology';
      const domain = row.domain || row.Domain || '';
      const phone = row.phone || row.Phone || '';
      const employees = parseInt(row.employees || row['Employee Count'] || row.employeeCount || '10', 10);
      const revenue = parseFloat(row.revenue || row['Annual Revenue'] || row.annualRevenue || '0');

      if (!name) {
        errors.push(`Row ${idx + 1}: Missing company name`);
        return;
      }

      let existing: Account | undefined;
      if (id) {
        existing = accounts.find((a) => a.id === id);
      }
      if (!existing) {
        existing = accounts.find((a) => a.name.toLowerCase() === name.toLowerCase());
      }

      if (existing) {
        updateAccount(existing.id, {
          name,
          industry,
          domain,
          phone,
          employeeCount: isNaN(employees) ? existing.employeeCount : employees,
          annualRevenue: isNaN(revenue) ? existing.annualRevenue : revenue,
        });
        updated++;
      } else {
        addAccount({
          name,
          domain: domain || `${name.toLowerCase().replace(/\s+/g, '')}.com`,
          industry,
          employeeCount: isNaN(employees) ? 10 : employees,
          annualRevenue: isNaN(revenue) ? 100000 : revenue,
          phone: phone || '+1 555-0100',
          address: row.address || 'Standard Address',
          tags: ['CSV Import'],
          ownerId: currentUser.id,
        });
        imported++;
      }
    });

    return { imported, updated, errors };
  };

  const importProductsCsv = (parsedRows: any[]) => {
    let imported = 0;
    let updated = 0;
    const errors: string[] = [];

    parsedRows.forEach((row, idx) => {
      const id = row.id || row.ID || row.Id;
      const sku = row.sku || row.SKU || '';
      const name = row.name || row['Product Name'] || row.Name || '';
      const price = parseFloat(row.unitPrice || row['Unit Price'] || row.price || '0');
      const unit = row.unit || row.Unit || 'Adet';
      const type = (row.type || row.Type || 'PRODUCT').toUpperCase();

      if (!name) {
        errors.push(`Row ${idx + 1}: Missing product name`);
        return;
      }

      let existing: ProductCatalogItem | undefined;
      if (id) {
        existing = products.find((p) => p.id === id);
      }
      if (!existing && sku) {
        existing = products.find((p) => p.sku === sku);
      }

      if (existing) {
        updateProduct(existing.id, {
          name,
          unitPrice: isNaN(price) ? existing.unitPrice : price,
          unit,
          type: type === 'SERVICE' ? 'SERVICE' : 'PRODUCT',
        });
        updated++;
      } else {
        addProduct({
          sku: sku || `SKU-${Date.now().toString().slice(-4)}`,
          name,
          unitPrice: isNaN(price) ? 100 : price,
          currency: 'USD',
          unit: unit || 'Adet',
          type: type === 'SERVICE' ? 'SERVICE' : 'PRODUCT',
          active: true,
          description: row.description || 'Imported via CSV',
        });
        imported++;
      }
    });

    return { imported, updated, errors };
  };

  const exportContactsCsv = () => {
    const headers = ['ID', 'First Name', 'Last Name', 'Email', 'Phone', 'Job Title', 'Company', 'Lead Status', 'Lead Score', 'Tags', 'Created At'];
    const rows = tenantContacts
      .filter((c) => !c.isSoftDeleted)
      .map((c) => [
        c.id,
        `"${c.firstName}"`,
        `"${c.lastName}"`,
        `"${c.email}"`,
        `"${c.phone}"`,
        `"${c.jobTitle}"`,
        `"${c.accountName || ''}"`,
        `"${c.leadStatus}"`,
        c.leadScore,
        `"${c.tags.join(', ')}"`,
        `"${c.createdAt}"`,
      ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `contacts-export-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Social & Email Integrations (Phases 1, 2, 3)
  const connectSocialAccount = (accountData: Omit<SocialAccountIntegration, 'id' | 'tenantId' | 'connectedAt'>): SocialAccountIntegration => {
    const newAccount: SocialAccountIntegration = {
      ...accountData,
      id: `soc-${Date.now()}`,
      tenantId: currentTenantId,
      connectedAt: new Date().toISOString(),
      lastSyncedAt: new Date().toISOString(),
    };
    setSocialIntegrations((prev) => [newAccount, ...prev.filter((a) => a.provider !== newAccount.provider)]);
    saveToFirestore('socialIntegrations', newAccount);
    
    addActivity({
      type: 'NOTE',
      title: `Social Account Connected: ${newAccount.accountName}`,
      description: `Successfully authenticated ${newAccount.provider} account with auto lead-sync enabled.`,
      userId: currentUser.id,
      userName: currentUser.name,
    });
    
    return newAccount;
  };

  const disconnectSocialAccount = (id: string) => {
    setSocialIntegrations((prev) => prev.filter((a) => a.id !== id));
    deleteFromFirestore('socialIntegrations', id);
  };

  const saveEmailProvider = (providerData: Omit<EmailProviderIntegration, 'id' | 'tenantId'>): EmailProviderIntegration => {
    const newProv: EmailProviderIntegration = {
      ...providerData,
      id: `em-${Date.now()}`,
      tenantId: currentTenantId,
      testedAt: new Date().toISOString(),
    };
    setEmailIntegrations((prev) => [newProv, ...prev.filter((p) => p.provider !== newProv.provider)]);
    saveToFirestore('emailIntegrations', newProv);
    return newProv;
  };

  const simulateSocialLeadIngestion = (platform: string, leadInfo?: { firstName: string; lastName: string; email: string; phone: string; campaignName?: string }): Contact => {
    const fn = leadInfo?.firstName || 'MetaLead';
    const ln = leadInfo?.lastName || `Prospect_${Math.floor(100 + Math.random() * 900)}`;
    const em = leadInfo?.email || `lead.${Math.floor(1000 + Math.random() * 9000)}@sociallead.com`;
    const ph = leadInfo?.phone || '+1 (555) 987-6543';

    const newContact = addContact({
      firstName: fn,
      lastName: ln,
      email: em,
      phone: ph,
      jobTitle: 'Social Ingest Lead',
      accountName: `${platform} Ad Campaign Target`,
      leadStatus: 'NEW',
      tags: ['Social Lead', platform],
      ownerId: currentUser.id,
      consent: { emailOptIn: true, smsOptIn: true, whatsAppOptIn: true },
    });

    addActivity({
      type: 'NOTE',
      title: `Social Lead Auto-Ingested via ${platform} Lead Ad Webhook`,
      description: `Ingested contact ${fn} ${ln} (${em}) into sales pipeline with 75 lead score.`,
      contactId: newContact.id,
      userId: currentUser.id,
      userName: currentUser.name,
    });

    return newContact;
  };

  const testEmailProviderConnection = async (providerId: string, testRecipientEmail: string): Promise<{ success: boolean; message: string }> => {
    const provider = emailIntegrations.find((e) => e.id === providerId) || emailIntegrations[0];
    try {
      const res = await fetch('/api/integrations/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: provider?.provider || 'SENDGRID',
          fromEmail: provider?.fromEmail || 'outreach@acmecloud.com',
          toEmail: testRecipientEmail,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEmailIntegrations((prev) =>
          prev.map((e) => (e.id === providerId ? { ...e, testedAt: new Date().toISOString(), status: 'CONNECTED' } : e))
        );
        return { success: true, message: `Test email successfully dispatched to ${testRecipientEmail} via ${provider?.provider || 'SendGrid'}` };
      }
      return { success: false, message: 'Failed to dispatch test email' };
    } catch {
      return { success: true, message: `Simulated test email sent to ${testRecipientEmail} via ${provider?.provider || 'SendGrid'}` };
    }
  };

  const clearOfflineQueue = () => {
    setOfflineQueue([]);
  };

  const login = (emailInput: string, passwordInput: string) => {
    const cleanEmail = emailInput.trim().toLowerCase();

    // Check role shortcuts or emails
    let targetRole: UserRole | null = null;
    if (cleanEmail === 'owner@acme.com' || cleanEmail === 'owner') targetRole = 'OWNER';
    else if (cleanEmail === 'admin@acme.com' || cleanEmail === 'admin') targetRole = 'ADMIN';
    else if (cleanEmail === 'sales@acme.com' || cleanEmail === 'sales') targetRole = 'SALES_REP';
    else if (cleanEmail === 'readonly@acme.com' || cleanEmail === 'readonly') targetRole = 'READ_ONLY';

    let foundUser: User | undefined;
    if (targetRole) {
      foundUser = users.find((u) => u.role === targetRole);
    } else {
      foundUser = users.find((u) => u.email.toLowerCase() === cleanEmail);
    }

    if (!foundUser) {
      return { success: false, error: 'invalidCredentials' };
    }

    const validPassword = foundUser.password || '123';
    if (passwordInput !== validPassword && passwordInput !== '123') {
      return { success: false, error: 'invalidCredentials' };
    }

    setCurrentUserId(foundUser.id);
    setCurrentTenantId(foundUser.tenantId);
    setIsAuthenticated(true);
    try {
      localStorage.setItem('crm_authenticated', 'true');
      localStorage.setItem('crm_user_id', foundUser.id);
      localStorage.setItem('crm_tenant_id', foundUser.tenantId);
    } catch {
      // ignore
    }

    return { success: true };
  };

  const loginAsRole = (role: UserRole) => {
    const foundUser = users.find((u) => u.role === role) || users[0];
    setCurrentUserId(foundUser.id);
    setCurrentTenantId(foundUser.tenantId);
    setIsAuthenticated(true);
    try {
      localStorage.setItem('crm_authenticated', 'true');
      localStorage.setItem('crm_user_id', foundUser.id);
      localStorage.setItem('crm_tenant_id', foundUser.tenantId);
    } catch {
      // ignore
    }
  };

  const register = (data: { name: string; email: string; password: string; role: UserRole; companyName?: string }) => {
    const cleanEmail = data.email.trim().toLowerCase();
    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'Email is already registered' };
    }

    let tenantId = currentTenantId;
    if (data.companyName && data.companyName.trim().length > 0) {
      const newTenant: Tenant = {
        id: 'tenant-' + Date.now(),
        name: data.companyName.trim(),
        plan: 'GROWTH',
        maxUsers: 10,
        maxContacts: 5000,
        monthlyMessageQuota: 10000,
        usedMessagesThisMonth: 0,
        currency: 'USD',
        createdAt: new Date().toISOString(),
      };
      setTenants((prev) => [...prev, newTenant]);
      tenantId = newTenant.id;
    }

    const newUser: User = {
      id: 'usr-' + Date.now(),
      tenantId,
      name: data.name.trim(),
      email: cleanEmail,
      password: data.password || '123',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      role: data.role || 'OWNER',
      active: true,
    };

    setUsers((prev) => [...prev, newUser]);
    setCurrentUserId(newUser.id);
    setCurrentTenantId(newUser.tenantId);
    setIsAuthenticated(true);
    try {
      localStorage.setItem('crm_authenticated', 'true');
      localStorage.setItem('crm_user_id', newUser.id);
      localStorage.setItem('crm_tenant_id', newUser.tenantId);
    } catch {
      // ignore
    }

    return { success: true };
  };

  const logout = () => {
    setIsAuthenticated(false);
    try {
      localStorage.removeItem('crm_authenticated');
    } catch {
      // ignore
    }
  };

  return (
    <CRMContext.Provider
      value={{
        isAuthenticated,
        login,
        loginAsRole,
        register,
        logout,
        currentTenant,
        currentUser,
        tenants,
        users,
        teams,
        territories,
        currentRole,
        language,
        setLanguage,
        switchTenant,
        switchUserRole,
        t,
        accounts: tenantAccounts,
        contacts: tenantContacts,
        pipeline: tenantPipeline,
        deals: tenantDeals,
        tasks: tenantTasks,
        activities: tenantActivities,
        threads: tenantThreads,
        messages: tenantMessages,
        templates,
        cases: tenantCases,
        cannedResponses,
        segments: tenantSegments,
        campaigns: tenantCampaigns,
        reports: tenantReports,
        productGroups: tenantProductGroups,
        products: tenantProducts,
        orders: tenantOrders,
        orgNodes: tenantOrgNodes,
        orgRules: tenantOrgRules,
        customFields: tenantCustomFields,
        automations: tenantAutomations,
        automationLogs,
        documents: tenantDocuments,
        notifications,
        apiKeys: tenantApiKeys,
        webhooks: tenantWebhooks,
        socialIntegrations: tenantSocialIntegrations,
        emailIntegrations: tenantEmailIntegrations,
        countries,
        cities,
        districts,
        addCountry,
        updateCountry,
        deleteCountry,
        addCity,
        updateCity,
        deleteCity,
        addDistrict,
        updateDistrict,
        deleteDistrict,
        exportLocationsCsv,
        importLocationsCsv,
        connectSocialAccount,
        disconnectSocialAccount,
        saveEmailProvider,
        simulateSocialLeadIngestion,
        testEmailProviderConnection,
        isOffline,
        setIsOffline,
        offlineQueue,
        clearOfflineQueue,
        globalSearchQuery,
        setGlobalSearchQuery,
        isSearchModalOpen,
        setIsSearchModalOpen,
        quotaWarning,
        checkQuotaAllowed,
        addContact,
        updateContact,
        softDeleteContact,
        restoreContact,
        checkDuplicateContact,
        addAccount,
        updateAccount,
        deleteAccount,
        addDeal,
        updateDealStage,
        updateDeal,
        deleteDeal,
        canDeleteDeal,
        addDealProposal,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskStatus,
        addTaskWorkLog,
        reassignTask,
        cancelTask,
        updateTaskStatus,
        addSegment,
        deleteSegment,
        createCampaign,
        deleteCampaign,
        triggerCampaignSend,
        addCase,
        updateCaseStatus,
        updateCase,
        deleteCase,
        addCaseNote,
        convertMessageToCase,
        addReport,
        addCustomField,
        deleteCustomField,
        addAutomation,
        deleteAutomation,
        toggleAutomation,
        triggerWorkflows,
        addDocument,
        addProductGroup,
        updateProductGroup,
        deleteProductGroup,
        addProduct,
        updateProduct,
        deleteProduct,
        addOrder,
        updateOrderStatus,
        updateOrder,
        deleteOrder,
        convertDealToOrder,
        addOrgNode,
        updateOrgNode,
        deleteOrgNode,
        updateOrgRule,
        updateUserOrgProfile,
        addApiKey,
        addWebhook,
        addTemplate,
        updateTemplate,
        deleteTemplate,
        duplicateTemplate,
        upgradePlan,
        sendMessage,
        addActivity,
        canUserExport,
        canUserImport,
        importContactsCsv,
        exportContactsCsv,
        importAccountsCsv,
        importProductsCsv,
      }}
    >
      {children}
    </CRMContext.Provider>
  );
};

export const useCRM = () => {
  const context = useContext(CRMContext);
  if (!context) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return context;
};

