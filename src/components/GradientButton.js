import React, { useContext } from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BackgroundContext } from "../context/BackgroundContext";

export default function GradientButton({
  onPress,
  title,
  gradientColors,
  style,
  textStyle,
}) {
  const { backgroundColors } = useContext(BackgroundContext);
  // Nutze entweder die übergebenen Farben oder die globalen Hintergrundfarben
  const colors = gradientColors ||
    backgroundColors || ["black", "blue", "black"];

  return (
    <TouchableOpacity onPress={onPress} style={style}>
      <LinearGradient
        colors={colors}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text style={[styles.text, textStyle]}>{title}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  gradient: {
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  text: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
