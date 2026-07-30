import React, { useState } from 'react';
import { useCRM } from '../../context/CRMContext';
import { Deal } from '../../types';
import { Plus, DollarSign, Calendar, AlertCircle, X, ChevronRight, TrendingUp } from 'lucide-react';

interface DealsKanbanProps {
  onSelectDeal: (id: string) => void;
  onSelectContact: (id: string) => void;
}

export const DealsKanban: React.FC<DealsKanbanProps> = ({ onSelectDeal, onSelectContact }) => {
  const { pipeline, deals, contacts, accounts, addDeal, updateDealStage, t } = useCRM();

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [lostDealModal, setLostDealModal] = useState<{ dealId: string; stageId: string } | null>(null);
  const [lostReason, setLostReason] = useState<string>('COMPETITOR');
  const [lostDetails, setLostDetails] = useState<string>('');

  // New Deal Form State
  const [title, setTitle] = useState('');
  const [contactId, setContactId] = useState('');
  const [stageId, setStageId] = useState(pipeline.stages[0]?.id || 'stg-1');
  const [amount, setAmount] = useState(50000);
  const [expectedCloseDate, setExpectedCloseDate] = useState('2026-08-30');

  const handleStageMove = (deal: Deal, targetStageId: string) => {
    const targetStage = pipeline.stages.find((s) => s.id === targetStageId);

    if (targetStage?.name.toLowerCase().includes('lost')) {
      setLostDealModal({ dealId: deal.id, stageId: targetStageId });
    } else {
      updateDealStage(deal.id, targetStageId);
    }
  };

  const handleConfirmLostReason = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lostDealModal) return;

    updateDealStage(lostDealModal.dealId, lostDealModal.stageId, lostReason, lostDetails);
    setLostDealModal(null);
    setLostReason('COMPETITOR');
    setLostDetails('');
  };

  const handleCreateDealSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !contactId) return;

    const selectedContact = contacts.find((c) => c.id === contactId);
    const selectedStage = pipeline.stages.find((s) => s.id === stageId);

    addDeal({
      title,
      contactId,
      accountId: selectedContact?.accountId,
      pipelineId: pipeline.id,
      stageId,
      amount: Number(amount),
      currency: 'USD',
      probability: selectedStage ? selectedStage.probability : 50,
      expectedCloseDate,
      ownerId: 'usr-1',
      status: selectedStage?.name.toLowerCase().includes('won')
        ? 'WON'
        : selectedStage?.name.toLowerCase().includes('lost')
        ? 'LOST'
        : 'OPEN',
    });

    setTitle('');
    setContactId('');
    setAmount(50000);
    setIsAddModalOpen(false);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {t('deals')} — {pipeline.name}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Kanban pipeline tracking, deal progression, and sales velocity management.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" /> {t('addDeal')}
        </button>
      </div>

      {/* Kanban Board Container - Responsive Fit Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 min-w-full pb-6">
        {(pipeline?.stages || []).map((stage) => {
          const stageDeals = deals.filter((d) => d.stageId === stage.id);
          const stageTotalAmount = stageDeals.reduce((sum, d) => sum + d.amount, 0);

          return (
            <div
              key={stage.id}
              className="flex w-full flex-col rounded-2xl border border-slate-200/80 bg-slate-50/60 p-2.5 sm:p-3 dark:border-slate-800 dark:bg-slate-900/60"
            >
              {/* Column Header */}
              <div className="mb-2.5 flex items-center justify-between border-b border-slate-200/60 pb-2 dark:border-slate-800">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: stage.color }}
                  />
                  <h3 className="font-bold text-xs text-slate-900 truncate dark:text-slate-100" title={stage.name}>
                    {stage.name}
                  </h3>
                  <span className="rounded-full bg-slate-200/80 px-1.5 py-0.2 text-[10px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {stageDeals.length}
                  </span>
                </div>

                <span className="text-[10px] font-bold text-slate-500 shrink-0 ml-1">
                  ${stageTotalAmount.toLocaleString()}
                </span>
              </div>

              {/* Deal Cards */}
              <div className="flex-1 space-y-2 min-h-[300px]">
                {stageDeals.length === 0 ? (
                  <div className="flex h-24 items-center justify-center rounded-xl border border-dashed border-slate-200 text-[10px] text-slate-400 dark:border-slate-800">
                    Kayıt yok
                  </div>
                ) : (
                  stageDeals.map((deal) => {
                    const contact = contacts.find((c) => c.id === deal.contactId);
                    const account = accounts.find((a) => a.id === deal.accountId);

                    return (
                      <div
                        key={deal.id}
                        className="group relative flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-2.5 shadow-2xs transition-all hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-800"
                      >
                        <div>
                          <button
                            onClick={() => onSelectDeal(deal.id)}
                            className="text-left font-bold text-xs text-slate-900 hover:text-indigo-600 truncate w-full block dark:text-slate-100 dark:hover:text-indigo-400"
                            title={deal.title}
                          >
                            {deal.title}
                          </button>

                          {contact && (
                            <div className="mt-1 text-[10px] text-slate-500 flex items-center gap-1 truncate">
                              <span>👤</span>
                              <button
                                onClick={() => onSelectContact(contact.id)}
                                className="hover:underline hover:text-indigo-600 truncate"
                              >
                                {contact.firstName} {contact.lastName}
                              </button>
                            </div>
                          )}

                          {account && (
                            <div className="text-[10px] text-slate-400 truncate mt-0.5">
                              🏢 {account.name}
                            </div>
                          )}
                        </div>

                        <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2 dark:border-slate-700/60">
                          <div className="font-extrabold text-xs text-slate-900 dark:text-slate-100">
                            ${deal.amount.toLocaleString()}
                          </div>

                          {/* Quick Stage Move Dropdown */}
                          <select
                            value={deal.stageId}
                            onChange={(e) => handleStageMove(deal, e.target.value)}
                            className="rounded-lg border border-slate-200 bg-slate-50 px-1 py-0.5 text-[10px] font-semibold text-slate-700 outline-none cursor-pointer max-w-[90px] truncate dark:border-slate-700 dark:bg-slate-700 dark:text-slate-200"
                          >
                            {(pipeline?.stages || []).map((stg) => (
                              <option key={stg.id} value={stg.id}>
                                {stg.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Lost Deal Reason Modal */}
      {lostDealModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-rose-500" />
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Capture Lost Reason
                </h2>
              </div>
              <button
                onClick={() => setLostDealModal(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmLostReason} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Primary Lost Reason Category *
                </label>
                <select
                  value={lostReason}
                  onChange={(e) => setLostReason(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs font-medium outline-none dark:border-slate-800 dark:bg-slate-800"
                >
                  <option value="COMPETITOR">Lost to Competitor</option>
                  <option value="PRICE">Price / Budget Constraint</option>
                  <option value="NO_DECISION">Prospect Ghosted / No Decision</option>
                  <option value="FEATURE_GAP">Missing Required Product Features</option>
                  <option value="TIMING">Bad Timing / Deferred Project</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Additional Details & Context
                </label>
                <textarea
                  rows={3}
                  value={lostDetails}
                  onChange={(e) => setLostDetails(e.target.value)}
                  placeholder="Provide brief feedback on why the client opted against..."
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs outline-none dark:border-slate-800 dark:bg-slate-800"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setLostDealModal(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-rose-600 px-4 py-2 font-semibold text-white shadow-md hover:bg-rose-700"
                >
                  Mark Lost
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Deal Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {t('addDeal')}
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDealSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Deal Opportunity Name *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Enterprise Fleet License Expansion"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Associated Primary Contact *
                </label>
                <select
                  required
                  value={contactId}
                  onChange={(e) => setContactId(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                >
                  <option value="">Select Contact...</option>
                  {contacts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.firstName} {c.lastName} ({c.accountName || 'No Company'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Initial Stage
                  </label>
                  <select
                    value={stageId}
                    onChange={(e) => setStageId(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                  >
                    {(pipeline?.stages || []).map((stg) => (
                      <option key={stg.id} value={stg.id}>
                        {stg.name} ({stg.probability}%)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Deal Amount ($) *
                  </label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 p-2 text-xs text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">
                  Target Expected Close Date *
                </label>
                <input
                  type="date"
                  required
                  value={expectedCloseDate}
                  onChange={(e) => setExpectedCloseDate(e.target.value)}
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
    </div>
  );
};
