import React, { useState } from 'react';
import { CRMProvider, useCRM } from './context/CRMContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { Dashboard } from './components/dashboard/Dashboard';
import { ContactsList } from './components/contacts/ContactsList';
import { ContactDetailModal } from './components/contacts/ContactDetailModal';
import { AccountsList } from './components/accounts/AccountsList';
import { DealsKanban } from './components/deals/DealsKanban';
import { DealDetailModal } from './components/deals/DealDetailModal';
import { TasksView } from './components/tasks/TasksView';
import { OmnichannelInbox } from './components/inbox/OmnichannelInbox';
import { CasesView } from './components/cases/CasesView';
import { CampaignView } from './components/campaigns/CampaignView';
import { ReportsView } from './components/reports/ReportsView';
import { AutomationView } from './components/automation/AutomationView';
import { ProductCatalogView } from './components/products/ProductCatalogView';
import { OrderManagementView } from './components/orders/OrderManagementView';
import { OrgHierarchyView } from './components/organization/OrgHierarchyView';
import { TenantSettings } from './components/settings/TenantSettings';
import { DocumentationView } from './components/docs/DocumentationView';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { PWAInstallBanner } from './components/common/PWAInstallBanner';
import { AuthView } from './components/auth/AuthView';

const MainAppContent: React.FC = () => {
  const { isAuthenticated } = useCRM();
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);

  if (!isAuthenticated) {
    return <AuthView />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-100 text-slate-900 font-sans antialiased dark:bg-[#080c14] dark:text-slate-100">
      {/* Top Navbar */}
      <Navbar />

      {/* PWA Install & Offline Alerts */}
      <PWAInstallBanner />

      {/* Main Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar & Mobile Bottom Nav */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Content Views */}
        <main className="flex-1 overflow-y-auto pb-20 md:pb-6">
          {activeTab === 'dashboard' && (
            <Dashboard
              onNavigateTab={setActiveTab}
              onSelectContact={setSelectedContactId}
              onSelectDeal={setSelectedDealId}
            />
          )}

          {activeTab === 'contacts' && (
            <ContactsList onSelectContact={setSelectedContactId} />
          )}

          {activeTab === 'accounts' && <AccountsList />}

          {activeTab === 'deals' && (
            <DealsKanban
              onSelectDeal={setSelectedDealId}
              onSelectContact={setSelectedContactId}
            />
          )}

          {activeTab === 'orders' && <OrderManagementView />}

          {activeTab === 'products' && <ProductCatalogView />}

          {activeTab === 'organization' && <OrgHierarchyView />}

          {activeTab === 'tasks' && (
            <TasksView
              onSelectContact={setSelectedContactId}
              onSelectDeal={setSelectedDealId}
            />
          )}

          {activeTab === 'inbox' && <OmnichannelInbox />}

          {activeTab === 'cases' && <CasesView />}

          {activeTab === 'campaigns' && <CampaignView />}

          {activeTab === 'reports' && <ReportsView />}

          {activeTab === 'automation' && <AutomationView />}

          {activeTab === 'settings' && <TenantSettings />}

          {activeTab === 'docs' && <DocumentationView />}
        </main>
      </div>

      {/* Modals */}
      <ContactDetailModal
        contactId={selectedContactId}
        onClose={() => setSelectedContactId(null)}
        onNavigateTab={setActiveTab}
      />

      <DealDetailModal
        dealId={selectedDealId}
        onClose={() => setSelectedDealId(null)}
        onSelectContact={setSelectedContactId}
      />

      <GlobalSearchModal
        onSelectContact={setSelectedContactId}
        onSelectDeal={setSelectedDealId}
        onNavigateTab={setActiveTab}
      />
    </div>
  );
};

export default function App() {
  return (
    <CRMProvider>
      <MainAppContent />
    </CRMProvider>
  );
}

