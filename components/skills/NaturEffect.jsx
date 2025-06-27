import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Dimensions, View } from "react-native";
import Naturball from "../effects/natur";

const { width, height } = Dimensions.get("window");

export default function NaturEffect({ onEnd = () => {} }) {
  const translateY = useRef(new Animated.Value(height - 140)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(1)).current;

  // Partikel
  const particleAnimations = Array.from({ length: 5 }).map(() => ({
    translateX: new Animated.Value(width / 2 - 50),
    translateY: new Animated.Value(height - 140),
    opacity: new Animated.Value(1),
    scale: new Animated.Value(0.5 + Math.random() * 0.5),
  }));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 100,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: width / 2 - 60,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1.5,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),

      // Alle Partikel animieren
      ...particleAnimations.map((p) =>
        Animated.parallel([
          Animated.timing(p.translateX, {
            toValue: width / 2 - 60 + (Math.random() * 100 - 50), // etwas zufällig streuen
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(p.translateY, {
            toValue: 100 + (Math.random() * 100 - 50),
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(p.opacity, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ),
    ]).start(() => {
      onEnd();
    });
  }, []);

  return (
    <>
      <Animated.View
        style={[
          styles.naturballContainer,
          {
            transform: [{ translateX }, { translateY }, { scale }],
            opacity,
          },
        ]}
      >
        <Naturball size={100} />
      </Animated.View>

      {/* Partikel hinzufügen */}
      {particleAnimations.map((p, idx) => (
        <Animated.View
          key={idx}
          style={[
            styles.particle,
            {
              transform: [
                { translateX: p.translateX },
                { translateY: p.translateY },
                { scale: p.scale },
              ],
              opacity: p.opacity,
            },
          ]}
        />
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  naturballContainer: {
    position: "absolute",
    top: 0,
    left: width / 2 - 50,
    zIndex: 999,
  },
  particle: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "green",
    zIndex: 998,
  },
});
