import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  ScrollView,
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

export default function TakimOlusturScreen() {
  const navigation = useNavigation();
  const playSound = useSound();
  const [name, setName] = useState('');
  const [names, setNames] = useState<Participant[]>([]);
  const [teamSize, setTeamSize] = useState<number>(2);
  const [teams, setTeams] = useState<Participant[][]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

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

  const shuffleArray = (array: Participant[]): Participant[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const createTeams = () => {
    if (names.length < 2) {
      alert('En az 2 kişi ekleyin!');
      return;
    }
    Keyboard.dismiss(); // İşlem başlarken klavyeyi kapat
    setIsCreating(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    playSound('drumRoll');

    setTimeout(() => {
      const shuffled = shuffleArray(names);
      const newTeams: Participant[][] = [];

      for (let i = 0; i < shuffled.length; i += teamSize) {
        newTeams.push(shuffled.slice(i, i + teamSize));
      }

      setTeams(newTeams);
      setShowModal(true);
      setIsCreating(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      playSound('success');
    }, 1500);
  };

  const closeModal = () => {
    setShowModal(false);
    setTeams([]);
  };

  const teamSizeOptions = [2, 3, 4, 5];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Geri</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>👥 Takım Oluştur</Text>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.content}>
          <View style={styles.teamSizeContainer}>
            <Text style={styles.teamSizeLabel}>Kaç kişilik takımlar?</Text>
            <View style={styles.teamSizeButtons}>
              {teamSizeOptions.map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.teamSizeButton,
                    teamSize === size && styles.teamSizeButtonActive,
                  ]}
                  onPress={() => setTeamSize(size)}
                >
                  <Text
                    style={[
                      styles.teamSizeButtonText,
                      teamSize === size && styles.teamSizeButtonTextActive,
                    ]}
                  >
                    {size}'li
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

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
              renderItem={({ item }) => (
                <View style={styles.nameItem}>
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
              styles.createButton,
              (names.length < 2 || isCreating) && styles.createButtonDisabled,
            ]}
            onPress={createTeams}
            disabled={names.length < 2 || isCreating}
          >
            <Text style={styles.createButtonText}>
              {isCreating ? 'Oluşturuluyor...' : '👥 Takımları Oluştur'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <Modal visible={showModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🎉 Takımlar Oluşturuldu!</Text>
            <ScrollView style={styles.teamsContainer}>
              {teams.map((team, index) => (
                <View key={index} style={styles.teamCard}>
                  <Text style={styles.teamTitle}>Takım {index + 1}</Text>
                  {team.map((member, memberIndex) => (
                    <Text key={memberIndex} style={styles.teamMember}>
                      • {member.text}
                    </Text>
                  ))}
                </View>
              ))}
            </ScrollView>
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
  teamSizeContainer: { paddingHorizontal: 20, paddingVertical: 15 },
  teamSizeLabel: { fontSize: 14, color: Colors.textLight, marginBottom: 10 },
  teamSizeButtons: { flexDirection: 'row', gap: 10 },
  teamSizeButton: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border },
  teamSizeButtonActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  teamSizeButtonText: { fontSize: 14, color: Colors.text },
  teamSizeButtonTextActive: { color: '#FFFFFF', fontWeight: '600' },
  inputContainer: { flexDirection: 'row', paddingHorizontal: 20, paddingVertical: 10, gap: 10 },
  input: { flex: 1, backgroundColor: Colors.card, borderRadius: 12, paddingHorizontal: 15, paddingVertical: 12, fontSize: 16, color: Colors.text, borderWidth: 1, borderColor: Colors.border },
  addButton: { backgroundColor: Colors.primary, borderRadius: 12, width: 50, justifyContent: 'center', alignItems: 'center' },
  addButtonText: { color: '#FFFFFF', fontSize: 28, fontWeight: 'bold' },
  listContainer: { flex: 1, paddingHorizontal: 20 },
  listTitle: { fontSize: 14, color: Colors.textLight, marginBottom: 10 },
  nameItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Colors.card, padding: 15, borderRadius: 10, marginBottom: 8 },
  nameText: { fontSize: 16, color: Colors.text },
  removeText: { fontSize: 18, color: Colors.accent, fontWeight: 'bold' },
  emptyText: { textAlign: 'center', color: Colors.textLight, marginTop: 40, lineHeight: 24 },
  createButton: { backgroundColor: Colors.primary, marginHorizontal: 20, marginBottom: 40, paddingVertical: 18, borderRadius: 16, alignItems: 'center' },
  createButtonDisabled: { backgroundColor: Colors.border },
  createButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: Colors.card, padding: 25, borderRadius: 20, width: '85%', maxHeight: '70%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: Colors.primary, textAlign: 'center', marginBottom: 15 },
  teamsContainer: { maxHeight: 300 },
  teamCard: { backgroundColor: Colors.background, padding: 15, borderRadius: 12, marginBottom: 10 },
  teamTitle: { fontSize: 16, fontWeight: 'bold', color: Colors.primary, marginBottom: 8 },
  teamMember: { fontSize: 15, color: Colors.text, marginLeft: 5, marginBottom: 3 },
  modalButton: { backgroundColor: Colors.primary, paddingVertical: 12, borderRadius: 10, marginTop: 15 },
  modalButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600', textAlign: 'center' },
});