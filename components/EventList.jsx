import React, { useMemo } from "react";
import {
  FlatList,
  TouchableOpacity,
  StyleSheet,
  View,
  Text,
} from "react-native";
import { Image } from "expo-image";
import ScreenLayout from "./ScreenLayout";
import { useThemeContext } from "../context/ThemeContext";
import { useAssets } from "../context/AssetsContext";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

function formatEndDate(iso) {
  const date = new Date(iso);
  return `Endet am: ${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

export default function EventList({ availableEvents = [], onSelectEvent }) {
  const { theme } = useThemeContext();
  const { imageMap } = useAssets();
  const styles = createStyles(theme);

  const activeEvents = useMemo(
    () =>
      availableEvents.filter(
        (e) =>
          new Date(e.activeFrom) <= new Date() &&
          new Date() <= new Date(e.activeTo)
      ),
    [availableEvents]
  );

  if (activeEvents.length === 0) {
    return (
      <ScreenLayout style={styles.container}>
        <Text style={styles.message}>
          Keine Events verfügbar. Vielleicht hast du alle erledigt?
        </Text>
      </ScreenLayout>
    );
  }

  const renderItem = ({ item }) => {
    const imageKey = `event_${item.id}`;
    const imageSource = imageMap[imageKey] || { uri: item.image };

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => onSelectEvent(item)}
        activeOpacity={0.92}
      >
        {/* 3D/Glass Effekt */}
        <View style={styles.absoluteFill}>
          <LinearGradient
            colors={theme.linearGradient || ["#000", "#FF2D00"]}
            start={{ x: 0.1, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        </View>
        {/* Glass Card */}
        <BlurView intensity={46} tint="light" style={StyleSheet.absoluteFill} />
        <View style={styles.glassBorder} pointerEvents="none" />
        {/* Card-Content */}
        <View style={styles.bannerContainer}>
          <Image
            source={imageSource}
            style={styles.imageBackground}
            contentFit="contain"
            transition={300}
          />

          {/* Badges und Status */}
          <View style={styles.topRow}>
            {item.info ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.info}</Text>
              </View>
            ) : (
              <View style={{ width: 1 }} />
            )}
            <View style={styles.progressStatus}>
              {item.completed && (
                <Text style={styles.completedBadge}>Geschafft!</Text>
              )}
              {item.star && <Text style={styles.starIcon}>★</Text>}
            </View>
          </View>

          {/* Enddatum */}
          <View style={styles.dateBox}>
            <Text style={styles.dateText}>{formatEndDate(item.activeTo)}</Text>
          </View>

          {/* Text-Overlay mit Gradient */}
          <LinearGradient
            colors={[theme.accentColor + "d0", theme.accentColor + "00"]}
            start={{ x: 0, y: 0.7 }}
            end={{ x: 1, y: 1 }}
            style={styles.textOverlay}
          >
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </LinearGradient>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenLayout style={styles.container}>
      <FlatList
        data={activeEvents}
        keyExtractor={(item) => item.id?.toString()}
        contentContainerStyle={styles.listContainer}
        renderItem={renderItem}
      />
    </ScreenLayout>
  );
}

function createStyles(theme) {
  const accent = theme.accentColor || "#191919";
  const text = theme.textColor || "#fff";
  return StyleSheet.create({
    container: { flex: 1 },
    message: {
      fontSize: 16,
      textAlign: "center",
      color: accent,
      marginTop: 20,
    },
    listContainer: {
      paddingHorizontal: 16,
      paddingBottom: 90,
    },
    card: {
      borderRadius: 22,
      height: 300,
      marginVertical: 7,
      overflow: "hidden",
      position: "relative",
      marginTop: 10,
      backgroundColor: "rgba(255,255,255,0.18)",
      shadowColor: theme.glowColor,
      shadowOpacity: 0.17,
      shadowRadius: 19,
      shadowOffset: { width: 0, height: 4 },
      elevation: 6,
    },
    absoluteFill: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 0,
    },
    glassBorder: {
      ...StyleSheet.absoluteFillObject,
      borderRadius: 22,
      borderWidth: 1.8,
      borderColor: "#fff5",
      zIndex: 2,
      pointerEvents: "none",
    },
    bannerContainer: {
      flex: 1,
      borderRadius: 18,
      justifyContent: "center",
      position: "relative",
      overflow: "visible",
    },
    imageBackground: {
      height: 200,
      borderRadius: 16,
      marginTop: 50,
    },
    topRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      bottom: 5,
      paddingHorizontal: 10,
      alignItems: "center",
    },
    badge: {
      alignItems: "center",
      justifyContent: "center",
    },
    badgeText: {
      fontSize: 12,
      letterSpacing: 0.3,
      color: text,
    },
    progressStatus: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    completedBadge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
      fontSize: 12,
      color: text,
      backgroundColor: "#fff6",
    },
    starIcon: {
      fontSize: 19,
      color: text,
    },
    dateBox: {
      position: "absolute",
      top: 0,
      left: 12,
      right: 12,
      alignItems: "center",
      zIndex: 10,
    },
    dateText: {
      color: text,
      fontSize: 16,
    },
    textOverlay: {
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomLeftRadius: 18,
      borderBottomRightRadius: 18,
    },
    title: {
      fontSize: 20,
      letterSpacing: 0.3,
      color: text,
      textAlign: "center",
      fontWeight: "bold",
      textShadowColor: theme.glowColor + "99",
      textShadowRadius: 6,
      textShadowOffset: { width: 0, height: 1 },
    },
    description: {
      fontSize: 14,
      marginBottom: 2,
      lineHeight: 18,
      opacity: 0.93,
      color: text,
      textAlign: "center",
    },
  });
}
