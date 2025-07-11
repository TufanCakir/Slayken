import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useThemeContext } from "../context/ThemeContext";
import { useAssets } from "../context/AssetsContext";

// Countdown-Hook wie gehabt
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

  // Nimm überall dein zentrales Gradient aus dem Theme!
  const gradient = theme.linearGradient || [
    theme.accentColorSecondary,
    theme.accentColor,
    theme.accentColorDark,
    "#000000",
  ];

  const countdown = useCountdown(item.unlockDate);
  const countdownText = formatCountdown(countdown);

  // Bildquelle logisch und fallback
  const assetKey = `class_${item.id}`;
  const fallbackUri = `https://raw.githubusercontent.com/TufanCakir/slayken-assets/main/classes/${item.id}.png`;
  const imageSource = imageMap[assetKey] || { uri: fallbackUri };

  const styles = createStyles(theme);

  return (
    <LinearGradient
      colors={gradient}
      start={[0, 0]}
      end={[1, 0]}
      style={styles.cardOuter}
    >
      <View style={styles.card}>
        <LinearGradient
          colors={gradient}
          start={[0, 0]}
          end={[1, 0]}
          style={styles.header}
        >
          <Text style={styles.label}>{item.label}</Text>
          <Text style={styles.date}>{countdownText}</Text>
        </LinearGradient>

        <LinearGradient colors={gradient} style={styles.iconGlow}>
          <Image
            source={imageSource}
            style={styles.image}
            contentFit="contain"
            transition={300}
          />
        </LinearGradient>
        <Text style={styles.name}>
          {item.id.replace(/-/g, " ").toUpperCase()}
        </Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </LinearGradient>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    cardOuter: {
      borderRadius: 22,
      marginBottom: 22,
      padding: 2.5,
    },
    card: {
      borderRadius: 18,
      padding: 18,
      overflow: "hidden",
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 7,
      borderRadius: 12,
      paddingVertical: 4,
      paddingHorizontal: 8,
    },
    label: {
      fontSize: 15,
      fontWeight: "bold",
      letterSpacing: 0.5,
      color: theme.textColor,
    },
    date: {
      fontSize: 13,
      fontWeight: "bold",
      color: theme.textColor,
      marginLeft: 8,
      flexShrink: 1,
    },
    iconGlow: {
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 22,
      marginVertical: 10,
      padding: 6,
      alignSelf: "center",
      width: 210,
      height: 210,
    },
    image: {
      width: 200,
      height: 200,
      borderRadius: 18,
      maxWidth: "90%",
    },
    name: {
      fontSize: 17,
      color: theme.textColor,
      textAlign: "center",
      marginVertical: 7,
      fontWeight: "700",
      letterSpacing: 1.1,
    },
    description: {
      color: theme.textColor,
      fontSize: 14,
      textAlign: "center",
      lineHeight: 20,
      marginTop: 2,
    },
  });
}
