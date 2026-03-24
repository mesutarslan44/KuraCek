import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
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

export default function HizliSecScreen() {
  const navigation = useNavigation();
  const playSound = useSound();
  const [name, setName] = useState('');
  const [names, setNames] = useState<Participant[]>([]);
  const [winner, setWinner] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);

  const addName = () => {
    if (name.trim() === '') return;
    const newItem: Participant = {
      id: Date.now().toString() + Math.random(),
      text: name.trim()
    };
    setNames([...names, newItem]);
    setName('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const removeName = (id: string) => {
    setNames(names.filter((item) => item.id !== id));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const selectRandom = async () => {
    if (names.length < 2) {
      alert('En az 2 kişi ekleyin!');
      return;
    }
    Keyboard.dismiss(); // Seçim başlarken klavyeyi kapat
    setIsSelecting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    playSound('drumRoll');

    let count = 0;
    const maxCount = 15;
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * names.length);
      setWinner(names[randomIndex].text);
      count++;

      if (count >= maxCount) {
        clearInterval(interval);
        const finalIndex = Math.floor(Math.random() * names.length);
        setWinner(names[finalIndex].text);
        setIsSelecting(false);
        setShowModal(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        playSound('success');
      }
    }, 100);
  };

  const closeModal = () => {
    setShowModal(false);
    setWinner(null);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Geri</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>👆 Hızlı Seç</Text>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.content}>
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
              showsVerticalScrollIndicator={false} // Görsel cila
              keyboardShouldPersistTaps="handled" // Önemli: Klavye açıkken listeye tıklamayı kolaylaştırır
              onScrollBeginDrag={Keyboard.dismiss} // Listeyi kaydırınca klavyeyi kapat
              renderItem={({ item }) => (
                <View style={[
                  styles.nameItem,
                  isSelecting && winner === item.text && styles.nameItemHighlight
                ]}>
                  <Text style={styles.nameText}>{item.text}</Text>
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
              styles.selectButton,
              names.length < 2 && styles.selectButtonDisabled
            ]}
            onPress={selectRandom}
            disabled={names.length < 2 || isSelecting}
          >
            <Text style={styles.selectButtonText}>
              {isSelecting ? 'Seçiliyor...' : '🎯 Kura Çek'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🎉 Seçilen Kişi</Text>
            <Text style={styles.modalWinner}>{winner}</Text>
            <TouchableOpacity style={styles.modalButton} onPress={closeModal}>
              <Text style={styles.modalButtonText}>Tamam</Text>
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
  inputContainer: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 15, gap: 10 },
  input: { flex: 1, backgroundColor: Colors.card, borderRadius: 12, paddingHorizontal: 15, paddingVertical: 12, fontSize: 16, color: Colors.text, borderWidth: 1, borderColor: Colors.border },
  addButton: { backgroundColor: Colors.primary, borderRadius: 12, width: 50, justifyContent: 'center', alignItems: 'center' },
  addButtonText: { color: '#FFFFFF', fontSize: 28, fontWeight: 'bold' },
  listContainer: { flex: 1, paddingHorizontal: 20 },
  listTitle: { fontSize: 14, color: Colors.textLight, marginBottom: 10 },
  nameItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.card, padding: 15, borderRadius: 10, marginBottom: 8 },
  nameItemHighlight: { backgroundColor: Colors.secondary },
  nameText: { fontSize: 16, color: Colors.text },
  removeText: { fontSize: 18, color: Colors.accent, fontWeight: 'bold' },
  emptyText: { textAlign: 'center', color: Colors.textLight, marginTop: 40, lineHeight: 24 },
  selectButton: { backgroundColor: Colors.primary, marginHorizontal: 20, marginBottom: 40, paddingVertical: 18, borderRadius: 16, alignItems: 'center' },
  selectButtonDisabled: { backgroundColor: Colors.border },
  selectButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: Colors.card, padding: 30, borderRadius: 20, alignItems: 'center', width: '80%' },
  modalTitle: { fontSize: 18, color: Colors.textLight, marginBottom: 10 },
  modalWinner: { fontSize: 32, fontWeight: 'bold', color: Colors.primary, marginBottom: 20 },
  modalButton: { backgroundColor: Colors.primary, paddingHorizontal: 40, paddingVertical: 12, borderRadius: 10 },
  modalButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});