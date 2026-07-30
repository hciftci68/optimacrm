import React from 'react';
import { useCRM } from '../../context/CRMContext';
import { usePWA } from '../../hooks/usePWA';
import { Search, Building2, User, Globe, Wifi, WifiOff, Shield, Sparkles, Download, CheckCircle2, LogOut } from 'lucide-react';
import { UserRole, Language } from '../../types';

export const Navbar: React.FC = () => {
  const {
    currentTenant,
    currentUser,
    tenants,
    currentRole,
    switchTenant,
    switchUserRole,
    logout,
    language,
    setLanguage,
    isOffline,
    setIsOffline,
    offlineQueue,
    setIsSearchModalOpen,
    t,
  } = useCRM();

  const { isInstallable, isInstalled, promptInstall } = usePWA();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md md:px-6 dark:border-slate-800 dark:bg-slate-900/95">
      {/* Left: Brand & Tenant Selector */}
      <div className="flex items-center gap-3 md:gap-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 text-white shadow-md shadow-indigo-500/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="hidden font-semibold tracking-tight text-slate-900 md:inline-block dark:text-slate-100">
            {t('appTitle')}
          </span>
        </div>

        <div className="h-5 w-px bg-slate-200 dark:bg-slate-800" />

        {/* Tenant Switcher */}
        <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50/80 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-300">
          <Building2 className="h-3.5 w-3.5 text-indigo-500" />
          <select
            value={currentTenant.id}
            onChange={(e) => switchTenant(e.target.value)}
            className="bg-transparent font-medium text-slate-900 outline-none cursor-pointer dark:text-slate-100"
          >
            {tenants.map((ten) => (
              <option key={ten.id} value={ten.id} className="dark:bg-slate-900">
                {ten.name} ({ten.plan})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Middle: Global Command Search Bar */}
      <div className="hidden flex-1 max-w-md mx-6 md:block">
        <button
          onClick={() => setIsSearchModalOpen(true)}
          className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-2 text-xs text-slate-500 transition-all hover:border-indigo-300 hover:bg-white hover:shadow-sm dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400 dark:hover:bg-slate-800"
        >
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-slate-400" />
            <span>{t('searchPlaceholder')}</span>
          </div>
          <kbd className="inline-flex items-center gap-0.5 rounded border border-slate-200 bg-white px-1.5 font-mono text-[10px] text-slate-400 dark:border-slate-700 dark:bg-slate-800">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* PWA App Install Button / Status */}
        {isInstallable && !isInstalled && (
          <button
            onClick={promptInstall}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-2.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition-all animate-pulse"
            title="Install Compact CRM PWA app on Desktop/Mobile"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Install App</span>
          </button>
        )}

        {isInstalled && (
          <span className="hidden sm:flex items-center gap-1 rounded-lg bg-emerald-100 px-2.5 py-1.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            PWA App
          </span>
        )}

        {/* Offline Simulator Switch */}
        <button
          onClick={() => setIsOffline(!isOffline)}
          title={isOffline ? 'Offline mode active' : 'Online mode active'}
          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
            isOffline
              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
              : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
          }`}
        >
          {isOffline ? <WifiOff className="h-3.5 w-3.5" /> : <Wifi className="h-3.5 w-3.5" />}
          <span className="hidden sm:inline">{isOffline ? 'Offline' : 'Online'}</span>
          {offlineQueue.length > 0 && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
              {offlineQueue.length}
            </span>
          )}
        </button>

        {/* Language Selector */}
        <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs dark:border-slate-800 dark:bg-slate-800">
          <Globe className="h-3.5 w-3.5 text-slate-400" />
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="bg-transparent font-medium text-slate-700 outline-none cursor-pointer dark:text-slate-300"
          >
            <option value="en">EN</option>
            <option value="tr">TR</option>
            <option value="de">DE</option>
          </select>
        </div>

        {/* Role Switcher Pill */}
        <div className="hidden lg:flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium dark:border-slate-800 dark:bg-slate-800">
          <Shield className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
          <select
            value={currentRole}
            onChange={(e) => switchUserRole(e.target.value as UserRole)}
            className="bg-transparent font-semibold text-slate-800 outline-none cursor-pointer dark:text-slate-200"
          >
            <option value="OWNER">Owner</option>
            <option value="ADMIN">Admin</option>
            <option value="SALES_REP">Sales Rep</option>
            <option value="READ_ONLY">Read Only</option>
          </select>
        </div>

        {/* User Profile Avatar & Logout */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="h-8 w-8 rounded-full border border-slate-200 object-cover dark:border-slate-700"
          />
          <div className="hidden text-left xl:block">
            <div className="text-xs font-semibold text-slate-900 leading-tight dark:text-slate-100">
              {currentUser.name}
            </div>
            <div className="text-[10px] text-slate-500 capitalize">{currentRole.replace('_', ' ').toLowerCase()}</div>
          </div>

          {/* Log Out Button */}
          <button
            type="button"
            onClick={logout}
            title={t('logout')}
            className="ml-1 p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors dark:text-slate-400 dark:hover:text-rose-400 dark:hover:bg-rose-950/40 flex items-center gap-1 text-xs font-medium"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden md:inline">{t('logout')}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
