import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Switch, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../constants/Colors';
import { useSettings } from '../context/SettingsContext';

export default function SettingsScreen() {
  const navigation = useNavigation();
  const { soundEnabled, vibrationEnabled, toggleSound, toggleVibration } = useSettings();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Geri</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>⚙️ Ayarlar</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Ayarlar Bölümü */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>GENEL</Text>
          
          {/* Ses Ayarı */}
          <View style={styles.row}>
            <View style={styles.rowInfo}>
              <Text style={styles.rowTitle}>Ses Efektleri</Text>
              <Text style={styles.rowSubtitle}>Tıklama ve oyun sesleri</Text>
            </View>
            <Switch
              trackColor={{ false: '#767577', true: Colors.secondary }}
              thumbColor={soundEnabled ? Colors.primary : '#f4f3f4'}
              onValueChange={toggleSound}
              value={soundEnabled}
            />
          </View>

          <View style={styles.separator} />

          {/* Titreşim Ayarı */}
          <View style={styles.row}>
            <View style={styles.rowInfo}>
              <Text style={styles.rowTitle}>Titreşim</Text>
              <Text style={styles.rowSubtitle}>Dokunsal geri bildirimler</Text>
            </View>
            <Switch
              trackColor={{ false: '#767577', true: Colors.secondary }}
              thumbColor={vibrationEnabled ? Colors.primary : '#f4f3f4'}
              onValueChange={toggleVibration}
              value={vibrationEnabled}
            />
          </View>
        </View>

        {/* KÜNYE (About) Bölümü - YENİ EKLENDİ */}
        <View style={styles.aboutSection}>
          <Text style={styles.appTitle}>🎯 Kura Çek</Text>
          
          <View style={styles.dedicationContainer}>
            <Text style={styles.dedicationText}>
              "Bu uygulama M. Arslan tarafından emektar arkadaşlarına ithafen kodlanmıştır."
            </Text>
          </View>

          <View style={styles.footerInfo}>
            <Text style={styles.versionText}>Versiyon 1.0.0</Text>
            <Text style={styles.madeWithText}>Made with ❤️ in 2025</Text>
          </View>
        </View>

      </ScrollView>
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
  
  // Ayarlar Kartı Stilleri
  section: { backgroundColor: Colors.card, marginTop: 20, paddingVertical: 10, borderRadius: 16, marginHorizontal: 20 },
  sectionTitle: { color: Colors.textLight, fontSize: 13, fontWeight: 'bold', marginLeft: 20, marginBottom: 10, marginTop: 5 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
  rowInfo: { flex: 1 },
  rowTitle: { fontSize: 16, color: Colors.text, fontWeight: '500' },
  rowSubtitle: { fontSize: 13, color: Colors.textLight, marginTop: 2 },
  separator: { height: 1, backgroundColor: Colors.border, marginLeft: 20 },

  // KÜNYE Stilleri
  aboutSection: { alignItems: 'center', marginTop: 40, paddingHorizontal: 30, paddingBottom: 40 },
  appTitle: { fontSize: 20, fontWeight: 'bold', color: Colors.primary, marginBottom: 20 },
  dedicationContainer: {
    backgroundColor: Colors.card,
    padding: 20,
    borderRadius: 16,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dedicationText: {
    fontSize: 15,
    color: Colors.text,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 24,
    fontWeight: '500',
  },
  footerInfo: { marginTop: 20, alignItems: 'center' },
  versionText: { color: Colors.textLight, fontSize: 12, fontWeight: '600' },
  madeWithText: { color: Colors.textLight, fontSize: 12, marginTop: 4, opacity: 0.7 },
});