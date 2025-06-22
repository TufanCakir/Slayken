import { View, Text, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { BlurView } from "expo-blur";
import { useClass } from "../context/ClassContext";
import elementData from "../data/elementData.json";

const AVATAR_SIZE = 96;

export default function PlayerAvatar() {
  const { classList, activeClassId } = useClass();
  const activeMember = classList.find((c) => c.id === activeClassId);

  if (!activeMember) return null;

  const element = elementData[activeMember.element] || {};

  return (
    <View style={styles.wrapper}>
      <BlurView intensity={70} tint="light" style={styles.blurBg} />

      {/* Info links vom Avatar */}
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{activeMember.name}</Text>
        <Text style={styles.level}>Level {activeMember.level}</Text>
        <Text style={styles.element}>
          {element.icon}{" "}
          <Text style={styles.elementLabel}>{element.label}</Text>
        </Text>
      </View>

      {/* Avatar rechts */}
      <View style={styles.avatarShadow}>
        <Image
          source={{ uri: activeMember.avatar || activeMember.classUrl }}
          style={styles.avatar}
          contentFit="contain"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    borderRadius: 18,
    overflow: "hidden",
    minWidth: 260,
    maxWidth: 420,
    paddingVertical: 8,
    paddingHorizontal: 16,
    position: "absolute",
    bottom: 36, // Mobil-freundlich; anpassbar!
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 28,
    elevation: 9,
    zIndex: 15,
  },
  blurBg: {
    ...StyleSheet.absoluteFillObject,
  },
  infoContainer: {
    marginRight: 18,
    padding: 8,
    borderRadius: 8,
    backgroundColor: "rgba(30,58,138,0.12)", // soft blue glassy overlay
    minWidth: 120,
    maxWidth: 160,
  },
  name: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#1e40af", // blue-900
    marginBottom: 2,
    letterSpacing: 0.2,
  },
  level: {
    fontSize: 14,
    color: "#3b82f6", // blue-500
    marginBottom: 2,
  },
  element: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#38bdf8", // cyan-400
    marginTop: 1,
  },
  elementLabel: {
    color: "#0ea5e9", // blue-400
    fontWeight: "600",
    letterSpacing: 0.1,
  },
  avatarShadow: {
    borderRadius: 14,
    shadowColor: "#38bdf8", // blue/cyan Glow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    backgroundColor: "rgba(255,255,255,0.09)",
    padding: 3,
    elevation: 7,
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: 12,
    backgroundColor: "#e0f2fe", // fallback bg
  },
});
