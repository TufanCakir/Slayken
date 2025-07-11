import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  Animated,
} from "react-native";
import { useThemeContext } from "../context/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";

export default function UpdateOverlay({
  done = false,
  text = "Update wird geladen…",
}) {
  const { theme } = useThemeContext();
  const styles = createStyles(theme);

  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    progressAnim.setValue(0);
    if (!done) {
      Animated.timing(progressAnim, {
        toValue: 0.9,
        duration: 4000,
        useNativeDriver: false,
      }).start();
    }
  }, []);

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

  const gradientColors = theme.linearGradient || [
    "#000000",
    "#000000",
    "#FF2D00",
    "#FF2D00",
  ];

  return (
    <View style={styles.overlay} pointerEvents="auto">
      <ActivityIndicator
        size="large"
        color={theme.accentColorDark || theme.accentColor}
      />
      <Text style={styles.text}>{text}</Text>
      <View style={styles.progressBar}>
        {/* --- Gradient ProgressBar --- */}
        <Animated.View style={{ width: widthInterpolate, height: "100%" }}>
          <LinearGradient
            colors={gradientColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
        {/* 
        // Alternativ NUR einfarbig, wenn du willst:
        <Animated.View
          style={[
            styles.progressFill,
            { width: widthInterpolate },
          ]}
        />
        */}
      </View>
      {done && <Text style={styles.doneText}>✓ Update abgeschlossen!</Text>}
    </View>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    overlay: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: (theme.shadowColor || "#000") + "e0",
      zIndex: 1000,
      paddingHorizontal: 20,
    },
    text: {
      marginTop: 18,
      fontSize: 17,
      color: theme.textColor,
      fontWeight: "600",
      letterSpacing: 0.2,
    },
    progressBar: {
      marginTop: 22,
      width: 220,
      height: 10,
      backgroundColor: theme.borderColor + "aa",
      borderRadius: 5,
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      backgroundColor: theme.accentColorDark || theme.accentColor,
      borderRadius: 5,
    },
    doneText: {
      marginTop: 24,
      color: theme.borderGlowColor || theme.textColor,
      fontWeight: "bold",
      fontSize: 16,
      letterSpacing: 0.3,
    },
  });
}
