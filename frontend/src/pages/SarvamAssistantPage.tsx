import React, { useState } from 'react';
import { useLanguage } from '../app/LanguageContext';
import { sarvamService } from '../services/sarvamService';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import {
  Bot,
  Mic,
  Send,
  Sparkles,
  Volume2,
  ShieldCheck,
  User,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';

export const SarvamAssistantPage: React.FC = () => {
  const { language, t } = useLanguage();

  const [inputQuery, setInputQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(false);

  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'assistant'; text: string }[]>([
    {
      role: 'assistant',
      text:
        language === 'mr-IN'
          ? 'रामराम! मी सर्वम AI कृषी बाजार आणि वित्तीय मित्र आहे. आपल्या पिकाचे भाव, नजीकच्या फायदेशीर बाजार समित्या, तोल पावती आणि कपातींचा हिशोब याबद्दल आपण मला थेट विचारू शकता.'
          : language === 'hi-IN'
          ? 'नमस्ते! मैं सर्वम AI कृषि व वित्तीय मित्र हूँ। अपनी फसल के भाव, मंडी चुनाव, तौल पर्ची और कटौती हिसाब के बारे में बेझिझक पूछें।'
          : 'Welcome! I am your Sarvam AI market intelligence and financial coach. Ask me anything about mandi rates, profitable selling windows, or weighing slip deductions.'
    }
  ]);

  const quickPrompts = {
    'mr-IN': [
      'आज लासलगावमध्ये कांद्याला काय मोडल भाव चालू आहे?',
      'सोयाबीन विक्रीवर अधिकृत हमाली व सेस कपात किती असावी?',
      'बारशी मंडीमध्ये सोयाबीनला इतर मंड्यांपेक्षा जास्त दर का आहे?',
      'व्यापाऱ्याकडून थकीत बाकी रक्कम कशी तपासावी?'
    ],
    'hi-IN': [
      'आज लासलगांव में प्याज का मॉडल भाव क्या है?',
      'सोयाबीन की बिक्री पर सही हम्माली व मंडी शुल्क कितना होना चाहिए?',
      'बारशी मंडी में सोयाबीन बेचने पर क्या फायदा मिलेगा?'
    ],
    'en-IN': [
      'What is today’s modal price for Onion in Lasalgaon?',
      'What are the standard permitted mandi cess and labor deductions?',
      'Which market gives the best return for 50 Quintals Soybean?'
    ]
  };

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || inputQuery;
    if (!textToSend.trim()) return;

    setChatHistory((prev) => [...prev, { role: 'user', text: textToSend.trim() }]);
    setInputQuery('');
    setLoading(true);

    try {
      const res = await sarvamService.askAssistant(textToSend.trim(), language);
      setChatHistory((prev) => [...prev, { role: 'assistant', text: res.reply }]);
    } catch (err: any) {
      setChatHistory((prev) => [
        ...prev,
        { role: 'assistant', text: 'सर्वम AI कडून प्रतिसाद मिळताना अडचण आली. कृपया पुन्हा प्रयत्न करा.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleMicToggle = () => {
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      const voiceSample =
        language === 'mr-IN'
          ? 'लासलगाव मंडीमध्ये कांद्याचा आजचा भाव काय आहे?'
          : language === 'hi-IN'
          ? 'लासलगांव में प्याज का आज का भाव क्या है?'
          : 'What is the price of Onion in Lasalgaon today?';
      setInputQuery(voiceSample);
    }, 1200);
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'mr-IN' ? 'mr-IN' : language === 'hi-IN' ? 'hi-IN' : 'en-IN';
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-forest-800 to-forest-700 p-6 sm:p-7 rounded-3xl text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-mustard-400">
            <Bot className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold">{t.assistant.title}</h1>
              <span className="text-xs bg-mustard-500 text-charcoal-900 font-bold px-2 py-0.5 rounded-full">
                sarvam-105b
              </span>
            </div>
            <p className="text-forest-100 text-xs sm:text-sm mt-0.5">
              {t.assistant.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs bg-white/10 px-3.5 py-2 rounded-xl self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4 text-mustard-400" />
          <span>AGMARKNET Verified</span>
        </div>
      </div>

      {/* Main Conversation Container */}
      <Card className="p-0 overflow-hidden shadow-sm flex flex-col h-[650px] border-warm-300">
        {/* Messages Scroll Area */}
        <div className="flex-1 p-5 sm:p-6 overflow-y-auto flex flex-col gap-4 bg-warm-100">
          {chatHistory.map((msg, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 max-w-[85%] ${
                msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  msg.role === 'user'
                    ? 'bg-forest-600 text-white'
                    : 'bg-white border border-warm-300 text-forest-700 shadow-xs'
                }`}
              >
                {msg.role === 'user' ? <User className="w-5 h-5" /> : <Sparkles className="w-5 h-5 text-mustard-600" />}
              </div>

              <div
                className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                  msg.role === 'user'
                    ? 'bg-forest-700 text-white rounded-tr-none'
                    : 'bg-white text-charcoal-900 border border-warm-300 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-line">{msg.text}</div>
                {msg.role === 'assistant' && (
                  <button
                    onClick={() => speakText(msg.text)}
                    className="mt-3 text-xs text-forest-700 font-bold flex items-center gap-1.5 hover:underline"
                  >
                    <Volume2 className="w-4 h-4" /> मोठ्याने ऐका (Voice Read)
                  </button>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2.5 text-xs font-semibold text-charcoal-700 mr-auto p-2">
              <div className="w-5 h-5 border-3 border-forest-600 border-t-transparent rounded-full animate-spin"></div>
              <span>सर्वम AI विचार करत आहे... / Sarvam AI is analyzing...</span>
            </div>
          )}
        </div>

        {/* Suggested Quick Question Chips */}
        <div className="p-3 sm:px-5 bg-white border-t border-warm-300 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <HelpCircle className="w-4 h-4 text-forest-700 shrink-0" />
          <span className="text-xs font-bold text-charcoal-700 shrink-0">{t.assistant.quickPromptsTitle}</span>
          {quickPrompts[language as keyof typeof quickPrompts]?.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              className="px-3.5 py-1.5 bg-warm-200 hover:bg-forest-50 hover:text-forest-700 border border-warm-300 rounded-full whitespace-nowrap text-xs text-charcoal-800 font-medium transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-warm-300 flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleMicToggle}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
              isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-forest-100 text-forest-700 hover:bg-forest-200'
            }`}
            title={t.assistant.speakBtn}
          >
            <Mic className="w-6 h-6" />
          </button>

          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={t.assistant.inputPlaceholder}
            className="flex-1 min-h-[48px] px-4 rounded-xl border border-warm-400 bg-warm-50 text-sm sm:text-base focus:outline-none focus:border-forest-600"
          />

          <Button
            type="button"
            variant="primary"
            onClick={() => handleSend()}
            disabled={!inputQuery.trim() || loading}
            className="w-12 h-12 !p-0 rounded-2xl shrink-0"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </Card>
    </div>
  );
};

