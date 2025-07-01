import {
  FlatList,
  TouchableOpacity,
  StyleSheet,
  View,
  Text,
} from "react-native";
import { Image } from "expo-image";
import ScreenLayout from "./ScreenLayout";
import { useThemeContext } from "../context/ThemeContext"; // Falls du Theme verwendest

export default function EventList({ availableEvents = [], onSelectEvent }) {
  const { theme } = useThemeContext(); // ← Hole aktuelle Theme-Farben
  const styles = createStyles(theme);

  return (
    <ScreenLayout style={styles.container}>
      {availableEvents.length === 0 ? (
        <Text style={styles.message}>
          Keine Events verfügbar. Vielleicht hast du alle erledigt?
        </Text>
      ) : (
        <FlatList
          data={availableEvents}
          keyExtractor={(item) => item.id?.toString()}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => onSelectEvent(item)}
              activeOpacity={0.92}
            >
              <View style={styles.bannerContainer}>
                {/* Hintergrundbild */}
                <Image
                  source={{ uri: item.image }}
                  style={styles.imageBackground}
                  contentFit="contain"
                  transition={300}
                />
                {/* Glow-Overlay (leichtes, farbiges Outer Glow) */}
                <View style={styles.glowOverlay} pointerEvents="none" />
                {/* Overlay für bessere Lesbarkeit */}
                <View style={styles.overlay} pointerEvents="none" />
                {/* Badge/Label (oben links) */}
                {item.info && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.info}</Text>
                  </View>
                )}
                {/* Fortschritts-Anzeige (oben rechts) */}
                <View style={styles.progressStatus}>
                  {item.completed && (
                    <Text style={styles.completedBadge}>Geschafft!</Text>
                  )}
                  {item.star && <Text style={styles.starIcon}>★</Text>}
                </View>
                {/* Text-Overlay unten */}
                <View style={styles.textOverlay}>
                  <Text style={styles.title}>{item.title}</Text>
                  <Text style={styles.description}>{item.description}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </ScreenLayout>
  );
}

// Dynamisch Theme-Glow/Border etc.
function createStyles(theme) {
  const glow = theme.shadowColor || "#ff8800"; // Fallback: Fire-Glow
  const borderGlow = theme.borderColor || "#ff5500";
  const accent = theme.accentColor || "#191919";
  const textGlow = theme.textColor || "#fff";

  return StyleSheet.create({
    container: { flex: 1 },
    message: {
      fontSize: 16,
      textAlign: "center",
      marginTop: 32,
      color: accent,
    },
    listContainer: {
      paddingHorizontal: 16,
      paddingBottom: 90,
    },
    card: {
      backgroundColor: accent,
      borderRadius: 18,
      height: 300,
      marginVertical: 6,
      overflow: "hidden",
    },
    bannerContainer: {
      height: 300,
      borderRadius: 16,
      overflow: "hidden",
      justifyContent: "flex-end",
      backgroundColor: accent,
      position: "relative",
    },
    imageBackground: {
      flex: 1,
      borderRadius: 16,
      zIndex: 0,
    },
    // Glow-Layer (leicht farbiger Außen-Glow, z.B. orange, cyan...)
    glowOverlay: {
      ...StyleSheet.absoluteFillObject,
      borderRadius: 16,
      zIndex: 1,
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      zIndex: 2,
    },
    badge: {
      position: "absolute",
      top: 10,
      left: 10,
      backgroundColor: accent,
      paddingHorizontal: 11,
      paddingVertical: 4,
      borderRadius: 8,
      zIndex: 5,
    },
    badgeText: {
      color: textGlow,
      fontSize: 12,
      letterSpacing: 0.3,
    },
    progressStatus: {
      position: "absolute",
      top: 11,
      right: 13,
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      zIndex: 5,
    },
    completedBadge: {
      backgroundColor: borderGlow,
      color: textGlow,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
      fontSize: 12,
      marginRight: 5,
    },
    starIcon: {
      fontSize: 19,
      color: glow,
    },
    textOverlay: {
      backgroundColor: accent,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomLeftRadius: 16,
      borderBottomRightRadius: 16,
      zIndex: 3,
    },
    title: {
      color: textGlow,
      fontSize: 19,
      marginBottom: 2,
      letterSpacing: 0.3,
    },
    description: {
      color: textGlow,
      fontSize: 13.5,
      marginBottom: 2,
      lineHeight: 18,
      opacity: 0.93,
    },
  });
}
