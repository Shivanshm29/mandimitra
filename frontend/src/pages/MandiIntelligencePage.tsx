import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../app/LanguageContext';
import { mandiService } from '../services/mandiService';
import { farmerService } from '../services/farmerService';
import type { MarketPrice, PriceAlert } from '../types/mandi';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { VoiceDictationButton } from '../components/VoiceDictationButton';
import {
  TrendingUp,
  Search,
  Calendar,
  ShieldCheck,
  MapPin,
  RefreshCw,
  Bell,
  BellRing,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  Leaf,
} from 'lucide-react';

export const MandiIntelligencePage: React.FC = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [commodities, setCommodities] = useState<string[]>([]);
  const [farmerCrops, setFarmerCrops] = useState<string[]>([]);
  const [selectedCommodity, setSelectedCommodity] = useState<string>('Onion');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Price Alerts & Watchlist state
  const [activeTab, setActiveTab] = useState<'prices' | 'alerts'>('prices');
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [alertTargetPrice, setAlertTargetPrice] = useState('');
  const [alertCondition, setAlertCondition] = useState<'ABOVE' | 'BELOW'>('ABOVE');
  const [alertMarket, setAlertMarket] = useState('');
  const [alertCommodity, setAlertCommodity] = useState('Onion');
  const [alertLoading, setAlertLoading] = useState(false);
  const [alertError, setAlertError] = useState<string | null>(null);

  const isMarathi = language === 'mr-IN';
  const isHindi = language === 'hi-IN';

  const loadData = async () => {
    try {
      setLoading(true);
      const [comms, rates, alertsData] = await Promise.all([
        mandiService.getCommodities(),
        mandiService.getPrices({
          commodity: selectedCommodity || undefined,
          district: selectedDistrict || undefined,
        }),
        mandiService.getPriceAlerts().catch(() => []),
      ]);
      setCommodities(comms);
      setPrices(rates);
      setAlerts(alertsData);
    } catch (err) {
      console.error('Failed to load mandi data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load farmer profile on mount to personalize crops
  useEffect(() => {
    farmerService
      .getProfile()
      .then((p) => {
        if (p.commonly_grown_crops && Array.isArray(p.commonly_grown_crops) && p.commonly_grown_crops.length > 0) {
          const cropNames = p.commonly_grown_crops.map((c: any) =>
            typeof c === 'string' ? c : c.commodity
          );
          setFarmerCrops(cropNames);
          // If current selection is default and farmer has crops, prefer farmer's first crop
          if (cropNames[0]) {
            setSelectedCommodity(cropNames[0]);
          }
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadData();
  }, [selectedCommodity, selectedDistrict]);

  const filteredPrices = prices.filter((p) =>
    searchQuery
      ? p.market_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.district.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  const handleOpenAlertModal = (marketName?: string, commodity?: string, currentModal?: number) => {
    setAlertCommodity(commodity || selectedCommodity || 'Onion');
    setAlertMarket(marketName || '');
    setAlertTargetPrice(currentModal ? String(Math.round(currentModal * 1.05)) : '');
    setAlertCondition('ABOVE');
    setAlertError(null);
    setIsAlertModalOpen(true);
  };

  const handleSaveAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    setAlertError(null);
    const target = parseFloat(alertTargetPrice);
    if (!target || target <= 0) {
      setAlertError('कृपया योग्य लक्ष्य दर भरा.');
      return;
    }

    try {
      setAlertLoading(true);
      const newAlert = await mandiService.createPriceAlert({
        commodity: alertCommodity,
        target_modal_price: target,
        condition: alertCondition,
        market_name: alertMarket.trim() || undefined,
      });
      setAlerts((prev) => [newAlert, ...prev]);
      setIsAlertModalOpen(false);
    } catch (err: any) {
      setAlertError(err.message || 'सूचना जतन करताना त्रुटी आली.');
    } finally {
      setAlertLoading(false);
    }
  };

  const handleDeleteAlert = async (id: number) => {
    try {
      await mandiService.deletePriceAlert(id);
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error('Failed to delete alert:', err);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-warm-300 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs bg-forest-100 text-forest-700 font-bold px-2.5 py-0.5 rounded-full">
              {t.mandi.govVerifiedBadge}
            </span>
            <span className="text-xs text-charcoal-700 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-forest-600" /> AGMARKNET Verified
            </span>
          </div>
          <h1 className="text-2xl font-bold text-charcoal-900">
            {t.mandi.title}
          </h1>
          <p className="text-xs sm:text-sm text-charcoal-700 mt-0.5">
            {t.mandi.subtitle}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <Button
            variant="primary"
            onClick={() => navigate('/selling-recommendations')}
            className="text-xs sm:text-sm min-h-[42px] font-bold shadow-xs"
          >
            <Sparkles className="w-4 h-4 mr-1.5 text-mustard-400" />
            {language === 'mr-IN' ? 'विक्री शिफारशी पहा' : language === 'hi-IN' ? 'बिक्री सलाह देखें' : 'Selling Recommendations'}
          </Button>

          <Button
            variant="outline"
            onClick={() => handleOpenAlertModal()}
            className="text-xs sm:text-sm min-h-[42px] border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-100 font-semibold"
          >
            <Bell className="w-4 h-4 mr-1.5 text-amber-700" />
            {t.mandi.setAlertBtn}
          </Button>

          <button
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-warm-200 hover:bg-warm-300 rounded-xl text-xs sm:text-sm font-semibold text-charcoal-800 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {t.mandi.refreshBtn}
          </button>
        </div>
      </div>

      {/* Tabs: Live Prices vs Price Alerts */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl w-full sm:w-fit">
        <button
          onClick={() => setActiveTab('prices')}
          className={`flex-1 sm:flex-none px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition ${
            activeTab === 'prices' ? 'bg-white shadow text-[#176B45]' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <TrendingUp className="w-4 h-4 inline mr-1.5" />
          {t.mandi.livePricesTab}
        </button>
        <button
          onClick={() => setActiveTab('alerts')}
          className={`flex-1 sm:flex-none px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition relative ${
            activeTab === 'alerts' ? 'bg-white shadow text-[#176B45]' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <BellRing className="w-4 h-4 inline mr-1.5 text-amber-600" />
          {t.mandi.alertsTab}
          {alerts.length > 0 && (
            <span className="ml-1.5 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold">
              {alerts.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: LIVE PRICES */}
      {activeTab === 'prices' && (
        <div className="space-y-6">
          {/* Filter and Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-warm-300 shadow-xs flex flex-col md:flex-row gap-3 items-center">
            {/* Commodity Chips */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 no-scrollbar">
              {commodities.map((c) => {
                const isFarmerCrop = farmerCrops.includes(c);
                return (
                  <button
                    key={c}
                    onClick={() => setSelectedCommodity(c)}
                    className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                      selectedCommodity === c
                        ? 'bg-[#176B45] text-white shadow-xs'
                        : isFarmerCrop
                        ? 'bg-emerald-50 text-emerald-900 border border-emerald-300 hover:bg-emerald-100'
                        : 'bg-warm-200 text-charcoal-800 hover:bg-warm-300'
                    }`}
                  >
                    {isFarmerCrop && <Leaf className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                    <span>
                      {c === 'Onion'
                        ? 'कांदा (Onion)'
                        : c === 'Soybean'
                        ? 'सोयाबीन (Soybean)'
                        : c === 'Tomato'
                        ? 'टोमॅटो (Tomato)'
                        : c === 'Cotton'
                        ? 'कापूस (Cotton)'
                        : c === 'Wheat'
                        ? 'गहू (Wheat)'
                        : c}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto md:ml-auto">
              {/* District Filter */}
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="min-h-[42px] px-3 rounded-xl border border-warm-400 bg-white text-xs sm:text-sm font-medium text-charcoal-800"
              >
                <option value="">{t.mandi.allDistricts}</option>
                <option value="Nashik">नाशिक (Nashik)</option>
                <option value="Pune">पुणे (Pune)</option>
                <option value="Solapur">सोलापूर (Solapur)</option>
                <option value="Nagpur">नागपूर (Nagpur)</option>
                <option value="Ahmednagar">अहमदनगर (Ahmednagar)</option>
              </select>

              {/* Search box with Voice Dictation */}
              <div className="relative flex-1 sm:w-56">
                <Search className="w-4 h-4 absolute left-3 top-3 text-charcoal-700" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.mandi.searchPlaceholder}
                  className="w-full min-h-[42px] pl-9 pr-9 rounded-xl border border-warm-400 bg-white text-xs sm:text-sm focus:outline-none focus:border-forest-600"
                />
                <div className="absolute right-1 top-1">
                  <VoiceDictationButton
                    onTranscript={(txt) => setSearchQuery(txt)}
                    title={t.mandi.voiceSearchTooltip}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Mandi Rate Cards Grid */}
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-4 border-forest-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-medium text-charcoal-700">{t.common.loading}</p>
            </div>
          ) : filteredPrices.length === 0 ? (
            <Card className="text-center py-12">
              <p className="text-charcoal-700 text-sm">{t.mandi.noPricesFound}</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {filteredPrices.map((item) => (
                <Card key={item.id} className="flex flex-col justify-between hover:border-forest-400 transition-all shadow-sm">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="font-bold text-base sm:text-lg text-charcoal-900 leading-tight">
                          {item.market_name}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs text-charcoal-700 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-forest-600" />
                          <span>{item.district}, {t.common.maharashtra}</span>
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold bg-forest-50 text-forest-700 px-2 py-0.5 rounded-md border border-forest-200 shrink-0">
                        {item.variety}
                      </span>
                    </div>

                    {/* Big Modal Price Display */}
                    <div className="my-4 p-4 rounded-2xl bg-warm-100 border border-warm-300">
                      <div className="text-xs text-charcoal-700 font-medium">{t.mandi.modalPrice}:</div>
                      <div className="text-2xl sm:text-3xl font-extrabold text-forest-800 tracking-tight mt-0.5">
                        ₹{parseFloat(String(item.modal_price)).toLocaleString('en-IN')}{' '}
                        <span className="text-xs font-semibold text-charcoal-700">{t.dashboard.perQuintal}</span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-charcoal-700 mt-3 pt-2.5 border-t border-warm-300/80">
                        <div>
                          {t.mandi.minPrice}: <strong className="text-charcoal-900">₹{parseFloat(String(item.min_price)).toLocaleString('en-IN')}</strong>
                        </div>
                        <div>
                          {t.mandi.maxPrice}: <strong className="text-charcoal-900">₹{parseFloat(String(item.max_price)).toLocaleString('en-IN')}</strong>
                        </div>
                      </div>
                    </div>

                    {item.arrivals_volume && (
                      <div className="text-xs text-charcoal-700 flex items-center justify-between mb-3 px-1">
                        <span>{t.mandi.arrivals}:</span>
                        <strong className="text-charcoal-900">{parseFloat(String(item.arrivals_volume)).toLocaleString('en-IN')} Qtl</strong>
                      </div>
                    )}
                  </div>

                  {/* Card Footer with Quick Set Alert Action & Transparency Timestamp */}
                  <div className="pt-3 border-t border-warm-300 flex items-center justify-between text-[11px] text-charcoal-700">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {item.arrival_date}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => navigate('/selling-recommendations')}
                        className="inline-flex items-center gap-1 font-bold text-amber-800 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 px-2 py-1 rounded-lg border border-amber-200 transition"
                        title="Get selling recommendation for this produce"
                      >
                        <Sparkles className="w-3 h-3 text-amber-600" />
                        <span>सल्ला</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenAlertModal(item.market_name, item.commodity, Number(item.modal_price))}
                        className="inline-flex items-center gap-1 font-semibold text-[#176B45] hover:text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 transition"
                      >
                        <Bell className="w-3 h-3 text-[#176B45]" />
                        <span>{t.mandi.setAlertBtn}</span>
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PRICE ALERTS & WATCHLIST */}
      {activeTab === 'alerts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {t.mandi.activeAlertsTitle}
              </h2>
              <p className="text-xs text-gray-600">
                {t.mandi.activeAlertsSubtitle}
              </p>
            </div>
            <Button
              variant="primary"
              onClick={() => handleOpenAlertModal()}
              className="bg-[#176B45] text-white min-h-[40px]"
            >
              <Plus className="w-4 h-4 mr-1.5" />
              {t.mandi.createFirstAlert}
            </Button>
          </div>

          {alerts.length === 0 ? (
            <Card className="text-center py-12 flex flex-col items-center justify-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <BellRing className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-gray-900">{t.mandi.noAlertsFound}</h3>
              <p className="text-xs text-gray-600 max-w-sm">
                {t.mandi.noAlertsDesc}
              </p>
              <Button
                variant="primary"
                onClick={() => handleOpenAlertModal()}
                className="mt-2 bg-[#176B45] text-white"
              >
                <Plus className="w-4 h-4 mr-1.5" /> {t.mandi.createFirstAlert}
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {alerts.map((alert) => (
                <Card key={alert.id} className="p-4 border-warm-300 relative hover:border-amber-400 transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold">
                        <Bell className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-base">{alert.commodity}</h4>
                        <p className="text-xs text-gray-500">
                          {alert.market_name ? `मंडी: ${alert.market_name}` : 'सर्व महाराष्ट्र मंड्या'}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDeleteAlert(alert.id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="हटवा (Delete)"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="mt-3 p-3 bg-warm-100 rounded-xl flex items-center justify-between">
                    <span className="text-xs text-charcoal-700">लक्ष्य दर:</span>
                    <strong className="text-sm sm:text-base font-extrabold text-forest-800">
                      {alert.condition === 'ABOVE' ? '≥' : '≤'} ₹{parseFloat(String(alert.target_modal_price)).toLocaleString('en-IN')} / Qtl
                    </strong>
                  </div>

                  <div className="mt-2.5 flex items-center justify-between text-[11px] text-gray-500">
                    <Badge variant="success" className="text-[10px]">सक्रिय (Active)</Badge>
                    <span>तारीख: {new Date(alert.created_at).toLocaleDateString('en-IN')}</span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Alert Modal */}
      {isAlertModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-warm-300 relative">
            <button
              onClick={() => setIsAlertModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-gray-500 hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <BellRing className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {isMarathi ? 'नवीन किंमत सूचना लावा' : 'Set Mandi Price Alert'}
                </h3>
                <p className="text-xs text-gray-600">
                  दर ठरवलेल्या पातळीवर आल्यावर सूचना प्राप्त करा
                </p>
              </div>
            </div>

            {alertError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{alertError}</span>
              </div>
            )}

            <form onSubmit={handleSaveAlert} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">शेतमाल / Commodity *</label>
                <select
                  value={alertCommodity}
                  onChange={(e) => setAlertCommodity(e.target.value)}
                  className="w-full min-h-[46px] px-3.5 py-2 rounded-xl border border-warm-400 bg-white text-sm font-medium"
                >
                  {commodities.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">मंडी / बाजार समिती (ऐच्छिक)</label>
                <input
                  type="text"
                  value={alertMarket}
                  onChange={(e) => setAlertMarket(e.target.value)}
                  placeholder="उदा. Lasalgaon किंवा रिकामे ठेवा (सर्व मंड्या)"
                  className="w-full min-h-[46px] px-3.5 py-2 rounded-xl border border-warm-400 bg-white text-sm font-medium focus:outline-none focus:border-[#176B45]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">अट / Condition</label>
                  <select
                    value={alertCondition}
                    onChange={(e) => setAlertCondition(e.target.value as 'ABOVE' | 'BELOW')}
                    className="w-full min-h-[46px] px-3 py-2 rounded-xl border border-warm-400 bg-white text-xs font-medium"
                  >
                    <option value="ABOVE">दर यापेक्षा जास्त (≥)</option>
                    <option value="BELOW">दर यापेक्षा कमी (≤)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">लक्ष्य दर (₹/Qtl) *</label>
                  <input
                    type="number"
                    step="1"
                    value={alertTargetPrice}
                    onChange={(e) => setAlertTargetPrice(e.target.value)}
                    placeholder="उदा. 2600"
                    required
                    className="w-full min-h-[46px] px-3.5 py-2 rounded-xl border border-warm-400 bg-white text-sm font-bold focus:outline-none focus:border-[#176B45]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsAlertModalOpen(false)}
                >
                  {isMarathi ? 'रद्द करा' : 'Cancel'}
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={alertLoading}
                  className="bg-[#176B45] text-white"
                >
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  {isMarathi ? 'सूचना सेव्ह करा' : 'Save Alert'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
