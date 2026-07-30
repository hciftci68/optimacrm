import React from 'react';
import { useCRM } from '../../context/CRMContext';
import { Search, X, Users, Building2, Kanban, CheckSquare, MessageSquare } from 'lucide-react';

interface GlobalSearchModalProps {
  onSelectContact: (id: string) => void;
  onSelectDeal: (id: string) => void;
  onNavigateTab: (tab: any) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  onSelectContact,
  onSelectDeal,
  onNavigateTab,
}) => {
  const {
    currentTenant,
    isSearchModalOpen,
    setIsSearchModalOpen,
    globalSearchQuery,
    setGlobalSearchQuery,
    contacts,
    accounts,
    deals,
    tasks,
    threads,
  } = useCRM();

  if (!isSearchModalOpen) return null;

  const query = globalSearchQuery.trim().toLowerCase();

  const filteredContacts = query
    ? (contacts || []).filter(
        (c) =>
          !c.isSoftDeleted &&
          (`${c.firstName || ''} ${c.lastName || ''}`.toLowerCase().includes(query) ||
            (c.email || '').toLowerCase().includes(query) ||
            (c.phone || '').includes(query) ||
            (c.accountName && c.accountName.toLowerCase().includes(query)))
      )
    : [];

  const filteredAccounts = query
    ? (accounts || []).filter(
        (a) => (a.name || '').toLowerCase().includes(query) || (a.domain || '').toLowerCase().includes(query) || (a.industry || '').toLowerCase().includes(query)
      )
    : [];

  const filteredDeals = query
    ? (deals || []).filter((d) => (d.title || '').toLowerCase().includes(query))
    : [];

  const filteredTasks = query
    ? (tasks || []).filter((t) => (t.title || '').toLowerCase().includes(query) || (t.description && t.description.toLowerCase().includes(query)))
    : [];

  const filteredThreads = query
    ? (threads || []).filter((th) => (th.contactName || '').toLowerCase().includes(query) || (th.lastMessageSnippet || '').toLowerCase().includes(query))
    : [];

  const hasResults =
    filteredContacts.length > 0 ||
    filteredAccounts.length > 0 ||
    filteredDeals.length > 0 ||
    filteredTasks.length > 0 ||
    filteredThreads.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/60 p-4 pt-16 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3.5 dark:border-slate-800">
          <Search className="h-5 w-5 text-slate-400" />
          <input
            type="text"
            value={globalSearchQuery}
            onChange={(e) => setGlobalSearchQuery(e.target.value)}
            placeholder="Search contacts, accounts, deals, tasks, messages..."
            autoFocus
            className="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 outline-none dark:text-slate-100"
          />
          <button
            onClick={() => setIsSearchModalOpen(false)}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search Results */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-4">
          {!query && (
            <div className="py-8 text-center text-xs text-slate-400">
              Type a name, email, company, or deal title to quickly jump anywhere.
            </div>
          )}

          {query && !hasResults && (
            <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400">
              No matching records found for "{query}".
            </div>
          )}

          {/* Contacts Section */}
          {filteredContacts.length > 0 && (
            <div>
              <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <Users className="h-3.5 w-3.5" /> Contacts ({filteredContacts.length})
              </div>
              <div className="space-y-1">
                {filteredContacts.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      onSelectContact(c.id);
                      setIsSearchModalOpen(false);
                    }}
                    className="flex w-full items-center justify-between rounded-xl p-2.5 text-left text-xs transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  >
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-slate-100">
                        {c.firstName} {c.lastName}
                      </div>
                      <div className="text-slate-500">
                        {c.jobTitle} {c.accountName ? `• ${c.accountName}` : ''} ({c.email})
                      </div>
                    </div>
                    <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                      View
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Accounts Section */}
          {filteredAccounts.length > 0 && (
            <div>
              <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <Building2 className="h-3.5 w-3.5" /> Accounts ({filteredAccounts.length})
              </div>
              <div className="space-y-1">
                {filteredAccounts.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => {
                      onNavigateTab('accounts');
                      setIsSearchModalOpen(false);
                    }}
                    className="flex w-full items-center justify-between rounded-xl p-2.5 text-left text-xs transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  >
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-slate-100">{a.name}</div>
                      <div className="text-slate-500">{a.industry} • {a.domain}</div>
                    </div>
                    <span className="text-[10px] text-slate-400">${a.annualRevenue.toLocaleString()} Revenue</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Deals Section */}
          {filteredDeals.length > 0 && (
            <div>
              <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <Kanban className="h-3.5 w-3.5" /> Deals ({filteredDeals.length})
              </div>
              <div className="space-y-1">
                {filteredDeals.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => {
                      onSelectDeal(d.id);
                      setIsSearchModalOpen(false);
                    }}
                    className="flex w-full items-center justify-between rounded-xl p-2.5 text-left text-xs transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  >
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-slate-100">{d.title}</div>
                      <div className="text-slate-500">Amount: ${d.amount.toLocaleString()} {d.currency}</div>
                    </div>
                    <span className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                      {d.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tasks Section */}
          {filteredTasks.length > 0 && (
            <div>
              <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <CheckSquare className="h-3.5 w-3.5" /> Tasks ({filteredTasks.length})
              </div>
              <div className="space-y-1">
                {filteredTasks.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      onNavigateTab('tasks');
                      setIsSearchModalOpen(false);
                    }}
                    className="flex w-full items-center justify-between rounded-xl p-2.5 text-left text-xs transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  >
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-slate-100">{t.title}</div>
                      <div className="text-slate-500">Due: {t.dueDate}</div>
                    </div>
                    <span className="text-[10px] text-slate-400">{t.status}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages Section */}
          {filteredThreads.length > 0 && (
            <div>
              <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <MessageSquare className="h-3.5 w-3.5" /> Inbox Threads ({filteredThreads.length})
              </div>
              <div className="space-y-1">
                {filteredThreads.map((th) => (
                  <button
                    key={th.id}
                    onClick={() => {
                      onNavigateTab('inbox');
                      setIsSearchModalOpen(false);
                    }}
                    className="flex w-full items-center justify-between rounded-xl p-2.5 text-left text-xs transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  >
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-slate-100">{th.contactName}</div>
                      <div className="text-slate-500 truncate max-w-sm">{th.lastMessageSnippet}</div>
                    </div>
                    <span className="text-[10px] text-slate-400">{th.lastChannel}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-200 bg-slate-50 px-4 py-2.5 text-[11px] text-slate-400 flex justify-between dark:border-slate-800 dark:bg-slate-900/80">
          <span>Esc to close</span>
          <span>Search scope: Current Tenant ({currentTenant.name})</span>
        </div>
      </div>
    </div>
  );
};
