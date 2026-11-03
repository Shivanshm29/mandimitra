import React, { useState, useEffect } from 'react';
import { useLanguage } from '../app/LanguageContext';
import { transactionService } from '../services/transactionService';
import { lotService } from '../services/lotService';
import type { SellingLot } from '../types/lot';
import { Input } from './Input';
import { Button } from './Button';
import { VoiceDictationButton } from './VoiceDictationButton';
import { X, Plus, Trash2, Calculator, CheckCircle2, AlertCircle, Package, Camera, Video, Paperclip } from 'lucide-react';

interface RecordSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  prefillData?: {
    trader_name?: string;
    market_name?: string;
    commodity?: string;
    variety?: string;
    quantity?: string | number;
    rate_per_unit?: string | number;
    sale_date?: string;
    deductions?: { deduction_type: string; amount: string; description: string }[];
    evidence_url?: string;
    evidence_type?: string;
    lot_id?: number;
  };
}

export const RecordSaleModal: React.FC<RecordSaleModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  prefillData,
}) => {
  const { t, language } = useLanguage();

  const [lots, setLots] = useState<SellingLot[]>([]);
  const [selectedLotId, setSelectedLotId] = useState<number | null>(prefillData?.lot_id || null);

  const [traderName, setTraderName] = useState(prefillData?.trader_name || '');
  const [marketName, setMarketName] = useState(prefillData?.market_name || 'Lasalgaon APMC');
  const [commodity, setCommodity] = useState(prefillData?.commodity || 'Soybean');
  const [variety, setVariety] = useState(prefillData?.variety || 'Yellow');
  const [quantity, setQuantity] = useState(prefillData?.quantity?.toString() || '');
  const [ratePerUnit, setRatePerUnit] = useState(prefillData?.rate_per_unit?.toString() || '');
  const [initialPayment, setInitialPayment] = useState('');
  const [saleDate, setSaleDate] = useState(prefillData?.sale_date || new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState<string | null>(prefillData?.evidence_url || null);
  const [evidenceType, setEvidenceType] = useState<string>(prefillData?.evidence_type || 'IMAGE');

  // Deductions state
  const [deductions, setDeductions] = useState<{ deduction_type: string; amount: string; description: string }[]>(
    prefillData?.deductions && prefillData.deductions.length > 0
      ? prefillData.deductions
      : [{ deduction_type: 'HAMALI', amount: '', description: 'हमाली / Labor charges' }]
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch farmer lots
  useEffect(() => {
    if (isOpen) {
      lotService
        .getLots()
        .then((data) => {
          // Keep lots that have available quantity
          setLots(data.filter((l) => Number(l.available_quantity) > 0));
        })
        .catch(() => {});
    }
  }, [isOpen]);

  // When prefillData changes
  useEffect(() => {
    if (prefillData) {
      if (prefillData.trader_name) setTraderName(prefillData.trader_name);
      if (prefillData.market_name) setMarketName(prefillData.market_name);
      if (prefillData.commodity) setCommodity(prefillData.commodity);
      if (prefillData.variety) setVariety(prefillData.variety);
      if (prefillData.quantity) setQuantity(prefillData.quantity.toString());
      if (prefillData.rate_per_unit) setRatePerUnit(prefillData.rate_per_unit.toString());
      if (prefillData.sale_date) setSaleDate(prefillData.sale_date);
      if (prefillData.deductions && prefillData.deductions.length > 0) {
        setDeductions(prefillData.deductions);
      }
      if (prefillData.evidence_url) setEvidenceUrl(prefillData.evidence_url);
      if (prefillData.evidence_type) setEvidenceType(prefillData.evidence_type);
      if (prefillData.lot_id) setSelectedLotId(prefillData.lot_id);
    }
  }, [prefillData]);

  if (!isOpen) return null;

  const selectedLot = lots.find((l) => l.id === selectedLotId);
  const maxAvailable = selectedLot ? Number(selectedLot.available_quantity) : null;

  // Real-time calculations
  const qtyNum = parseFloat(quantity) || 0;
  const rateNum = parseFloat(ratePerUnit) || 0;
  const grossAmount = Math.max(0, qtyNum * rateNum);

  const totalDeductions = deductions.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
  const netReceivable = Math.max(0, grossAmount - totalDeductions);
  const initialPaidNum = parseFloat(initialPayment) || 0;
  const pendingBalance = Math.max(0, netReceivable - initialPaidNum);

  const handleLotChange = (lotIdStr: string) => {
    if (!lotIdStr) {
      setSelectedLotId(null);
      return;
    }
    const lid = parseInt(lotIdStr, 10);
    setSelectedLotId(lid);
    const lot = lots.find((l) => l.id === lid);
    if (lot) {
      setCommodity(lot.commodity);
      setVariety(lot.variety || 'Standard');
    }
  };

  const handleAddDeduction = () => {
    setDeductions((prev) => [
      ...prev,
      { deduction_type: 'MANDI_CESS', amount: '', description: 'मंडी सेस / Cess' },
    ]);
  };

  const handleRemoveDeduction = (index: number) => {
    setDeductions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeductionChange = (index: number, field: string, value: string) => {
    setDeductions((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleEvidenceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const isVid = file.type.startsWith('video');
      const reader = new FileReader();
      reader.onload = () => {
        setEvidenceUrl(reader.result as string);
        setEvidenceType(isVid ? 'VIDEO' : 'IMAGE');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!traderName.trim() || qtyNum <= 0 || rateNum <= 0) {
      setError('कृपया व्यापारी नाव, अचूक परिमाण आणि दर भरा.');
      return;
    }

    if (maxAvailable !== null && qtyNum > maxAvailable) {
      setError(
        language === 'mr-IN'
          ? `निवडलेल्या लॉटमध्ये फक्त ${maxAvailable} क्विंटल शिल्लक आहे. (तुम्ही ${qtyNum} क्विंटल मागितले)`
          : `Selected lot only has ${maxAvailable} Quintals available. (You entered ${qtyNum} Qtl)`
      );
      return;
    }

    if (totalDeductions > grossAmount) {
      setError('एकूण कपात रक्कम एकूण विक्री मूल्यापेक्षा जास्त असू शकत नाही.');
      return;
    }

    try {
      setLoading(true);
      await transactionService.createSale({
        trader_name: traderName.trim(),
        market_name: marketName.trim() || undefined,
        commodity,
        variety,
        lot_id: selectedLotId || undefined,
        quantity: qtyNum,
        rate_per_unit: rateNum,
        sale_date: saleDate,
        initial_payment_received: initialPaidNum,
        deductions: deductions
          .filter((d) => parseFloat(d.amount) > 0)
          .map((d) => ({
            deduction_type: d.deduction_type,
            amount: parseFloat(d.amount),
            description: d.description || undefined,
          })),
        notes: notes.trim() || undefined,
        evidence_url: evidenceUrl || undefined,
        evidence_type: evidenceUrl ? evidenceType : undefined,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'विक्री नोंदवताना त्रुटी आली.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-xl w-full max-h-[92dvh] sm:max-h-[88dvh] flex flex-col shadow-2xl border border-warm-300 relative my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Fixed Header */}
        <div className="p-5 sm:p-6 pb-3 border-b border-gray-100 flex-shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-forest-100 text-forest-700 flex items-center justify-center font-bold shrink-0">
              <Calculator className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-charcoal-900 leading-tight">
                {t.transactions.newSaleBtn}
              </h2>
              <p className="text-xs text-charcoal-700 mt-0.5">
                {t.transactions.subtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-charcoal-700 hover:bg-warm-200 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form id="record-sale-form" onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2.5 text-xs sm:text-sm text-red-700">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          {/* Produce Lot Selector */}
          {lots.length > 0 && (
            <div className="bg-[#EAF3EA] p-3 rounded-xl border border-emerald-200">
              <label className="block text-xs font-bold text-[#176B45] mb-1.5 flex items-center gap-1.5">
                <Package className="h-4 w-4" />
                शेतमाल साठा लॉटशी जोडा (Link to Harvest Lot - Optional)
              </label>
              <select
                value={selectedLotId || ''}
                onChange={(e) => handleLotChange(e.target.value)}
                className="w-full min-h-[44px] px-3 py-2 rounded-lg border border-emerald-300 bg-white text-sm font-medium text-gray-800"
              >
                <option value="">-- लॉट निवडल्यास साठा आपोआप वजा होईल (Select Lot) --</option>
                {lots.map((lot) => (
                  <option key={lot.id} value={lot.id}>
                    {lot.lot_code} | {lot.commodity} ({lot.variety}) — उपलब्ध: {lot.available_quantity} Qtl
                  </option>
                ))}
              </select>
              {selectedLot && (
                <p className="text-xs text-emerald-800 mt-1.5 font-semibold">
                  ✓ निवडलेला लॉट: {selectedLot.lot_code} | उपलब्ध साठा: {selectedLot.available_quantity} क्विंटल
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative">
              <Input
                label="व्यापाऱ्याचे नाव / फर्म *"
                value={traderName}
                onChange={(e) => setTraderName(e.target.value)}
                placeholder="उदा. महालक्ष्मी ट्रेडर्स"
                required
              />
              <div className="absolute right-2 top-8">
                <VoiceDictationButton
                  onTranscript={(txt) => setTraderName((prev) => (prev ? `${prev} ${txt}` : txt))}
                  title="व्यापारी नाव बोला"
                />
              </div>
            </div>

            <div className="relative">
              <Input
                label="मंडी / बाजार समिती"
                value={marketName}
                onChange={(e) => setMarketName(e.target.value)}
                placeholder="उदा. लासलगाव APMC"
              />
              <div className="absolute right-2 top-8">
                <VoiceDictationButton
                  onTranscript={(txt) => setMarketName(txt)}
                  title="मंडी नाव बोला"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="w-full flex flex-col gap-1.5 text-left">
              <label className="text-sm font-semibold text-charcoal-800">पिक / Commodity *</label>
              <select
                value={commodity}
                onChange={(e) => setCommodity(e.target.value)}
                className="w-full min-h-[48px] px-3.5 py-2.5 rounded-xl border border-warm-400 bg-white text-charcoal-900 font-medium"
              >
                <option value="Soybean">सोयाबीन (Soybean)</option>
                <option value="Onion">कांदा (Onion)</option>
                <option value="Tomato">टोमॅटो (Tomato)</option>
                <option value="Cotton">कापूस (Cotton)</option>
                <option value="Wheat">गहू (Wheat)</option>
                <option value="Maize">मका (Maize)</option>
              </select>
            </div>

            <Input
              label="जात / Variety"
              value={variety}
              onChange={(e) => setVariety(e.target.value)}
              placeholder="उदा. पिवळा (Yellow) / गावरान"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <Input
                label="परिमाण (क्विंटल) *"
                type="number"
                step="0.01"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="उदा. 45.5"
                required
              />
              {maxAvailable !== null && (
                <span className="text-xs text-gray-500 mt-0.5 block">
                  कमाल उपलब्ध: {maxAvailable} Qtl
                </span>
              )}
            </div>
            <Input
              label="दर (₹ प्रति क्विंटल) *"
              type="number"
              step="0.01"
              value={ratePerUnit}
              onChange={(e) => setRatePerUnit(e.target.value)}
              placeholder="उदा. 4650"
              required
            />
            <Input
              label="विक्री तारीख"
              type="date"
              value={saleDate}
              onChange={(e) => setSaleDate(e.target.value)}
            />
          </div>

          {/* Deductions Section */}
          <div className="bg-warm-100 p-4 rounded-2xl border border-warm-300">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-charcoal-800">
                पावती कपाती (Cess / Hamali / Weigher)
              </span>
              <button
                type="button"
                onClick={handleAddDeduction}
                className="text-xs font-semibold text-forest-700 hover:text-forest-800 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> कपात जोडा
              </button>
            </div>

            <div className="flex flex-col gap-2.5">
              {deductions.map((d, index) => (
                <div key={index} className="flex items-center gap-2">
                  <select
                    value={d.deduction_type}
                    onChange={(e) => handleDeductionChange(index, 'deduction_type', e.target.value)}
                    className="w-1/3 min-h-[42px] px-2.5 py-1.5 rounded-lg border border-warm-400 bg-white text-xs font-medium"
                  >
                    <option value="HAMALI">हमाली (Hamali)</option>
                    <option value="MANDI_CESS">मंडी सेस (Mandi Cess)</option>
                    <option value="WEIGHING_FEE">तोल फी (Weighing)</option>
                    <option value="COMMISSION">कमिशन (Commission)</option>
                    <option value="OTHER">इतर (Other)</option>
                  </select>

                  <input
                    type="number"
                    step="0.01"
                    placeholder="रक्कम ₹"
                    value={d.amount}
                    onChange={(e) => handleDeductionChange(index, 'amount', e.target.value)}
                    className="w-1/3 min-h-[42px] px-3 py-1.5 rounded-lg border border-warm-400 bg-white text-sm"
                  />

                  <input
                    type="text"
                    placeholder="वर्णन / तपशील"
                    value={d.description}
                    onChange={(e) => handleDeductionChange(index, 'description', e.target.value)}
                    className="w-1/3 min-h-[42px] px-3 py-1.5 rounded-lg border border-warm-400 bg-white text-xs"
                  />

                  {deductions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveDeduction(index)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Initial Payment Received */}
          <Input
            label="जागेवर मिळालेली रक्कम (Initial Payment Received)"
            type="number"
            step="0.01"
            value={initialPayment}
            onChange={(e) => setInitialPayment(e.target.value)}
            placeholder="उदा. 25000 (रोख किंवा UPI)"
          />

          {/* Notes with Voice Dictation */}
          <div className="relative">
            <Input
              label="नोंद / शेरा (Notes - Optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="उदा. गाडी नंबर MH-15 किंवा व्यापाऱ्याशी बोलणे..."
              optional
            />
            <div className="absolute right-2 top-8">
              <VoiceDictationButton
                onTranscript={(txt) => setNotes((prev) => (prev ? `${prev} ${txt}` : txt))}
                title="शेरा बोला"
              />
            </div>
          </div>

          {/* Evidence Attachment Section */}
          <div className="p-3 bg-warm-100 rounded-xl border border-warm-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-charcoal-800 flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5 text-[#176B45]" />
                पावती / व्हिडिओ पुरावा (Evidence Attachment)
              </span>
              {evidenceUrl && (
                <button
                  type="button"
                  onClick={() => setEvidenceUrl(null)}
                  className="text-[11px] text-red-600 hover:underline"
                >
                  काढून टाका
                </button>
              )}
            </div>

            {evidenceUrl ? (
              <div className="flex items-center gap-3 bg-white p-2.5 rounded-lg border border-emerald-300">
                {evidenceType === 'VIDEO' ? (
                  <Video className="w-6 h-6 text-amber-600 shrink-0" />
                ) : (
                  <img
                    src={evidenceUrl}
                    alt="Slip Evidence"
                    className="w-12 h-12 object-cover rounded-md border border-gray-200"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-900 truncate">
                    {evidenceType === 'VIDEO' ? 'व्हिडिओ पुरावा संलग्न' : 'काटा पावती संलग्न'}
                  </p>
                  <p className="text-[11px] text-emerald-700 font-medium">✓ सुरक्षित संचयित</p>
                </div>
              </div>
            ) : (
              <div>
                <label className="flex items-center justify-center gap-2 p-3 bg-white border border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#176B45] text-xs font-semibold text-gray-600 transition">
                  <Camera className="w-4 h-4 text-[#176B45]" />
                  <span>फोटो किंवा व्हिडिओ पुरावा निवडा</span>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleEvidenceUpload}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>

          {/* Real-time Calculation Summary Box */}
          <div className="bg-forest-50 p-4 rounded-2xl border border-forest-200 text-xs sm:text-sm flex flex-col gap-1.5">
            <div className="flex justify-between text-charcoal-700">
              <span>एकूण रक्कम (Gross):</span>
              <span className="font-semibold text-charcoal-900">
                ₹{grossAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-red-700">
              <span>एकूण कपाती (Deductions):</span>
              <span className="font-semibold">
                -₹{totalDeductions.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-forest-800 font-bold border-t border-forest-200/60 pt-1.5 text-sm sm:text-base">
              <span>निव्वळ देय रक्कम (Net):</span>
              <span>₹{netReceivable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-amber-800 font-bold pt-1">
              <span>{t.transactions.outstandingAmount}:</span>
              <span>₹{pendingBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </form>

        {/* Fixed Footer */}
        <div className="p-4 sm:p-5 pt-3 border-t border-gray-100 flex-shrink-0 bg-gray-50/50 rounded-b-2xl sm:rounded-b-3xl flex items-center justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose} className="min-h-[46px]">
            {t.common.cancel}
          </Button>
          <Button
            type="submit"
            form="record-sale-form"
            variant="primary"
            isLoading={loading}
            className="bg-[#176B45] text-white min-h-[46px] px-6 font-bold"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            {t.transactions.newSaleBtn}
          </Button>
        </div>
      </div>
    </div>
  );
};
