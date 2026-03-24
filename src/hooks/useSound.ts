import { Audio } from 'expo-av';
import { useSettings } from '../context/SettingsContext'; // Ayar Context'ini çağırdık

const sounds: { [key: string]: any } = {
  success: require('../../assets/sounds/success.mp3'),
  click: require('../../assets/sounds/click.mp3'),
  drumRoll: require('../../assets/sounds/drum-roll.mp3'),
  coinFlip: require('../../assets/sounds/coin-flip.mp3'),
  diceRoll: require('../../assets/sounds/dice-roll.mp3'),
  wheelSpin: require('../../assets/sounds/wheel-spin.mp3'),
};

// Artık bu bir "Hook" oldu (useSound)
export const useSound = () => {
  // Global ayarı buradan okuyoruz
  const { soundEnabled } = useSettings();

  const playSound = async (soundName: keyof typeof sounds) => {
    // KRİTİK NOKTA: Eğer ses ayarı kapalıysa, fonksiyonu burada durdur.
    if (!soundEnabled) {
      return; 
    }

    try {
      const { sound } = await Audio.Sound.createAsync(sounds[soundName]);
      await sound.playAsync();
      
      sound.setOnPlaybackStatusUpdate((status: any) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.log('Ses çalma hatası:', error);
    }
  };

  // Fonksiyonu geri döndür
  return playSound;
};