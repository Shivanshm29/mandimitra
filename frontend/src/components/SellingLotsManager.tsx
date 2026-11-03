import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Plus, Trash2, RefreshCw, AlertCircle, Calendar, MapPin, Tag, ArrowRight, CheckCircle2, Leaf, TrendingUp } from 'lucide-react';
import { useLanguage } from '../app/LanguageContext';
import { useAuth } from '../app/AuthContext';
import { lotService } from '../services/lotService';
import { harvestService } from '../services/harvestService';
import { farmerService } from '../services/farmerService';
import type { SellingLot } from '../types/lot';
import type { HarvestRecord, HarvestRecordCreate } from '../types/harvest';
import { Card } from './Card';
import { Button } from './Button';
import { Input } from './Input';
import { Badge } from './Badge';

interface SellingLotsManagerProps {
  onLotSelected?: (lot: SellingLot) => void;
  selectable?: boolean;
}

export const SellingLotsManager: React.FC<SellingLotsManagerProps> = ({
  onLotSelected,
  selectable = false,
}) => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { profile } = useAuth();

  const [activeTab, setActiveTab] = useState<'harvests' | 'lots'>('harvests');
  const [harvests, setHarvests] = useState<HarvestRecord[]>([]);
  const [lots, setLots] = useState<SellingLot[]>([]);
  const [farmerCrops, setFarmerCrops] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modals
  const [showAddHarvestModal, setShowAddHarvestModal] = useState(false);
  const [showCreateLotModal, setShowCreateLotModal] = useState(false);
  const [selectedHarvestForLot, setSelectedHarvestForLot] = useState<HarvestRecord | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Add Harvest Form State
  const [harvestCrop, setHarvestCrop] = useState('');
  const [customCrop, setCustomCrop] = useState('');
  const [harvestVariety, setHarvestVariety] = useState('Standard');
  const [harvestDate, setHarvestDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [harvestQuantity, setHarvestQuantity] = useState('25.00');
  const [harvestUnit, setHarvestUnit] = useState('Quintal');
  const [harvestGrade, setHarvestGrade] = useState('Grade A');
  const [harvestStorage, setHarvestStorage] = useState('Farm Storage');
  const [harvestNotes, setHarvestNotes] = useState('');

  // Convert to Lot Form State
  const [lotQuantity, setLotQuantity] = useState('');
  const [lotExpectedRate, setLotExpectedRate] = useState('');
  const [lotNotes, setLotNotes] = useState('');

  const loadAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [harvestsData, lotsData] = await Promise.all([
        harvestService.getHarvests().catch(() => []),
        lotService.getLots().catch(() => []),
      ]);
      setHarvests(harvestsData);
      setLots(lotsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Sync farmer's commonly grown crops
  useEffect(() => {
    if (profile?.commonly_grown_crops && Array.isArray(profile.commonly_grown_crops)) {
      const crops = profile.commonly_grown_crops.map((c: any) =>
        typeof c === 'string' ? c : c.commodity
      );
      setFarmerCrops(crops);
      if (crops.length > 0 && !harvestCrop) {
        setHarvestCrop(crops[0]);
      }
    } else {
      farmerService.getProfile().then((p) => {
        if (p.commonly_grown_crops && Array.isArray(p.commonly_grown_crops)) {
          const crops = p.commonly_grown_crops.map((c: any) =>
            typeof c === 'string' ? c : c.commodity
          );
          setFarmerCrops(crops);
          if (crops.length > 0 && !harvestCrop) {
            setHarvestCrop(crops[0]);
          }
        }
      }).catch(() => {});
    }
  }, [profile]);

  const handleOpenAddHarvest = () => {
    if (farmerCrops.length > 0) {
      setHarvestCrop(farmerCrops[0]);
    } else {
      setHarvestCrop('');
    }
    setCustomCrop('');
    setHarvestQuantity('25.00');
    setHarvestDate(new Date().toISOString().split('T')[0]);
    setShowAddHarvestModal(true);
  };

  const handleCreateHarvest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const chosenCrop = harvestCrop === 'CUSTOM' ? customCrop.trim() : harvestCrop.trim();
    const qty = parseFloat(harvestQuantity);

    if (!chosenCrop || !qty || qty <= 0) {
      setError(language === 'mr-IN' ? 'कृपया योग्य पीक आणि परिमाण निवडा.' : 'Please provide a valid crop and quantity.');
      return;
    }

    try {
      setSubmitting(true);
      const payload: HarvestRecordCreate = {
        commodity: chosenCrop,
        variety: harvestVariety.trim() || 'Standard',
        harvest_date: harvestDate,
        harvested_quantity: qty,
        quantity_unit: harvestUnit,
        quality_grade: harvestGrade.trim() || undefined,
        storage_location: harvestStorage.trim() || undefined,
        notes: harvestNotes.trim() || undefined,
      };

      await harvestService.createHarvest(payload);
      setShowAddHarvestModal(false);
      setSuccessMessage(t.harvest.saveSuccess);
      loadAllData();
    } catch (err: any) {
      setError(err.message || 'Failed to save harvest');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenCreateLot = (harvest: HarvestRecord) => {
    setSelectedHarvestForLot(harvest);
    setLotQuantity(String(harvest.remaining_quantity));
    setLotExpectedRate('');
    setLotNotes('');
    setShowCreateLotModal(true);
  };

  const handleCreateLotFromHarvest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHarvestForLot) return;
    setError(null);
    setSuccessMessage(null);

    const qty = parseFloat(lotQuantity);
    const maxAvail = Number(selectedHarvestForLot.remaining_quantity);

    if (!qty || qty <= 0) {
      setError('कृपया योग्य लॉट परिमाण प्रविष्ट करा.');
      return;
    }

    if (qty > maxAvail) {
      setError(
        language === 'mr-IN'
          ? `मागितलेले परिमाण (${qty} क्विंटल) शिल्लक काढणी साठ्यापेक्षा (${maxAvail} क्विंटल) जास्त आहे.`
          : `Requested lot quantity (${qty}) exceeds remaining harvest stock (${maxAvail}).`
      );
      return;
    }

    try {
      setSubmitting(true);
      await harvestService.createSellingLotFromHarvest(selectedHarvestForLot.id, {
        lot_quantity: qty,
        expected_rate: lotExpectedRate ? parseFloat(lotExpectedRate) : undefined,
        notes: lotNotes.trim() || undefined,
      });

      setShowCreateLotModal(false);
      setSuccessMessage(t.harvest.convertSuccess);
      loadAllData();
      setActiveTab('lots');
    } catch (err: any) {
      setError(err.message || 'Failed to create selling lot');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteHarvest = async (harvest: HarvestRecord) => {
    if (!window.confirm(t.harvest.deleteConfirm)) return;
    try {
      await harvestService.deleteHarvest(harvest.id);
      loadAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete harvest record');
    }
  };

  const handleDeleteLot = async (lot: SellingLot) => {
    if (Number(lot.sold_quantity) > 0) {
      alert(
        language === 'mr-IN'
          ? 'या लॉटमधून विक्री झालेली असल्याने हा लॉट हटवता येणार नाही.'
          : 'Cannot delete a lot with recorded sales.'
      );
      return;
    }
    if (!window.confirm(t.lots.deleteConfirm)) return;
    try {
      await lotService.deleteLot(lot.id);
      loadAllData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete lot');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with Title and Mode Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="h-6 w-6 text-[#176B45]" />
            {t.harvest.title}
          </h2>
          <p className="text-sm text-gray-600 mt-0.5">{t.harvest.subtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadAllData}
            className="flex items-center gap-1.5 min-h-[44px]"
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleOpenAddHarvest}
            className="flex items-center gap-1.5 min-h-[44px] bg-[#176B45] hover:bg-[#125335] text-white font-bold"
          >
            <Plus className="h-5 w-5" />
            {t.harvest.addHarvestBtn}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl w-full sm:w-fit text-xs sm:text-sm font-bold">
        <button
          type="button"
          onClick={() => setActiveTab('harvests')}
          className={`flex-1 sm:flex-none px-4 py-2 rounded-xl transition ${
            activeTab === 'harvests' ? 'bg-white shadow text-[#176B45]' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {t.harvest.title} ({harvests.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('lots')}
          className={`flex-1 sm:flex-none px-4 py-2 rounded-xl transition ${
            activeTab === 'lots' ? 'bg-white shadow text-[#176B45]' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {t.lots.title} ({lots.length})
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs sm:text-sm flex items-center gap-2">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs sm:text-sm flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* TAB 1: HARVEST RECORDS */}
      {activeTab === 'harvests' && (
        <div>
          {loading && harvests.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-xl border border-gray-100 p-6">
              <RefreshCw className="h-8 w-8 text-[#176B45] animate-spin mx-auto mb-2" />
              <p className="text-gray-500 text-sm">लोड होत आहे... / Loading...</p>
            </div>
          ) : harvests.length === 0 ? (
            <Card className="text-center py-10 px-4 border-dashed border-2 border-gray-200">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-gray-800">{t.harvest.emptyTitle}</h3>
              <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">{t.harvest.emptyDesc}</p>
              <Button
                variant="primary"
                className="mt-4 bg-[#176B45] text-white min-h-[48px]"
                onClick={handleOpenAddHarvest}
              >
                {t.harvest.addHarvestBtn}
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {harvests.map((h) => {
                const total = Number(h.harvested_quantity);
                const remaining = Number(h.remaining_quantity);
                const allocated = Math.max(0, total - remaining);
                const pctRemaining = total > 0 ? (remaining / total) * 100 : 0;

                return (
                  <Card key={h.id} className="p-5 flex flex-col justify-between border border-emerald-100 hover:shadow-md transition">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                            #{h.id}
                          </span>
                          <h3 className="text-lg font-bold text-gray-900 mt-1">
                            {h.commodity}
                            <span className="text-sm font-normal text-gray-600 ml-1">
                              ({h.variety || 'Standard'})
                            </span>
                          </h3>
                        </div>
                        <Badge variant={remaining > 0 ? 'success' : 'default'}>
                          {remaining > 0 ? t.harvest.statusAvailable : t.harvest.statusSold}
                        </Badge>
                      </div>

                      {/* Inventory meter */}
                      <div className="my-3 p-3 bg-warm-100 rounded-xl">
                        <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1">
                          <span>
                            {t.harvest.remainingLabel}: <strong className="text-emerald-800">{remaining.toFixed(2)} Qtl</strong>
                          </span>
                          <span>{t.harvest.totalHarvested}: {total.toFixed(2)} Qtl</span>
                        </div>
                        <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#176B45] transition-all duration-300"
                            style={{ width: `${pctRemaining}%` }}
                          />
                        </div>
                        <div className="text-[11px] text-gray-500 mt-1 flex justify-between">
                          <span>लॉटसाठी वापरलेले: {allocated.toFixed(2)} Qtl</span>
                          <span>{Math.round(pctRemaining)}% शिल्लक</span>
                        </div>
                      </div>

                      <div className="space-y-1 text-xs text-gray-600 mb-4">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          <span>{t.harvest.harvestDateLabel}: <strong>{h.harvest_date}</strong></span>
                        </div>
                        {h.quality_grade && (
                          <div className="flex items-center gap-1.5">
                            <Tag className="w-3.5 h-3.5 text-gray-400" />
                            <span>{t.harvest.gradeLabel}: <strong>{h.quality_grade}</strong></span>
                          </div>
                        )}
                        {h.storage_location && (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-gray-400" />
                            <span>{t.harvest.storageLabel}: <strong>{h.storage_location}</strong></span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => navigate(`/selling-recommendations?harvestId=${h.id}`)}
                        className="py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-2xs"
                        title="Compare Mandi Rates for this harvest"
                      >
                        <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                        {language === 'mr-IN' ? 'मंडी भाव व सल्ला' : language === 'hi-IN' ? 'मंडी भाव व सलाह' : 'Compare Mandis'}
                      </button>

                      {remaining > 0 ? (
                        <button
                          type="button"
                          onClick={() => handleOpenCreateLot(h)}
                          className="flex-1 py-2 px-3 rounded-xl bg-[#EAF3EA] hover:bg-emerald-100 text-[#176B45] font-bold text-xs flex items-center justify-center gap-1.5 transition"
                        >
                          <Plus className="w-4 h-4" />
                          {t.harvest.createLotBtn}
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400 italic">सर्व साठा लॉटमध्ये वापरला</span>
                      )}

                      {allocated === 0 && (
                        <button
                          type="button"
                          onClick={() => handleDeleteHarvest(h)}
                          className="p-2 text-gray-400 hover:text-red-600 rounded-xl transition"
                          title="Delete Harvest Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SELLING LOTS */}
      {activeTab === 'lots' && (
        <div>
          {loading && lots.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-xl border border-gray-100 p-6">
              <RefreshCw className="h-8 w-8 text-[#176B45] animate-spin mx-auto mb-2" />
              <p className="text-gray-500 text-sm">लोड होत आहे...</p>
            </div>
          ) : lots.length === 0 ? (
            <Card className="text-center py-10 px-4 border-dashed border-2 border-gray-200">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-gray-800">{t.lots.emptyTitle}</h3>
              <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">{t.lots.emptyDesc}</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lots.map((lot) => {
                const availQty = Number(lot.available_quantity);
                const totalQty = Number(lot.total_quantity);
                const soldQty = Number(lot.sold_quantity);
                const pctAvail = totalQty > 0 ? (availQty / totalQty) * 100 : 0;
                const isSoldOut = lot.status === 'SOLD' || availQty <= 0;
                const isPartial = lot.status === 'PARTIALLY_SOLD';

                return (
                  <Card
                    key={lot.id}
                    className={`relative p-5 transition hover:shadow-md border ${
                      selectable ? 'cursor-pointer hover:border-[#176B45]' : ''
                    } ${isSoldOut ? 'bg-gray-50/70 border-gray-200' : 'bg-white border-emerald-100'}`}
                    onClick={() => selectable && onLotSelected && onLotSelected(lot)}
                  >
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                          {lot.lot_code}
                        </span>
                        <h3 className="text-lg font-bold text-gray-900 mt-1">
                          {lot.commodity}
                          <span className="text-sm font-normal text-gray-600 ml-1">
                            ({lot.variety || 'Standard'})
                          </span>
                        </h3>
                      </div>
                      <div>
                        {isSoldOut ? (
                          <Badge variant="default" className="bg-gray-200 text-gray-700">
                            {t.lots.statusSold}
                          </Badge>
                        ) : isPartial ? (
                          <Badge variant="warning" className="bg-[#E8B84A]/20 text-yellow-800 border-yellow-300">
                            {t.lots.statusPartial}
                          </Badge>
                        ) : (
                          <Badge variant="success" className="bg-[#EAF3EA] text-[#176B45] border-emerald-300">
                            {t.lots.statusAvailable}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="my-3">
                      <div className="flex justify-between text-xs font-semibold text-gray-600 mb-1">
                        <span>
                          {t.lots.available}: <strong className="text-emerald-700">{availQty.toFixed(2)} Qtl</strong>
                        </span>
                        <span>
                          {t.lots.total}: {totalQty.toFixed(2)} Qtl
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            isSoldOut ? 'bg-gray-400' : 'bg-[#176B45]'
                          }`}
                          style={{ width: `${pctAvail}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                      <div>
                        <span className="font-medium text-gray-700">{lot.quality_grade || 'Standard'}</span>
                        {lot.storage_location && <span> • {lot.storage_location}</span>}
                      </div>
                      {soldQty === 0 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteLot(lot);
                          }}
                          className="text-gray-400 hover:text-red-600 p-1 rounded transition"
                          title="Delete Lot"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    {!isSoldOut && (
                      <div className="mt-3 pt-2 border-t border-gray-100">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/selling-recommendations?lotId=${lot.id}`);
                          }}
                          className="w-full py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-xs flex items-center justify-center gap-1.5 transition shadow-2xs"
                          title="Compare Mandis for this lot"
                        >
                          <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                          {language === 'mr-IN' ? 'मंडी भाव व सल्ला' : language === 'hi-IN' ? 'मंडी भाव व सलाह' : 'Compare Mandis'}
                        </button>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: ADD HARVEST RECORD (Viewport Aware) */}
      {showAddHarvestModal && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full max-h-[92dvh] sm:max-h-[88dvh] flex flex-col shadow-2xl border border-warm-300 relative my-auto">
            {/* Header */}
            <div className="p-5 sm:p-6 pb-4 border-b border-gray-100 flex-shrink-0 flex items-center justify-between">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Package className="h-5 w-5 text-[#176B45]" />
                  {t.harvest.addHarvestBtn}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">{t.harvest.subtitle}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddHarvestModal(false)}
                className="p-1.5 rounded-xl text-gray-400 hover:bg-gray-100 text-lg leading-none"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form id="add-harvest-form" onSubmit={handleCreateHarvest} className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
              {/* Crop selection from registered crops */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  {t.harvest.cropLabel} *
                </label>
                {farmerCrops.length > 0 ? (
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {farmerCrops.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setHarvestCrop(c)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1 transition ${
                            harvestCrop === c
                              ? 'bg-[#176B45] text-white border-[#176B45]'
                              : 'bg-warm-100 text-gray-700 border-gray-200 hover:bg-warm-200'
                          }`}
                        >
                          <Leaf className="w-3 h-3 text-emerald-400" />
                          <span>{c}</span>
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setHarvestCrop('CUSTOM')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                          harvestCrop === 'CUSTOM'
                            ? 'bg-[#176B45] text-white border-[#176B45]'
                            : 'bg-warm-100 text-gray-700 border-gray-200 hover:bg-warm-200'
                        }`}
                      >
                        + इतर पीक (Other)
                      </button>
                    </div>

                    {harvestCrop === 'CUSTOM' && (
                      <Input
                        label="पिकाचे नाव (Enter Crop Name) *"
                        value={customCrop}
                        onChange={(e) => setCustomCrop(e.target.value)}
                        placeholder="उदा. डाळिंब / Pomegranate"
                        required
                      />
                    )}
                  </div>
                ) : (
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-2">
                    <p>{t.harvest.noCropsAlert}</p>
                    <Input
                      label="पिकाचे नाव प्रविष्ट करा *"
                      value={customCrop}
                      onChange={(e) => {
                        setCustomCrop(e.target.value);
                        setHarvestCrop('CUSTOM');
                      }}
                      placeholder="उदा. कांदा / Onion"
                      required
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label={t.harvest.harvestDateLabel}
                  type="date"
                  value={harvestDate}
                  onChange={(e) => setHarvestDate(e.target.value)}
                  required
                />
                <Input
                  label="जात / Variety"
                  value={harvestVariety}
                  onChange={(e) => setHarvestVariety(e.target.value)}
                  placeholder="उदा. Garwa / पिवळा"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label={t.harvest.qtyLabel}
                  type="number"
                  step="0.01"
                  min="0.1"
                  value={harvestQuantity}
                  onChange={(e) => setHarvestQuantity(e.target.value)}
                  placeholder="25.00"
                  required
                />
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    {t.harvest.unitLabel}
                  </label>
                  <select
                    value={harvestUnit}
                    onChange={(e) => setHarvestUnit(e.target.value)}
                    className="w-full min-h-[48px] px-3 py-2 rounded-xl border border-warm-400 bg-white text-sm font-medium"
                  >
                    <option value="Quintal">क्विंटल (Quintal)</option>
                    <option value="Ton">टन (Ton)</option>
                    <option value="Kg">किलो (Kg)</option>
                    <option value="Bag">पोती / Bag (50kg)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  label={t.harvest.gradeLabel}
                  value={harvestGrade}
                  onChange={(e) => setHarvestGrade(e.target.value)}
                  placeholder="Grade A / निर्यातक्षम"
                  optional
                />
                <Input
                  label={t.harvest.storageLabel}
                  value={harvestStorage}
                  onChange={(e) => setHarvestStorage(e.target.value)}
                  placeholder="उदा. शेतातील खोप / गोदाम"
                  optional
                />
              </div>

              <Input
                label={t.harvest.notesLabel}
                value={harvestNotes}
                onChange={(e) => setHarvestNotes(e.target.value)}
                placeholder="उदा. रब्बी हंगाम काढणी..."
                optional
              />
            </form>

            {/* Fixed Footer */}
            <div className="p-4 sm:p-5 pt-3 border-t border-gray-100 flex-shrink-0 bg-gray-50/50 rounded-b-2xl sm:rounded-b-3xl flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                className="min-h-[46px]"
                onClick={() => setShowAddHarvestModal(false)}
              >
                {t.harvest.cancelBtn}
              </Button>
              <Button
                type="submit"
                form="add-harvest-form"
                variant="primary"
                className="bg-[#176B45] text-white min-h-[46px] px-6 font-bold"
                disabled={submitting}
              >
                {submitting ? t.harvest.saving : t.harvest.saveBtn}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CREATE SELLING LOT FROM HARVEST (Viewport Aware) */}
      {showCreateLotModal && selectedHarvestForLot && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full max-h-[92dvh] sm:max-h-[88dvh] flex flex-col shadow-2xl border border-warm-300 relative my-auto">
            {/* Header */}
            <div className="p-5 sm:p-6 pb-4 border-b border-gray-100 flex-shrink-0 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Package className="h-5 w-5 text-[#176B45]" />
                  {t.harvest.createLotTitle}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  {selectedHarvestForLot.commodity} ({selectedHarvestForLot.variety})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateLotModal(false)}
                className="p-1.5 rounded-xl text-gray-400 hover:bg-gray-100 text-lg leading-none"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <form id="create-lot-form" onSubmit={handleCreateLotFromHarvest} className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex justify-between items-center">
                <span>{t.harvest.remainingLabel}:</span>
                <strong className="text-sm font-bold text-emerald-800">
                  {Number(selectedHarvestForLot.remaining_quantity).toFixed(2)} {selectedHarvestForLot.quantity_unit}
                </strong>
              </div>

              <Input
                label={t.harvest.lotQtyLabel}
                type="number"
                step="0.01"
                min="0.1"
                max={Number(selectedHarvestForLot.remaining_quantity)}
                value={lotQuantity}
                onChange={(e) => setLotQuantity(e.target.value)}
                required
              />

              <Input
                label={t.harvest.expectedRateLabel}
                type="number"
                step="1"
                value={lotExpectedRate}
                onChange={(e) => setLotExpectedRate(e.target.value)}
                placeholder="उदा. 2400"
                optional
              />

              <Input
                label={t.harvest.notesLabel}
                value={lotNotes}
                onChange={(e) => setLotNotes(e.target.value)}
                placeholder="उदा. लासलगाव बाजारासाठी पहिली खेप..."
                optional
              />
            </form>

            {/* Footer */}
            <div className="p-4 sm:p-5 pt-3 border-t border-gray-100 flex-shrink-0 bg-gray-50/50 rounded-b-2xl sm:rounded-b-3xl flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                className="min-h-[46px]"
                onClick={() => setShowCreateLotModal(false)}
              >
                {t.harvest.cancelBtn}
              </Button>
              <Button
                type="submit"
                form="create-lot-form"
                variant="primary"
                className="bg-[#176B45] text-white min-h-[46px] px-6 font-bold"
                disabled={submitting}
              >
                {submitting ? 'तयार करत आहे...' : t.harvest.createLotBtn}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
