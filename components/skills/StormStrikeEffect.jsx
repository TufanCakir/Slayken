import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Dimensions } from "react-native";
import Stormstrike from "../effects/stormstrike";

const { width, height } = Dimensions.get("window");

export default function StormStrikeEffect({ onEnd = () => {} }) {
  const translateY = useRef(new Animated.Value(height - 140)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(1)).current;

  // Partikel
  const particleAnimations = Array.from({ length: 7 }).map(() => ({
    translateX: new Animated.Value(width / 2 - 50),
    translateY: new Animated.Value(height - 140),
    opacity: new Animated.Value(1),
    scale: new Animated.Value(0.5 + Math.random() * 0.5),
    color: ["#60a5fa", "#3b82f6", "#22d3ee", "#38bdf8"][
      Math.floor(Math.random() * 4)
    ],
  }));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: 100,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: width / 2 - 60,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1.5,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 700,
        useNativeDriver: true,
      }),

      // Alle Partikel animieren
      ...particleAnimations.map((p) =>
        Animated.parallel([
          Animated.timing(p.translateX, {
            toValue: width / 2 - 60 + (Math.random() * 80 - 40),
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(p.translateY, {
            toValue: 100 + (Math.random() * 80 - 40),
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(p.opacity, {
            toValue: 0,
            duration: 700,
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
          styles.stormStrikeContainer,
          {
            transform: [{ translateX }, { translateY }, { scale }],
            opacity,
          },
        ]}
      >
        <Stormstrike size={100} />
      </Animated.View>

      {/* Partikel hinzufügen */}
      {particleAnimations.map((p, idx) => (
        <Animated.View
          key={idx}
          style={[
            styles.particle,
            {
              backgroundColor: p.color,
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
  stormStrikeContainer: {
    position: "absolute",
    top: 0,
    left: width / 2 - 50,
    zIndex: 999,
  },
  particle: {
    position: "absolute",
    width: 6,
    height: 6,
    borderRadius: 3,
    zIndex: 998,
  },
});
