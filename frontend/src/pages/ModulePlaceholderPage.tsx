import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../app/LanguageContext';
import { Card } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import {
  TrendingUp,
  Sparkles,
  FileText,
  IndianRupee,
  Bot,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react';

export const ModulePlaceholderPage: React.FC = () => {
  const { t } = useLanguage();
  const location = useLocation();

  const moduleConfigs: Record<string, { title: string; desc: string; icon: any; plannedFeatures: string[] }> = {
    '/mandi-intelligence': {
      title: t.dashboard.cardMandi.title,
      desc: t.dashboard.cardMandi.desc,
      icon: TrendingUp,
      plannedFeatures: [
        'अधिकृत सरकारी बाजारभाव एकत्रीकरण (AGMARKNET & Data.gov.in)',
        'किमान (Min), कमाल (Max) व मोडल (Modal) दर विश्लेषण',
        'जिल्हानिहाय व मुख्य पिकांनुसार थेट तुलना',
        'दर इतिहास आलेख (Price Trend Charts)',
      ],
    },
    '/selling-recommendations': {
      title: t.dashboard.cardRecommendations.title,
      desc: t.dashboard.cardRecommendations.desc,
      icon: Sparkles,
      plannedFeatures: [
        'पिकाचा प्रकार, जात आणि परिमाणावर आधारित बाजार निवड',
        'जवळच्या फायदेशीर मंड्यांचे मोडल दर तुलना',
        'अधिकृत आवक माहिती आणि पारदर्शक शिफारस कारणमीमांसा',
        'विक्रीची योग्य वेळ निश्चितीसाठी विश्लेषणात्मक मदत',
      ],
    },
    '/transactions': {
      title: t.dashboard.cardTransactions.title,
      desc: t.dashboard.cardTransactions.desc,
      icon: FileText,
      plannedFeatures: [
        'तोल पावती व विक्री तपशील नोंदणी (Commodity, Quantity, Rate)',
        'अधिकृत व अनधिकृत कपातींचे तपशील (Cess, Weigher, Hamali)',
        'व्यापारी/दलाल माहिती व संपर्क नोंदी',
        'दस्तावेज छायाचित्रे व पावती जोडणी',
      ],
    },
    '/payments': {
      title: t.dashboard.cardPayments.title,
      desc: t.dashboard.cardPayments.desc,
      icon: IndianRupee,
      plannedFeatures: [
        'रोख, UPI व धनादेश हप्ते नोंदणी',
        'एकाधिक विक्रींमध्ये पेमेंट वाटप (Payment Allocation)',
        'व्यापाऱ्यांकडील एकूण थकबाकी व बाकी रक्कम हिशोब',
        'निकाली अहवाल व पावत्या (Settlement Reports)',
      ],
    },
    '/sarvam-assistant': {
      title: t.dashboard.cardSarvam.title,
      desc: t.dashboard.cardSarvam.desc,
      icon: Bot,
      plannedFeatures: [
        'मराठी व हिंदी आवाज इनपुट (Saaras Speech-to-Text)',
        'पावती व दस्ताऐवज विश्लेषण (Sarvam Document Intelligence)',
        'नैसर्गिक आवाजात हिशोब समजावून सांगणे (Bulbul Text-to-Speech)',
        'सर्वम १०५-बी आधारित सुरक्षित कृषी आर्थिक सल्लागार',
      ],
    },
  };

  const currentModule = moduleConfigs[location.pathname] || {
    title: t.common.phaseNotice,
    desc: t.common.phaseNoticeDesc,
    icon: AlertTriangle,
    plannedFeatures: ['Phase 2 मधील अधिकृत एकत्रीकरण'],
  };

  const Icon = currentModule.icon;

  return (
    <div className="max-w-2xl mx-auto pt-4 sm:pt-8 flex flex-col gap-6">
      <Card className="border-warm-300">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-warm-300">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-forest-100 text-forest-700 flex items-center justify-center">
              <Icon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-charcoal-900">
                {currentModule.title}
              </h1>
              <Badge variant="development" className="mt-1">
                विकास सुरू आहे (Phase 2)
              </Badge>
            </div>
          </div>
        </div>

        {/* Financial Transparency Alert Box */}
        <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-4 sm:p-5 mb-6 flex items-start gap-3.5">
          <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs sm:text-sm text-charcoal-800 leading-relaxed">
            <strong className="font-bold text-amber-900 block mb-1">
              आर्थिक सत्यता व विश्वासार्हतेची हमी (Zero Fake Data Guarantee):
            </strong>
            मंडीमित्र मंचावर शेतकऱ्यांना दिशाभूल करणारे बनावट किंवा खोटे बाजारभाव व काल्पनिक नफा दाखवला जात नाही.
            हा विभाग पुढील टप्प्यात (Phase 2) प्रत्यक्ष सरकारी बाजारभाव व सर्वम AI प्रणालींशी पूर्ण सुरक्षिततेसह जोडला जाईल.
          </div>
        </div>

        {/* Planned Features List */}
        <div className="mb-6">
          <h2 className="text-sm font-bold text-charcoal-800 uppercase tracking-wide mb-3">
            या विभागात समाविष्ट असणाऱ्या सुविधा:
          </h2>
          <ul className="flex flex-col gap-2.5">
            {currentModule.plannedFeatures.map((feat, index) => (
              <li key={index} className="flex items-start gap-2.5 text-sm text-charcoal-800">
                <CheckCircle2 className="w-4 h-4 text-forest-600 shrink-0 mt-0.5" />
                <span>{feat}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Back Button */}
        <div className="pt-4 border-t border-warm-300">
          <Link to="/">
            <Button variant="outline" className="w-full sm:w-auto">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t.common.backToDashboard}
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};

