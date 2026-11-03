import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../app/AuthContext';
import { useLanguage } from '../app/LanguageContext';
import { useAssistant } from '../app/AssistantContext';
import { mandiService } from '../services/mandiService';
import { transactionService } from '../services/transactionService';
import type { MarketPrice } from '../types/mandi';
import type { Sale, FinanceSummary } from '../types/transaction';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';
import { RecordSaleModal } from '../components/RecordSaleModal';
import { RecordPaymentModal } from '../components/RecordPaymentModal';
import { DocumentScanModal } from '../components/DocumentScanModal';
import { SellingLotsManager } from '../components/SellingLotsManager';
import {
  TrendingUp,
  Sparkles,
  FileText,
  IndianRupee,
  Mic,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  ChevronRight,
  Bot,
  Camera,
  LineChart,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, profile } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { openAssistant } = useAssistant();
  const navigate = useNavigate();

  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [summary, setSummary] = useState<FinanceSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isDocScanModalOpen, setIsDocScanModalOpen] = useState(false);
  const [prefillSaleData, setPrefillSaleData] = useState<any>(null);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [pricesData, salesData, summaryData] = await Promise.all([
        mandiService.getPrices({ limit: 4 }),
        transactionService.getSales(),
        transactionService.getFinanceSummary(),
      ]);
      setPrices(pricesData);
      setSales(salesData);
      setSummary(summaryData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      {/* 1. Farmer Welcome Banner with Prominent Voice Button */}
      <div className="bg-gradient-to-r from-forest-800 via-forest-700 to-forest-600 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-mustard-400 font-semibold text-sm tracking-wide uppercase">
                {t.dashboard.welcome}
              </span>
              <span className="text-[11px] bg-white/15 px-2.5 py-0.5 rounded-full text-forest-100 font-medium border border-white/20">
                {t.dashboard.platformBanner}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {profile?.display_name || user?.username || t.dashboard.farmerFriend}
            </h1>
            <p className="text-forest-100 text-xs sm:text-sm mt-1 max-w-xl">
              {t.dashboard.overviewSubtitle}
            </p>
          </div>

          {/* Prominent Voice Assistant Button */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => openAssistant()}
              className="px-5 py-3.5 bg-mustard-500 hover:bg-mustard-400 text-charcoal-900 rounded-2xl font-bold shadow-lg flex items-center gap-2.5 transition-all transform active:scale-95 text-sm sm:text-base cursor-pointer"
              title={t.dashboard.askSarvamVoiceBtn}
              aria-label={t.dashboard.askSarvamVoiceBtn}
            >
              <div className="w-8 h-8 rounded-xl bg-charcoal-900 text-mustard-400 flex items-center justify-center">
                <Mic className="w-5 h-5 animate-pulse" />
              </div>
              <span>{t.dashboard.askSarvamVoiceBtn}</span>
            </button>
          </div>
        </div>

        {/* Location sub-strip */}
        {profile && (
          <div className="mt-5 pt-4 border-t border-white/15 flex flex-wrap items-center gap-4 text-xs text-forest-100">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-mustard-400" />
              <span>{t.dashboard.villageLabel} <strong>{profile.village}</strong>, {profile.district}</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-mustard-400" />
              <span>{t.dashboard.verifiedDataNotice}</span>
            </div>
          </div>
        )}
      </div>

      {/* 2. Quick Action Toolbar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-3.5">
        <button
          onClick={() => {
            setPrefillSaleData(null);
            setIsSaleModalOpen(true);
          }}
          className="p-3.5 sm:p-4 bg-white rounded-2xl border-2 border-forest-500/80 hover:border-forest-600 hover:shadow-md transition-all flex items-center gap-3 text-left group cursor-pointer"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-forest-600 text-white flex items-center justify-center font-bold shrink-0 shadow-xs group-hover:scale-105 transition-transform">
            <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="font-bold text-charcoal-900 text-xs sm:text-sm">{t.dashboard.recordSaleBtn}</div>
            <div className="text-[11px] text-charcoal-700 hidden sm:block">{t.dashboard.recordSaleSubtitle}</div>
          </div>
        </button>

        <button
          onClick={() => setIsDocScanModalOpen(true)}
          className="p-3.5 sm:p-4 bg-white rounded-2xl border border-warm-300 hover:border-amber-500 hover:shadow-md transition-all flex items-center gap-3 text-left group cursor-pointer"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold shrink-0 shadow-xs group-hover:scale-105 transition-transform">
            <Camera className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="font-bold text-charcoal-900 text-xs sm:text-sm flex items-center gap-1">
              {t.dashboard.scanBillBtn}
              <span className="text-[9px] bg-amber-100 text-amber-800 px-1 py-0.2 rounded font-bold">AI</span>
            </div>
            <div className="text-[11px] text-charcoal-700 hidden sm:block">{t.dashboard.scanBillSubtitle}</div>
          </div>
        </button>

        <button
          onClick={() => setIsPaymentModalOpen(true)}
          className="p-3.5 sm:p-4 bg-white rounded-2xl border border-warm-300 hover:border-forest-500 hover:shadow-md transition-all flex items-center gap-3 text-left group cursor-pointer"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0 shadow-xs group-hover:scale-105 transition-transform">
            <IndianRupee className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="font-bold text-charcoal-900 text-xs sm:text-sm">{t.dashboard.recordPaymentBtn}</div>
            <div className="text-[11px] text-charcoal-700 hidden sm:block">{t.dashboard.recordPaymentSubtitle}</div>
          </div>
        </button>

        <button
          onClick={() => navigate('/profit-coach')}
          className="p-3.5 sm:p-4 bg-white rounded-2xl border border-warm-300 hover:border-[#176B45] hover:shadow-md transition-all flex items-center gap-3 text-left group cursor-pointer"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold shrink-0 shadow-xs group-hover:scale-105 transition-transform">
            <LineChart className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <div className="font-bold text-charcoal-900 text-xs sm:text-sm">{t.dashboard.profitCoachBtn}</div>
            <div className="text-[11px] text-charcoal-700 hidden sm:block">{t.dashboard.profitCoachSubtitle}</div>
          </div>
        </button>
      </div>

      {/* 3. Received and Pending Payments Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 bg-white border-warm-300">
          <div className="text-xs text-charcoal-700 font-medium">{t.dashboard.totalGrossTitle}</div>
          <div className="text-2xl font-extrabold text-charcoal-900 mt-1">
            ₹{summary ? parseFloat(String(summary.total_gross_amount)).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
          </div>
          <div className="text-xs text-charcoal-700 mt-1">
            {summary?.total_sales_count || 0} {t.dashboard.salesCountUnit}
          </div>
        </Card>

        <Card className="p-5 bg-white border-warm-300">
          <div className="text-xs text-forest-700 font-medium">{t.dashboard.receivedInflowTitle}</div>
          <div className="text-2xl font-extrabold text-forest-700 mt-1">
            ₹{summary ? parseFloat(String(summary.total_received)).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
          </div>
          <div className="text-xs text-forest-700 font-medium mt-1">
            {summary?.settled_sales_count || 0} {t.dashboard.settledCountUnit}
          </div>
        </Card>

        <Card className="p-5 bg-amber-50 border-amber-200">
          <div className="flex items-center justify-between">
            <span className="text-xs text-amber-900 font-bold">{t.dashboard.outstandingBalanceTitle}</span>
            <button
              onClick={() => navigate('/profit-coach')}
              className="text-[11px] font-bold text-amber-900 underline flex items-center gap-0.5 hover:text-amber-950"
            >
              {t.dashboard.detailsAction} <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="text-2xl font-extrabold text-amber-800 mt-1">
            ₹{summary ? parseFloat(String(summary.total_outstanding)).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
          </div>
          <div className="text-xs text-amber-800 font-medium mt-1">
            {summary?.pending_sales_count || 0} {t.dashboard.pendingCountUnit}
          </div>
        </Card>
      </div>

      {/* 4. Live Mandi Prices Strip */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-xl font-bold text-charcoal-900">
              {t.dashboard.liveMandiTitle}
            </h2>
            <span className="text-xs text-charcoal-700 hidden sm:inline">{t.dashboard.agmarknetDaily}</span>
          </div>
          <button
            onClick={() => navigate('/mandi-intelligence')}
            className="text-xs sm:text-sm font-bold text-forest-700 hover:text-forest-800 flex items-center gap-1 cursor-pointer"
          >
            {t.dashboard.viewAllPrices} <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {prices.slice(0, 4).map((p) => (
            <Card key={p.id} className="p-4 hover:border-forest-400 transition-all shadow-xs">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-charcoal-900">{p.market_name}</span>
                <span className="text-[11px] bg-forest-50 text-forest-700 font-medium px-2 py-0.5 rounded">
                  {p.district}
                </span>
              </div>
              <div className="text-xs text-charcoal-700">{p.commodity} ({p.variety})</div>
              <div className="text-xl font-bold text-forest-800 mt-2">
                ₹{parseFloat(String(p.modal_price)).toLocaleString('en-IN')}{' '}
                <span className="text-xs font-normal text-charcoal-700">{t.dashboard.perQuintal}</span>
              </div>
              <div className="text-[11px] text-charcoal-700 mt-2 pt-2 border-t border-warm-300 flex justify-between">
                <span>{t.dashboard.minPriceLabel}: ₹{parseFloat(String(p.min_price))}</span>
                <span>{t.dashboard.maxPriceLabel}: ₹{parseFloat(String(p.max_price))}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* 5. Recent Transactions */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-charcoal-900">
            {t.dashboard.recentTransactions}
          </h2>
          <button
            onClick={() => navigate('/transactions')}
            className="text-xs sm:text-sm font-bold text-forest-700 hover:text-forest-800 flex items-center gap-1 cursor-pointer"
          >
            {t.dashboard.viewAllRecords} <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {sales.length === 0 ? (
          <Card className="text-center py-8">
            <p className="text-sm text-charcoal-700">{t.dashboard.noRecentTransactions}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSaleModalOpen(true)}
              className="mt-3"
            >
              <Plus className="w-4 h-4 mr-1.5" /> {t.dashboard.firstSaleAction}
            </Button>
          </Card>
        ) : (
          <div className="flex flex-col gap-2.5">
            {sales.slice(0, 3).map((s) => {
              const net = parseFloat(String(s.net_receivable));
              const outstanding = parseFloat(String(s.outstanding_balance));
              return (
                <Card key={s.id} className="p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-forest-100 text-forest-700 flex items-center justify-center font-bold">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-sm sm:text-base text-charcoal-900">
                        {s.commodity} • {s.quantity} {s.quantity_unit}
                      </div>
                      <div className="text-xs text-charcoal-700">
                        {t.dashboard.traderLabel} <strong>{s.trader_name}</strong> • {s.sale_date}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-sm sm:text-base text-charcoal-900">
                      ₹{net.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs">
                      {outstanding > 0 ? (
                        <span className="font-bold text-amber-800">{t.dashboard.outstandingLabel} ₹{outstanding.toLocaleString('en-IN')}</span>
                      ) : (
                        <span className="font-semibold text-emerald-700">{t.dashboard.settledLabel}</span>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* 6. Harvest Produce Lots Management */}
      <div className="pt-2">
        <SellingLotsManager />
      </div>

      {/* Modals */}
      <RecordSaleModal
        isOpen={isSaleModalOpen}
        onClose={() => {
          setIsSaleModalOpen(false);
          setPrefillSaleData(null);
        }}
        onSuccess={loadDashboardData}
        prefillData={prefillSaleData}
      />

      <RecordPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSuccess={loadDashboardData}
        sales={sales}
      />

      <DocumentScanModal
        isOpen={isDocScanModalOpen}
        onClose={() => setIsDocScanModalOpen(false)}
        onConfirmAsSale={(data) => {
          setPrefillSaleData(data);
          setIsSaleModalOpen(true);
        }}
      />
    </div>
  );
};
