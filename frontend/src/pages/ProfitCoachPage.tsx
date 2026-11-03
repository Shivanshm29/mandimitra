import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  Users,
  PieChart,
  CheckCircle,
  Clock,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  ShieldAlert,
} from 'lucide-react';
import { useLanguage } from '../app/LanguageContext';
import { financeService } from '../services/financeService';
import type { ProfitCoachResponse } from '../types/profit_coach';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Badge } from '../components/Badge';

export const ProfitCoachPage: React.FC = () => {
  const { language, t } = useLanguage();
  const pc = t.profitCoach;
  const [data, setData] = useState<ProfitCoachResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await financeService.getProfitCoach();
      setData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load profit coach data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6">
        <RefreshCw className="h-10 w-10 text-[#176B45] animate-spin mb-3" />
        <h3 className="text-lg font-bold text-gray-800">
          {t.profitCoach.analyzingTitle}
        </h3>
        <p className="text-sm text-gray-500 max-w-sm mt-1">
          {t.profitCoach.analyzingSubtitle}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-700">
          <AlertCircle className="h-6 w-6 shrink-0" />
          <div className="flex-1">
            <h4 className="font-bold text-sm">{t.common.error}</h4>
            <p className="text-xs mt-0.5">{error}</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchData}>
            {t.profitCoach.refresh}
          </Button>
        </div>
      </div>
    );
  }

  const gross = Number(data?.total_gross_revenue || 0);
  const received = Number(data?.total_realized_revenue || 0);
  const outstanding = Number(data?.total_outstanding_receivable || 0);
  const collectionRate = Number(data?.collection_rate_percent || 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              {pc.title}
            </h1>
            <Badge variant="success" className="bg-[#EAF3EA] text-[#176B45] border-emerald-300">
              <Sparkles className="w-3.5 h-3.5 mr-1 inline" />
              Sarvam AI Grounded
            </Badge>
          </div>
          <p className="text-sm text-gray-600">{pc.subtitle}</p>
        </div>
        <Button
          variant="outline"
          onClick={fetchData}
          className="flex items-center gap-1.5 min-h-[44px] self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {pc.refresh}
        </Button>
      </div>

      {gross === 0 ? (
        <Card className="text-center py-12 px-4 border-dashed border-2 border-gray-200">
          <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-800">{pc.noSales}</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">{pc.noSalesDesc}</p>
        </Card>
      ) : (
        <>
          {/* Top 4 KPI Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <Card className="p-4 sm:p-5 bg-white border border-gray-100 shadow-xs">
              <span className="text-xs font-semibold text-gray-500 uppercase">{pc.grossRev}</span>
              <div className="text-xl sm:text-2xl font-black text-gray-900 mt-1">
                ₹{gross.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </Card>

            <Card className="p-4 sm:p-5 bg-white border border-gray-100 shadow-xs">
              <span className="text-xs font-semibold text-emerald-700 uppercase">{pc.receivedRev}</span>
              <div className="text-xl sm:text-2xl font-black text-emerald-700 mt-1">
                ₹{received.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </Card>

            <Card className="p-4 sm:p-5 bg-white border border-gray-100 shadow-xs">
              <span className="text-xs font-semibold text-amber-700 uppercase">{pc.outstandingRev}</span>
              <div className="text-xl sm:text-2xl font-black text-amber-700 mt-1">
                ₹{outstanding.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </div>
            </Card>

            <Card className="p-4 sm:p-5 bg-white border border-gray-100 shadow-xs">
              <span className="text-xs font-semibold text-gray-500 uppercase">{pc.collectionRate}</span>
              <div className="text-xl sm:text-2xl font-black text-gray-900 mt-1">
                {collectionRate.toFixed(1)}%
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-[#176B45] h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, collectionRate)}%` }}
                />
              </div>
            </Card>
          </div>

          {/* Actionable Advice Banner */}
          {data?.actionable_recommendations && data.actionable_recommendations.length > 0 && (
            <div className="bg-gradient-to-r from-[#176B45] to-[#125335] text-white p-5 rounded-2xl shadow-sm">
              <h3 className="text-base font-bold flex items-center gap-2 mb-2 text-[#E8B84A]">
                <Sparkles className="h-5 w-5" />
                {pc.recsTitle}
              </h3>
              <ul className="space-y-2 text-sm">
                {data.actionable_recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-white/10 p-2.5 rounded-xl">
                    <CheckCircle className="h-4 w-4 text-[#E8B84A] shrink-0 mt-0.5" />
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Realized vs Benchmark Rates */}
            <Card className="p-5 sm:p-6 bg-white border border-gray-100 shadow-xs">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-1">
                <TrendingUp className="h-5 w-5 text-[#176B45]" />
                {pc.realizedRatesTitle}
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                {pc.benchmarkDesc}
              </p>

              <div className="space-y-3">
                {data?.rate_comparisons.map((c, i) => {
                  const diff = Number(c.difference_per_unit);
                  const isAbove = c.performance === 'ABOVE_MARKET';
                  const isBelow = c.performance === 'BELOW_MARKET';

                  return (
                    <div
                      key={i}
                      className={`p-4 rounded-xl border transition ${
                        isAbove
                          ? 'bg-emerald-50/60 border-emerald-200'
                          : isBelow
                          ? 'bg-red-50/60 border-red-200'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <strong className="text-base font-bold text-gray-900">{c.commodity}</strong>
                        {isAbove ? (
                          <Badge variant="success" className="bg-emerald-100 text-emerald-800">
                            <ArrowUpRight className="w-3.5 h-3.5 inline mr-1" />
                            +₹{diff.toFixed(2)}/Qtl अधिक
                          </Badge>
                        ) : isBelow ? (
                          <Badge variant="danger" className="bg-red-100 text-red-800">
                            <ArrowDownRight className="w-3.5 h-3.5 inline mr-1" />
                            -₹{Math.abs(diff).toFixed(2)}/Qtl कमी
                          </Badge>
                        ) : (
                          <Badge variant="default" className="bg-gray-200 text-gray-700">
                            बाजारभावाच्या बरोबरीत
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs py-1 border-t border-b border-gray-200/50 mb-2">
                        <div>
                          <span className="text-gray-500">तुमचा सरासरी विक्री दर:</span>
                          <strong className="block text-gray-900 text-sm">
                            ₹{Number(c.farmer_realized_avg_rate).toFixed(2)}/Qtl
                          </strong>
                        </div>
                        <div>
                          <span className="text-gray-500">सरकारी बाजारभाव (Modal):</span>
                          <strong className="block text-gray-900 text-sm">
                            ₹{Number(c.mandi_benchmark_modal_rate).toFixed(2)}/Qtl
                          </strong>
                        </div>
                      </div>

                      <p className="text-xs text-gray-600">{c.explanation}</p>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Debtor Priority Radar */}
            <Card className="p-5 sm:p-6 bg-white border border-gray-100 shadow-xs">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-1">
                <Users className="h-5 w-5 text-amber-700" />
                {pc.debtorsTitle}
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                {pc.debtorsDesc}
              </p>

              {data?.trader_debtors.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  कोणतीही थकबाकी प्रलंबित नाही.
                </div>
              ) : (
                <div className="space-y-3">
                  {data?.trader_debtors.map((debtor, idx) => {
                    const outAmt = Number(debtor.outstanding_amount);
                    const isPriority = idx === 0 && outAmt > 0;

                    return (
                      <div
                        key={idx}
                        className={`p-4 rounded-xl border flex items-center justify-between gap-3 ${
                          isPriority
                            ? 'bg-amber-50/80 border-amber-300 shadow-xs'
                            : 'bg-white border-gray-200'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-gray-900 text-sm">{debtor.trader_name}</h4>
                            {isPriority && (
                              <Badge variant="warning" className="text-[10px] bg-amber-200 text-amber-900">
                                सर्वोच्च प्राधान्य (Top Priority)
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                            <span>{debtor.pending_sales_count} थकीत सौदे</span>
                            {debtor.oldest_unpaid_date && (
                              <span>जुनी तारीख: {debtor.oldest_unpaid_date}</span>
                            )}
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-base font-black text-amber-900 block">
                            ₹{outAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                          <span className="text-[11px] text-gray-500">येणे बाकी</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>

          {/* Deductions Audit */}
          <Card className="p-5 sm:p-6 bg-white border border-gray-100 shadow-xs">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-1">
              <PieChart className="h-5 w-5 text-indigo-700" />
              {pc.auditTitle}
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              {pc.auditDesc}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <span className="text-xs text-gray-500">एकूण कपाती (Total Deductions):</span>
                <div className="text-xl font-bold text-red-600 mt-1">
                  ₹{Number(data?.deduction_audit.total_deductions || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <span className="text-xs text-gray-500">उत्पन्नाच्या टक्केवारी (Deductions %):</span>
                <div className="text-xl font-bold text-gray-900 mt-1">
                  {Number(data?.deduction_audit.deductions_pct_of_gross || 0).toFixed(2)}%
                </div>
                <span className="text-[11px] text-gray-500">मानक प्रमाण २-४%</span>
              </div>

              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                <span className="text-xs text-gray-500">कपात प्रकार वर्गीकरण:</span>
                <div className="text-xs text-gray-700 mt-2 space-y-1">
                  {data?.deduction_audit.breakdown &&
                    Object.entries(data.deduction_audit.breakdown).map(([k, v]) => (
                      <div key={k} className="flex justify-between">
                        <span>{k}:</span>
                        <strong className="font-semibold">₹{Number(v).toFixed(2)}</strong>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Audit Anomaly Alerts */}
            {data?.deduction_audit.anomalies && data.deduction_audit.anomalies.length > 0 ? (
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-300 space-y-2">
                <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5 uppercase">
                  <ShieldAlert className="w-4 h-4 text-amber-700" />
                  पावती तपासणी सूचना (Fairness & APMC Regulation Warning)
                </h4>
                {data.deduction_audit.anomalies.map((anom, idx) => (
                  <p key={idx} className="text-xs text-amber-800 flex items-start gap-1.5">
                    <span className="font-bold">•</span>
                    <span>{anom}</span>
                  </p>
                ))}
              </div>
            ) : (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                कोणत्याही संशयास्पद किंवा अनधिकृत कपाती आढळल्या नाहीत. सर्व कपाती नियमानुसार आहेत.
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
};

