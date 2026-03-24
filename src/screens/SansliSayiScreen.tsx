import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../constants/Colors';
import { useSound } from '../hooks/useSound';

export default function SansliSayiScreen() {
  const navigation = useNavigation();
  const playSound = useSound();

  const [minVal, setMinVal] = useState('1');
  const [maxVal, setMaxVal] = useState('100');
  const [quantity, setQuantity] = useState('1');
  const [results, setResults] = useState<number[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [displayNumber, setDisplayNumber] = useState<string>('?'); // Animasyon için

  const generateNumbers = () => {
    const min = parseInt(minVal);
    const max = parseInt(maxVal);
    const qty = parseInt(quantity);

    if (isNaN(min) || isNaN(max) || isNaN(qty)) {
      alert('Lütfen geçerli sayılar girin.');
      return;
    }

    if (min >= max) {
      alert('Min değer Max değerden küçük olmalıdır.');
      return;
    }

    if (qty > 10) {
      alert('Tek seferde en fazla 10 sayı üretebilirsiniz.');
      return;
    }

    Keyboard.dismiss();
    setIsGenerating(true);
    setResults([]);
    playSound('drumRoll');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Animasyon Efekti: Sayılar hızlıca değişsin
    let counter = 0;
    const interval = setInterval(() => {
      // Rastgele bir görsel sayı göster
      const tempNum = Math.floor(Math.random() * (max - min + 1)) + min;
      setDisplayNumber(tempNum.toString());
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      counter++;
      if (counter > 15) { // Yaklaşık 1.5 saniye sürsün
        clearInterval(interval);
        finalizeResults(min, max, qty);
      }
    }, 80);
  };

  const finalizeResults = (min: number, max: number, qty: number) => {
    const newResults: number[] = [];
    const pool = [];

    // Tekrar eden sayılar olabilir mi? Basitlik için olabilir diyelim.
    // Eğer benzersiz istersen set/pool mantığı gerekir.
    for (let i = 0; i < qty; i++) {
      newResults.push(Math.floor(Math.random() * (max - min + 1)) + min);
    }

    setResults(newResults);
    setDisplayNumber(newResults[0].toString()); // İlk sonucu ana ekrana koy
    setIsGenerating(false);
    playSound('success');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Geri</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🔢 Şanslı Sayı</Text>
      </View>

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.content}
        >
          {/* Sonuç Ekranı */}
          <View style={styles.resultDisplay}>
            {isGenerating ? (
              <Text style={styles.bigNumber}>{displayNumber}</Text>
            ) : results.length > 0 ? (
              <View style={styles.resultsGrid}>
                {results.map((res, index) => (
                  <View key={index} style={styles.resultBadge}>
                    <Text style={styles.resultText}>{res}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.placeholderContainer}>
                <Text style={styles.placeholderEmoji}>🎰</Text>
                <Text style={styles.placeholderText}>Aralığı belirle ve üret!</Text>
              </View>
            )}
          </View>

          {/* Ayarlar Alanı */}
          <View style={styles.controlsContainer}>
            <View style={styles.row}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Min</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="number-pad"
                  value={minVal}
                  onChangeText={setMinVal}
                  maxLength={5}
                  selectTextOnFocus
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Max</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="number-pad"
                  value={maxVal}
                  onChangeText={setMaxVal}
                  maxLength={6}
                  selectTextOnFocus
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Adet</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="number-pad"
                  value={quantity}
                  onChangeText={(t) => {
                    // Sadece 1-10 arası girişe izin ver
                    if (t === '' || (parseInt(t) > 0 && parseInt(t) <= 10)) {
                      setQuantity(t);
                    }
                  }}
                  maxLength={2}
                  selectTextOnFocus
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.generateButton, isGenerating && styles.buttonDisabled]}
              onPress={generateNumbers}
              disabled={isGenerating}
            >
              <Text style={styles.generateButtonText}>
                {isGenerating ? 'Üretiliyor...' : '🎲 Sayı Üret'}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primary },
  header: { backgroundColor: Colors.primary, paddingTop: 10, paddingBottom: 20, paddingHorizontal: 20 },
  backButton: { marginBottom: 10 },
  backButtonText: { color: '#FFFFFF', fontSize: 16 },
  headerTitle: { color: '#FFFFFF', fontSize: 24, fontWeight: 'bold' },
  content: { flex: 1, backgroundColor: Colors.background },

  resultDisplay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  bigNumber: {
    fontSize: Math.min(120, Dimensions.get('window').width * 0.3),
    fontWeight: 'bold',
    color: Colors.primary,
    includeFontPadding: false,
  },
  resultsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  },
  resultBadge: {
    width: Math.min(80, Dimensions.get('window').width / 5),
    height: Math.min(80, Dimensions.get('window').width / 5),
    borderRadius: Math.min(40, Dimensions.get('window').width / 10),
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  resultText: {
    color: '#FFFFFF',
    fontSize: Math.min(28, Dimensions.get('window').width / 14),
    fontWeight: 'bold',
  },
  placeholderContainer: { alignItems: 'center' },
  placeholderEmoji: { fontSize: 60, marginBottom: 10, opacity: 0.8 },
  placeholderText: { fontSize: 16, color: Colors.textLight },

  controlsContainer: {
    backgroundColor: Colors.card,
    padding: 25,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 15,
    marginBottom: 25,
  },
  inputGroup: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: Colors.textLight,
    marginBottom: 8,
    textAlign: 'center',
  },
  input: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingVertical: 12,
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
  },
  generateButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: Colors.border,
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});