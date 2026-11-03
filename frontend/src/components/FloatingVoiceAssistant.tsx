import React, { useRef, useEffect } from 'react';
import {
  Bot,
  Sparkles,
  X,
  Minus,
  Maximize2,
  Minimize2,
  Send,
  Mic,
  Volume2,
  User,
  Trash2,
  CheckCircle2,
  Loader2,
  Square,
} from 'lucide-react';
import { useLanguage } from '../app/LanguageContext';
import { useAssistant } from '../app/AssistantContext';
import { Badge } from './Badge';

export const FloatingVoiceAssistant: React.FC = () => {
  const { language, t } = useLanguage();
  const {
    isOpen,
    openAssistant,
    closeAssistant,
    isFullScreen,
    setIsFullScreen,
    messages,
    inputQuery,
    setInputQuery,
    loading,
    handleSend,
    isRecording,
    startVoiceRecording,
    stopVoiceRecording,
    audioLoadingIndex,
    speakWithSarvam,
    executingAction,
    handleExecuteAction,
    clearHistory,
  } = useAssistant();

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const isMarathi = language === 'mr-IN';
  const isHindi = language === 'hi-IN';

  useEffect(() => {
    if (isOpen && messagesEndRef.current && typeof messagesEndRef.current.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, isOpen]);

  const quickPrompts = {
    'mr-IN': [
      'आज लासलगावमध्ये कांद्याला काय भाव आहे?',
      'माझ्या शेतमालाच्या विक्रीचा हिशोब दाखवा',
      'सोयाबीनसाठी सर्वोत्तम मंडी कोणती?',
      'नफा व थकीत देणी सल्लागार दाखवा',
    ],
    'hi-IN': [
      'आज लासलगांव में प्याज का मॉडल भाव क्या है?',
      'मेरी कुल बकाया राशि दिखाएं',
      'सोयाबीन बेचने के लिए सबसे अच्छी मंडी कौन सी है?',
      'मुनाफा सलाहकार खोलें',
    ],
    'en-IN': [
      "What is today's modal price for Onion in Lasalgaon?",
      'Show my pending receivables and profit coach',
      'Best market recommendation for 50 Qtl Soybean',
      'Navigate to selling lots',
    ],
  };

  return (
    <>
      {/* Floating Trigger Button (Always visible on desktop and mobile when drawer is closed) */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => openAssistant()}
          className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 z-40 bg-[#176B45] hover:bg-[#125335] text-white p-3.5 sm:px-4 sm:py-3 rounded-full shadow-2xl flex items-center gap-2.5 transition-all transform hover:scale-105 active:scale-95 group cursor-pointer border-2 border-emerald-300/40"
          title={t.assistant.title}
          aria-label="Open Sarvam Voice Assistant"
        >
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <Sparkles className="w-3.5 h-3.5 text-[#E8B84A] absolute -top-1 -right-1 animate-pulse" />
          </div>
          <span className="font-bold text-sm tracking-wide hidden sm:inline-block">
            {t.assistant.title}
          </span>
          <span className="text-[10px] bg-[#E8B84A] text-gray-900 font-extrabold px-1.5 py-0.5 rounded-full hidden md:inline">
            Live
          </span>
        </button>
      )}

      {/* Expandable Universal Sarvam AI Chat Drawer */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Sarvam AI Assistant Panel"
          className={`fixed z-50 bg-white shadow-2xl border border-warm-300 flex flex-col transition-all duration-200 overflow-hidden ${
            isFullScreen
              ? 'inset-0 w-full h-full rounded-none'
              : 'bottom-4 right-4 md:bottom-6 md:right-6 w-[95vw] sm:w-[440px] h-[85vh] max-h-[640px] rounded-3xl'
          }`}
        >
          {/* Header */}
          <div className="bg-[#176B45] text-white px-4 py-3.5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center font-bold">
                <Bot className="w-5 h-5 text-[#E8B84A]" />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight flex items-center gap-1.5">
                  {isMarathi ? 'मंडीमित्र सर्वम AI सहाय्यक' : 'MandiMitra Sarvam AI'}
                  <Badge variant="warning" className="text-[10px] bg-amber-400 text-gray-900 py-0 px-1.5 font-bold">
                    Universal
                  </Badge>
                </h3>
                <span className="text-[11px] text-emerald-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  AGMARKNET • Saaras V4 • Bulbul V4
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={clearHistory}
                className="p-1.5 text-emerald-200 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer"
                title="Clear conversation"
                aria-label="Clear conversation"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setIsFullScreen((prev) => !prev)}
                className="p-1.5 text-emerald-200 hover:text-white hover:bg-white/10 rounded-lg transition hidden sm:block cursor-pointer"
                title={isFullScreen ? 'Exit fullscreen' : 'Fullscreen'}
                aria-label={isFullScreen ? 'Exit fullscreen' : 'Fullscreen'}
              >
                {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={closeAssistant}
                className="p-1.5 text-emerald-200 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer"
                title="Close assistant"
                aria-label="Close assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-gray-50/50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div
                  className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-xs font-bold ${
                    msg.role === 'user'
                      ? 'bg-emerald-700 text-white'
                      : 'bg-white border border-gray-200 text-[#176B45]'
                  }`}
                >
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div className="max-w-[85%] space-y-2">
                  <div
                    className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-[#176B45] text-white rounded-tr-none'
                        : 'bg-white text-gray-900 border border-gray-200 shadow-xs rounded-tl-none'
                    }`}
                  >
                    <div className="whitespace-pre-line">{msg.text}</div>

                    {msg.role === 'assistant' && (
                      <button
                        type="button"
                        onClick={() => speakWithSarvam(msg.text, idx)}
                        disabled={audioLoadingIndex === idx}
                        className="mt-2 text-[11px] text-[#176B45] font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        <Volume2
                          className={`w-3.5 h-3.5 ${audioLoadingIndex === idx ? 'animate-pulse text-amber-600' : ''}`}
                        />
                        {audioLoadingIndex === idx
                          ? 'आवाज तयार होत आहे...'
                          : isMarathi
                          ? 'सर्वम आवाजात ऐका'
                          : 'Listen (Bulbul V4)'}
                      </button>
                    )}
                  </div>

                  {/* Interactive Action Proposal Card */}
                  {msg.action_proposal && (
                    <div className="p-3.5 bg-white rounded-2xl border-2 border-emerald-500/80 shadow-md space-y-2 text-xs">
                      <div className="flex items-center justify-between border-b pb-1.5">
                        <span className="font-bold text-[#176B45] flex items-center gap-1 uppercase tracking-wide text-[10px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          कृती पुष्टीकरण • Action Confirmation
                        </span>
                        <span className="font-mono text-[10px] text-gray-500">
                          {msg.action_proposal.action}
                        </span>
                      </div>

                      <p className="font-bold text-gray-900">{msg.action_proposal.summary}</p>

                      <div className="bg-gray-50 p-2 rounded-xl space-y-1 text-gray-700 font-mono text-[11px]">
                        {Object.entries(msg.action_proposal.parameters).map(([k, v]) => (
                          <div key={k} className="flex justify-between">
                            <span className="text-gray-500">{k}:</span>
                            <span className="font-semibold text-gray-900">{String(v)}</span>
                          </div>
                        ))}
                      </div>

                      {!msg.executed ? (
                        <div className="flex gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => handleExecuteAction(idx, msg.action_proposal!)}
                            disabled={executingAction}
                            className="flex-1 py-2 bg-[#176B45] hover:bg-[#125335] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer transition"
                          >
                            {executingAction ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            )}
                            ✓ पुष्टी करा व सेव्ह करा
                          </button>
                        </div>
                      ) : (
                        <div className="p-2 bg-emerald-50 text-emerald-800 rounded-xl font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          {msg.executionResult}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-gray-500 p-2">
                <Loader2 className="w-4 h-4 text-[#176B45] animate-spin" />
                <span>सर्वम AI विचार करत आहे... / Thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="p-2 bg-white border-t border-gray-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            {quickPrompts[language as keyof typeof quickPrompts]?.slice(0, 3).map((prompt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSend(prompt)}
                className="px-2.5 py-1 bg-gray-100 hover:bg-emerald-50 hover:text-[#176B45] text-[11px] rounded-full whitespace-nowrap text-gray-700 transition cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Box with Voice & Send */}
          <div className="p-3 bg-white border-t border-gray-200 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <button
                type="button"
                onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                className={`p-2.5 rounded-xl transition cursor-pointer ${
                  isRecording
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-[#EAF3EA] text-[#176B45] hover:bg-emerald-100'
                }`}
                title={isRecording ? 'Stop recording' : 'Voice input (Saaras V4)'}
                aria-label={isRecording ? 'Stop voice recording' : 'Start voice recording'}
              >
                {isRecording ? <Square className="w-5 h-5 fill-current" /> : <Mic className="w-5 h-5" />}
              </button>

              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder={
                  isMarathi
                    ? 'काहीही विचारा किंवा आज्ञा द्या...'
                    : isHindi
                    ? 'पूछें या आदेश दें...'
                    : 'Ask anything or command action...'
                }
                className="flex-1 px-3 py-2 text-xs sm:text-sm rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#176B45]"
              />

              <button
                type="submit"
                disabled={!inputQuery.trim() || loading}
                className="p-2.5 bg-[#176B45] hover:bg-[#125335] disabled:opacity-40 text-white rounded-xl transition cursor-pointer"
                title="Send"
                aria-label="Send message"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
