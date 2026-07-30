import React from 'react';
import { AlertTriangle, X, Trash2 } from 'lucide-react';

export interface DeleteSummaryItem {
  label: string;
  value: string | number | undefined | null;
}

interface DeleteConfirmModalProps {
  isOpen: boolean;
  title?: string;
  recordType?: string;
  recordTitle: string;
  summaryItems?: DeleteSummaryItem[];
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  title = 'Kaydı Silmek İstediğinize Emin Misiniz?',
  recordType = 'Kayıt',
  recordTitle,
  summaryItems = [],
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950/80 dark:text-rose-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                {recordType} Silme İşlemi
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-tight">
                {title}
              </h3>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Warning Text */}
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Bu işlem veritabanından kalıcı olarak silinecek veya çöpe taşınacaktır. Lütfen silmek istediğiniz kaydın özetini kontrol edin:
        </p>

        {/* Record Summary Box */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50 space-y-2">
          <div className="border-b border-slate-200 pb-2 dark:border-slate-700">
            <span className="text-[10px] font-bold uppercase text-slate-400">Silinecek Kayıt</span>
            <div className="text-sm font-bold text-slate-900 dark:text-slate-100 break-words">
              {recordTitle}
            </div>
          </div>

          {summaryItems.length > 0 && (
            <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
              {summaryItems.map((item, idx) => (
                <div key={idx} className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 block font-medium">{item.label}</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate">
                    {item.value !== undefined && item.value !== null && item.value !== ''
                      ? String(item.value)
                      : '—'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
          >
            İptal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-rose-600/20 hover:bg-rose-700 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Evet, Sil
          </button>
        </div>
      </div>
    </div>
  );
};
