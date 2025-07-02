import React, { useEffect, useRef, useMemo } from "react";
import { Animated, StyleSheet, Dimensions } from "react-native";
import Fireball from "../effects/fire";

const { width, height } = Dimensions.get("window");

// Helper für zufällige Werte, Memoized!
function getParticles(n) {
  return Array.from({ length: n }).map(() => ({
    xSpread: Math.random() * 100 - 50,
    ySpread: Math.random() * 100 - 50,
    scale: 0.5 + Math.random() * 0.5,
  }));
}

export default function InfernoEffect({ onEnd = () => {} }) {
  const translateY = useRef(new Animated.Value(height - 140)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(1)).current;

  // Memoize Partikel-Randomness (damit sie nicht bei jedem Render anders sind)
  const PARTICLE_COUNT = 5;
  const particlesMeta = useMemo(() => getParticles(PARTICLE_COUNT), []);
  const particles = useRef(
    particlesMeta.map((meta) => ({
      ...meta,
      translateX: new Animated.Value(width / 2 - 50),
      translateY: new Animated.Value(height - 140),
      opacity: new Animated.Value(1),
      scale: new Animated.Value(meta.scale),
    }))
  ).current;

  useEffect(() => {
    const animations = [
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
      // Partikel animieren
      ...particles.map((p) =>
        Animated.parallel([
          Animated.timing(p.translateX, {
            toValue: width / 2 - 60 + p.xSpread,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(p.translateY, {
            toValue: 100 + p.ySpread,
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
    ];
    Animated.parallel(animations).start(onEnd);
  }, [onEnd, opacity, scale, translateX, translateY, particles]);

  return (
    <>
      {/* Fireball Hauptanimation */}
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
      {/* Partikel */}
      {particles.map((p, idx) => (
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
  fireballContainer: {
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
    backgroundColor: "orange",
    zIndex: 998,
  },
});
