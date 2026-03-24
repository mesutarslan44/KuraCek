import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Platform,
  Share,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../constants/Colors';
import { useSound } from '../hooks/useSound';

// --- DÜZELTİLMİŞ 3D ZAR YÜZÜ BİLEŞENİ ---
const DiceFace = ({ number }: { number: number }) => {
  const renderDots = () => {
    // Nokta pozisyonları
    const dotPositions: { [key: number]: string[] } = {
      1: ['center'],
      2: ['topLeft', 'bottomRight'],
      3: ['topLeft', 'center', 'bottomRight'],
      4: ['topLeft', 'topRight', 'bottomLeft', 'bottomRight'],
      5: ['topLeft', 'topRight', 'center', 'bottomLeft', 'bottomRight'],
      6: ['topLeft', 'topRight', 'centerLeft', 'centerRight', 'bottomLeft', 'bottomRight'],
    };

    const positions = dotPositions[number] || [];

    return positions.map((pos, index) => (
      // DÜZELTME BURADA YAPILDI: (styles as any)[pos]
      <View key={index} style={[styles.dot, (styles as any)[pos]]} />
    ));
  };

  return (
    <View style={styles.dice3DContainer}>
      <View style={styles.diceFaceHighlight} />
      <View style={styles.dotsContainer}>
        {renderDots()}
      </View>
    </View>
  );
};
// ------------------------------------

