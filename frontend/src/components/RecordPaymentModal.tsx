import React, { useState } from 'react';
import { useLanguage } from '../app/LanguageContext';
import { transactionService } from '../services/transactionService';
import type { Sale } from '../types/transaction';
import { Input } from './Input';
import { Button } from './Button';
import { VoiceDictationButton } from './VoiceDictationButton';
import { X, IndianRupee, CheckCircle2, AlertCircle, Camera, Paperclip } from 'lucide-react';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  sales: Sale[];
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  sales,
}) => {
  const { t } = useLanguage();

  const [selectedSaleId, setSelectedSaleId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [paymentMode, setPaymentMode] = useState<string>('CASH');
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [referenceNote, setReferenceNote] = useState<string>('');
  const [evidenceUrl, setEvidenceUrl] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const unpaidSales = sales.filter((s) => parseFloat(String(s.outstanding_balance)) > 0);

  const handleEvidenceUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setEvidenceUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const amtNum = parseFloat(amount);
    if (!amtNum || amtNum <= 0) {
      setError('कृपया योग्य देय रक्कम प्रविष्ट करा.');
      return;
    }

    try {
      setLoading(true);
      await transactionService.recordPayment({
        sale_id: selectedSaleId ? parseInt(selectedSaleId, 10) : undefined,
        amount: amtNum,
        payment_mode: paymentMode,
        payment_date: paymentDate,
        reference_note: referenceNote.trim() || undefined,
        evidence_url: evidenceUrl || undefined,
        evidence_type: evidenceUrl ? 'IMAGE' : undefined,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'पेमेंट नोंदवताना त्रुटी आली.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-md w-full max-h-[92dvh] sm:max-h-[88dvh] flex flex-col shadow-2xl border border-warm-300 relative my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Fixed Header */}
        <div className="p-5 sm:p-6 pb-3 border-b border-gray-100 flex-shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-forest-100 text-forest-700 flex items-center justify-center font-bold shrink-0">
              <IndianRupee className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-charcoal-900 leading-tight">
                {t.payments.recordPaymentBtn}
              </h2>
              <p className="text-xs text-charcoal-700 mt-0.5">
                {t.payments.subtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-charcoal-700 hover:bg-warm-200"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form id="record-payment-form" onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs sm:text-sm text-red-700">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Linked Sale Dropdown */}
          <div className="w-full flex flex-col gap-1.5 text-left">
            <label className="text-xs font-semibold text-charcoal-800">
              {t.payments.linkedSale}
            </label>
            <select
              value={selectedSaleId}
              onChange={(e) => setSelectedSaleId(e.target.value)}
              className="w-full min-h-[48px] px-3.5 py-2.5 rounded-xl border border-warm-400 bg-white text-charcoal-900 text-sm font-medium"
            >
              <option value="">-- सामान्य जमा (General Inflow) --</option>
              {unpaidSales.map((s) => (
                <option key={s.id} value={s.id}>
                  #{s.id} - {s.commodity} ({s.trader_name}) • बाकी: ₹{parseFloat(String(s.outstanding_balance)).toLocaleString('en-IN')}
                </option>
              ))}
            </select>
          </div>

          <Input
            label={t.payments.amount}
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="उदा. 25000"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="w-full flex flex-col gap-1.5 text-left">
              <label className="text-xs font-semibold text-charcoal-800">{t.payments.paymentMode}</label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="w-full min-h-[48px] px-3.5 py-2.5 rounded-xl border border-warm-400 bg-white text-charcoal-900 font-medium text-sm"
              >
                <option value="CASH">{t.payments.cash}</option>
                <option value="UPI">{t.payments.upi}</option>
                <option value="CHEQUE">{t.payments.cheque}</option>
                <option value="BANK_TRANSFER">{t.payments.bankTransfer}</option>
              </select>
            </div>

            <Input
              label={t.payments.paymentDate}
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
            />
          </div>

          <div className="relative">
            <Input
              label={t.payments.referenceNote}
              value={referenceNote}
              onChange={(e) => setReferenceNote(e.target.value)}
              placeholder="उदा. HDFC Cheque 4021 / PhonePe"
              optional
            />
            <div className="absolute right-2 top-8">
              <VoiceDictationButton
                onTranscript={(txt) => setReferenceNote((prev) => (prev ? `${prev} ${txt}` : txt))}
                title="शेरा बोला"
              />
            </div>
          </div>

          {/* Payment receipt / screenshot attachment */}
          <div className="p-3 bg-warm-100 rounded-xl border border-warm-300">
            <div className="flex items-center justify-between text-xs font-semibold text-charcoal-800 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Paperclip className="w-3.5 h-3.5 text-[#176B45]" />
                {t.payments.evidenceReceipt}
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
              <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-emerald-300">
                <img
                  src={evidenceUrl}
                  alt="Payment Evidence"
                  className="w-10 h-10 object-cover rounded border"
                />
                <span className="text-xs text-emerald-800 font-medium">✓ {t.payments.evidenceReceipt} जोडला आहे</span>
              </div>
            ) : (
              <label className="flex items-center justify-center gap-1.5 p-2.5 bg-white border border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#176B45] text-xs text-gray-600 transition">
                <Camera className="w-3.5 h-3.5 text-[#176B45]" />
                <span>धनादेश / स्क्रीनशॉट फोटो जोडा</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleEvidenceUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </form>

        {/* Fixed Footer */}
        <div className="p-4 sm:p-5 pt-3 border-t border-gray-100 flex-shrink-0 bg-gray-50/50 rounded-b-2xl sm:rounded-b-3xl flex items-center justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose} className="min-h-[46px]">
            {t.common.cancel}
          </Button>
          <Button
            type="submit"
            form="record-payment-form"
            variant="primary"
            isLoading={loading}
            className="bg-[#176B45] text-white min-h-[46px] px-6 font-bold"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            {t.payments.recordPaymentBtn}
          </Button>
        </div>
      </div>
    </div>
  );
};

