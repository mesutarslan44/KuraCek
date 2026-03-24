import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  ScrollView,
  Share,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import Svg, { Path, G, Text as SvgText } from 'react-native-svg';
import { Colors } from '../constants/Colors';
import { useSound } from '../hooks/useSound';

const { width } = Dimensions.get('window');
const WHEEL_SIZE = width * 0.75;
const CENTER = WHEEL_SIZE / 2;
const RADIUS = WHEEL_SIZE / 2 - 10;

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
  '#BB8FCE', '#85C1E9', '#F8B500', '#00CED1',
];

type WheelItem = {
  id: string;
  text: string;
};

export default function CarkCevirScreen() {
  const navigation = useNavigation();
  const playSound = useSound();
  const [item, setItem] = useState('');
  const [items, setItems] = useState<WheelItem[]>([]);
  const [winner, setWinner] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const spinAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const scrollViewRef = useRef<ScrollView>(null);

  const addItem = () => {
    if (item.trim() === '') return;
    if (items.length >= 12) {
      alert('En fazla 12 dilim ekleyebilirsiniz!');
      return;
    }
    const newItem: WheelItem = {
      id: Date.now().toString() + Math.random(),
      text: item.trim()
    };
    setItems([...items, newItem]);
    setItem('');
    setWinner(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
    setWinner(null);
  };

  // Paylaşım fonksiyonu
  const shareResult = async () => {
    if (!winner) return;
    try {
      await Share.share({
        message: `🎡 Çark Çevir Sonucu\n\n🎉 Kazanan: ${winner}\n\n📋 Katılımcılar:\n${items.map(i => `• ${i.text}`).join('\n')}\n\n🎯 Kura Çek uygulaması ile çekildi!`,
      });
    } catch (error) {
      Alert.alert('Hata', 'Paylaşım sırasında bir hata oluştu.');
    }
  };

  const spinWheel = () => {
    if (items.length < 2 || isSpinning) return;
    Keyboard.dismiss();
    setIsSpinning(true);
    setWinner(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    playSound('wheelSpin');

    // Başlangıçta hafif büyüme efekti
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.05,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    const randomSpins = 6 + Math.random() * 4;
    const randomAngle = Math.random() * 360;
    const totalRotation = randomSpins * 360 + randomAngle;

    spinAnim.setValue(0);

    // Geliştirilmiş animasyon - daha akıcı yavaşlama
    Animated.timing(spinAnim, {
      toValue: totalRotation,
      duration: 5000,
      easing: Easing.bezier(0.2, 0.8, 0.2, 1), // Özel easing - daha doğal yavaşlama
      useNativeDriver: true,
    }).start(() => {
      const sliceAngle = 360 / items.length;
      const normalizedAngle = (360 - (totalRotation % 360)) % 360;
      const winnerIndex = Math.floor(normalizedAngle / sliceAngle) % items.length;

      setWinner(items[winnerIndex].text);
      setIsSpinning(false);

      // Kazananı gösterirken bounce efekti
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.1, duration: 150, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, friction: 3, tension: 100, useNativeDriver: true }),
      ]).start();

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      playSound('success');
    });
  };

  const spin = spinAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  const createSlicePath = (index: number, total: number): string => {
    const angle = 360 / total;
    const startAngle = index * angle - 90;
    const endAngle = startAngle + angle;
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const x1 = CENTER + RADIUS * Math.cos(startRad);
    const y1 = CENTER + RADIUS * Math.sin(startRad);
    const x2 = CENTER + RADIUS * Math.cos(endRad);
    const y2 = CENTER + RADIUS * Math.sin(endRad);
    const largeArc = angle > 180 ? 1 : 0;
    return `M ${CENTER} ${CENTER} L ${x1} ${y1} A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  };

  const getTextPosition = (index: number, total: number) => {
    const angle = 360 / total;
    const midAngle = index * angle + angle / 2 - 90;
    const rad = (midAngle * Math.PI) / 180;
    const textRadius = RADIUS * 0.65;
    return {
      x: CENTER + textRadius * Math.cos(rad),
      y: CENTER + textRadius * Math.sin(rad),
      rotation: midAngle + 90,
    };
  };

  // İYİLEŞTİRME 1: Font boyutunu dinamik hesapla
  const getDynamicFontSize = (count: number, textLength: number) => {
    if (count > 8) return 10; // Dilim sayısı çoksa küçük font
    if (textLength > 10) return 11; // Metin uzunsa bir tık küçük
    return 13; // Standart
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Geri</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🎡 Çark Çevir</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.wheelContainer}>
            {items.length >= 2 ? (
              <>
                <View style={styles.pointer}>
                  <Text style={styles.pointerText}>▼</Text>
                </View>
                <Animated.View style={{ transform: [{ rotate: spin }, { scale: scaleAnim }] }}>
                  <Svg width={WHEEL_SIZE} height={WHEEL_SIZE}>
                    <G>
                      {items.map((_, index) => (
                        <Path
                          key={index}
                          d={createSlicePath(index, items.length)}
                          fill={COLORS[index % COLORS.length]}
                          stroke="#FFFFFF"
                          strokeWidth={2}
                        />
                      ))}
                      {items.map((wheelItem, index) => {
                        const pos = getTextPosition(index, items.length);
                        // İYİLEŞTİRME 2: Metni akıllıca kısalt
                        const displayText = wheelItem.text.length > 10
                          ? wheelItem.text.slice(0, 9) + '.'
                          : wheelItem.text;

                        return (
                          <SvgText
                            key={`text-${index}`}
                            x={pos.x}
                            y={pos.y}
                            fill="#FFFFFF"
                            fontSize={getDynamicFontSize(items.length, wheelItem.text.length)}
                            fontWeight="bold"
                            textAnchor="middle"
                            alignmentBaseline="middle"
                            transform={`rotate(${pos.rotation}, ${pos.x}, ${pos.y})`}
                          >
                            {displayText}
                          </SvgText>
                        );
                      })}
                    </G>
                  </Svg>
                </Animated.View>
              </>
            ) : (
              <View style={styles.emptyWheel}>
                <Text style={styles.emptyWheelText}>🎡</Text>
                <Text style={styles.emptyWheelHint}>En az 2 dilim ekleyin</Text>
              </View>
            )}

            {winner && (
              <Animated.View style={[styles.winnerContainer, { transform: [{ scale: scaleAnim }] }]}>
                <Text style={styles.winnerLabel}>🎉 Kazanan</Text>
                <Text style={styles.winnerText}>{winner}</Text>
                <TouchableOpacity style={styles.shareButton} onPress={shareResult}>
                  <Text style={styles.shareButtonText}>📤 Paylaş</Text>
                </TouchableOpacity>
              </Animated.View>
            )}
          </View>

          <View style={styles.inputSection}>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Dilim ekle..."
                placeholderTextColor={Colors.textLight}
                value={item}
                onChangeText={setItem}
                onSubmitEditing={addItem}
                returnKeyType="done"
                maxLength={15} // İYİLEŞTİRME 3: Maksimum karakter sınırı
              />
              <TouchableOpacity style={styles.addButton} onPress={addItem}>
                <Text style={styles.addButtonText}>+</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.itemsList}>
              {items.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.itemChip, { backgroundColor: COLORS[index % COLORS.length] }]}
                  onPress={() => removeItem(item.id)}
                >
                  <Text style={styles.itemChipText}>{item.text}</Text>
                  <Text style={styles.itemChipRemove}>✕</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.spinButton,
              (items.length < 2 || isSpinning) && styles.spinButtonDisabled,
            ]}
            onPress={spinWheel}
            disabled={items.length < 2 || isSpinning}
          >
            <Text style={styles.spinButtonText}>
              {isSpinning ? 'Dönüyor...' : '🎡 Çarkı Çevir'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
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
  scrollContent: { paddingBottom: 50 },

  // DÜZELTME 1: Çark konteynerine alt boşluk verdik
  wheelContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    marginBottom: 10
  },

  pointer: { position: 'absolute', top: 10, zIndex: 10 },
  pointerText: { fontSize: 30, color: Colors.text },
  emptyWheel: { width: WHEEL_SIZE, height: WHEEL_SIZE, borderRadius: WHEEL_SIZE / 2, backgroundColor: Colors.card, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: Colors.border, borderStyle: 'dashed' },
  emptyWheelText: { fontSize: 60, opacity: 0.3 },
  emptyWheelHint: { marginTop: 10, color: Colors.textLight, fontSize: 14 },

  // DÜZELTME 2: Absolute pozisyonu kaldırdık, artık yer kaplayacak ve aşağıyı itecek
  winnerContainer: {
    marginTop: 20, // Çarktan uzaklaşması için üst boşluk
    backgroundColor: Colors.primary,
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center', // Yazıları ortala
    shadowColor: "#000", // Hafif gölge ekledik şık dursun
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  winnerLabel: { color: '#FFFFFF', fontSize: 14, textAlign: 'center', opacity: 0.9, marginBottom: 2 },
  winnerText: { color: '#FFFFFF', fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  shareButton: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 15, marginTop: 5 },
  shareButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },

  inputSection: { paddingHorizontal: 20, marginTop: 10 }, // Biraz daha yukarıdan ayrılması için margin
  inputContainer: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  input: { flex: 1, backgroundColor: Colors.card, borderRadius: 12, paddingHorizontal: 15, paddingVertical: 12, fontSize: 16, color: Colors.text, borderWidth: 1, borderColor: Colors.border },
  addButton: { backgroundColor: Colors.primary, borderRadius: 12, width: 50, justifyContent: 'center', alignItems: 'center' },
  addButtonText: { color: '#FFFFFF', fontSize: 28, fontWeight: 'bold' },
  itemsList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  itemChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, gap: 6 },
  itemChipText: { color: '#FFFFFF', fontSize: 14, fontWeight: '500' },
  itemChipRemove: { color: '#FFFFFF', fontSize: 12, opacity: 0.8 },
  spinButton: { backgroundColor: Colors.primary, marginHorizontal: 20, marginTop: 20, marginBottom: 20, paddingVertical: 18, borderRadius: 16, alignItems: 'center' },
  spinButtonDisabled: { backgroundColor: Colors.border },
  spinButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
});