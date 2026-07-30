import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { Account } from '../../types';
import {
  Plus, Search, Building2, Globe, Phone, DollarSign, Users, X, Edit2, Trash2, Eye,
  Download, Upload, FileSpreadsheet, Check, ArrowUpDown, ArrowUp, ArrowDown
} from 'lucide-react';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';

type AccountSortField = 'name' | 'industry' | 'employeeCount' | 'annualRevenue' | 'createdAt';

export const AccountsList: React.FC = () => {
  const {
    accounts,
    contacts,
    deals,
    addAccount,
    updateAccount,
    deleteAccount,
    importAccountsCsv,
    canUserExport,
    canUserImport,
    t,
  } = useCRM();

  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [selectedDetailAccount, setSelectedDetailAccount] = useState<Account | null>(null);
  const [pendingDeleteAccount, setPendingDeleteAccount] = useState<Account | null>(null);

  // View Mode: Cards vs Table
  const [viewStyle, setViewStyle] = useState<'cards' | 'table'>('table');

  // Table Sorting
  const [sortField, setSortField] = useState<AccountSortField>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // CSV Import Modal
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [importReport, setImportReport] = useState<{ imported: number; updated?: number; errors: string[] } | null>(null);
  const [permissionNotice, setPermissionNotice] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [industry, setIndustry] = useState('');
  const [employeeCount, setEmployeeCount] = useState(50);
  const [annualRevenue, setAnnualRevenue] = useState(1000000);
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const handleSort = (field: AccountSortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAccounts = accounts
    .filter(
      (a) =>
        a.name.toLowerCase().includes(search.toLowerCase()) ||
        a.industry.toLowerCase().includes(search.toLowerCase()) ||
        (a.domain || '').toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      let valA: any = '';
      let valB: any = '';

      if (sortField === 'name') {
        valA = a.name.toLowerCase();
        valB = b.name.toLowerCase();
      } else if (sortField === 'industry') {
        valA = (a.industry || '').toLowerCase();
        valB = (b.industry || '').toLowerCase();
      } else if (sortField === 'employeeCount') {
        valA = a.employeeCount || 0;
        valB = b.employeeCount || 0;
      } else if (sortField === 'annualRevenue') {
        valA = a.annualRevenue || 0;
        valB = b.annualRevenue || 0;
      } else if (sortField === 'createdAt') {
        valA = a.createdAt || '';
        valB = b.createdAt || '';
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  const handleOpenAdd = () => {
    setEditingAccount(null);
    setName('');
    setDomain('');
    setIndustry('');
    setEmployeeCount(50);
    setAnnualRevenue(1000000);
    setPhone('');
    setAddress('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (acc: Account) => {
    setEditingAccount(acc);
    setName(acc.name);
    setDomain(acc.domain || '');
    setIndustry(acc.industry || '');
    setEmployeeCount(acc.employeeCount || 0);
    setAnnualRevenue(acc.annualRevenue || 0);
    setPhone(acc.phone || '');
    setAddress(acc.address || '');
    setIsAddModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingAccount) {
      updateAccount(editingAccount.id, {
        name,
        domain,
        industry,
        employeeCount: Number(employeeCount),
        annualRevenue: Number(annualRevenue),
        phone,
        address,
      });
    } else {
      addAccount({
        name,
        domain,
        industry,
        employeeCount: Number(employeeCount),
        annualRevenue: Number(annualRevenue),
        phone,
        address,
        tags: ['Company'],
        ownerId: 'usr-1',
      });
    }

    setIsAddModalOpen(false);
    setEditingAccount(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (text) setCsvText(text);
    };
    reader.readAsText(file);
  };

  const handleCsvImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvText.trim()) return;

    const lines = csvText.trim().split('\n');
    if (lines.length < 2) {
      setImportReport({ imported: 0, errors: ['CSV file must have header and at least 1 data row.'] });
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

    const report = importAccountsCsv(rows);
    setImportReport(report);
  };

  const handleExportClick = () => {
    if (!canUserExport('accounts')) {
      setPermissionNotice('Şirket verilerini dışa aktarma yetkiniz bulunmamaktadır.');
      setTimeout(() => setPermissionNotice(null), 4000);
      return;
    }

    const headers = ['ID', 'Company Name', 'Industry', 'Domain', 'Employees', 'Annual Revenue', 'Phone'];
    const rows = filteredAccounts.map((a) => [
      a.id,
      `"${a.name}"`,
      `"${a.industry}"`,
      `"${a.domain || ''}"`,
      a.employeeCount,
      a.annualRevenue,
      `"${a.phone || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `accounts_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportClick = () => {
    if (!canUserImport('accounts')) {
      setPermissionNotice('Şirket verilerini içe aktarma yetkiniz bulunmamaktadır.');
      setTimeout(() => setPermissionNotice(null), 4000);
      return;
    }
    setIsImportModalOpen(true);
  };

  const renderSortHeader = (label: string, field: AccountSortField) => {
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
      {permissionNotice && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-semibold text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
          {permissionNotice}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {t('accounts')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Şirket profilleri, sektör detayları ve finansal büyüklük takibi.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportClick}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" /> Dışa Aktar (CSV)
          </button>
          <button
            onClick={handleImportClick}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            <Upload className="h-3.5 w-3.5 text-slate-500" /> İçe Aktar (CSV)
          </button>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" /> {t('addAccount')}
          </button>
        </div>
      </div>

      {/* Search & Layout Toggle Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Şirket adı, sektör veya web alan adı ara..."
            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
          />
        </div>

        <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1 text-xs dark:bg-slate-800">
          <button
            onClick={() => setViewStyle('table')}
            className={`rounded-lg px-3 py-1 font-semibold transition-colors ${
              viewStyle === 'table'
                ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-900 dark:text-slate-100'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Tablo Görünümü
          </button>
          <button
            onClick={() => setViewStyle('cards')}
            className={`rounded-lg px-3 py-1 font-semibold transition-colors ${
              viewStyle === 'cards'
                ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-900 dark:text-slate-100'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Kart Görünümü
          </button>
        </div>
      </div>

      {/* View 1: Table View with Column Sorting */}
      {viewStyle === 'table' ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
              <tr>
                {renderSortHeader('Şirket Adı & Domain', 'name')}
                {renderSortHeader('Sektör', 'industry')}
                {renderSortHeader('Çalışan', 'employeeCount')}
                {renderSortHeader('Yıllık Ciro', 'annualRevenue')}
                <th className="px-4 py-3 font-semibold">Bağlı Kontak / Fırsat</th>
                <th className="px-4 py-3 font-semibold text-right">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredAccounts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Kayıtlı şirket bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredAccounts.map((acc) => {
                  const accContacts = contacts.filter((c) => c.accountId === acc.id && !c.isSoftDeleted);
                  const accDeals = deals.filter((d) => d.accountId === acc.id);
                  const accPipelineValue = accDeals.reduce((sum, d) => sum + d.amount, 0);

                  return (
                    <tr key={acc.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                        <button
                          onClick={() => setSelectedDetailAccount(acc)}
                          className="font-bold text-slate-900 hover:text-indigo-600 dark:text-slate-100 dark:hover:text-indigo-400"
                        >
                          {acc.name}
                        </button>
                        <div className="text-[11px] text-slate-400">{acc.domain || '—'}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                        <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {acc.industry}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                        {acc.employeeCount} kişi
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-slate-100">
                        ${acc.annualRevenue?.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        <div className="flex items-center gap-3 text-[11px]">
                          <span>{accContacts.length} Kontak</span>
                          <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                            ${accPipelineValue.toLocaleString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedDetailAccount(acc)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
                            title="Detay"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(acc)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/50"
                            title="Düzenle"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setPendingDeleteAccount(acc)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50"
                            title="Sil"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* View 2: Cards Grid View */
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAccounts.map((acc) => {
            const accContacts = contacts.filter((c) => c.accountId === acc.id && !c.isSoftDeleted);
            const accDeals = deals.filter((d) => d.accountId === acc.id);
            const accPipelineValue = accDeals.reduce((sum, d) => sum + d.amount, 0);

            return (
              <div
                key={acc.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div>
                        <h2
                          onClick={() => setSelectedDetailAccount(acc)}
                          className="font-bold text-sm text-slate-900 dark:text-slate-100 hover:text-indigo-600 cursor-pointer"
                        >
                          {acc.name}
                        </h2>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400">
                          <Globe className="h-3 w-3" /> {acc.domain || 'Yok'}
                        </div>
                      </div>
                    </div>

                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      {acc.industry}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3 text-xs dark:bg-slate-800/50">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Çalışan</span>
                      <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                        <Users className="h-3 w-3 text-slate-400" /> {acc.employeeCount}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Yıllık Ciro</span>
                      <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                        <DollarSign className="h-3 w-3 text-slate-400" /> ${acc.annualRevenue?.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 border-t border-slate-100 pt-3 flex items-center justify-between dark:border-slate-800">
                  <div className="text-[11px] text-slate-500">
                    <span>{accContacts.length} Kontak</span> •{' '}
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      ${accPipelineValue.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setSelectedDetailAccount(acc)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                      title="Detay"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(acc)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/50"
                      title="Düzenle"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setPendingDeleteAccount(acc)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50"
                      title="Sil"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirm Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(pendingDeleteAccount)}
        title="Şirket Silme Onayı"
        recordType="Şirket"
        recordTitle={pendingDeleteAccount ? pendingDeleteAccount.name : ''}
        summaryItems={
          pendingDeleteAccount
            ? [
                { label: 'Sektör', value: pendingDeleteAccount.industry },
                { label: 'Domain', value: pendingDeleteAccount.domain || 'Yok' },
                { label: 'Çalışan', value: `${pendingDeleteAccount.employeeCount} kişi` },
                { label: 'Ciro', value: `$${pendingDeleteAccount.annualRevenue?.toLocaleString()}` },
              ]
            : []
        }
        onConfirm={() => {
          if (pendingDeleteAccount) {
            deleteAccount(pendingDeleteAccount.id);
            setPendingDeleteAccount(null);
          }
        }}
        onCancel={() => setPendingDeleteAccount(null)}
      />

      {/* Add / Edit Account Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {editingAccount ? 'Şirketi Güncelle' : t('addAccount')}
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Şirket Adı *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Sektör</label>
                  <input
                    type="text"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="Teknoloji, Finans, Lojistik"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Web Alan Adı (Domain)</label>
                  <input
                    type="text"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder="company.com"
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Çalışan Sayısı</label>
                  <input
                    type="number"
                    value={employeeCount}
                    onChange={(e) => setEmployeeCount(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Tahmini Yıllık Ciro ($)</label>
                  <input
                    type="number"
                    value={annualRevenue}
                    onChange={(e) => setAnnualRevenue(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Telefon</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Adres</label>
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                />
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
                  {t('save')}
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
                  CSV ile Şirket Verisi Yükle
                </h2>
              </div>
              <button
                onClick={() => {
                  setIsImportModalOpen(false);
                  setImportReport(null);
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
                    <span>Şirket Yükleme Özeti</span>
                  </div>
                  <p className="mt-1">
                    {importReport.imported} yeni şirket eklendi.
                    {importReport.updated !== undefined && ` ${importReport.updated} var olan şirket güncellendi.`}
                  </p>
                </div>

                <div className="pt-3 flex justify-end">
                  <button
                    onClick={() => {
                      setIsImportModalOpen(false);
                      setImportReport(null);
                    }}
                    className="rounded-xl bg-indigo-600 px-4 py-2 font-semibold text-white shadow-md hover:bg-indigo-700"
                  >
                    Tamamlandı
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCsvImportSubmit} className="mt-4 space-y-3 text-xs">
                <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-4 text-center dark:border-slate-700 dark:bg-slate-800/50">
                  <Upload className="mx-auto h-6 w-6 text-indigo-500" />
                  <span className="mt-1 block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    CSV Dosyası Yükleyin
                  </span>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="mt-2 block w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Raw CSV Metni</label>
                  <textarea
                    rows={4}
                    value={csvText}
                    onChange={(e) => setCsvText(e.target.value)}
                    placeholder={`ID,Company Name,Industry,Domain,Employees,Annual Revenue\n"acc-1","Acme Corp","Technology","acme.com",120,5000000`}
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
                    Şimdi Yükle
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Account Detail Modal */}
      {selectedDetailAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {selectedDetailAccount.name}
                  </h2>
                  <p className="text-xs text-slate-400">{selectedDetailAccount.domain || 'Domain yok'}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDetailAccount(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3 text-xs dark:bg-slate-800/50">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Sektör</span>
                <div className="font-semibold text-slate-800 dark:text-slate-200">{selectedDetailAccount.industry}</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Çalışan</span>
                <div className="font-semibold text-slate-800 dark:text-slate-200">{selectedDetailAccount.employeeCount}</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Yıllık Ciro</span>
                <div className="font-semibold text-slate-800 dark:text-slate-200">${selectedDetailAccount.annualRevenue?.toLocaleString()}</div>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Telefon</span>
                <div className="font-semibold text-slate-800 dark:text-slate-200">{selectedDetailAccount.phone || '—'}</div>
              </div>
            </div>

            {/* Audit info in Account detail */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1 text-[10px] text-slate-400">
              <div className="font-bold uppercase tracking-wider text-slate-500">Sistem Denetim (DB Audit)</div>
              <div><span className="font-semibold text-slate-600 dark:text-slate-300">Oluşturan:</span> {(selectedDetailAccount as any).createdUser || 'Sistem / Admin'}</div>
              <div><span className="font-semibold text-slate-600 dark:text-slate-300">Oluşturulma:</span> {(selectedDetailAccount as any).createdDateTime || selectedDetailAccount.createdAt || '—'}</div>
              <div><span className="font-semibold text-slate-600 dark:text-slate-300">Son Güncelleyen:</span> {(selectedDetailAccount as any).lastModifiedUser || '—'}</div>
              <div><span className="font-semibold text-slate-600 dark:text-slate-300">Son Güncelleme:</span> {(selectedDetailAccount as any).lastModifiedDateTime || selectedDetailAccount.updatedAt || '—'}</div>
            </div>

            <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  handleOpenEdit(selectedDetailAccount);
                  setSelectedDetailAccount(null);
                }}
                className="rounded-xl bg-amber-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-amber-700"
              >
                Şirketi Düzenle
              </button>
              <button
                onClick={() => setSelectedDetailAccount(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
