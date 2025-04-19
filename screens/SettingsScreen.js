import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Updates from 'expo-updates';
import FastImageWrapper from '../components/FastImageWrapper';
import backgroundList from '../data/background.json';

const { width, height } = Dimensions.get('window');

export default function SettingsScreen() {
  const [background, setBackground] = useState(null);
  const cameraZoom = useRef(new Animated.Value(1)).current;
  const rotation = useRef(new Animated.Value(0)).current;

  // 🌌 Hintergrund & Effekte laden
  useEffect(() => {
    if (Array.isArray(backgroundList) && backgroundList.length > 0) {
      setBackground(backgroundList[0].image);
    }

    // Rotation
    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 30000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();

    // Zoom-Effekt
    Animated.loop(
      Animated.sequence([
        Animated.timing(cameraZoom, {
          toValue: 1.03,
          duration: 4000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(cameraZoom, {
          toValue: 1,
          duration: 4000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const rotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // 🔄 App zurücksetzen
  const resetApp = useCallback(() => {
    Alert.alert(
      'App zurücksetzen',
      'Möchtest du wirklich alle Daten löschen und die App neu starten?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Bestätigen',
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove([
                '@slayken_team',
                '@slayken_summoned_players',
                '@slayken_coins',
                '@slayken_crystals',
                '@slayken_rarity_config',
                '@slayken_free_multi_used',
              ]);
              await Updates.reloadAsync();
            } catch (error) {
              if (__DEV__) console.warn('Fehler beim Zurücksetzen:', error);
              Alert.alert('Fehler', 'Daten konnten nicht gelöscht werden.');
            }
          },
        },
      ],
    );
  }, []);

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: cameraZoom }] }]}>
      {background && (
        <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ rotate }] }]}>
          <FastImageWrapper
            source={background}
            containerStyle={StyleSheet.absoluteFill}
            contentFit="cover"
          />
        </Animated.View>
      )}

      <Text style={styles.title}>⚙️ Einstellungen</Text>

      <Pressable style={styles.resetButton} onPress={resetApp}>
        <Text style={styles.resetText}>App zurücksetzen</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 40,
  },
  resetButton: {
    backgroundColor: '#FF6347',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  resetText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
