import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { useThemeContext } from "../context/ThemeContext";

// Wenn du Elementfarben aus dem Theme holen willst, kannst du das hier tun:
const ELEMENT_COLORS = {
  fire: "#ff5500",
  ice: "#3399ff",
  void: "#aa00ff",
  nature: "#00bb66",
  default: "#38bdf8",
};

// Countdown-Hook
function useCountdown(targetDateString) {
  const [timeLeft, setTimeLeft] = useState(() => {
    if (!targetDateString) return null;
    const t = new Date(targetDateString);
    if (isNaN(t.getTime())) return null;
    return calculateTimeLeft(t);
  });

  useEffect(() => {
    if (!targetDateString) return;
    const targetDate = new Date(targetDateString);
    if (isNaN(targetDate.getTime())) return;
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 60000);
    return () => clearInterval(interval);
  }, [targetDateString]);

  return timeLeft;
}

function calculateTimeLeft(targetDate) {
  const now = new Date();
  const diff = targetDate - now;
  if (diff <= 0) return null;
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
  };
}

// ----------- TEASER CARD -----------
export default function TeaserCard({ item, imageMap = {} }) {
  const { theme } = useThemeContext();
  if (!item) return null;

  const color = ELEMENT_COLORS[item.element] || ELEMENT_COLORS.default;
  const countdown = useCountdown(item.unlockDate);

  const imageSource = imageMap[`class_${item.id}`] || {
    uri: `https://raw.githubusercontent.com/TufanCakir/slayken-assets/main/classes/${item.id}.png`,
  };

  const countdownText = countdown
    ? `⏳ Noch ${countdown.days} Tag${countdown.days !== 1 ? "e" : ""}, ${
        countdown.hours
      } Std, ${countdown.minutes} Min`
    : "✅ Jetzt verfügbar";

  const styles = createStyles(color, theme);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.label}>{item.label}</Text>
        <Text style={styles.date} numberOfLines={1}>
          {countdownText}
        </Text>
      </View>
      <View style={styles.icon}>
        <Image
          source={imageSource}
          style={styles.image}
          contentFit="contain"
          transition={250}
        />
      </View>
      <Text style={styles.name}>
        {item.id.replace(/-/g, " ").toUpperCase()}
      </Text>
      <Text style={styles.description}>{item.description}</Text>
    </View>
  );
}

// ----------- STYLES -----------
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
      marginBottom: 7,
      alignItems: "center",
    },
    label: {
      fontSize: 15,
      letterSpacing: 0.5,
      fontWeight: "bold",
      color: color,
    },
    date: {
      fontSize: 13,
      fontWeight: "bold",
      color: countdownColor(color),
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
      color: theme.textColor ? theme.textColor + "cc" : "#cbd5e1",
      fontSize: 14,
      textAlign: "center",
      lineHeight: 20,
      marginTop: 2,
    },
  });
}

// Helper für Countdown-Farbe
function countdownColor(color) {
  return color === ELEMENT_COLORS.default ? "#facc15" : color;
}
