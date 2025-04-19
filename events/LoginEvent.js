import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Animated, Dimensions, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import FastImageWrapper from '../components/FastImageWrapper';
import backgroundList from '../data/background.json';

const { width, height } = Dimensions.get('window');

export default function LoginEvent({ navigation }) {
  const [background, setBackground] = useState(null);
  const rotation = useRef(new Animated.Value(0)).current;

  // 🎬 Hintergrund & Rotation starten
  useEffect(() => {
    if (Array.isArray(backgroundList) && backgroundList.length > 0) {
      setBackground(backgroundList[0].image);
    }

    Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 30000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, []);

  const rotate = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

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

      <View style={styles.container}>
        <Text style={styles.title}>🟦 Login Event</Text>

        <Pressable onPress={handleBack}>
          <Text style={styles.backButton}>🔙 Zurück</Text>
        </Pressable>
      </View>
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
    color: '#0099ff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  backButton: {
    color: '#FFD700',
    fontSize: 18,
    textDecorationLine: 'underline',
    marginTop: 20,
  },
});
