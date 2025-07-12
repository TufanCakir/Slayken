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
        <LinearGradient
          colors={theme.linearGradient || ["#000", "#FF2D00"]}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
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
            colors={[theme.accentColor + "d0"]}
            start={{ x: 0, y: 0 }}
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
      borderRadius: 18,
      height: 300,
      marginVertical: 6,
      overflow: "hidden",
      position: "relative",
      marginTop: 10,
    },
    bannerContainer: {
      flex: 1,
      borderRadius: 16,
      justifyContent: "center",
    },
    imageBackground: {
      height: 200,
      borderRadius: 16,
      marginTop: 50,
    },
    topRow: {
      position: "absolute",
      top: 10,
      left: 0,
      right: 0,
      zIndex: 5,
      flexDirection: "row",
      justifyContent: "space-between",
      paddingHorizontal: 10,
      alignItems: "center",
    },
    badge: {
      paddingHorizontal: 11,
      paddingVertical: 4,
      borderRadius: 8,
      minWidth: 42,
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
      paddingVertical: 12,
      borderBottomLeftRadius: 16,
      borderBottomRightRadius: 16,
    },
    title: {
      fontSize: 19,
      letterSpacing: 0.3,
      color: text,
      textAlign: "center",
    },
    description: {
      fontSize: 13.5,
      marginBottom: 2,
      lineHeight: 18,
      opacity: 0.93,
      color: text,
    },
  });
}
