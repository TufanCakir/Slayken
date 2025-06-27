// components/UpdateOverlay.jsx
import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Animated,
} from "react-native";

export default function UpdateOverlay({ done = false }) {
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Starte Fake-Progress bis ~90 %
    Animated.timing(progressAnim, {
      toValue: 0.9,
      duration: 4000,
      useNativeDriver: false,
    }).start();
  }, []);

  useEffect(() => {
    if (done) {
      // Danach auf 100 % auffüllen
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
    <View style={styles.overlay}>
      <ActivityIndicator size="large" color="#fff" />
      <Text style={styles.text}>Update wird geladen…</Text>
      <View style={styles.progressBar}>
        <Animated.View
          style={[styles.progressFill, { width: widthInterpolate }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.85)",
    zIndex: 1000,
  },
  text: {
    marginTop: 16,
    fontSize: 16,
    color: "#fff",
  },
  progressBar: {
    marginTop: 16,
    width: 200,
    height: 8,
    backgroundColor: "#444",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: 8,
    backgroundColor: "#22d3ee",
  },
});
