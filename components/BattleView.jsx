import { View, StyleSheet } from "react-native";
import BattleScene from "./BattleScene";

// BattleView.jsx
export default function BattleView({
  selectedEvent,
  bossHp,
  bossMaxHp, // <--- NEU!
  bossDefeated,
  handleFight,
  character,
  imageMap,
}) {
  if (!selectedEvent) return null;

  return (
    <View style={styles.container}>
      <BattleScene
        boss={selectedEvent}
        bossHp={bossHp}
        bossMaxHp={bossMaxHp} // <--- WEITERGEBEN!
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
