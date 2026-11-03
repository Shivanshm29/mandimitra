import React, { useState, useEffect } from 'react';
import { useLanguage } from '../app/LanguageContext';
import { transactionService } from '../services/transactionService';
import type { Sale, FinanceSummary } from '../types/transaction';
import { RecordSaleModal } from '../components/RecordSaleModal';
import { RecordPaymentModal } from '../components/RecordPaymentModal';
import { VoiceDictationButton } from '../components/VoiceDictationButton';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import {
  FileText,
  Plus,
  IndianRupee,
  Clock,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronDown,
  ChevronUp,
  Search,
  Camera,
  Video,
  Volume2,
  X,
  Eye,
} from 'lucide-react';

export const TransactionsPage: React.FC = () => {
  const { t, language } = useLanguage();

  const [sales, setSales] = useState<Sale[]>([]);
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [expandedSaleId, setExpandedSaleId] = useState<number | null>(null);
  const [previewEvidence, setPreviewEvidence] = useState<{ url: string; type: string } | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [salesData, summaryData] = await Promise.all([
        transactionService.getSales(),
        transactionService.getFinanceSummary(),
      ]);
      setSales(salesData);
      setSummary(summaryData);
    } catch (err) {
      console.error('Failed to load transaction data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const toggleExpand = (id: number) => {
    setExpandedSaleId((prev) => (prev === id ? null : id));
  };

  const filteredSales = sales.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.trader_name.toLowerCase().includes(q) ||
      s.commodity.toLowerCase().includes(q) ||
      (s.market_name && s.market_name.toLowerCase().includes(q)) ||
      (s.variety && s.variety.toLowerCase().includes(q))
    );
  });

  return (
    <div className="flex flex-col gap-6">
      {/* Header and Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-warm-300 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-charcoal-900">
            {t.transactions.title}
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-700 mt-0.5">
            {t.transactions.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="primary"
            onClick={() => setIsSaleModalOpen(true)}
            className="shadow-sm"
          >
            <Plus className="w-5 h-5 mr-1.5" />
            {t.transactions.newSaleBtn}
          </Button>

          <Button
            variant="secondary"
            onClick={() => setIsPaymentModalOpen(true)}
          >
            <IndianRupee className="w-4 h-4 mr-1.5 text-forest-700" />
            {t.transactions.recordPaymentBtn}
          </Button>
        </div>
      </div>

      {/* Financial Health Metrics Strip */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4">
          <Card className="p-4 bg-white border-warm-300">
            <div className="text-xs text-charcoal-700 font-medium">{t.transactions.grossAmount}</div>
            <div className="text-xl sm:text-2xl font-extrabold text-charcoal-900 mt-1">
              ₹{parseFloat(String(summary.total_gross_amount)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-charcoal-700 mt-1">
              {summary.total_sales_count} {t.dashboard.salesCountUnit}
            </div>
          </Card>

          <Card className="p-4 bg-white border-warm-300">
            <div className="text-xs text-red-700 font-medium">{t.transactions.totalDeductions}</div>
            <div className="text-xl sm:text-2xl font-extrabold text-red-600 mt-1">
              -₹{parseFloat(String(summary.total_deductions)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-charcoal-700 mt-1">
              {t.transactions.deductionsBreakdown}
            </div>
          </Card>

          <Card className="p-4 bg-white border-warm-300">
            <div className="text-xs text-forest-700 font-medium">{t.transactions.receivedAmount}</div>
            <div className="text-xl sm:text-2xl font-extrabold text-forest-700 mt-1">
              ₹{parseFloat(String(summary.total_received)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-forest-700 font-medium mt-1">
              {summary.settled_sales_count} {t.dashboard.settledCountUnit}
            </div>
          </Card>

          <Card className="p-4 bg-amber-50/70 border-amber-200">
            <div className="text-xs text-amber-900 font-bold">{t.transactions.outstandingAmount}</div>
            <div className="text-xl sm:text-2xl font-extrabold text-amber-800 mt-1">
              ₹{parseFloat(String(summary.total_outstanding)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-amber-800 mt-1">
              {summary.pending_sales_count} {t.dashboard.pendingCountUnit}
            </div>
          </Card>
        </div>
      )}

      {/* Sales Transactions List */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-base sm:text-lg font-bold text-charcoal-900">
            {t.transactions.allRecords}
          </h2>

          {/* Search with Voice Dictation */}
          <div className="relative flex items-center w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.transactions.searchPlaceholder}
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
        ) : filteredSales.length === 0 ? (
          <Card className="text-center py-12 flex flex-col items-center justify-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-warm-200 text-charcoal-700 flex items-center justify-center">
              <FileText className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-charcoal-900">
              {searchQuery ? t.transactions.filterNoResult : t.transactions.noSalesTitle}
            </h3>
            <p className="text-xs sm:text-sm text-charcoal-700 max-w-sm">
              {searchQuery
                ? t.transactions.filterNoResult
                : t.transactions.noSalesDesc}
            </p>
            {!searchQuery && (
              <Button variant="primary" onClick={() => setIsSaleModalOpen(true)} className="mt-2">
                <Plus className="w-4 h-4 mr-1.5" /> {t.dashboard.firstSaleAction}
              </Button>
            )}
          </Card>
        ) : (
          <div className="flex flex-col gap-3.5">
            {filteredSales.map((sale) => {
              const isExpanded = expandedSaleId === sale.id;
              const gross = parseFloat(String(sale.gross_amount));
              const deductions = parseFloat(String(sale.total_deductions));
              const net = parseFloat(String(sale.net_receivable));
              const received = parseFloat(String(sale.amount_received));
              const outstanding = parseFloat(String(sale.outstanding_balance));

              return (
                <Card key={sale.id} className="p-4 sm:p-5 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-forest-100 text-forest-700 flex items-center justify-center font-bold shrink-0 mt-0.5">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-base sm:text-lg text-charcoal-900">
                            {sale.commodity} ({sale.quantity} {sale.quantity_unit})
                          </h3>
                          <Badge
                            variant={
                              sale.status === 'SETTLED'
                                ? 'success'
                                : sale.status === 'PARTIAL'
                                ? 'warning'
                                : 'development'
                            }
                          >
                            {sale.status === 'SETTLED'
                              ? t.transactions.settled
                              : sale.status === 'PARTIAL'
                              ? t.transactions.partial
                              : t.transactions.pending}
                          </Badge>
                        </div>

                        <div className="text-xs text-charcoal-700 mt-1 flex flex-wrap items-center gap-3">
                          <span>{t.transactions.trader} <strong className="text-charcoal-900">{sale.trader_name}</strong></span>
                          {sale.market_name && <span>• {t.transactions.market} {sale.market_name}</span>}
                          <span>• {t.transactions.date} {sale.sale_date}</span>
                          {sale.evidence_url && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewEvidence({ url: sale.evidence_url!, type: sale.evidence_type || 'IMAGE' });
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 text-[11px] font-semibold hover:bg-emerald-100 transition"
                            >
                              {sale.evidence_type === 'VIDEO' ? <Video className="w-3 h-3 text-amber-600" /> : <Camera className="w-3 h-3 text-emerald-700" />}
                              <span>{sale.evidence_type === 'VIDEO' ? t.transactions.videoEvidenceAttached : t.transactions.evidenceAttached}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-5 border-t sm:border-t-0 pt-3 sm:pt-0">
                      <div className="text-right">
                        <div className="text-xs text-charcoal-700">{t.transactions.netReceivable}</div>
                        <div className="text-base sm:text-lg font-bold text-charcoal-900">
                          ₹{net.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </div>
                        {outstanding > 0 ? (
                          <div className="text-xs font-bold text-amber-800">
                            {t.transactions.outstandingAmount}: ₹{outstanding.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </div>
                        ) : (
                          <div className="text-xs font-semibold text-emerald-700">{t.transactions.settled}</div>
                        )}
                      </div>

                      <button
                        onClick={() => toggleExpand(sale.id)}
                        className="p-2 rounded-xl text-charcoal-700 hover:bg-warm-200 transition-colors"
                        title={t.transactions.details}
                      >
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Expandable Deductions and Breakdown Details */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-warm-300 text-xs sm:text-sm bg-warm-100 p-4 rounded-2xl flex flex-col gap-2">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pb-3 border-b border-warm-300/80">
                        <div>
                          <span className="text-charcoal-700 block">{t.transactions.ratePerUnit}</span>
                          <strong className="text-charcoal-900">₹{parseFloat(String(sale.rate_per_unit))}</strong>
                        </div>
                        <div>
                          <span className="text-charcoal-700 block">{t.transactions.grossAmount}</span>
                          <strong className="text-charcoal-900">₹{gross.toLocaleString('en-IN')}</strong>
                        </div>
                        <div>
                          <span className="text-charcoal-700 block">{t.transactions.totalDeductions}</span>
                          <strong className="text-red-700">-₹{deductions.toLocaleString('en-IN')}</strong>
                        </div>
                        <div>
                          <span className="text-charcoal-700 block">{t.transactions.receivedAmount}</span>
                          <strong className="text-forest-700">₹{received.toLocaleString('en-IN')}</strong>
                        </div>
                      </div>

                      {/* Deductions Itemized List */}
                      {sale.deductions && sale.deductions.length > 0 && (
                        <div className="pt-2">
                          <span className="font-bold text-charcoal-800 block mb-1.5">
                            {t.transactions.deductionsBreakdown}
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {sale.deductions.map((d, i) => (
                              <span
                                key={i}
                                className="px-3 py-1 bg-white rounded-lg border border-warm-300 text-xs text-charcoal-800"
                              >
                                {d.deduction_type}: <strong>₹{parseFloat(String(d.amount))}</strong> {d.description && `(${d.description})`}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {sale.notes && (
                        <p className="text-xs text-charcoal-700 pt-1">
                          <strong>{t.transactions.notes}</strong> {sale.notes}
                        </p>
                      )}

                      {/* Attached Evidence Details */}
                      {sale.evidence_url && (
                        <div className="mt-3 pt-3 border-t border-warm-300/80 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {sale.evidence_type === 'VIDEO' ? (
                              <Video className="w-5 h-5 text-amber-600" />
                            ) : (
                              <Camera className="w-5 h-5 text-emerald-700" />
                            )}
                            <span className="text-xs font-bold text-charcoal-800">
                              {sale.evidence_type === 'VIDEO' ? t.transactions.videoEvidenceAttached : t.transactions.receiptEvidenceAttached}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              setPreviewEvidence({
                                url: sale.evidence_url!,
                                type: sale.evidence_type || 'IMAGE',
                              })
                            }
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-warm-400 text-xs font-bold text-[#176B45] hover:bg-emerald-50 transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            पुरावा पहा (View)
                          </button>
                        </div>
                      )}

                      {sale.audio_note_url && (
                        <div className="mt-2 pt-2 border-t border-warm-300/80">
                          <span className="text-xs font-bold text-charcoal-800 flex items-center gap-1 mb-1">
                            <Volume2 className="w-3.5 h-3.5 text-[#176B45]" /> ऑडिओ टीप (Voice Note):
                          </span>
                          <audio controls src={sale.audio_note_url} className="w-full h-8" />
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox / Modal for Evidence Preview */}
      {previewEvidence && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-5 relative shadow-2xl overflow-hidden flex flex-col items-center">
            <button
              onClick={() => setPreviewEvidence(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-gray-900 mb-3 self-start flex items-center gap-2">
              {previewEvidence.type === 'VIDEO' ? <Video className="w-5 h-5 text-amber-600" /> : <Camera className="w-5 h-5 text-emerald-700" />}
              {previewEvidence.type === 'VIDEO' ? 'व्हिडिओ पुरावा (Video Evidence)' : 'काटा पावती / बिल पुरावा (Receipt Evidence)'}
            </h3>

            <div className="w-full flex justify-center bg-gray-950 rounded-2xl overflow-hidden p-2 max-h-[75vh]">
              {previewEvidence.type === 'VIDEO' ? (
                <video src={previewEvidence.url} controls autoPlay className="max-h-[70vh] max-w-full rounded-xl" />
              ) : (
                <img src={previewEvidence.url} alt="Weighing Evidence" className="max-h-[70vh] max-w-full object-contain rounded-xl" />
              )}
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

      {/* Modals */}
      <RecordSaleModal
        isOpen={isSaleModalOpen}
        onClose={() => setIsSaleModalOpen(false)}
        onSuccess={loadData}
      />

      <RecordPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSuccess={loadData}
        sales={sales}
      />
    </div>
  );
};

