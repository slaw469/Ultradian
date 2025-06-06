"use client";

import { useState, useEffect, useCallback } from 'react';
import { extensionDetector, ExtensionStatus, ExtensionPreferences } from '@/lib/utils/extension-detection';

export interface UseExtensionReturn {
  status: ExtensionStatus;
  preferences: ExtensionPreferences;
  isLoading: boolean;
  shouldShowPrompt: boolean;
  dismissPrompt: () => void;
  setReminderFrequency: (frequency: 'never' | 'weekly' | 'monthly') => void;
  installExtension: () => void;
  checkStatus: () => Promise<void>;
}

export function useExtension(): UseExtensionReturn {
  const [status, setStatus] = useState<ExtensionStatus>({ installed: false, communicating: false });
  const [preferences, setPreferences] = useState<ExtensionPreferences>(extensionDetector.getPreferences());
  const [isLoading, setIsLoading] = useState(true);
  const [shouldShowPrompt, setShouldShowPrompt] = useState(false);

  // Check extension status on mount and periodically
  const checkStatus = useCallback(async () => {
    try {
      const newStatus = await extensionDetector.checkExtensionStatus();
      setStatus(newStatus);
      
      const currentPrefs = extensionDetector.getPreferences();
      setPreferences(currentPrefs);
      
      const shouldShow = extensionDetector.shouldShowPrompt();
      setShouldShowPrompt(shouldShow);
    } catch (error) {
      console.error('Failed to check extension status:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkStatus();

    // Check extension status periodically
    const interval = setInterval(checkStatus, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [checkStatus]);

  const dismissPrompt = useCallback(() => {
    extensionDetector.dismissPrompt();
    const newPrefs = extensionDetector.getPreferences();
    setPreferences(newPrefs);
    setShouldShowPrompt(false);
  }, []);

  const setReminderFrequency = useCallback((frequency: 'never' | 'weekly' | 'monthly') => {
    extensionDetector.setReminderFrequency(frequency);
    const newPrefs = extensionDetector.getPreferences();
    setPreferences(newPrefs);
    setShouldShowPrompt(extensionDetector.shouldShowPrompt());
  }, []);

  const installExtension = useCallback(() => {
    extensionDetector.markInstallationPrompted();
    const installUrl = extensionDetector.getInstallationUrl();
    window.open(installUrl, '_blank');
    
    // Update preferences
    const newPrefs = extensionDetector.getPreferences();
    setPreferences(newPrefs);

    // Check status again in a few seconds to see if extension was installed
    setTimeout(checkStatus, 3000);
  }, [checkStatus]);

  return {
    status,
    preferences,
    isLoading,
    shouldShowPrompt,
    dismissPrompt,
    setReminderFrequency,
    installExtension,
    checkStatus,
  };
} 