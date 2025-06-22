// screens/DefeatedScreen.jsx
import { View, Text, StyleSheet, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function DefeatedScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>💀 Du wurdest besiegt!</Text>
      <Text style={styles.description}>
        Erhole dich und versuche es erneut.
      </Text>

      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
        ]}
        onPress={() => navigation.navigate("HomeScreen")}
      >
        <Text style={styles.buttonText}>Zurück zur Übersicht</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 28,
    color: "#38bdf8",
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
    textShadowColor: "#1e3a8a",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 17,
    color: "#c7dfff",
    marginBottom: 32,
    textAlign: "center",
    textShadowColor: "#1e293b",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  button: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 15,
    shadowColor: "#38bdf8",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 6,
    borderWidth: 2,
    borderColor: "#38bdf8",
    alignItems: "center",
    marginTop: 10,
  },
  buttonPressed: {
    backgroundColor: "#38bdf8",
    borderColor: "#0ea5e9",
    shadowOpacity: 0.28,
  },
  buttonText: {
    color: "#f0f9ff",
    fontWeight: "bold",
    fontSize: 17,
    letterSpacing: 0.17,
    textShadowColor: "#1e40af",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