export default function ZarAtScreen() {
  const navigation = useNavigation();
  const playSound = useSound();
  const [diceCount, setDiceCount] = useState<number>(1);
  const [results, setResults] = useState<number[]>([]);
  const [isRolling, setIsRolling] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const rotateYAnim = useRef(new Animated.Value(0)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  // Paylaşım fonksiyonu
  const shareResult = async () => {
    if (results.length === 0) return;
    const totalSum = results.reduce((a, b) => a + b, 0);
    const diceEmojis = results.map(r => `🎲${r}`).join(' ');
    try {
      await Share.share({
        message: `🎲 Zar Atma Sonucu\n\n${diceEmojis}\n\n${results.length > 1 ? `📊 Toplam: ${totalSum}\n\n` : ''}🎯 Kura Çek uygulaması ile atıldı!`,
      });
    } catch (error) {
      Alert.alert('Hata', 'Paylaşım sırasında bir hata oluştu.');
    }
  };

  const rollDice = () => {
    if (isRolling) return;

    setIsRolling(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    playSound('diceRoll');

    // Geliştirilmiş 3D animasyon
    Animated.parallel([
      // Sallama animasyonu
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -1, duration: 80, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -1, duration: 80, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 80, useNativeDriver: true }),
      ]),
      // 3D döndürme efekti (Y ekseni)
      Animated.sequence([
        Animated.timing(rotateYAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(rotateYAnim, { toValue: -1, duration: 200, useNativeDriver: true }),
        Animated.timing(rotateYAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]),
      // Zıplama efekti
      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: -30, duration: 150, useNativeDriver: true }),
        Animated.spring(bounceAnim, { toValue: 0, friction: 3, tension: 100, useNativeDriver: true }),
      ]),
    ]).start();

    let rollCount = 0;
    const maxRolls = 10;
    const interval = setInterval(() => {
      const tempResults: number[] = [];
      for (let i = 0; i < diceCount; i++) {
        tempResults.push(Math.floor(Math.random() * 6) + 1);
      }
      setResults(tempResults);
      rollCount++;

      if (rollCount >= maxRolls) {
        clearInterval(interval);
        setIsRolling(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        playSound('success');
      }
    }, 80);
  };

  const totalSum = results.reduce((a, b) => a + b, 0);

  const shake = shakeAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-10deg', '10deg'],
  });

  const rotateY = rotateYAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-15deg', '15deg'],
  });

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Geri</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🎲 Zar At</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.diceCountContainer}>
          <Text style={styles.diceCountLabel}>Kaç zar atılsın?</Text>
          <View style={styles.diceCountButtons}>
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <TouchableOpacity
                key={num}
                style={[
                  styles.diceCountButton,
                  diceCount === num && styles.diceCountButtonActive,
                ]}
                onPress={() => {
                  setDiceCount(num);
                  setResults([]);
                }}
              >
                <Text
                  style={[
                    styles.diceCountButtonText,
                    diceCount === num && styles.diceCountButtonTextActive,
                  ]}
                >
                  {num}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.diceAreaBackground}>
          <Animated.View
            style={[
              styles.diceWrapper,
              {
                transform: [
                  { rotate: shake },
                  { perspective: 1000 },
                  { rotateY: rotateY },
                  { translateY: bounceAnim }
                ]
              },
            ]}
          >
            {results.length > 0 ? (
              <View style={styles.diceGrid}>
                {results.map((result, index) => (
                  <DiceFace key={index} number={result} />
                ))}
              </View>
            ) : (
              <View style={styles.placeholderDice}>
                <View style={{ transform: [{ rotate: '-15deg' }] }}>
                  <DiceFace number={6} />
                </View>
                <Text style={styles.placeholderText}>Zar atmak için dokun</Text>
              </View>
            )}
          </Animated.View>
        </View>

        {/* Toplam ve Paylaş Alanı */}
        {results.length > 0 && (
          <View style={styles.resultSection}>
            {results.length > 1 && (
              <View style={styles.totalContainer}>
                <Text style={styles.totalLabel}>Toplam</Text>
                <Text style={styles.totalValue}>{totalSum}</Text>
              </View>
            )}
            <TouchableOpacity style={styles.shareResultButton} onPress={shareResult}>
              <Text style={styles.shareResultButtonText}>📤 Sonucu Paylaş</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          style={[styles.rollButton, isRolling && styles.rollButtonDisabled]}
          onPress={rollDice}
          disabled={isRolling}
        >
          <Text style={styles.rollButtonText}>
            {isRolling ? 'Atılıyor...' : '🎲 Zar At'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// --- GÜNCELLENMİŞ STİLLER ---
const DICE_SIZE = 55; // Küçük tutuyoruz
const DOT_SIZE = DICE_SIZE / 5;
const DOT_COLOR = '#333';
const DICE_COLOR = '#f8f9fa';
const PADDING = DOT_SIZE / 1.5; // Noktaların kenardan uzaklığı

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primary },
  header: { backgroundColor: Colors.primary, paddingTop: 10, paddingBottom: 20, paddingHorizontal: 20 },
  backButton: { marginBottom: 10 },
  backButtonText: { color: '#FFFFFF', fontSize: 16 },
  headerTitle: { color: '#FFFFFF', fontSize: 24, fontWeight: 'bold' },
  content: { flex: 1, backgroundColor: Colors.background },
  diceCountContainer: { paddingHorizontal: 20, paddingVertical: 20 },
  diceCountLabel: { fontSize: 14, color: Colors.textLight, marginBottom: 12 },
  diceCountButtons: { flexDirection: 'row', gap: 10 },
  diceCountButton: { width: 45, height: 45, borderRadius: 23, backgroundColor: Colors.card, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  diceCountButtonActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  diceCountButtonText: { fontSize: 18, fontWeight: '600', color: Colors.text },
  diceCountButtonTextActive: { color: '#FFFFFF' },

  diceAreaBackground: {
    flex: 1,
    margin: 20,
    backgroundColor: '#e9ecef',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#dee2e6',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.1, shadowRadius: 5 },
      android: { elevation: 2 }
    })
  },

  diceWrapper: { alignItems: 'center', justifyContent: 'center' },
  // Responsive grid: ekran genişliğinin %80'i kadar
  diceGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12, maxWidth: Dimensions.get('window').width * 0.75 },

  dice3DContainer: {
    width: DICE_SIZE,
    height: DICE_SIZE,
    backgroundColor: DICE_COLOR,
    borderRadius: DICE_SIZE / 5,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dee2e6',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 3, height: 6 }, // Gölge boyutu zarla orantılı küçüldü
        shadowOpacity: 0.25,
        shadowRadius: 6,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  diceFaceHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: DICE_SIZE / 2,
    borderTopLeftRadius: DICE_SIZE / 5,
    borderTopRightRadius: DICE_SIZE / 5,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  dotsContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  dot: {
    position: 'absolute',
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: DOT_COLOR,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  // DÜZELTME 2: Nokta Pozisyonları (Tam Ortalanmış)
  // Merkez noktası için tam ortaya hizalama (marginLeft/marginTop ile)
  center: { top: '50%', left: '50%', marginTop: -DOT_SIZE / 2, marginLeft: -DOT_SIZE / 2 },

  // Kenar noktaları için padding kullanımı
  topLeft: { top: PADDING, left: PADDING },
  topRight: { top: PADDING, right: PADDING },
  bottomLeft: { bottom: PADDING, left: PADDING },
  bottomRight: { bottom: PADDING, right: PADDING },

  // Orta yan noktalar için dikeyde ortalama
  centerLeft: { top: '50%', left: PADDING, marginTop: -DOT_SIZE / 2 },
  centerRight: { top: '50%', right: PADDING, marginTop: -DOT_SIZE / 2 },
  // ---------------------------

  placeholderDice: { alignItems: 'center', justifyContent: 'center' },
  placeholderText: { marginTop: 25, fontSize: 16, color: Colors.textLight, fontWeight: '600' },

  // Sonuç Bölümü
  resultSection: { alignItems: 'center', marginTop: 15 },

  totalContainer: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  totalLabel: { fontSize: 16, color: '#FFFFFF', opacity: 0.9 },
  totalValue: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF' },

  shareResultButton: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 25,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 5,
  },
  shareResultButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },

  rollButton: { backgroundColor: Colors.primary, marginHorizontal: 20, marginTop: 15, marginBottom: 40, paddingVertical: 18, borderRadius: 16, alignItems: 'center' },
  rollButtonDisabled: { backgroundColor: Colors.secondary },
  rollButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
});