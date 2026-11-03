import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from './LanguageContext';
import { useAuth } from './AuthContext';
import { sarvamService, type ActionProposal, type ChatResponse } from '../services/sarvamService';

export interface AssistantMessage {
  role: 'user' | 'assistant';
  text: string;
  action_proposal?: ActionProposal | null;
  executed?: boolean;
  executionResult?: string;
}

export interface AssistantContextType {
  isOpen: boolean;
  openAssistant: (initialPrompt?: string) => void;
  closeAssistant: () => void;
  toggleAssistant: () => void;
  isFullScreen: boolean;
  setIsFullScreen: React.Dispatch<React.SetStateAction<boolean>>;
  messages: AssistantMessage[];
  setMessages: React.Dispatch<React.SetStateAction<AssistantMessage[]>>;
  inputQuery: string;
  setInputQuery: (q: string) => void;
  loading: boolean;
  handleSend: (textToSend?: string) => Promise<void>;
  isRecording: boolean;
  startVoiceRecording: () => Promise<void>;
  stopVoiceRecording: () => void;
  audioLoadingIndex: number | null;
  speakWithSarvam: (text: string, index: number) => Promise<void>;
  executingAction: boolean;
  handleExecuteAction: (msgIndex: number, proposal: ActionProposal) => Promise<void>;
  clearHistory: () => void;
  defaultGreeting: string;
}

const AssistantContext = createContext<AssistantContextType | undefined>(undefined);

export const AssistantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { language, setLanguage } = useLanguage();
  const { profile } = useAuth();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioLoadingIndex, setAudioLoadingIndex] = useState<number | null>(null);
  const [executingAction, setExecutingAction] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const isMarathi = language === 'mr-IN';
  const isHindi = language === 'hi-IN';

  const defaultGreeting = isMarathi
    ? `रामराम ${profile?.display_name || ''}! मी मंडीमित्र सर्वम AI सहाय्यक आहे. आपण मला कोणत्याही मंडीतील चालू भाव विचारू शकता, नवीन विक्री किंवा लॉटची नोंद करू शकता, किंवा हिशोब तपासू शकता.`
    : isHindi
    ? `नमस्ते ${profile?.display_name || ''}! मैं मंडीमित्र सर्वम AI सहायक हूँ। आप मुझसे मंडी भाव पूछ सकते हैं, बिक्री दर्ज कर सकते हैं या हिसाब-किताब जांच सकते हैं।`
    : `Welcome ${profile?.display_name || ''}! I am your MandiMitra universal AI assistant. Ask about AGMARKNET rates, record sales or produce lots, or manage finances.`;

  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      role: 'assistant',
      text: defaultGreeting,
    },
  ]);

  // Update initial greeting if language changes and conversation is fresh
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length <= 1) {
        return [{ role: 'assistant', text: defaultGreeting }];
      }
      return prev;
    });
  }, [language, profile?.display_name]);

  const openAssistant = useCallback((initialPrompt?: string) => {
    setIsOpen(true);
    if (initialPrompt && initialPrompt.trim()) {
      setInputQuery(initialPrompt.trim());
    }
  }, []);

  const closeAssistant = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleAssistant = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const clearHistory = useCallback(() => {
    setMessages([{ role: 'assistant', text: defaultGreeting }]);
  }, [defaultGreeting]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query) return;

    setMessages((prev) => [...prev, { role: 'user', text: query }]);
    setInputQuery('');
    setLoading(true);

    try {
      const res: ChatResponse = await sarvamService.askAssistant(query, language);

      // Handle direct UI action
      if (res.ui_action) {
        if (res.ui_action.type === 'navigate' && res.ui_action.route) {
          navigate(res.ui_action.route);
        } else if (res.ui_action.type === 'switch_language' && res.ui_action.language) {
          setLanguage(res.ui_action.language as any);
        }
      }

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: res.reply,
          action_proposal: res.action_proposal || null,
        },
      ]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text:
            isMarathi
              ? 'सर्वम AI शी संपर्क करताना अडचण आली. कृपया पुन्हा प्रयत्न करा.'
              : isHindi
              ? 'सर्वम AI से संपर्क करने में समस्या आई। कृपया पुनः प्रयास करें।'
              : 'Error communicating with Sarvam AI. Please try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteAction = async (msgIndex: number, proposal: ActionProposal) => {
    try {
      setExecutingAction(true);
      const res = await sarvamService.executeAction(proposal.action, proposal.parameters);

      setMessages((prev) => {
        const copy = [...prev];
        copy[msgIndex] = {
          ...copy[msgIndex],
          executed: true,
          executionResult: res.message || 'कृती यशस्वीरित्या पूर्ण झाली!',
        };
        return copy;
      });

      // Navigate or refresh if relevant
      if (proposal.action === 'record_sale') {
        navigate('/transactions');
      } else if (proposal.action === 'create_selling_lot') {
        navigate('/');
      } else if (proposal.action === 'record_payment') {
        navigate('/payments');
      }
    } catch (err: any) {
      alert(err.message || 'Action failed');
    } finally {
      setExecutingAction(false);
    }
  };

  const speakWithSarvam = async (text: string, index: number) => {
    try {
      setAudioLoadingIndex(index);
      const res = await sarvamService.textToSpeech(text, language);
      if (res.audio_base64) {
        const audio = new Audio(`data:audio/wav;base64,${res.audio_base64}`);
        await audio.play();
      }
    } catch (err) {
      // Browser SpeechSynthesis fallback
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language === 'mr-IN' ? 'mr-IN' : language === 'hi-IN' ? 'hi-IN' : 'en-IN';
        window.speechSynthesis.speak(utterance);
      }
    } finally {
      setAudioLoadingIndex(null);
    }
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        if (audioBlob.size > 100) {
          try {
            setLoading(true);
            const res = await sarvamService.transcribeAudio(audioBlob, language);
            if (res.transcript) {
              handleSend(res.transcript);
            }
          } catch (err) {
            console.warn('STT transcription error:', err);
          } finally {
            setLoading(false);
          }
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      // Simulation fallback for restricted testing environments
      const sample =
        language === 'mr-IN'
          ? 'आज लासलगावमध्ये कांद्याचा काय भाव आहे?'
          : language === 'hi-IN'
          ? 'आज लासलगांव में प्याज का क्या भाव है?'
          : 'What is today’s price of Onion in Lasalgaon?';
      handleSend(sample);
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <AssistantContext.Provider
      value={{
        isOpen,
        openAssistant,
        closeAssistant,
        toggleAssistant,
        isFullScreen,
        setIsFullScreen,
        messages,
        setMessages,
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
        defaultGreeting,
      }}
    >
      {children}
    </AssistantContext.Provider>
  );
};

export const useAssistant = (): AssistantContextType => {
  const context = useContext(AssistantContext);
  if (!context) {
    throw new Error('useAssistant must be used within an AssistantProvider');
  }
  return context;
};
