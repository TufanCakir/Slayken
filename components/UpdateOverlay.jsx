import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Animated,
} from "react-native";

export default function UpdateOverlay({
  done = false,
  text = "Update wird geladen…",
}) {
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Immer auf 0 zurücksetzen beim Mount
    progressAnim.setValue(0);
    if (!done) {
      Animated.timing(progressAnim, {
        toValue: 0.9,
        duration: 4000,
        useNativeDriver: false,
      }).start();
    }
  }, []); // Nur beim Mount

  useEffect(() => {
    if (done) {
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: false,
      }).start();
    }
  }, [done]);

  const widthInterpolate = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={styles.overlay} pointerEvents="auto">
      <ActivityIndicator size="large" color="#38bdf8" />
      <Text style={styles.text}>{text}</Text>
      <View style={styles.progressBar}>
        <Animated.View
          style={[styles.progressFill, { width: widthInterpolate }]}
        />
      </View>
      {done && <Text style={styles.doneText}>✓ Update abgeschlossen!</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(16,22,32,0.94)",
    zIndex: 1000,
    paddingHorizontal: 20,
  },
  text: {
    marginTop: 18,
    fontSize: 17,
    color: "#fff",
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  progressBar: {
    marginTop: 22,
    width: 220,
    height: 10,
    backgroundColor: "#334155",
    borderRadius: 5,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#38bdf8", // cyan-400
    borderRadius: 5,
  },
  doneText: {
    marginTop: 24,
    color: "#22d3ee",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 0.3,
  },
});
