import { useState, useEffect } from "react";
import {
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  View,
} from "react-native";
import { Image } from "expo-image";

import { useThemeContext } from "../context/ThemeContext";
import ScreenLayout from "./ScreenLayout";

// Hilfsfunktion zur Zeitberechnung
const getRemaining = (endTimeString) => {
  const now = new Date();
  const endTime = new Date(endTimeString);
  const diffMs = endTime - now;

  if (diffMs <= 0) return null;

  const seconds = Math.floor(diffMs / 1000);
  const hours = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");

  return `${hours}:${minutes}:${secs}`;
};

// ✅ Diese Funktion muss VOR der Komponente stehen
const formatDateTime = (dateString) => {
  const d = new Date(dateString);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${day}.${month}.${year}, ${hours}:${minutes}`;
};

export default function EventList({
  availableEvents = [],
  onSelectEvent,
  eventName,
}) {
  const { theme } = useThemeContext();
  const [showCountdown, setShowCountdown] = useState(true);
  const [now, setNow] = useState(new Date());

  // Intervall zum regelmäßigen Aktualisieren
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Events mit abgelaufener Zeit ausfiltern
  const filteredEvents = availableEvents.filter(
    (item) => getRemaining(item.endTime) !== null
  );

  return (
    <ScreenLayout
      style={[
        styles.container,
        { backgroundColor: theme.bgImage ? undefined : theme.backgroundColor },
      ]}
    >
      {filteredEvents.length === 0 ? (
        <Text style={[styles.message, { color: theme.textColor }]}>
          Keine Events verfügbar. Vielleicht hast du alle erledigt?
        </Text>
      ) : (
        <FlatList
          data={filteredEvents}
          keyExtractor={(item) => item.id?.toString()}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => {
            const timeLeft = getRemaining(item.endTime);
            return (
              <TouchableOpacity
                style={[
                  styles.card,
                  {
                    backgroundColor: theme.accentColor,
                    borderColor: theme.borderColor,
                    shadowColor: theme.shadowColor,
                  },
                ]}
                onPress={() => onSelectEvent(item)}
                activeOpacity={0.85}
              >
                <Image
                  source={{ uri: item.image }}
                  style={styles.image}
                  contentFit="contain"
                  transition={300}
                />
                {/* Info-Badge */}
                <View style={styles.badge}>
                  <Text style={[styles.badgeText, { color: theme.textColor }]}>
                    {item.info}
                  </Text>
                </View>

                {/* Titel & Story */}
                <Text style={[styles.title, { color: theme.textColor }]}>
                  {item.title}
                </Text>
                <Text style={[styles.story, { color: theme.textColor }]}>
                  {item.story}
                </Text>

                {/* TimeLeft */}
                <View style={styles.timeBadge}>
                  <Text style={[styles.timeLeft, { color: theme.textColor }]}>
                    {showCountdown
                      ? `Noch ${timeLeft}`
                      : `Endet am ${formatDateTime(item.endTime)}`}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
      <TouchableOpacity
        onPress={() => setShowCountdown(!showCountdown)}
        style={styles.toggleButton}
      >
        <Text style={[styles.toggleText, { color: theme.textColor }]}>
          {showCountdown ? "Datum anzeigen" : "Countdown anzeigen"}
        </Text>
      </TouchableOpacity>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a", // tiefes Nachtblau
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginVertical: 18,
    color: "#60a5fa", // hellblau
    letterSpacing: 0.4,
    textShadowColor: "#1e3a8a",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 32,
    color: "#94a3b8",
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 90,
  },
  card: {
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#2563eb", // Blau
    padding: 18,
    marginBottom: 18,
    alignItems: "center",
    backgroundColor: "#1e293b", // dunkelblau
    shadowColor: "#3b82f6",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.17,
    shadowRadius: 12,
    elevation: 9,
  },
  image: {
    width: "100%",
    height: 180,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: "#334155", // fallback dark-blue
  },
  title: {
    fontSize: 19,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
    color: "#60a5fa",
    textShadowColor: "#1e40af",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    letterSpacing: 0.2,
  },
  story: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    color: "#e0eaff",
    marginBottom: 2,
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 6,
    backgroundColor: "#2563eb", // blau
    shadowColor: "#0ea5e9",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    color: "#f0f9ff",
    letterSpacing: 0.4,
  },
  timeBadge: {
    alignSelf: "flex-end",
    marginTop: 8,
    backgroundColor: "#0ea5e9", // cyan
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: "#7dd3fc",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  timeLeft: {
    fontSize: 13,
    color: "#0c4a6e",
    fontWeight: "bold",
    opacity: 0.95,
    letterSpacing: 0.2,
  },
  toggleButton: {
    alignSelf: "center",
    marginBottom: 16,
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 22,
    borderRadius: 22,
    backgroundColor: "#3b82f6",
    shadowColor: "#38bdf8",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 6,
  },
  toggleText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#f0f9ff",
    letterSpacing: 0.2,
  },
});
