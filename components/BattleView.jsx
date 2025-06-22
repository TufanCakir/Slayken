import { View, StyleSheet } from "react-native";
import BattleScene from "./BattleScene";

export default function BattleView({
  selectedEvent,
  bossHp,
  bossDefeated,
  handleFight,
  character, // <- Kommt von oben!
}) {
  if (!selectedEvent) return null;

  return (
    <View style={styles.container}>
      <BattleScene
        bossName={selectedEvent.eventName || selectedEvent.name}
        bossImage={selectedEvent.image}
        bossHp={bossHp}
        bossDefeated={bossDefeated}
        handleFight={handleFight}
        character={character}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
