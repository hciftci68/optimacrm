import React, { useState, useEffect } from 'react';
import { useCRM } from '../../context/CRMContext';
import {
  X, DollarSign, Calendar, User, Building, TrendingUp, AlertTriangle,
  FileText, FileSpreadsheet, Trash2, Plus, ArrowUpRight, Upload, AlertCircle, FileCheck, Download
} from 'lucide-react';
import { DealProposal } from '../../types';
import { DeleteConfirmModal } from '../common/DeleteConfirmModal';

interface DealDetailModalProps {
  dealId: string | null;
  onClose: () => void;
  onSelectContact: (id: string) => void;
}

export const DealDetailModal: React.FC<DealDetailModalProps> = ({
  dealId,
  onClose,
  onSelectContact,
}) => {
  const {
    deals, pipeline, contacts, accounts, activities, updateDeal,
    updateDealStage, deleteDeal, canDeleteDeal, addDealProposal,
    convertDealToOrder, currentUser, t
  } = useCRM();

  const deal = dealId ? deals.find((d) => d.id === dealId) : null;
  const contact = deal ? contacts.find((c) => c.id === deal.contactId) : null;
  const account = deal ? accounts.find((a) => a.id === deal.accountId) : null;
  const dealActivities = dealId ? activities.filter((a) => a.dealId === dealId) : [];

  const [amount, setAmount] = useState<number>(0);
  const [probability, setProbability] = useState<number>(0);
  const [closeDate, setCloseDate] = useState<string>('');
  const [stageId, setStageId] = useState<string>('');

  // Lost deal modal inside detail view
  const [showLostModal, setShowLostModal] = useState(false);
  const [targetLostStageId, setTargetLostStageId] = useState<string>('');
  const [lostReason, setLostReason] = useState('COMPETITOR');
  const [lostDetails, setLostDetails] = useState('');

  // Read-only proposal preview modal state
  const [selectedReadonlyProposal, setSelectedReadonlyProposal] = useState<DealProposal | null>(null);

  // Delete modal state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // New proposal form state
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [propTitle, setPropTitle] = useState('');
  const [propAmount, setPropAmount] = useState<number>(0);
  const [propFileName, setPropFileName] = useState('');
  const [propFileType, setPropFileType] = useState<'pdf' | 'doc' | 'docx' | 'xls' | 'xlsx' | 'other'>('pdf');
  const [propNote, setPropNote] = useState('');
  const [propFileUrl, setPropFileUrl] = useState<string>('');

  useEffect(() => {
    if (deal) {
      setAmount(deal.amount);
      setProbability(deal.probability);
      setCloseDate(deal.expectedCloseDate);
      setStageId(deal.stageId);
      setPropAmount(deal.amount);
    }
  }, [deal?.id, deal?.amount, deal?.probability, deal?.expectedCloseDate, deal?.stageId]);

  if (!dealId || !deal) return null;

  const userCanDelete = canDeleteDeal(deal);
  const currentStage = pipeline.stages.find((s) => s.id === deal.stageId);

  const handleStageSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStageId = e.target.value;
    const targetStage = pipeline.stages.find((s) => s.id === newStageId);

    if (targetStage?.name.toLowerCase().includes('lost')) {
      setTargetLostStageId(newStageId);
      setShowLostModal(true);
      return;
    }

    const success = updateDealStage(deal.id, newStageId);
    if (success) {
      setStageId(newStageId);
    } else {
      setStageId(deal.stageId);
    }
  };

  const handleConfirmLostReasonSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetLostStageId) return;
    const success = updateDealStage(deal.id, targetLostStageId, lostReason, lostDetails);
    if (success) {
      setStageId(targetLostStageId);
    }
    setShowLostModal(false);
  };

  const handleSaveDealUpdates = (e: React.FormEvent) => {
    e.preventDefault();
    updateDeal(deal.id, {
      amount: Number(amount),
      probability: Number(probability),
      expectedCloseDate: closeDate,
    });
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPropFileName(file.name);
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext === 'pdf') setPropFileType('pdf');
      else if (ext === 'doc' || ext === 'docx') setPropFileType('docx');
      else if (ext === 'xls' || ext === 'xlsx') setPropFileType('xlsx');
      else setPropFileType('other');

      if (!propTitle) {
        setPropTitle(`Teklif - ${file.name}`);
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPropFileUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddProposalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!propTitle.trim() || !propFileName) {
      alert('Lütfen teklif başlığı ve bir teklif dosyası (PDF, Word, Excel) ekleyin.');
      return;
    }

    addDealProposal(deal.id, {
      title: propTitle,
      amount: Number(propAmount) || deal.amount,
      currency: deal.currency || 'USD',
      fileName: propFileName,
      fileType: propFileType,
      fileUrl: propFileUrl || undefined,
      note: propNote,
    });

    setPropTitle('');
    setPropFileName('');
    setPropFileUrl('');
    setPropNote('');
    setShowProposalForm(false);
  };

  const handleApplyProposalAmount = (prop: DealProposal) => {
    setAmount(prop.amount);
    updateDeal(deal.id, { amount: prop.amount });
    alert(`Fırsat tutarı Revizyon #${prop.version} teklif tutarı ($${prop.amount.toLocaleString()}) ile güncellendi.`);
  };

  const handleDeleteDealClick = () => {
    if (!userCanDelete) {
      alert("Yalnızca fırsatın kayıt sahibi veya yetkili yöneticiler bu fırsatı silebilir.");
      return;
    }
    setShowDeleteConfirm(true);
  };

  const isWon = deal.status === 'WON' || deal.stageId === 'stg-5';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">{deal.title}</h2>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                  deal.status === 'WON'
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                    : deal.status === 'LOST'
                    ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                    : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400'
                }`}
              >
                {deal.status}
              </span>

              <button
                type="button"
                onClick={() => {
                  const res = convertDealToOrder(deal.id);
                  if (res) {
                    alert('Fırsat başarıyla Sipariş Kaydına dönüştürüldü.');
                    onClose();
                  }
                }}
                disabled={!isWon}
                title={!isWon ? "Sadece Closed Won statüsündeki fırsatlar siparişe çevrilebilir" : "Siparişe Dönüştür"}
                className={`rounded-lg px-3 py-1 text-[11px] font-bold text-white shadow-sm transition ${
                  isWon ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-300 cursor-not-allowed dark:bg-slate-800 dark:text-slate-500'
                }`}
              >
                → Siparişe Dönüştür
              </button>
            </div>
            <p className="text-xs text-slate-500">ID: {deal.id}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDeleteDealClick}
              title={userCanDelete ? "Fırsatı Sil" : "Sadece kayıt sahibi silebilir"}
              className={`rounded-lg p-1.5 transition ${
                userCanDelete
                  ? 'text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                  : 'text-slate-300 cursor-not-allowed dark:text-slate-700'
              }`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Stage Selector Dropdown inside Popup */}
          <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3.5 dark:border-indigo-900/40 dark:bg-indigo-950/20">
            <label className="block text-xs font-bold text-indigo-950 dark:text-indigo-200 mb-1">
              Fırsat Aşama / Statü Değiştir
            </label>
            <select
              value={deal.stageId}
              onChange={handleStageSelectChange}
              className="w-full rounded-xl border border-indigo-200 bg-white p-2 text-xs font-semibold text-slate-900 outline-none focus:border-indigo-500 dark:border-indigo-800 dark:bg-slate-800 dark:text-slate-100"
            >
              {pipeline.stages.map((stg) => (
                <option key={stg.id} value={stg.id}>
                  {stg.name} ({stg.probability}%)
                </option>
              ))}
            </select>
            <span className="mt-1 block text-[11px] text-slate-500">
              * Kural: İlk aşamayı geçen (New Prospect) bir fırsat tekrar New statüsüne geriye çekilemez.
            </span>
          </div>

          {/* Linked Contact & Account Cards */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-800/40">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Primary Contact</div>
              {contact ? (
                <button
                  onClick={() => {
                    onClose();
                    onSelectContact(contact.id);
                  }}
                  className="mt-1 font-bold text-indigo-600 hover:underline dark:text-indigo-400"
                >
                  {contact.firstName} {contact.lastName}
                </button>
              ) : (
                <div className="text-slate-400">—</div>
              )}
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-800/40">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Company / Account</div>
              <div className="mt-1 font-bold text-slate-800 dark:text-slate-200">
                {account ? account.name : '— Standalone —'}
              </div>
            </div>
          </div>

          {/* Lost Reason details if Lost */}
          {deal.status === 'LOST' && deal.lostReason && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/60 dark:text-rose-200">
              <div className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-rose-600" />
                <span>Lost Deal Audit: {deal.lostReason}</span>
              </div>
              <p className="mt-1 text-[11px] text-rose-700 dark:text-rose-300">
                {deal.lostReasonDetails || 'No additional commentary logged.'}
              </p>
            </div>
          )}

          {/* Proposals & Revisions Section */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-indigo-600" /> Teklifler & Revizyon Takibi ({deal.proposals?.length || 0})
                </h3>
                <p className="text-[11px] text-slate-500">
                  Her aşamada yeni teklif (Word, PDF, Excel) ekleyebilir, revizyon takip edebilir ve tutarı güncelleyebilirsiniz.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowProposalForm(!showProposalForm)}
                className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-400"
              >
                <Plus className="h-3.5 w-3.5" /> {showProposalForm ? 'İptal' : '+ Yeni Teklif Ekle'}
              </button>
            </div>

            {/* Proposal Add Form */}
            {showProposalForm && (
              <form onSubmit={handleAddProposalSubmit} className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-3.5 text-xs space-y-3 dark:border-indigo-900/40 dark:bg-indigo-950/20">
                <div className="font-bold text-slate-900 dark:text-slate-100">
                  Yeni Teklif Dosyası ve Revizyon Yükle
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Teklif Başlığı *</label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: Revize Fiyat Teklifi v2"
                    value={propTitle}
                    onChange={(e) => setPropTitle(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 text-xs outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Teklif Tutarı ($)</label>
                    <input
                      type="number"
                      required
                      value={propAmount}
                      onChange={(e) => setPropAmount(Number(e.target.value))}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 text-xs font-bold outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300">Teklif Dosyası (Word/PDF/Excel) *</label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx"
                      onChange={handleFileUpload}
                      className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-1 text-xs outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                    />
                    {propFileName && (
                      <span className="text-[11px] font-medium text-emerald-600 mt-1 block">
                        Yüklendi: {propFileName}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Revizyon Notu (Opsiyonel)</label>
                  <input
                    type="text"
                    placeholder="Müşteri isteğiyle %5 iskonto uygulandı"
                    value={propNote}
                    onChange={(e) => setPropNote(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-2 text-xs outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowProposalForm(false)}
                    className="rounded-xl border border-slate-200 px-3 py-1.5 font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-indigo-600 px-4 py-1.5 font-semibold text-white shadow-md hover:bg-indigo-700"
                  >
                    Teklifi & Revizyonu Kaydet
                  </button>
                </div>
              </form>
            )}

            {/* Proposals List */}
            {(!deal.proposals || deal.proposals.length === 0) ? (
              <p className="text-xs text-slate-400 italic">Henüz bu fırsata eklenmiş teklif dosyası bulunmuyor.</p>
            ) : (
              <div className="space-y-2.5">
                {deal.proposals.map((prop) => (
                  <div
                    key={prop.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-xs hover:border-indigo-300 transition dark:border-slate-800 dark:bg-slate-800/40 dark:hover:border-indigo-800"
                  >
                    <div
                      onClick={() => setSelectedReadonlyProposal(prop)}
                      className="flex items-start gap-2.5 cursor-pointer flex-1 group"
                      title="Teklifi Salt-Okunur (Read-Only) Modda Görüntülemek İçin Tıklayın"
                    >
                      {prop.fileType === 'xlsx' || prop.fileType === 'xls' ? (
                        <FileSpreadsheet className="h-5 w-5 text-emerald-600 mt-0.5 group-hover:scale-110 transition" />
                      ) : (
                        <FileText className="h-5 w-5 text-indigo-600 mt-0.5 group-hover:scale-110 transition" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                            Revizyon v{prop.version}
                          </span>
                          <span className="font-bold text-slate-900 group-hover:text-indigo-600 dark:text-slate-100 dark:group-hover:text-indigo-400 transition underline-offset-2 group-hover:underline">
                            {prop.title}
                          </span>
                          <span className="inline-flex items-center gap-0.5 rounded-md bg-slate-200/80 px-1.5 py-0.5 text-[9px] font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                            <ArrowUpRight className="h-2.5 w-2.5" /> Read-Only
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Dosya: <strong className="text-slate-700 dark:text-slate-300">{prop.fileName}</strong> • Ekleme: {new Date(prop.createdAt).toLocaleDateString()} ({prop.createdByName})
                        </div>
                        {prop.note && (
                          <div className="text-[11px] italic text-slate-400 mt-0.5">"{prop.note}"</div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => setSelectedReadonlyProposal(prop)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                        title="Salt-Okunur Görüntüle"
                      >
                        <FileText className="h-3.5 w-3.5 text-indigo-500" /> Read-Only Oku
                      </button>
                      <div className="text-right">
                        <div className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">
                          ${prop.amount.toLocaleString()} {prop.currency}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleApplyProposalAmount(prop)}
                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300"
                        title="Fırsat Tutarını Bu Teklif Tutarı İle Güncelle"
                      >
                        <FileCheck className="h-3.5 w-3.5" /> Tutarı Uygula
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Edit Form */}
          <form onSubmit={handleSaveDealUpdates} className="space-y-4 border-t border-slate-100 pt-4 text-xs dark:border-slate-800">
            <div className="font-bold text-slate-900 dark:text-slate-100">Deal Parameters</div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Amount ($)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-bold outline-none dark:border-slate-800 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Probability (%)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={probability}
                  onChange={(e) => setProbability(Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-bold outline-none dark:border-slate-800 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Close Date</label>
                <input
                  type="date"
                  value={closeDate}
                  onChange={(e) => setCloseDate(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-bold outline-none dark:border-slate-800 dark:bg-slate-800"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
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

          {/* Stage Audit History */}
          <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
            <div className="mb-3 font-bold text-slate-900 text-xs dark:text-slate-100">
              Deal Audit Stream
            </div>
            <div className="space-y-2">
              {dealActivities.map((act) => (
                <div
                  key={act.id}
                  className="rounded-xl border border-slate-100 bg-slate-50/70 p-2.5 text-xs dark:border-slate-800 dark:bg-slate-800/40"
                >
                  <div className="font-semibold text-slate-800 dark:text-slate-200">{act.title}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{act.description}</div>
                  <div className="text-[10px] text-slate-400 mt-1">{new Date(act.timestamp).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Lost Reason Modal inside DealDetailModal */}
      {showLostModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-rose-500" />
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Kaybedilme Nedeni Kaydı
                </h2>
              </div>
              <button
                onClick={() => setShowLostModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmLostReasonSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Ana Kayıp Kategorisi *
                </label>
                <select
                  value={lostReason}
                  onChange={(e) => setLostReason(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-medium outline-none dark:border-slate-800 dark:bg-slate-800"
                >
                  <option value="COMPETITOR">Rakibe Kaybedildi</option>
                  <option value="PRICE">Fiyat / Bütçe Kısıtı</option>
                  <option value="NO_DECISION">Karar Alınmadı / İletişim Kesildi</option>
                  <option value="FEATURE_GAP">Eksik Ürün Özelliği</option>
                  <option value="TIMING">Yanlış Zamanlama / Ertelendi</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Açıklama & Detaylar
                </label>
                <textarea
                  rows={3}
                  value={lostDetails}
                  onChange={(e) => setLostDetails(e.target.value)}
                  placeholder="Müşterinin vazgeçme gerekçesi..."
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs outline-none dark:border-slate-800 dark:bg-slate-800"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowLostModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-rose-600 px-4 py-2 font-semibold text-white shadow-md hover:bg-rose-700"
                >
                  Kaybedildi İşaretle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Deal Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        title="Fırsatı (Deal) Silme Onayı"
        recordType="Fırsat Kaydı"
        recordTitle={deal.title}
        summaryItems={[
          { label: 'Tutar', value: `$${deal.amount.toLocaleString()} ${deal.currency}` },
          { label: 'Aşama', value: currentStage?.name || deal.stageId },
          { label: 'Statü', value: deal.status },
        ]}
        onConfirm={() => {
          const deleted = deleteDeal(deal.id);
          if (deleted) {
            setShowDeleteConfirm(false);
            onClose();
          }
        }}
        onCancel={() => setShowDeleteConfirm(false)}
      />

      {/* Read-Only Proposal Document Viewer Modal */}
      {selectedReadonlyProposal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/70 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-800/60">
              <div className="flex items-center gap-2.5">
                <div className="rounded-xl bg-indigo-100 p-2 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-indigo-600 px-2 py-0.5 text-[10px] font-bold text-white">
                      READ-ONLY DOC
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-500">
                      Revizyon v{selectedReadonlyProposal.version}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                    {selectedReadonlyProposal.title}
                  </h2>
                </div>
              </div>
              <button
                onClick={() => setSelectedReadonlyProposal(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Read-only Document Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-800 dark:text-slate-200">
              {/* Security & Read-only Banner */}
              <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300">
                <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
                <div>
                  <div className="font-bold">Salt-Okunur (Read-Only) Belge Görünümü</div>
                  <div className="text-[11px] text-amber-800 dark:text-amber-400">
                    Bu fiyat teklif dosyası güvenlik ve denetim amacıyla kilitlenmiştir. İçerik üzerinde doğrudan düzenleme yapılamaz.
                  </div>
                </div>
              </div>

              {/* Formatted Document Canvas & Preview */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5 dark:border-slate-800 dark:bg-slate-950/80">
                {/* Embedded Real File Viewer if Data URL is available */}
                {selectedReadonlyProposal.fileUrl ? (
                  <div className="mb-4">
                    <span className="text-[10px] font-bold uppercase text-slate-400 mb-2 block">
                      Yüklü Belge Canlı Önizlemesi ({selectedReadonlyProposal.fileName})
                    </span>
                    {selectedReadonlyProposal.fileUrl.startsWith('data:image/') ? (
                      <div className="flex justify-center rounded-xl border border-slate-200 bg-slate-100 p-2 dark:border-slate-800 dark:bg-slate-900">
                        <img
                          src={selectedReadonlyProposal.fileUrl}
                          alt={selectedReadonlyProposal.fileName}
                          className="max-h-96 rounded object-contain"
                        />
                      </div>
                    ) : (
                      <iframe
                        src={selectedReadonlyProposal.fileUrl}
                        title={selectedReadonlyProposal.fileName}
                        className="h-80 w-full rounded-xl border border-slate-200 shadow-inner dark:border-slate-800 bg-slate-50"
                      />
                    )}
                  </div>
                ) : null}

                {/* Document Header */}
                <div className="flex justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
                  <div>
                    <h3 className="text-sm font-extrabold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      RESMİ FİYAT TEKLİFİ (PROPOSAL DOC)
                    </h3>
                    <p className="text-slate-500 mt-1">İlişkili Fırsat: <strong>{deal.title}</strong></p>
                    <p className="text-slate-500">Müşteri: <strong>{contact ? `${contact.firstName} ${contact.lastName}` : '—'}</strong> ({account?.name || 'Bireysel'})</p>
                  </div>
                  <div className="text-right text-slate-500 space-y-1">
                    <div>Revizyon No: <strong className="font-mono text-slate-900 dark:text-white">v{selectedReadonlyProposal.version}</strong></div>
                    <div>Tarih: <strong className="text-slate-900 dark:text-white">{new Date(selectedReadonlyProposal.createdAt).toLocaleDateString()}</strong></div>
                    <div>Hazırlayan: <strong className="text-slate-900 dark:text-white">{selectedReadonlyProposal.createdByName || 'CRM Sistemi'}</strong></div>
                  </div>
                </div>

                {/* File Metadata & Download Card */}
                <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3.5 border border-slate-200 shadow-sm dark:bg-slate-900 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400">Dosya Adı & Format</span>
                    <div className="mt-1 font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      {selectedReadonlyProposal.fileType === 'xlsx' || selectedReadonlyProposal.fileType === 'xls' ? (
                        <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <FileText className="h-4 w-4 text-indigo-600" />
                      )}
                      {selectedReadonlyProposal.fileName}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400">Teklif Tutarı</span>
                    <div className="mt-1 text-base font-extrabold text-indigo-600 dark:text-indigo-400">
                      ${selectedReadonlyProposal.amount.toLocaleString()} {selectedReadonlyProposal.currency}
                    </div>
                  </div>
                </div>

                {/* Revision Notes */}
                {selectedReadonlyProposal.note && (
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400">Revizyon Notu & Şartlar</span>
                    <div className="mt-1 rounded-xl bg-slate-50 p-3 text-slate-700 border border-slate-200 italic dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300">
                      "{selectedReadonlyProposal.note}"
                    </div>
                  </div>
                )}

                {/* Line Items Preview if available on deal */}
                {deal.lineItems && deal.lineItems.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 mb-2 block">Dahil Olan Ürün & Hizmet Detayları</span>
                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900">
                      <table className="w-full text-left text-[11px]">
                        <thead className="bg-slate-100 font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          <tr>
                            <th className="py-2 px-3">Ürün / Hizmet</th>
                            <th className="py-2 px-2 text-center">Miktar</th>
                            <th className="py-2 px-2 text-right">Birim Fiyat</th>
                            <th className="py-2 px-3 text-right">Toplam</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {deal.lineItems.map((item) => (
                            <tr key={item.id}>
                              <td className="py-2 px-3 font-medium text-slate-900 dark:text-white">{item.productName}</td>
                              <td className="py-2 px-2 text-center font-bold">{item.quantity}</td>
                              <td className="py-2 px-2 text-right font-mono">${item.unitPrice.toLocaleString()}</td>
                              <td className="py-2 px-3 text-right font-bold text-slate-900 dark:text-white">${item.subtotal.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Read-only Footer */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 bg-slate-50 px-6 py-3 dark:border-slate-800 dark:bg-slate-800/60">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleApplyProposalAmount(selectedReadonlyProposal);
                    setSelectedReadonlyProposal(null);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-emerald-700 transition"
                >
                  <FileCheck className="h-4 w-4" /> Bu Teklif Tutarı ile Fırsatı Güncelle (${selectedReadonlyProposal.amount.toLocaleString()})
                </button>

                {selectedReadonlyProposal.fileUrl && (
                  <a
                    href={selectedReadonlyProposal.fileUrl}
                    download={selectedReadonlyProposal.fileName}
                    className="inline-flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    <Download className="h-3.5 w-3.5 text-indigo-500" /> Dosyayı İndir
                  </a>
                )}
              </div>

              <button
                type="button"
                onClick={() => setSelectedReadonlyProposal(null)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
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
