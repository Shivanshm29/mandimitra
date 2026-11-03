import React, { useState } from 'react';
import { useLanguage } from '../app/LanguageContext';
import { sarvamService } from '../services/sarvamService';
import { Button } from './Button';
import { X, Mic, Send, Bot, Sparkles, Volume2, CheckCircle2, User } from 'lucide-react';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({ isOpen, onClose }) => {
  const { language, t } = useLanguage();

  const [inputQuery, setInputQuery] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'assistant'; text: string }[]>([
    {
      role: 'assistant',
      text:
        language === 'mr-IN'
          ? 'रामराम! मी सर्वम AI कृषी व बाजारभाव सहाय्यक आहे. आपण मला कोणत्याही मंडीतील भाव, विक्री हिशोब किंवा तोल पावतीबद्दल विचारू शकता.'
          : language === 'hi-IN'
          ? 'नमस्ते! मैं सर्वम AI कृषि व मंडी भाव सहायक हूँ। आप मुझसे किसी भी मंडी के भाव, बिक्री हिसाब या तौल पर्ची के बारे में पूछ सकते हैं।'
          : 'Welcome! I am your Sarvam AI market and financial assistant. Ask me about mandi rates, selling decisions, or deduction accounting.'
    }
  ]);

  if (!isOpen) return null;

  const quickPrompts = {
    'mr-IN': [
      'आज लासलगावमध्ये कांद्याला काय मोडल भाव आहे?',
      'सोयाबीन विक्रीवर अधिकृत हमाली व सेस किती असावी?',
      'बारशी मंडीमध्ये सोयाबीनला चांगला भाव मिळेल का?',
      'तोल पावतीमधील कपातींचा हिशोब कसा तपासावा?'
    ],
    'hi-IN': [
      'आज लासलगांव में प्याज का मॉडल भाव क्या है?',
      'सोयाबीन बिक्री पर सही हम्माली और मंडी शुल्क क्या होना चाहिए?',
      'बारशी मंडी में सोयाबीन बेचने पर कितना फायदा होगा?'
    ],
    'en-IN': [
      'What is today’s modal price for Onion in Lasalgaon?',
      'Which market gives the best return for 50 Quintals Soybean?',
      'What are the standard permitted mandi cess and labor deductions?'
    ]
  };

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || inputQuery;
    if (!textToSend.trim()) return;

    // Add user message
    setChatHistory((prev) => [...prev, { role: 'user', text: textToSend.trim() }]);
    setInputQuery('');
    setLoading(true);

    try {
      const res = await sarvamService.askAssistant(textToSend.trim(), language);
      setChatHistory((prev) => [...prev, { role: 'assistant', text: res.reply }]);
    } catch (err: any) {
      setChatHistory((prev) => [
        ...prev,
        { role: 'assistant', text: 'माफ करा, सर्वम AI कडून प्रतिसाद मिळताना अडचण आली. कृपया पुन्हा प्रयत्न करा.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleMicToggle = () => {
    setIsListening(true);
    // Simulating quick voice capture for mobile responsiveness
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

  const [audioLoadingIndex, setAudioLoadingIndex] = useState<number | null>(null);

  const speakWithSarvam = async (text: string, index: number) => {
    try {
      setAudioLoadingIndex(index);
      const res = await sarvamService.textToSpeech(text, language);
      if (res.audio_base64) {
        const audio = new Audio(`data:audio/wav;base64,${res.audio_base64}`);
        await audio.play();
      } else {
        speakText(text);
      }
    } catch (err) {
      speakText(text);
    } finally {
      setAudioLoadingIndex(null);
    }
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
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-xl w-full max-h-[92dvh] sm:max-h-[88dvh] h-[90vh] flex flex-col shadow-2xl border border-warm-300 relative my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-forest-800 to-forest-700 p-4 sm:p-5 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-mustard-400 shrink-0">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base sm:text-lg">{t.assistant.title}</h2>
                <span className="text-[10px] bg-mustard-500 text-charcoal-900 font-bold px-2 py-0.5 rounded-full">
                  sarvam-105b
                </span>
              </div>
              <p className="text-xs text-forest-200">
                {t.assistant.subtitle}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-forest-100 hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat History Messages */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto flex flex-col gap-3.5 bg-warm-100">
          {chatHistory.map((msg, index) => (
            <div
              key={index}
              className={`flex items-start gap-2.5 max-w-[88%] ${
                msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  msg.role === 'user' ? 'bg-forest-600 text-white' : 'bg-white border border-warm-300 text-forest-700'
                }`}
              >
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4 text-mustard-600" />}
              </div>

              <div
                className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                  msg.role === 'user'
                    ? 'bg-forest-700 text-white rounded-tr-none'
                    : 'bg-white text-charcoal-900 border border-warm-300 rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-line">{msg.text}</div>
                {msg.role === 'assistant' && (
                  <button
                    onClick={() => speakWithSarvam(msg.text, i)}
                    disabled={audioLoadingIndex === i}
                    className="mt-2 text-[11px] text-forest-700 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <Volume2 className={`w-3.5 h-3.5 ${audioLoadingIndex === i ? 'animate-pulse text-amber-600' : ''}`} />
                    {audioLoadingIndex === i
                      ? 'आवाज तयार होत आहे...'
                      : language === 'mr-IN'
                      ? 'सर्वम आवाजात ऐका (Listen)'
                      : 'Listen with Sarvam AI'}
                  </button>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs font-semibold text-charcoal-700 mr-auto p-2">
              <div className="w-4 h-4 border-2 border-forest-600 border-t-transparent rounded-full animate-spin"></div>
              <span>सर्वम AI विचार करत आहे... / Thinking...</span>
            </div>
          )}
        </div>

        {/* Quick Question Chips */}
        <div className="p-2 sm:px-4 bg-white border-t border-warm-300 overflow-x-auto flex items-center gap-2 text-xs no-scrollbar">
          <span className="font-bold text-charcoal-700 shrink-0 text-[11px]">विचारू शकता:</span>
          {quickPrompts[language as keyof typeof quickPrompts]?.slice(0, 3).map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              className="px-3 py-1.5 bg-warm-200 hover:bg-forest-50 hover:text-forest-700 border border-warm-300 rounded-full whitespace-nowrap transition-colors text-charcoal-800 text-[11px]"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar with Mic & Send */}
        <div className="p-3 sm:p-4 bg-white border-t border-warm-300 flex items-center gap-2">
          <button
            type="button"
            onClick={handleMicToggle}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
              isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-forest-100 text-forest-700 hover:bg-forest-200'
            }`}
            title="बोलून विचारा (Voice input)"
          >
            <Mic className="w-6 h-6" />
          </button>

          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={
              language === 'mr-IN'
                ? 'कांदा, सोयाबीन भाव किंवा तोल पावतीबद्दल विचारा...'
                : language === 'hi-IN'
                ? 'मंडी भाव या बिक्री हिसाब के बारे में पूछें...'
                : 'Ask about mandi prices, deductions, or returns...'
            }
            className="flex-1 min-h-[48px] px-4 rounded-xl border border-warm-400 bg-warm-50 text-sm sm:text-base focus:outline-none focus:border-forest-600"
          />

          <Button
            type="button"
            variant="primary"
            onClick={() => handleSend()}
            disabled={!inputQuery.trim() || loading}
            className="w-12 h-12 !p-0 rounded-2xl"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

