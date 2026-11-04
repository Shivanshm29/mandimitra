import React from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Bot,
  MessageSquare,
  X,
  Loader2,
  CheckCircle2,
  Gauge,
} from 'lucide-react';
import { useAssistant } from '../app/AssistantContext';
import { useLanguage } from '../app/LanguageContext';
import { MarkdownView } from './MarkdownView';
import { ActionProposalCard } from './ActionProposalCard';

export const DashboardVoiceAssistant: React.FC = () => {
  const {
    dashboardVoiceState,
    dashboardTranscript,
    dashboardMessage,
    startDashboardVoice,
    stopDashboardVoice,
    playingIndex,
    isAudioPaused,
    isLoadingAudio,
    playbackRate,
    playAudio,
    pauseAudio,
    resumeAudio,
    stopAudio,
    replayAudio,
    cyclePlaybackRate,
    openAssistant,
    handleExecuteAction,
    messages,
  } = useAssistant();

  const { language, t } = useLanguage();
  const isMarathi = language === 'mr-IN';
  const isHindi = language === 'hi-IN';

  const isIdle = dashboardVoiceState === 'idle';
  const isListening = dashboardVoiceState === 'listening';
  const isProcessing = dashboardVoiceState === 'processing';
  const isSpeaking = dashboardVoiceState === 'speaking';

  // If completely idle and no dashboard message, show the primary hero button
  return (
    <div className="w-full">
      {/* 1. Main Action Trigger Button (When idle or ready for new voice request) */}
      {isIdle && !dashboardMessage && (
        <button
          type="button"
          onClick={() => startDashboardVoice()}
          className="px-5 py-3.5 bg-mustard-500 hover:bg-mustard-400 text-charcoal-900 rounded-2xl font-bold shadow-lg flex items-center gap-2.5 transition-all transform active:scale-95 text-sm sm:text-base cursor-pointer border border-mustard-300"
          title={isMarathi ? 'माईक सुरू करा व थेट बोला' : 'Start voice conversation directly'}
          aria-label={t.dashboard.askSarvamVoiceBtn}
        >
          <div className="w-8 h-8 rounded-xl bg-charcoal-900 text-mustard-400 flex items-center justify-center">
            <Mic className="w-5 h-5 animate-pulse" />
          </div>
          <span>{t.dashboard.askSarvamVoiceBtn}</span>
        </button>
      )}

      {/* 2. Active Voice Interaction Banner on Dashboard */}
      {(!isIdle || dashboardMessage) && (
        <div className="w-full bg-white rounded-3xl p-5 sm:p-6 border-2 border-emerald-600 shadow-xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header Strip */}
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#176B45] flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-gray-900 flex items-center gap-1.5">
                  {isMarathi ? 'मंडीमित्र सर्वम AI व्हॉइस सहाय्यक' : 'MandiMitra Sarvam AI Voice'}
                  <span className="text-[10px] bg-amber-400 text-gray-900 px-2 py-0.5 rounded-full font-bold">
                    Bulbul V4 Live
                  </span>
                </h3>
                <span className="text-[11px] text-gray-500">
                  {isListening
                    ? isMarathi
                      ? 'आपला आवाज ऐकत आहे...'
                      : 'Listening to your voice...'
                    : isProcessing
                    ? isMarathi
                      ? 'माहिती तपासली जात आहे...'
                      : 'Analyzing market data...'
                    : isSpeaking
                    ? isMarathi
                      ? 'सर्वम AI उत्तर देत आहे...'
                      : 'Speaking response...'
                    : isMarathi
                    ? 'थेट व्हॉइस संवाद'
                    : 'Voice response ready'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  stopDashboardVoice();
                  openAssistant();
                }}
                className="text-xs text-[#176B45] hover:text-emerald-800 font-bold px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 flex items-center gap-1.5 transition cursor-pointer"
                title={isMarathi ? 'पूर्ण चॅट पॅनेल उघडा' : 'Open full chat panel'}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">
                  {isMarathi ? 'पूर्ण चॅट उघडा' : 'Open Full Chat'}
                </span>
              </button>
              <button
                type="button"
                onClick={stopDashboardVoice}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition cursor-pointer"
                title={isMarathi ? 'बंद करा' : 'Close voice assistant'}
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Listening Indicator with Audio Pulse Waves */}
          {isListening && (
            <div className="py-4 px-4 bg-amber-50 rounded-2xl border border-amber-300 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-md animate-pulse">
                    <Mic className="w-6 h-6" />
                  </div>
                  <span className="absolute -inset-1 rounded-full border-2 border-amber-400 animate-ping opacity-75"></span>
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-sm">
                    {isMarathi ? 'ऐकत आहे... कृपया बोला' : 'Listening... Speak now'}
                  </div>
                  <div className="text-xs text-amber-900/80">
                    {isMarathi
                      ? 'उदा. "आज लासलगावमध्ये कांद्याला काय भाव आहे?" किंवा "माझी विक्री नोंदवा"'
                      : 'e.g., "What is today’s onion rate in Lasalgaon?" or "Show my sales"'}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={stopDashboardVoice}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition"
              >
                <MicOff className="w-4 h-4" />
                <span>{isMarathi ? 'थांबवा / Stop' : 'Stop Recording'}</span>
              </button>
            </div>
          )}

          {/* Processing Indicator */}
          {isProcessing && (
            <div className="py-4 px-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-center gap-3 text-emerald-800">
              <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
              <span className="text-xs sm:text-sm font-semibold">
                {isMarathi
                  ? 'सर्वम AI अधिकृत भाव व माहिती तपासत आहे...'
                  : 'Sarvam AI is analyzing AGMARKNET mandi rates and farmer context...'}
              </span>
            </div>
          )}

          {/* Recognized Farmer Transcript */}
          {dashboardTranscript && (
            <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 flex items-start gap-2.5">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide shrink-0 pt-0.5">
                {isMarathi ? 'आपण विचारले:' : 'You asked:'}
              </span>
              <p className="text-xs sm:text-sm font-semibold text-gray-900">
                "{dashboardTranscript}"
              </p>
            </div>
          )}

          {/* Formatted Response Display & Spoken Audio Controls */}
          {dashboardMessage && (
            <div className="space-y-3">
              <div className="p-4 bg-emerald-50/40 rounded-2xl border border-emerald-200/80">
                <MarkdownView content={dashboardMessage.text} />

                {/* Spoken Audio Controls Strip (Requirement 2 & 3) */}
                <div className="mt-3 pt-3 border-t border-emerald-200/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    {/* Play / Pause Toggle */}
                    <button
                      type="button"
                      onClick={() => {
                        const targetIdx = messages.length - 1;
                        playAudio(targetIdx, dashboardMessage.text, dashboardMessage.speech_text, dashboardMessage.language);
                      }}
                      className="px-3 py-1.5 bg-[#176B45] hover:bg-[#125335] text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition"
                      title={playingIndex !== null ? 'Pause / Resume' : 'Play aloud'}
                    >
                      {playingIndex !== null && !isAudioPaused ? (
                        <>
                          <Pause className="w-3.5 h-3.5" />
                          <span>{isMarathi ? 'थांबवा (Pause)' : 'Pause'}</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5" />
                          <span>
                            {isAudioPaused
                              ? isMarathi
                                ? 'सुरू करा (Resume)'
                                : 'Resume'
                              : isMarathi
                              ? 'पुन्हा ऐका (Listen)'
                              : 'Listen (Bulbul V4)'}
                          </span>
                        </>
                      )}
                    </button>

                    {/* Immediate Stop Button */}
                    {playingIndex !== null && (
                      <button
                        type="button"
                        onClick={stopAudio}
                        className="px-2.5 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-xl flex items-center gap-1 cursor-pointer transition"
                        title="Stop audio completely"
                      >
                        <VolumeX className="w-3.5 h-3.5" />
                        <span>{isMarathi ? 'बंद करा' : 'Stop'}</span>
                      </button>
                    )}

                    {/* Replay Button */}
                    <button
                      type="button"
                      onClick={() => {
                        const targetIdx = messages.length - 1;
                        replayAudio(targetIdx, dashboardMessage.text, dashboardMessage.speech_text, dashboardMessage.language);
                      }}
                      className="p-1.5 text-gray-600 hover:text-emerald-800 hover:bg-emerald-100 rounded-lg transition cursor-pointer"
                      title="Replay speech from start"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>

                    {/* Playback Speed Controller */}
                    <button
                      type="button"
                      onClick={cyclePlaybackRate}
                      className="px-2 py-1 text-[11px] font-mono bg-white text-emerald-900 border border-emerald-300 font-bold rounded-lg hover:bg-emerald-50 transition cursor-pointer"
                      title="Cycle speed: 1.0x -> 1.2x -> 0.9x"
                    >
                      {playbackRate}x
                    </button>
                  </div>

                  {/* Sound Wave Animation if Playing */}
                  {playingIndex !== null && !isAudioPaused && (
                    <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-800">
                      <span className="w-1 h-3 bg-emerald-600 rounded-full animate-bounce"></span>
                      <span className="w-1 h-4 bg-emerald-600 rounded-full animate-bounce [animation-delay:0.15s]"></span>
                      <span className="w-1 h-2 bg-emerald-600 rounded-full animate-bounce [animation-delay:0.3s]"></span>
                      <span className="ml-1">{isMarathi ? 'सर्वम बोलत आहे' : 'Speaking (Bulbul V4)'}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Proposal Confirmation Card (if AI suggested a sale, payment, or lot creation) */}
              {dashboardMessage.action_proposal && (
                <ActionProposalCard
                  proposal={dashboardMessage.action_proposal}
                  isExecuted={dashboardMessage.executed}
                  executionResult={dashboardMessage.executionResult}
                  onExecute={async (prop) => {
                    const msgIdx = messages.length - 1;
                    await handleExecuteAction(msgIdx, prop);
                  }}
                />
              )}

              {/* Action Buttons to Ask Another Question or Open Full Chat */}
              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => startDashboardVoice()}
                  className="px-4 py-2 bg-mustard-500 hover:bg-mustard-400 text-charcoal-900 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs transition"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>{isMarathi ? 'पुन्हा विचारा (Ask Again)' : 'Ask Another Question'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    stopAudio();
                    openAssistant();
                  }}
                  className="text-xs text-gray-600 hover:text-emerald-800 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span>{isMarathi ? 'पूर्ण चॅट पॅनेलमध्ये चालू ठेवा' : 'Continue in Full Chat'}</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
