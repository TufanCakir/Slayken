import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Animated, Dimensions, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { useCrystals } from '../context/CrystalsContext';
import FastImageWrapper from '../components/FastImageWrapper';
import backgroundList from '../data/background.json';

const { width, height } = Dimensions.get('window');

export default function CrystalEvent({ navigation }) {
  const { crystals, addCrystals } = useCrystals();
  const [background, setBackground] = useState(null);
  const rotation = useRef(new Animated.Value(0)).current;

  // 🎬 Hintergrund laden + Rotation starten
  useEffect(() => {
    if (Array.isArray(backgroundList) && backgroundList.length > 0) {
      setBackground(backgroundList[0].image);
    }

    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 35000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, []);

  const rotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleTap = useCallback(() => {
    addCrystals(50);
  }, [addCrystals]);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
    <View style={styles.wrapper}>
      {background && (
        <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ rotate }] }]}>
          <FastImageWrapper
            source={background}
            containerStyle={styles.background}
            contentFit="cover"
          />
        </Animated.View>
      )}

      <Pressable style={styles.container} onPress={handleTap}>
        <Text style={styles.title}>💎 Crystal Event</Text>
        <Text style={styles.crystals}>Du hast {crystals} Crystals</Text>
        <Text style={styles.hint}>👆 Tippe irgendwo, um Crystals zu sammeln</Text>

        <View style={{ marginTop: 40 }}>
          <Text style={styles.backButton} onPress={handleBack}>
            🔙 Zurück
          </Text>
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: 'black',
  },
  background: {
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    color: '#00BFFF',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  crystals: {
    color: 'white',
    fontSize: 18,
    marginBottom: 10,
  },
  hint: {
    color: '#888',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  backButton: {
    color: '#00BFFF',
    fontSize: 18,
    marginTop: 20,
    textDecorationLine: 'underline',
  },
});
