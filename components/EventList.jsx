import {
  FlatList,
  TouchableOpacity,
  StyleSheet,
  View,
  Text,
} from "react-native";
import { Image } from "expo-image";
import ScreenLayout from "./ScreenLayout";

export default function EventList({ availableEvents = [], onSelectEvent }) {
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
                  contentFit="cover"
                  transition={300}
                />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 32,
    color: "#555",
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 90,
  },
  card: {
    borderRadius: 16,
    borderWidth: 0,
    padding: 0,
    marginBottom: 22,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.13,
    shadowOffset: { width: 0, height: 7 },
    shadowRadius: 18,
    backgroundColor: "#fff", // Weiß
  },
  bannerContainer: {
    height: 120,
    borderRadius: 14,
    overflow: "hidden",
    justifyContent: "flex-end",
    backgroundColor: "#eee",
  },
  imageBackground: {
    ...StyleSheet.absoluteFillObject,
    width: undefined,
    height: undefined,
    borderRadius: 14,
    zIndex: 0,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.21)", // sanftes Schwarz-Overlay für Text-Lesbarkeit
    zIndex: 1,
  },
  badge: {
    position: "absolute",
    top: 9,
    left: 9,
    backgroundColor: "#111", // schwarz für Badge, sehr dezent
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    zIndex: 3,
    shadowColor: "#222",
    shadowOpacity: 0.16,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
  },
  badgeText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
    letterSpacing: 0.3,
    textShadowColor: "#0007",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  progressStatus: {
    position: "absolute",
    top: 9,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    zIndex: 3,
  },
  completedBadge: {
    backgroundColor: "#222", // dunkler Balken, wirkt modern auf weiß
    color: "#fff",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    fontWeight: "bold",
    fontSize: 11,
    marginRight: 4,
    elevation: 1,
    shadowColor: "#333",
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  starIcon: {
    fontSize: 18,
    color: "#111",
    fontWeight: "900",
    textShadowColor: "#fff",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  textOverlay: {
    backgroundColor: "rgba(255,255,255,0.92)", // sehr helle Leiste am unteren Rand
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    zIndex: 2,
  },
  title: {
    color: "#101014",
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 2,
    textShadowColor: "#fff",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
    letterSpacing: 0.25,
  },
  description: {
    color: "#222",
    fontSize: 13,
    marginBottom: 2,
    textShadowColor: "#fff",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
    lineHeight: 17,
  },
});
