import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type SettingsContextType = {
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  toggleSound: () => void;
  toggleVibration: () => void;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);

  // Uygulama açılınca kayıtlı ayarları yükle
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const sound = await AsyncStorage.getItem('soundEnabled');
      const vibration = await AsyncStorage.getItem('vibrationEnabled');
      
      if (sound !== null) setSoundEnabled(JSON.parse(sound));
      if (vibration !== null) setVibrationEnabled(JSON.parse(vibration));
    } catch (e) {
      console.error('Ayarlar yüklenemedi', e);
    }
  };

  const toggleSound = async () => {
    try {
      const newValue = !soundEnabled;
      setSoundEnabled(newValue);
      await AsyncStorage.setItem('soundEnabled', JSON.stringify(newValue));
    } catch (e) {
      console.error('Ses ayarı kaydedilemedi');
    }
  };

  const toggleVibration = async () => {
    try {
      const newValue = !vibrationEnabled;
      setVibrationEnabled(newValue);
      await AsyncStorage.setItem('vibrationEnabled', JSON.stringify(newValue));
    } catch (e) {
      console.error('Titreşim ayarı kaydedilemedi');
    }
  };

  return (
    <SettingsContext.Provider value={{ soundEnabled, vibrationEnabled, toggleSound, toggleVibration }}>
      {children}
    </SettingsContext.Provider>
  );
};

// Kolay kullanım için hook
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};