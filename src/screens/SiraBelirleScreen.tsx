import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView, // Eklendi
  Platform, // Eklendi
  Keyboard // Eklendi
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../constants/Colors';
import { useSound } from '../hooks/useSound';

type Participant = {
  id: string;
  text: string;
};

export default function SiraBelirleScreen() {
  const navigation = useNavigation();
  const playSound = useSound();
  const [name, setName] = useState('');
  const [names, setNames] = useState<Participant[]>([]);
  const [shuffledNames, setShuffledNames] = useState<Participant[]>([]);
  const [isShuffled, setIsShuffled] = useState(false);

  const addName = () => {
    if (name.trim() === '') return;
    const newItem: Participant = {
      id: Date.now().toString() + Math.random(),
      text: name.trim()
    };
    setNames([...names, newItem]);
    setName('');
    setIsShuffled(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const removeName = (id: string) => {
    setNames(names.filter((item) => item.id !== id));
    setIsShuffled(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const shuffleArray = (array: Participant[]): Participant[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const shuffleNames = () => {
    if (names.length < 2) {
      alert('En az 2 kişi ekleyin!');
      return;
    }
    Keyboard.dismiss(); // Karıştırırken klavyeyi kapat
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    playSound('drumRoll');

    let count = 0;
    const maxCount = 10;
    const interval = setInterval(() => {
      setShuffledNames(shuffleArray(names));
      count++;

      if (count >= maxCount) {
        clearInterval(interval);
        setShuffledNames(shuffleArray(names));
        setIsShuffled(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        playSound('success');
      }
    }, 80);
  };

  const resetShuffle = () => {
    setIsShuffled(false);
    setShuffledNames([]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Geri</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>📋 Sıra Belirle</Text>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.content}>
          {isShuffled ? (
            <View style={styles.resultContainer}>
              <Text style={styles.resultTitle}>🎉 Yeni Sıralama</Text>
              <FlatList
                data={shuffledNames}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                renderItem={({ item, index }) => (
                  <View style={styles.resultItem}>
                    <View style={styles.resultRank}>
                      <Text style={styles.resultRankText}>{index + 1}</Text>
                    </View>
                    <Text style={styles.resultName}>{item.text}</Text>
                  </View>
                )}
                style={styles.resultList}
              />
              <View style={styles.resultButtons}>
                <TouchableOpacity
                  style={styles.reshuffleButton}
                  onPress={shuffleNames}
                >
                  <Text style={styles.reshuffleButtonText}>🔄 Tekrar Karıştır</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={resetShuffle}
                >
                  <Text style={styles.editButtonText}>✏️ Listeyi Düzenle</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="İsim girin..."
                  placeholderTextColor={Colors.textLight}
                  value={name}
                  onChangeText={setName}
                  onSubmitEditing={addName}
                  returnKeyType="done"
                />
                <TouchableOpacity style={styles.addButton} onPress={addName}>
                  <Text style={styles.addButtonText}>+</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.listContainer}>
                <Text style={styles.listTitle}>
                  Katılımcılar ({names.length} kişi)
                </Text>
                <FlatList
                  data={names}
                  keyExtractor={(item) => item.id}
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                  onScrollBeginDrag={Keyboard.dismiss} // Kaydırınca klavyeyi kapat
                  renderItem={({ item, index }) => (
                    <View style={styles.nameItem}>
                      <View style={styles.nameLeft}>
                        <Text style={styles.nameIndex}>{index + 1}.</Text>
                        <Text style={styles.nameText}>{item.text}</Text>
                      </View>
                      <TouchableOpacity onPress={() => removeName(item.id)}>
                        <Text style={styles.removeText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  ListEmptyComponent={
                    <Text style={styles.emptyText}>
                      Henüz kimse eklenmedi.{'\n'}Yukarıdan isim ekleyin.
                    </Text>
                  }
                />
              </View>

              <TouchableOpacity
                style={[
                  styles.shuffleButton,
                  names.length < 2 && styles.shuffleButtonDisabled,
                ]}
                onPress={shuffleNames}
                disabled={names.length < 2}
              >
                <Text style={styles.shuffleButtonText}>🔀 Sırayı Karıştır</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
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
  inputContainer: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 15, gap: 10 },
  input: { flex: 1, backgroundColor: Colors.card, borderRadius: 12, paddingHorizontal: 15, paddingVertical: 12, fontSize: 16, color: Colors.text, borderWidth: 1, borderColor: Colors.border },
  addButton: { backgroundColor: Colors.primary, borderRadius: 12, width: 50, justifyContent: 'center', alignItems: 'center' },
  addButtonText: { color: '#FFFFFF', fontSize: 28, fontWeight: 'bold' },
  listContainer: { flex: 1, paddingHorizontal: 20 },
  listTitle: { fontSize: 14, color: Colors.textLight, marginBottom: 10 },
  nameItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.card, padding: 15, borderRadius: 10, marginBottom: 8 },
  nameLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  nameIndex: { fontSize: 14, color: Colors.textLight, width: 25 },
  nameText: { fontSize: 16, color: Colors.text },
  removeText: { fontSize: 18, color: Colors.accent, fontWeight: 'bold' },
  emptyText: { textAlign: 'center', color: Colors.textLight, marginTop: 40, lineHeight: 24 },
  shuffleButton: { backgroundColor: Colors.primary, marginHorizontal: 20, marginBottom: 40, paddingVertical: 18, borderRadius: 16, alignItems: 'center' },
  shuffleButtonDisabled: { backgroundColor: Colors.border },
  shuffleButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  resultContainer: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  resultTitle: { fontSize: 22, fontWeight: 'bold', color: Colors.primary, textAlign: 'center', marginBottom: 20 },
  resultList: { flex: 1 },
  resultItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, padding: 15, borderRadius: 12, marginBottom: 10, gap: 15 },
  resultRank: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },
  resultRankText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  resultName: { fontSize: 18, color: Colors.text, fontWeight: '500' },
  resultButtons: { paddingVertical: 20, gap: 10 },
  reshuffleButton: { backgroundColor: Colors.primary, paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  reshuffleButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  editButton: { backgroundColor: Colors.card, paddingVertical: 14, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: Colors.border },
  editButtonText: { color: Colors.text, fontSize: 16, fontWeight: '500' },
});