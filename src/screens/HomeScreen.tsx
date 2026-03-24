import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';
import { BannerAd, BannerAdSize, getBannerAdUnitId } from '../utils/AdManager';

type ModuleItem = {
  id: string;
  title: string;
  description: string;
  icon: string;
};

const modules: ModuleItem[] = [
  { id: 'hizli-sec', title: 'Hızlı Seç', description: 'Listeden 1 kişi seç', icon: '👆' },
  { id: 'takim-olustur', title: 'Takım Oluştur', description: 'Gruplar halinde böl', icon: '👥' },
  { id: 'sansli-sayi', title: 'Şanslı Sayı', description: 'Min-Max arası sayı', icon: '🔢', },
  { id: 'sira-belirle', title: 'Sıra Belirle', description: 'Rastgele sırala', icon: '📋' },
  { id: 'yazi-tura', title: 'Yazı Tura', description: 'İki seçenek arası', icon: '🪙' },
  { id: 'zar-at', title: 'Zar At', description: '1-6 arası zar', icon: '🎲' },
  { id: 'cark-cevir', title: 'Çark Çevir', description: 'Şans çarkı', icon: '🎡' },
  { id: 'karali-kagit', title: 'Karalı Kağıt', description: 'Sırayla kağıt çek', icon: '📄' },
];

export default function HomeScreen({ navigation }: { navigation: any }) {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[Colors.primary, Colors.secondary]}
        style={styles.header}
      >
        <View style={styles.headerTopRow}>
          <View style={{ width: 24 }} />
          <Text style={styles.headerTitle}>🎯 Kura Çek</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('settings')}
            style={styles.settingsButton}
          >
            <Text style={{ fontSize: 24 }}>⚙️</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSubtitle}>Adil seçim, kolay karar</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {modules.map((module) => (
            <TouchableOpacity
              key={module.id}
              style={styles.card}
              onPress={() => navigation.navigate(module.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.cardIcon}>{module.icon}</Text>
              <Text style={styles.cardTitle}>{module.title}</Text>
              <Text style={styles.cardDescription}>{module.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Banner Reklam - Ekranın En Altında */}
      <View style={styles.adContainer}>
        <BannerAd
          unitId={getBannerAdUnitId()}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          requestOptions={{
            requestNonPersonalizedAdsOnly: true,
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.primary },
  header: {
    paddingTop: 10,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  settingsButton: {
    padding: 5,
  },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center' },
  headerSubtitle: { fontSize: 14, color: '#FFFFFF', textAlign: 'center', marginTop: 5, opacity: 0.9 },
  content: { flex: 1, backgroundColor: Colors.background, paddingHorizontal: 15, paddingTop: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingBottom: 80 },
  card: {
    width: '48%', backgroundColor: Colors.card, borderRadius: 16, padding: 20, marginBottom: 15,
    alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 8, elevation: 3,
  },
  cardIcon: { fontSize: 40, marginBottom: 10 },
  cardTitle: { fontSize: 16, fontWeight: '600', color: Colors.text, textAlign: 'center' },
  cardDescription: { fontSize: 12, color: Colors.textLight, textAlign: 'center', marginTop: 5 },
  adContainer: {
    backgroundColor: Colors.background,
    alignItems: 'center',
    paddingVertical: 5,
  },
  adPlaceholder: {
    width: 320,
    height: 50,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  adPlaceholderText: {
    color: '#888',
    fontSize: 12,
  },
});