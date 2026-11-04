import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, Loader2, ArrowRight, Tag, Scale, IndianRupee, Store, Layers } from 'lucide-react';
import { Button } from './Button';
import { Badge } from './Badge';
import { useLanguage } from '../app/LanguageContext';
import type { ActionProposal } from '../services/sarvamService';

interface ActionProposalCardProps {
  proposal: ActionProposal;
  isExecuted?: boolean;
  executionResult?: string;
  onExecute: (proposal: ActionProposal) => Promise<void>;
  disabled?: boolean;
}

export const ActionProposalCard: React.FC<ActionProposalCardProps> = ({
  proposal,
  isExecuted = false,
  executionResult,
  onExecute,
  disabled = false,
}) => {
  const { language, t } = useLanguage();
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isMarathi = language === 'mr-IN';
  const isHindi = language === 'hi-IN';

  const params = proposal.parameters || {};

  const handleConfirm = async () => {
    if (submitting || isExecuted) return;
    setErrorMessage(null);
    try {
      setSubmitting(true);
      await onExecute(proposal);
    } catch (err: any) {
      setErrorMessage(
        err.message ||
          (isMarathi
            ? 'कृती सेव्ह करताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.'
            : isHindi
            ? 'कार्रवाई सहेजने में त्रुटि हुई। कृपया पुनः प्रयास करें।'
            : 'Action could not be executed. Please try again.')
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Specific Renderer for `record_sale`
  if (proposal.action === 'record_sale') {
    const commodity = params.commodity || 'Onion';
    const variety = params.variety || 'Standard';
    const trader = params.trader_name || (isMarathi ? 'स्थानिक व्यापारी' : 'Local Trader');
    const market = params.market_name || (isMarathi ? 'बाजार समिती' : 'APMC Mandi');
    const quantity = parseFloat(String(params.quantity || '0')) || 0;
    const rate = parseFloat(String(params.rate_per_unit || '0')) || 0;
    const gross = quantity * rate;

    // Resilient deductions extraction (array or dict)
    let deductionsList: Array<{ type: string; amount: number; description?: string }> = [];
    if (Array.isArray(params.deductions)) {
      deductionsList = params.deductions.map((d: any) => ({
        type: typeof d === 'string' ? d : d.deduction_type || 'OTHER',
        amount: parseFloat(String(d.amount || 0)) || 0,
        description: d.description,
      }));
    } else if (typeof params.deductions === 'object' && params.deductions !== null) {
      deductionsList = Object.entries(params.deductions).map(([k, v]) => ({
        type: k,
        amount: parseFloat(String(v || 0)) || 0,
      }));
    }

    const totalDeductions = deductionsList.reduce((acc, d) => acc + d.amount, 0);
    const netReceivable = Math.max(0, gross - totalDeductions);
    const lotLabel = params.lot_code || (params.lot_id ? `LOT-#${params.lot_id}` : null);

    return (
      <div className="p-4 bg-white rounded-2xl border-2 border-emerald-600/80 shadow-md space-y-3 text-xs sm:text-sm">
        {/* Card Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
          <div className="flex items-center gap-1.5 font-bold text-[#176B45]">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span className="uppercase tracking-wide text-xs">
              {isMarathi ? 'नवीन विक्री पुष्टीकरण' : isHindi ? 'बिक्री पुष्टि' : 'Sale Confirmation Draft'}
            </span>
          </div>
          {lotLabel && (
            <span className="inline-flex items-center gap-1 text-[11px] font-mono bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200 font-semibold">
              <Layers className="w-3 h-3 text-emerald-600" />
              {lotLabel}
            </span>
          )}
        </div>

        {/* Commodity and Trader Pill */}
        <div className="grid grid-cols-2 gap-2 bg-gray-50/80 p-2.5 rounded-xl border border-gray-100">
          <div>
            <span className="text-[11px] text-gray-500 block">{isMarathi ? 'शेतमाल व जात' : 'Commodity & Variety'}</span>
            <span className="font-bold text-gray-900">{commodity} ({variety})</span>
          </div>
          <div>
            <span className="text-[11px] text-gray-500 block">{isMarathi ? 'व्यापारी / फर्म' : 'Buyer / Trader'}</span>
            <span className="font-bold text-gray-900">{trader}</span>
          </div>
          {market && (
            <div className="col-span-2 pt-1 border-t border-gray-100 flex items-center gap-1 text-[11px] text-gray-600">
              <Store className="w-3.5 h-3.5 text-gray-400" />
              <span>{market}</span>
            </div>
          )}
        </div>

        {/* Quantities & Financial Math Breakdown */}
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between py-1 border-b border-gray-100">
            <span className="text-gray-600">{isMarathi ? 'विक्री प्रमाण' : 'Quantity'}:</span>
            <span className="font-semibold text-gray-900">{quantity.toFixed(2)} क्विंटल (Quintals)</span>
          </div>
          <div className="flex justify-between py-1 border-b border-gray-100">
            <span className="text-gray-600">{isMarathi ? 'विक्री दर' : 'Rate / Quintal'}:</span>
            <span className="font-semibold text-gray-900">₹{rate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between py-1 font-bold">
            <span className="text-gray-700">{isMarathi ? 'एकूण रक्कम (Gross)' : 'Gross Realization'}:</span>
            <span className="text-gray-900">₹{gross.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>

          {/* Deductions Breakdown */}
          {deductionsList.length > 0 && (
            <div className="bg-amber-50/60 p-2.5 rounded-xl border border-amber-200/80 my-2 space-y-1">
              <span className="text-[11px] font-bold text-amber-900 block mb-1">
                {isMarathi ? 'कपात तपशील (Deductions)' : 'Itemized Deductions'}:
              </span>
              {deductionsList.map((d, i) => (
                <div key={i} className="flex justify-between text-[11px] text-amber-900/90 font-mono">
                  <span>• {d.type}{d.description ? ` (${d.description})` : ''}:</span>
                  <span>-₹{d.amount.toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between text-xs font-bold text-amber-950 pt-1 border-t border-amber-200">
                <span>{isMarathi ? 'एकूण कपात' : 'Total Deductions'}:</span>
                <span>-₹{totalDeductions.toFixed(2)}</span>
              </div>
            </div>
          )}

          {/* Net Receivable Realization */}
          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center justify-between">
            <span className="font-bold text-emerald-950 text-xs sm:text-sm">
              {isMarathi ? 'शेतकऱ्यास देय निव्वळ रक्कम' : 'Net Farmer Realization'}:
            </span>
            <span className="text-base sm:text-lg font-extrabold text-[#176B45]">
              ₹{netReceivable.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Error Notice */}
        {errorMessage && (
          <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700 font-medium">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Confirm or Success */}
        {!isExecuted ? (
          <button
            type="button"
            onClick={handleConfirm}
            disabled={submitting || disabled}
            className="w-full py-2.5 px-4 bg-[#176B45] hover:bg-[#125335] disabled:bg-gray-400 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-sm transition active:scale-98"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{isMarathi ? 'विक्री नोंदवली जात आहे...' : 'Saving sale transaction...'}</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>{isMarathi ? '✓ विक्री नोंदवा व सेव्ह करा' : isHindi ? '✓ बिक्री दर्ज करें' : '✓ Confirm & Save Sale'}</span>
              </>
            )}
          </button>
        ) : (
          <div className="p-3 bg-emerald-50 text-emerald-900 border border-emerald-300 rounded-xl font-bold flex items-center gap-2 text-xs sm:text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{executionResult || (isMarathi ? 'विक्री यशस्वीरित्या नोंदवली गेली!' : 'Sale successfully recorded!')}</span>
          </div>
        )}
      </div>
    );
  }

  // Generic Action Proposal Card (e.g. create_selling_lot, record_payment)
  return (
    <div className="p-3.5 bg-white rounded-2xl border-2 border-emerald-500/80 shadow-md space-y-2.5 text-xs">
      <div className="flex items-center justify-between border-b pb-1.5">
        <span className="font-bold text-[#176B45] flex items-center gap-1 uppercase tracking-wide text-[10px]">
          <CheckCircle2 className="w-3.5 h-3.5" />
          {isMarathi ? 'कृती पुष्टीकरण' : 'Action Confirmation'}
        </span>
        <span className="font-mono text-[10px] text-gray-500 font-semibold">
          {proposal.action}
        </span>
      </div>

      <p className="font-bold text-gray-900">{proposal.summary}</p>

      {/* Clean key-value parameter listing with no [object Object] */}
      <div className="bg-gray-50 p-2.5 rounded-xl space-y-1 text-gray-700 font-mono text-[11px] border border-gray-100">
        {Object.entries(params).map(([k, v]) => {
          let displayVal = '';
          if (Array.isArray(v)) {
            displayVal = v.map((item) => (typeof item === 'object' ? JSON.stringify(item) : String(item))).join(', ');
          } else if (typeof v === 'object' && v !== null) {
            displayVal = JSON.stringify(v);
          } else {
            displayVal = String(v ?? '');
          }
          return (
            <div key={k} className="flex justify-between items-center py-0.5">
              <span className="text-gray-500">{k}:</span>
              <span className="font-semibold text-gray-900 truncate max-w-[200px]">{displayVal}</span>
            </div>
          );
        })}
      </div>

      {errorMessage && (
        <div className="p-2 bg-red-50 border border-red-200 rounded-lg flex items-center gap-1.5 text-red-700 text-xs">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {!isExecuted ? (
        <button
          type="button"
          onClick={handleConfirm}
          disabled={submitting || disabled}
          className="w-full py-2 bg-[#176B45] hover:bg-[#125335] disabled:bg-gray-400 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition shadow-xs"
        >
          {submitting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>{isMarathi ? 'प्रक्रिया सुरू आहे...' : 'Processing...'}</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isMarathi ? '✓ पुष्टी करा व सेव्ह करा' : '✓ Confirm & Save'}</span>
            </>
          )}
        </button>
      ) : (
        <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl font-bold flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{executionResult || (isMarathi ? 'कृती यशस्वीरित्या पूर्ण झाली!' : 'Action completed!')}</span>
        </div>
      )}
    </div>
  );
};
