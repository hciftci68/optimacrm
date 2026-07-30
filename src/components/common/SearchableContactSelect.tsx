import React, { useState, useRef, useEffect } from 'react';
import { useCRM } from '../../context/CRMContext';
import { Search, UserPlus, ChevronDown, Check, User, Building } from 'lucide-react';

interface SearchableContactSelectProps {
  selectedContactId: string;
  onSelectContact: (contactId: string) => void;
  onOpenNewContactModal: () => void;
}

export const SearchableContactSelect: React.FC<SearchableContactSelectProps> = ({
  selectedContactId,
  onSelectContact,
  onOpenNewContactModal,
}) => {
  const { contacts } = useCRM();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedContact = contacts.find((c) => c.id === selectedContactId);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredContacts = contacts.filter((c) => {
    const query = searchQuery.toLowerCase();
    const fullName = `${c.firstName} ${c.lastName}`.toLowerCase();
    const email = (c.email || '').toLowerCase();
    const phone = (c.phone || '').toLowerCase();
    const account = (c.accountName || '').toLowerCase();
    return (
      fullName.includes(query) ||
      email.includes(query) ||
      phone.includes(query) ||
      account.includes(query)
    );
  });

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="flex items-center justify-between mb-1">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          Müşteri Seçin *
        </label>
        <button
          type="button"
          onClick={onOpenNewContactModal}
          className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
        >
          <UserPlus className="h-3.5 w-3.5" />
          <span>+ Yeni Müşteri Oluştur</span>
        </button>
      </div>

      {/* Select Box Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-xs font-medium text-slate-800 shadow-2xs transition-all hover:border-indigo-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
      >
        {selectedContact ? (
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              {selectedContact.firstName[0]}
              {selectedContact.lastName[0]}
            </div>
            <div className="truncate">
              <span className="font-bold text-slate-900 dark:text-white">
                {selectedContact.firstName} {selectedContact.lastName}
              </span>
              <span className="ml-1.5 text-slate-400 text-[11px]">
                ({selectedContact.accountName || 'Bireysel'})
              </span>
            </div>
          </div>
        ) : (
          <span className="text-slate-400">Aramak / Seçmek için tıklayın...</span>
        )}
        <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-2xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-800 dark:bg-slate-900">
          {/* Search Bar */}
          <div className="relative mb-2">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="İsim, e-posta, telefon veya şirket ara..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100 dark:focus:bg-slate-800"
            />
          </div>

          {/* Quick Create Link inside dropdown */}
          <div className="mb-2 border-b border-slate-100 pb-1.5 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onOpenNewContactModal();
              }}
              className="flex w-full items-center gap-2 rounded-xl bg-indigo-50/70 p-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:text-indigo-300 dark:hover:bg-indigo-900/60 transition-colors"
            >
              <UserPlus className="h-4 w-4" />
              <span>Yeni Müşteri Ekle & Bu Siparişe Bağla</span>
            </button>
          </div>

          {/* Contacts List */}
          <div className="max-h-48 overflow-y-auto space-y-1">
            {filteredContacts.length === 0 ? (
              <div className="p-3 text-center text-xs text-slate-400">
                Aradığınız kriterde müşteri bulunamadı.
              </div>
            ) : (
              filteredContacts.map((c) => {
                const isSelected = c.id === selectedContactId;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      onSelectContact(c.id);
                      setIsOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-2.5 py-1.5 text-left text-xs transition-colors ${
                      isSelected
                        ? 'bg-indigo-600 text-white font-semibold'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <User className={`h-3.5 w-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                      <div className="truncate">
                        <div className="font-medium truncate">
                          {c.firstName} {c.lastName}
                        </div>
                        <div className={`text-[10px] truncate ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                          {c.accountName ? `${c.accountName} • ` : ''}{c.email || c.phone}
                        </div>
                      </div>
                    </div>
                    {isSelected && <Check className="h-4 w-4 shrink-0 text-white" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
