import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTeam } from "../context/TeamContext";

export default function CharacterSelectButton() {
  const { team, activeMemberId, setActiveMemberId } = useTeam();

  const handleCycle = () => {
    const currentIndex = team.findIndex((m) => m.id === activeMemberId);
    const nextIndex = (currentIndex + 1) % team.length;
    setActiveMemberId(team[nextIndex].id);
  };

  const currentName = team.find((m) => m.id === activeMemberId)?.name || "???";

  return (
    <TouchableOpacity style={styles.button} onPress={handleCycle}>
      <Text style={styles.text}>🎮 Kämpfer wechseln: {currentName}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: "absolute",
    bottom: 0,
    alignSelf: "center",
    backgroundColor: "#333",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    zIndex: 999,
  },
  text: {
    color: "white",
    fontWeight: "bold",
  },
});
