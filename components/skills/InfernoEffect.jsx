import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Dimensions } from "react-native";
import Fireball from "../effects/fire";

const { width, height } = Dimensions.get("window");

export default function InfernoEffect({ onEnd = () => {} }) {
  const translateY = useRef(new Animated.Value(height - 140)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 100, // Y-Ziel beim Boss
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: width / 2 - 60, // von Mitte nach rechts oben
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
    ]).start(() => {
      onEnd(); // Effekt beenden
    });
  }, []);

  return (
    <Animated.View
      style={[
        styles.fireballContainer,
        {
          transform: [{ translateX }, { translateY }, { scale }],
          opacity,
        },
      ]}
    >
      <Fireball size={100} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fireballContainer: {
    position: "absolute",
    top: 0,
    left: width / 2 - 50, // Startpunkt horizontal zentriert
    zIndex: 999,
  },
});
