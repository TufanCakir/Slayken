import React, { useEffect, useState } from "react";
import { View, Text, Platform, StyleSheet } from "react-native";
import { Image } from "expo-image"; // Wichtig: expo-image für Local/Remote
// ↑ Achtung! KEIN import { Image } from "react-native" hier, sondern expo-image.

// Farbzuordnung je Element
const ELEMENT_COLORS = {
  fire: "#f87171",
  ice: "#60a5fa",
  thunder: "#facc15",
  void: "#a78bfa",
  default: "#cbd5e1",
};

// Countdown-Hook
const useCountdown = (targetDateString) => {
  if (!targetDateString) return null;

  const targetDate = new Date(targetDateString);
  if (isNaN(targetDate.getTime())) return null;

  const calculateTimeLeft = () => {
    const now = new Date();
    const difference = targetDate - now;

    if (difference <= 0) return null;

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / (1000 * 60)) % 60),
    };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 60000); // 1 Minute

    return () => clearInterval(interval);
  }, []);

  return timeLeft;
};

// imageMap als Prop!
export default function TeaserCard({ item, imageMap = {} }) {
  if (!item) return null;

  const color = ELEMENT_COLORS[item.element] || ELEMENT_COLORS.default;
  const countdown = useCountdown(item.unlockDate);

  const renderCountdownText = () => {
    if (!countdown) return "✅ Jetzt verfügbar";
    const { days, hours, minutes } = countdown;
    return `⏳ Noch ${days} Tag${
      days !== 1 ? "e" : ""
    }, ${hours} Std, ${minutes} Min`;
  };

  // Key für das Klassenbild (wie du es auch im imageMap verwendest)
  const classKey = `class_${item.id}`; // z.B. class_voidwarrior
  const imageSource = imageMap[classKey] || {
    uri: `https://raw.githubusercontent.com/TufanCakir/slayken-assets/main/classes/${item.id}.png`,
  };

  return (
    <View
      style={[styles.card, { borderColor: color + "88", shadowColor: color }]}
    >
      <View style={styles.header}>
        <Text style={[styles.label, { color }]}>{item.label}</Text>
        <Text
          style={[styles.date, { color: countdown ? "#facc15" : "#10b981" }]}
        >
          {renderCountdownText()}
        </Text>
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

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1e293b",
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  label: {
    fontSize: 15,
    letterSpacing: 0.5,
  },
  date: {
    fontSize: 12,
  },
  name: {
    fontSize: 18,
    color: "#f8fafc",
    textAlign: "center",
    marginVertical: 10,
  },
  description: {
    color: "#cbd5e1",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  icon: {
    alignItems: "center",
  },
  image: {
    width: 300,
    height: 300,
    marginVertical: 8,
  },
});
