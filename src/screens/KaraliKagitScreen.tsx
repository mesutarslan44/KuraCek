import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../constants/Colors';
import { useSound } from '../hooks/useSound'; // DÜZELTME 1: Doğru import

export default function KaraliKagitScreen() {
  const navigation = useNavigation();
  const playSound = useSound(); // DÜZELTME 2: Hook'u doğru şekilde başlatıyoruz

  const [playerCount, setPlayerCount] = useState<number>(4);
  const [gameStarted, setGameStarted] = useState(false);
  const [papers, setPapers] = useState<boolean[]>([]);
  const [revealedPapers, setRevealedPapers] = useState<boolean[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [foundLoser, setFoundLoser] = useState(false);

  const startGame = () => {
    const newPapers = Array(playerCount).fill(false);
    const markedIndex = Math.floor(Math.random() * playerCount);
    newPapers[markedIndex] = true;

    setPapers(newPapers);
    setRevealedPapers(Array(playerCount).fill(false));
    setCurrentPlayer(0);
    setFoundLoser(false);
    setGameStarted(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const revealPaper = (index: number) => {
    if (revealedPapers[index] || foundLoser) return;

    const newRevealed = [...revealedPapers];
    newRevealed[index] = true;
    setRevealedPapers(newRevealed);
    
    // Ses kullanımı
    playSound('click'); 

    if (papers[index]) {
      setFoundLoser(true);
      setShowResult(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      playSound('success');
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setCurrentPlayer(currentPlayer + 1);
    }
  };

  const resetGame = () => {
    setGameStarted(false);
    setPapers([]);
    setRevealedPapers([]);
    setCurrentPlayer(0);
    setFoundLoser(false);
    setShowResult(false);
  };

  const playerCountOptions = [2, 3, 4, 5, 6, 8, 10, 12];

  if (!gameStarted) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Geri</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>📄 Karalı Kağıt</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.setupContainer}>
            <Text style={styles.setupTitle}>Kaç kişi oynayacak?</Text>
            <View style={styles.countGrid}>
              {playerCountOptions.map((num) => (
                <TouchableOpacity
                  key={num}
                  style={[
                    styles.countButton,
                    playerCount === num && styles.countButtonActive,
                  ]}
                  onPress={() => setPlayerCount(num)}
                >
                  <Text
                    style={[
                      styles.countButtonText,
                      playerCount === num && styles.countButtonTextActive,
                    ]}
                  >
                    {num}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>📋 Nasıl Oynanır?</Text>
              <Text style={styles.infoText}>
                • {playerCount} kağıttan 1 tanesi karalı{'\n'}
                • Herkes sırayla bir kağıda dokunur{'\n'}
                • Karalı kağıdı çeken seçilmiş olur{'\n'}
                • Boş çekenler kurtulur!
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.startButton} onPress={startGame}>
            <Text style={styles.startButtonText}>🎯 Oyunu Başlat</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={resetGame} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Yeni Oyun</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📄 Karalı Kağıt</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.turnInfo}>
          <Text style={styles.turnText}>
            {foundLoser
              ? '🎉 Oyun Bitti!'
              : `Sıra: ${currentPlayer + 1}. Kişi`}
          </Text>
          <Text style={styles.remainingText}>
            Kalan kağıt: {papers.length - revealedPapers.filter(Boolean).length}
          </Text>
        </View>

        <View style={styles.papersContainer}>
          <View style={styles.papersGrid}>
            {papers.map((isMarked, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.paper,
                  revealedPapers[index] && styles.paperRevealed,
                  revealedPapers[index] && isMarked && styles.paperMarked,
                ]}
                onPress={() => revealPaper(index)}
                disabled={revealedPapers[index] || foundLoser}
                activeOpacity={0.7}
              >
                {revealedPapers[index] ? (
                  <Text style={styles.paperContent}>
                    {isMarked ? '✗' : '○'}
                  </Text>
                ) : (
                  <Text style={styles.paperNumber}>{index + 1}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.card }]} />
            <Text style={styles.legendText}>Kapalı</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.success }]} />
            <Text style={styles.legendText}>Boş</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.accent }]} />
            <Text style={styles.legendText}>Seçildi</Text>
          </View>
        </View>
      </View>

      <Modal visible={showResult} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalEmoji}>😱</Text>
            <Text style={styles.modalTitle}>Karalı Kağıt Çekildi!</Text>
            <Text style={styles.modalSubtitle}>
              {currentPlayer + 1}. kişi seçildi!
            </Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowResult(false)}
            >
              <Text style={styles.modalButtonText}>Tamam</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButtonSecondary}
              onPress={resetGame}
            >
              <Text style={styles.modalButtonSecondaryText}>Yeni Oyun</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  setupContainer: { flex: 1, paddingHorizontal: 20, paddingTop: 30 },
  setupTitle: { fontSize: 18, fontWeight: '600', color: Colors.text, marginBottom: 20, textAlign: 'center' },
  countGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12 },
  countButton: { width: 60, height: 60, borderRadius: 30, backgroundColor: Colors.card, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: Colors.border },
  countButtonActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  countButtonText: { fontSize: 20, fontWeight: 'bold', color: Colors.text },
  countButtonTextActive: { color: '#FFFFFF' },
  infoBox: { backgroundColor: Colors.card, borderRadius: 16, padding: 20, marginTop: 40 },
  infoTitle: { fontSize: 16, fontWeight: '600', color: Colors.text, marginBottom: 10 },
  infoText: { fontSize: 14, color: Colors.textLight, lineHeight: 24 },
  startButton: { backgroundColor: Colors.primary, marginHorizontal: 20, marginBottom: 30, paddingVertical: 18, borderRadius: 16, alignItems: 'center' },
  startButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  turnInfo: { alignItems: 'center', paddingVertical: 20 },
  turnText: { fontSize: 20, fontWeight: 'bold', color: Colors.text },
  remainingText: { fontSize: 14, color: Colors.textLight, marginTop: 5 },
  papersContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  papersGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12, maxWidth: 320 },
  paper: { width: 70, height: 90, backgroundColor: Colors.card, borderRadius: 8, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, borderWidth: 2, borderColor: Colors.border },
  paperRevealed: { backgroundColor: Colors.success, borderColor: Colors.success },
  paperMarked: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  paperNumber: { fontSize: 18, fontWeight: '600', color: Colors.textLight },
  paperContent: { fontSize: 36, fontWeight: 'bold', color: '#FFFFFF' },
  legend: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    gap: 20, 
    paddingVertical: 20, 
    paddingBottom: 40,
    marginBottom: 10,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendText: { fontSize: 12, color: Colors.textLight },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: Colors.card, padding: 30, borderRadius: 20, alignItems: 'center', width: '80%' },
  modalEmoji: { fontSize: 60, marginBottom: 15 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: Colors.accent, marginBottom: 5 },
  modalSubtitle: { fontSize: 16, color: Colors.textLight, marginBottom: 25 },
  modalButton: { backgroundColor: Colors.primary, paddingHorizontal: 50, paddingVertical: 12, borderRadius: 10, marginBottom: 10 },
  modalButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  modalButtonSecondary: { paddingVertical: 10 },
  modalButtonSecondaryText: { color: Colors.primary, fontSize: 14 },
});