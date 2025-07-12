import { View, StyleSheet } from "react-native";
import BattleScene from "./BattleScene";

// BattleView.jsx
export default function BattleView({
  selectedEvent,
  bossHp,
  bossMaxHp,
  bossDefeated,
  handleFight,
  character,
  imageMap,
  onBack, // <--- Prop ergänzen!
}) {
  if (!selectedEvent) return null;

  return (
    <View style={styles.container}>
      <BattleScene
        boss={selectedEvent}
        bossHp={bossHp}
        bossMaxHp={bossMaxHp}
        bossDefeated={bossDefeated}
        handleFight={handleFight}
        character={character}
        onBack={onBack} // <-- So korrekt!
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
