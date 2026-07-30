import React from 'react';
import { useCRM } from '../../context/CRMContext';
import {
  LayoutDashboard, Users, Building2, Kanban, CheckSquare, MessageSquare, Settings,
  Headphones, Send, BarChart3, Workflow, BookOpen, Package, ShoppingBag, Network
} from 'lucide-react';

export type NavTab = 'dashboard' | 'contacts' | 'accounts' | 'deals' | 'orders' | 'products' | 'organization' | 'tasks' | 'inbox' | 'cases' | 'campaigns' | 'reports' | 'automation' | 'settings' | 'docs';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { threads, tasks, cases, campaigns, orders, t } = useCRM();

  const unreadMessagesCount = threads.reduce((acc, thread) => acc + thread.unreadCount, 0);
  const openTasksCount = tasks.filter((t) => t.status === 'OPEN').length;
  const openCasesCount = cases.filter((c) => c.status === 'NEW' || c.status === 'OPEN' || c.status === 'PENDING').length;
  const activeCampaignsCount = campaigns.filter((c) => c.status === 'SCHEDULED' || c.status === 'SENDING').length;
  const activeOrdersCount = orders.filter((o) => o.status === 'CONFIRMED' || o.status === 'PROCESSING').length;

  const navItems = [
    { id: 'dashboard' as NavTab, label: t('dashboard'), icon: LayoutDashboard },
    { id: 'contacts' as NavTab, label: t('contacts'), icon: Users },
    { id: 'accounts' as NavTab, label: t('accounts'), icon: Building2 },
    { id: 'deals' as NavTab, label: t('deals'), icon: Kanban },
    { id: 'orders' as NavTab, label: 'Siparişler', icon: ShoppingBag, badge: activeOrdersCount },
    { id: 'products' as NavTab, label: 'Ürün & Hizmet Katalogu', icon: Package },
    { id: 'organization' as NavTab, label: 'Organizasyon & Yetki', icon: Network },
    { id: 'tasks' as NavTab, label: t('tasks'), icon: CheckSquare, badge: openTasksCount },
    { id: 'inbox' as NavTab, label: t('inbox'), icon: MessageSquare, badge: unreadMessagesCount },
    { id: 'cases' as NavTab, label: t('cases'), icon: Headphones, badge: openCasesCount },
    { id: 'campaigns' as NavTab, label: t('campaigns'), icon: Send, badge: activeCampaignsCount },
    { id: 'reports' as NavTab, label: t('reports'), icon: BarChart3 },
    { id: 'automation' as NavTab, label: t('automation'), icon: Workflow },
    { id: 'settings' as NavTab, label: t('settings'), icon: Settings },
    { id: 'docs' as NavTab, label: 'Dokümantasyon', icon: BookOpen },
  ];

  return (
    <>
      {/* Desktop Sidebar (Left) */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-200 bg-white p-4 md:flex dark:border-slate-800 dark:bg-slate-900">
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto pr-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-100'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`ml-2 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      isActive
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 z-40 flex h-16 w-full items-center justify-around border-t border-slate-200 bg-white px-1 md:hidden dark:border-slate-800 dark:bg-slate-900">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`relative flex flex-col items-center justify-center gap-1 rounded-lg px-2 py-1 text-[10px] font-medium transition-colors ${
                isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="truncate max-w-[50px]">{item.label.split(' ')[0]}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute -top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[9px] font-bold text-white">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </>
  );
};

