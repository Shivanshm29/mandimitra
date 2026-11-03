import React, { useEffect } from 'react';
import { useAssistant } from '../app/AssistantContext';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * VoiceAssistantModal shim: Delegates directly to the universal AssistantContext
 * to prevent duplicate chatbot state and ensure single unified conversation panel.
 */
export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({ isOpen, onClose }) => {
  const { openAssistant, closeAssistant } = useAssistant();

  useEffect(() => {
    if (isOpen) {
      openAssistant();
    } else {
      closeAssistant();
    }
  }, [isOpen, openAssistant, closeAssistant]);

  return null;
};
