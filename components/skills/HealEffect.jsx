import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Dimensions } from "react-native";
import HealIcon from "../effects/heal"; // Dein SVG/Komponenten-Icon

const { width, height } = Dimensions.get("window");

export default function FrostEffect({ onEnd = () => {} }) {
  const translateY = useRef(new Animated.Value(height - 140)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 100, // Ziel-Y
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: width / 2 - 60, // Flugrichtung
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1.5,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onEnd(); // Effekt fertig
    });
  }, []);

  return (
    <Animated.View
      style={[
        styles.effectContainer,
        {
          transform: [{ translateX }, { translateY }, { scale }],
          opacity,
        },
      ]}
    >
      <HealIcon size={100} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  effectContainer: {
    position: "absolute",
    top: 0,
    left: width / 2 - 50,
    zIndex: 999,
  },
});
