import React, { createContext, useContext, useState, useRef, useCallback } from 'react';

interface NotificationSettings {
  safeTokens: boolean;
  rugTokens: boolean;
}

interface SoundNotificationContextType {
  playNotificationSound: () => void;
  settings: NotificationSettings;
  toggleSafeTokens: () => void;
  toggleRugTokens: () => void;
}

const SoundNotificationContext = createContext<SoundNotificationContextType | undefined>(undefined);

export const SoundNotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<NotificationSettings>({
    safeTokens: true,
    rugTokens: true
  });
  const notificationSoundRef = useRef<HTMLAudioElement | null>(null);

  // Inicializar el sonido
  React.useEffect(() => {
    notificationSoundRef.current = new Audio('/sounds/notification.mp3');
    notificationSoundRef.current.load();

    return () => {
      if (notificationSoundRef.current) {
        notificationSoundRef.current.pause();
        notificationSoundRef.current = null;
      }
    };
  }, []);

  const playNotificationSound = useCallback(() => {
    if (notificationSoundRef.current) {
      notificationSoundRef.current.currentTime = 0;
      notificationSoundRef.current.play().catch(console.error);
    }
  }, []);

  const toggleSafeTokens = useCallback(() => {
    setSettings(prev => ({
      ...prev,
      safeTokens: !prev.safeTokens
    }));
  }, []);

  const toggleRugTokens = useCallback(() => {
    setSettings(prev => ({
      ...prev,
      rugTokens: !prev.rugTokens
    }));
  }, []);

  return (
    <SoundNotificationContext.Provider
      value={{
        playNotificationSound,
        settings,
        toggleSafeTokens,
        toggleRugTokens
      }}
    >
      {children}
    </SoundNotificationContext.Provider>
  );
};

export const useSoundNotification = () => {
  const context = useContext(SoundNotificationContext);
  if (context === undefined) {
    throw new Error('useSoundNotification must be used within a SoundNotificationProvider');
  }
  return context;
}; 