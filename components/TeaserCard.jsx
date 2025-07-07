import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { useThemeContext } from "../context/ThemeContext";
import { useAssets } from "../context/AssetsContext";

// Elementfarben zentral und einheitlich
const ELEMENT_COLORS = {
  fire: "#ff5500",
  ice: "#3399ff",
  void: "#aa00ff",
  nature: "#00bb66",
  default: "#38bdf8",
};

// Countdown-Hook
function useCountdown(targetDateString) {
  const [timeLeft, setTimeLeft] = useState(() =>
    calcTimeLeft(targetDateString)
  );
  useEffect(() => {
    if (!targetDateString) return;
    const targetDate = new Date(targetDateString);
    if (isNaN(targetDate.getTime())) return;
    const interval = setInterval(() => {
      setTimeLeft(calcTimeLeft(targetDate));
    }, 60000);
    return () => clearInterval(interval);
  }, [targetDateString]);
  return timeLeft;
}

function calcTimeLeft(targetDateString) {
  if (!targetDateString) return null;
  const target = new Date(targetDateString);
  const now = new Date();
  const diff = target - now;
  if (isNaN(target.getTime()) || diff <= 0) return null;
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
  };
}

// Countdown-Text ausgeben
function formatCountdown(countdown) {
  if (!countdown) return "✅ Jetzt verfügbar";
  const { days, hours, minutes } = countdown;
  return `⏳ Noch ${days} Tag${
    days !== 1 ? "e" : ""
  }, ${hours} Std, ${minutes} Min`;
}

export default function TeaserCard({ item }) {
  const { theme } = useThemeContext();
  const { imageMap } = useAssets();
  if (!item) return null;

  const color = ELEMENT_COLORS[item.element] || ELEMENT_COLORS.default;
  const countdown = useCountdown(item.unlockDate);
  const countdownText = formatCountdown(countdown);

  // Bildquelle logisch und fallback
  const assetKey = `class_${item.id}`;
  const fallbackUri = `https://raw.githubusercontent.com/TufanCakir/slayken-assets/main/classes/${item.id}.png`;
  const imageSource = imageMap[assetKey] || { uri: fallbackUri };

  const styles = createStyles(color, theme);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.label}>{item.label}</Text>
        <Text style={styles.date}>{countdownText}</Text>
      </View>
      <View style={styles.icon}>
        <Image
          source={imageSource}
          style={styles.image}
          contentFit="contain"
          transition={300}
        />
      </View>
      <Text style={styles.name}>
        {item.id.replace(/-/g, " ").toUpperCase()}
      </Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );
}

function createStyles(color, theme) {
  return StyleSheet.create({
    card: {
      backgroundColor: theme.accentColor || "#1e293b",
      borderRadius: 18,
      padding: 18,
      marginBottom: 20,
      borderWidth: 2,
      borderColor: color + "99",
      shadowColor: color,
      shadowOpacity: 0.25,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 2 },
      elevation: 4,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 7,
    },
    label: {
      fontSize: 15,
      fontWeight: "bold",
      letterSpacing: 0.5,
      color,
    },
    date: {
      fontSize: 13,
      fontWeight: "bold",
      color: color === ELEMENT_COLORS.default ? "#facc15" : color,
      marginLeft: 8,
      flexShrink: 1,
    },
    icon: {
      alignItems: "center",
      marginVertical: 10,
    },
    image: {
      width: 200,
      height: 200,
      borderRadius: 18,
      maxWidth: "90%",
    },
    name: {
      fontSize: 17,
      color: theme.textColor || "#f8fafc",
      textAlign: "center",
      marginVertical: 7,
      fontWeight: "700",
      letterSpacing: 1.1,
    },
    description: {
      color: (theme.textColor || "#cbd5e1") + "cc",
      fontSize: 14,
      textAlign: "center",
      lineHeight: 20,
      marginTop: 2,
    },
  });
}
