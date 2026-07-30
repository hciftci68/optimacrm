import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { Contact } from '../../types';
import { LocationAddressSelector } from '../common/LocationAddressSelector';
import { X, UserPlus, CheckCircle2, Building, Mail, Phone, Briefcase } from 'lucide-react';

interface QuickAddContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newContact: Contact) => void;
}

export const QuickAddContactModal: React.FC<QuickAddContactModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { addContact, accounts, currentUser } = useCRM();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [accountId, setAccountId] = useState('');
  const [leadStatus, setLeadStatus] = useState<'NEW' | 'CONTACTED' | 'QUALIFIED' | 'UNQUALIFIED'>('QUALIFIED');

  // Structured Address
  const [addressData, setAddressData] = useState({
    country: 'Türkiye',
    city: '',
    district: '',
    addressLine: '',
    fullAddress: '',
  });

  const [showPopup, setShowPopup] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) return;

    const accountObj = accounts.find((a) => a.id === accountId);

    const newContact = addContact({
      firstName,
      lastName,
      email,
      phone,
      jobTitle: jobTitle || 'Müşteri Temsilcisi',
      accountId: accountId || undefined,
      accountName: accountObj ? accountObj.name : undefined,
      leadStatus,
      tags: ['Sipariş Müşterisi'],
      ownerId: currentUser?.id || 'usr-1',
      address: addressData.fullAddress,
      addressLine: addressData.addressLine,
      district: addressData.district,
      city: addressData.city,
      country: addressData.country,
      consent: {
        emailOptIn: true,
        smsOptIn: true,
        whatsAppOptIn: true,
      },
    });

    setShowPopup(true);
    setTimeout(() => {
      setShowPopup(false);
      onSuccess(newContact);
      onClose();
      // Reset
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
      setJobTitle('');
      setAccountId('');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Yeni Müşteri Oluştur
              </h3>
              <p className="text-xs text-slate-400">
                Sipariş oluşturma esnasında hızlıca yeni müşteri kaydı ekleyin.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Success Popup Notice */}
        {showPopup && (
          <div className="my-3 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/60 dark:text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>Yeni müşteri oluşturuldu ve sipariş formuna aktarıldı!</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Ad *
              </label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Örn: Ahmet"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Soyad *
              </label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Örn: Yılmaz"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <Mail className="h-3.5 w-3.5 text-slate-400" /> E-posta Adresi
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ahmet@firma.com"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <Phone className="h-3.5 w-3.5 text-slate-400" /> Telefon Numarası
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+90 (555) 000-0000"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <Building className="h-3.5 w-3.5 text-slate-400" /> Şirket / Hesap
              </label>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="">-- Bireysel Müşteri --</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <Briefcase className="h-3.5 w-3.5 text-slate-400" /> Unvan / Görev
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="Örn: Satın Alma Müdürü"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          {/* Adres Yapılandırma */}
          <LocationAddressSelector
            country={addressData.country}
            city={addressData.city}
            district={addressData.district}
            addressLine={addressData.addressLine}
            onChange={(val) => setAddressData(val)}
            compact
          />

          <div className="flex justify-end gap-2 border-t border-slate-200 pt-4 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-300"
            >
              İptal
            </button>
            <button
              type="submit"
              className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-md hover:bg-indigo-700 transition-all"
            >
              Kaydet ve Siparişe Aktar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
