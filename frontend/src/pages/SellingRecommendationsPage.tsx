import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../app/LanguageContext';
import { mandiService } from '../services/mandiService';
import { lotService } from '../services/lotService';
import { harvestService } from '../services/harvestService';
import { farmerService } from '../services/farmerService';
import type { RecommendationResponse, RecommendationItem } from '../types/mandi';
import type { SellingLot } from '../types/lot';
import type { HarvestRecord } from '../types/harvest';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Badge } from '../components/Badge';
import { RecordSaleModal } from '../components/RecordSaleModal';
import {
  Sparkles,
  Trophy,
  ArrowUpRight,
  ShieldCheck,
  MapPin,
  IndianRupee,
  Info,
  Calendar,
  Layers,
  CheckCircle2,
  SlidersHorizontal,
  ChevronRight,
  PlusCircle,
  Truck,
  Building2,
  TrendingUp,
} from 'lucide-react';

export const SellingRecommendationsPage: React.FC = () => {
  const { t, language } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Data states
  const [lots, setLots] = useState<SellingLot[]>([]);
  const [harvests, setHarvests] = useState<HarvestRecord[]>([]);
  const [farmerDistrict, setFarmerDistrict] = useState<string>('Nashik');
  const [dataLoaded, setDataLoaded] = useState<boolean>(false);

  // Selection mode: 'lot' | 'harvest' | 'manual'
  const [selectionMode, setSelectionMode] = useState<'lot' | 'harvest' | 'manual'>('manual');
  const [selectedLotId, setSelectedLotId] = useState<number | null>(null);
  const [selectedHarvestId, setSelectedHarvestId] = useState<number | null>(null);

  // Form values
  const [commodity, setCommodity] = useState<string>('Onion');
  const [quantity, setQuantity] = useState<string>('50');
  const [variety, setVariety] = useState<string>('Red');
  const [qualityGrade, setQualityGrade] = useState<string>('Grade A');
  const [sortBy, setSortBy] = useState<'price' | 'location' | 'date'>('price');

  // Loading & Results
  const [loading, setLoading] = useState<boolean>(false);
  const [recommendation, setRecommendation] = useState<RecommendationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sale Modal state
  const [isRecordSaleOpen, setIsRecordSaleOpen] = useState<boolean>(false);
  const [salePrefillData, setSalePrefillData] = useState<any>(null);

  // Load initial farmer data, harvests, and lots
  useEffect(() => {
    let isMounted = true;
    async function loadFarmerContext() {
      try {
        const [lotsRes, harvestsRes, profileRes] = await Promise.all([
          lotService.getLots().catch(() => []),
          harvestService.getHarvests().catch(() => []),
          farmerService.getProfile().catch(() => null),
        ]);

        if (!isMounted) return;

        const activeLots = lotsRes.filter((l) => Number(l.available_quantity) > 0);
        const activeHarvests = harvestsRes.filter((h) => Number(h.remaining_quantity) > 0);

        setLots(activeLots);
        setHarvests(activeHarvests);
        if (profileRes?.district) {
          setFarmerDistrict(profileRes.district);
        }

        // Check query parameters
        const queryLotId = searchParams.get('lotId');
        const queryHarvestId = searchParams.get('harvestId');

        if (queryLotId) {
          const foundLot = activeLots.find((l) => l.id === Number(queryLotId));
          if (foundLot) {
            setSelectionMode('lot');
            setSelectedLotId(foundLot.id);
            setCommodity(foundLot.commodity);
            setQuantity(String(foundLot.available_quantity));
            setVariety(foundLot.variety || 'Standard');
            setQualityGrade(foundLot.quality_grade || 'Standard');
            setDataLoaded(true);
            return;
          }
        }

        if (queryHarvestId) {
          const foundHarvest = activeHarvests.find((h) => h.id === Number(queryHarvestId));
          if (foundHarvest) {
            setSelectionMode('harvest');
            setSelectedHarvestId(foundHarvest.id);
            setCommodity(foundHarvest.commodity);
            setQuantity(String(foundHarvest.remaining_quantity));
            setVariety(foundHarvest.variety || 'Standard');
            setQualityGrade(foundHarvest.quality_grade || 'Standard');
            setDataLoaded(true);
            return;
          }
        }

        // Default to first active lot if available, otherwise first harvest, otherwise manual
        if (activeLots.length > 0) {
          const firstLot = activeLots[0];
          setSelectionMode('lot');
          setSelectedLotId(firstLot.id);
          setCommodity(firstLot.commodity);
          setQuantity(String(firstLot.available_quantity));
          setVariety(firstLot.variety || 'Standard');
          setQualityGrade(firstLot.quality_grade || 'Standard');
        } else if (activeHarvests.length > 0) {
          const firstHarvest = activeHarvests[0];
          setSelectionMode('harvest');
          setSelectedHarvestId(firstHarvest.id);
          setCommodity(firstHarvest.commodity);
          setQuantity(String(firstHarvest.remaining_quantity));
          setVariety(firstHarvest.variety || 'Standard');
          setQualityGrade(firstHarvest.quality_grade || 'Standard');
        } else {
          setSelectionMode('manual');
        }

        setDataLoaded(true);
      } catch (err) {
        console.error('Failed to load farmer context:', err);
        if (isMounted) setDataLoaded(true);
      }
    }

    loadFarmerContext();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch recommendations whenever relevant params change
  const fetchRecommendations = useCallback(async () => {
    const qtyNum = parseFloat(quantity);
    if (!commodity || !qtyNum || qtyNum <= 0) return;

    try {
      setLoading(true);
      setError(null);
      const res = await mandiService.getRecommendations({
        commodity,
        quantity: qtyNum,
        variety: variety || 'Standard',
        quality_grade: qualityGrade || undefined,
        lot_id: selectionMode === 'lot' && selectedLotId ? selectedLotId : undefined,
        harvest_id: selectionMode === 'harvest' && selectedHarvestId ? selectedHarvestId : undefined,
        farmer_district: farmerDistrict || undefined,
        sort_by: sortBy,
      });
      setRecommendation(res);
    } catch (err: any) {
      console.error('Failed to get recommendation:', err);
      setError(err?.message || 'शिफारशी आणताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.');
    } finally {
      setLoading(false);
    }
  }, [commodity, quantity, variety, qualityGrade, selectionMode, selectedLotId, selectedHarvestId, farmerDistrict, sortBy]);

  // Trigger recommendations when data is loaded and inputs change
  useEffect(() => {
    if (dataLoaded) {
      fetchRecommendations();
    }
  }, [dataLoaded, fetchRecommendations]);

  // Handler for selecting a SellingLot
  const handleSelectLot = (lot: SellingLot) => {
    setSelectionMode('lot');
    setSelectedLotId(lot.id);
    setSelectedHarvestId(null);
    setCommodity(lot.commodity);
    setQuantity(String(lot.available_quantity));
    setVariety(lot.variety || 'Standard');
    setQualityGrade(lot.quality_grade || 'Standard');
    setSearchParams({ lotId: String(lot.id) });
  };

  // Handler for selecting a HarvestRecord
  const handleSelectHarvest = (harvest: HarvestRecord) => {
    setSelectionMode('harvest');
    setSelectedHarvestId(harvest.id);
    setSelectedLotId(null);
    setCommodity(harvest.commodity);
    setQuantity(String(harvest.remaining_quantity));
    setVariety(harvest.variety || 'Standard');
    setQualityGrade(harvest.quality_grade || 'Standard');
    setSearchParams({ harvestId: String(harvest.id) });
  };

  // Handler for switching to manual exploration
  const handleSwitchToManual = () => {
    setSelectionMode('manual');
    setSelectedLotId(null);
    setSelectedHarvestId(null);
    setSearchParams({});
  };

  // Handler for opening sale recording modal directly
  const handleOpenSaleModal = (item: RecommendationItem) => {
    setSalePrefillData({
      market_name: item.market_name,
      commodity: recommendation?.commodity || commodity,
      variety: recommendation?.variety || variety,
      quantity: recommendation?.quantity || quantity,
      rate_per_unit: item.modal_price,
      lot_id: selectedLotId || undefined,
    });
    setIsRecordSaleOpen(true);
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-forest-800 via-forest-700 to-emerald-800 p-6 sm:p-8 rounded-3xl text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-mustard-400" />
          <span className="text-xs uppercase tracking-wide font-bold text-mustard-400">
            {t.recommendations.badgeAdvisor}
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          {t.recommendations.title}
        </h1>
        <p className="text-forest-100 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
          {t.recommendations.subtitle}
        </p>

        {/* Current Active Farmer Context Indicator */}
        <div className="mt-4 pt-3 border-t border-forest-600/60 flex flex-wrap items-center gap-4 text-xs text-forest-100">
          <span className="flex items-center gap-1.5 font-medium">
            <MapPin className="w-4 h-4 text-mustard-400" />
            नोंदणीकृत जिल्हा: <strong className="text-white">{farmerDistrict}</strong>
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            AGMARKNET व MSAMB अधिकृत बाजारभाव
          </span>
        </div>
      </div>

      {/* LOT SELECTOR BAR: Context-Aware Harvest Lot Selector */}
      <Card className="p-4 sm:p-5 shadow-xs border-forest-200 bg-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-forest-700" />
            <h2 className="text-base font-bold text-gray-900">
              {t.recommendations.selectHarvestLot}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSwitchToManual}
              className={`text-xs px-3 py-1.5 rounded-xl font-semibold transition border ${
                selectionMode === 'manual'
                  ? 'bg-forest-800 text-white border-forest-800'
                  : 'bg-warm-100 text-gray-700 border-warm-300 hover:bg-warm-200'
              }`}
            >
              {t.recommendations.manualExplore}
            </button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/selling-lots')}
              className="text-xs font-semibold"
            >
              <PlusCircle className="w-3.5 h-3.5 mr-1 text-forest-700" />
              नवीन माल जोडा
            </Button>
          </div>
        </div>

        {/* Available Lots / Harvests Carousel / Chips */}
        <div className="mt-4">
          {lots.length === 0 && harvests.length === 0 ? (
            <div className="bg-warm-100 p-4 rounded-2xl text-center border border-warm-300">
              <p className="text-xs sm:text-sm font-semibold text-gray-800">
                {t.recommendations.noLotsFound}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {t.recommendations.noLotsDesc}
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
              {/* Selling Lots Chips */}
              {lots.map((lot) => {
                const isSelected = selectionMode === 'lot' && selectedLotId === lot.id;
                return (
                  <button
                    key={`lot-${lot.id}`}
                    type="button"
                    onClick={() => handleSelectLot(lot)}
                    className={`min-w-[200px] sm:min-w-[220px] p-3 rounded-2xl text-left border-2 transition-all flex flex-col justify-between shrink-0 ${
                      isSelected
                        ? 'border-forest-600 bg-forest-50/70 shadow-sm'
                        : 'border-warm-300 bg-white hover:border-forest-300 hover:bg-warm-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                        {lot.lot_code}
                      </span>
                      {isSelected ? (
                        <CheckCircle2 className="w-4 h-4 text-forest-700 shrink-0" />
                      ) : (
                        <span className="text-[10px] text-gray-500 font-medium">लॉट</span>
                      )}
                    </div>
                    <div className="font-bold text-sm text-gray-900 mt-0.5">
                      {lot.commodity}{' '}
                      <span className="text-xs font-normal text-gray-600">
                        ({lot.variety || 'Standard'})
                      </span>
                    </div>
                    <div className="mt-2 text-xs flex items-center justify-between font-semibold text-forest-800">
                      <span>उपलब्ध: {parseFloat(String(lot.available_quantity)).toFixed(1)} Qtl</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">
                        {lot.quality_grade || 'FAQ'}
                      </span>
                    </div>
                  </button>
                );
              })}

              {/* Harvest Records Chips */}
              {harvests.map((h) => {
                const isSelected = selectionMode === 'harvest' && selectedHarvestId === h.id;
                return (
                  <button
                    key={`harvest-${h.id}`}
                    type="button"
                    onClick={() => handleSelectHarvest(h)}
                    className={`min-w-[200px] sm:min-w-[220px] p-3 rounded-2xl text-left border-2 transition-all flex flex-col justify-between shrink-0 ${
                      isSelected
                        ? 'border-forest-600 bg-forest-50/70 shadow-sm'
                        : 'border-warm-300 bg-white hover:border-forest-300 hover:bg-warm-50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                        कापणी नोंद #{h.id}
                      </span>
                      {isSelected ? (
                        <CheckCircle2 className="w-4 h-4 text-forest-700 shrink-0" />
                      ) : (
                        <span className="text-[10px] text-gray-500 font-medium">कापणी साठा</span>
                      )}
                    </div>
                    <div className="font-bold text-sm text-gray-900 mt-0.5">
                      {h.commodity}{' '}
                      <span className="text-xs font-normal text-gray-600">
                        ({h.variety || 'Standard'})
                      </span>
                    </div>
                    <div className="mt-2 text-xs flex items-center justify-between font-semibold text-forest-800">
                      <span>शिल्लक: {parseFloat(String(h.remaining_quantity)).toFixed(1)} Qtl</span>
                      <span className="text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded">
                        {h.quality_grade || 'Grade A'}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Manual Exploration Form (Always available when manual mode or no lots registered) */}
        {(selectionMode === 'manual' || (lots.length === 0 && harvests.length === 0)) && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchRecommendations();
            }}
            className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-4 gap-4 items-end"
          >
            <div className="w-full flex flex-col gap-1.5 text-left">
              <label className="text-xs font-bold text-charcoal-800">
                {t.recommendations.commodityLabel}
              </label>
              <select
                value={commodity}
                onChange={(e) => setCommodity(e.target.value)}
                className="w-full min-h-[46px] px-3.5 py-2.5 rounded-xl border border-warm-400 bg-white text-charcoal-900 font-medium text-sm"
              >
                <option value="Onion">कांदा (Onion)</option>
                <option value="Soybean">सोयाबीन (Soybean)</option>
                <option value="Tomato">टोमॅटो (Tomato)</option>
                <option value="Cotton">कापूस (Cotton)</option>
                <option value="Wheat">गहू (Wheat)</option>
                <option value="Pomegranate">डाळिंब (Pomegranate)</option>
                <option value="Maize">मका (Maize)</option>
              </select>
            </div>

            <Input
              label={t.recommendations.quantityLabel}
              type="number"
              step="0.01"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="50"
              required
            />

            <Input
              label={t.recommendations.varietyLabel}
              value={variety}
              onChange={(e) => setVariety(e.target.value)}
              placeholder="Standard"
            />

            <Button type="submit" variant="primary" size="md" isLoading={loading} className="w-full">
              <Sparkles className="w-4 h-4 mr-2 text-mustard-400" />
              {t.recommendations.findBestRateBtn}
            </Button>
          </form>
        )}
      </Card>

      {/* SORT & FILTER TOOLBAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-forest-700" />
          <span className="text-xs sm:text-sm font-bold text-gray-800">
            {t.recommendations.sortBy}:
          </span>
          <div className="flex gap-1.5 bg-gray-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setSortBy('price')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                sortBy === 'price' ? 'bg-white shadow text-[#176B45]' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t.recommendations.sortByPrice}
            </button>
            <button
              type="button"
              onClick={() => setSortBy('location')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                sortBy === 'location' ? 'bg-white shadow text-[#176B45]' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t.recommendations.sortByLocation}
            </button>
            <button
              type="button"
              onClick={() => setSortBy('date')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                sortBy === 'date' ? 'bg-white shadow text-[#176B45]' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t.recommendations.sortByDate}
            </button>
          </div>
        </div>

        {recommendation && (
          <div className="text-xs text-gray-600">
            तुलना: <strong className="text-gray-900">{recommendation.commodity}</strong> ({recommendation.variety || 'सर्व प्रकार'}) •{' '}
            <strong className="text-gray-900">{recommendation.quantity} Qtl</strong>
          </div>
        )}
      </div>

      {/* ERROR NOTICE */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-2xl text-xs sm:text-sm flex items-center gap-2">
          <Info className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* RECOMMENDATION RESULTS */}
      {loading && !recommendation ? (
        <Card className="text-center py-16">
          <Sparkles className="w-8 h-8 text-forest-600 animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-700">अधिकृत बाजारभाव व शिफारशी विश्लेषित होत आहेत...</p>
        </Card>
      ) : recommendation ? (
        <div className="flex flex-col gap-6">
          {/* TOP 3 HIGHLIGHT CARDS: Best Price, Convenient Local, Best Overall */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Best Reported Price */}
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100/70 border-2 border-emerald-400 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wide px-2.5 py-1 rounded-full bg-emerald-600 text-white flex items-center gap-1 shadow-2xs">
                    <Trophy className="w-3.5 h-3.5 text-mustard-300" />
                    {t.recommendations.bestPriceBadge}
                  </span>
                </div>
                <h3 className="text-lg font-extrabold text-gray-900 mt-2">
                  {recommendation.best_price_market || recommendation.best_market}
                </h3>
                <p className="text-xs text-gray-600 mt-0.5">
                  सर्वोच्च नोंदणीकृत मोडल भाव
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-emerald-200">
                <div className="text-xs text-emerald-900 font-medium">मोडल दर (Modal Rate)</div>
                <div className="text-2xl font-black text-emerald-900">
                  ₹{parseFloat(String(recommendation.best_modal_price)).toLocaleString('en-IN')}{' '}
                  <span className="text-xs font-normal text-gray-600">/ Qtl</span>
                </div>
                <div className="mt-2 text-xs font-bold text-emerald-800">
                  अंदाजे एकूण: ₹{parseFloat(String(recommendation.highest_potential_gross)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            {/* 2. Convenient Market Option (Local Area) */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/70 border-2 border-blue-400 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wide px-2.5 py-1 rounded-full bg-blue-600 text-white flex items-center gap-1 shadow-2xs">
                    <MapPin className="w-3.5 h-3.5 text-blue-200" />
                    {t.recommendations.convenientLocalBadge}
                  </span>
                </div>
                <h3 className="text-lg font-extrabold text-gray-900 mt-2">
                  {recommendation.convenient_market || `${farmerDistrict} मुख्य मंडी`}
                </h3>
                <p className="text-xs text-gray-600 mt-0.5">
                  तुमच्या {farmerDistrict} जिल्ह्यातील स्थानिक पर्याय
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-blue-200">
                {(() => {
                  const localItem = recommendation.recommendations.find((r) => r.is_convenient_local) || recommendation.recommendations[0];
                  return (
                    <div>
                      <div className="text-xs text-blue-900 font-medium">मोडल दर (Modal Rate)</div>
                      <div className="text-2xl font-black text-blue-900">
                        ₹{parseFloat(String(localItem?.modal_price || recommendation.best_modal_price)).toLocaleString('en-IN')}{' '}
                        <span className="text-xs font-normal text-gray-600">/ Qtl</span>
                      </div>
                      <div className="mt-2 text-xs font-bold text-blue-800">
                        अंदाजे एकूण: ₹{parseFloat(String(localItem?.estimated_gross || recommendation.highest_potential_gross)).toLocaleString('en-IN')}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* 3. Best Overall Match */}
            <div className="bg-gradient-to-br from-amber-50 to-amber-100/70 border-2 border-amber-400 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wide px-2.5 py-1 rounded-full bg-amber-600 text-white flex items-center gap-1 shadow-2xs">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                    {t.recommendations.bestOverallBadge}
                  </span>
                </div>
                <h3 className="text-lg font-extrabold text-gray-900 mt-2">
                  {recommendation.best_overall_market || recommendation.best_market}
                </h3>
                <p className="text-xs text-gray-600 mt-0.5">
                  उत्तम भाव, स्थानिक सोय व आवक तरलता यांचा समतोल
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-amber-200">
                {(() => {
                  const overallItem = recommendation.recommendations.find((r) => r.is_best_overall) || recommendation.recommendations[0];
                  return (
                    <div>
                      <div className="text-xs text-amber-900 font-medium">मोडल दर (Modal Rate)</div>
                      <div className="text-2xl font-black text-amber-900">
                        ₹{parseFloat(String(overallItem?.modal_price || recommendation.best_modal_price)).toLocaleString('en-IN')}{' '}
                        <span className="text-xs font-normal text-gray-600">/ Qtl</span>
                      </div>
                      <div className="mt-2 text-xs font-bold text-amber-900">
                        अंदाजे एकूण: ₹{parseFloat(String(overallItem?.estimated_gross || recommendation.highest_potential_gross)).toLocaleString('en-IN')}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>

          {/* AI Reasoning Summary Banner */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-forest-200 shadow-xs flex items-start gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-forest-100 text-forest-800 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wide text-forest-800">
                {t.recommendations.reasoningTitle}
              </h4>
              <p className="text-xs sm:text-sm text-gray-800 mt-1 leading-relaxed">
                {recommendation.reasoning}
              </p>
            </div>
          </div>

          {/* FULL COMPARISON LIST: Itemized Ranked Mandi Cards */}
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-forest-700" />
              सर्व उपलब्ध मंड्यांची क्रमवारी व अंदाज (Ranked Market Analysis)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendation.recommendations.map((item) => (
                <Card
                  key={item.market_name}
                  className={`flex flex-col justify-between border-2 transition-all p-5 hover:shadow-md ${
                    item.is_best_price
                      ? 'border-emerald-500 bg-white'
                      : item.is_convenient_local
                      ? 'border-blue-400 bg-white'
                      : 'border-warm-300 bg-white'
                  }`}
                >
                  <div>
                    {/* Top Badges & Market Name */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                          <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs ${
                            item.rank === 1 ? 'bg-forest-700 text-white' : 'bg-gray-200 text-gray-800'
                          }`}>
                            #{item.rank}
                          </span>

                          {item.is_best_price && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                              सर्वोत्तम भाव
                            </span>
                          )}

                          {item.is_convenient_local && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-300">
                              स्थानिक मंडी
                            </span>
                          )}

                          {item.is_best_overall && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                              संतुलित निवड
                            </span>
                          )}
                        </div>

                        <h4 className="font-extrabold text-base sm:text-lg text-gray-900 leading-snug">
                          {item.market_name}
                        </h4>
                        <div className="flex items-center gap-1 text-xs text-gray-600 mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-forest-600 shrink-0" />
                          <span>{item.district}, {t.common.maharashtra}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-semibold block">
                          {item.data_source}
                        </span>
                        <span className="text-[10px] text-gray-500 mt-1 block">
                          {item.arrival_date}
                        </span>
                      </div>
                    </div>

                    {/* Price and Gross Box */}
                    <div className="my-3 p-3.5 bg-warm-100 rounded-2xl flex flex-col gap-2.5">
                      <div className="flex items-baseline justify-between">
                        <div>
                          <div className="text-[11px] text-gray-600 font-medium">मोडल भाव (Modal)</div>
                          <div className="text-xl font-black text-forest-800">
                            ₹{parseFloat(String(item.modal_price)).toLocaleString('en-IN')}{' '}
                            <span className="text-xs font-normal text-gray-600">/ Qtl</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-[11px] text-gray-600 font-medium">
                            {t.recommendations.grossRealization}
                          </div>
                          <div className="text-xl font-black text-charcoal-900">
                            ₹{parseFloat(String(item.estimated_gross)).toLocaleString('en-IN')}
                          </div>
                        </div>
                      </div>

                      {/* Potential Gross Range */}
                      {item.min_estimated_gross && item.max_estimated_gross && (
                        <div className="pt-2 border-t border-warm-300/80 flex items-center justify-between text-[11px] text-gray-600">
                          <span>{t.recommendations.grossRange}:</span>
                          <strong className="text-gray-900 font-mono">
                            ₹{parseFloat(String(item.min_estimated_gross)).toLocaleString('en-IN')} – ₹{parseFloat(String(item.max_estimated_gross)).toLocaleString('en-IN')}
                          </strong>
                        </div>
                      )}

                      {/* Min-Max and Arrivals Spread */}
                      <div className="flex items-center justify-between text-[11px] text-gray-600">
                        <span>किमान: ₹{parseFloat(String(item.min_price))} • कमाल: ₹{parseFloat(String(item.max_price))}</span>
                        {item.arrivals_volume && (
                          <span>आवक: <strong>{parseFloat(String(item.arrivals_volume)).toLocaleString('en-IN')} Qtl</strong></span>
                        )}
                      </div>
                    </div>

                    {/* Recommendation Reason */}
                    <p className="text-xs text-gray-700 bg-forest-50/60 p-2.5 rounded-xl border border-forest-100 leading-relaxed mb-3">
                      <strong>विश्लेषण:</strong> {item.recommendation_reason}
                    </p>
                  </div>

                  {/* Card Actions: Sell at this Mandi */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                    {parseFloat(String(item.price_difference_per_quintal)) > 0 ? (
                      <span className="text-xs text-amber-800 font-semibold">
                        -₹{parseFloat(String(item.price_difference_per_quintal))}/Qtl फरक
                      </span>
                    ) : (
                      <span className="text-xs text-emerald-700 font-extrabold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> सर्वोच्च दर!
                      </span>
                    )}

                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={() => handleOpenSaleModal(item)}
                      className="text-xs font-bold shadow-xs ml-auto"
                    >
                      <IndianRupee className="w-3.5 h-3.5 mr-1" />
                      {t.recommendations.sellAtThisMandi}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* NON-GUARANTEE TRANSPARENCY DISCLAIMER */}
          <div className="bg-warm-200/90 border border-warm-300 rounded-2xl p-4 flex items-start gap-3 text-xs text-charcoal-700 leading-relaxed">
            <Info className="w-4 h-4 text-forest-700 shrink-0 mt-0.5" />
            <div>
              <strong>पारदर्शकता व कायदेशीर नोंद:</strong> {recommendation.data_disclaimer || t.recommendations.disclaimerNotice}
            </div>
          </div>
        </div>
      ) : null}

      {/* MODAL: Record Sale Modal Pre-filled from Recommended Mandi */}
      <RecordSaleModal
        isOpen={isRecordSaleOpen}
        onClose={() => setIsRecordSaleOpen(false)}
        onSuccess={() => {
          setIsRecordSaleOpen(false);
          // Navigate to transactions or show success
          navigate('/transactions');
        }}
        prefillData={salePrefillData}
      />
    </div>
  );
};
