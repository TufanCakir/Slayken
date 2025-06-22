import { TouchableOpacity, View, Text, StyleSheet } from "react-native";

export default function BattleButton({ onPress, label, style }) {
  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.content}>
        <Text style={styles.text}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: 12,
    borderRadius: 18,
    backgroundColor: "#2563eb", // schönes kräftiges Blau
    borderColor: "#3b82f6", // etwas helleres Blau für Border
    borderWidth: 2,
    shadowColor: "#60a5fa", // leichter Glow
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
    elevation: 6,
    flexDirection: "row",
    paddingBottom: 10,
    paddingTop: 6,
    height: 100,
    width: "100%",
    zIndex: 1,
    transform: [{ skewY: "-3deg" }],
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 30,
    color: "#f0f9ff", // fast weiß/blau für Lesbarkeit
    fontWeight: "bold",
    letterSpacing: 0.5,
    textShadowColor: "#1e40af",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
    transform: [{ skewY: "3deg" }],
    textAlign: "center",
  },
});
