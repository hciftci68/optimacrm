import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { Contact } from '../../types';
import {
  Plus, Search, Download, Upload, Trash2, RotateCcw, AlertTriangle, Phone, Mail,
  Tag, Building, FileSpreadsheet, X, Check, Edit2, Lock, ArrowUpDown, ArrowUp, ArrowDown
} from 'lucide-react';
import { DeleteConfirmModal, DeleteSummaryItem } from '../common/DeleteConfirmModal';

interface ContactsListProps {
  onSelectContact: (id: string) => void;
}

type SortField = 'name' | 'account' | 'email' | 'status' | 'score' | 'createdAt';

export const ContactsList: React.FC<ContactsListProps> = ({ onSelectContact }) => {
  const {
    contacts,
    accounts,
    addContact,
    updateContact,
    softDeleteContact,
    restoreContact,
    checkDuplicateContact,
    exportContactsCsv,
    importContactsCsv,
    canUserExport,
    canUserImport,
    t,
  } = useCRM();

  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('ALL');
  const [leadStatusFilter, setLeadStatusFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'ACTIVE' | 'TRASH'>('ACTIVE');

  // Sorting state
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [pendingDeleteContact, setPendingDeleteContact] = useState<Contact | null>(null);

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<Contact | null>(null);
  const [permissionNotice, setPermissionNotice] = useState<string | null>(null);

  // Form State
  const [formFirstName, setFormFirstName] = useState('');
  const [formLastName, setFormLastName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formJobTitle, setFormJobTitle] = useState('');
  const [formAccountId, setFormAccountId] = useState('');
  const [formLeadStatus, setFormLeadStatus] = useState<'NEW' | 'CONTACTED' | 'QUALIFIED' | 'UNQUALIFIED'>('NEW');
  const [formTags, setFormTags] = useState('');

  // CSV Import State
  const [csvText, setCsvText] = useState('');
  const [importReport, setImportReport] = useState<{ imported: number; updated?: number; errors: string[] } | null>(null);

  // Tags list
  const allTags = Array.from(new Set(contacts.flatMap((c) => c.tags || [])));

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter & Sort Contacts
  const filteredContacts = contacts
    .filter((c) => {
      const isDeleted = Boolean(c.isSoftDeleted);
      if (viewMode === 'ACTIVE' && isDeleted) return false;
      if (viewMode === 'TRASH' && !isDeleted) return false;

      const matchesSearch =
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        c.phone.includes(search) ||
        (c.accountName && c.accountName.toLowerCase().includes(search.toLowerCase()));

      const matchesTag = selectedTag === 'ALL' || (c.tags && c.tags.includes(selectedTag));
      const matchesStatus = leadStatusFilter === 'ALL' || c.leadStatus === leadStatusFilter;

      return matchesSearch && matchesTag && matchesStatus;
    })
    .sort((a, b) => {
      let valA: any = '';
      let valB: any = '';

      if (sortField === 'name') {
        valA = `${a.firstName} ${a.lastName}`.toLowerCase();
        valB = `${b.firstName} ${b.lastName}`.toLowerCase();
      } else if (sortField === 'account') {
        valA = (a.accountName || '').toLowerCase();
        valB = (b.accountName || '').toLowerCase();
      } else if (sortField === 'email') {
        valA = a.email.toLowerCase();
        valB = b.email.toLowerCase();
      } else if (sortField === 'status') {
        valA = a.leadStatus;
        valB = b.leadStatus;
      } else if (sortField === 'score') {
        valA = a.leadScore || 0;
        valB = b.leadScore || 0;
      } else if (sortField === 'createdAt') {
        valA = a.createdAt || '';
        valB = b.createdAt || '';
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  const handleOpenAdd = () => {
    setEditingContact(null);
    setFormFirstName('');
    setFormLastName('');
    setFormEmail('');
    setFormPhone('');
    setFormJobTitle('');
    setFormAccountId('');
    setFormLeadStatus('NEW');
    setFormTags('');
    setDuplicateWarning(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (contact: Contact) => {
    setEditingContact(contact);
    setFormFirstName(contact.firstName);
    setFormLastName(contact.lastName);
    setFormEmail(contact.email);
    setFormPhone(contact.phone);
    setFormJobTitle(contact.jobTitle || '');
    setFormAccountId(contact.accountId || '');
    setFormLeadStatus(contact.leadStatus);
    setFormTags((contact.tags || []).join(', '));
    setDuplicateWarning(null);
    setIsAddModalOpen(true);
  };

  const handleContactFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const linkedAccount = accounts.find((a) => a.id === formAccountId);

    if (editingContact) {
      // Requirement 2: Name fields (firstName, lastName) remain unchanged during updates
      updateContact(editingContact.id, {
        email: formEmail,
        phone: formPhone,
        jobTitle: formJobTitle || 'Contact',
        accountId: formAccountId || undefined,
        accountName: linkedAccount?.name,
        leadStatus: formLeadStatus,
        tags: formTags ? formTags.split(',').map((t) => t.trim()) : ['General'],
      });
    } else {
      // Check duplicate for new contact
      const dup = checkDuplicateContact(formEmail, formPhone);
      if (dup && !duplicateWarning) {
        setDuplicateWarning(dup);
        return;
      }

      addContact({
        firstName: formFirstName,
        lastName: formLastName,
        email: formEmail,
        phone: formPhone,
        jobTitle: formJobTitle || 'Contact',
        accountId: formAccountId || undefined,
        accountName: linkedAccount?.name,
        leadStatus: formLeadStatus,
        tags: formTags ? formTags.split(',').map((t) => t.trim()) : ['General'],
        ownerId: 'usr-1',
      });
    }

    setEditingContact(null);
    setIsAddModalOpen(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (text) {
        setCsvText(text);
      }
    };
    reader.readAsText(file);
  };

  const handleCsvImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvText.trim()) return;

    const lines = csvText.trim().split('\n');
    if (lines.length < 2) {
      setImportReport({ imported: 0, errors: ['CSV dosyasında başlık satırı ve en az 1 veri satırı olmalıdır.'] });
      return;
    }

    const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
    const rows = lines.slice(1).map((line) => {
      const values = line.split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
      const obj: any = {};
      headers.forEach((h, i) => {
        obj[h] = values[i] || '';
      });
      return obj;
    });

    const report = importContactsCsv(rows);
    setImportReport(report);
  };

  const handleExportClick = () => {
    if (!canUserExport('contacts')) {
      setPermissionNotice('Veri dışa aktarma (Export) yetkiniz bulunmamaktadır.');
      setTimeout(() => setPermissionNotice(null), 4000);
      return;
    }
    exportContactsCsv();
  };

  const handleImportClick = () => {
    if (!canUserImport('contacts')) {
      setPermissionNotice('Veri içe aktarma (Import) yetkiniz bulunmamaktadır.');
      setTimeout(() => setPermissionNotice(null), 4000);
      return;
    }
    setIsImportModalOpen(true);
  };

  const renderSortHeader = (label: string, field: SortField) => {
    const isCurrent = sortField === field;
    return (
      <th
        onClick={() => handleSort(field)}
        className="px-4 py-3 font-semibold cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors select-none"
      >
        <div className="flex items-center gap-1">
          <span>{label}</span>
          {isCurrent ? (
            sortDirection === 'asc' ? (
              <ArrowUp className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            ) : (
              <ArrowDown className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            )
          ) : (
            <ArrowUpDown className="h-3 w-3 text-slate-400 opacity-60" />
          )}
        </div>
      </th>
    );
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Permission warning banner if triggered */}
      {permissionNotice && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-semibold text-amber-900 dark:border-amber-900/80 dark:bg-amber-950/80 dark:text-amber-200 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <span>{permissionNotice}</span>
          </div>
          <button onClick={() => setPermissionNotice(null)} className="p-1 hover:opacity-80">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header & Primary Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {t('contacts')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Kişi listesini yönetin, güncelleyin ve CSV üzerinden içeri/dışarı aktarın.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportClick}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" /> {t('exportCsv')}
          </button>

          <button
            onClick={handleImportClick}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <Upload className="h-3.5 w-3.5 text-slate-500" /> {t('importCsv')}
          </button>

          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" /> {t('addContact')}
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs md:flex-row md:items-center md:justify-between dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="İsim, e-posta, telefon, şirket ara..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          {/* Tag Filter */}
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-700 outline-none cursor-pointer dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
          >
            <option value="ALL">Tüm Etiketler</option>
            {allTags.map((tag) => (
              <option key={tag} value={tag}>
                Etiket: {tag}
              </option>
            ))}
          </select>

          {/* Lead Status Filter */}
          <select
            value={leadStatusFilter}
            onChange={(e) => setLeadStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-700 outline-none cursor-pointer dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300"
          >
            <option value="ALL">Tüm Durumlar</option>
            <option value="NEW">Yeni (New)</option>
            <option value="CONTACTED">İletişime Geçildi</option>
            <option value="QUALIFIED">Nitelikli (Qualified)</option>
            <option value="UNQUALIFIED">Niteliksiz</option>
          </select>
        </div>

        {/* View Toggle (Active vs Trash) */}
        <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 text-xs dark:bg-slate-800">
          <button
            onClick={() => setViewMode('ACTIVE')}
            className={`rounded-lg px-2.5 py-1 font-semibold transition-colors ${
              viewMode === 'ACTIVE'
                ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-900 dark:text-slate-100'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            Aktif ({contacts.filter((c) => !c.isSoftDeleted).length})
          </button>
          <button
            onClick={() => setViewMode('TRASH')}
            className={`rounded-lg px-2.5 py-1 font-semibold transition-colors ${
              viewMode === 'TRASH'
                ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-900 dark:text-slate-100'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            Çöp Kutusu ({contacts.filter((c) => c.isSoftDeleted).length})
          </button>
        </div>
      </div>

      {/* Contacts Desktop Table View */}
      <div className="hidden md:block overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200 bg-slate-50/80 text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
            <tr>
              {renderSortHeader('Ad Soyad & Unvan', 'name')}
              {renderSortHeader('Şirket', 'account')}
              {renderSortHeader('İletişim Bilgileri', 'email')}
              {renderSortHeader('Durum', 'status')}
              {renderSortHeader('Skor', 'score')}
              <th className="px-4 py-3 font-semibold text-right">{t('actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {filteredContacts.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  Aranan kriterlere uygun kontak bulunamadı.
                </td>
              </tr>
            ) : (
              filteredContacts.map((contact) => (
                <tr
                  key={contact.id}
                  className="group transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                >
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                    <button
                      onClick={() => onSelectContact(contact.id)}
                      className="font-bold text-slate-900 hover:text-indigo-600 dark:text-slate-100 dark:hover:text-indigo-400"
                    >
                      {contact.firstName} {contact.lastName}
                    </button>
                    <div className="text-[11px] text-slate-400">{contact.jobTitle}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <Building className="h-3.5 w-3.5 text-slate-400" />
                      <span>{contact.accountName || '— Bağımsız —'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                    <div className="flex flex-col gap-0.5">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3 text-slate-400" /> {contact.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3 text-slate-400" /> {contact.phone}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        contact.leadStatus === 'QUALIFIED'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                          : contact.leadStatus === 'CONTACTED'
                          ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {contact.leadStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-bold text-slate-700 dark:text-slate-300">
                    {contact.leadScore || 30}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {viewMode === 'ACTIVE' ? (
                        <>
                          <button
                            onClick={() => handleOpenEdit(contact)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/50"
                            title="Kontağı Düzenle"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setPendingDeleteContact(contact)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50"
                            title="Kontağı Sil"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => restoreContact(contact.id)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/50"
                          title="Geri Yükle"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(pendingDeleteContact)}
        title="Kontak Silme Onayı"
        recordType="Kontak"
        recordTitle={pendingDeleteContact ? `${pendingDeleteContact.firstName} ${pendingDeleteContact.lastName}` : ''}
        summaryItems={
          pendingDeleteContact
            ? [
                { label: 'E-posta', value: pendingDeleteContact.email },
                { label: 'Telefon', value: pendingDeleteContact.phone },
                { label: 'Şirket', value: pendingDeleteContact.accountName || 'Bağımsız' },
                { label: 'Unvan', value: pendingDeleteContact.jobTitle },
              ]
            : []
        }
        onConfirm={() => {
          if (pendingDeleteContact) {
            softDeleteContact(pendingDeleteContact.id);
            setPendingDeleteContact(null);
          }
        }}
        onCancel={() => setPendingDeleteContact(null)}
      />

      {/* Add / Edit Contact Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {editingContact ? 'Kontağı Güncelle' : t('addContact')}
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleContactFormSubmit} className="mt-4 space-y-3 text-xs">
              {duplicateWarning && !editingContact && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/60 dark:text-amber-200 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <span>Mevcut Kontak Uyarısı</span>
                  </div>
                  <p className="text-[11px]">
                    Bu e-posta veya telefon numarası zaten sistemde kayıtlı ({duplicateWarning.firstName} {duplicateWarning.lastName}). Devam etmek istediğinizden emin misiniz?
                  </p>
                </div>
              )}

              {/* Requirement 2: Names disabled during editing */}
              {editingContact && (
                <div className="flex items-center gap-1.5 rounded-xl border border-indigo-100 bg-indigo-50/70 p-2 text-[11px] font-semibold text-indigo-800 dark:border-indigo-900/50 dark:bg-indigo-950/50 dark:text-indigo-300">
                  <Lock className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Kişinin Ad ve Soyad bilgisi yetkilendirme kuralı gereği sabittir, diğer tüm alanlar güncellenebilir.</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    Ad * {editingContact && <Lock className="h-3 w-3 text-slate-400" />}
                  </label>
                  <input
                    type="text"
                    required
                    disabled={Boolean(editingContact)}
                    value={formFirstName}
                    onChange={(e) => setFormFirstName(e.target.value)}
                    className={`mt-1 w-full rounded-xl border p-2 text-xs outline-none ${
                      editingContact
                        ? 'border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-400'
                        : 'border-slate-200 bg-slate-50 text-slate-900 focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100'
                    }`}
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    Soyad * {editingContact && <Lock className="h-3 w-3 text-slate-400" />}
                  </label>
                  <input
                    type="text"
                    required
                    disabled={Boolean(editingContact)}
                    value={formLastName}
                    onChange={(e) => setFormLastName(e.target.value)}
                    className={`mt-1 w-full rounded-xl border p-2 text-xs outline-none ${
                      editingContact
                        ? 'border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-400'
                        : 'border-slate-200 bg-slate-50 text-slate-900 focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">E-posta Adresi *</label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Telefon Numarası *</label>
                <input
                  type="text"
                  required
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Görevi / Unvanı</label>
                  <input
                    type="text"
                    value={formJobTitle}
                    onChange={(e) => setFormJobTitle(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Bağlı Şirket</label>
                  <select
                    value={formAccountId}
                    onChange={(e) => setFormAccountId(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                  >
                    <option value="">— Bağımsız —</option>
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Lead Durumu</label>
                  <select
                    value={formLeadStatus}
                    onChange={(e) => setFormLeadStatus(e.target.value as any)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                  >
                    <option value="NEW">NEW (Yeni)</option>
                    <option value="CONTACTED">CONTACTED (İletişim Kuruldu)</option>
                    <option value="QUALIFIED">QUALIFIED (Nitelikli)</option>
                    <option value="UNQUALIFIED">UNQUALIFIED (Niteliksiz)</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Etiketler (Virgülle ayırın)</label>
                  <input
                    type="text"
                    value={formTags}
                    onChange={(e) => setFormTags(e.target.value)}
                    placeholder="VIP, Karar Verici, Inbound"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-4 py-2 font-semibold text-white shadow-md hover:bg-indigo-700"
                >
                  {editingContact ? 'Kaydet' : t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-indigo-500" />
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  CSV Dosyasından Kontak İçeri Al
                </h2>
              </div>
              <button
                onClick={() => {
                  setIsImportModalOpen(false);
                  setImportReport(null);
                  setCsvText('');
                }}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {importReport ? (
              <div className="mt-4 space-y-3 text-xs">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/60 dark:text-emerald-200">
                  <div className="font-bold flex items-center gap-1.5">
                    <Check className="h-4 w-4 text-emerald-600" />
                    <span>İçe Aktarma Özet Raporu</span>
                  </div>
                  <p className="mt-1">
                    {importReport.imported} yeni kayıt eklendi.
                    {importReport.updated !== undefined && ` ${importReport.updated} var olan kayıt güncellendi.`}
                  </p>
                </div>

                {importReport.errors.length > 0 && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/60 dark:text-rose-200">
                    <div className="font-bold">Satır Hataları:</div>
                    <ul className="mt-1 list-disc pl-4 space-y-1">
                      {(importReport.errors || []).map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="pt-3 flex justify-end">
                  <button
                    onClick={() => {
                      setIsImportModalOpen(false);
                      setImportReport(null);
                      setCsvText('');
                    }}
                    className="rounded-xl bg-indigo-600 px-4 py-2 font-semibold text-white shadow-md hover:bg-indigo-700"
                  >
                    Tamamlandı
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCsvImportSubmit} className="mt-4 space-y-3 text-xs">
                <p className="text-slate-500 dark:text-slate-400">
                  Export aldığınız CSV dosyasını düzenleyip bilgisayarınızdan seçebilir veya raw CSV metnini aşağıya yapıştırabilirsiniz:
                </p>

                {/* File input requirement 4 */}
                <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-4 text-center dark:border-slate-700 dark:bg-slate-800/50">
                  <Upload className="mx-auto h-6 w-6 text-indigo-500" />
                  <span className="mt-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    CSV Dosyası Yükleyin
                  </span>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="mt-2 block w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    CSV İçeriği Metni
                  </label>
                  <textarea
                    rows={4}
                    value={csvText}
                    onChange={(e) => setCsvText(e.target.value)}
                    placeholder={`ID,First Name,Last Name,Email,Phone,Job Title,Company,Lead Status\n"cont-1","John","Doe","john@acme.com","+15551234567","CTO","Acme Corp","QUALIFIED"`}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 font-mono text-[11px] text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsImportModalOpen(false)}
                    className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-indigo-600 px-4 py-2 font-semibold text-white shadow-md hover:bg-indigo-700"
                  >
                    Şimdi İçeri Aktar
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
