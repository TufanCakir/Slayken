import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, Pressable, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import FastImageWrapper from '../components/FastImageWrapper';
import eventButtons from '../data/eventbuttons.json';
import menuButtons from '../data/menuButtons.json';
import backgroundList from '../data/background.json';

const { width, height } = Dimensions.get('window');
const BUTTON_SIZE = 80;
const GLOBE_SIZE = Math.min(width, height) * 1.5;
const OUTER_RADIUS = GLOBE_SIZE / 2 - BUTTON_SIZE * 1.8;

export default function Home() {
  const navigation = useNavigation();
  const [background, setBackground] = useState(null);

  const rotation = useRef(new Animated.Value(0)).current;
  const planetScale = useRef(new Animated.Value(1)).current;
  const cameraZoom = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (backgroundList.length > 0) {
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

  const zoomIn = useCallback(() => {
    Animated.parallel([
      Animated.timing(planetScale, {
        toValue: 1.05,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(cameraZoom, {
        toValue: 1.04,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const zoomOut = useCallback(() => {
    Animated.parallel([
      Animated.timing(planetScale, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(cameraZoom, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const rotateInterpolation = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const reverseRotateInterpolation = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '-360deg'],
  });

  const renderButton = useCallback(
    (btn, angle) => {
      const x = GLOBE_SIZE / 2 + OUTER_RADIUS * Math.cos(angle) - BUTTON_SIZE / 2;
      const y = GLOBE_SIZE / 2 + OUTER_RADIUS * Math.sin(angle) - BUTTON_SIZE / 2;
      const scale = useRef(new Animated.Value(1)).current;

      const handlePressIn = () => {
        Animated.spring(scale, { toValue: 0.9, useNativeDriver: true }).start();
        zoomIn();
      };

      const handlePressOut = () => {
        Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start(() => {
          zoomOut();
          navigation.navigate(btn.route);
        });
      };

      return (
        <Animated.View
          key={btn.id}
          style={{
            position: 'absolute',
            left: x,
            top: y,
            transform: [{ scale }, { rotate: reverseRotateInterpolation }],
          }}
        >
          <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut}>
            <FastImageWrapper
              source={btn.image}
              style={{
                width: BUTTON_SIZE,
                height: BUTTON_SIZE,
                backgroundColor: 'transparent',
              }}
            />
          </Pressable>
        </Animated.View>
      );
    },
    [navigation, zoomIn, zoomOut, reverseRotateInterpolation],
  );

  return (
    <Animated.View style={[styles.root, { transform: [{ scale: cameraZoom }] }]}>
      <Animated.View
        style={[
          styles.globeWrapper,
          {
            width: GLOBE_SIZE,
            height: GLOBE_SIZE,
            borderRadius: GLOBE_SIZE / 2,
            transform: [{ rotate: rotateInterpolation }, { scale: planetScale }],
          },
        ]}
      >
        {background && (
          <FastImageWrapper
            source={background}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
        )}

        <View style={{ width: GLOBE_SIZE, height: GLOBE_SIZE }}>
          {eventButtons.map((btn, index) => {
            const angle = (2 * Math.PI * index) / eventButtons.length;
            return renderButton(btn, angle);
          })}

          {menuButtons[0] && (
            <Animated.View
              key={menuButtons[0].id}
              style={{
                position: 'absolute',
                left: GLOBE_SIZE / 2 - BUTTON_SIZE / 2,
                top: GLOBE_SIZE / 2 - BUTTON_SIZE / 2,
                transform: [{ rotate: reverseRotateInterpolation }],
              }}
            >
              <Pressable
                onPressIn={zoomIn}
                onPressOut={() => {
                  zoomOut();
                  navigation.navigate(menuButtons[0].route);
                }}
              >
                <FastImageWrapper
                  source={menuButtons[0].image}
                  style={{
                    width: BUTTON_SIZE,
                    height: BUTTON_SIZE,
                    backgroundColor: 'transparent',
                  }}
                />
              </Pressable>
            </Animated.View>
          )}
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  globeWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00BFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 25,
  },
});
