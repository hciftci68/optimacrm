import React, { useState } from 'react';
import { usePWA } from '../../hooks/usePWA';
import { Download, WifiOff, Bell, RefreshCw, X, CheckCircle2, Smartphone, Monitor } from 'lucide-react';

export const PWAInstallBanner: React.FC = () => {
  const {
    isInstallable,
    isInstalled,
    isOffline,
    swUpdateAvailable,
    notificationPermission,
    promptInstall,
    requestNotificationPermission,
    reloadToUpdate,
  } = usePWA();

  const [dismissed, setDismissed] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  const handleInstallClick = async () => {
    setIsInstalling(true);
    await promptInstall();
    setIsInstalling(false);
  };

  return (
    <div className="flex flex-col gap-2 px-4 pt-3 max-w-7xl mx-auto w-full">
      {/* Offline Status Alert */}
      {isOffline && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-amber-300/80 bg-amber-500/10 px-4 py-2.5 text-xs font-semibold text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200 shadow-2xs backdrop-blur-xs">
          <div className="flex items-center gap-2">
            <WifiOff className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 animate-pulse" />
            <span>
              <strong>Offline Mode Active:</strong> You are currently disconnected from the internet. All local CRM edits will sync automatically when connection resumes.
            </span>
          </div>
          <span className="rounded bg-amber-200/60 px-2 py-0.5 text-[10px] font-bold text-amber-900 dark:bg-amber-900/60 dark:text-amber-200">
            Offline Storage
          </span>
        </div>
      )}

      {/* SW Update Ready Alert */}
      {swUpdateAvailable && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-indigo-300/80 bg-indigo-500/10 px-4 py-2.5 text-xs font-semibold text-indigo-900 dark:border-indigo-500/30 dark:bg-indigo-950/60 dark:text-indigo-200 shadow-2xs">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-400 animate-spin" />
            <span>A new updated version of Compact SMB CRM is ready to install!</span>
          </div>
          <button
            onClick={reloadToUpdate}
            className="rounded-lg bg-indigo-600 px-3 py-1 text-xs font-bold text-white hover:bg-indigo-700 shadow-xs transition-all"
          >
            Update Now
          </button>
        </div>
      )}

      {/* In-App PWA Install Banner */}
      {isInstallable && !dismissed && !isInstalled && (
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-900/90 via-slate-900 to-slate-900 p-4 text-white shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
              <Download className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 font-bold text-sm">
                <span>Install Compact CRM App</span>
                <span className="flex items-center gap-1 rounded-full bg-indigo-500/30 border border-indigo-400/40 px-2 py-0.5 text-[10px] font-semibold text-indigo-200">
                  <Smartphone className="h-3 w-3" /> PWA Desktop & Mobile
                </span>
              </div>
              <p className="text-xs text-indigo-200/80 mt-0.5">
                Install as a native application with offline access, quick launcher shortcuts, and push notifications.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            {notificationPermission !== 'granted' && (
              <button
                onClick={requestNotificationPermission}
                className="flex items-center gap-1.5 rounded-xl border border-indigo-400/40 bg-indigo-950/60 px-3 py-1.5 text-xs font-semibold text-indigo-200 hover:bg-indigo-900 transition-all"
                title="Enable Push Notifications"
              >
                <Bell className="h-3.5 w-3.5 text-amber-400" /> Enable Alerts
              </button>
            )}

            <button
              disabled={isInstalling}
              onClick={handleInstallClick}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 shadow-sm transition-all"
            >
              {isInstalling ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
              Install App
            </button>

            <button
              onClick={() => setDismissed(true)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
              title="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
