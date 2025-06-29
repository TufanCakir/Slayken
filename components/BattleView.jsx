import { View, StyleSheet } from "react-native";
import BattleScene from "./BattleScene";

// BattleView.jsx
export default function BattleView({
  selectedEvent,
  bossHp,
  bossDefeated,
  handleFight,
  character,
  imageMap,
}) {
  if (!selectedEvent) return null;

  return (
    <View style={styles.container}>
      <BattleScene
        boss={selectedEvent} // <- GANZES Event weitergeben!
        bossHp={bossHp}
        bossDefeated={bossDefeated}
        handleFight={handleFight}
        character={character}
        bossBackground={selectedEvent.background}
        imageMap={imageMap}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
