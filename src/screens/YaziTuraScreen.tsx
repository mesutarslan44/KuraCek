import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Animated,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native'; // EKLENDİ
import * as Haptics from 'expo-haptics';
import { Colors } from '../constants/Colors';
import { useSound } from '../hooks/useSound';

const yaziImage = require('../../assets/images/yazi.png');
const turaImage = require('../../assets/images/tura.png');

export default function YaziTuraScreen() {
  const navigation = useNavigation();
  const playSound = useSound();
  const [result, setResult] = useState<string | null>(null);
  const [isFlipping, setIsFlipping] = useState(false);
  const flipAnim = useRef(new Animated.Value(0)).current;

  const flipCoin = () => {
    if (isFlipping) return;

    setIsFlipping(true);
    setResult(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    playSound('coinFlip');

    flipAnim.setValue(0);
    Animated.timing(flipAnim, {
      toValue: 10,
      duration: 1500,
      useNativeDriver: true,
    }).start(() => {
      const random = Math.random();
      const finalResult = random < 0.5 ? 'YAZI' : 'TURA';
      setResult(finalResult);
      setIsFlipping(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      playSound('success');
    });
  };

  const spin = flipAnim.interpolate({
    inputRange: [0, 10],
    outputRange: ['0deg', '1800deg'],
  });

  const scale = flipAnim.interpolate({
    inputRange: [0, 5, 10],
    outputRange: [1, 1.2, 1],
  });

  const getCurrentImage = () => {
    if (isFlipping) return yaziImage;
    if (result === 'YAZI') return yaziImage;
    if (result === 'TURA') return turaImage;
    return yaziImage;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Geri</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🪙 Yazı Tura</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.coinContainer}>
          <Animated.View
            style={[
              styles.coin,
              {
                transform: [{ rotateX: spin }, { scale: scale }],
              },
            ]}
          >
            <Image
              source={getCurrentImage()}
              style={styles.coinImage}
              resizeMode="contain"
            />
          </Animated.View>

          {result && !isFlipping && (
            <View style={styles.resultContainer}>
              <Text style={styles.resultText}>{result}</Text>
            </View>
          )}

          {!result && !isFlipping && (
            <Text style={styles.hintText}>Parayı çevirmek için dokun</Text>
          )}
        </View>

        <View style={styles.statsContainer}>
          <Text style={styles.statsTitle}>Nasıl Çalışır?</Text>
          <Text style={styles.statsText}>
            %50 Yazı - %50 Tura{'\n'}
            Tamamen rastgele ve adil!
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.flipButton, isFlipping && styles.flipButtonDisabled]}
          onPress={flipCoin}
          disabled={isFlipping}
        >
          <Text style={styles.flipButtonText}>
            {isFlipping ? 'Çevriliyor...' : '🪙 Parayı Çevir'}
          </Text>
        </TouchableOpacity>
      </View>
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
  coinContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  coin: { width: 180, height: 180, justifyContent: 'center', alignItems: 'center' },
  coinImage: { width: 180, height: 180, borderRadius: 90 },
  resultContainer: { marginTop: 30, backgroundColor: Colors.primary, paddingHorizontal: 40, paddingVertical: 15, borderRadius: 30 },
  resultText: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF' },
  hintText: { marginTop: 30, fontSize: 16, color: Colors.textLight },
  statsContainer: { backgroundColor: Colors.card, marginHorizontal: 20, padding: 20, borderRadius: 16, marginBottom: 20 },
  statsTitle: { fontSize: 16, fontWeight: '600', color: Colors.text, marginBottom: 8 },
  statsText: { fontSize: 14, color: Colors.textLight, lineHeight: 22 },
  flipButton: { backgroundColor: Colors.primary, marginHorizontal: 20, marginBottom: 30, paddingVertical: 18, borderRadius: 16, alignItems: 'center' },
  flipButtonDisabled: { backgroundColor: Colors.secondary },
  flipButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
});