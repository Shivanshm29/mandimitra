import React, { useState, useEffect } from 'react';
import { useLanguage } from '../app/LanguageContext';
import { transactionService } from '../services/transactionService';
import type { Payment, Sale, FinanceSummary } from '../types/transaction';
import { RecordPaymentModal } from '../components/RecordPaymentModal';
import { VoiceDictationButton } from '../components/VoiceDictationButton';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import {
  IndianRupee,
  Plus,
  CheckCircle2,
  Calendar,
  CreditCard,
  Banknote,
  Search,
  Camera,
  Eye,
  X,
} from 'lucide-react';

export const PaymentsPage: React.FC = () => {
  const { t } = useLanguage();

  const [payments, setPayments] = useState<Payment[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [previewEvidence, setPreviewEvidence] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [paymentsData, salesData, summaryData] = await Promise.all([
        transactionService.getPayments(),
        transactionService.getSales(),
        transactionService.getFinanceSummary(),
      ]);
      setPayments(paymentsData);
      setSales(salesData);
      setSummary(summaryData);
    } catch (err) {
      console.error('Failed to load payments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredPayments = payments.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (p.reference_note && p.reference_note.toLowerCase().includes(q)) ||
      p.payment_mode.toLowerCase().includes(q) ||
      (p.sale_id && String(p.sale_id).includes(q))
    );
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header and Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-warm-300 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-charcoal-900">
            {t.payments.title}
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-700 mt-0.5">
            {t.payments.subtitle}
          </p>
        </div>

        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-5 h-5 mr-1.5" />
          {t.payments.recordPaymentBtn}
        </Button>
      </div>

      {/* Financial Health Summary */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-5 bg-white border-warm-300">
            <div className="text-xs text-charcoal-700 font-medium">{t.payments.totalReceived}</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-forest-700 mt-1">
              ₹{parseFloat(String(summary.total_received)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-forest-700 mt-1 font-medium">
              {payments.length} {t.dashboard.salesCountUnit}
            </div>
          </Card>

          <Card className="p-5 bg-amber-50 border-amber-200">
            <div className="text-xs text-amber-900 font-bold">{t.payments.pendingReceivables}</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-800 mt-1">
              ₹{parseFloat(String(summary.total_outstanding)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-amber-800 mt-1 font-medium">
              {summary.pending_sales_count} {t.dashboard.pendingCountUnit}
            </div>
          </Card>

          <Card className="p-5 bg-white border-warm-300">
            <div className="text-xs text-charcoal-700 font-medium">{t.payments.settlementRate}</div>
            <div className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 mt-1">
              {summary.total_sales_count > 0
                ? `${Math.round((summary.settled_sales_count / summary.total_sales_count) * 100)}%`
                : '0%'}
            </div>
            <div className="text-xs text-charcoal-700 mt-1">
              {summary.settled_sales_count} / {summary.total_sales_count} {t.dashboard.settledCountUnit}
            </div>
          </Card>
        </div>
      )}

      {/* Payments History List */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-base sm:text-lg font-bold text-charcoal-900">
            {t.payments.paymentHistory}
          </h2>

          {/* Search Bar with Voice Dictation */}
          <div className="relative flex items-center w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.payments.searchPlaceholder}
              className="w-full pl-9 pr-10 py-2 text-xs sm:text-sm rounded-xl border border-warm-400 bg-white focus:outline-none focus:border-[#176B45]"
            />
            <div className="absolute right-1.5 top-1">
              <VoiceDictationButton
                onTranscript={(txt) => setSearchQuery(txt)}
                title={t.transactions.voiceSearchTooltip}
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-4 border-forest-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-medium text-charcoal-700">{t.common.loading}</p>
          </div>
        ) : filteredPayments.length === 0 ? (
          <Card className="text-center py-12 flex flex-col items-center justify-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-warm-200 text-charcoal-700 flex items-center justify-center">
              <IndianRupee className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-charcoal-900">
              {searchQuery ? t.transactions.filterNoResult : t.payments.noPaymentsTitle}
            </h3>
            <p className="text-xs sm:text-sm text-charcoal-700 max-w-sm">
              {searchQuery
                ? t.transactions.filterNoResult
                : t.payments.noPaymentsDesc}
            </p>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredPayments.map((p) => {
              const amt = parseFloat(String(p.amount));
              return (
                <Card key={p.id} className="p-4 sm:p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-xl bg-forest-100 text-forest-700 flex items-center justify-center shrink-0">
                      {p.payment_mode === 'CASH' ? <Banknote className="w-6 h-6" /> : <CreditCard className="w-6 h-6" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base text-charcoal-900">
                          ₹{amt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-[11px] font-semibold bg-warm-200 text-charcoal-800 px-2 py-0.5 rounded-md">
                          {p.payment_mode === 'CASH' ? t.payments.cash : p.payment_mode}
                        </span>
                        {p.evidence_url && (
                          <button
                            type="button"
                            onClick={() => setPreviewEvidence(p.evidence_url!)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-[11px] font-semibold hover:bg-emerald-100 transition"
                          >
                            <Camera className="w-3 h-3 text-emerald-700" />
                            <span>{t.payments.evidenceReceipt}</span>
                          </button>
                        )}
                      </div>
                      <div className="text-xs text-charcoal-700 mt-0.5 flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {p.payment_date}
                        </span>
                        {p.reference_note && <span>• {p.reference_note}</span>}
                        {p.sale_id && <span>• {t.payments.linkedSale} #{p.sale_id}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {p.evidence_url && (
                      <button
                        type="button"
                        onClick={() => setPreviewEvidence(p.evidence_url!)}
                        className="p-1.5 rounded-lg border border-warm-300 hover:bg-warm-100 text-[#176B45]"
                        title={t.payments.viewReceipt}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                    <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700 shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="hidden sm:inline">{t.payments.receivedBadge}</span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox for Payment Receipt Preview */}
      {previewEvidence && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 relative shadow-2xl overflow-hidden flex flex-col items-center">
            <button
              onClick={() => setPreviewEvidence(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-gray-900 mb-3 self-start flex items-center gap-2">
              <Camera className="w-5 h-5 text-emerald-700" />
              पेमेंट पावती पुरावा (Payment Receipt Evidence)
            </h3>

            <div className="w-full flex justify-center bg-gray-950 rounded-2xl overflow-hidden p-2 max-h-[70vh]">
              <img src={previewEvidence} alt="Payment Receipt" className="max-h-[65vh] max-w-full object-contain rounded-xl" />
            </div>

            <Button
              variant="secondary"
              onClick={() => setPreviewEvidence(null)}
              className="mt-4 self-end min-h-[40px]"
            >
              बंद करा (Close)
            </Button>
          </div>
        </div>
      )}

      <RecordPaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadData}
        sales={sales}
      />
    </div>
  );
};

