import React from 'react';
import { LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { SettingsProvider } from './src/context/SettingsContext';

import HomeScreen from './src/screens/HomeScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import HizliSecScreen from './src/screens/HizliSecScreen';
import TakimOlusturScreen from './src/screens/TakimOlusturScreen';
import YaziTuraScreen from './src/screens/YaziTuraScreen';
import ZarAtScreen from './src/screens/ZarAtScreen';
import KaraliKagitScreen from './src/screens/KaraliKagitScreen';
import SiraBelirleScreen from './src/screens/SiraBelirleScreen';
import CarkCevirScreen from './src/screens/CarkCevirScreen';
import SansliSayiScreen from './src/screens/SansliSayiScreen';

LogBox.ignoreLogs(['Expo AV has been deprecated']);

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SettingsProvider>
      <SafeAreaProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="home"
            screenOptions={{
              headerShown: false,
              animation: 'slide_from_right',
            }}
          >
            <Stack.Screen name="home" component={HomeScreen} />
            <Stack.Screen name="settings" component={SettingsScreen} />
            <Stack.Screen name="hizli-sec" component={HizliSecScreen} />
            <Stack.Screen name="takim-olustur" component={TakimOlusturScreen} />
            <Stack.Screen name="karali-kagit" component={KaraliKagitScreen} />
            <Stack.Screen name="sira-belirle" component={SiraBelirleScreen} />
            <Stack.Screen name="yazi-tura" component={YaziTuraScreen} />
            <Stack.Screen name="zar-at" component={ZarAtScreen} />
            <Stack.Screen name="cark-cevir" component={CarkCevirScreen} />
            <Stack.Screen name="sansli-sayi" component={SansliSayiScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </SettingsProvider>
  );
}